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

export const createTransaction = async (transaction: any) =>{
  try{
    const result = await prisma.transaction.create({data: transaction});
    return result;
  }
  catch(error){
    throw error;
  }
};

export const checkDuplicateTransaction = async(transaction: any) =>{
  try{
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        Date: transaction.Date,
        Description: transaction.Description,
      },
    });
    return !!existingTransaction
  }
  catch(error){
    throw error;
  }
}