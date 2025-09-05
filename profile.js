// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCdMEk0GZuRbCV-Zx4RLTFMeGygN11L3xs",
    authDomain: "bmw-6dfe5.firebaseapp.com",
    projectId: "bmw-6dfe5",
    storageBucket: "bmw-6dfe5.appspot.com",
    messagingSenderId: "1032844863678",
    appId: "1:1032844863678:web:bc2cb2e4ef3ebae63ad6ef",
    measurementId: "G-6Z88ZTLLZF"
};

// Security enhancement: Set auth persistence to session only
// This ensures that auth state is cleared when the browser window is closed
firebase.auth.Auth.Persistence.SESSION;

// Initialize Firebase
try {
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully");
        
        // Set persistence to session (more secure than LOCAL)
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .catch((error) => {
                console.error("Error setting auth persistence:", error);
            });
    } else {
        console.log("Firebase already initialized");
    }
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Security enhancement: Validate auth token periodically
let tokenRefreshInterval;

function startTokenRefresh() {
    // Refresh token every 30 minutes
    tokenRefreshInterval = setInterval(() => {
        const user = auth.currentUser;
        if (user) {
            user.getIdToken(true)
                .then(() => {
                    console.log("Auth token refreshed");
                })
                .catch((error) => {
                    console.error("Error refreshing token:", error);
                    // Force re-authentication if token refresh fails
                    auth.signOut().then(() => {
                        window.location.href = 'auth.html?session_expired=true';
                    });
                });
        }
    }, 30 * 60 * 1000); // 30 minutes
}

function stopTokenRefresh() {
    if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
    }
}

// Security enhancement: Implement session timeout
let inactivityTimer;
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        console.log("Session timeout due to inactivity");
        auth.signOut().then(() => {
            window.location.href = 'auth.html?session_expired=true';
        });
    }, SESSION_TIMEOUT);
}

// Monitor user activity
function setupActivityMonitoring() {
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, false);
    });
    resetInactivityTimer();
}

// Performance optimization: Lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Intersection Observer for lazy loading
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                    console.log('Lazy loaded image:', img.alt || 'unnamed image');
                }
            });
        }, {
            rootMargin: '0px 0px 200px 0px' // Load images when they're 200px from viewport
        });
        
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers that don't support Intersection Observer
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
    
    // Convert normal image tags to lazy loaded
    const normalImages = document.querySelectorAll('img:not([data-src])');
    normalImages.forEach(img => {
        // Don't modify if it's a crucial above-the-fold image
        if (!img.classList.contains('critical-image') && img.src) {
            img.setAttribute('data-src', img.src);
            img.setAttribute('loading', 'lazy');
            img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
        }
    });
});

// DOM Elements
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const userCreated = document.getElementById('user-created');
const editProfileBtn = document.getElementById('edit-profile-btn');
const logoutBtn = document.getElementById('logout-btn');
const preferredSeries = document.getElementById('preferred-series');
const notificationToggle = document.getElementById('notification-toggle');
const savePreferencesBtn = document.getElementById('save-preferences-btn');
const savedCarsList = document.getElementById('saved-cars-list');
const setup2faBtn = document.getElementById('setup-2fa-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const viewHistoryBtn = document.getElementById('view-history-btn');
const twoFAStatus = document.getElementById('2fa-status');
const passwordChanged = document.getElementById('password-changed');
const lastLogin = document.getElementById('last-login');
const newPassword = document.getElementById('new-password');
const newPasswordStrength = document.getElementById('new-password-strength');
const newPasswordStrengthText = document.getElementById('new-password-strength-text');
const changePasswordForm = document.getElementById('change-password-form');
const passwordChangeError = document.getElementById('password-change-error');
const loginHistoryList = document.getElementById('login-history-list');
const profileImage = document.getElementById('profile-image');
const avatarUpload = document.getElementById('avatar-upload');
const changeCoverBtn = document.getElementById('change-cover-btn');

// DOM Elements for modals and forms
const editProfileModal = document.getElementById('edit-profile-modal');
const editPreferencesModal = document.getElementById('edit-preferences-modal');
const addCarModal = document.getElementById('add-car-modal');
const setup2faModal = document.getElementById('setup-2fa-modal');
const changePasswordModal = document.getElementById('change-password-modal');
const loginHistoryModal = document.getElementById('login-history-modal');
const modalOverlay = document.getElementById('modal-overlay');
const formTabs = document.querySelectorAll('.form-tab');
const closeModalButtons = document.querySelectorAll('.close-modal');
const cancelButtons = document.querySelectorAll('.cancel-edit');

// Default profile image
const DEFAULT_PROFILE_IMAGE = 'https://via.placeholder.com/150?text=BMW';
const LOADING_PROFILE_IMAGE = 'https://via.placeholder.com/150?text=Loading...';

// Handle profile image error
profileImage.addEventListener('error', function() {
    console.log('Profile image failed to load, using default image');
    this.src = DEFAULT_PROFILE_IMAGE;
});

// Security enhancement: Store sensitive operations audit log
function logSensitiveOperation(operation, details = {}) {
    const user = auth.currentUser;
    if (!user) return;
    
    const logEntry = {
        operation: operation,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
        ipAddress: 'client-side-log', // In a real app, this would be captured server-side
        userAgent: navigator.userAgent,
        ...details
    };
    
    db.collection('securityLogs').add(logEntry)
        .catch(error => {
            console.error('Error logging sensitive operation:', error);
        });
}

// Load profile image from various sources
function loadProfileImage(user) {
    // Set loading image first
    profileImage.src = LOADING_PROFILE_IMAGE;
    
    // First check Firestore as the source of truth
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists && doc.data().photoURL) {
                console.log('Loading profile image from Firestore');
                profileImage.src = doc.data().photoURL;
                
                // Also update Auth for consistency if needed
                if (user.photoURL !== doc.data().photoURL) {
                    user.updateProfile({
                        photoURL: doc.data().photoURL
                    }).catch(error => {
                        console.error('Error updating Auth photoURL:', error);
                    });
                }
                
                // Update localStorage cache
                try {
                    localStorage.setItem('userProfileImage', doc.data().photoURL);
                } catch (e) {
                    console.error('Failed to cache profile image URL:', e);
                }
                
                return;
            }
            
            // If not in Firestore, try Auth photoURL
            if (user.photoURL) {
                console.log('Loading profile image from Auth photoURL');
                profileImage.src = user.photoURL;
                
                // Save to Firestore for next login
                db.collection('users').doc(user.uid).update({
                    photoURL: user.photoURL,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(error => {
                    console.error('Error updating Firestore photoURL:', error);
                });
                
                // Update localStorage cache
                try {
                    localStorage.setItem('userProfileImage', user.photoURL);
                } catch (e) {
                    console.error('Failed to cache profile image URL:', e);
                }
                
                return;
            }
            
            // If not in Firestore or Auth, try localStorage
            const cachedImageURL = localStorage.getItem('userProfileImage');
            if (cachedImageURL) {
                console.log('Loading profile image from localStorage');
                profileImage.src = cachedImageURL;
                
                // Update Auth and Firestore for consistency
                user.updateProfile({
                    photoURL: cachedImageURL
                }).catch(error => {
                    console.error('Error updating Auth photoURL:', error);
                });
                
                db.collection('users').doc(user.uid).update({
                    photoURL: cachedImageURL,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).catch(error => {
                    console.error('Error updating Firestore photoURL:', error);
                });
                
                return;
            }
            
            // If all else fails, use default image
            console.log('No profile image found, using default');
            profileImage.src = DEFAULT_PROFILE_IMAGE;
        })
        .catch(error => {
            console.error('Error loading profile image from Firestore:', error);
            
            // Try Auth photoURL as fallback
            if (user.photoURL) {
                profileImage.src = user.photoURL;
                return;
            }
            
            // Try localStorage as fallback
            const cachedImageURL = localStorage.getItem('userProfileImage');
            if (cachedImageURL) {
                profileImage.src = cachedImageURL;
            } else {
                profileImage.src = DEFAULT_PROFILE_IMAGE;
            }
        });
}

// Profile Image Upload Functionality
avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Security enhancement: Additional file validation
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
        showNotification('Please select a valid image file (JPEG, PNG, GIF, WEBP).', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
        showNotification('Image size should be less than 5MB.', 'error');
        return;
    }
    
    // Security enhancement: Scan file metadata for XSS
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const arrayBuffer = event.target.result;
        // Simple check for HTML content in image (more comprehensive checks would be done server-side)
        const byteArray = new Uint8Array(arrayBuffer.slice(0, 1000)); // Check first 1000 bytes
        const headerText = String.fromCharCode.apply(null, byteArray);
        
        if (headerText.includes('<script>') || headerText.includes('javascript:') || 
            headerText.includes('<iframe') || headerText.includes('<img') || 
            headerText.includes('<svg')) {
            showNotification('Invalid image file detected.', 'error');
            return;
        }
        
        // Proceed with upload if checks pass
        uploadProfileImage(file);
    };
    
    fileReader.readAsArrayBuffer(file);
});

// Security enhancement: Separate function for image upload
function uploadProfileImage(file) {
    const user = auth.currentUser;
    if (!user) return;
    
    // Store current image URL as fallback
    const currentImageUrl = profileImage.src;
    
    // Show loading state
    profileImage.src = LOADING_PROFILE_IMAGE;
    
    // Create a storage reference
    const storageRef = storage.ref();
    const profileImageRef = storageRef.child(`users/${user.uid}/profile_image`);
    
    // Add metadata to the file (for security)
    const metadata = {
        contentType: file.type,
        customMetadata: {
            'uploadedBy': user.uid,
            'uploadedAt': new Date().toISOString()
        }
    };
    
    console.log('Starting profile image upload...');
    
    // Upload file
    const uploadTask = profileImageRef.put(file, metadata);
    
    // Monitor upload progress
    uploadTask.on('state_changed', 
        (snapshot) => {
            // Progress monitoring if needed
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
        }, 
        (error) => {
            // Error handling
            console.error('Error uploading image:', error);
            profileImage.src = currentImageUrl || DEFAULT_PROFILE_IMAGE; // Restore previous image or use default
            showNotification('Failed to upload profile image.', 'error');
            
            // Log security event
            logSensitiveOperation('profile_image_upload_failed', { error: error.message });
        }, 
        () => {
            // Upload completed successfully
            console.log('Upload completed, getting download URL...');
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log('Download URL received:', downloadURL);
                
                // Update profile image in UI
                profileImage.src = downloadURL;
                
                // Update user profile in Auth
                user.updateProfile({
                    photoURL: downloadURL
                }).then(() => {
                    console.log('Profile image updated successfully in Auth');
                }).catch((error) => {
                    console.error('Error updating profile image in auth:', error);
                });
                
                // Save URL to Firestore to ensure it appears on login
                db.collection('users').doc(user.uid).update({
                    photoURL: downloadURL,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    showNotification('Profile image updated successfully!');
                    
                    // Cache the image URL in localStorage as a backup
                    try {
                        localStorage.setItem('userProfileImage', downloadURL);
                    } catch (e) {
                        console.error('Failed to cache profile image URL:', e);
                    }
                    
                    // Log security event
                    logSensitiveOperation('profile_image_updated');
                }).catch((error) => {
                    console.error('Error updating profile image in Firestore:', error);
                });
            }).catch(error => {
                console.error('Error getting download URL:', error);
                profileImage.src = currentImageUrl || DEFAULT_PROFILE_IMAGE;
                showNotification('Failed to process uploaded image.', 'error');
            });
        }
    );
}

// Cover Photo Upload Functionality
changeCoverBtn.addEventListener('click', () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Trigger click on the file input
    fileInput.click();
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            document.body.removeChild(fileInput);
            return;
        }
        
        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validImageTypes.includes(file.type)) {
            showNotification('Please select a valid image file (JPEG, PNG, GIF, WEBP).', 'error');
            document.body.removeChild(fileInput);
            return;
        }
        
        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            showNotification('Image size should be less than 10MB.', 'error');
            document.body.removeChild(fileInput);
            return;
        }
        
        const user = auth.currentUser;
        if (!user) {
            document.body.removeChild(fileInput);
            return;
        }
        
        // Show loading state
        const coverPhoto = document.querySelector('.cover-photo');
        coverPhoto.style.backgroundImage = 'url(https://via.placeholder.com/1200x300?text=Loading...)';
        
        // Create a storage reference
        const storageRef = storage.ref();
        const coverPhotoRef = storageRef.child(`users/${user.uid}/cover_photo`);
        
        // Upload file
        const uploadTask = coverPhotoRef.put(file);
        
        // Monitor upload progress
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Progress monitoring if needed
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Cover upload is ' + progress + '% done');
            }, 
            (error) => {
                // Error handling
                console.error('Error uploading cover photo:', error);
                coverPhoto.style.backgroundImage = '';
                showNotification('Failed to upload cover photo.', 'error');
                document.body.removeChild(fileInput);
            }, 
            () => {
                // Upload completed successfully
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    // Update cover photo in UI
                    coverPhoto.style.backgroundImage = `url(${downloadURL})`;
                    
                    // Save URL to Firestore
                    db.collection('users').doc(user.uid).update({
                        coverPhotoURL: downloadURL,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(() => {
                        showNotification('Cover photo updated successfully!');
                    }).catch((error) => {
                        console.error('Error updating cover photo in Firestore:', error);
                    });
                    
                    document.body.removeChild(fileInput);
                });
            }
        );
    });
});

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (user) {
        // Security enhancement: Verify email verification status
        if (user.emailVerified) {
            console.log('=== PROFILE DEBUGGING ===');
            console.log('User authenticated:', user.uid);
            console.log('Email:', user.email);
            console.log('Storage bucket:', storage.app.options.storageBucket);
            
            // User is signed in and email is verified, load profile data
            loadUserProfile(user);
            loadProfileImage(user);
            loadUserPreferences(user);
            loadSavedCars(user);
            loadSecurityInfo(user);
            
            // Run storage tests after a short delay
            setTimeout(testStorageAccess, 1000);
            
            // Record login in history
            recordLoginHistory(user);
            
            // Setup security measures
            startTokenRefresh();
            setupActivityMonitoring();
        } else {
            // Email not verified, redirect to verification page
            window.location.href = 'auth.html?verify=true';
        }
    } else {
        // User is not signed in, redirect to login page
        window.location.href = 'auth.html';
    }
});

// Load user profile data
function loadUserProfile(user) {
    // Display email from auth
    userEmail.textContent = user.email;
    
    // Get additional user data from Firestore
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Display name
                userName.textContent = userData.name || 'Not set';
                
                // Set cover photo if available
                if (userData.coverPhotoURL) {
                    const coverPhoto = document.querySelector('.cover-photo');
                    coverPhoto.style.backgroundImage = `url(${userData.coverPhotoURL})`;
                }
                
                // Format and display creation date
                if (userData.createdAt) {
                    const createdDate = userData.createdAt.toDate();
                    const options = { year: 'numeric', month: 'long', day: 'numeric' };
                    userCreated.textContent = createdDate.toLocaleDateString('en-US', options);
                } else {
                    userCreated.textContent = 'Not available';
                }
                
                // Set location if available
                if (userData.location) {
                    document.getElementById('user-location').textContent = userData.location;
                }
                
                // Set bio if available
                if (userData.bio) {
                    document.getElementById('user-bio').textContent = userData.bio;
                }
                
                // Set occupation if available
                if (userData.occupation) {
                    document.getElementById('user-occupation').textContent = userData.occupation;
                }
                
                // Set company if available
                if (userData.company) {
                    document.getElementById('user-company').textContent = userData.company;
                }
                
                // Set website link if available
                const websiteLink = document.getElementById('user-website-link');
                if (userData.website) {
                    websiteLink.href = userData.website;
                    websiteLink.classList.remove('hidden');
                } else {
                    websiteLink.classList.add('hidden');
                }
                
                // Set LinkedIn link if available
                const linkedinLink = document.getElementById('user-linkedin-link');
                if (userData.linkedin) {
                    linkedinLink.href = userData.linkedin;
                    linkedinLink.classList.remove('hidden');
                } else {
                    linkedinLink.classList.add('hidden');
                }
                
                // Add professional details section if available
                if (userData.professionalDetails && 
                   (userData.professionalDetails.skills || 
                    userData.professionalDetails.education || 
                    userData.professionalDetails.experience)) {
                    
                    // Check if professional details section already exists
                    let professionalSection = document.getElementById('professional-details-section');
                    
                    if (!professionalSection) {
                        // Create professional details section
                        professionalSection = document.createElement('section');
                        professionalSection.id = 'professional-details-section';
                        professionalSection.className = 'profile-section professional-details';
                        
                        const profileContent = document.querySelector('.profile-content');
                        profileContent.insertBefore(professionalSection, profileContent.firstChild);
                    }
                    
                    // Build the professional details content
                    let professionalHTML = `
                        <div class="section-header">
                            <h2>Professional Details</h2>
                        </div>
                        <div class="professional-details-content">
                    `;
                    
                    if (userData.professionalDetails.skills) {
                        const skillsList = userData.professionalDetails.skills.split(',').map(skill => 
                            `<span class="skill-tag">${skill.trim()}</span>`
                        ).join('');
                        
                        professionalHTML += `
                            <div class="professional-item">
                                <h3>Skills</h3>
                                <div class="skills-container">
                                    ${skillsList}
                                </div>
                            </div>
                        `;
                    }
                    
                    if (userData.professionalDetails.education) {
                        professionalHTML += `
                            <div class="professional-item">
                                <h3>Education</h3>
                                <p>${userData.professionalDetails.education}</p>
                            </div>
                        `;
                    }
                    
                    if (userData.professionalDetails.experience) {
                        professionalHTML += `
                            <div class="professional-item">
                                <h3>Experience</h3>
                                <p>${userData.professionalDetails.experience}</p>
                            </div>
                        `;
                    }
                    
                    professionalHTML += `</div>`;
                    professionalSection.innerHTML = professionalHTML;
                }
            } else {
                // No user document found
                userName.textContent = user.displayName || 'Not set';
                userCreated.textContent = 'Not available';
                
                // Create user document if it doesn't exist
                db.collection('users').doc(user.uid).set({
                    name: user.displayName || '',
                    email: user.email,
                    photoURL: user.photoURL || '',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        })
        .catch((error) => {
            console.error('Error loading user profile:', error);
            userName.textContent = user.displayName || 'Not set';
            userCreated.textContent = 'Not available';
        });
}

// Load user preferences
function loadUserPreferences(user) {
    db.collection('users').doc(user.uid).collection('preferences').doc('settings').get()
        .then((doc) => {
            if (doc.exists) {
                const prefs = doc.data();
                
                // Set preferred series
                if (prefs.preferredSeries) {
                    preferredSeries.value = prefs.preferredSeries;
                }
                
                // Set notification preference
                if (prefs.notifications !== undefined) {
                    notificationToggle.checked = prefs.notifications;
                }
            } else {
                // Create default preferences if they don't exist
                saveUserPreferences();
            }
        })
        .catch((error) => {
            console.error('Error loading preferences:', error);
        });
}

// Save user preferences
function saveUserPreferences() {
    const user = auth.currentUser;
    if (!user) return;
    
    const preferences = {
        preferredSeries: preferredSeries.value,
        notifications: notificationToggle.checked,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('users').doc(user.uid).collection('preferences').doc('settings').set(preferences)
        .then(() => {
            showNotification('Preferences saved successfully!');
            
            // Log non-sensitive operation
            logSensitiveOperation('preferences_updated');
        })
        .catch((error) => {
            console.error('Error saving preferences:', error);
            showNotification('Failed to save preferences.', 'error');
        });
}

// Load saved cars
function loadSavedCars(user) {
    db.collection('users').doc(user.uid).collection('savedCars').get()
        .then((snapshot) => {
            if (snapshot.empty) {
                // No saved cars
                savedCarsList.innerHTML = '<p class="empty-state">No saved cars yet.</p>';
                return;
            }
            
            // Clear the list
            savedCarsList.innerHTML = '';
            
            // Add each car to the list
            snapshot.forEach((doc) => {
                const car = doc.data();
                const carCard = document.createElement('div');
                carCard.className = 'car-card';
                carCard.innerHTML = `
                    <div class="car-image">
                        <img src="${car.image || 'photos/bmw-m4-coupe-lci-flyout1.avif'}" alt="${car.model}">
                    </div>
                    <div class="car-details">
                        <h4>${car.model}</h4>
                        <p>${car.year || ''}</p>
                    </div>
                `;
                savedCarsList.appendChild(carCard);
            });
        })
        .catch((error) => {
            console.error('Error loading saved cars:', error);
            savedCarsList.innerHTML = '<p class="empty-state">Error loading saved cars.</p>';
        });
}

// Show notification
function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide and remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Edit profile
editProfileBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) return;
    
    // Show edit profile modal
    document.getElementById('edit-profile-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
    
    // Get current user data
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Populate form with current values
                document.getElementById('edit-name').value = userData.name || '';
                document.getElementById('edit-bio').value = userData.bio || '';
                document.getElementById('edit-location').value = userData.location || '';
                document.getElementById('edit-occupation').value = userData.occupation || '';
                document.getElementById('edit-company').value = userData.company || '';
                document.getElementById('edit-website').value = userData.website || '';
                document.getElementById('edit-linkedin').value = userData.linkedin || '';
                
                // Set professional details if available
                if (userData.professionalDetails) {
                    document.getElementById('edit-skills').value = userData.professionalDetails.skills || '';
                    document.getElementById('edit-education').value = userData.professionalDetails.education || '';
                    document.getElementById('edit-experience').value = userData.professionalDetails.experience || '';
                }
            }
        })
        .catch((error) => {
            console.error('Error loading user data for edit:', error);
        });
});

// Tab switching for edit profile form
document.querySelectorAll('.form-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and sections
        document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.form-section').forEach(s => s.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding section
        const targetSection = document.getElementById(`${tab.getAttribute('data-tab')}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

// Handle edit profile form submission
document.getElementById('edit-profile-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    // Get form values
    const newName = document.getElementById('edit-name').value.trim();
    const newBio = document.getElementById('edit-bio').value.trim();
    const newLocation = document.getElementById('edit-location').value.trim();
    const newOccupation = document.getElementById('edit-occupation').value.trim();
    const newCompany = document.getElementById('edit-company').value.trim();
    const newWebsite = document.getElementById('edit-website').value.trim();
    const newLinkedin = document.getElementById('edit-linkedin').value.trim();
    const newSkills = document.getElementById('edit-skills').value.trim();
    const newEducation = document.getElementById('edit-education').value.trim();
    const newExperience = document.getElementById('edit-experience').value.trim();
    
    // Validate name
    if (!newName) {
        showNotification('Name cannot be empty.', 'error');
        return;
    }
    
    // Security enhancement: Validate and sanitize inputs
    if (newWebsite && !isValidUrl(newWebsite)) {
        showNotification('Please enter a valid website URL.', 'error');
        return;
    }
    
    if (newLinkedin && !isValidUrl(newLinkedin)) {
        showNotification('Please enter a valid LinkedIn URL.', 'error');
        return;
    }
    
    // Sanitize all inputs to prevent XSS
    const sanitizedBio = sanitizeInput(newBio);
    const sanitizedLocation = sanitizeInput(newLocation);
    const sanitizedOccupation = sanitizeInput(newOccupation);
    const sanitizedCompany = sanitizeInput(newCompany);
    const sanitizedSkills = sanitizeInput(newSkills);
    const sanitizedEducation = sanitizeInput(newEducation);
    const sanitizedExperience = sanitizeInput(newExperience);
    
    // Update user data
    const updatedData = {
        name: sanitizeInput(newName),
        bio: sanitizedBio,
        location: sanitizedLocation,
        occupation: sanitizedOccupation,
        company: sanitizedCompany,
        website: newWebsite, // URLs are already validated
        linkedin: newLinkedin, // URLs are already validated
        professionalDetails: {
            skills: sanitizedSkills,
            education: sanitizedEducation,
            experience: sanitizedExperience
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Update display name in Auth
    user.updateProfile({
        displayName: sanitizeInput(newName)
    }).then(() => {
        // Update data in Firestore
        return db.collection('users').doc(user.uid).update(updatedData);
    }).then(() => {
        // Update UI
        userName.textContent = sanitizeInput(newName);
        document.getElementById('user-bio').textContent = sanitizedBio || 'Add a short bio to tell people more about yourself';
        document.getElementById('user-location').textContent = sanitizedLocation || 'Not specified';
        
        // Update professional info in UI if it exists
        const occupationElement = document.getElementById('user-occupation');
        if (occupationElement) {
            occupationElement.textContent = sanitizedOccupation || 'Not specified';
        }
        
        const companyElement = document.getElementById('user-company');
        if (companyElement) {
            companyElement.textContent = sanitizedCompany || 'Not specified';
        }
        
        // Close modal
        document.getElementById('edit-profile-modal').classList.remove('active');
        document.getElementById('modal-overlay').classList.remove('active');
        
        showNotification('Profile updated successfully!');
        
        // Log security event
        logSensitiveOperation('profile_updated');
    }).catch((error) => {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile.', 'error');
    });
});

// Security enhancement: Input validation and sanitization
function isValidUrl(str) {
    try {
        const url = new URL(str);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function sanitizeInput(input) {
    if (!input) return input;
    
    // Basic XSS protection
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/javascript:/gi, '')
        .replace(/on\w+=/gi, '')
        .replace(/data:/gi, '');
}

// Save preferences
savePreferencesBtn.addEventListener('click', saveUserPreferences);

// Logout with enhanced security
logoutBtn.addEventListener('click', () => {
    // Clean up security measures
    stopTokenRefresh();
    clearTimeout(inactivityTimer);
    
    auth.signOut()
        .then(() => {
            // Clear any cached data
            localStorage.removeItem('userProfileImage');
            sessionStorage.clear();
            
            window.location.href = 'auth.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});

// Load security information
function loadSecurityInfo(user) {
    // Check if 2FA is enabled
    const multiFactor = user.multiFactor;
    if (multiFactor && multiFactor.enrolledFactors && multiFactor.enrolledFactors.length > 0) {
        twoFAStatus.textContent = 'Enabled';
        twoFAStatus.style.color = 'var(--success-color)';
        setup2faBtn.textContent = 'Manage 2FA';
    } else {
        twoFAStatus.textContent = 'Not enabled';
        setup2faBtn.textContent = 'Enable 2FA';
    }
    
    // Get last password change time
    db.collection('users').doc(user.uid).collection('security').doc('passwordHistory')
        .get()
        .then((doc) => {
            if (doc.exists && doc.data().lastChanged) {
                const changedDate = doc.data().lastChanged.toDate();
                const options = { year: 'numeric', month: 'long', day: 'numeric' };
                passwordChanged.textContent = changedDate.toLocaleDateString('en-US', options);
            } else {
                passwordChanged.textContent = 'Never';
            }
        })
        .catch((error) => {
            console.error('Error loading password history:', error);
            passwordChanged.textContent = 'Not available';
        });
    
    // Get last login time
    db.collection('users').doc(user.uid).collection('loginHistory')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get()
        .then((snapshot) => {
            if (!snapshot.empty) {
                const lastLoginData = snapshot.docs[0].data();
                const loginDate = lastLoginData.timestamp.toDate();
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                lastLogin.textContent = loginDate.toLocaleDateString('en-US', options);
            } else {
                lastLogin.textContent = 'Not available';
            }
        })
        .catch((error) => {
            console.error('Error loading login history:', error);
            lastLogin.textContent = 'Not available';
        });
}

// Record login history
function recordLoginHistory(user) {
    // Get browser and device info
    const userAgent = navigator.userAgent;
    let deviceInfo = 'Unknown Device';
    
    if (/Windows/.test(userAgent)) {
        deviceInfo = 'Windows PC';
    } else if (/Macintosh|Mac OS X/.test(userAgent)) {
        deviceInfo = 'Mac';
    } else if (/iPhone/.test(userAgent)) {
        deviceInfo = 'iPhone';
    } else if (/iPad/.test(userAgent)) {
        deviceInfo = 'iPad';
    } else if (/Android/.test(userAgent)) {
        deviceInfo = 'Android Device';
    }
    
    // Get approximate location (this would be more accurate with a geolocation API)
    const location = 'Unknown Location';
    
    // Record login
    db.collection('users').doc(user.uid).collection('loginHistory').add({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        device: deviceInfo,
        browser: getBrowserName(),
        location: location,
        status: 'success'
    }).catch((error) => {
        console.error('Error recording login history:', error);
    });
}

// Get browser name
function getBrowserName() {
    const userAgent = navigator.userAgent;
    
    if (/Firefox/.test(userAgent)) {
        return 'Firefox';
    } else if (/Chrome/.test(userAgent)) {
        return 'Chrome';
    } else if (/Safari/.test(userAgent)) {
        return 'Safari';
    } else if (/Edge/.test(userAgent)) {
        return 'Edge';
    } else if (/MSIE|Trident/.test(userAgent)) {
        return 'Internet Explorer';
    } else {
        return 'Unknown Browser';
    }
}

// Setup 2FA button click
setup2faBtn.addEventListener('click', () => {
    // Security enhancement: Require re-authentication for 2FA setup
    promptReauthentication(() => {
        // Open 2FA setup modal
        document.getElementById('setup-2fa-modal').classList.add('active');
        document.getElementById('modal-overlay').classList.add('active');
        
        // Reset to first step
        const steps = document.querySelectorAll('.step');
        steps.forEach(step => step.classList.remove('active'));
        document.getElementById('step-1').classList.add('active');
        
        // Log security event
        logSensitiveOperation('2fa_setup_started');
    });
});

// Change password button click
changePasswordBtn.addEventListener('click', () => {
    // Open change password modal
    document.getElementById('change-password-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
    
    // Clear form
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-new-password').value = '';
    passwordChangeError.textContent = '';
    newPasswordStrength.className = '';
    newPasswordStrength.style.width = '0%';
});

// View login history button click
viewHistoryBtn.addEventListener('click', () => {
    // Open login history modal
    document.getElementById('login-history-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
    
    // Load login history
    loadLoginHistory();
});

// Load login history
function loadLoginHistory() {
    const user = auth.currentUser;
    if (!user) return;
    
    loginHistoryList.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Loading login history...</p>
        </div>
    `;
    
    db.collection('users').doc(user.uid).collection('loginHistory')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                loginHistoryList.innerHTML = '<p class="empty-state">No login history available.</p>';
                return;
            }
            
            // Clear the list
            loginHistoryList.innerHTML = '';
            
            // Add each login to the list
            snapshot.forEach((doc) => {
                const login = doc.data();
                const loginDate = login.timestamp ? login.timestamp.toDate() : new Date();
                const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const formattedDate = loginDate.toLocaleDateString('en-US', options);
                
                const loginItem = document.createElement('div');
                loginItem.className = 'login-history-item';
                loginItem.innerHTML = `
                    <div class="login-history-icon">
                        <i class="fas fa-${login.status === 'success' ? 'check' : 'times'}"></i>
                    </div>
                    <div class="login-history-info">
                        <p class="device">${login.device} - ${login.browser}</p>
                        <p class="location">${login.location || 'Unknown Location'}</p>
                        <p class="time">${formattedDate}</p>
                    </div>
                    <div class="login-history-status ${login.status}">
                        ${login.status === 'success' ? 'Success' : 'Failed'}
                    </div>
                `;
                
                loginHistoryList.appendChild(loginItem);
            });
        })
        .catch((error) => {
            console.error('Error loading login history:', error);
            loginHistoryList.innerHTML = '<p class="empty-state">Error loading login history.</p>';
        });
}

// Password strength checker for new password
newPassword.addEventListener('input', () => {
    const password = newPassword.value;
    const { score, feedback } = calculatePasswordStrength(password);
    
    // Update strength meter
    newPasswordStrength.className = '';
    newPasswordStrengthText.textContent = feedback.suggestion || feedback.warning || 'Password strength';
    
    if (password.length === 0) {
        newPasswordStrength.style.width = '0%';
        return;
    }
    
    switch (score) {
        case 0:
        case 1:
            newPasswordStrength.classList.add('strength-weak');
            newPasswordStrengthText.textContent = 'Weak password';
            break;
        case 2:
            newPasswordStrength.classList.add('strength-fair');
            newPasswordStrengthText.textContent = 'Fair password';
            break;
        case 3:
            newPasswordStrength.classList.add('strength-good');
            newPasswordStrengthText.textContent = 'Good password';
            break;
        case 4:
            newPasswordStrength.classList.add('strength-strong');
            newPasswordStrengthText.textContent = 'Strong password';
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

// Change password form submit
changePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    const currentPassword = document.getElementById('current-password').value;
    const newPasswordValue = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;
    
    passwordChangeError.textContent = '';
    
    // Validate passwords
    if (newPasswordValue.length < 8) {
        passwordChangeError.textContent = 'New password must be at least 8 characters long.';
        return;
    }
    
    if (newPasswordValue !== confirmNewPassword) {
        passwordChangeError.textContent = 'New passwords do not match.';
        return;
    }
    
    // Security enhancement: Check password against common passwords list
    if (isCommonPassword(newPasswordValue)) {
        passwordChangeError.textContent = 'This password is too common. Please choose a stronger password.';
        return;
    }
    
    // Security enhancement: Check if new password is significantly different from old
    if (currentPassword === newPasswordValue) {
        passwordChangeError.textContent = 'New password must be different from your current password.';
        return;
    }
    
    // Re-authenticate user
    const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
    );
    
    user.reauthenticateWithCredential(credential)
        .then(() => {
            // Change password
            return user.updatePassword(newPasswordValue);
        })
        .then(() => {
            // Record password change
            return db.collection('users').doc(user.uid).collection('security').doc('passwordHistory').set({
                lastChanged: firebase.firestore.FieldValue.serverTimestamp(),
                // Store password history to prevent reuse (hashed)
                history: firebase.firestore.FieldValue.arrayUnion({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    // In a real app, you'd store a hash, not the actual password
                    passwordHash: 'hashed-version-would-go-here'
                })
            }, { merge: true });
        })
        .then(() => {
            // Close modal and show success notification
            document.getElementById('change-password-modal').classList.remove('active');
            document.getElementById('modal-overlay').classList.remove('active');
            showNotification('Password updated successfully!');
            
            // Update password changed date
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            passwordChanged.textContent = new Date().toLocaleDateString('en-US', options);
            
            // Log security event
            logSensitiveOperation('password_changed');
            
            // Force token refresh after password change
            return user.getIdToken(true);
        })
        .catch((error) => {
            console.error('Error changing password:', error);
            
            switch(error.code) {
                case 'auth/wrong-password':
                    passwordChangeError.textContent = 'Current password is incorrect.';
                    break;
                case 'auth/weak-password':
                    passwordChangeError.textContent = 'New password is too weak.';
                    break;
                default:
                    passwordChangeError.textContent = `Failed to change password: ${error.message}`;
            }
            
            // Log security event
            logSensitiveOperation('password_change_failed', { errorCode: error.code });
        });
});

// Security enhancement: Check for common passwords
function isCommonPassword(password) {
    const commonPasswords = [
        'password', '123456', '12345678', 'qwerty', 'admin',
        'welcome', 'password123', 'abc123', 'letmein', '111111'
    ];
    return commonPasswords.includes(password.toLowerCase());
}

// 2FA setup steps navigation
const nextStepButtons = document.querySelectorAll('.next-step');
const prevStepButtons = document.querySelectorAll('.prev-step');

nextStepButtons.forEach(button => {
    button.addEventListener('click', () => {
        const currentStep = button.closest('.step');
        const nextStep = currentStep.nextElementSibling;
        
        if (nextStep) {
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            
            // If moving to step 2, generate QR code
            if (nextStep.id === 'step-2') {
                generateTwoFactorQR();
            }
        }
    });
});

prevStepButtons.forEach(button => {
    button.addEventListener('click', () => {
        const currentStep = button.closest('.step');
        const prevStep = currentStep.previousElementSibling;
        
        if (prevStep) {
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
        }
    });
});

// Generate 2FA QR code
function generateTwoFactorQR() {
    // In a real application, you would use a library like qrcode.js to generate a QR code
    // and the server would provide a secret key for the user
    // This is a simplified version for demonstration purposes
    
    const qrContainer = document.getElementById('qr-code');
    const manualEntryCode = document.getElementById('manual-entry-code');
    
    // Simulate loading QR code
    setTimeout(() => {
        // In a real app, this would be a real QR code image
        qrContainer.innerHTML = `
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/BMW:${auth.currentUser.email}?secret=JBSWY3DPEHPK3PXP&issuer=BMW" alt="2FA QR Code">
        `;
        manualEntryCode.textContent = 'JBSWY3DPEHPK3PXP';
    }, 1000);
}

// Verify 2FA code
document.getElementById('verify-code-btn').addEventListener('click', () => {
    const verificationCode = document.getElementById('verification-code').value;
    const verificationError = document.getElementById('verification-error');
    
    if (!verificationCode || verificationCode.length !== 6) {
        verificationError.textContent = 'Please enter a valid 6-digit code.';
        return;
    }
    
    // In a real app, this would verify the code with the server
    // For demonstration, we'll simulate success if the code is 123456
    if (verificationCode === '123456') {
        // Move to success step
        document.getElementById('step-3').classList.remove('active');
        document.getElementById('step-4').classList.add('active');
        
        // Update 2FA status
        twoFAStatus.textContent = 'Enabled';
        twoFAStatus.style.color = 'var(--success-color)';
        setup2faBtn.textContent = 'Manage 2FA';
        
        // In a real app, you would enroll the second factor with Firebase
        // user.multiFactor.enroll(...)
    } else {
        verificationError.textContent = 'Invalid verification code. Please try again.';
    }
});

// Close modals
document.querySelectorAll('.close-modal, .cancel-password-change').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.getElementById('modal-overlay').classList.remove('active');
    });
});

// Close modal when clicking on overlay
document.getElementById('modal-overlay').addEventListener('click', () => {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modal-overlay').classList.remove('active');
});

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Close any open modals first
    closeAllModals();
    
    // Show overlay
    modalOverlay.classList.add('active');
    
    // Show modal with animation
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Hide modal with animation
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    
    // Hide overlay
    modalOverlay.classList.remove('active');
    
    // Allow body scrolling
    document.body.style.overflow = '';
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
    
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Form tab functionality
formTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        const parentForm = tab.closest('form');
        
        // Remove active class from all tabs and sections in this form
        const siblingTabs = tab.parentElement.querySelectorAll('.form-tab');
        siblingTabs.forEach(t => t.classList.remove('active'));
        
        const formSections = parentForm.querySelectorAll('.form-section');
        formSections.forEach(section => section.classList.remove('active'));
        
        // Add active class to selected tab and section
        tab.classList.add('active');
        const targetSection = parentForm.querySelector(`#${tabId}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    });
});

// Event Listeners for modals
editProfileBtn.addEventListener('click', () => openModal('edit-profile-modal'));
document.getElementById('edit-preferences-btn').addEventListener('click', () => openModal('edit-preferences-modal'));
document.getElementById('add-car-btn').addEventListener('click', () => openModal('add-car-modal'));
document.getElementById('add-car-card').addEventListener('click', () => openModal('add-car-modal'));
setup2faBtn.addEventListener('click', () => openModal('setup-2fa-modal'));
changePasswordBtn.addEventListener('click', () => openModal('change-password-modal'));
viewHistoryBtn.addEventListener('click', () => {
    openModal('login-history-modal');
    loadLoginHistory();
});

// Close modal events
closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
            closeModal(modal.id);
        }
    });
});

cancelButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        if (modal) {
            closeModal(modal.id);
        }
    });
});

// Close modal when clicking overlay
modalOverlay.addEventListener('click', closeAllModals);

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Stop propagation on modal content click to prevent closing when clicking inside
document.querySelectorAll('.modal-content').forEach(content => {
    content.addEventListener('click', (e) => {
        e.stopPropagation();
    });
});

// Edit Profile Form Submission
const editProfileForm = document.getElementById('edit-profile-form');
editProfileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    // Get form values
    const name = document.getElementById('edit-name').value.trim();
    const bio = document.getElementById('edit-bio').value.trim();
    const location = document.getElementById('edit-location').value.trim();
    const occupation = document.getElementById('edit-occupation').value.trim();
    const company = document.getElementById('edit-company').value.trim();
    const website = document.getElementById('edit-website').value.trim();
    const linkedin = document.getElementById('edit-linkedin').value.trim();
    const skills = document.getElementById('edit-skills').value.trim();
    const education = document.getElementById('edit-education').value.trim();
    const experience = document.getElementById('edit-experience').value.trim();
    
    // Update user profile data
    const userData = {
        name: name,
        bio: bio,
        location: location,
        occupation: occupation,
        company: company,
        website: website,
        linkedin: linkedin,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        professionalDetails: {
            skills: skills,
            education: education,
            experience: experience
        }
    };
    
    // Show loading state
    const submitBtn = editProfileForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    // Update profile in Firestore
    db.collection('users').doc(user.uid).update(userData)
        .then(() => {
            // Update display name in auth
            return user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            // Success
            showNotification('Profile updated successfully!');
            closeModal('edit-profile-modal');
            
            // Refresh profile data
            loadUserProfile(user);
        })
        .catch((error) => {
            console.error('Error updating profile:', error);
            showNotification('Failed to update profile.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
});

// Edit Preferences Form Submission
const editPreferencesForm = document.getElementById('edit-preferences-form');
editPreferencesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    // Get form values
    const preferredSeries = document.getElementById('preferred-series').value;
    const favoriteColor = document.getElementById('favorite-color-select').value;
    const transmission = document.getElementById('transmission-select').value;
    const emailNotifications = document.getElementById('email-notifications').checked;
    const newModelNotifications = document.getElementById('new-model-notifications').checked;
    const eventNotifications = document.getElementById('event-notifications').checked;
    
    // Create preferences object
    const preferences = {
        preferredSeries: preferredSeries,
        favoriteColor: favoriteColor,
        transmission: transmission,
        notifications: {
            email: emailNotifications,
            newModels: newModelNotifications,
            events: eventNotifications
        },
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Show loading state
    const submitBtn = editPreferencesForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    // Update preferences in Firestore
    db.collection('users').doc(user.uid).collection('preferences').doc('settings').set(preferences)
        .then(() => {
            // Success
            showNotification('Preferences updated successfully!');
            closeModal('edit-preferences-modal');
            
            // Update display
            document.getElementById('preferred-series-display').textContent = 
                document.getElementById('preferred-series').options[document.getElementById('preferred-series').selectedIndex].text;
            document.getElementById('favorite-color').textContent = favoriteColor;
            document.getElementById('transmission-preference').textContent = transmission;
        })
        .catch((error) => {
            console.error('Error updating preferences:', error);
            showNotification('Failed to update preferences.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
});

// Add Car Form Submission
const addCarForm = document.getElementById('add-car-form');
addCarForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    // Get form values
    const carModel = document.getElementById('car-model').value;
    const carYear = document.getElementById('car-year').value;
    const carColor = document.getElementById('car-color').value;
    
    if (!carModel) {
        showNotification('Please select a car model.', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = addCarForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    
    // Create car object
    const car = {
        model: carModel,
        year: carYear,
        color: carColor,
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Add car to Firestore
    db.collection('users').doc(user.uid).collection('savedCars').add(car)
        .then(() => {
            // Success
            showNotification('Car added to favorites!');
            closeModal('add-car-modal');
            
            // Reset form
            addCarForm.reset();
            
            // Refresh cars list
            loadSavedCars(user);
        })
        .catch((error) => {
            console.error('Error adding car:', error);
            showNotification('Failed to add car.', 'error');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        });
});

// Populate edit profile form with user data
function populateEditProfileForm(user) {
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                
                // Set basic info
                document.getElementById('edit-name').value = userData.name || '';
                document.getElementById('edit-bio').value = userData.bio || '';
                document.getElementById('edit-location').value = userData.location || '';
                
                // Set professional info
                document.getElementById('edit-occupation').value = userData.occupation || '';
                document.getElementById('edit-company').value = userData.company || '';
                document.getElementById('edit-website').value = userData.website || '';
                document.getElementById('edit-linkedin').value = userData.linkedin || '';
                
                // Set professional details if available
                if (userData.professionalDetails) {
                    document.getElementById('edit-skills').value = userData.professionalDetails.skills || '';
                    document.getElementById('edit-education').value = userData.professionalDetails.education || '';
                    document.getElementById('edit-experience').value = userData.professionalDetails.experience || '';
                }
            }
        })
        .catch((error) => {
            console.error('Error loading user data for edit form:', error);
        });
}

// Populate edit preferences form with user preferences
function populateEditPreferencesForm(user) {
    db.collection('users').doc(user.uid).collection('preferences').doc('settings').get()
        .then((doc) => {
            if (doc.exists) {
                const prefs = doc.data();
                
                // Set values
                if (prefs.preferredSeries) {
                    document.getElementById('preferred-series').value = prefs.preferredSeries;
                }
                
                if (prefs.favoriteColor) {
                    document.getElementById('favorite-color-select').value = prefs.favoriteColor;
                }
                
                if (prefs.transmission) {
                    document.getElementById('transmission-select').value = prefs.transmission;
                }
                
                // Set notification checkboxes
                if (prefs.notifications) {
                    document.getElementById('email-notifications').checked = prefs.notifications.email !== false;
                    document.getElementById('new-model-notifications').checked = prefs.notifications.newModels !== false;
                    document.getElementById('event-notifications').checked = prefs.notifications.events === true;
                }
            }
        })
        .catch((error) => {
            console.error('Error loading preferences for edit form:', error);
        });
}

// Event listeners for edit buttons
editProfileBtn.addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        populateEditProfileForm(user);
        openModal('edit-profile-modal');
    }
});

document.getElementById('edit-preferences-btn').addEventListener('click', () => {
    const user = auth.currentUser;
    if (user) {
        populateEditPreferencesForm(user);
        openModal('edit-preferences-modal');
    }
});

// Clean up when leaving the page
window.addEventListener('beforeunload', () => {
    stopTokenRefresh();
    clearTimeout(inactivityTimer);
});

// Test function for profile image flow
function testProfileImageFlow() {
    console.log('Testing profile image flow...');
    
    const user = auth.currentUser;
    if (!user) {
        console.log('No user logged in, cannot test profile image flow');
        return;
    }
    
    // 1. Check if profile image exists in Firestore
    db.collection('users').doc(user.uid).get()
        .then((doc) => {
            console.log('Firestore document exists:', doc.exists);
            if (doc.exists) {
                console.log('Firestore photoURL:', doc.data().photoURL);
            }
            
            // 2. Check if profile image exists in Auth
            console.log('Auth photoURL:', user.photoURL);
            
            // 3. Check if profile image exists in localStorage
            console.log('localStorage photoURL:', localStorage.getItem('userProfileImage'));
            
            // 4. Check current profile image src
            console.log('Current profile image src:', profileImage.src);
        })
        .catch(error => {
            console.error('Error testing profile image flow:', error);
        });
}

// Test storage access
function testStorageAccess() {
    console.log('Testing Firebase Storage access...');
    
    const user = auth.currentUser;
    if (!user) {
        console.log('No user logged in, cannot test storage access');
        return;
    }
    
    // Check if we can list files in the user's storage
    const storageRef = storage.ref();
    const userRef = storageRef.child(`users/${user.uid}`);
    
    userRef.listAll()
        .then((result) => {
            console.log('Storage access successful');
            console.log('Items found:', result.items.length);
            result.items.forEach(itemRef => {
                console.log('Item found:', itemRef.fullPath);
                
                // Try to get download URL for each item
                itemRef.getDownloadURL()
                    .then(url => {
                        console.log('Download URL for', itemRef.name, ':', url);
                    })
                    .catch(error => {
                        console.error('Error getting download URL for', itemRef.name, ':', error);
                    });
            });
        })
        .catch((error) => {
            console.error('Error accessing Firebase Storage:', error);
            console.log('Storage bucket:', storage.app.options.storageBucket);
        });
}

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is logged in:', user.email);
            // Rest of initialization code...
            
            // Test upload functionality after page loads
            setTimeout(() => {
                // Create a test image from data URL (small red square)
                const testImageDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
                
                fetch(testImageDataURL)
                    .then(res => res.blob())
                    .then(blob => {
                        // Create a File object from the blob
                        const testFile = new File([blob], 'test-profile.png', { type: 'image/png' });
                        console.log('Created test file for upload:', testFile);
                        
                        // Try uploading directly (uncomment to test)
                        // uploadProfileImage(testFile);
                    })
                    .catch(error => {
                        console.error('Error creating test image:', error);
                    });
            }, 2000);
        } else {
            console.log('No user logged in, redirecting to auth page');
            window.location.href = 'auth.html';
        }
    });
    
    // Setup event listeners for profile image upload
    if (avatarUpload) {
        console.log('Avatar upload element found, setting up event listener');
    } else {
        console.error('Avatar upload element not found');
    }
});

// Run test in development mode only
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    // Uncomment to test profile image flow
    // setTimeout(testProfileImageFlow, 2000);
} 