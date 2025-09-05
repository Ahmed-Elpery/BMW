// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdMEk0GZuRbCV-Zx4RLTFMeGygN11L3xs",
    authDomain: "bmw-6dfe5.firebaseapp.com",
    projectId: "bmw-6dfe5",
    storageBucket: "bmw-6dfe5.firebasestorage.app",
    messagingSenderId: "1032844863678",
    appId: "1:1032844863678:web:bc2cb2e4ef3ebae63ad6ef",
    measurementId: "G-6Z88ZTLLZF"
};

// Initialize Firebase
let auth, db;
try {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
    } else {
        console.log("Firebase already initialized");
    }
    
    // Initialize Firebase services
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase services initialized");
} catch (error) {
    console.error("Error initializing Firebase:", error);
    // Display error on page for debugging
    const registerError = document.getElementById('registerError');
    if (registerError) {
        registerError.textContent = "Firebase initialization error: " + error.message;
    }
}

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginTab = document.querySelector('.tab[data-tab="login"]');
const registerTab = document.querySelector('.tab[data-tab="register"]');
const loginError = document.getElementById('loginError');
const registerError = document.getElementById('registerError');
const forgotPasswordLink = document.getElementById('forgotPassword');
const rememberMeCheckbox = document.getElementById('rememberMe');
const registerPassword = document.getElementById('registerPassword');
const strengthMeter = document.getElementById('strength-meter-fill');
const strengthText = document.getElementById('password-strength-text');
const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const googleRegisterBtn = document.getElementById('googleRegister');
const facebookRegisterBtn = document.getElementById('facebookRegister');

// Tab switching functionality
loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    clearErrors();
});

registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    clearErrors();
});

// Clear error messages
function clearErrors() {
    loginError.textContent = '';
    registerError.textContent = '';
}

// Check if user has selected "Remember me" previously
window.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }
});

// Login functionality
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = rememberMeCheckbox.checked;
    
    loginError.textContent = '';
    
    if (!auth) {
        loginError.textContent = "Authentication service not available";
        console.error("Auth service not initialized");
        return;
    }
    
    // Handle "Remember me" functionality
    if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
    
    // Set persistence based on "Remember me" selection
    const persistence = rememberMe ? 
        firebase.auth.Auth.Persistence.LOCAL : 
        firebase.auth.Auth.Persistence.SESSION;
    
    auth.setPersistence(persistence)
        .then(() => {
            return auth.signInWithEmailAndPassword(email, password);
        })
        .then((userCredential) => {
            // Redirect to profile page after successful login
            window.location.href = 'profile.html';
        })
        .catch((error) => {
            console.error("Login error:", error);
            switch(error.code) {
                case 'auth/user-not-found':
                    loginError.textContent = 'No account found with this email.';
                    break;
                case 'auth/wrong-password':
                    loginError.textContent = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    loginError.textContent = 'Invalid email format.';
                    break;
                default:
                    loginError.textContent = `Login failed: ${error.message}`;
            }
        });
});

/**
 * Register a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} name - User's full name
 * @returns {Promise} - Promise that resolves with the user credential
 */
function registerUser(email, password, name) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User created successfully:', userCredential.user.uid);
            // Store additional user data in Firestore
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                // Update display name
                return userCredential.user.updateProfile({
                    displayName: name
                }).then(() => userCredential);
            });
        });
}

// Registration functionality
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Registration form submitted');
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsCheck = document.getElementById('termsCheck').checked;
    
    registerError.textContent = '';
    
    // Check if Firebase is initialized
    if (!auth || !db) {
        registerError.textContent = "Authentication service not available";
        console.error("Firebase services not initialized");
        return;
    }
    
    // Validation
    if (password.length < 8) {
        registerError.textContent = 'Password must be at least 8 characters long.';
        return;
    }
    
    if (password !== confirmPassword) {
        registerError.textContent = 'Passwords do not match.';
        return;
    }
    
    if (!termsCheck) {
        registerError.textContent = 'You must agree to the Terms and Conditions.';
        return;
    }
    
    console.log('Validation passed, attempting to create user...');
    
    // Create user with email and password using our registerUser function
    registerUser(email, password, name)
        .then(() => {
            console.log('Display name updated, redirecting to profile page');
            // Redirect to profile page after successful registration
            window.location.href = 'profile.html';
        })
        .catch((error) => {
            console.error('Registration error:', error);
            switch(error.code) {
                case 'auth/email-already-in-use':
                    registerError.textContent = 'Email already in use.';
                    break;
                case 'auth/invalid-email':
                    registerError.textContent = 'Invalid email format.';
                    break;
                case 'auth/weak-password':
                    registerError.textContent = 'Password is too weak.';
                    break;
                case 'auth/network-request-failed':
                    registerError.textContent = 'Network error. Please check your internet connection.';
                    break;
                case 'auth/operation-not-allowed':
                    registerError.textContent = 'Email/password registration is not enabled.';
                    break;
                default:
                    registerError.textContent = `Registration failed: ${error.message}`;
            }
        });
});

// Password reset functionality
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    
    if (!email) {
        loginError.textContent = 'Please enter your email address.';
        return;
    }
    
    if (!auth) {
        loginError.textContent = "Authentication service not available";
        console.error("Auth service not initialized");
        return;
    }
    
    auth.sendPasswordResetEmail(email)
        .then(() => {
            loginError.textContent = '';
            alert('Password reset email sent. Please check your inbox.');
        })
        .catch((error) => {
            console.error("Password reset error:", error);
            switch(error.code) {
                case 'auth/user-not-found':
                    loginError.textContent = 'No account found with this email.';
                    break;
                case 'auth/invalid-email':
                    loginError.textContent = 'Invalid email format.';
                    break;
                default:
                    loginError.textContent = `Failed to send reset email: ${error.message}`;
            }
        });
});

// Check authentication state on page load
if (auth) {
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is signed in:', user.uid);
            // User is signed in, redirect to profile page
            // Uncomment the line below if you want automatic redirection
            // window.location.href = 'profile.html';
        } else {
            console.log('No user is signed in.');
        }
    });
} else {
    console.error("Cannot check authentication state - auth not initialized");
}

// Password strength checker
registerPassword.addEventListener('input', () => {
    const password = registerPassword.value;
    const { score, feedback } = calculatePasswordStrength(password);
    
    // Update strength meter
    strengthMeter.className = '';
    strengthText.textContent = feedback.suggestion || feedback.warning || 'Password strength';
    
    if (password.length === 0) {
        strengthMeter.style.width = '0%';
        return;
    }
    
    switch (score) {
        case 0:
        case 1:
            strengthMeter.classList.add('strength-weak');
            strengthText.textContent = 'Weak password';
            break;
        case 2:
            strengthMeter.classList.add('strength-fair');
            strengthText.textContent = 'Fair password';
            break;
        case 3:
            strengthMeter.classList.add('strength-good');
            strengthText.textContent = 'Good password';
            break;
        case 4:
            strengthMeter.classList.add('strength-strong');
            strengthText.textContent = 'Strong password';
            break;
    }
});

// Calculate password strength
function calculatePasswordStrength(password) {
    // Basic password strength calculation
    let score = 0;
    const feedback = { warning: '', suggestion: '' };
    
    if (password.length === 0) {
        return { score, feedback };
    }
    
    // Length check
    if (password.length < 8) {
        score = 0;
        feedback.warning = 'Password is too short';
        feedback.suggestion = 'Use at least 8 characters';
        return { score, feedback };
    } else {
        score += 1;
    }
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 0.5;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1.5;
    
    // Repeated characters penalty
    const repeats = password.match(/(.)\1{2,}/g);
    if (repeats) score -= 0.5;
    
    // Normalize score
    score = Math.max(0, Math.min(4, Math.floor(score)));
    
    // Add feedback based on score
    if (score < 3) {
        if (!/[A-Z]/.test(password)) {
            feedback.suggestion = 'Add uppercase letters';
        } else if (!/[0-9]/.test(password)) {
            feedback.suggestion = 'Add numbers';
        } else if (!/[^A-Za-z0-9]/.test(password)) {
            feedback.suggestion = 'Add special characters';
        }
    }
    
    return { score, feedback };
}

// Social login - Google
function handleGoogleLogin() {
    if (!auth) {
        loginError.textContent = "Authentication service not available";
        return;
    }
    
    const provider = new firebase.auth.GoogleAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            
            // Check if this is a new user
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Create a user document in Firestore
                return db.collection('users').doc(user.uid).set({
                    name: user.displayName || '',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    window.location.href = 'profile.html';
                });
            } else {
                window.location.href = 'profile.html';
            }
        })
        .catch((error) => {
            console.error("Google sign-in error:", error);
            loginError.textContent = `Google sign-in failed: ${error.message}`;
        });
}

// Social login - Facebook
function handleFacebookLogin() {
    if (!auth) {
        loginError.textContent = "Authentication service not available";
        return;
    }
    
    const provider = new firebase.auth.FacebookAuthProvider();
    
    auth.signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            
            // Check if this is a new user
            const isNewUser = result.additionalUserInfo.isNewUser;
            
            if (isNewUser) {
                // Create a user document in Firestore
                return db.collection('users').doc(user.uid).set({
                    name: user.displayName || '',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    window.location.href = 'profile.html';
                });
            } else {
                window.location.href = 'profile.html';
            }
        })
        .catch((error) => {
            console.error("Facebook sign-in error:", error);
            loginError.textContent = `Facebook sign-in failed: ${error.message}`;
        });
}

// Add event listeners for social login buttons
googleLoginBtn.addEventListener('click', handleGoogleLogin);
facebookLoginBtn.addEventListener('click', handleFacebookLogin);
googleRegisterBtn.addEventListener('click', handleGoogleLogin);
facebookRegisterBtn.addEventListener('click', handleFacebookLogin); 