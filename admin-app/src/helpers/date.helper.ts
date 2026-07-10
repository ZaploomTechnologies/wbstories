export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", options).format(parsed);
}

export function toISODate(date: Date | string): string {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return parsed.toISOString();
}
