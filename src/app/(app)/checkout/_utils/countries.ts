/** Countries the insured courier delivers to, as ISO 3166-1 alpha-2 codes. */
export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CH", name: "Switzerland" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "EG", name: "Egypt" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "AU", name: "Australia" },
  { code: "CA", name: "Canada" },
] as const

export type CountryCode = (typeof COUNTRIES)[number]["code"]

export const COUNTRY_CODES = COUNTRIES.map((c) => c.code) as [
  CountryCode,
  ...CountryCode[],
]

export const countryName = (code: string) =>
  COUNTRIES.find((c) => c.code === code)?.name ?? code
