export function getTodaysDate() {
  const date = new Date();
  return date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate();
}

export function getMonth(date: Date) {
  return date.getMonth() + "-" + date.getFullYear();
}

export function formatDate(date: Date): string {
  return date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
}
