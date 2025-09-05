# BMW Egypt Website

## Overview
A modern, responsive website for BMW Egypt showcasing their vehicle lineup, electric models, premium selection, and more. The website features a dark mode option, dynamic data loading from JSON, comprehensive SEO optimization, and user authentication with Firebase.

## Features
- Responsive design for all device sizes
- Dark mode toggle with localStorage persistence
- Dynamic data loading from JSON
- SEO optimized with meta tags and schema markup
- Interactive car filtering and browsing
- Modern animations and transitions
- User authentication system (login/registration)
- User profile management
- Secure Firebase database integration

## Technologies Used
- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome icons
- AOS (Animate On Scroll) library
- Firebase Authentication
- Firebase Firestore Database
- Firebase Hosting

## Project Structure
- `Home.html` - Main landing page
- `Models.html` - Complete vehicle lineup
- `Electric.html` - Electric vehicle showcase
- `Explore.html` - Detailed model exploration
- `BMW Premium Selection.html` - Certified pre-owned vehicles
- `BMWGrandClass.html` - Luxury loyalty program
- `MoreBMW.html` - Additional BMW offerings
- `auth.html` - User authentication page (login/registration)
- `profile.html` - User profile management
- `data/cars.json` - Dynamic car data
- `js/data-loader.js` - Dynamic content loading script
- `firestore.rules` - Database security rules

## Authentication System
The website includes a complete user authentication system built with Firebase Authentication:

- User registration with email and password
- Secure login functionality
- Password reset via email
- User profile management
- User preferences storage
- Protected routes requiring authentication

## Database Structure
Firebase Firestore is used to store user data with the following structure:

```
/users/{userId}/
  - name: string
  - email: string
  - createdAt: timestamp
  
  /preferences/settings/
    - preferredSeries: string
    - notifications: boolean
    
  /savedCars/{carId}/
    - model: string
    - image: string
    - year: string
```

## Hosting Instructions

### Local Development
1. Clone the repository
2. Open any HTML file in your browser to view the site locally

### Firebase Hosting
1. Install Firebase CLI:
   ```
   npm install -g firebase-tools
   ```

2. Log in to Firebase:
   ```
   firebase login
   ```

3. Initialize your project (already done if using this repo):
   ```
   firebase init hosting
   ```

4. Deploy to Firebase:
   ```
   firebase deploy
   ```

5. Your site will be available at: https://bmw-egypt-website.web.app

## SEO Optimization
- All pages include proper meta tags
- Schema.org structured data for rich snippets
- Canonical URLs
- Open Graph and Twitter Card meta tags
- robots.txt and sitemap.xml included

## Maintenance
To update car data, simply modify the `data/cars.json` file with new vehicle information. 

## Security
- Firebase Authentication for secure user management
- Firestore security rules to protect user data
- HTTPS encryption for all communications 