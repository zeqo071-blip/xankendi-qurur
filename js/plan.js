// Hero-dakı “Şimal massivi · sahə planı” SVG-ni yaradır: yollar + 32 sahə (boş/rezerv/satılıb)
// Sahənin üstünə toxunanda/klik edəndə ölçü və qiymət göstərilir (48 ₼/m²)
(function () {
  const M = document.getElementById("map"),
    pi = document.getElementById("pi");
  let h = '<rect x="0" y="108" width="560" height="26" fill="#a9b6cc"/><rect x="268" y="0" width="26" height="246" fill="#a9b6cc"/><path d="M0 121H560M281 0V246" stroke="#f8fafd" stroke-width="2" stroke-dasharray="10 8"/>';
  const col = { f: "var(--gr)", r: "var(--y)", s: "var(--br)" },
    nm = { f: "boş", r: "rezerv edilib", s: "satılıb" };
  let i = 0;
  [[16, 10], [300, 10], [16, 142], [300, 142]].forEach(([bx, by]) => {
    for (let r = 0; r < 2; r++)
      for (let c = 0; c < 4; c++) {
        const k = (i * 7 + 3) % 10,
          st = k < 5 ? "f" : k < 7 ? "r" : "s",
          a = 400 + (i * 37 % 5) * 100;
        h += `<rect class="pl" tabindex="0" data-i="${i+1}" data-a="${a}" data-s="${st}" x="${bx+c*62}" y="${by+r*48}" width="56" height="42" fill="${col[st]}" style="animation-delay:${i*45}ms"/>`;
        i++
      }
  });
  M.innerHTML = h;
  const show = e => {
    const t = e.target;
    if (!t.dataset.a) return;
    pi.textContent = `Sahə №${t.dataset.i} · ${t.dataset.a} m² · 48 ₼/m² · ${nm[t.dataset.s]}`
  };
  M.addEventListener("click", show);
  M.addEventListener("focusin", show)
})();
