import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getPaymentHistory,
  getDashboardSummary,
  completePayment,
} from '../controllers/paymentController.js';

const router = express.Router();

/**
 * GET /history
 * Get payment history for user
 * Auth: Required
 */
router.get('/history', protect, getPaymentHistory);

/**
 * GET /dashboard/summary
 * Get dashboard summary with stats
 * Auth: Required
 */
router.get('/dashboard/summary', protect, getDashboardSummary);

/**
 * POST /:paymentId/complete
 * Mark payment as completed
 * Auth: Required
 */
router.post('/:paymentId/complete', protect, completePayment);

export default router;
