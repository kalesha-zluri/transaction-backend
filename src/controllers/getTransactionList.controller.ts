import { Request, Response, NextFunction } from  "express";
import { getTransactions } from "../services/databaseOperations.service";

export const getTransactionList = async(req: Request, res: Response, next: NextFunction) => {
    try{
        const {page = 1, limit = 10} = req.query;
        const pageNumber = parseInt(page as string , 10);
        const limitNumber = parseInt(limit as string, 10);

        const {transactions, totalCount} = await getTransactions(pageNumber, limitNumber);

        res.status(200).json({
            transactions,
            totalCount,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount/limitNumber),
        });
    }catch(error){
        next(error);
    }
}