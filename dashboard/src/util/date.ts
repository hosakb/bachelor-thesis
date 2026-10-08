export function getTodaysDate() {
  const date = new Date();
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
}

export function getMonth(date: Date) {
  return date.getMonth() + 1 + "." + (date.getFullYear() % 100);
}

export function formatDate(date: Date): string {
  return (
    date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear()
  );
}

export function getToday(): Date {
  const today = new Date();
  today.setMonth(today.getMonth() + 1);
  return today;
}

// Formats a date (or date-like value) as YYYY-MM-DD in local time, which is
// the value format required by <input type="date">. Invalid values yield "".
export function toDateInputValue(
  value: Date | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}
