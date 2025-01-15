import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveTransactions = async (transactions: any[]) => {
  try {
    const result = await prisma.transaction.createMany({ data: transactions });
    return result;
  } catch (error) {
    throw error;
  }
};

export const createTransaction = async (transaction: any) => {
  try {
    const result = await prisma.transaction.create({ data: transaction });
    return result;
  } catch (error) {
    throw error;
  }
};

export const checkDuplicateTransaction = async (transaction: any) => {
  try {
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        date: transaction.date,
        description: transaction.description,
        isDeleted: false,
      },
    });
    return !!existingTransaction;
  } catch (error) {
    throw error;
  }
};

export const softDeleteTransaction = async (id: number) => {
  try {
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true },
    });
    return transaction;
  } catch (error) {
    throw error;
  }
};

export const getTransactions = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: { isDeleted: false },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { isDeleted: 
          false },
      }),
    ]);

    return { transactions, totalCount };
  } catch (error) {
    throw error;
  }
};

export const updateTransaction = async (id: number, transaction: any) => {
  try {
    const result = await prisma.transaction.update({
      where: { id },
      data: transaction,
    });
    return result;
  } catch (error) {
    throw error;
  }
};
