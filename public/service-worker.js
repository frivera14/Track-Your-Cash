const CACHE_NAME = 'Track-Your-Cash';
const DATA_CACHE_NAME = 'data-cache-v1';

const FILES_TO_CACHE = [
    './index.html',
    './css/styles.css',
    './js/index.js'
];

self.addEventListener('fetch', function (e) {

    if (e.request.url.includes('/api/')) {
        
        e.respondWith(
            caches.open(CACHE_NAME).then((cache) => {
                return fetch(e.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch(err => {
                        return cache.match(e.request);
                    })
                    .catch(err => console.log(err))
            })
        )
        return;
    }

    e.respondWith(
        fetch(e.request).catch(function() {
            return caches.match(e.request).then(function(response) {
                if (response) {
                    return response;
                } else if(e.request.headers.get('accept').includes('text/html')) {
                    return caches.match('/')
                }
            })
        })
    )
});

self.addEventListener('install', function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Files were pre-cached successfully!');
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
})


self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(DATA_CACHE_NAME);
            })
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === 1) {
                    console.log('deleting cache : ' + keyList[i]);
                    return caches.delete(keyList[i])
                }
            }))
        })
    )
    self.clients.claim();
});