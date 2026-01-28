import express from "express";
import authRoutes from "./authRoutes.js";
import bookRoutes from "./bookRoutes.js";
import borrowRoutes from "./borrowRoutes.js";

const router = express.Router();

/**
 * Mount all routes
 */
router.use("/auth", authRoutes);
router.use("/books", bookRoutes);
router.use("/borrows", borrowRoutes);

export default router;
