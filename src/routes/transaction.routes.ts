import { Router } from "express";
import { uploadTransactions } from "../controllers/uploadTransactions.controller";
import { validateCSVUpload } from "../middlewares/csvFileValidator";
import { addTransaction } from "../controllers/addTransaction.controller";
import { deleteTransaction } from "../controllers/deleteTransaction.controller";
import { getTransactionList } from "../controllers/getTransactionList.controller";
import { editTransaction } from "../controllers/editTransaction.controller";
import { deleteMultipleTransactions } from "../controllers/deleteMulltipleTransactions.controller";

const transactionRouter = Router();

transactionRouter.post("/upload", validateCSVUpload, uploadTransactions);
transactionRouter.post("/add", addTransaction);
transactionRouter.delete("/delete/:id", deleteTransaction);
transactionRouter.get("/get", getTransactionList);
transactionRouter.put("/edit/:id",editTransaction);
transactionRouter.delete("/delete-multiple", deleteMultipleTransactions);

export default transactionRouter;
