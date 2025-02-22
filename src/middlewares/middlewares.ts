import { Application } from "express";
import express from "express";
import multer from "multer";
import cors from "cors";

export const setupMiddleware = (app: Application): void => {
  // Middleware to parse JSON requests
  app.use(express.json());
  // Middleware to handle CORS
  app.use(cors());

  // Middleware to handle file uploads
  const upload = multer();
  app.use(upload.single("file"));
};
