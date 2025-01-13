import { Router} from "express";
import {uploadTransactions} from '../controllers/uploadTransactions.controller';
import { validateCSVUpload } from "../validators/csvFile.validator";
import { addTransaction } from "../controllers/addTransaction.controller";
import { deleteTransaction } from "../controllers/deleteTransaction.controller";
import { getTransactionList } from "../controllers/getTransactionList.controller";

const transactionRouter = Router();

transactionRouter.post("/upload", validateCSVUpload, uploadTransactions);
transactionRouter.post("/add",addTransaction);
transactionRouter.delete("/delete/:id",deleteTransaction);
transactionRouter.get("/get",getTransactionList);

export default transactionRouter;