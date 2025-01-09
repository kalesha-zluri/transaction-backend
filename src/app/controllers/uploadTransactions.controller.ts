import { Request, Response, NextFunction } from "express";
import {saveTransactions} from '../services/savetransactions.service';

export const uploadTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file; // Assume file is parsed via middleware
    if (!file) { 
        res.status(400).json({ error: 'File is required' });
        return;
    }
    const results = await saveTransactions(file);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};