import { Router} from "express";
import {uploadTransactions} from '../controllers/uploadTransactions.controller';
import { validateCSVUpload } from "../validators/csvFile.validator";

const transactionRouter = Router();

transactionRouter.post("/upload", validateCSVUpload, uploadTransactions);

export default transactionRouter;