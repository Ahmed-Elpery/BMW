// BMW Website Service Worker
const CACHE_NAME = 'bmw-cache-v1';

// Security enhancement: Implement Subresource Integrity checks for critical files
const INTEGRITY_CHECKS = {
  '/js/main.bundle.js': 'sha256-...',  // Add actual hash after building
  '/js/modules/core.js': 'sha256-...'  // Add actual hash after building
};

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/Home.html',
  '/profile.html',
  '/auth.html',
  '/css/critical.css',
  '/BMW_White_Logo.svg.asset.1670245093434.svg',
  '/js/main.bundle.js',
  '/js/modules/core.js',
  '/offline.html'
];

// Runtime caching strategies
const CACHING_STRATEGIES = {
  // Cache first, then network
  cacheFirst: [
    '/fonts/',
    '.svg',
    '.jpg',
    '.png',
    '.webp',
    '.gif',
    '.avif',
    '.css'
  ],
  
  // Network first, fallback to cache
  networkFirst: [
    '/profile.js',
    '/auth.js',
    '/js/modules/',
    '/api/'
  ],
  
  // Network only (never cache)
  networkOnly: [
    'firebase',
    'firestore',
    'analytics'
  ]
};

// Security enhancement: Validate source origins
function isTrustedSource(url) {
  const trustedDomains = [
    self.location.origin,
    'https://www.gstatic.com',
    'https://cdnjs.cloudflare.com',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ];
  
  try {
    const urlObj = new URL(url);
    return trustedDomains.some(domain => urlObj.origin === domain);
  } catch (e) {
    console.error('Invalid URL:', url);
    return false;
  }
}

// Install event - Precache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  // Claim clients to take control immediately
  self.clients.claim();
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Helper function to determine caching strategy based on request URL
function getStrategy(url) {
  // Check network only URLs first
  if (CACHING_STRATEGIES.networkOnly.some(pattern => url.includes(pattern))) {
    return 'networkOnly';
  }
  
  // Check network first URLs next
  if (CACHING_STRATEGIES.networkFirst.some(pattern => url.includes(pattern))) {
    return 'networkFirst';
  }
  
  // Check cache first URLs last
  if (CACHING_STRATEGIES.cacheFirst.some(pattern => url.includes(pattern))) {
    return 'cacheFirst';
  }
  
  // Default to network first for everything else
  return 'networkFirst';
}

// Security enhancement: Add response sanitization
function sanitizeResponse(response) {
  // Clone the response to avoid modifying the original
  const clonedResponse = response.clone();
  
  // For HTML responses, sanitize potentially dangerous content
  if (response.headers.get('content-type') && 
      response.headers.get('content-type').includes('text/html')) {
    return clonedResponse.text().then(html => {
      // Basic sanitization - more comprehensive sanitization 
      // would be implemented in a production environment
      const sanitizedHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '<!-- script removed -->')
        .replace(/javascript:/gi, 'removed:');
      
      // Create new response with sanitized HTML
      return new Response(sanitizedHtml, {
        status: clonedResponse.status,
        statusText: clonedResponse.statusText,
        headers: clonedResponse.headers
      });
    });
  }
  
  // For non-HTML responses, return the original
  return response;
}

// Fetch event - Handle resource requests
self.addEventListener('fetch', event => {
  // Security enhancement: Block requests from untrusted sources
  if (!isTrustedSource(event.request.url)) {
    console.warn('Blocked request to untrusted source:', event.request.url);
    return event.respondWith(new Response('Blocked by service worker', {
      status: 403,
      statusText: 'Forbidden'
    }));
  }
  
  // Skip cross-origin requests to third-party APIs
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('googleapis.com') &&
      !event.request.url.includes('gstatic.com')) {
    return;
  }
  
  const url = event.request.url;
  const strategy = getStrategy(url);
  
  // Apply appropriate strategy
  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirstStrategy(event.request));
      break;
    case 'networkFirst':
      event.respondWith(networkFirstStrategy(event.request));
      break;
    case 'networkOnly':
      // Let the browser handle it normally
      break;
    default:
      event.respondWith(networkFirstStrategy(event.request));
  }
});

// Cache-first strategy with enhanced security
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Return cached response but update cache in background
    fetchAndUpdateCache(request);
    return sanitizeResponse(cachedResponse);
  }
  
  // If not in cache, fetch from network and cache
  try {
    const response = await fetchAndUpdateCache(request);
    return sanitizeResponse(response);
  } catch (error) {
    console.error('Error in cacheFirstStrategy:', error);
    return new Response('Error loading resource', { status: 500 });
  }
}

// Network-first strategy with enhanced security
async function networkFirstStrategy(request) {
  try {
    const response = await fetchAndUpdateCache(request);
    return sanitizeResponse(response);
  } catch (error) {
    console.log('Service Worker: Network request failed, using cache', error);
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return sanitizeResponse(cachedResponse);
    }
    
    // If request is for a page, show offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline.html').then(sanitizeResponse);
    }
    
    // Otherwise, just propagate the error
    throw error;
  }
}

// Helper to fetch and update cache with security enhancements
async function fetchAndUpdateCache(request) {
  // Security enhancement: Add integrity checking for critical resources
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Add security headers to the request
  const secureRequest = new Request(request, {
    // Don't send credentials to third-party domains
    credentials: url.origin === self.location.origin ? 'include' : 'same-origin'
  });
  
  const response = await fetch(secureRequest);
  
  // Verify integrity for critical resources if defined
  if (INTEGRITY_CHECKS[pathname] && pathname.endsWith('.js')) {
    // In a real implementation, you would calculate and check the integrity hash
    // This is a simplified placeholder for demonstration
    console.log(`Integrity check for ${pathname} would happen here`);
  }
  
  // Only cache valid same-origin responses
  if (response && response.status === 200 && 
      response.type === 'basic' && 
      url.origin === self.location.origin) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  
  return response;
}

// Handle push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/BMW_White_Logo.svg.asset.1670245093434.svg',
    badge: '/badge-icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then(windowClients => {
        // Check if there's already a window/tab open with the target URL
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
}); 