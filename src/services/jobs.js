export function isPastDeadline(value, now = new Date()) {
  if (!value) return false;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    return value < today;
  }
  const timestamp = new Date(value?.time || value).getTime();
  return Number.isFinite(timestamp) && timestamp < now.getTime();
}

export function formatSalary(value) {
  const salary = String(value ?? "").trim();
  if (!salary) return "Not specified";
  return /\b(lpa|per|annum|month|year)\b/i.test(salary) ? salary : `${salary} LPA`;
}
