from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import pandas as pd
import numpy as np

from db_utils import (
    insert_salary_register,
    get_existing_columns,
    add_column,
    table_exists,
    create_salary_table,
    get_table_columns,
    get_table_column_types,
    get_employee_from_master
)
from db import SessionLocal

app = FastAPI(title="ECL Salary Ingestion API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:8080",
    "http://127.0.0.1:8080",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



def json_safe_records(df: pd.DataFrame):
    """Convert DataFrame to JSON-safe records by replacing NaN/inf values"""
    df = df.replace([np.inf, -np.inf], np.nan)
    records = df.to_dict(orient="records")
    
    for record in records:
        for key, value in list(record.items()):
            if pd.isna(value) or value is np.nan or (isinstance(value, float) and np.isnan(value)):
                record[key] = None
            elif isinstance(value, (np.integer, np.floating)):
                if np.isnan(value) or np.isinf(value):
                    record[key] = None
                else:
                    record[key] = value.item()
    
    return records


def infer_sql_type(series, column_name: str):
    col = column_name.lower()

    # --- PRIMARY KEY COLUMNS (FORCED TYPES) ---
    if col == "person_no":
        return "VARCHAR(100)"

    if col == "personnel_area":
        return "VARCHAR(100)"

    if col == "month_year":
        return "DATE"

    if col == "year":
        return "INT"

    # --- DATA COLUMNS ---
    non_null = series.dropna()

    if len(non_null) == 0:
        return "TEXT"

    if pd.api.types.is_integer_dtype(series):
        return "BIGINT"

    if pd.api.types.is_float_dtype(series):
        return "DECIMAL(15,2)"

    return "TEXT"


@app.get("/")
def health():
    return {"status": "running", "database": "MySQL"}


@app.get("/employee/{person_no}/{personnel_area}")
async def get_employee(person_no: str, personnel_area: str):
    """Get employee details from employee_master"""
    employee = get_employee_from_master(person_no, personnel_area)
    if employee:
        return {"status": "success", "employee": employee}
    else:
        raise HTTPException(404, f"Employee not found: {person_no} in {personnel_area}")


@app.get("/employee-master/stats")
async def get_employee_master_stats():
    """Get statistics about employee_master table"""
    session = SessionLocal()
    try:
        # Get total count
        count_query = text("SELECT COUNT(*) as total FROM employee_master")
        total = session.execute(count_query).scalar()
        
        # Get sample records
        sample_query = text("""
            SELECT * FROM employee_master 
            ORDER BY month_year DESC 
            LIMIT 5
        """)
        sample_result = session.execute(sample_query)
        sample_data = [dict(row._mapping) for row in sample_result]
        
        # Check for duplicates
        dup_query = text("""
            SELECT person_no, personnel_area, COUNT(*) as cnt
            FROM employee_master
            GROUP BY person_no, personnel_area
            HAVING cnt > 1
        """)
        dup_result = session.execute(dup_query)
        duplicate_count = len(list(dup_result))
        
        # Get unique count
        unique_query = text("""
            SELECT COUNT(DISTINCT CONCAT(person_no, '-', personnel_area)) as unique_count
            FROM employee_master
        """)
        unique_count = session.execute(unique_query).scalar()
        
        return {
            "status": "success",
            "total_employees": total,
            "unique_employees": unique_count,
            "duplicates_found": duplicate_count,
            "sample_records": sample_data
        }
    except Exception as e:
        raise HTTPException(500, f"Error fetching stats: {str(e)}")
    finally:
        session.close()


@app.post("/employee-master/cleanup")
async def cleanup_employee_master():
    """Remove duplicate employees, keeping only the latest record"""
    session = SessionLocal()
    try:
        # Find and delete older duplicates
        delete_query = text("""
            DELETE t1 FROM employee_master t1
            INNER JOIN employee_master t2 
            WHERE t1.person_no = t2.person_no 
            AND t1.personnel_area = t2.personnel_area
            AND t1.month_year < t2.month_year
        """)
        result = session.execute(delete_query)
        session.commit()
        
        deleted_count = result.rowcount
        
        # Get remaining unique count
        unique_query = text("""
            SELECT COUNT(DISTINCT CONCAT(person_no, '-', personnel_area)) as unique_count
            FROM employee_master
        """)
        unique_count = session.execute(unique_query).scalar()
        
        return {
            "status": "success",
            "duplicates_removed": deleted_count,
            "unique_employees_remaining": unique_count
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(500, f"Error cleaning up: {str(e)}")
    finally:
        session.close()


# @app.post("/upload/area-master")
# async def upload_area_master(file: UploadFile = File(...)):
#     """Upload and sync area_master table"""
    
#     if not file.filename.lower().endswith((".xlsx", ".xls")):
#         raise HTTPException(400, "Invalid file type. Only .xlsx or .xls allowed")

#     try:
#         df = pd.read_excel(file.file)
#     except Exception as e:
#         raise HTTPException(400, f"Error reading Excel file: {str(e)}")

#     df.columns = (
#         df.columns.astype(str)
#         .str.lower()
#         .str.strip()
#         .str.replace(" ", "_", regex=False)
#         .str.replace("-", "_", regex=False)
#     )

#     required = {"personnel_area"}
#     if "personnel_area" not in df.columns:
#         raise HTTPException(400, "Missing required column: personnel_area")

#     records = json_safe_records(df)
    
#     session = SessionLocal()
#     try:
#         for record in records:
#             columns = ", ".join([f"`{k}`" for k in record.keys()])
#             placeholders = ", ".join([f":{k}" for k in record.keys()])
#             update_clause = ", ".join([f"`{k}` = :{k}" for k in record.keys() if k != "area_id"])
            
#             upsert_query = text(f"""
#                 INSERT INTO area_master ({columns}) 
#                 VALUES ({placeholders})
#                 ON DUPLICATE KEY UPDATE {update_clause}
#             """)
#             session.execute(upsert_query, record)
        
#         session.commit()
        
#         return {
#             "status": "success",
#             "rows_processed": len(records),
#             "message": "Area master data synced successfully"
#         }
#     except Exception as e:
#         session.rollback()
#         raise HTTPException(500, f"Error syncing area_master: {str(e)}")
#     finally:
#         session.close()


@app.post("/upload/salary-xlsx")
async def upload_salary_xlsx(file: UploadFile = File(...)):
    """Upload and process salary Excel file with year-wise table segregation"""
    
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Invalid file type. Only .xlsx or .xls allowed")

    try:
        df = pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(400, f"Error reading Excel file: {str(e)}")

    original_columns = df.columns.tolist()
    
    # Normalize column names
    df.columns = (
        df.columns.astype(str)
        .str.lower()
        .str.strip()
        .str.replace(" ", "_", regex=False)
        .str.replace("-", "_", regex=False)
        .str.replace(".", "_", regex=False)
        .str.replace("(", "", regex=False)
        .str.replace(")", "", regex=False)
        .str.replace("/", "_", regex=False)
        .str.replace("\\", "_", regex=False)
        .str.replace(":", "_", regex=False)
        .str.replace(";", "_", regex=False)
        .str.replace(",", "_", regex=False)
        .str.replace("'", "", regex=False)
        .str.replace('"', "", regex=False)
        .str.replace("&", "and", regex=False)
        .str.replace("%", "percent", regex=False)
        .str.replace("#", "num", regex=False)
        .str.replace("@", "at", regex=False)
        .str.replace("+", "plus", regex=False)
        .str.replace("*", "", regex=False)
        .str.replace("=", "", regex=False)
        .str.replace("<", "", regex=False)
        .str.replace(">", "", regex=False)
        .str.replace("?", "", regex=False)
        .str.replace("!", "", regex=False)
        .str.replace("$", "", regex=False)
        .str.replace("^", "", regex=False)
        .str.replace("|", "_", regex=False)
        .str.replace("[", "", regex=False)
        .str.replace("]", "", regex=False)
        .str.replace("{", "", regex=False)
        .str.replace("}", "", regex=False)
    )
    
    df.columns = df.columns.str.replace(r'_+', '_', regex=True)
    df.columns = df.columns.str.strip('_')

    rename_map = {
        "name_of_employee": "employee_name",
        "basic": "basic_salary",
        "month": "month_year"
    }
    df.rename(columns=rename_map, inplace=True)
    
    column_order = []
    for orig_col in original_columns:
        normalized = (orig_col.lower().strip()
                     .replace(" ", "_")
                     .replace("-", "_")
                     .replace(".", "_")
                     .replace("(", "")
                     .replace(")", "")
                     .replace("/", "_")
                     .replace("\\", "_")
                     .replace(":", "_")
                     .replace(";", "_")
                     .replace(",", "_")
                     .replace("'", "")
                     .replace('"', "")
                     .replace("&", "and")
                     .replace("%", "percent")
                     .replace("#", "num")
                     .replace("@", "at")
                     .replace("+", "plus")
                     .replace("*", "")
                     .replace("=", "")
                     .replace("<", "")
                     .replace(">", "")
                     .replace("?", "")
                     .replace("!", "")
                     .replace("$", "")
                     .replace("^", "")
                     .replace("|", "_")
                     .replace("[", "")
                     .replace("]", "")
                     .replace("{", "")
                     .replace("}", ""))
        import re
        normalized = re.sub(r'_+', '_', normalized).strip('_')
        final_col = rename_map.get(normalized, normalized)
        column_order.append(final_col)

    required = {"person_no", "month_year", "personnel_area"}
    if not required.issubset(df.columns):
        missing = required - set(df.columns)
        raise HTTPException(400, f"Missing required columns: {missing}")

    # Store original values before conversion for debugging
    original_month_year = df["month_year"].copy()
    
    # FIXED: Better date parsing that handles multiple formats
    # Try parsing with different formats
    df["month_year"] = pd.to_datetime(df["month_year"], format="mixed", errors="coerce")
    
    # If that fails, try specific format for "January 2025" style dates
    if df["month_year"].isna().any():
        # Try to parse as "Month YYYY" format
        mask = df["month_year"].isna()
        df.loc[mask, "month_year"] = pd.to_datetime(
            original_month_year[mask], 
            format="%B %Y",  # e.g., "January 2025"
            errors="coerce"
        )
    
    # Check if there are still invalid dates after all attempts
    invalid_dates_mask = df["month_year"].isna()
    if invalid_dates_mask.any():
        # Get the ORIGINAL values (before conversion) to show what's actually in Excel
        invalid_rows = df[invalid_dates_mask].index.tolist()[:5]  # Show first 5
        original_values = original_month_year.iloc[invalid_rows].tolist()
        
        # Option 1: Drop rows with invalid dates and continue
        print(f"Warning: Found {invalid_dates_mask.sum()} rows with invalid dates. Dropping them.")
        df = df[~invalid_dates_mask].copy()
        
        # If all rows are invalid, raise error
        if len(df) == 0:
            raise HTTPException(
                400, 
                f"All rows have invalid dates. Sample original values at rows {invalid_rows}: {original_values}"
            )
        
        # Option 2: Uncomment below to raise error instead of dropping
        # raise HTTPException(
        #     400, 
        #     f"Invalid dates found in month_year column at rows: {invalid_rows}. Original values: {original_values}"
        # )
    
    df["year"] = df["month_year"].dt.year
    df["month_year"] = df["month_year"].dt.strftime("%Y-%m-%d")
    
    if "year" not in column_order:
        column_order.append("year")
    
    df = df[column_order]
    
    years = df["year"].unique()
    
    results = {}
    employees_synced = set()
    
    for year in years:
        year_int = int(year)
        table_name = f"salaryregister{year_int}"
        
        year_data = df[df["year"] == year_int].copy()
        
        try:
            if not table_exists(table_name):
                column_definitions = {}
                for col in year_data.columns:
                    column_definitions[col] = infer_sql_type(year_data[col], col)

                
                create_salary_table(table_name, column_definitions)
                results[year_int] = {
                    "table": table_name,
                    "status": "created",
                    "rows": len(year_data)
                }
            else:
                existing_cols = get_table_columns(table_name)
                new_cols = set(year_data.columns) - existing_cols
                
                if new_cols:
                    for col in new_cols:
                        col_type = infer_sql_type(year_data[col], col)
                        add_column(table_name, col, col_type)

                
                results[year_int] = {
                    "table": table_name,
                    "status": "updated",
                    "rows": len(year_data),
                    "new_columns": list(new_cols) if new_cols else []
                }
            
            records = json_safe_records(year_data)
            
            unique_employees = set()
            for record in records:
                emp_key = f"{record.get('person_no')}_{record.get('personnel_area')}"
                unique_employees.add(emp_key)
                employees_synced.add(emp_key)
            
            insert_salary_register(table_name, records)
            
            results[year_int]["unique_employees"] = len(unique_employees)
            
        except Exception as e:
            raise HTTPException(500, f"Error processing year {year_int}: {str(e)}")
    
    return {
        "status": "success",
        "total_rows_processed": len(df),
        "employees_synced": len(employees_synced),
        "years_processed": results
    }

@app.get("/salary/all/{year}")
def get_all_salary(year: int):
    table_name = f"salaryregister{year}"

    if not table_exists(table_name):
        raise HTTPException(status_code=404, detail=f"No data for year {year}")

    session = SessionLocal()
    try:
        query = text(f"SELECT * FROM {table_name}")
        rows = session.execute(query).mappings().all()

        return {
            "year": year,
            "total_records": len(rows),
            "data": rows
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        session.close()
    
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(400, "Invalid file type. Only .xlsx or .xls allowed")

    try:
        df = pd.read_excel(file.file)
    except Exception as e:
        raise HTTPException(400, f"Error reading Excel file: {str(e)}")

    original_columns = df.columns.tolist()
    
    # Normalize column names
    df.columns = (
        df.columns.astype(str)
        .str.lower()
        .str.strip()
        .str.replace(" ", "_", regex=False)
        .str.replace("-", "_", regex=False)
        .str.replace(".", "_", regex=False)
        .str.replace("(", "", regex=False)
        .str.replace(")", "", regex=False)
        .str.replace("/", "_", regex=False)
        .str.replace("\\", "_", regex=False)
        .str.replace(":", "_", regex=False)
        .str.replace(";", "_", regex=False)
        .str.replace(",", "_", regex=False)
        .str.replace("'", "", regex=False)
        .str.replace('"', "", regex=False)
        .str.replace("&", "and", regex=False)
        .str.replace("%", "percent", regex=False)
        .str.replace("#", "num", regex=False)
        .str.replace("@", "at", regex=False)
        .str.replace("+", "plus", regex=False)
        .str.replace("*", "", regex=False)
        .str.replace("=", "", regex=False)
        .str.replace("<", "", regex=False)
        .str.replace(">", "", regex=False)
        .str.replace("?", "", regex=False)
        .str.replace("!", "", regex=False)
        .str.replace("$", "", regex=False)
        .str.replace("^", "", regex=False)
        .str.replace("|", "_", regex=False)
        .str.replace("[", "", regex=False)
        .str.replace("]", "", regex=False)
        .str.replace("{", "", regex=False)
        .str.replace("}", "", regex=False)
    )
    
    df.columns = df.columns.str.replace(r'_+', '_', regex=True)
    df.columns = df.columns.str.strip('_')

    rename_map = {
        "name_of_employee": "employee_name",
        "basic": "basic_salary",
        "month": "month_year"
    }
    df.rename(columns=rename_map, inplace=True)
    
    column_order = []
    for orig_col in original_columns:
        normalized = (orig_col.lower().strip()
                     .replace(" ", "_")
                     .replace("-", "_")
                     .replace(".", "_")
                     .replace("(", "")
                     .replace(")", "")
                     .replace("/", "_")
                     .replace("\\", "_")
                     .replace(":", "_")
                     .replace(";", "_")
                     .replace(",", "_")
                     .replace("'", "")
                     .replace('"', "")
                     .replace("&", "and")
                     .replace("%", "percent")
                     .replace("#", "num")
                     .replace("@", "at")
                     .replace("+", "plus")
                     .replace("*", "")
                     .replace("=", "")
                     .replace("<", "")
                     .replace(">", "")
                     .replace("?", "")
                     .replace("!", "")
                     .replace("$", "")
                     .replace("^", "")
                     .replace("|", "_")
                     .replace("[", "")
                     .replace("]", "")
                     .replace("{", "")
                     .replace("}", ""))
        import re
        normalized = re.sub(r'_+', '_', normalized).strip('_')
        final_col = rename_map.get(normalized, normalized)
        column_order.append(final_col)

    required = {"person_no", "month_year", "personnel_area"}
    if not required.issubset(df.columns):
        missing = required - set(df.columns)
        raise HTTPException(400, f"Missing required columns: {missing}")

    # FIXED: Better date parsing that handles multiple formats
    # Try parsing with different formats
    df["month_year"] = pd.to_datetime(df["month_year"], format="mixed", errors="coerce")
    
    # If that fails, try specific format for "January 2025" style dates
    if df["month_year"].isna().any():
        # Try to parse as "Month YYYY" format
        mask = df["month_year"].isna()
        df.loc[mask, "month_year"] = pd.to_datetime(
            df.loc[mask, "month_year"], 
            format="%B %Y",  # e.g., "January 2025"
            errors="coerce"
        )
    
    # Check if there are still invalid dates
    invalid_dates = df[df["month_year"].isna()]
    if not invalid_dates.empty:
        # Show which rows have invalid dates for debugging
        invalid_rows = invalid_dates.index.tolist()[:5]  # Show first 5
        sample_values = df.loc[invalid_rows, "month_year"].tolist() if "month_year" in df.columns else []
        raise HTTPException(
            400, 
            f"Invalid dates found in month_year column at rows: {invalid_rows}. Sample values: {sample_values}"
        )
    
    df["year"] = df["month_year"].dt.year
    df["month_year"] = df["month_year"].dt.strftime("%Y-%m-%d")
    
    if "year" not in column_order:
        column_order.append("year")
    
    df = df[column_order]
    
    years = df["year"].unique()
    
    results = {}
    employees_synced = set()
    
    for year in years:
        year_int = int(year)
        table_name = f"salaryregister{year_int}"
        
        year_data = df[df["year"] == year_int].copy()
        
        try:
            if not table_exists(table_name):
                column_definitions = {}
                for col in year_data.columns:
                    column_definitions[col] = infer_sql_type(year_data[col], col)

                
                create_salary_table(table_name, column_definitions)
                results[year_int] = {
                    "table": table_name,
                    "status": "created",
                    "rows": len(year_data)
                }
            else:
                existing_cols = get_table_columns(table_name)
                new_cols = set(year_data.columns) - existing_cols
                
                if new_cols:
                    for col in new_cols:
                        col_type = infer_sql_type(year_data[col], col)
                        add_column(table_name, col, col_type)

                
                results[year_int] = {
                    "table": table_name,
                    "status": "updated",
                    "rows": len(year_data),
                    "new_columns": list(new_cols) if new_cols else []
                }
            
            records = json_safe_records(year_data)
            
            unique_employees = set()
            for record in records:
                emp_key = f"{record.get('person_no')}_{record.get('personnel_area')}"
                unique_employees.add(emp_key)
                employees_synced.add(emp_key)
            
            insert_salary_register(table_name, records)
            
            results[year_int]["unique_employees"] = len(unique_employees)
            
        except Exception as e:
            raise HTTPException(500, f"Error processing year {year_int}: {str(e)}")
    
    return {
        "status": "success",
        "total_rows_processed": len(df),
        "employees_synced": len(employees_synced),
        "years_processed": results
    }