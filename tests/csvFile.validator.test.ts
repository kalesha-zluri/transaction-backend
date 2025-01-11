import request from "supertest";
import express from "express";
import multer from "multer";
import { validateCSVUpload } from "../src/validators/csvFile.validator";
import { Readable } from "stream";

const app = express();
const upload = multer();

// Attach the middleware for testing
app.post(
  "/upload",
  upload.single("file"),
  validateCSVUpload,
  (req, res) => {
    res.status(200).json({ success: true, transactions: req.body.transactions });
  }
);

// Utility function to create a mock CSV buffer
const createCSVBuffer = (data: string) => {
  const readable = new Readable();
  readable.push(data);
  readable.push(null);
  return readable.read();
};

describe("validateCSVUpload middleware", () => {
  test("should return error if no file is uploaded", async () => {
    const response = await request(app).post("/upload").send();
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("File is required");
  });

  test("should return error if file type is not CSV", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("file", createCSVBuffer("invalid"), {
        filename: "invalid.txt",
        contentType: "text/plain",
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid file type");
  });

  test("should return error if CSV schema is invalid", async () => {
    const invalidCSV = "Name,Age\nJohn,30\nJane,25";
    const response = await request(app)
      .post("/upload")
      .attach("file", createCSVBuffer(invalidCSV), {
        filename: "invalid.csv",
        contentType: "text/csv",
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid file schema: Missing required columns");
  });

  test("should return error if currency data type is invalid", async () => {
    const invalidDataTypesCSV = "Date,Description,Amount,Currency\n12-12-2023,Test,abc,USD";
    const response = await request(app)
      .post("/upload")
      .attach("file", createCSVBuffer(invalidDataTypesCSV), {
        filename: "invalid.csv",
        contentType: "text/csv",
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid data types in file");
  });

  test("should return error if format of date is invalid", async () => {
    const invalidDataTypesCSV =
      "Date,Description,Amount,Currency\nxx-12-2023,Test,20,USD";
    const response = await request(app)
      .post("/upload")
      .attach("file", createCSVBuffer(invalidDataTypesCSV), {
        filename: "invalid.csv",
        contentType: "text/csv",
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid data types in file");
  });
  
  test("should return error if duplicate transactions are found", async () => {
    const duplicateCSV = `Date,Description,Amount,Currency\n12-12-2023,Test,100,USD\n12-12-2023,Test,100,USD`;
    const response = await request(app)
      .post("/upload")
      .attach("file", createCSVBuffer(duplicateCSV), {
        filename: "duplicate.csv",
        contentType: "text/csv",
      });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Duplicate transaction found");
  });

  test("should pass for valid CSV", async () => {
    const validCSV = `Date,Description,Amount,Currency\n12-12-2023,Test,100,USD\n13-12-2023,Sample,200,EUR`;
    const response = await request(app)
      .post("/upload")
      .attach("file", createCSVBuffer(validCSV), {
        filename: "valid.csv",
        contentType: "text/csv",
      });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.transactions).toEqual([
      { Date: "12-12-2023", Description: "Test", Amount: "100", Currency: "USD" },
      { Date: "13-12-2023", Description: "Sample", Amount: "200", Currency: "EUR" },
    ]);
  });
});