import express from "express";
import authRoutes from "./authRoutes.js";
import bookRoutes from "./bookRoutes.js";
import borrowRoutes from "./borrowRoutes.js";
import paymentRoutes from "./paymentRoutes.js";

const router = express.Router();

/**
 * Mount all routes
 */
router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/borrow", borrowRoutes);
router.use("/payments", paymentRoutes);

export default router;
