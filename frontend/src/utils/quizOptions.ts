export const mergeOptions = (
  existing: string[],
  generated: string[],
  targetCount = 8
): string[] => {
  const normalized: string[] = [];

  const addUnique = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !normalized.includes(trimmed)) {
      normalized.push(trimmed);
    }
  };

  existing.forEach(addUnique);
  generated.forEach(addUnique);

  return normalized.slice(0, targetCount);
};
