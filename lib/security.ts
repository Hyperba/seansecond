export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

export function sanitizeText(text: string, maxLength = 1000): string {
  return text.trim().slice(0, maxLength);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  if (realIp) {
    return realIp.trim();
  }
  
  return "unknown";
}

export function detectHoneypot(data: Record<string, unknown>): boolean {
  const honeypotFields = ["website", "url", "homepage"];
  return honeypotFields.some(field => {
    const value = data[field];
    return typeof value === "string" && value.trim() !== "";
  });
}
