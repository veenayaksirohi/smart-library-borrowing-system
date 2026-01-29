import db from "../db/index.js";
import { borrows } from "../models/Borrow.Model.js";
import { books } from "../models/Book.Model.js";
import { users } from "../models/User.Model.js";
import { payments } from "../models/Payment.Model.js";
import { and, eq, sql } from "drizzle-orm";

/**
 * POST /borrow/validate
 * Validate if a user can borrow a book
 */
export const validateBorrow = async (req, res) => {
  try {
    const { bookId } = req.body;
    const userId = req.user.id;

    if (!bookId) {
      return res.status(400).json({
        success: false,
        message: "bookId is required",
      });
    }

    // Check if book exists
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    // Check if book is available
    if (!book.available) {
      return res.status(400).json({
        success: false,
        message: "Book is not available",
      });
    }

    // Check user's active borrows (max 1 book at a time)
    const activeBorrows = await db
      .select()
      .from(borrows)
      .where(and(eq(borrows.userId, userId), eq(borrows.status, "Active")));

    if (activeBorrows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already has an active borrow",
      });
    }

    return res.json({
      success: true,
      message: "Borrow validation successful",
      data: {
        isValid: true,
        rules: {
          maxBooksPerUser: 1,
          maxBorrowDays: 14,
          overduePenaltyPerDay: 10,
        },
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
 * POST /borrow/calculate
 * Calculate total cost before borrowing
 */
export const calculateCost = async (req, res) => {
  try {
    const { bookId, daysToKeep } = req.body;

    if (!bookId || !daysToKeep) {
      return res.status(400).json({
        success: false,
        message: "bookId and daysToKeep are required",
      });
    }

    // Validate daysToKeep
    if (daysToKeep <= 0 || daysToKeep > 14) {
      return res.status(400).json({
        success: false,
        message: "daysToKeep must be between 1 and 14",
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

    const dailyRate = Number(book.pricePerDay);
    const totalCost = dailyRate * daysToKeep;

    res.json({
      success: true,
      message: "Cost calculated successfully",
      data: {
        bookId,
        dailyRate,
        daysToKeep,
        totalCost,
        costBreakdown: {
          dailyRate,
          numberOfDays: daysToKeep,
          subtotal: totalCost,
          tax: 0,
          total: totalCost,
        },
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
 * POST /borrow
 * Borrow a book
 */
export const borrowBook = async (req, res) => {
  try {
    const { bookId, daysToKeep } = req.body;
    const userId = req.user.id;

    console.log('Borrow request received:', { bookId, daysToKeep, userId, body: req.body });

    // Validate input
    if (!bookId || !daysToKeep) {
      console.log('Validation failed: missing bookId or daysToKeep');
      return res.status(400).json({
        success: false,
        message: "bookId and daysToKeep are required",
      });
    }

    if (daysToKeep <= 0 || daysToKeep > 14) {
      return res.status(400).json({
        success: false,
        message: "daysToKeep must be between 1 and 14",
      });
    }

    // Check if book exists and is available
    const book = await db.query.books.findFirst({
      where: eq(books.id, bookId),
    });

    if (!book || !book.available) {
      return res.status(400).json({
        success: false,
        message: "Book is not available",
      });
    }

    // Check user's active borrows
    const activeBorrows = await db
      .select()
      .from(borrows)
      .where(and(eq(borrows.userId, userId), eq(borrows.status, "Active")));

    if (activeBorrows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already has an active borrow. Return it first.",
      });
    }

    // Calculate dates and cost
    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(borrowDate.getDate() + daysToKeep);

    const totalCost = Number(book.pricePerDay) * daysToKeep;

    // Use transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
      const [newBorrow] = await tx
        .insert(borrows)
        .values({
          bookId,
          userId,
          borrowDate,
          dueDate,
          totalCost,
          status: "Active",
        })
        .returning();

      // Create corresponding payment record
      await tx.insert(payments).values({
        userId,
        amount: totalCost,
        status: "PENDING",
        date: borrowDate,
      });

      await tx
        .update(books)
        .set({ available: false })
        .where(eq(books.id, bookId));

      return newBorrow;
    });

    res.status(201).json({
      success: true,
      message: "Book borrowed successfully",
      data: {
        borrowId: result.id,
        bookId,
        userId,
        borrowDate,
        dueDate,
        totalCost,
        status: "Active",
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
 * GET /borrows/active
 * Get active borrow for user
 */
export const getActiveBorrows = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active borrows with book details
    const activeBorrows = await db
      .select({
        id: borrows.id,
        bookId: borrows.bookId,
        userId: borrows.userId,
        borrowDate: borrows.borrowDate,
        dueDate: borrows.dueDate,
        returnDate: borrows.returnDate,
        totalCost: borrows.totalCost,
        overdue: borrows.overdue,
        status: borrows.status,
        createdAt: borrows.createdAt,
        updatedAt: borrows.updatedAt,
        bookTitle: books.title,
        bookAuthor: books.author,
      })
      .from(borrows)
      .leftJoin(books, eq(borrows.bookId, books.id))
      .where(and(eq(borrows.userId, userId), eq(borrows.status, "Active")));

    res.json({
      success: true,
      message: "Active borrows fetched successfully",
      data: {
        activeBorrows,
        totalActive: activeBorrows.length,
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
 * GET /borrows/:borrowId/summary
 * Get borrow summary with book details
 */
export const getBorrowSummary = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const userId = req.user.id;

    const borrow = await db.query.borrows.findFirst({
      where: and(eq(borrows.id, borrowId), eq(borrows.userId, userId)),
    });

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow not found",
      });
    }

    // Get book details
    const book = await db.query.books.findFirst({
      where: eq(books.id, borrow.bookId),
    });

    // Calculate overdue days if applicable
    const today = new Date();
    let daysOverdue = 0;
    let overdueCharges = 0;

    if (borrow.status === "Active" && today > borrow.dueDate) {
      daysOverdue = Math.ceil((today - borrow.dueDate) / (1000 * 60 * 60 * 24));
      overdueCharges = daysOverdue * 10; // ₹10 per day
    }

    res.json({
      success: true,
      message: "Borrow summary fetched successfully",
      data: {
        borrowId: borrow.id,
        bookDetails: {
          id: book.id,
          title: book.title,
          author: book.author,
        },
        borrowDate: borrow.borrowDate,
        dueDate: borrow.dueDate,
        returnDate: borrow.returnDate,
        status: borrow.status,
        totalCost: borrow.totalCost,
        overdueCharges: borrow.overdue || overdueCharges,
        daysOverdue,
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
 * POST /borrows/:borrowId/submit
 * Return a book and calculate overdue charges
 */
export const submitReturn = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const userId = req.user.id;

    // Verify borrow exists and belongs to user
    const borrow = await db.query.borrows.findFirst({
      where: and(eq(borrows.id, borrowId), eq(borrows.userId, userId)),
    });

    if (!borrow) {
      return res.status(404).json({
        success: false,
        message: "Borrow not found",
      });
    }

    if (borrow.status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "Borrow is not active",
      });
    }

    // Calculate overdue charges
    const returnDate = new Date();
    let overdueCharge = 0;

    if (returnDate > borrow.dueDate) {
      const daysLate = Math.ceil((returnDate - borrow.dueDate) / (1000 * 60 * 60 * 24));
      overdueCharge = daysLate * 10; // ₹10 per day
    }

    // Use transaction to update both borrow and book status, and mark payment as completed
    await db.transaction(async (tx) => {
      await tx
        .update(borrows)
        .set({
          returnDate,
          overdue: overdueCharge,
          status: "Returned",
        })
        .where(eq(borrows.id, borrowId));

      await tx
        .update(books)
        .set({ available: true })
        .where(eq(books.id, borrow.bookId));

      // Mark the corresponding payment as completed
      await tx
        .update(payments)
        .set({ status: "PAID" })
        .where(and(
          eq(payments.userId, userId),
          eq(payments.amount, borrow.totalCost)
        ));
    });

    const finalAmount = Number(borrow.totalCost) + overdueCharge;

    res.json({
      success: true,
      message: "Book returned successfully",
      data: {
        borrowId,
        returnDate,
        status: "Returned",
        borrowCost: borrow.totalCost,
        overdueCharges: overdueCharge,
        finalAmount,
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
 * GET /borrows/history
 * Get borrow history for user
 */
export const getBorrowHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const offset = (page - 1) * limit;

    // Fetch history
    const history = await db
      .select()
      .from(borrows)
      .where(eq(borrows.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(borrows.createdAt);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(borrows)
      .where(eq(borrows.userId, userId));

    res.json({
      success: true,
      message: "Borrow history fetched successfully",
      data: {
        borrows: history,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit),
        },
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
