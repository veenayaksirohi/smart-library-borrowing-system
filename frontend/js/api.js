// API Configuration and Helper Functions
const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Get headers with auth token
function getHeaders(isFormData = false) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// API Helper Functions
const api = {
  // Auth endpoints
  signup: async (name, email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password }),
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  // Book endpoints
  getBooks: async (page = 1, limit = 10, search = '') => {
    const url = `${API_BASE_URL}/books?page=${page}&limit=${limit}&search=${search}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getBook: async (bookId) => {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  // Borrow endpoints
  validateBorrow: async (bookId) => {
    const response = await fetch(`${API_BASE_URL}/borrow/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId }),
    });
    return response.json();
  },

  calculateCost: async (bookId, daysToKeep) => {
    const response = await fetch(`${API_BASE_URL}/borrow/calculate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, daysToKeep }),
    });
    return response.json();
  },

  borrowBook: async (bookId, daysToKeep) => {
    const response = await fetch(`${API_BASE_URL}/borrow`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bookId, daysToKeep }),
    });
    return response.json();
  },

  getActiveBorrows: async () => {
    const response = await fetch(`${API_BASE_URL}/borrow/active`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getBorrowHistory: async (page = 1, limit = 10) => {
    const url = `${API_BASE_URL}/borrow/history?page=${page}&limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  submitReturn: async (borrowId) => {
    const response = await fetch(`${API_BASE_URL}/borrow/${borrowId}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return response.json();
  },

  // Payment endpoints
  getPaymentHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/payments/history`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getDashboardSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/payments/dashboard/summary`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  completePayment: async (paymentId) => {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({}),
    });
    return response.json();
  },
};

// Helper Functions
function showMessage(message, type = 'success') {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

function isAuthenticated() {
  return !!getAuthToken();
}

function redirectIfNotAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  window.location.href = 'login.html';
}
