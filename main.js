/**
 * BMW Website Main JavaScript
 * Modern, professional functionality for all site pages
 */

document.addEventListener("DOMContentLoaded", function() {
  // Dark mode functionality
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  darkModeToggle.title = 'Toggle Dark Mode';
  document.body.appendChild(darkModeToggle);
  
  // Check for saved user preference
  const isDarkMode = localStorage.getItem('bmwDarkMode') === 'true';
  
  // Set initial mode
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
  
  // Toggle dark mode on click
  darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('bmwDarkMode', isDark);
    darkModeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });

  // Initialize AOS animations
  AOS.init({
    duration: 800,
    easing: 'ease',
    once: false,
    offset: 100,
    disable: 'mobile',
    startEvent: 'DOMContentLoaded'
  });
  
  // Reinitialize AOS when dynamic content is loaded
  setTimeout(function() {
    AOS.refresh();
  }, 2000);
  
  // Refresh AOS on window resize and orientation change
  window.addEventListener('resize', function() {
    AOS.refresh();
  });
  
  window.addEventListener('orientationchange', function() {
    AOS.refresh();
  });

  // Loader animation
  const loader = document.querySelector('.loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 500);
    }, 1500);
  }

  // Sticky header on scroll
  const header = document.querySelector('header');
  const nav = document.querySelector('nav');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    
    if (currentScrollY > lastScrollY) {
      // Scrolling down
      header.classList.add('header-hidden');
    } else {
      // Scrolling up
      header.classList.remove('header-hidden');
    }
    
    lastScrollY = currentScrollY;
  });

  // Audio and Video sound control
  const audio = document.getElementById('myAudio');
  const hero = document.querySelector('.hero');
  const video = document.querySelector('.hero-video');
  
  if (audio && hero && video) {
    let soundEnabled = false;
    
    // Create sound control button
    const soundControl = document.createElement('button');
    soundControl.className = 'sound-control';
    soundControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
    soundControl.title = 'Enable/Disable Sound';
    hero.appendChild(soundControl);
    
    // Play audio and enable video sound on button click
    soundControl.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (!soundEnabled) {
        // Enable sound
        video.muted = false;
        audio.volume = 0.3;
        audio.play().then(() => {
          soundControl.innerHTML = '<i class="fas fa-volume-up"></i>';
          soundEnabled = true;
        }).catch(error => {
          console.log('Unable to play audio:', error);
          // If audio fails, at least enable video sound
          video.muted = false;
          soundControl.innerHTML = '<i class="fas fa-volume-up"></i>';
          soundEnabled = true;
        });
      } else {
        // Disable sound
        video.muted = true;
        audio.pause();
        soundControl.innerHTML = '<i class="fas fa-volume-mute"></i>';
        soundEnabled = false;
      }
    });
  }

  // Mobile Menu Toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle') || document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  // If the mobile menu toggle exists
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function(e) {
      // Prevent default if it's a link
      if (mobileMenuToggle.tagName === 'A') {
        e.preventDefault();
      }
      
      // Toggle active class for menu and toggle button
      mobileMenuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      
      // Add body class to prevent scrolling when menu is open
      document.body.classList.toggle('menu-open');
      
      // Toggle icon class if needed
      const icon = mobileMenuToggle.querySelector('i');
      if (icon) {
        if (icon.classList.contains('fa-bars')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (navLinks.classList.contains('active') && 
          !navLinks.contains(event.target) && 
          !mobileMenuToggle.contains(event.target)) {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Reset icon
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
    
    // Close menu when clicking on a nav link
    const navItems = navLinks.querySelectorAll('a');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Reset icon
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      });
    });
    
    // Handle window resize - close mobile menu if window width exceeds mobile breakpoint
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.classList.remove('menu-open');
        
        // Reset icon
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  // Carousel functionality
  const modelCarousel = document.querySelector('.model-carousel');
  if (modelCarousel) {
    const prevBtn = document.querySelector('.model-carousel-controls .control-prev');
    const nextBtn = document.querySelector('.model-carousel-controls .control-next');
    const indicators = document.querySelectorAll('.model-carousel-controls .control-indicators span');
    const cards = document.querySelectorAll('.model-card');
    
    let currentSlide = 0;
    let startX, moveX;
    let isDown = false;
    
    // Touch controls for mobile
    modelCarousel.addEventListener('touchstart', e => {
      isDown = true;
      startX = e.touches[0].pageX;
    });
    
    modelCarousel.addEventListener('touchmove', e => {
      if (!isDown) return;
      e.preventDefault();
      moveX = e.touches[0].pageX;
    });
    
    modelCarousel.addEventListener('touchend', () => {
      isDown = false;
      if (startX - moveX > 100) { // Swipe left
        nextSlide();
      } else if (moveX - startX > 100) { // Swipe right
        prevSlide();
      }
    });
    
    // Button controls
    if (nextBtn) {
      nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
      prevBtn.addEventListener('click', prevSlide);
    }
    
    // Indicator controls
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentSlide = index;
        updateCarousel();
      });
    });
    
    function nextSlide() {
      currentSlide = (currentSlide + 1) % cards.length;
      updateCarousel();
    }
    
    function prevSlide() {
      currentSlide = (currentSlide - 1 + cards.length) % cards.length;
      updateCarousel();
    }
    
    function updateCarousel() {
      // For desktop view: show 3 cards at a time with the current one in the center
      let slideWidth;
      let visibleCards = 3;
      
      // Responsive adjustments
      if (window.innerWidth < 768) {
        // Mobile: show 1 card at a time
        visibleCards = 1;
        slideWidth = modelCarousel.offsetWidth;
      } else if (window.innerWidth < 1200) {
        // Tablet: show 2 cards at a time
        visibleCards = 2;
        slideWidth = modelCarousel.offsetWidth / visibleCards;
      } else {
        // Desktop: show 3 cards at a time
        visibleCards = 3;
        slideWidth = modelCarousel.offsetWidth / visibleCards;
      }
      
      // Apply smooth transition
      modelCarousel.style.transition = 'transform 0.5s ease-in-out';
      
      // For the infinite appearance, we need to adjust the translation calculation
      // When we have fewer visible cards, we need to show the focused card centered
      if (visibleCards === 1) {
        modelCarousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
      } else if (visibleCards === 2) {
        // For 2 visible cards, we shift to show the current and the next card
        modelCarousel.style.transform = `translateX(-${currentSlide * slideWidth}px)`;
      } else {
        // For 3 visible cards, we want the current slide in the center
        // This gets more complex with the larger number of cards
        const totalWidth = cards.length * slideWidth;
        const offset = (currentSlide * slideWidth);
        modelCarousel.style.transform = `translateX(-${offset}px)`;
      }
      
      // Update indicators
      // Make sure we only highlight valid indicators (we might have more cards than indicators)
      indicators.forEach((indicator, index) => {
        if (index < indicators.length) {
          if (index === currentSlide % indicators.length) {
            indicator.classList.add('active');
          } else {
            indicator.classList.remove('active');
          }
        }
      });
      
      // Update active state for cards
      cards.forEach((card, index) => {
        if (index === currentSlide) {
          card.classList.add('active');
        } else {
          card.classList.remove('active');
        }
      });
    }
    
    // Initialize the carousel
    updateCarousel();
    
    // Auto-rotate carousel with pause on hover
    let carouselInterval = setInterval(nextSlide, 5000);
    
    modelCarousel.addEventListener('mouseenter', () => {
      clearInterval(carouselInterval);
    });
    
    modelCarousel.addEventListener('mouseleave', () => {
      carouselInterval = setInterval(nextSlide, 5000);
    });
    
    // Handle window resize events to adjust the carousel view
    window.addEventListener('resize', () => {
      updateCarousel();
    });
  }

  // Search overlay functionality
  const searchBtn = document.querySelector('.search-btn');
  const searchOverlay = document.querySelector('.search-overlay');
  const closeSearch = document.querySelector('.close-search');
  
  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      searchOverlay.classList.add('active');
      setTimeout(() => {
        searchOverlay.querySelector('input').focus();
      }, 100);
    });
    
    closeSearch.addEventListener('click', function() {
      searchOverlay.classList.remove('active');
    });
    
    // Close search on escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        searchOverlay.classList.remove('active');
      }
    });
  }
  
  // Cookie consent functionality
  const cookieConsent = document.querySelector('.cookie-consent');
  const acceptCookiesBtn = document.querySelector('.cookie-btn.accept');
  const cookieSettingsBtn = document.querySelector('.cookie-btn.settings');
  
  if (cookieConsent) {
    // Check if user has already accepted cookies
    if (!localStorage.getItem('bmwCookiesAccepted')) {
      // Show after a slight delay for better UX
      setTimeout(() => {
        cookieConsent.classList.add('active');
      }, 2000);
    }
    
    if (acceptCookiesBtn) {
      acceptCookiesBtn.addEventListener('click', function() {
        localStorage.setItem('bmwCookiesAccepted', 'true');
        cookieConsent.classList.add('fade-out');
        setTimeout(() => {
          cookieConsent.classList.remove('active');
        }, 500);
      });
    }
    
    if (cookieSettingsBtn) {
      cookieSettingsBtn.addEventListener('click', function() {
        // Here you would typically open a modal with cookie settings
        // For now, just hide the consent
        cookieConsent.classList.add('fade-out');
        setTimeout(() => {
          cookieConsent.classList.remove('active');
        }, 500);
      });
    }
  }

  // Testimonials slider functionality
  const testimonialsSlider = document.querySelector('.testimonials-slider');
  if (testimonialsSlider) {
    const testimonialItems = document.querySelectorAll('.testimonial-item');
    const prevBtn = document.querySelector('.testimonial-controls .control-prev');
    const nextBtn = document.querySelector('.testimonial-controls .control-next');
    const indicators = document.querySelectorAll('.testimonial-controls .control-indicators span');
    
    let currentSlide = 0;
    
    function showSlide(index) {
      testimonialsSlider.style.transform = `translateX(-${index * 100}%)`;
      
      // Update indicators
      indicators.forEach((indicator, i) => {
        if (i === index) {
          indicator.classList.add('active');
        } else {
          indicator.classList.remove('active');
        }
      });
    }
    
    // Initialize the slider
    showSlide(currentSlide);
    
    // Event listeners for prev/next buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + testimonialItems.length) % testimonialItems.length;
        showSlide(currentSlide);
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % testimonialItems.length;
        showSlide(currentSlide);
      });
    }
    
    // Event listeners for indicators
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
    
    // Auto-rotate testimonials
    let testimonialInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % testimonialItems.length;
      showSlide(currentSlide);
    }, 6000);
    
    // Pause auto-rotation on hover
    testimonialsSlider.addEventListener('mouseenter', () => {
      clearInterval(testimonialInterval);
    });
    
    testimonialsSlider.addEventListener('mouseleave', () => {
      testimonialInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % testimonialItems.length;
        showSlide(currentSlide);
      }, 6000);
    });
    
    // Touch swipe functionality for mobile
    let startX, moveX;
    let isDragging = false;
    
    testimonialsSlider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });
    
    testimonialsSlider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      moveX = e.touches[0].clientX;
    });
    
    testimonialsSlider.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diffX = startX - moveX;
      
      if (diffX > 50) {
        // Swipe left - next slide
        currentSlide = (currentSlide + 1) % testimonialItems.length;
      } else if (diffX < -50) {
        // Swipe right - previous slide
        currentSlide = (currentSlide - 1 + testimonialItems.length) % testimonialItems.length;
      }
      
      showSlide(currentSlide);
    });
  }
  
  // FAQ accordion functionality
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const faqToggle = item.querySelector('.faq-toggle i');
      
      // Set initial state - close all except the first one
      if (item === faqItems[0]) {
        item.classList.add('active');
        faqToggle.className = 'fas fa-minus';
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
      
      question.addEventListener('click', () => {
        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('active')) {
            otherItem.classList.remove('active');
            const otherToggle = otherItem.querySelector('.faq-toggle i');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            otherToggle.className = 'fas fa-plus';
            otherAnswer.style.maxHeight = null;
          }
        });
        
        // Toggle current item
        item.classList.toggle('active');
        
        if (item.classList.contains('active')) {
          faqToggle.className = 'fas fa-minus';
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          faqToggle.className = 'fas fa-plus';
          answer.style.maxHeight = null;
        }
      });
    });
  }
  
  // Back to top button functionality
  const backToTopBtn = document.querySelector('.back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
  
  // Add 'current-page' class to active nav item based on URL
  function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      
      if (currentPath.includes(linkPath) || 
          (currentPath.endsWith('/') && linkPath === 'index.html') ||
          (currentPath.endsWith('/index.html') && linkPath === 'index.html')) {
        link.classList.add('active');
      }
    });
  }
  
  // Call the function to set active nav item
  setActiveNavItem();

  // Smooth scrolling for all internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // Skip if it's not an internal link
      if (targetId === '#' || targetId === '') return;
      
      e.preventDefault();
      
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Close mobile menu if open
        if (navLinks.classList.contains('active')) {
          navLinks.classList.remove('active');
          document.body.classList.remove('menu-open');
          mobileMenuToggle.querySelector('i').classList.toggle('fa-bars');
          mobileMenuToggle.querySelector('i').classList.toggle('fa-times');
        }
        
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });

  // Parallax effect for the hero section
  const heroSection = document.querySelector('.hero-section');
  
  if (heroSection) {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      const heroText = heroSection.querySelector('.hero-text');
      
      if (heroText) {
        // Parallax effect for the content
        heroText.style.transform = `translateY(${scrollPosition * 0.1}px)`;
        
        // Subtle opacity effect
        const opacity = Math.max(1 - scrollPosition / 700, 0);
        heroText.style.opacity = opacity;
      }
    });
  }

  // Animated counters for statistics (add to any page with .counter-value class)
  const counterElements = document.querySelectorAll('.counter-value');
  
  if (counterElements.length > 0) {
    const options = {
      threshold: 0.7
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseInt(target.getAttribute('data-count'));
          const duration = 2000; // 2 seconds
          const increment = countTo / (duration / 16); // 60fps
          
          let current = 0;
          const counter = setInterval(() => {
            current += increment;
            target.textContent = Math.floor(current);
            
            if (current >= countTo) {
              target.textContent = countTo;
              clearInterval(counter);
            }
          }, 16);
          
          observer.unobserve(target);
        }
      });
    }, options);
    
    counterElements.forEach(counter => {
      observer.observe(counter);
    });
  }

  // Form validation for any forms on the site
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      let isValid = true;
      const requiredFields = form.querySelectorAll('[required]');
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('error');
          
          // Create error message if it doesn't exist
          if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('error-message')) {
            const errorMsg = document.createElement('span');
            errorMsg.classList.add('error-message');
            errorMsg.textContent = 'This field is required';
            field.parentNode.insertBefore(errorMsg, field.nextElementSibling);
          }
        } else {
          field.classList.remove('error');
          
          // Remove error message if it exists
          if (field.nextElementSibling && field.nextElementSibling.classList.contains('error-message')) {
            field.nextElementSibling.remove();
          }
        }
      });
      
      if (!isValid) {
        e.preventDefault();
      }
    });
  });

  // Image lazy loading enhancement
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if (lazyImages.length > 0) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.getAttribute('data-src');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  }

  // Vehicle configurator initialization (if on a page with configurator)
  const configurator = document.querySelector('.vehicle-configurator');
  
  if (configurator) {
    initializeConfigurator();
  }

  function initializeConfigurator() {
    const colorOptions = document.querySelectorAll('.color-option');
    const wheelOptions = document.querySelectorAll('.wheel-option');
    const vehicleImage = document.querySelector('.vehicle-preview img');
    
    // Track configuration state
    const config = {
      color: 'blue',
      wheels: 'standard',
      interior: 'black'
    };
    
    // Color selection
    colorOptions.forEach(option => {
      option.addEventListener('click', function() {
        const color = this.getAttribute('data-color');
        config.color = color;
        
        // Update active state
        colorOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        
        // Update vehicle image
        updateVehicleImage();
      });
    });
    
    // Wheel selection
    wheelOptions.forEach(option => {
      option.addEventListener('click', function() {
        const wheels = this.getAttribute('data-wheels');
        config.wheels = wheels;
        
        // Update active state
        wheelOptions.forEach(opt => opt.classList.remove('active'));
        this.classList.add('active');
        
        // Update vehicle image
        updateVehicleImage();
      });
    });
    
    function updateVehicleImage() {
      // In a real implementation, this would update the image based on selections
      // For now, we'll just log the configuration
      console.log('Vehicle configuration updated:', config);
    }
  }

  // Add viewport height fix for mobile browsers
  function setMobileViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  
  // Set the initial value
  setMobileViewportHeight();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setMobileViewportHeight);
  window.addEventListener('orientationchange', setMobileViewportHeight);
}); 

