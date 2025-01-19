import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveTransactions = async (transactions: any[]) => {
  try {
    const transformedData = transactions.map((transaction) => {
      const [day, month, year] = transaction.date.split("-");
      return {
        ...transaction,
        dateTime: new Date(Number(year), Number(month) - 1, Number(day)),
      };
    });
    const result = await prisma.transaction.createMany({
      data: transformedData,
    });
    return result;
  } catch (error) {
    console.error("Error saving transactions:", error);
    throw error;
  }
};

export const createTransaction = async (transaction: any) => {
  try {
    const [day, month, year] = transaction.date.split("-");
    const dateTime = new Date(Number(year), Number(month) - 1, Number(day));

    const result = await prisma.transaction.create({
      data: {
        ...transaction,
        dateTime,
      },
    });
    return result;
  } catch (error) {
    console.error("Error creating transaction:", error);
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
    console.error("Error checking duplicate transaction:", error);
    throw error;
  }
};

export const softDeleteTransaction = async (id: number) => {
  try {
    // Check if the transaction exists and is not already deleted
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return { error: "Transaction not found" };
    }

    if (transaction.isDeleted) {
      return { error: "Transaction already deleted" };
    }

    // Soft delete the transaction
    const deletedTransaction = await prisma.transaction.update({
      where: { id },
      data: { isDeleted: true },
    });

    return deletedTransaction;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
};

export const getTransactions = async (page: number, limit: number) => {
  try {
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: { isDeleted: false },
        orderBy: {dateTime: 'desc'},
        skip,
        take: limit,
      }),
      prisma.transaction.count({
        where: { isDeleted: false },
      }),
    ]);

    return { transactions, totalCount };
  } catch (error) {
    console.error("Error fetching transactions:", error);
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
    console.error("Error updating transaction:", error);
    throw error;
  }
};

export const getTransactionKeys = async (keys: string[]) => {
  try {
    // Correctly split keys into date and description
    const queryConditions = keys.map((key) => {
      const parts = key.split("-");
      const date = parts.slice(0, 3).join("-"); // Combine first three parts as date
      const description = parts.slice(3).join("-"); // Combine the rest as description
      return { date, description };
    });

    // Fetch records from the database
    const allRecords = await prisma.transaction.findMany({
      where: {
        isDeleted: false,
        OR: queryConditions,
      },
      select: {
        date: true,
        description: true,
      },
    });

    // Create a set of keys using the fetched data
    const recordKeySet = new Set(
      allRecords.map((record) => `${record.date}-${record.description}`)
    );

    return recordKeySet;
  } catch (error) {
    console.error("Error fetching transaction keys:", error);
    throw error;
  }
};


export const getTransactionById = async (id: number) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });
    return transaction;
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    throw error;
  }
};
