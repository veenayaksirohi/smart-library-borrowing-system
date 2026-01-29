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
 * POST /validate
 * Validate if a user can borrow a book
 */
router.post("/validate", protect, validateBorrow);

/**
 * POST /calculate
 * Calculate total cost before borrowing
 */
router.post("/calculate", protect, calculateCost);

/**
 * POST /
 * Borrow a book
 */
router.post("/", protect, borrowBook);

/**
 * GET /active
 * Get active borrows for user (MUST BE BEFORE /:borrowId ROUTES)
 */
router.get("/active", protect, getActiveBorrows);

/**
 * GET /history
 * Get borrow history for user (MUST BE BEFORE /:borrowId ROUTES)
 */
router.get("/history", protect, getBorrowHistory);

/**
 * GET /:borrowId/summary
 * Get borrow summary with book details
 */
router.get("/:borrowId/summary", protect, getBorrowSummary);

/**
 * POST /:borrowId/submit
 * Return a book and calculate overdue charges
 */
router.post("/:borrowId/submit", protect, submitReturn);

export default router;
