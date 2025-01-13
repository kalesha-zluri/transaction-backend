import express, { Application } from "express";
import transactionRouter from "./routes/transaction.routes";
import { setupMiddleware } from "./middlewares/middlewares";
import { errorHandler } from "./middlewares/errorHandler";

const app: Application = express();

// Setup middleware
setupMiddleware(app);

// Routes
app.use("/api/v1/transactions", transactionRouter);

// Error handling middleware
app.use(errorHandler);

export default app;
