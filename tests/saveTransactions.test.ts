import { PrismaClient } from "@prisma/client";
import { saveTransactions } from "../src/services/savetransactions.service";

jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    transaction: {
      createMany: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe("saveTransactions", () => {
  let prisma: PrismaClient;

  beforeEach(() => {
    prisma = new PrismaClient();
  });

  it("should save transactions to the database", async () => {
    const transactions = [
      {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      },
    ];
    await saveTransactions(transactions);
    expect(prisma.transaction.createMany).toHaveBeenCalledWith({
      data: transactions,
    });
  });

  it("should handle errors during saving", async () => {
    const transactions = [
      {
        Date: "01-01-2021",
        Description: "Test",
        Amount: "100",
        Currency: "USD",
      },
    ];
    (prisma.transaction.createMany as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );
    await expect(saveTransactions(transactions)).rejects.toThrow(
      "Database error"
    );
  });
});
