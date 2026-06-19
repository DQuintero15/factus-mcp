import { countries } from './countries.data.js';
import { currencies } from './currencies.data.js';
import { municipalities } from './municipalities.data.js';
import type { Country, Currency, Municipality, UnitMeasure } from './types.js';
import { unitMeasures } from './unit-measures.data.js';

export * from './types.js';

function filterByQuery<T extends { code: string; name: string }>(items: T[], query?: string): T[] {
  if (!query) return items;
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) => item.code.toLowerCase().includes(q) || item.name.toLowerCase().includes(q),
  );
}

export function getCountries(query?: string): Country[] {
  return filterByQuery(countries, query);
}

export function getCurrencies(query?: string): Currency[] {
  return filterByQuery(currencies, query);
}

export function getUnitMeasures(query?: string): UnitMeasure[] {
  return filterByQuery(unitMeasures, query);
}

export function getMunicipalities(query?: string): Municipality[] {
  if (!query) return municipalities;
  const q = query.trim().toLowerCase();
  if (!q) return municipalities;
  return municipalities.filter(
    (m) =>
      m.code.toLowerCase().includes(q) ||
      m.name.toLowerCase().includes(q) ||
      m.department.name.toLowerCase().includes(q),
  );
}

export function findCountry(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}

export function findCurrency(code: string): Currency | undefined {
  return currencies.find((c) => c.code === code);
}

export function findUnitMeasure(code: string): UnitMeasure | undefined {
  return unitMeasures.find((u) => u.code === code);
}

export function findMunicipality(code: string): Municipality | undefined {
  return municipalities.find((m) => m.code === code);
}
