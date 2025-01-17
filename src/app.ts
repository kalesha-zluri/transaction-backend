import express, { Application } from "express";
import transactionRouter from "./routes/transaction.routes";
import { setupMiddleware } from "./middlewares/middlewares";

const app: Application = express();

// Setup middleware
setupMiddleware(app);

// Routes
app.use("/api/v1/transactions", transactionRouter);

export default app;
