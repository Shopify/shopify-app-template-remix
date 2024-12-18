export const objectValues = <T extends Record<string, any>>(obj: T): T[keyof T][] => Object.values(obj) as T[keyof T][];
