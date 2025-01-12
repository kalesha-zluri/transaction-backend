import { Router} from "express";
import {uploadTransactions} from '../controllers/uploadTransactions.controller';
import { validateCSVUpload } from "../validators/csvFile.validator";
import { addTransaction } from "../controllers/addTransaction.controller";
import { deleteTransaction } from "../controllers/deleteTransaction.controller";

const transactionRouter = Router();

transactionRouter.post("/upload", validateCSVUpload, uploadTransactions);
transactionRouter.post("/add",addTransaction);
transactionRouter.delete("/delete/:id",deleteTransaction);

export default transactionRouter;