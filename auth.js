// User authentication handling
class Auth {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    register(username, email, password) {
        // Check if user already exists
        if (this.users.find(user => user.email === email)) {
            throw new Error('User already exists');
        }

        // Create new user
        const user = {
            id: Date.now().toString(),
            username,
            email,
            password: this.hashPassword(password), // In a real app, use proper password hashing
            createdAt: new Date().toISOString(),
            assessments: []
        };

        this.users.push(user);
        localStorage.setItem('users', JSON.stringify(this.users));
        return user;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email);
        if (!user || user.password !== this.hashPassword(password)) {
            throw new Error('Invalid credentials');
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Simple password hashing (for demo purposes only)
    // In a real application, use proper password hashing like bcrypt
    hashPassword(password) {
        return btoa(password); // Base64 encoding (NOT secure for production)
    }

    addAssessment(assessment) {
        if (!this.currentUser) return;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return;

        this.users[userIndex].assessments.push({
            ...assessment,
            date: new Date().toISOString()
        });

        this.currentUser = this.users[userIndex];
        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }

    getAssessments() {
        return this.currentUser?.assessments || [];
    }
}

// Initialize auth
const auth = new Auth();

// Auth UI handling
function showAuthSection(section) {
    document.querySelectorAll('.auth-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    try {
        auth.register(username, email, password);
        auth.login(email, password);
        showSection('home');
        updateAuthUI();
    } catch (error) {
        alert(error.message);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        auth.login(email, password);
        showSection('home');
        updateAuthUI();
    } catch (error) {
        alert(error.message);
    }
}

function handleLogout() {
    auth.logout();
    showSection('login');
    updateAuthUI();
}

function updateAuthUI() {
    const user = auth.getCurrentUser();
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');

    if (user) {
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        document.getElementById('userName').textContent = user.username;
    } else {
        authButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}

// Initialize auth UI
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Add event listeners
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutButton').addEventListener('click', handleLogout);
    
    // Show login by default if not authenticated
    if (!auth.isAuthenticated()) {
        showSection('login');
    }
}); 