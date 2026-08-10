import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import "./Queues/EmailWorker.js";

import fileRoutes from "./routes/file_routes.js";
import userRoutes from "./routes/user_routes.js";

dotenv.config();
await connectDB();

const app = express();

app.use(
  cors({
    origin: 
    "https://file-sharing-rumd.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", userRoutes);
app.use("/api/files", fileRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});