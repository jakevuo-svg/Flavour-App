export const EVENT_TYPES = [
  'KOKKIKOULU',
  'SEMINAARI',
  'ILLALLINEN',
  'YRITYSTILAISUUS',
  'KOKOUS',
  'MARKKINAT',
  'MUU TAPAHTUMA'
];

export const LOCATIONS = [
  'BLACKBOX360',
  'FLAVOUR STUDIO',
  'KELLOHALLI',
  'CUISINE',
  'PIZZALA',
  'FLAVOUR CATERING'
];

// Preferred display order for location dropdowns (matched case-insensitively via includes)
export const LOCATION_ORDER = [
  'black box', 'flavour studio', 'kellohalli', 'cuisine', 'pizzala', 'catering'
];

export const PROFILES = [
  'UUSI KONTAKTI',
  'PROSPEKTI',
  'ASIAKAS',
  'VAKIOASIAKAS'
];

export const STATUSES = [
  'ALUSTAVA',
  'TYÖN ALLA',
  'EI VAHVISTETTU',
  'VAHVISTETTU',
  'VALMIS'
];

export const DAYS = Array.from({ length: 31 }, (_, i) => 
  String(i + 1).padStart(2, '0')
);

export const MONTHS = [
  { value: '01', label: 'Tammikuu' },
  { value: '02', label: 'Helmikuu' },
  { value: '03', label: 'Maaliskuu' },
  { value: '04', label: 'Huhtikuu' },
  { value: '05', label: 'Toukokuu' },
  { value: '06', label: 'Kesäkuu' },
  { value: '07', label: 'Heinäkuu' },
  { value: '08', label: 'Elokuu' },
  { value: '09', label: 'Syyskuu' },
  { value: '10', label: 'Lokakuu' },
  { value: '11', label: 'Marraskuu' },
  { value: '12', label: 'Joulukuu' }
];

export const YEARS = [
  '2026',
  '2027',
  '2028'
];

export const HOURS = Array.from({ length: 24 }, (_, i) => 
  String(i).padStart(2, '0') + ':00'
);

export const HALF_HOURS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
});
