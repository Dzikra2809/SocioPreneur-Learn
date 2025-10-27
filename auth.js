// Authentication functionality
class AuthManager {
  constructor() {
    this.users = this.loadUsers();
  }

  loadUsers() {
    const users = localStorage.getItem('sociopreneur_users');
    return users ? JSON.parse(users) : [];
  }

  saveUsers() {
    localStorage.setItem('sociopreneur_users', JSON.stringify(this.users));
  }

  register(userData) {
    // Check if user already exists
    const existingUser = this.users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('Email sudah terdaftar');
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In real app, this should be hashed
      joinDate: new Date().toISOString(),
      impactPoints: 0,
      enrolledCourses: [],
      completedCourses: [],
      impactHistory: [],
      projects: []
    };

    this.users.push(newUser);
    this.saveUsers();

    return newUser;
  }

  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Email atau password salah');
    }
    return user;
  }

  updateUser(userId, updates) {
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('User tidak ditemukan');
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.saveUsers();
    return this.users[userIndex];
  }
}

// Initialize auth manager
const authManager = new AuthManager();

// Login form handler
function handleLogin(event) {
  event.preventDefault();
  clearFormErrors();

  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');

  // Validation
  if (!email) {
    showFormError('email', 'Email wajib diisi');
    return;
  }

  if (!validateEmail(email)) {
    showFormError('email', 'Format email tidak valid');
    return;
  }

  if (!password) {
    showFormError('password', 'Password wajib diisi');
    return;
  }

  try {
    const user = authManager.login(email, password);
    app.currentUser = user;
    app.saveUserSession();
    app.addImpactPoints(10, 'Login ke platform');
    
    app.showNotification('Login berhasil!', 'success');
    
    // Redirect to dashboard or previous page
    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'dashboard.html';
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1000);

  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Signup form handler
function handleSignup(event) {
  event.preventDefault();
  clearFormErrors();

  const formData = new FormData(event.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  // Validation
  if (!name) {
    showFormError('name', 'Nama wajib diisi');
    return;
  }

  if (!email) {
    showFormError('email', 'Email wajib diisi');
    return;
  }

  if (!validateEmail(email)) {
    showFormError('email', 'Format email tidak valid');
    return;
  }

  if (!password) {
    showFormError('password', 'Password wajib diisi');
    return;
  }

  if (!validatePassword(password)) {
    showFormError('password', 'Password minimal 6 karakter');
    return;
  }

  if (password !== confirmPassword) {
    showFormError('confirmPassword', 'Konfirmasi password tidak cocok');
    return;
  }

  try {
    const user = authManager.register({ name, email, password });
    app.currentUser = user;
    app.saveUserSession();
    app.addImpactPoints(50, 'Bergabung dengan platform');
    
    app.showNotification('Registrasi berhasil! Selamat datang!', 'success');
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);

  } catch (error) {
    app.showNotification(error.message, 'error');
  }
}

// Check authentication for protected pages
function requireAuth() {
  if (!app.currentUser) {
    const currentPage = window.location.pathname;
    window.location.href = `login.html?redirect=${encodeURIComponent(currentPage)}`;
    return false;
  }
  return true;
}

// Initialize auth forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});