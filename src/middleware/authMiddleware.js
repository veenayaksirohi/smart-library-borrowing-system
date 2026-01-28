import jwt from "jsonwebtoken";
import { users } from "../models/User.Model.js";
import db from "../db/index.js";

export const protect = async (req, res, next) => {
  let token;

  // 1. Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2. If token missing
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing",
    });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Get user from DB
    const user = await db.query.users.findFirst({
      where: (usersTable, { eq }) => eq(usersTable.id, decoded.id),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 5. Remove password before attaching
    const { password, ...safeUser } = user;

    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
