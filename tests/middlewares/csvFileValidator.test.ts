import { Request, Response, NextFunction } from "express";
import { validateCSVUpload } from "../../src/middlewares/csvFileValidator";
import parseCSV from "../../src/utils/csvParser";
import { getAllTransactionKeys } from "../../src/services/databaseOperations.service";

jest.mock("../../src/utils/csvParser");
jest.mock("../../src/services/databaseOperations.service");

describe("validateCSVUpload middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      file: undefined,
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("returns 400 if file is missing", async () => {
    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "File is required" });
  });

  it("returns 400 if file is not a CSV", async () => {
    mockReq.file = {
      fieldname: "file",
      originalname: "file.txt",
      encoding: "7bit",
      mimetype: "text/plain",
      size: 123,
      destination: "",
      filename: "",
      path: "",
      buffer: Buffer.from("dummy"),
    } as Express.Multer.File;
    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid file type" });
  });

  it("returns 400 if parseCSV returns an error", async () => {
    mockReq.file = {
      fieldname: "file",
      originalname: "test.csv",
      encoding: "7bit",
      mimetype: "text/csv",
      size: 123,
      destination: "",
      filename: "",
      path: "",
      buffer: Buffer.from("dummy"),
    } as Express.Multer.File;
    (parseCSV as jest.Mock).mockResolvedValue({
      data: [],
      errors: [],
      error: "No valid transactions found",
    });
    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "No valid transactions found",
    });
  });

  it("checks for duplicates in DB and returns errors if found", async () => {
    mockReq.file = {
      fieldname: "file",
      originalname: "test.csv",
      encoding: "7bit",
      mimetype: "text/csv",
      size: 123,
      destination: "",
      filename: "",
      path: "",
      buffer: Buffer.from("dummy"),
    } as Express.Multer.File;
    (parseCSV as jest.Mock).mockResolvedValue({
      data: [{ date: "2020-01-01", description: "Test" }],
      errors: [],
    });
    (getAllTransactionKeys as jest.Mock).mockResolvedValue(
      new Set(["2020-01-01-Test"])
    );

    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Validation errors found",
      details: [
        {
          "data":{
            "date": "2020-01-01",
            "description": "Test"
          },
          "reason":"Duplicate in database",
          "row":"NA",
        }
      ]
    });
  });

  it("passes when no duplicates and CSV is valid", async () => {
    mockReq.file = {
      fieldname: "file",
      originalname: "test.csv",
      encoding: "7bit",
      mimetype: "text/csv",
      size: 123,
      destination: "",
      filename: "",
      path: "",
      buffer: Buffer.from("dummy"),
    } as Express.Multer.File;
    (parseCSV as jest.Mock).mockResolvedValue({
      data: [{ date: "2020-01-01", description: "Clean" }],
      errors: [],
    });
    (getAllTransactionKeys as jest.Mock).mockResolvedValue(new Set());

    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
  it("ignores duplicates and sets req.body.transactions, req.body.errors, then calls next() when ignoreDuplicates is true", async () => {
    mockReq.file = {
      fieldname: "file",
      originalname: "test.csv",
      encoding: "7bit",
      mimetype: "text/csv",
      size: 123,
      destination: "",
      filename: "",
      path: "",
      buffer: Buffer.from("dummy data"),
    } as Express.Multer.File;
    mockReq.body.ignoreDuplicates = "true";

    (parseCSV as jest.Mock).mockResolvedValue({
      data: [
        { date: "2020-01-01", description: "Test" },
        { date: "2020-01-02", description: "Valid" },
      ],
      errors: [{ row: "1", reason: "Some CSV parser warning" }],
    });
    (getAllTransactionKeys as jest.Mock).mockResolvedValue(
      new Set(["2020-01-01-Test"])
    );

    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);

    // No 400 return means duplicates were ignored
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();

    // Middleware set these properties
    expect(mockReq.body.transactions).toEqual([
      { date: "2020-01-02", description: "Valid" },
    ]);
    expect(mockReq.body.errors).toEqual(
      expect.arrayContaining([{ row: "1", reason: "Some CSV parser warning" }])
    );
    expect(mockNext).toHaveBeenCalled();
  });

  it("calls next(error) if an error occurs", async () => {
    mockReq.file = {
      fieldname: "file",
      originalname: "test.csv",
      encoding: "7bit",
      mimetype: "text/csv",
      size: 123,
      destination: "",
      filename: "",
      path: "",
      buffer: Buffer.from("dummy data"),
    } as Express.Multer.File;

    (parseCSV as jest.Mock).mockImplementation(() => {
      throw new Error("CSV parse error");
    });

    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({ message: "CSV parse error" })
    );
  });
});
