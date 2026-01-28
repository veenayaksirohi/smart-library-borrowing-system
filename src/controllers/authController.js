/**
 * Authentication Controller
 * Handles user signup, login, and profile endpoints
 */

/**
 * Register a new student
 * POST /auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // TODO: Validate input
    // TODO: Check if user exists
    // TODO: Hash password
    // TODO: Create user in database
    // TODO: Return user with JWT token

    

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: null,
        email,
        name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Login user
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // TODO: Validate input
    // TODO: Find user by email
    // TODO: Compare password
    // TODO: Generate JWT token
    // TODO: Return user with token

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        id: null,
        email,
        token: null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get logged-in user profile
 * GET /auth/profile
 * Auth: Required
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // From JWT middleware

    // TODO: Fetch user details from database
    // TODO: Return user profile

    res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      data: {
        id: userId,
        name: null,
        email: null,
        balance: null,
        createdAt: null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
