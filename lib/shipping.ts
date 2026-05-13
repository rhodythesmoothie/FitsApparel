export type PackagingType = 'Pouch' | 'Box';
export type ShippingZone = 'Local' | 'Intra-region' | 'Inter-island';

export type ShippingQuote = {
  zone: ShippingZone;
  packaging: PackagingType;
  fee: number;
};

// Update this table when replacing the sample values with actual J&T rates.
export const SHIPPING_RATE_TABLE: Record<PackagingType, Record<ShippingZone, number>> = {
  Pouch: {
    Local: 90,
    'Intra-region': 110,
    'Inter-island': 150,
  },
  Box: {
    Local: 120,
    'Intra-region': 160,
    'Inter-island': 220,
  },
};

const LOCAL_CITIES = new Set(['lapu lapu', 'lapulapu', 'cordova']);

// Add more Cebu Province cities/municipalities here as your service area list grows.
const CEBU_CITIES_AND_MUNICIPALITIES = new Set([
  'alcantara',
  'alcoy',
  'alegria',
  'aloguinsan',
  'argao',
  'asturias',
  'badian',
  'balamban',
  'bantayan',
  'barili',
  'bogo',
  'boljoon',
  'borbon',
  'carcar',
  'carmen',
  'catmon',
  'cebu',
  'cebu city',
  'compostela',
  'consolacion',
  'daanbantayan',
  'dalaguete',
  'danao',
  'danao city',
  'dumanjug',
  'ginatilan',
  'liloan',
  'madridejos',
  'malabuyoc',
  'mandaue',
  'mandaue city',
  'medellin',
  'minglanilla',
  'moalboal',
  'naga',
  'naga city',
  'oslob',
  'pilar',
  'pinamungajan',
  'poro',
  'ronda',
  'samboan',
  'san fernando',
  'san francisco',
  'san remigio',
  'santa fe',
  'santander',
  'sibonga',
  'sogod',
  'tabogon',
  'tabuelan',
  'talisay',
  'talisay city',
  'toledo',
  'toledo city',
  'tuburan',
  'tudela',
]);

const CEBU_PROVINCE_NAMES = new Set(['cebu', 'cebu province']);

export function normalizeText(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(city|municipality|province|prov)\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function getPackagingByQuantity(quantity: number): PackagingType {
  return quantity >= 6 ? 'Box' : 'Pouch';
}

export function getShippingZone(city: string, province: string): ShippingZone {
  const normalizedCity = normalizeText(city);
  const normalizedProvince = normalizeText(province);

  if (LOCAL_CITIES.has(normalizedCity)) {
    return 'Local';
  }

  if (
    CEBU_PROVINCE_NAMES.has(normalizedProvince) ||
    CEBU_CITIES_AND_MUNICIPALITIES.has(normalizedCity)
  ) {
    return 'Intra-region';
  }

  return 'Inter-island';
}

export function computeShippingFee(
  city: string,
  province: string,
  quantity: number,
): ShippingQuote {
  const packaging = getPackagingByQuantity(quantity);
  const zone = getShippingZone(city, province);

  return {
    zone,
    packaging,
    fee: SHIPPING_RATE_TABLE[packaging][zone],
  };
}
