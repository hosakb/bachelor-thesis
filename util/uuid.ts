export default function isUuid(str: string) {
  // Regular expression to check if string is a valid UUID
  const regexExp =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regexExp.test(str);
}
