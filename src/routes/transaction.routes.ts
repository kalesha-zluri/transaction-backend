import { Router} from "express";
import {uploadTransactions} from '../controllers/uploadTransactions.controller';
import { validateCSVUpload } from "../validators/csvFile.validator";
import { addTransaction } from "../controllers/addTransaction.controller";

const transactionRouter = Router();

transactionRouter.post("/upload", validateCSVUpload, uploadTransactions);
transactionRouter.post("/add",addTransaction);

export default transactionRouter;