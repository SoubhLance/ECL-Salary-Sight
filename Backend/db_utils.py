from sqlalchemy import text, inspect
from db import SessionLocal, engine
from typing import Dict, List, Optional, Set


def table_exists(table_name: str) -> bool:
    """Check if a table exists in the database"""
    try:
        inspector = inspect(engine)
        return table_name in inspector.get_table_names()
    except Exception:
        return False


def get_table_columns(table_name: str) -> Set[str]:
    """Get existing columns for a specific table"""
    try:
        inspector = inspect(engine)
        columns = inspector.get_columns(table_name)
        return {col['name'] for col in columns}
    except Exception:
        return set()


def get_table_column_types(table_name: str) -> Dict[str, str]:
    """Get column names and their data types for a specific table"""
    try:
        inspector = inspect(engine)
        columns = inspector.get_columns(table_name)
        return {col['name']: str(col['type']) for col in columns}
    except Exception:
        return {}


def get_employee_from_master(person_no: str, personnel_area: str) -> Optional[Dict]:
    """Get employee details from employee_master table"""
    session = SessionLocal()
    try:
        query = text("""
            SELECT * FROM employee_master 
            WHERE person_no = :person_no AND personnel_area = :personnel_area
            LIMIT 1
        """)
        result = session.execute(query, {"person_no": person_no, "personnel_area": personnel_area})
        row = result.fetchone()
        if row:
            return dict(row._mapping)
        return None
    except Exception:
        return None
    finally:
        session.close()


def get_all_employees_from_master() -> Dict:
    """Get ALL employees from employee_master table as a lookup dictionary"""
    session = SessionLocal()
    try:
        query = text("SELECT * FROM employee_master")
        result = session.execute(query)
        lookup = {}
        for row in result:
            row_dict = dict(row._mapping)
            key = (row_dict.get("person_no"), row_dict.get("personnel_area"))
            lookup[key] = row_dict
        return lookup
    except Exception as e:
        print(f"Error fetching employees: {e}")
        return {}
    finally:
        session.close()


def batch_upsert_employee_master(employee_records: List[Dict]) -> bool:
    """Batch insert/update employees in employee_master table"""
    if not employee_records:
        return True
    
    session = SessionLocal()
    try:
        master_fields = [
            "person_no", "employee_name", "designation", "month_year",
            "for_period", "personnel_area", "personnel_subarea", 
            "employee_group", "employee_subgroup", "pay_scale_type", 
            "pay_scale_area", "pay_scale_group", "pay_scale_level", 
            "bank_account_number", "ifsc_code", "pf_number", "aadhar_no", 
            "pan_no", "profit_center", "cost_center", "basic_pay", 
            "basic_pay_adjustment"
        ]
        
        for emp in employee_records:
            filtered = {k: v for k, v in emp.items() if k in master_fields}
            if "person_no" not in filtered or "personnel_area" not in filtered:
                continue
            
            # Check if employee exists
            check_query = text("""
                SELECT COUNT(*) as cnt FROM employee_master 
                WHERE person_no = :person_no AND personnel_area = :personnel_area
            """)
            exists = session.execute(check_query, {
                "person_no": filtered["person_no"],
                "personnel_area": filtered["personnel_area"]
            }).scalar()
            
            if exists:
                # Update existing
                set_clause = ", ".join([f"{k} = :{k}" for k in filtered.keys() if k not in ["person_no", "personnel_area"]])
                if set_clause:
                    update_query = text(f"""
                        UPDATE employee_master SET {set_clause}
                        WHERE person_no = :person_no AND personnel_area = :personnel_area
                    """)
                    session.execute(update_query, filtered)
            else:
                # Insert new
                columns = ", ".join(filtered.keys())
                placeholders = ", ".join([f":{k}" for k in filtered.keys()])
                insert_query = text(f"""
                    INSERT INTO employee_master ({columns}) VALUES ({placeholders})
                """)
                session.execute(insert_query, filtered)
        
        session.commit()
        return True
    except Exception as e:
        session.rollback()
        print(f"Error batch upserting employee_master: {e}")
        return False
    finally:
        session.close()


def enrich_salary_records_with_master(records: List[Dict]) -> List[Dict]:
    """Enrich salary records with employee_master data - OPTIMIZED VERSION"""
    if not records:
        return []
    
    # STEP 1: Batch upsert all employees to master
    batch_upsert_employee_master(records)
    
    # STEP 2: Get ALL employees from master in one call
    employee_lookup = get_all_employees_from_master()
    
    # STEP 3: Enrich records using in-memory lookup
    enriched_records = []
    
    for record in records:
        person_no = record.get("person_no")
        personnel_area = record.get("personnel_area")
        
        if not person_no or not personnel_area:
            enriched_records.append(record)
            continue
        
        employee_data = employee_lookup.get((person_no, personnel_area))
        
        if employee_data:
            enriched = record.copy()
            
            master_to_salary_fields = [
                "employee_name", "designation", "for_period", 
                "personnel_subarea", "employee_group", "employee_subgroup", 
                "pay_scale_type", "pay_scale_area", "pay_scale_group", 
                "pay_scale_level", "bank_account_number", "ifsc_code", 
                "pf_number", "aadhar_no", "pan_no", "profit_center", 
                "cost_center", "basic_pay", "basic_pay_adjustment"
            ]
            
            for field in master_to_salary_fields:
                if field in employee_data:
                    if field not in enriched or enriched[field] is None:
                        enriched[field] = employee_data[field]
            
            enriched_records.append(enriched)
        else:
            enriched_records.append(record)
    
    return enriched_records


def create_salary_table(table_name: str, column_definitions: Dict[str, str]):
    """
    Create a new salary register table for a specific year
    column_definitions: dict of {column_name: sql_type}
    """
    session = SessionLocal()
    try:
        cols = []
        for col_name, col_type in column_definitions.items():
            # Convert to MySQL types
            # If infer_sql_type already returned a full SQL type, keep it
            if "(" in col_type or col_type.upper() in {"DATE", "INT", "BIGINT"}:
                final_type = col_type
            elif col_type == "numeric":
                final_type = "DECIMAL(15,2)"
            elif col_type == "bigint":
                final_type = "BIGINT"
            elif col_type == "date":
                final_type = "DATE"
            else:
                final_type = "TEXT"

            
            null_constraint = "NOT NULL" if col_name in ["person_no", "personnel_area", "month_year"] else "NULL"
            cols.append(f"`{col_name}` {col_type} {null_constraint}")
        
        columns_sql = ",\n    ".join(cols)
        
        create_table_sql = f"""
        CREATE TABLE `{table_name}` (
            {columns_sql},
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`person_no`, `personnel_area`, `month_year`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        
        session.execute(text(create_table_sql))
        session.commit()
    except Exception as e:
        session.rollback()
        raise Exception(f"Failed to create table {table_name}: {str(e)}")
    finally:
        session.close()


def add_column(table_name: str, col_name: str, col_type: str):
    """Add a new column to an existing table"""
    session = SessionLocal()
    try:
        # Convert to MySQL types
        if col_type == "numeric":
            col_type = "DECIMAL(15,2)"
        elif col_type == "bigint":
            col_type = "BIGINT"
        elif col_type == "date":
            col_type = "DATE"
        else:
            col_type = "TEXT"
        
        alter_sql = f"ALTER TABLE `{table_name}` ADD COLUMN `{col_name}` {col_type} NULL"
        session.execute(text(alter_sql))
        session.commit()
    except Exception as e:
        session.rollback()
        raise Exception(f"Failed to add column {col_name} to {table_name}: {str(e)}")
    finally:
        session.close()


def insert_salary_register(table_name: str, records: List[Dict]):
    """Insert records into the specified salary register table using REPLACE INTO"""
    if not records:
        return None
    
    enriched_records = enrich_salary_records_with_master(records)
    column_types = get_table_column_types(table_name)
    
    session = SessionLocal()
    try:
        for record in enriched_records:
            cleaned_record = {}
            for col, value in record.items():
                if value is None:
                    cleaned_record[col] = None
                elif col in column_types:
                    col_type = str(column_types[col]).upper()
                    if "BIGINT" in col_type or "INT" in col_type:
                        try:
                            cleaned_record[col] = int(value) if value else None
                        except (ValueError, TypeError):
                            cleaned_record[col] = None
                    else:
                        cleaned_record[col] = value
                else:
                    cleaned_record[col] = value
            
            # Use REPLACE INTO for upsert behavior
            columns = ", ".join([f"`{k}`" for k in cleaned_record.keys()])
            placeholders = ", ".join([f":{k}" for k in cleaned_record.keys()])
            
            replace_query = text(f"""
                REPLACE INTO `{table_name}` ({columns}) VALUES ({placeholders})
            """)
            session.execute(replace_query, cleaned_record)
        
        session.commit()
        return {"status": "success", "rows_inserted": len(enriched_records)}
    except Exception as e:
        session.rollback()
        raise Exception(f"Failed to insert records: {str(e)}")
    finally:
        session.close()


def get_existing_columns():
    """Get columns from default salaryregister table (deprecated)"""
    return get_table_columns("salaryregister")


__all__ = [
    'table_exists',
    'get_table_columns', 
    'get_table_column_types',
    'create_salary_table',
    'add_column',
    'insert_salary_register',
    'get_existing_columns',
    'get_employee_from_master',
    'get_all_employees_from_master',
    'batch_upsert_employee_master',
    'enrich_salary_records_with_master'
]