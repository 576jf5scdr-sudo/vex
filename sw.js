const C='vex-v1';const A=['./','index.html','app.js','manifest.json','logo.jpg','apple-touch-icon.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||e.request.headers.has('range'))return;
e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{if(res.ok&&res.status===200&&!e.request.url.endsWith('.mp4')){const cl=res.clone();caches.open(C).then(c=>c.put(e.request,cl))}return res})))});
