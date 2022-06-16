import useCompare from '@/use/compare';

describe('compare', () => {
  describe('by name', () => {
    const { byName } = useCompare();

    it('returns 0 if the names are the same without regard to case', () => {
      const x = { id: 1, name: 'TeD', description: 'likes to talk' };
      const y = { id: 2, name: 'ted', description: 'is a clown' };
      expect(byName(x, y)).toEqual(0);
    });

    it('returns -1 if x < y', () => {
      const x = { id: 1, name: 'sed', description: 'likes to talk' };
      const y = { id: 2, name: 'ted', description: 'is a clown' };
      const z = { id: 3, name: 'Ted', description: 'is a clown' };
      expect(byName(x, y)).toEqual(-1);
      expect(byName(x, z)).toEqual(-1);
    });

    it('returns 1 if x > y', () => {
      const x = { id: 1, name: 'ted', description: 'likes to talk' };
      const y = { id: 2, name: 'sed', description: 'is a clown' };
      const z = { id: 3, name: 'Sed', description: 'is a clown' };
      expect(byName(x, y)).toEqual(1);
      expect(byName(x, z)).toEqual(1);
    });
  });

  describe('by band and name', () => {
    const { byBrandAndName } = useCompare();

    it('returns 0 if the brands and names are the same without regard to case', () => {
      const x = { id: 1, name: 'PueR', brand: 'RisHi' };
      const y = { id: 2, name: 'puer', brand: 'rishi' };
      expect(byBrandAndName(x, y)).toEqual(0);
    });

    it('returns -1 if x < y, checking the brand first, name second', () => {
      const x = { id: 1, name: 'PueR', brand: 'RisHi' };
      const y = { id: 2, name: 'Red Label', brand: 'Lipton' };
      const z = { id: 3, name: 'Arabic', brand: 'RisHi' };
      expect(byBrandAndName(y, x)).toEqual(-1);
      expect(byBrandAndName(z, x)).toEqual(-1);
    });

    it('returns 1 if x > y, checking the brand first, name second', () => {
      const x = { id: 1, name: 'PueR', brand: 'Lipton' };
      const y = { id: 2, name: 'Red Label', brand: 'Lipton' };
      const z = { id: 3, name: 'Arabic', brand: 'RisHi' };
      expect(byBrandAndName(y, x)).toEqual(1);
      expect(byBrandAndName(z, x)).toEqual(1);
    });
  });
});
