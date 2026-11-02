export function resolveFileUrl(value, origin, folder = "resumes") {
  if (!value || typeof value !== "string") return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith("//")) return null;
  if (value.startsWith("/uploads/")) return new URL(value, origin).href;
  return new URL(`/uploads/${folder}/${value.replace(/^\/+/, "")}`, origin)
    .href;
}
