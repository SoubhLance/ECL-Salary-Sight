import { API_BASE } from "./api";

/* =========================
   POST: Upload salary file
   ========================= */
export async function uploadSalary(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload/salary-xlsx`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Upload failed");
  }

  return response.json();
}

/* =========================
   GET: SELECT * salary table
   ========================= */
export async function fetchAllSalary(year: number) {
  const response = await fetch(`${API_BASE}/salary/all/${year}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Failed to fetch salary data");
  }

  return response.json();
}
