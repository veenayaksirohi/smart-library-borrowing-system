/**
 * Books Controller
 * Handles book-related endpoints
 */

import db from "../db/index.js";
import { books } from "../models/Book.Model.js";
import { eq } from "drizzle-orm";

/**
 * Get list of all available books
 * GET /books
 * Auth: Required
 */
export const getBooks = async (req, res) => {
  try {
    const bookList = await db.query.books.findMany({
      where: eq(books.available, true),
    });

    res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      data: bookList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * Get book details by ID
 * GET /books/:bookId
 * Auth: Required
 */
export const getBookById = async (req, res) => {
  try {
    const bookId = Number(req.params.bookId);

    // Validate ID
    if (isNaN(bookId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book details fetched successfully",
      data: book,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
