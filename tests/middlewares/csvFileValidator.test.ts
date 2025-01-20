import { Request, Response, NextFunction } from "express";
import { validateCSVUpload } from "../../src/middlewares/csvFileValidator";
import parseCSV from "../../src/utils/csvParser";
import { getTransactionKeys } from "../../src/services/databaseOperations.service";

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

  it("returns 400 if file size exceeds 1MB", async () => {
    mockReq.file = {
      fieldname: "file",
      originalname: "test.csv",
      encoding: "7bit",
      mimetype: "text/csv",
      size: 2 * 1024 * 1024, // 2MB
      destination: "",
      filename: "",
      path: "",
      buffer: Buffer.from("dummy"),
    } as Express.Multer.File;

    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "File size exceeds 1MB",
    });
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
    (getTransactionKeys as jest.Mock).mockResolvedValue(
      new Set(["2020-01-01-Test"])
    );

    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Upload failed! Validation errors found",
      data: [
        {
          row: "NA",
          transaction_data: { date: "2020-01-01", description: "Test" },
          reason: "Duplicate in database",
        },
      ],
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
    (getTransactionKeys as jest.Mock).mockResolvedValue(new Set());

    await validateCSVUpload(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
