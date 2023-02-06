export function getTodaysDate() {
  const date = new Date();
  return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
}

export function getMonth(date: Date) {
  return (date.getMonth() + 1) + "." + (date.getFullYear() % 100);
}
