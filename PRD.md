# Product Requirements Document (PRD)

## 1. Product Overview

**Product Name:** Smart Library Borrowing System
**Product Type:** Full‑stack Web Application
**Target Platform:** Web (Desktop & Mobile browsers)

### 1.1 Purpose

The Smart Library Borrowing System is a full‑stack web application designed to help students borrow books, track borrowing costs, calculate overdue charges, and manage balances in a simple and transparent way. The system automates borrowing validation, cost calculation, and history tracking without requiring a real payment gateway or admin panel.

### 1.2 Goals & Objectives

* Enable students to easily borrow and return books online
* Accurately calculate borrowing and overdue costs
* Provide clear visibility into active borrows, balances, and history
* Demonstrate strong backend logic, clean APIs, and secure authentication

#

## 3. Problem Statement

Students borrowing books often face:

* Lack of clarity around borrowing costs and overdue penalties
* Difficulty tracking active borrows and history
* Manual or error‑prone calculations

The Smart Library Borrowing System solves these issues by providing a centralized, automated borrowing and cost‑tracking platform.

---

## 4. In‑Scope & Out‑of‑Scope

### In Scope

* Student authentication (signup, login, profile)
* Viewing predefined books
* Borrowing and returning books
* Cost and overdue calculation
* Dashboard and history views
* Simulated payment records

### Out of Scope

* Real payment gateway integration
* Admin panel or librarian roles
* Real‑time external book repositories
* Notifications (email/SMS)

---

## 5. Core Features & Requirements

### 5.1 Authentication

* Sign up with name, email, and password
* Login using email and password
* Secure password hashing
* JWT or session‑based authentication
* Protected routes for logged‑in users only

### 5.2 Book Management

* Display a predefined list of 20 books
* Books are read‑only
* Book attributes:

  * ID
  * Title
  * Author
  * Single borrow price per day
  * Group borrow price per day
  * Availability status

### 5.3 Borrowing Flow

* View available books
* Borrow a book with validations:

  * Book must be available
  * User must have no outstanding debt
  * User can borrow only one book at a time
  * Borrow days must not exceed maximum limit
* Calculate borrowing cost:

  * `totalCost = pricePerDay × numberOfDays`
* Set borrow date and due date
* Mark borrow as **Active**

### 5.4 Return / Submit Borrow

* Mock return by manually entering return date
* Calculate overdue charges:

  * `totalOverdue = duePerDay × overdueDays`
* Final amount = borrowing cost + overdue
* Update borrow status to **Returned**
* Move record to history

### 5.5 Dashboard

* Summary view containing:
  knowing:

  * Active borrow count
  * Total amount due
  * Current user balance
  * Borrowing history count

### 5.6 History & Payments

* Borrow history with:

  * Borrow date
  * Return date
  * Total cost
  * Overdue charges
* Payment history (simulated):

  * Pending payments
  * Paid payments

---

## 6. Functional Requirements

* Users can create and authenticate accounts
* Users can view all available books
* Users can borrow only one book at a time
* System prevents duplicate active borrows
* System calculates costs and overdue fees automatically
* Users can view dashboards and histories

---

## 7. Non‑Functional Requirements

### Performance

* API responses under 500ms on average

### Security

* Password hashing (bcrypt or equivalent)
* JWT/session authentication
* Protected API endpoints

### Usability

* Simple, intuitive UI
* Responsive design
* Clear error messages

---

## 8. Technical Stack

| Component      | Technology                                     |
| -------------- | ---------------------------------------------- |
| Frontend       | HTML, CSS, JavaScript (or framework of choice) |
| Backend        | Node.js (JavaScript/TypeScript)                |
| Database       | PostgreSQL                                     |
| Authentication | JWT or Session‑based                           |

---

## 9. Data Model (High‑Level)

### Entities

* Users
* Books
* Borrows
* Payments

(Refer to the detailed PostgreSQL schema for column‑level definitions.)

---

## 10. API Overview (Sample)

* Authentication: `/auth/signup`, `/auth/login`, `/auth/profile`
* Books: `/books`, `/books/:bookId`
* Borrowing: `/borrow/validate`, `/borrow/calculate`, `/borrow`
* Active Borrows: `/borrows/active`, `/borrows/:borrowId/summary`
* Return: `/borrows/:borrowId/submit`
* History: `/borrows/history`
* Payments: `/payments/history`
* Dashboard: `/dashboard/summary`

---

## 11. Validation & Error Handling

* Empty or invalid input checks
* Prevent negative or zero borrowing days
* Prevent unauthorized access
* Proper HTTP status codes and error messages

---

## 13. Technical Specifications

---

## 13.1 API Specifications

### Authentication APIs

| Endpoint      | Method | Description                | Auth |
| ------------- | ------ | -------------------------- | ---- |
| /auth/signup  | POST   | Register a new student     | No   |
| /auth/login   | POST   | Login and receive JWT      | No   |
| /auth/profile | GET    | Get logged-in user profile | Yes  |

### Books APIs

| Endpoint       | Method | Description            | Auth |
| -------------- | ------ | ---------------------- | ---- |
| /books         | GET    | Get list of all books  | Yes  |
| /books/:bookId | GET    | Get book details by ID | Yes  |

### Borrowing APIs

| Endpoint          | Method | Description                  | Auth |
| ----------------- | ------ | ---------------------------- | ---- |
| /borrow/validate  | POST   | Validate borrow rules        | Yes  |
| /borrow/calculate | POST   | Calculate cost before borrow | Yes  |
| /borrow           | POST   | Borrow a book                | Yes  |

### Active & Return APIs

| Endpoint                   | Method | Description       | Auth |
| -------------------------- | ------ | ----------------- | ---- |
| /borrows/active            | GET    | Get active borrow | Yes  |
| /borrows/:borrowId/summary | GET    | Borrow summary    | Yes  |
| /borrows/:borrowId/submit  | POST   | Return a book     | Yes  |

### History & Dashboard APIs

| Endpoint           | Method | Description       | Auth |
| ------------------ | ------ | ----------------- | ---- |
| /borrows/history   | GET    | Borrow history    | Yes  |
| /payments/history  | GET    | Payment history   | Yes  |
| /dashboard/summary | GET    | Dashboard summary | Yes  |

---

## 13.2 Permission Matrix

| Feature / API  | Guest | Student |
| -------------- | ----- | ------- |
| Signup         | ✅     | ❌       |
| Login          | ✅     | ❌       |
| View Books     | ❌     | ✅       |
| Borrow Book    | ❌     | ✅       |
| Return Book    | ❌     | ✅       |
| View Dashboard | ❌     | ✅       |
| View History   | ❌     | ✅       |
| View Payments  | ❌     | ✅       |

---

## 13.3 Database Model Schemas (PostgreSQL)

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Books Table

```sql
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  group_price_per_day DECIMAL(10,2) NOT NULL,
  available BOOLEAN DEFAULT TRUE
);
```

### Borrows Table

```sql
CREATE TABLE borrows (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id),
  user_id INTEGER REFERENCES users(id),
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  total_cost DECIMAL(10,2) NOT NULL,
  overdue DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) CHECK (status IN ('Active','Returned'))
);
```

### Payments Table

```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('Pending','Paid')),
  date DATE DEFAULT CURRENT_DATE
);
```

---

## 14. Future Enhancements

* Admin/librarian role
* Real payment gateway integration
* Email reminders for due dates
* Multi-book borrowing
* Analytics and reports
