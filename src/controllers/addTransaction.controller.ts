import { Request, Response, NextFunction} from "express";
import { createTransaction } from "../services/savetransactions.service";

export const addTransaction = async(req: Request, res: Response, next:NextFunction)=>{
    try{
        const transaction = req.body.transaction;
        const newTransaction = await createTransaction(transaction);
        // console.log(newTransaction);
        res.status(201).json({message: "Transaction added successfully", data: newTransaction});
    }
    catch(error){
        next(error);
    }
}
