import express from "express";
import {
  validateBorrow,
  calculateCost,
  borrowBook,
  getActiveBorrows,
  getBorrowSummary,
  submitReturn,
  getBorrowHistory,
} from "../controllers/borrowController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Public routes (require auth)
 */
router.post("/validate", protect, validateBorrow);
router.post("/calculate", protect, calculateCost);
router.post("/", protect, borrowBook);

/**
 * Get active borrows
 */
router.get("/active", protect, getActiveBorrows);

/**
 * Borrow history
 */
router.get("/history", protect, getBorrowHistory);

/**
 * Get borrow summary
 */
router.get("/:borrowId/summary", protect, getBorrowSummary);

/**
 * Submit return
 */
router.post("/:borrowId/submit", protect, submitReturn);

export default router;
