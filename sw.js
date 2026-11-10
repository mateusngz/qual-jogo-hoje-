/* Cache do app shell; RAWG nunca é interceptada. Assets externos são best-effort. */
const CACHE='qual-jogo-hoje-shell-v7', IMAGES='qual-jogo-hoje-images-v1';
const SHELL=['./','./index.html','./styles.css','./config.js','./js/main.js?release=7','./js/ui.js','./js/api.js','./js/storage.js','./js/vibes.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>![CACHE,IMAGES].includes(k)).map(k=>caches.delete(k)))),self.clients.claim()]));});
self.addEventListener('fetch',event=>{const req=event.request;if(req.method!=='GET')return;
 if(new URL(req.url).origin!==self.location.origin){if(req.destination==='image'){event.respondWith((async()=>{const cache=await caches.open(IMAGES);const cached=await cache.match(req);if(cached)return cached;try{const res=await fetch(req);if(res.ok||res.type==='opaque')cache.put(req,res.clone());return res;}catch{return Response.error();}})());}return;}
 event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(req,{ignoreSearch:req.mode==='navigate'});
 if(req.mode==='navigate'){try{const res=await fetch(req);if(res.ok)cache.put('./index.html',res.clone());return res;}catch{return cached||await cache.match('./index.html');}}
 try{const res=await fetch(req);if(res.ok){cache.put(req,res.clone());return res;}return cached||res;}catch{return cached||Response.error();}
 })());});
