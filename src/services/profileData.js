export function parseProfileLinks(value) {
  let parsed;
  try { parsed = typeof value === "string" ? JSON.parse(value) : value; }
  catch { return []; }
  const links = Array.isArray(parsed) ? parsed : parsed && typeof parsed === "object"
    ? Object.entries(parsed).map(([platform, url]) => ({ platform, url })) : [];
  return links.flatMap((link) => {
    if (typeof link?.platform !== "string" || typeof link?.url !== "string") return [];
    try {
      const url = new URL(link.url);
      return ["https:", "http:"].includes(url.protocol) ? [{ platform: link.platform, url: url.href }] : [];
    } catch { return []; }
  });
}
