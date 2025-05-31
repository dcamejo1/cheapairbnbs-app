// Currency conversion rates to USD
// Updated: December 2024
// Rates are approximate and should be updated periodically

export const CURRENCIES = {
  // Base currency
  USD: 1.0,

  // Major European currencies
  EUR: 1.09, // Euro (used by: Germany, France, Italy, Spain, Austria, Netherlands, Belgium, etc.)
  GBP: 1.27, // British Pound (UK)
  CHF: 1.11, // Swiss Franc (Switzerland)

  // Nordic currencies
  SEK: 0.095, // Swedish Krona (Sweden)
  DKK: 0.146, // Danish Krone (Denmark)
  NOK: 0.094, // Norwegian Krone (Norway)

  // Eastern European currencies
  HUF: 0.0026, // Hungarian Forint (Hungary) - This was causing Budapest issue!
  CZK: 0.043, // Czech Koruna (Czech Republic)
  PLN: 0.25, // Polish Zloty (Poland)

  // North American currencies
  CAD: 0.73, // Canadian Dollar (Canada)

  // Asia-Pacific currencies
  JPY: 0.0067, // Japanese Yen (Japan)
  AUD: 0.65, // Australian Dollar (Australia)
  NZD: 0.59, // New Zealand Dollar (New Zealand)
  HKD: 0.128, // Hong Kong Dollar (Hong Kong)
  SGD: 0.74, // Singapore Dollar (Singapore)
  THB: 0.029, // Thai Baht (Thailand)

  // South American currencies
  ARS: 0.001, // Argentine Peso (Argentina)
  BRL: 0.167, // Brazilian Real (Brazil)
  MXN: 0.049, // Mexican Peso (Mexico)

  // Other currencies
  TRY: 0.029, // Turkish Lira (Turkey)
  ZAR: 0.055, // South African Rand (South Africa)
  ILS: 0.274, // Israeli Shekel (Israel)
};

// Helper function to convert price from one currency to USD
export function convertToUSD(price, fromCurrency) {
  if (fromCurrency === "USD") {
    return price;
  }

  const rate = CURRENCIES[fromCurrency];
  if (!rate) {
    throw new Error(`Currency ${fromCurrency} not found in conversion rates`);
  }

  return price * rate;
}

// Helper function to get currency for a country (fallback mapping)
export function getCurrencyForCountry(country) {
  const countryToCurrency = {
    "United States": "USD",
    Canada: "CAD",
    "United Kingdom": "GBP",
    Germany: "EUR",
    France: "EUR",
    Italy: "EUR",
    Spain: "EUR",
    Austria: "EUR",
    Netherlands: "EUR",
    Belgium: "EUR",
    Switzerland: "CHF",
    Sweden: "SEK",
    Denmark: "DKK",
    Norway: "NOK",
    Hungary: "HUF",
    "Czech Republic": "CZK",
    Poland: "PLN",
    Japan: "JPY",
    Australia: "AUD",
    "New Zealand": "NZD",
    "Hong Kong": "HKD",
    Singapore: "SGD",
    Thailand: "THB",
    Argentina: "ARS",
    Brazil: "BRL",
    Mexico: "MXN",
    Turkey: "TRY",
    "South Africa": "ZAR",
    Israel: "ILS",
    Portugal: "EUR",
    Greece: "EUR",
    Malta: "EUR",
    Ireland: "EUR",
  };

  return countryToCurrency[country] || "USD"; // Default to USD if not found
}
