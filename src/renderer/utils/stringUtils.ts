export const isValidString = (str?: string): boolean => {
  if (!str) return false;
  if (str.length == 0 || str.trim().length == 0) return false;
  return str !== 'undefined' && str !== 'null';
};
