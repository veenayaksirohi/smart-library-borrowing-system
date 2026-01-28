import express from 'express';
import { getBooks, getBookById } from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Book Routes
 */
router.get('/', protect, getBooks);
router.get('/:bookId', protect, getBookById);

export default router;