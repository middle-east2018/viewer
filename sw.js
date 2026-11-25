/* service worker بتاع عارض الموديلات:
   - الصفحة وملفات التطبيق بتتجاب من النت الأول (علشان التحديثات توصل على طول)، ولو مفيش نت بتفتح آخر نسخة.
   - الموديلات نفسها في cache تاني (me-models-v1) والتطبيق هو اللي بيديره، وده مابيتمسحش هنا أبداً. */
const V = "me-viewer-4b26991f23";
const KEEP = [V, "me-ext", "me-models-v1"];
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/favicon-64.png",
  "vendor/three/build/three.module.js", "vendor/three/build/three.core.js", "vendor/qrcode.mjs", "vendor/three-mesh-bvh.module.js",
  "vendor/three/examples/jsm/controls/OrbitControls.js", "vendor/three/examples/jsm/loaders/GLTFLoader.js",
  "vendor/three/examples/jsm/utils/BufferGeometryUtils.js", "vendor/three/examples/jsm/libs/meshopt_decoder.module.js",
  "vendor/three/examples/jsm/lines/LineSegments2.js", "vendor/three/examples/jsm/lines/LineSegmentsGeometry.js", "vendor/three/examples/jsm/lines/LineMaterial.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => !KEEP.includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) {
    if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.host)) {
      e.respondWith(caches.open("me-ext").then(async c => { const m = await c.match(r); if (m) return m; const res = await fetch(r); if (res.ok || res.type === "opaque") c.put(r, res.clone()); return res; }));
    }
    return;
  }
  if (u.pathname.includes("/__me_model/")) return;
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put("index.html", cp)); return res; }).catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; }).catch(() => caches.match(r)));
});
