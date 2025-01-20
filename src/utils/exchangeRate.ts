import axios from "axios";

export const getExchangeRate = async (
  date: string,
  currency: string
): Promise<number> => {
  try {
    const formattedDate = date.split("-").reverse().join("-"); // Convert DD-MM-YYYY to YYYY-MM-DD
    const response = await axios.get(
      `http://35.154.170.151:8080/${formattedDate}/${currency.toLowerCase()}`
    );
    return response.data[currency.toUpperCase()];
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw new Error("Failed to fetch exchange rate");
  }
};
