import {Request,Response,NextFunction} from 'express';

export const validateCSVUpload = (req: Request,res: Response,next:NextFunction)=>{
    if (!req.file) {
        res.status(400).json({ error: "File is required" });
        return;
    }
    if (!req.file.mimetype.includes("csv")) { 
        res.status(400).json({ error: "Invalid file type" });
        return;
    }
    next();
};