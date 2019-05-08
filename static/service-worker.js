workbox.core.skipWaiting()
workbox.core.clientsClaim()
workbox.precaching.precacheAndRoute([...(self.__precacheManifest || []), { url: '/index.html' }])
workbox.routing.registerRoute(
  /https:\/\/hacker-news.firebaseio.com\/v0\/(.*).json/,
  new workbox.strategies.NetworkFirst()
)
