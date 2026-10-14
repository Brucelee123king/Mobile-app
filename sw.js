const C = "fit90-v6";
const FILES = ["./", "index.html", "style.css", "app.js", "data.js", "guides.js", "poses_a.js", "poses_b.js", "scene3d.js", "vendor/three.module.min.js", "vendor/GLTFLoader.js", "vendor/BufferGeometryUtils.js", "vendor/SkeletonUtils.js", "vendor/RoomEnvironment.js", "assets/Michelle.glb", "assets/Soldier.glb", "manifest.json", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(C).then(c => c.addAll(FILES))));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))));
self.addEventListener("fetch", e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
