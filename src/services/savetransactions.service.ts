import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveTransactions = async (transactions: any[]) => {
  try {
    const result = await prisma.transaction.createMany({ data: transactions });
    return result;
  } catch (error) {
    console.error("Error saving transactions:", error);
    throw error;
  }
};
