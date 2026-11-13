// Request validation is independent of browser controls and database coercion.
export const rangedNumber = (
  value: unknown,
  min: number,
  max: number,
  integer = false
): number | null => {
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max &&
    (!integer || Number.isInteger(number)) ? number : null;
};

export const dateOnly = (value: unknown): value is string => {
  if (typeof value !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00.000Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const validPeriod = (start: unknown, end: unknown): boolean =>
  dateOnly(start) && dateOnly(end) && start <= end;

const nonemptyName = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 1000;

export const validatedMilestone = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const {name, start, end, progress} = value as Record<string, unknown>;
  const completion = rangedNumber(progress, 0, 100);
  if (!nonemptyName(name) || !dateOnly(start) || !dateOnly(end) ||
      !validPeriod(start, end) || completion === null) return null;
  return {name: name.trim(), start, end, progress: completion};
};

export const validatedTrl = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const {technology, trl, criticality} = value as Record<string, unknown>;
  const level = rangedNumber(trl, 1, 9, true);
  const importance = rangedNumber(criticality, 1, 3, true);
  if (!nonemptyName(technology) || level === null || importance === null) return null;
  return {technology: technology.trim(), trl: level, criticality: importance};
};
