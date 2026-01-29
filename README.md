# Smart Library Borrowing System

A full-stack web application designed to help students borrow books, track borrowing costs, calculate overdue charges, and manage balances in a simple and transparent way.

## Overview

The Smart Library Borrowing System automates borrowing validation, cost calculation, and history tracking without requiring a real payment gateway or admin panel. It provides a centralized platform for students to manage their book borrowing activities.

## Key Features

- **Student Authentication**: Secure signup and login with JWT-based authentication
- **Book Management**: Browse a predefined collection of 20 books with search and pagination
- **Borrowing Flow**: Borrow books with automatic validation and cost calculation
- **Return Management**: Return books with automatic overdue charge calculation
- **Dashboard**: Real-time summary of active borrows, balances, and borrowing history
- **Payment System**: Track payment records with automatic and manual completion
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates**: Dashboard and payment status update automatically

## Tech Stack

| Component        | Technology                                        |
| --------------- | ------------------------------------------------- |
| Backend         | Node.js with Express.js                          |
| Database        | PostgreSQL 16 (via Drizzle ORM)                 |
| Authentication  | JWT (JSON Web Tokens)                            |
| Password Security| Bcrypt                                            |
| Frontend        | Vanilla HTML/CSS/JavaScript                      |
| HTTP Client     | Fetch API                                        |
| Development     | Node.js, npm                                     |

## Project Structure

```
smart-library-borrowing-system/
├── server.js                 # Application entry point
├── src/
│   ├── app.js               # Express app configuration
│   ├── controllers/         # Route controllers
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── borrowController.js
│   │   └── paymentController.js
│   ├── middleware/          # Custom middleware
│   │   └── authMiddleware.js
│   ├── models/              # Database models (Drizzle ORM)
│   │   ├── User.Model.js
│   │   ├── Book.Model.js
│   │   ├── Borrow.Model.js
│   │   └── Payment.Model.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── borrowRoutes.js
│   │   └── paymentRoutes.js
│   ├── db/                  # Database connection
│   │   └── index.js
│   └── utils/               # Utility functions
│       └── generateToken.js
├── frontend/                # Frontend application
│   ├── index.html           # Home page
│   ├── login.html           # Login page
│   ├── signup.html          # Signup page
│   ├── dashboard.html       # Dashboard
│   ├── books.html           # Browse books
│   ├── my-borrows.html      # Borrow history
│   ├── payments.html        # Payment history
│   ├── css/
│   │   └── style.css        # All styling
│   └── js/
│       └── api.js           # API client
├── drizzle/                 # Database migrations
│   └── 0000_harsh_darkhawk.sql
├── package.json             # Dependencies and scripts
├── .env                     # Environment variables
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- PostgreSQL 16+

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/veenayaksirohi/smart-library-borrowing-system.git
cd smart-library-borrowing-system
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up PostgreSQL database:**
```bash
# Create database
createdb smart_library

# Or using psql
psql -U postgres
CREATE DATABASE smart_library;
\q
```

4. **Create a `.env` file in the root directory:**
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/smart_library
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

5. **Run database migrations:**
```bash
# The migration will create all necessary tables
psql -U postgres -d smart_library -f drizzle/0000_harsh_darkhawk.sql
```

6. **Start the backend server:**
```bash
node server.js
```

The backend server will start on `http://localhost:5000`

7. **Start the frontend (in a new terminal):**
```bash
# Navigate to frontend directory
cd frontend

# Start a simple HTTP server (Python 3)
python -m http.server 8000

# Or using Node.js (if you have http-server installed)
npx http-server -p 8000

# Or using PHP
php -S localhost:8000
```

The frontend will be available at `http://localhost:8000`

### Quick Test

1. Open `http://localhost:8000` in your browser
2. Click "Sign Up" to create a new account
3. Login with your credentials
4. Browse books and test the borrowing functionality

## Available Scripts

- `node server.js` - Start the backend server
- `npm test` - Run API tests (if available)

## Frontend Development

The frontend is built with vanilla HTML, CSS, and JavaScript for simplicity and performance.

### Frontend Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Dashboard and payment status update automatically
- **Error Handling**: User-friendly error messages and validation
- **Authentication**: Secure login/logout with JWT tokens
- **Modern UI**: Clean, professional interface with smooth animations

## API Endpoints

### Authentication
- `POST /auth/signup` - Register a new student
- `POST /auth/login` - Login and receive JWT
- `GET /auth/profile` - Get logged-in user profile

### Books
- `GET /books` - Get list of all books
- `GET /books/:bookId` - Get book details by ID

### Borrowing
- `POST /borrow/validate` - Validate borrow rules
- `POST /borrow/calculate` - Calculate cost before borrow
- `POST /borrow` - Borrow a book

### Active Borrows & Returns
- `GET /borrows/active` - Get active borrow
- `GET /borrows/:borrowId/summary` - Get borrow summary
- `POST /borrows/:borrowId/submit` - Return a book

### History
- `GET /borrows/history` - Get borrow history

### Payments
- `GET /payments/history` - Get payment history
- `POST /payments/:paymentId/complete` - Mark payment as completed
- `GET /payments/dashboard/summary` - Get dashboard summary

## Data Model

### Users Table
- id (Primary Key)
- name, email, password (hashed with Bcrypt)
- balance (decimal)
- created_at, updated_at

### Books Table
- id (Primary Key)
- title, author
- price_per_day, group_price_per_day (decimal)
- available (boolean)
- created_at, updated_at

### Borrows Table
- id (Primary Key)
- book_id (Foreign Key → books.id)
- user_id (Foreign Key → users.id)
- borrow_date, due_date, return_date
- total_cost, overdue (decimal)
- status ('Active' or 'Returned')
- created_at, updated_at

### Payments Table
- id (Primary Key)
- user_id (Foreign Key → users.id)
- amount (decimal)
- status ('PENDING' or 'PAID')
- date, created_at, updated_at

## Validation & Security

- Input validation on all API endpoints
- Password hashing with Bcrypt
- JWT authentication for protected routes
- CORS enabled for cross-origin requests
- Proper error handling with HTTP status codes
- SQL injection prevention via Drizzle ORM

## Error Handling

The application includes comprehensive error handling with:
- Proper HTTP status codes
- Descriptive error messages
- Input validation feedback

## Future Enhancements

- Admin/librarian role and panel
- Real payment gateway integration
- Email reminders for due dates
- Multi-book borrowing capability
- Analytics and reporting features
- Real-time notifications

## Testing

The project includes comprehensive API testing:

```bash
# Run API tests (if available)
./api-tests.sh

# Seed test data
./seed-test-data.sh
```

## Deployment

### Backend Deployment Options
- **Railway**: Connect GitHub repo and deploy
- **Render**: Free tier available
- **Heroku**: Classic PaaS option
- **DigitalOcean App Platform**: Simple deployment

### Frontend Deployment Options
- **Netlify**: Drag and drop the `frontend/` folder
- **Vercel**: Connect GitHub repo
- **GitHub Pages**: Push `frontend/` to gh-pages branch
- **Any static hosting**: Upload `frontend/` folder contents

### Environment Variables for Production
```env
DATABASE_URL=your_production_postgresql_url
NODE_ENV=production
PORT=5000
JWT_SECRET=your_secure_jwt_secret
```

## License

ISC

## Author

Veena Yaksirohi

## Repository

[GitHub - Smart Library Borrowing System](https://github.com/veenayaksirohi/smart-library-borrowing-system)
