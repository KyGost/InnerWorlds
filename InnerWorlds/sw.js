const cacheEnabled = self.location.host == 'innerworlds.kyapps.com';
const cacheName = 'cache-v1';
const precacheResources = [
	// Mains
	'/',
	'index.html',
	// Primary Assets
	/// CSS
	'assets/style/style.css',
	/// JS
	'assets/script/core.js',
	// !Everything else is automatically cached!
];

self.addEventListener('install', event => {
	console.log('SW Install Event');
	event.waitUntil(caches.open(cacheName).then(cache => {
		return cache.addAll(precacheResources);
	}));
});

self.addEventListener('fetch', event => {
	event.respondWith(fromCache(event.request));
	event.waitUntil(updateCache(event.request));
});

function fromCache(request) {
	return caches.open(cacheName).then(cache => {
		return cache.match(request).then(matching => {
			return (cacheEnabled && matching) || fetch(request).catch(error => console.log(error));
		});
	});
}
function updateCache(request) {
	return caches.open(cacheName).then(cache => {
		return fetch(request).then(response => {
			return cache.put(request, response);
		}).catch(error => console.log(error));
	});
}