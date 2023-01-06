const byStringProp = (x1: any, x2: any, propName: string): number => {
  const str1 = x1[propName].trim().toUpperCase();
  const str2 = x2[propName].trim().toUpperCase();

  return str1.localeCompare(str2);
};

const byName = (x1: { name: string }, x2: { name: string }): number => {
  return byStringProp(x1, x2, 'name');
};

const byBrand = (x1: { brand: string }, x2: { brand: string }): number => {
  return byStringProp(x1, x2, 'brand');
};

const byBrandAndName = (x1: { brand: string; name: string }, x2: { brand: string; name: string }): number => {
  return byBrand(x1, x2) || byName(x1, x2);
};

export const useCompare = () => ({
  byName,
  byBrandAndName,
});
