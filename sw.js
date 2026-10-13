'use strict';
const PREFIX='traffic-plc-'+encodeURIComponent(self.registration.scope)+'-';
const CACHE=PREFIX+'20261013-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon192.png','./icon512.png','./apple-touch-icon.png'];
const urls=ASSETS.map(path=>new URL(path,self.registration.scope).href);
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);await cache.addAll(urls);await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const name of await caches.keys())if(name.startsWith(PREFIX)&&name!==CACHE)await caches.delete(name);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET')return;
 const url=new URL(event.request.url);url.search='';url.hash='';
 if(!urls.includes(url.href))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  return await cache.match(url.href)||fetch(event.request);
 })());
});
self.addEventListener('message',event=>{
 if(event.data&&event.data.type==='CHECK_OFFLINE'&&event.ports[0])event.waitUntil((async()=>{
  try{const cache=await caches.open(CACHE);const entries=await Promise.all(urls.map(url=>cache.match(url)));event.ports[0].postMessage({ready:entries.every(Boolean)});}
  catch(_){event.ports[0].postMessage({ready:false});}
 })());
});
