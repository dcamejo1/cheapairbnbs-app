import { testCities } from "../../data/testCities.js";

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters for filtering/sorting
    const query = getQuery(event);
    const { country, sortBy = "averagePrice", order = "asc" } = query;

    let cities = [...testCities];

    // Filter by country if provided
    if (country) {
      const countryFilter = country.toLowerCase();
      cities = cities.filter(
        (city) =>
          city.country.toLowerCase().includes(countryFilter) ||
          city.cityName.toLowerCase().includes(countryFilter)
      );
    }

    // Sort cities
    cities.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (order === "desc") {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
    });

    return {
      success: true,
      data: cities,
      count: cities.length,
    };
  } catch (error) {
    console.error("Error fetching test cities:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch cities",
    });
  }
});
