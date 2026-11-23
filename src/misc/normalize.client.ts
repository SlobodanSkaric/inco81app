export function normalizeClient(ua: string): string | null{
  if (!ua || ua === "unknown") return null;

  const lower = ua.toLowerCase();

  let browser = "other";

  if (lower.includes("edg/")) browser = "edge";
  else if (lower.includes("chrome/") && !lower.includes("edg/")) browser = "chrome";
  else if (lower.includes("firefox/")) browser = "firefox";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "safari";

  let os = "other";

  if (lower.includes("windows")) os = "windows";
  else if (lower.includes("android")) os = "android";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "ios";
  else if (lower.includes("mac os")) os = "macos";
  else if (lower.includes("linux")) os = "linux";
  
  return `${browser}|${os}`;
}