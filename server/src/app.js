import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { rateLimiter } from './middleware/rateLimiter.middleware.js';

// Import routes
import userRouter from './routes/user.routes.js';
import productRouter from './routes/product.routes.js';
import orderRouter from './routes/order.routes.js';
import clientRouter from './routes/client.routes.js';
import paymentRouter from './routes/payment.routes.js';
import ocrRouter from './routes/ocr.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || process.env.CORSE_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"));

app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
    res.send('Business Management API - Server is running');
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/clients", clientRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/ocr", ocrRouter);

export default app;