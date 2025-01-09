import  parseCSV  from "../../utils/csvParser";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const saveTransactions = async (file: Express.Multer.File) => {
  const data = await parseCSV(file.buffer);
  const user = await prisma.transaction.createMany({data});
  console.log(user);
  return user;
}
