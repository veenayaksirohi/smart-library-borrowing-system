import db from '../db/index.js';
import { payments } from '../models/Payment.Model.js';
import { borrows } from '../models/Borrow.Model.js';
import { users } from '../models/User.Model.js';
import { eq, sum, count, and, sql } from 'drizzle-orm';

/**
 * Get payment history (all records, no pagination)
 * GET /payments/history
 * Auth: Required
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user ID in request',
      });
    }

    // Fetch all payments for this user
    const dbPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(payments.createdAt);

    const paymentsList = dbPayments.map((p) => {
      let amount = 0;
      if (p.amount) {
        amount = parseFloat(p.amount);
      }

      let status = 'PENDING';
      if (p.status) {
        status = p.status;
      }

      let paymentDate = null;
      if (p.paymentDate) {
        paymentDate = new Date(p.paymentDate).toISOString().split('T')[0];
      }

      let createdAt = null;
      if (p.createdAt) {
        createdAt = new Date(p.createdAt).toISOString();
      }

      let updatedAt = null;
      if (p.updatedAt) {
        updatedAt = new Date(p.updatedAt).toISOString();
      }

      return {
        id: p.id,
        amount,
        status,
        paymentDate,
        createdAt,
        updatedAt,
      };
    });

    // Calculate totalPaid
    const totalPaidRows = await db
      .select({
        totalPaid: sum(payments.amount),
      })
      .from(payments)
      .where(
        and(eq(payments.userId, userId), eq(payments.status, 'PAID')),
      );

    let totalPaid = 0;
    if (totalPaidRows.length > 0 && totalPaidRows[0].totalPaid != null) {
      totalPaid = parseFloat(totalPaidRows[0].totalPaid);
    }

    // Calculate totalPending
    const totalPendingRows = await db
      .select({
        totalPending: sum(payments.amount),
      })
      .from(payments)
      .where(
        and(eq(payments.userId, userId), eq(payments.status, 'PENDING')),
      );

    let totalPending = 0;
    if (totalPendingRows.length > 0 && totalPendingRows[0].totalPending != null) {
      totalPending = parseFloat(totalPendingRows[0].totalPending);
    }

    const summary = {
      totalPaid,
      totalPending,
      totalOverdue: 0, // You can fill this later from borrows if needed
    };

    return res.status(200).json({
      success: true,
      message: 'Payment history fetched successfully',
      data: {
        payments: paymentsList,
        summary,
      },
    });
  } catch (error) {
    console.error('Error in getPaymentHistory:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Get dashboard summary (no pagination, no ternary)
 * GET /dashboard/summary
 * Auth: Required
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user ID in request',
      });
    }

    // 1. User balance
    const userRows = await db
      .select({
        balance: users.balance,
      })
      .from(users)
      .where(eq(users.id, userId))
      .execute();

    let userBalance = 0;
    if (userRows.length > 0 && userRows[0].balance != null) {
      userBalance = parseFloat(userRows[0].balance);
    }

    // 2. Active borrows
    const activeRows = await db
      .select({
        count: count(),
      })
      .from(borrows)
      .where(and(eq(borrows.userId, userId), eq(borrows.status, 'ACTIVE')));

    let activeBorrows = 0;
    if (activeRows.length > 0 && activeRows[0].count != null) {
      activeBorrows = activeRows[0].count;
    }

    // 3. Overdue charges
    const overdueRows = await db
      .select({
        overdue: sum(borrows.overdue),
      })
      .from(borrows)
      .where(eq(borrows.userId, userId));

    let overdueCharges = 0;
    if (overdueRows.length > 0 && overdueRows[0].overdue != null) {
      overdueCharges = parseFloat(overdueRows[0].overdue);
    }

    // 4. Total books borrowed
    const totalBorrowedRows = await db
      .select({
        count: count(),
      })
      .from(borrows)
      .where(eq(borrows.userId, userId));

    let totalBooksBorrowed = 0;
    if (totalBorrowedRows.length > 0 && totalBorrowedRows[0].count != null) {
      totalBooksBorrowed = totalBorrowedRows[0].count;
    }

    // 5. Pending payments summary
    const pendingPayRows = await db
      .select({
        amount: sum(payments.amount),
        count: count(),
      })
      .from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.status, 'PENDING')));

    let pendingPaymentsCount = 0;
    let pendingPaymentsAmount = 0;

    if (pendingPayRows.length > 0) {
      if (pendingPayRows[0].count != null) {
        pendingPaymentsCount = pendingPayRows[0].count;
      }
      if (pendingPayRows[0].amount != null) {
        pendingPaymentsAmount = parseFloat(pendingPayRows[0].amount);
      }
    }

    // 6. Recent borrows (last 5)
    const recentRows = await db
      .select({
        id: borrows.id,
        bookId: borrows.bookId,
        borrowDate: borrows.borrowDate,
        dueDate: borrows.dueDate,
        returnDate: borrows.returnDate,
        totalCost: borrows.totalCost,
        overdue: borrows.overdue,
        status: borrows.status,
      })
      .from(borrows)
      .where(eq(borrows.userId, userId))
      .orderBy(borrows.borrowDate)
      .limit(5);

    const recentBorrows = recentRows.map((b) => {
      let borrowDate = null;
      if (b.borrowDate) {
        borrowDate = new Date(b.borrowDate).toISOString().split('T')[0];
      }

      let dueDate = null;
      if (b.dueDate) {
        dueDate = new Date(b.dueDate).toISOString().split('T')[0];
      }

      let returnDate = null;
      if (b.returnDate) {
        returnDate = new Date(b.returnDate).toISOString().split('T')[0];
      }

      let totalCost = 0;
      if (b.totalCost != null) {
        totalCost = parseFloat(b.totalCost);
      }

      let overdue = 0;
      if (b.overdue != null) {
        overdue = parseFloat(b.overdue);
      }

      return {
        id: b.id,
        bookId: b.bookId,
        borrowDate,
        dueDate,
        returnDate,
        totalCost,
        overdue,
        status: b.status,
      };
    });

    // 7. Stats: totalSpent, averageBorrowDays, returnRate, penaltyCharges
    const statsRows = await db
      .select({
        totalSpent: sum(payments.amount),
        penaltyCharges: sum(borrows.overdue),
      })
      .from(payments)
      .leftJoin(borrows, eq(borrows.userId, payments.userId))
      .where(and(eq(payments.userId, userId), eq(payments.status, 'PAID')));

    let totalSpent = 0;
    let penaltyCharges = 0;

    if (statsRows.length > 0) {
      if (statsRows[0].totalSpent != null) {
        totalSpent = parseFloat(statsRows[0].totalSpent);
      }
      if (statsRows[0].penaltyCharges != null) {
        penaltyCharges = parseFloat(statsRows[0].penaltyCharges);
      }
    }

    // Average borrow days and return rate
    const returnedRows = await db
      .select({
        borrowDate: borrows.borrowDate,
        returnDate: borrows.returnDate,
      })
      .from(borrows)
      .where(and(eq(borrows.userId, userId), eq(borrows.status, 'RETURNED')));

    let totalBorrowDays = 0;
    let returnedCount = 0;

    for (const b of returnedRows) {
      if (b.borrowDate && b.returnDate) {
        const start = new Date(b.borrowDate);
        const end = new Date(b.returnDate);
        const diffMs = end.getTime() - start.getTime();
        let days = diffMs / (1000 * 60 * 60 * 24);
        if (days < 1) {
          days = 1;
        }
        totalBorrowDays += days;
        returnedCount += 1;
      }
    }

    let averageBorrowDays = 0;
    if (returnedCount > 0) {
      averageBorrowDays = totalBorrowDays / returnedCount;
      averageBorrowDays = Math.round(averageBorrowDays * 100) / 100;
    }

    let returnRate = 0;
    if (totalBooksBorrowed > 0) {
      returnRate = (returnedCount / totalBooksBorrowed) * 100;
      returnRate = Math.round(returnRate * 100) / 100;
    }

    let returnRateString = returnRate.toString() + '%';

    return res.status(200).json({
      success: true,
      message: 'Dashboard summary fetched successfully',
      data: {
        userBalance,
        activeBorrows,
        overdueCharges,
        totalBooksBorrowed,
        pendingPayments: {
          count: pendingPaymentsCount,
          amount: pendingPaymentsAmount,
        },
        recentBorrows,
        stats: {
          totalSpent,
          averageBorrowDays,
          returnRate: returnRateString,
          penaltyCharges,
        },
      },
    });
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
