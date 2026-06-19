import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import './Queues/EmailWorker.js';
import fileRoutes from "./routes/file_routes.js";
import userRoutes from "./routes/user_routes.js";

dotenv.config();
// In server.js, after dotenv.config()
console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('PORT:', process.env.PORT || '❌ NOT SET');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅' : '❌');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅' : '❌');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || '❌');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅' : '❌');
console.log('===================================');
connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", userRoutes);
app.use("/api/files", fileRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
