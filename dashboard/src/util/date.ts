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
