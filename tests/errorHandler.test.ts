import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../src/middlewares/errorHandler";

describe("errorHandler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let error: Error;

  beforeEach(() => {
    req = {} as Partial<Request>;
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as Partial<Response>;
    next = jest.fn();
    error = new Error("Test error");
  });

  it("should handle errors and send response", () => {
    errorHandler(error, req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith("Unexpected Error!");
  });
});
