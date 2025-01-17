import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response
) => {
  console.error(err.stack);
  res.status(500).send("Unexpected Error!");
};
