import { Router } from "express";
import transactionRouter from './transaction.routes'

export const mainRouter =  Router();

mainRouter.use('/transactions',transactionRouter);