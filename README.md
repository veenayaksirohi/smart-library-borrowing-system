# Smart Library Borrowing System

A full-stack web application designed to help students borrow books, track borrowing costs, calculate overdue charges, and manage balances in a simple and transparent way.

## Overview

The Smart Library Borrowing System automates borrowing validation, cost calculation, and history tracking without requiring a real payment gateway or admin panel. It provides a centralized platform for students to manage their book borrowing activities.

## Key Features

- **Student Authentication**: Secure signup and login with JWT-based authentication
- **Book Management**: Browse a predefined collection of 20 books
- **Borrowing Flow**: Borrow books with automatic validation and cost calculation
- **Return Management**: Return books with automatic overdue charge calculation
- **Dashboard**: Real-time summary of active borrows, balances, and borrowing history
- **Payment History**: Track simulated payment records

## Tech Stack

| Component        | Technology                                        |
| --------------- | ------------------------------------------------- |
| Backend         | Node.js with Express.js                          |
| Database        | MongoDB (via Mongoose)                           |
| Authentication  | JWT (JSON Web Tokens)                            |
| Password Security| Bcrypt                                            |
| Validation      | Zod                                              |
| Rate Limiting   | express-rate-limit                               |
| API Docs        | Swagger/OpenAPI                                  |
| Email (Future)  | Nodemailer + Mailgen                             |
| File Upload     | Multer                                           |

## Project Structure

```
ExpressJS_StarterPack/
├── server.js                 # Application entry point
├── src/
│   ├── app.js               # Express app configuration
│   ├── configs/             # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   └── utils/               # Utility functions
├── package.json             # Dependencies and scripts
├── .eslintrc                # ESLint configuration
├── .prettierrc               # Prettier configuration
└── README.md                # This file
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/veenayaksirohi/Project_Camp_Backend.git
cd Project_Camp_Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start the development server with auto-reload
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

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

### History & Dashboard
- `GET /borrows/history` - Get borrow history
- `GET /payments/history` - Get payment history
- `GET /dashboard/summary` - Get dashboard summary

## Data Model

### Users
- Store student information, balance, and authentication credentials
- Password hashing with Bcrypt

### Books
- Predefined collection of 20 books with pricing information
- Track availability status

### Borrows
- Track all borrowing transactions
- Calculate costs and overdue charges automatically
- Support active and returned statuses

### Payments
- Track simulated payment records
- Support pending and paid statuses

## Validation & Security

- Input validation with Zod
- Password hashing with Bcrypt
- JWT authentication for protected routes
- CORS enabled for security
- Rate limiting to prevent abuse
- Cookie parser for secure session handling

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

## Development Guidelines

### Code Quality
- ESLint is configured for code consistency
- Prettier is configured for code formatting
- Pre-commit hooks via Husky and lint-staged

### Contributing
- Follow the existing code structure
- Run `npm run lint:fix` before committing
- Ensure all tests pass

## License

ISC

## Author

Veena Yaksirohi

## Repository

[GitHub - Project_Camp_Backend](https://github.com/veenayaksirohi/Project_Camp_Backend)
