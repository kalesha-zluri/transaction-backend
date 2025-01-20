import axios from "axios";
import { getExchangeRate } from "../../src/utils/exchangeRate"; // Adjust the path if needed

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getExchangeRate", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the exchange rate for the specified date and currency", async () => {
    const date = "10-01-2025";
    const currency = "usd";
    const formattedDate = "2025-01-10";

    mockedAxios.get.mockResolvedValueOnce({
      data: { USD: 1.2 },
    });

    const exchangeRate = await getExchangeRate(date, currency);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://35.154.170.151:8080/${formattedDate}/${currency}`
    );
    expect(exchangeRate).toBe(1.2);
  });

  it("should throw an error if the API request fails", async () => {
    const date = "10-01-2025";
    const currency = "eur";
    const formattedDate = "2025-01-10";

    mockedAxios.get.mockRejectedValueOnce(new Error("Network error"));

    await expect(getExchangeRate(date, currency)).rejects.toThrow(
      "Failed to fetch exchange rate"
    );
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://35.154.170.151:8080/${formattedDate}/${currency}`
    );
  });

  it("should handle case insensitivity for currency", async () => {
    const date = "10-01-2025";
    const currency = "UsD";
    const formattedDate = "2025-01-10";

    mockedAxios.get.mockResolvedValueOnce({
      data: { USD: 1.5 },
    });

    const exchangeRate = await getExchangeRate(date, currency);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `http://35.154.170.151:8080/${formattedDate}/${currency.toLowerCase()}`
    );
    expect(exchangeRate).toBe(1.5);
  });
});
