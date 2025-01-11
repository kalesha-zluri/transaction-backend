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

export const createTransaction = async (transaction :any) =>{
  try{
    const result = await prisma.transaction.create({data: transaction});
  }
  catch(error){
    throw error;
  }
}