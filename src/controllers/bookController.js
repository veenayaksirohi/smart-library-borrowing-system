import db from "../db/index.js";
import { books } from "../models/Book.Model.js";
import { and, eq, ilike, sql } from "drizzle-orm";

/**
 * GET /books
 * Get all books with pagination and search
 */
export const getBooks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    // Build where clause
    const whereConditions = [];
    if (search) {
      whereConditions.push(ilike(books.title, `%${search}%`));
    }

    // Only show available books
    whereConditions.push(eq(books.available, true));

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : eq(books.available, true);

    // Fetch books
    const bookList = await db
      .select()
      .from(books)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(books)
      .where(whereClause);

    res.json({
      success: true,
      message: "Books fetched successfully",
      data: {
        books: bookList,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        totalBooks: count,
      },
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
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
 * GET /books/:bookId
 * Get single book by ID
 */
export const getBookById = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Validate bookId
    if (!bookId || isNaN(parseInt(bookId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid bookId",
      });
    }

    const book = await db.query.books.findFirst({
      where: eq(books.id, parseInt(bookId)),
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    res.json({
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
