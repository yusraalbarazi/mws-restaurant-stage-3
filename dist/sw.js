const cacheName = 'v1';
const cacheFiles = [
    '/',
    'index.html',
    'restaurant.html',
    './js/swController.js',
    './js/main.js',
    './js/restaurant_info.js',
    '/js/idb.js',
    '/js/dbhelper.js',
    './css/styles.css',
    './css/laptopDevices.css',
    './css/mobileDevices.css',
    './css/tabletDevices.css',
    './css/wideDevices.css',
    './css/notification.css',
    './img/1_medium.jpg',
    './img/2_medium.jpg',
    './img/3_medium.jpg',
    './img/4_medium.jpg',
    './img/5_medium.jpg',
    './img/6_medium.jpg',
    './img/7_medium.jpg',
    './img/8_medium.jpg',
    './img/9_medium.jpg',
    './img/10_medium.jpg'
];

/**
 *  - Install event
 */
self.addEventListener('install', event => {
    console.log('ServiceWorker Installed');
    event.waitUntil(
        caches.open(cacheName).then(cache => {

            return cache.addAll(cacheFiles);
        })
    );
});

/**
 * - Activate event
 */
self.addEventListener('activate', event => {

    event.waitUntil(self.clients.claim());
});


/**
 * - Fetch event
 */
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then(response => {
            return response || fetch(event.request);
        })
        .catch(err => console.log(err, event.request))
    );
})

self.addEventListener('sync', function(event) {
    if (event.tag === 'review-sync') {
        event.waitUntil(DBHelper.waitingReviews());
    }
});