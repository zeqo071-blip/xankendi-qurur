// ======================================================================
// 1) KÖMƏKÇİ FUNKSİYALAR
// ======================================================================
// $  → bir element tapır (querySelector); $$ → bütün uyğun elementləri massiv kimi qaytarır.
const $ = s => document.querySelector(s),
  $$ = s => [...document.querySelectorAll(s)];

// Ədədi “6 400” kimi (ru-RU) boşluqla ayrılmış formada yazır
const fmt = n => n.toLocaleString('ru-RU');

// ======================================================================
// 2) NÜMUNƏ MƏLUMATLAR
// ======================================================================
// D: bölgələr. n=ad, civ=mülki, work=işçi, stu=tələbə, sch=şagird (əhali qrupları),
//    land=boş ərazi (m²), plots=satışdakı sahə sayı, ppm=torpağın 1 m² qiyməti (₼)
const D = [
  { n: "Mərkəz", civ: 4452, work: 3617, stu: 2157, sch: 1600, land: 48000, plots: 34, ppm: 120 },
  { n: "Şimal massivi", civ: 2852, work: 1948, stu: 626, sch: 1113, land: 215000, plots: 96, ppm: 48 },
  { n: "Cənub massivi", civ: 2504, work: 1461, stu: 417, sch: 974, land: 182000, plots: 71, ppm: 55 },
  { n: "Şərq qəsəbəsi", civ: 1530, work: 904, stu: 174, sch: 626, land: 310000, plots: 128, ppm: 32 },
  { n: "Qərb qəsəbəsi", civ: 1322, work: 765, stu: 139, sch: 557, land: 264000, plots: 104, ppm: 36 }
];

// H: elan olunmuş evlər. d=bölgə, t=növ, a=sahə (m²), r=otaq sayı, p=qiymət (₼)
const H = [
  { d: "Mərkəz", t: "Mənzil", a: 62, r: 2, p: 98000 },
  { d: "Mərkəz", t: "Mənzil", a: 85, r: 3, p: 136000 },
  { d: "Mərkəz", t: "Ticarət sahəsi", a: 120, r: 0, p: 240000 },
  { d: "Şimal massivi", t: "Həyət evi", a: 140, r: 5, p: 155000 },
  { d: "Şimal massivi", t: "Mənzil", a: 70, r: 3, p: 79000 },
  { d: "Cənub massivi", t: "Həyət evi", a: 110, r: 4, p: 118000 },
  { d: "Cənub massivi", t: "Mənzil", a: 55, r: 2, p: 58000 },
  { d: "Şərq qəsəbəsi", t: "Həyət evi", a: 180, r: 6, p: 142000 },
  { d: "Şərq qəsəbəsi", t: "Yarımçıq tikili", a: 95, r: 3, p: 52000 },
  { d: "Qərb qəsəbəsi", t: "Həyət evi", a: 130, r: 4, p: 104000 },
  { d: "Qərb qəsəbəsi", t: "Mənzil", a: 65, r: 2, p: 61000 }
];

// CAT: əhali qrupları: [D-dəki açar, göstərilən ad, donut rəngi (CSS dəyişəni)]
const CAT = [
  ["civ", "Mülki vətəndaş", "--c1"],
  ["work", "İşçi və qulluqçu", "--c2"],
  ["stu", "Tələbə", "--c3"],
  ["sch", "Şagird", "--c4"]
];

// Proqramın cari vəziyyəti: tab = açıq tab; store = localStorage işləməyəndə ehtiyat yaddaş
let tab = "dash",
  store = {};

// localStorage üçün qoruyucu sarğı: brauzer icazə vermirsə, yaddaşda (store) saxlayır
const ls = {
  get(k) {
    try {
      return localStorage.getItem(k)
    } catch (e) {
      return store[k] || null
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v)
    } catch (e) {
      store[k] = v
    }
  }
};

// Rəqəmi 0-dan hədəfə qədər 1.3 saniyəyə “sayaraq” göstərir (animasiya)
function count(el, to) {
  const t0 = performance.now();
  (function f(t) {
    const k = Math.min(1, (t - t0) / 1300),
      e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(Math.round(to * e));
    if (k < 1) requestAnimationFrame(f)
  })(t0)
}

// Yuxarıdakı 4 statistika qutusunu doldurur (ümumi əhali, boş ərazi, sahə sayı, elan sayı)
function stats() {
  const s = k => D.reduce((a, x) => a + x[k], 0);
  const it = [
    [D.reduce((a, x) => a + x.civ + x.work + x.stu + x.sch, 0), "Ümumi əhali"],
    [s("land"), "Boş ərazi (m²)"],
    [s("plots"), "Satışda torpaq sahəsi"],
    [H.length, "Elan olunmuş ev"]
  ];
  $("#stats").innerHTML = it.map(i => `<div><b>0</b><span>${i[1]}</span></div>`).join("");
  $$("#stats b").forEach((b, i) => count(b, it[i][0]))
}

// Bölgə seçimi (dropdown): “Bütün bölgələr” + D-dəki bölgələr
const dsel = $("#dist");
dsel.innerHTML = '<option value="">Bütün bölgələr</option>' + D.map(x => `<option>${x.n}</option>`).join("");

// Sıralama seçimini aktiv taba görə dəyişir (əhali / boş ərazi / evlər üçün fərqli variantlar)
function sorts() {
  const o = {
    pop: [["", "Standart"]],
    land: [["land", "Ən böyük sahə"], ["ppm", "Ən ucuz m²"]],
    home: [["p", "Ən ucuz"], ["a", "Ən böyük sahə"], ["fav", "Yalnız seçilmişlər"]]
  }[tab] || [["", "Standart"]];
  $("#sort").innerHTML = o.map(x => `<option value="${x[0]}">${x[1]}</option>`).join("")
}

// ======================================================================
// 3) PANELİN TABLARI
// ======================================================================
// render0: üç sadə tabı çəkir — “Əhali” (donut), “Boş ərazilər” (cədvəl), “Evlər” (cədvəl)
function render0() {
  const d = dsel.value,
    sk = $("#sort").value,
    v = $("#view");
  const rows = D.filter(x => !d || x.n === d);
  if (tab === "pop") {
    // --- Əhali tabı: hər qrupun cəmi və donut diaqramın qövsləri ---
    const tot = CAT.map(c => rows.reduce((a, x) => a + x[c[0]], 0)),
      sum = tot.reduce((a, b) => a + b, 0);
    let off = 0;
    const R = 94,
      C = 2 * Math.PI * R;
    const arcs = CAT.map((c, i) => {
      const len = tot[i] / sum * C,
        s = `<circle cx="120" cy="120" r="${R}" stroke="var(${c[2]})" stroke-dasharray="0 ${C}" data-d="${len-2} ${C-len+2}" stroke-dashoffset="${-off}"/>`;
      off += len;
      return s
    }).join("");
    v.innerHTML = `<div class="glass pop"><div class="donut"><svg viewBox="0 0 240 240" width="240" height="240">${arcs}</svg><div class="mid"><b>0</b><span class="sub" style="margin:0">nəfər</span></div></div><div class="legend">${CAT.map((c,i)=>`<div class="lg"><i style="background:var(${c[2]})"></i><span>${c[1]}</span><b>${fmt(tot[i])} (${Math.round(tot[i]/sum*100)}%)</b><div class="t"><u style="width:0;background:var(${c[2]})" data-w="${tot[i]/sum*100}%"></u></div></div>`).join("")}</div></div>`;
    count(v.querySelector(".mid b"), sum);
    setTimeout(() => {
      v.querySelectorAll("circle").forEach(c => c.setAttribute("stroke-dasharray", c.dataset.d));
      v.querySelectorAll("u").forEach(u => u.style.width = u.dataset.w)
    }, 60)
  } else if (tab === "land") {
    // --- Boş ərazilər tabı: cədvəl, seçilmiş sıralamaya görə ---
    let r = [...rows];
    if (sk) r.sort((a, b) => sk === "ppm" ? a.ppm - b.ppm : b[sk] - a[sk]);
    v.innerHTML = `<div class="glass tw"><table><tr><th>Bölgə</th><th>Boş ərazi (m²)</th><th>Sahə sayı</th><th>Orta sahə (m²)</th><th>1 m² qiymət</th></tr>${r.map((x,i)=>`<tr class="r" style="animation-delay:${i*70}ms"><td><b>${x.n}</b></td><td class="n">${fmt(x.land)}</td><td class="n">${x.plots}</td><td class="n">${fmt(Math.round(x.land/x.plots))}</td><td class="n"><b>${x.ppm} ₼</b></td></tr>`).join("")}</table></div>`
  } else {
    // --- Evlər tabı (cədvəl görünüşü): bölgə və maksimum qiymətə görə filtr, sıralama, ★ düyməsi ---
    let r = H.filter(x => (!d || x.d === d) && x.p <= maxP());
    if (sk === "fav") r = r.filter(x => fav().includes(key(x)));
    else if (sk) r.sort((a, b) => sk === "p" ? a.p - b.p : b.a - a.a);
    v.innerHTML = r.length ? `<div class="glass tw"><table><tr><th>Bölgə</th><th>Növ</th><th>Sahə (m²)</th><th>Otaq</th><th>Qiymət</th><th>1 m²</th><th></th></tr>${r.map((x,i)=>`<tr class="r" tabindex="0" data-k="${key(x)}" style="animation-delay:${i*50}ms"><td>${x.d}</td><td><span class="tag">${x.t}</span>${x.ph?`<br><small>${esc(x.ph)}</small>`:""}</td><td class="n">${x.a}</td><td class="n">${x.r||"–"}</td><td class="n"><b>${fmt(x.p)} ₼</b></td><td class="n">${fmt(Math.round(x.p/x.a))} ₼</td><td><button class="fv" data-k="${key(x)}" aria-label="Seç">${fav().includes(key(x))?"★":"☆"}</button></td></tr>`).join("")}</table></div>` : '<p class="sub">Bu bölgədə hələ elan yoxdur.</p>'
  }
}
$$(".tabs button").forEach(b => b.onclick = () => {
  tab = b.dataset.t;

  // Tab düymələrinə klik: aktiv tabı dəyişir, sıralamanı yeniləyir, yenidən çəkir
  // Filtr/sıralama dəyişəndə də panel yenidən çəkilir (render)
  $$(".tabs button").forEach(x => x.setAttribute("aria-selected", x === b));
  sorts();
  render()
});
dsel.onchange = render;
$$(".tabs button").forEach(b => b.addEventListener("click", () => { if (!$("#panel").hidden) hs("#/panel/" + b.dataset.t) }));
$("#sort").onchange = render;

/* auth card */

// ======================================================================
// 4) QEYDİYYAT / GİRİŞ (yalnız demo — məlumat brauzerdə saxlanılır)
// ======================================================================
// mode: reg=qeydiyyat, in=giriş; step: qeydiyyat addımı (1-3); F: forma məlumatı; err: xəta mətni
let mode = "reg",
  step = 1,
  F = { nm: "", em: "", pw: "", rl: "Tikintiçi" },
  err = "";

// sha256js: crypto.subtle olmayan (http / sandbox) mühitlərdə eyni SHA-256 nəticəsini verən ehtiyat funksiya
function sha256js(str) {
  const rr = (x, n) => (x >>> n) | (x << (32 - n)), K = [], H = [], isC = {};
  for (let c = 2, pc = 0; pc < 64; c++) if (!isC[c]) { for (let i = 0; i < 313; i += c) isC[i] = c; if (pc < 8) H[pc] = (Math.pow(c, .5) * 4294967296) | 0; K[pc++] = (Math.pow(c, 1 / 3) * 4294967296) | 0 }
  const b = Array.from(new TextEncoder().encode(str)), bl = b.length * 8;
  b.push(128);
  while (b.length % 64 !== 56) b.push(0);
  [Math.floor(bl / 4294967296), bl >>> 0].forEach(v => { for (let i = 3; i >= 0; i--) b.push((v >>> (i * 8)) & 255) });
  for (let o = 0; o < b.length; o += 64) {
    const w = [];
    for (let i = 0; i < 64; i++) {
      if (i < 16) w[i] = (b[o + i * 4] << 24) | (b[o + i * 4 + 1] << 16) | (b[o + i * 4 + 2] << 8) | b[o + i * 4 + 3];
      else w[i] = (w[i - 16] + (rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) + w[i - 7] + (rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10))) | 0
    }
    let [a, bb, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0,
        t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0
    }
    [a, bb, c, d, e, f, g, h].forEach((v, i) => H[i] = (H[i] + v) | 0)
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, "0")).join("")
}

// Parolu SHA-256 ilə hash-ləyir (brauzer dəstəkləmirsə, ehtiyat olaraq btoa)
async function hash(s) {
  try {
    const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("")
  } catch (e) {
    return sha256js(s)
  }
}

// users(): bütün qeydiyyatlı istifadəçilər; cur(): hazırda daxil olmuş istifadəçi
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// SEED: 4 daimi admin hesabı (parol yalnız hash şəklindədir)
const SEED = {"ayxan@smartxan.az": {"nm": "Ayxan", "role": "Admin", "h": "f8f1afa2259ad702345cd6fd9d0e20e624cead595cda83bd5136ca54a00f8aae"}, "fateh@smartxan.az": {"nm": "Fateh", "role": "Admin", "h": "b29935b85da4a3c61caa181c244dd912d824386932daf67cecf0a46a5f3cc740"}, "cahandar@smartxan.az": {"nm": "Cahandar", "role": "Admin", "h": "ba41627b83cfcae993d46f9f9cfa8161deeaf85358ebcdc18083c90e40eb421f"}, "zakir@smartxan.az": {"nm": "Zakir", "role": "Admin", "h": "2b2cee6bccf5f6aad7c3466669d741496cd05ee7bde947b139b8c1f54c31142c"}};
const users = () => {
  let u = {};
  try {
    u = JSON.parse(ls.get("xq_users") || "{}")
  } catch (e) {}
  return Object.assign(u, SEED)
};
const saveUsers = u => {
  const o = Object.assign({}, u);
  Object.keys(SEED).forEach(k => delete o[k]);
  ls.set("xq_users", JSON.stringify(o))
};
const isAdm = () => { const u = cur(); return !!u && u.role === "Admin" };
let fails = 0, lockUntil = 0;
const cur = () => users()[ls.get("xq_s")];

// Sağdakı kartı çəkir: giriş edibsə “Xoş gəldin”, yoxsa qeydiyyat/giriş formasını
function card() {
  const c = $("#card"),
    u = cur();
  if (u) {
    c.innerHTML = `<div class="ok"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38"/><path d="M32 52l13 13 24-28"/></svg><h2 style="margin:12px 0 8px">Xoş gəldin, ${esc(u.nm.split(" ")[0])}!</h2><p class="sub">Rolun: ${u.role}. Panel açıldı.</p><button class="btn pri" id="op">Paneli aç</button> <button class="btn" id="lo">Çıxış</button></div>`;
    $("#op").onclick = () => { closeM($("#authM")); goTo("#/panel") };
    $("#lo").onclick = () => {
      closeM($("#authM"));
      ls.set("xq_s", "");
      session()
    };
    return
  }
  const reg = mode === "reg",
    n = reg ? 3 : 1;
  let body = "";
  if (!reg) body = `<label for="em">E-poçt</label><input id="em" type="email" autocomplete="email" value="${F.em}"><label for="pw">Parol</label><input id="pw" type="password" autocomplete="current-password">`;
  else if (step === 1) body = `<label for="nm">Ad və soyad</label><input id="nm" autocomplete="name" placeholder="Məs: Aysel Məmmədova" value="${F.nm}">`;
  else if (step === 2) body = `<label for="em">E-poçt</label><input id="em" type="email" autocomplete="email" placeholder="ad@mail.com" value="${F.em}"><label for="pw">Parol (ən azı 6 simvol)</label><input id="pw" type="password" autocomplete="new-password">`;
  else body = `<label>Mən kiməm?</label><div class="chips">${["Tikintiçi","Ev alıcısı","Ev satıcısı","İnvestor"].map(r=>`<button class="chip" aria-pressed="${F.rl===r}" data-r="${r}">${r}</button>`).join("")}</div>`;
  c.innerHTML = `<h2>${reg?"Platformaya qoşul":"Daxil ol"}</h2>${reg?`<div class="seg">${[1,2,3].map(i=>`<i class="${i<=step?"on":""}"></i>`).join("")}</div>`:""}${body}<p class="err" role="alert">${err}</p><div class="row"><span>${reg?`Addım ${step} / ${n}`:""}</span><button class="btn pri" id="nx">${!reg?"Daxil ol":step<3?"Davam et":"Hesab yarat"}</button></div><p class="demo">${reg?'Hesabın var? <button class="sw" id="sw">Daxil ol</button>':'Hesabın yoxdur? <button class="sw" id="sw">Qeydiyyat</button>'}</p>`;
  $$(".chip").forEach(b => b.onclick = () => {
    F.rl = b.dataset.r;
    card()
  });
  $("#sw").onclick = () => {
    mode = reg ? "in" : "reg";
    step = 1;
    err = "";
    card()
  };
  $("#nx").onclick = next;
  const f = c.querySelector("input");
  if (f && window.innerWidth > 900) f.focus();
  c.querySelectorAll("input").forEach(i => i.onkeydown = e => {
    if (e.key === "Enter") next()
  })
}

// Formadakı input dəyərlərini F obyektinə köçürür (e-poçt kiçik hərflə)
function grab() {
  ["nm", "em", "pw"].forEach(k => {
    const e = $("#" + k);
    if (e) F[k] = k === "em" ? e.value.trim().toLowerCase() : e.value
  })
}

// “Davam et / Daxil ol / Hesab yarat” düyməsi: yoxlama aparır, xəta varsa göstərir, yoxdursa irəli gedir
async function next() {
  grab();
  err = "";
  const u = users();
  if (mode === "in") {
    if (Date.now() < lockUntil) err = "Çox yanlış cəhd. " + Math.ceil((lockUntil - Date.now()) / 1000) + " san. gözlə.";
    else if (!/^\S+@\S+\.\S+$/.test(F.em)) err = "E-poçt ünvanını düzgün yaz.";
    else {
      const h = await hash(F.pw);
      if (!u[F.em] || u[F.em].h !== h) {
        err = "E-poçt və ya parol yanlışdır.";
        if (++fails >= 5) { fails = 0; lockUntil = Date.now() + 30000 }
      } else {
        fails = 0;
        ls.set("xq_s", F.em);
        return session(true)
      }
    }
    return card()
  }
  if (step === 1) {
    if (F.nm.length < 3) err = "Adını və soyadını yaz.";
    else step = 2
  } else if (step === 2) {
    if (!/^\S+@\S+\.\S+$/.test(F.em)) err = "E-poçt ünvanını düzgün yaz.";
    else if (F.pw.length < 6) err = "Parol ən azı 6 simvol olmalıdır.";
    else if (u[F.em]) err = "Bu e-poçt artıq qeydiyyatdadır. Daxil ol bölməsinə keç.";
    else step = 3
  } else {
    u[F.em] = { nm: F.nm, role: F.rl, h: await hash(F.pw) };
    saveUsers(u);
    ls.set("xq_s", F.em);
    F.pw = "";
    return session(true)
  }
  card()
}

// Giriş vəziyyətini tətbiq edir: paneli kilidləyir/açır, nav-dakı düyməni və kartı yeniləyir
function session(go) {
  const u = cur();
  $("#panel").classList.toggle("locked", !u);
  $("#navA").innerHTML = u ? `<b>${esc(u.nm.split(" ")[0])}</b>${u.role === "Admin" ? '<span class="rb">ADMIN</span>' : ""}<button class="btn" id="nlo">Çıxış</button>` : `<button class="btn pri" id="nb">Şəxsi kabinet</button>`;
  $("#admL").hidden = !isAdm();
  if (u) $("#nlo").onclick = () => { ls.set("xq_s", ""); session() };
  if (!u) {
    const b = $("#nb");
    b.onclick = () => {
      openAuth("reg")
    }
  }
  $("#ctaB").innerHTML = u ? '<a class="btn pri" href="#/panel">Panelə keç →</a>' : '<button class="btn pri" id="c1">Pulsuz qeydiyyat</button><button class="btn" id="c2">Daxil ol</button>';
  if (!u) { $("#c1").onclick = () => openAuth("reg"); $("#c2").onclick = () => openAuth("in") }
  card();
  route();
  if (go) setTimeout(() => { closeM($("#authM")); goTo("#/panel") }, 1400)
}

// Pərdədəki “Qeydiyyata keç” düyməsi
$("#gt").onclick = () => {
  mode = "reg";
  step = 1;
  card();
  openAuth("reg")
};

// ======================================================================
// 5) SEÇİLMİŞLƏR, ELANLAR VƏ QİYMƏT TENDENSİYASI MƏLUMATI
// ======================================================================
// key(): hər evə unikal açar (seçilmişlər üçün); fav(): ★ ilə seçilmiş evlərin açarları
const key = x => [x.d, x.t, x.a, x.p].join("|");
const fav = () => {
  try {
    return JSON.parse(ls.get("xq_fav") || "[]")
  } catch (e) {
    return []
  }
};

// İstifadəçinin əvvəl əlavə etdiyi elanları yaddaşdan oxuyub H siyahısına qatır
let ADS = [];
try {
  ADS = JSON.parse(ls.get("xq_ads") || "[]")
} catch (e) {}
ADS.forEach(x => H.push(x));
// DEF: ilkin bölgə məlumatı; admin dəyişiklikləri xq_d-də saxlanılır
const DEF = JSON.parse(JSON.stringify(D)), DK = ["civ", "work", "stu", "sch", "land", "plots", "ppm"];
try { JSON.parse(ls.get("xq_d") || "[]").forEach((o, i) => D[i] && Object.assign(D[i], o)) } catch (e) {}

// TR: hər bölgə üzrə son 8 ayda 1 m² ev qiyməti (₼); MO: ay adları; TC: qrafik xətlərinin rəngləri; hid: gizlədilmiş xətlər
const TR = {
  "Mərkəz": [1480, 1500, 1530, 1560, 1590, 1610, 1650, 1690],
  "Şimal massivi": [980, 990, 1000, 1030, 1040, 1070, 1085, 1110],
  "Cənub massivi": [900, 905, 925, 930, 950, 960, 980, 990],
  "Şərq qəsəbəsi": [700, 710, 715, 730, 735, 760, 770, 790],
  "Qərb qəsəbəsi": [740, 745, 760, 770, 775, 790, 805, 820]
};
const MO = ["Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt"],
  TC = ["var(--bl)", "var(--br)", "#e29f00", "var(--gr)", "var(--ink)"];
let hid = {};

// Yuxarıdakı hərəkətli lent: hər bölgənin son qiyməti və son aydakı dəyişmə (▲/▼ %)
const tk = Object.keys(TR).map(n => {
  const a = TR[n],
    c = (a[7] / a[6] - 1) * 100;
  return `<span>${n} <b>${fmt(a[7])} ₼/m²</b> <i class="${c>=0?"up":"dn"}">${c>=0?"▲":"▼"} ${Math.abs(c).toFixed(1).replace(".",",")}%</i></span>`
}).join("");
$("#tk").innerHTML = tk + tk;

// Əsas çəkmə funksiyası: aktiv taba uyğun render funksiyasını çağırır, lazımsız filtrləri gizlədir
function render() {
  $(".bar").style.display = ["pop", "land", "home"].includes(tab) ? "" : "none";
  $$(".hm").forEach(e => e.style.display = tab === "home" ? "" : "none");
  const v = $("#view");
  if (tab === "dash") return rDash(v);
  if (tab === "map") return rMap(v);
  if (tab === "cmp") return rCmp(v);
  if (tab === "home" && hv === "cards") return rCards(v);
  if (tab === "trend") return rTrend(v);
  if (tab === "calc") return rCalc(v);
  if (tab === "add") return rAdd(v);
  if (tab === "adm") return rAdm(v);
  render0()
}

// ★ düyməsinə klik (hər yerdə): seçilmişlərə əlavə et / çıxar, toast göstər
$("#view").addEventListener("click", e => {
  const b = e.target.closest(".fv");
  if (!b) return;
  const f = fav(),
    k = b.dataset.k,
    i = f.indexOf(k);
  i < 0 ? f.push(k) : f.splice(i, 1);
  ls.set("xq_fav", JSON.stringify(f));
  toast(i < 0 ? "Seçilmişlərə əlavə olundu" : "Seçilmişlərdən çıxarıldı");
  render()
});

// Nav linkləri müvafiq taba keçir


// rDash: “Dashboard” — əsas göstəricilər (KPI), bölgələr üzrə sütunlar, orta qiymət xətti, ən sərfəli elanlar
function rDash(v) {
  const pop = D.map(x => ({ n: x.n, v: CAT.reduce((a, c) => a + x[c[0]], 0) })),
    totP = pop.reduce((a, x) => a + x.v, 0),
    totL = D.reduce((a, x) => a + x.land, 0),
    plots = D.reduce((a, x) => a + x.plots, 0),
    avgPpm = Math.round(D.reduce((a, x) => a + x.ppm * x.land, 0) / totL),
    hm2 = Math.round(H.reduce((a, x) => a + x.p, 0) / H.reduce((a, x) => a + x.a, 0)),
    names = Object.keys(TR),
    avg = MO.map((_, i) => Math.round(names.reduce((a, n) => a + TR[n][i], 0) / names.length)),
    chg = (avg[7] / avg[0] - 1) * 100;
  const bars = (arr, max, unit, cls) => arr.map(x => `<div class="ds-b ${cls||""}"><span>${x.n}</span><i><u data-w="${(x.v/max*100).toFixed(1)}%"></u></i><span>${fmt(x.v)}${unit}</span></div>`).join("");
  const mp = Math.max(...pop.map(x => x.v)),
    land = D.map(x => ({ n: x.n, v: x.land })),
    ml = Math.max(...land.map(x => x.v));
  const W = 520, Ht = 190, p = 28, lo = Math.min(...avg) - 20, hi = Math.max(...avg) + 20,
    X = i => p + i * (W - 2 * p) / 7, Y = a => Ht - 26 - (a - lo) / (hi - lo) * (Ht - 56);
  const pts = avg.map((a, i) => `${X(i).toFixed(1)},${Y(a).toFixed(1)}`).join(" ");
  const line = `<svg viewBox="0 0 ${W} ${Ht}" style="width:100%;height:auto;display:block"><polygon points="${X(0)},${Ht-26} ${pts} ${X(7)},${Ht-26}" fill="rgba(255,180,3,.28)"/><polyline points="${pts}" fill="none" stroke="var(--ink)" stroke-width="3.5" stroke-linejoin="round"/>${avg.map((a,i)=>`<circle cx="${X(i)}" cy="${Y(a)}" r="4.5" fill="var(--y)" stroke="var(--ink)" stroke-width="2.5"><title>${MO[i]}: ${fmt(a)} ₼/m²</title></circle><text x="${X(i)}" y="${Ht-8}" font-size="12" font-weight="600" text-anchor="middle" fill="var(--mut)">${MO[i]}</text>`).join("")}<text x="${X(7)}" y="${Y(avg[7])-12}" font-size="13" font-weight="700" text-anchor="end" fill="var(--ink)">${fmt(avg[7])} ₼</text></svg>`;
  const cheap = [...H].sort((a, b) => a.p / a.a - b.p / b.a).slice(0, 5);
  v.innerHTML = `<div class="dsh">
    <div class="ds-k">
      <div class="glass"><small>Ümumi əhali</small><b data-c="${totP}">0</b><em>5 bölgə üzrə</em></div>
      <div class="glass"><small>Boş ərazi (hektar)</small><b data-c="${Math.round(totL/10000)}">0</b><em>${fmt(totL)} m²</em></div>
      <div class="glass"><small>Satışda sahə</small><b data-c="${plots}">0</b><em>orta ${fmt(avgPpm)} ₼/m²</em></div>
      <div class="glass"><small>Elan olunmuş ev</small><b data-c="${H.length}">0</b><em>orta ${fmt(hm2)} ₼/m²</em></div>
      <div class="glass"><small>Qiymət dəyişməsi</small><b>${chg>=0?"▲":"▼"} ${Math.abs(chg).toFixed(1).replace(".",",")}%</b><em>${MO[0]} – ${MO[7]}</em></div>
    </div>
    <div class="ds-g">
      <div class="glass"><h4>Əhali (bölgələr üzrə)</h4>${bars(pop, mp, " nəf.")}</div>
      <div class="glass"><h4>Boş ərazi (m²)</h4>${bars(land, ml, "", "y")}</div>
      <div class="glass"><h4>Orta ev qiyməti (₼/m²)</h4>${line}</div>
      <div class="glass"><h4>Ən sərfəli 5 elan</h4><table class="ds-t"><tr><th>Bölgə</th><th>Növ</th><th>Sahə</th><th>Qiymət</th></tr>${cheap.map(x=>`<tr><td>${x.d}</td><td>${x.t}</td><td>${x.a} m²</td><td><b>${fmt(x.p)} ₼</b></td></tr>`).join("")}</table></div>
    </div></div>`;
  v.querySelectorAll("[data-c]").forEach(e => count(e, +e.dataset.c));
  setTimeout(() => v.querySelectorAll("u[data-w]").forEach(u => u.style.width = u.dataset.w), 60)
}

// ======================================================================
// 6) QRAFİK, KALKULYATOR, ELAN, XƏRİTƏ, KARTLAR, MÜQAYİSƏ
// ======================================================================
// rTrend: “Qiymət tendensiyası” — SVG xətt qrafiki (legend ilə xətləri gizlətmək, tooltip)
function rTrend(v) {
  const W = 640,
    Ht = 300,
    L = 52,
    R = 16,
    T = 16,
    B = 34,
    names = Object.keys(TR),
    all = Object.values(TR).flat(),
    mn = Math.floor(Math.min(...all) / 100) * 100,
    mx = Math.ceil(Math.max(...all) / 100) * 100;

  // X, Y: dəyəri SVG koordinatına çevirir (ay → üfüqi, qiymət → şaquli)
  const X = i => L + i * (W - L - R) / 7,
    Y = y => T + (mx - y) / (mx - mn) * (Ht - T - B);
  let g = "";

  // Qrafikin şaquli oxu (200-lük şəbəkə xətləri) və aşağıdakı ay adları
  for (let y = mn; y <= mx; y += 200) g += `<path d="M${L} ${Y(y)}H${W-R}" stroke="#c0cadb"/><text x="${L-8}" y="${Y(y)+4}" text-anchor="end" font-size="12" fill="#4d5d77">${fmt(y)}</text>`;
  MO.forEach((m, i) => g += `<text x="${X(i)}" y="${Ht-10}" text-anchor="middle" font-size="12" fill="#4d5d77">${m}</text>`);

  // Hər bölgə üçün bir xətt (gizlədilməyibsə)
  const ln = names.map((n, k) => hid[n] ? "" : `<path class="ln" pathLength="1" d="${TR[n].map((y,i)=>(i?"L":"M")+X(i)+" "+Y(y)).join("")}" fill="none" stroke="${TC[k]}" stroke-width="3.5" style="animation-delay:${k*.15}s"/>`).join("");
  v.innerHTML = `<div class="glass pop2"><div class="lgn">${names.map((n,k)=>`<button class="lb" data-n="${n}" aria-pressed="${!hid[n]}"><i style="background:${TC[k]}"></i><span>${n}</span><b>+${((TR[n][7]/TR[n][0]-1)*100).toFixed(1).replace(".",",")}%</b></button>`).join("")}</div><div class="chw"><svg id="ch" viewBox="0 0 ${W} ${Ht}">${g}${ln}<path id="cx" d="M0 0" stroke="#122848" stroke-dasharray="4 4" opacity="0"/></svg><div id="tt" class="tt"></div></div><p class="note">1 m² orta qiymət (₼), son 8 ay. Nümunə məlumatdır.</p></div>`;
  $$(".lb").forEach(b => b.onclick = () => {
    hid[b.dataset.n] = !hid[b.dataset.n];
    rTrend(v)
  });
  const s = $("#ch"),
    tt = $("#tt"),
    cx = $("#cx");

  // Siçanı/barmağı qrafikin üstündə gəzdirəndə ən yaxın ayı tapıb şaquli xətt və tooltip göstərir
  s.onpointermove = e => {
    const r = s.getBoundingClientRect(),
      px = (e.clientX - r.left) / r.width * W,
      i = Math.max(0, Math.min(7, Math.round((px - L) / ((W - L - R) / 7))));
    cx.setAttribute("d", `M${X(i)} ${T}V${Ht-B}`);
    cx.style.opacity = 1;
    tt.style.opacity = 1;
    tt.style.left = Math.min(X(i) / W * 100, 62) + "%";
    tt.innerHTML = `<b>${MO[i]}</b>` + names.filter(n => !hid[n]).map(n => `<div>${n}: ${fmt(TR[n][i])} ₼</div>`).join("")
  };
  s.onpointerleave = () => {
    cx.style.opacity = 0;
    tt.style.opacity = 0
  }
}

// rCalc: iki kalkulyator — ipoteka (aylıq ödəniş) və tikinti xərci. LV: keyfiyyət səviyyəsi (₼/m²), BK: xərc bölgüsü (%)
function rCalc(v) {
  const LV = [["Ekonom", 480], ["Standart", 680], ["Premium", 980]],
    BK = [["Təməl", 14], ["Karkas", 32], ["Dam", 10], ["Daxili işlər", 24], ["Mühəndis sistemləri", 20]];
  let lv = 1;
  v.innerHTML = `<div class="cg"><div class="glass cc"><h3>İpoteka kalkulyatoru</h3>
<label>Ev qiyməti: <b id="a1v"></b></label><input type="range" id="a1" min="30000" max="400000" step="5000" value="120000">
<label>İlkin ödəniş: <b id="a2v"></b></label><input type="range" id="a2" min="10" max="70" step="5" value="30">
<label>Müddət: <b id="a3v"></b></label><input type="range" id="a3" min="3" max="30" step="1" value="15">
<label>Faiz: <b id="a4v"></b></label><input type="range" id="a4" min="4" max="16" step=".5" value="9">
<div class="kpi"><span>Aylıq ödəniş</span><b id="mo">0</b></div><div class="split"><u id="sp1"></u><u id="sp2"></u></div><p class="note" id="sn"></p></div>
<div class="glass cc"><h3>Tikinti xərci</h3><label>Sahə: <b id="b1v"></b></label><input type="range" id="b1" min="50" max="400" step="10" value="140">
<label>Keyfiyyət səviyyəsi</label><div class="chips" id="lv" style="grid-template-columns:repeat(3,1fr)">${LV.map((l,i)=>`<button class="chip" data-i="${i}">${l[0]}<br><small>${l[1]} ₼/m²</small></button>`).join("")}</div>
<div class="kpi"><span>Təxmini xərc</span><b id="tc">0</b></div><div id="bk"></div><p class="note">Nümunə qiymətlərdir. Real smeta üçün mütəxəssislə danış.</p></div></div>`;
  const g = i => +$("#" + i).value;

  // upd: slayderlərdən dəyərləri oxuyub bütün rəqəmləri yenidən hesablayır
  // aylıq ödəniş = annuitet düsturu; tikinti xərci = sahə × səviyyə qiyməti
  const upd = () => {
    const pr = g("a1"),
      dn = g("a2"),
      yr = g("a3"),
      rt = g("a4"),
      P = pr * (1 - dn / 100),
      r = rt / 1200,
      n = yr * 12,
      m = P * r / (1 - Math.pow(1 + r, -n)),
      tot = m * n;
    $("#a1v").textContent = fmt(pr) + " ₼";
    $("#a2v").textContent = dn + "% (" + fmt(Math.round(pr * dn / 100)) + " ₼)";
    $("#a3v").textContent = yr + " il";
    $("#a4v").textContent = String(rt).replace(".", ",") + "%";
    $("#mo").textContent = fmt(Math.round(m)) + " ₼";
    $("#sp1").style.cssText = `width:${P/tot*100}%;background:var(--bl)`;
    $("#sp2").style.cssText = `width:${(tot-P)/tot*100}%;background:var(--br)`;
    $("#sn").textContent = `Kredit ${fmt(Math.round(P))} ₼, faiz üzrə artıq ödəniş ${fmt(Math.round(tot-P))} ₼ (mavi: əsas borc, qırmızı: faiz).`;
    const ar = g("b1"),
      T = ar * LV[lv][1];
    $("#b1v").textContent = ar + " m²";
    $("#tc").textContent = fmt(T) + " ₼";
    $("#bk").innerHTML = BK.map(b => `<div class="bkr"><span>${b[0]}</span><u style="width:${b[1]*2.6}%"></u><b>${fmt(Math.round(T*b[1]/100))} ₼</b></div>`).join("");
    $$("#lv .chip").forEach((c, i) => c.setAttribute("aria-pressed", i === lv))
  };
  $$("#lv .chip").forEach(c => c.onclick = () => {
    lv = +c.dataset.i;
    upd()
  });
  $$(".cc input[type=range]").forEach(i => i.oninput = upd);
  upd()
}

// rAdd: “Elan yerləşdir” formu
function rAdd(v) {
  v.innerHTML = `<div class="glass cc" style="max-width:560px"><h3>Elan yerləşdir</h3><label>Bölgə</label><select id="ad">${D.map(x=>`<option>${x.n}</option>`).join("")}</select>
<label>Növ</label><select id="at"><option>Mənzil</option><option>Həyət evi</option><option>Yarımçıq tikili</option><option>Ticarət sahəsi</option></select>
<div class="two"><div><label>Sahə (m²)</label><input id="aa" type="number" min="10"></div><div><label>Otaq sayı</label><input id="ar" type="number" min="0"></div></div>
<label>Qiymət (₼)</label><input id="ap" type="number" min="1000"><label>Əlaqə nömrəsi</label><input id="ph" type="tel" placeholder="+994 50 000 00 00" autocomplete="tel">
<p class="err" id="ae" role="alert"></p><button class="btn pri" id="as">Elanı əlavə et</button></div>`;

  // Elanı yoxlayır (sahə, qiymət, telefon), siyahıya və yaddaşa əlavə edir, “Evlər” tabına keçir
  $("#as").onclick = () => {
    const a = +$("#aa").value,
      p = +$("#ap").value,
      ph = $("#ph").value.trim(),
      e = $("#ae");
    if (!(a >= 10)) return e.textContent = "Sahəni m² ilə yaz.";
    if (!(p >= 1000)) return e.textContent = "Qiyməti ₼ ilə yaz.";
    if (ph.replace(/\D/g, "").length < 9) return e.textContent = "Əlaqə nömrəsini düzgün yaz.";
    const o = { d: $("#ad").value, t: $("#at").value, a, r: +$("#ar").value || 0, p, ph, by: ls.get("xq_s") || "" };
    H.push(o);
    ADS.push(o);
    ls.set("xq_ads", JSON.stringify(ADS));

    // ======================================================================
    // 8) BAŞLANĞIC: statistika, sıralama, tab və giriş vəziyyəti ilk dəfə çəkilir
    // ======================================================================
    stats();
    $(".tabs [data-t=home]").click();
    dsel.value = o.d;
    render();
    toast("Elan əlavə olundu")
  }
}

// ======================================================================
// 7) FİLTR DÜYMƏLƏRİ, TOAST, XƏRİTƏ, EV KARTLARI, MÜQAYİSƏ
// ======================================================================
// hv: evlər görünüşü (table/cards); mm: xəritənin göstərdiyi göstərici; ms: seçilmiş bölgə; tto: toast taymeri
let hv = "table",
  mm = "pop",
  ms = "Mərkəz",
  tto;

// maxP(): maks. qiymət slayderi; pt(x): bölgənin ümumi əhalisi
const maxP = () => +$("#mp").value,
  pt = x => x.civ + x.work + x.stu + x.sch;

// Aşağıda 2.2 saniyəlik bildiriş göstərir
function toast(m) {
  const t = $("#ts");
  t.textContent = m;
  t.classList.add("on");
  clearTimeout(tto);
  tto = setTimeout(() => t.classList.remove("on"), 2200)
}

// “Kartlar / Cədvəl” görünüş dəyişdirmə və maksimum qiymət slayderi
$("#vt").onclick = () => {
  hv = hv === "cards" ? "table" : "cards";
  $("#vt").textContent = hv === "cards" ? "Cədvəl" : "Kartlar";
  render()
};
$("#mp").oninput = () => {
  $("#mpv").textContent = fmt(+$("#mp").value) + " ₼";
  render()
};
$("#mpv").textContent = fmt(400000) + " ₼";

// PO: xəritədəki bölgələrin çoxbucaqlı koordinatları; LB: bölgə yazılarının mövqeyi
const PO = {
  "Şimal massivi": "90,40 470,30 570,110 410,150 250,150 130,120",
  "Qərb qəsəbəsi": "130,120 250,150 240,240 170,280 40,300 30,170",
  "Mərkəz": "250,150 410,150 420,240 330,280 240,240",
  "Şərq qəsəbəsi": "410,150 570,110 600,230 500,330 420,240",
  "Cənub massivi": "240,240 330,280 420,240 500,330 380,360 200,350 170,280"
};
const LB = {
  "Şimal massivi": [310, 85],
  "Qərb qəsəbəsi": [120, 215],
  "Mərkəz": [330, 200],
  "Şərq qəsəbəsi": [510, 205],
  "Cənub massivi": [320, 310]
};

// MET: xəritənin göstərə biləcəyi göstəricilər: [ad, hesablama funksiyası, vahid]
const MET = {
  pop: ["Əhali", pt, " nəf."],
  ppm: ["Ev 1 m²", x => TR[x.n][7], " ₼"],
  land: ["Boş ərazi", x => x.land, " m²"]
};

// mix(): 0..1 dəyəri açıq sarıdan kərpic qırmızısına rəngə çevirir (xəritə üçün)
const mix = t => {
  const a = [255, 226, 122],
    b = [180, 68, 44];
  return "rgb(" + a.map((c, i) => Math.round(c + (b[i] - c) * t)).join(",") + ")"
};

// score(): bölgənin “investisiya cəlbediciliyi” (0-100): 50% qiymət artımı + 25% boş torpaq + 25% torpağın ucuzluğu
function score(x) {
  const gs = D.map(y => TR[y.n][7] / TR[y.n][0] - 1),
    G = gs[D.indexOf(x)] / Math.max(...gs),
    L = x.land / Math.max(...D.map(y => y.land)),
    A = Math.min(...D.map(y => y.ppm)) / x.ppm;
  return Math.round(100 * (.5 * G + .25 * L + .25 * A))
}

// rMap: bölgə xəritəsi — rəngləmə seçilmiş göstəriciyə görədir; bölgəyə klik detalları göstərir
function rMap(v) {
  const f = MET[mm][1],
    u = MET[mm][2],
    vals = D.map(f),
    mn = Math.min(...vals),
    mx = Math.max(...vals);
  const pl = D.map((x, i) => `<g class="dz" data-n="${x.n}" tabindex="0" role="button" aria-label="${x.n}" style="animation-delay:${i*90}ms"><polygon points="${PO[x.n]}" fill="${mix((f(x)-mn)/(mx-mn||1))}" class="${x.n===ms?"sel":""}"/><text x="${LB[x.n][0]}" y="${LB[x.n][1]}" text-anchor="middle">${x.n}</text><text class="sv" x="${LB[x.n][0]}" y="${LB[x.n][1]+20}" text-anchor="middle">${fmt(f(x))}${u}</text></g>`).join("");
  const x = D.find(y => y.n === ms),
    a = TR[x.n],
    gr = ((a[7] / a[0] - 1) * 100).toFixed(1).replace(".", ","),
    sc = score(x),
    hs = H.filter(h => h.d === x.n).length;
  v.innerHTML = `<div class="lgn">${Object.keys(MET).map(k=>`<button class="lb" data-m="${k}" aria-pressed="${k===mm}"><span>${MET[k][0]}</span></button>`).join("")}</div>
<div class="mapw"><div><svg id="dm" viewBox="0 0 640 380" role="img" aria-label="Xankəndi bölgələri xəritəsi">${pl}</svg><div class="gr"></div><div class="gl"><span>az</span><span>çox</span></div></div>
<div class="glass dp"><h3>${x.n}</h3><div class="dk"><div><b>${fmt(pt(x))}</b><span>əhali</span></div><div><b>${fmt(x.land)} m²</b><span>boş ərazi, ${x.plots} sahə</span></div><div><b>${x.ppm} ₼</b><span>torpaq 1 m²</span></div><div><b>${fmt(a[7])} ₼</b><span>ev 1 m², 8 ayda +${gr}%</span></div></div>
<label>İnvestisiya cəlbediciliyi: <b>${sc}/100</b> (${sc>=80?"yüksək":sc>=60?"orta":"aşağı"})</label><div class="sc"><u style="width:${sc}%"></u></div>
<p class="note">Qiymət artımı, boş torpaq və torpağın ucuzluğu əsasında nümunə hesablama.</p><button class="btn pri" id="gh">${hs} elana bax</button></div></div>`;
  $$(".lb[data-m]").forEach(b => b.onclick = () => {
    mm = b.dataset.m;
    rMap(v)
  });
  $$(".dz").forEach(g => {
    const go = () => {
      ms = g.dataset.n;
      rMap(v)
    };
    g.onclick = go;
    g.onkeydown = e => {
      if (e.key === "Enter") go()
    }
  });
  $("#gh").onclick = () => {
    $(".tabs [data-t=home]").click();
    dsel.value = ms;
    render()
  }
}

// SK: kart şəkillərinin fon rəngləri; thumb(): ev növünə görə sadə SVG şəkil çəkir
const SK = ["#bcd7e6", "#e6d5b8", "#cfe0c4", "#e3c6c0"];

function thumb(t, i) {
  let b = "";
  if (t === "Mənzil") b = `<rect x="70" y="18" width="100" height="102" fill="#8fa0bd" stroke="#122848" stroke-width="3"/>` + [
    0,
    1,
    2
  ].flatMap(r => [0, 1, 2].map(c => `<rect x="${82+c*30}" y="${30+r*30}" width="16" height="18" fill="${(r+c+i)%3?"#ffc63d":"#2a3f66"}"/>`)).join("");
  else if (t === "Həyət evi") b = `<rect x="60" y="62" width="120" height="58" fill="#e8e1d4" stroke="#122848" stroke-width="3"/><path d="M50 64L120 20L190 64Z" fill="#b4442c" stroke="#122848" stroke-width="3"/><rect x="108" y="86" width="26" height="34" fill="#122848"/><rect x="72" y="80" width="22" height="20" fill="#ffc63d" stroke="#122848" stroke-width="2"/><rect x="146" y="80" width="22" height="20" fill="#ffc63d" stroke="#122848" stroke-width="2"/>`;
  else if (t === "Yarımçıq tikili") b = `<rect x="60" y="80" width="60" height="40" fill="#b4442c" opacity=".7"/><path d="M60 120V40M120 120V40M180 120V40M60 40H180M60 80H180" stroke="#122848" stroke-width="6" fill="none"/><path d="M200 120V26H232M232 26V48" stroke="#e29f00" stroke-width="5" fill="none"/>`;
  else b = `<rect x="50" y="50" width="140" height="70" fill="#e8e1d4" stroke="#122848" stroke-width="3"/><path d="M44 50H196L186 30H54Z" fill="#ffb403" stroke="#122848" stroke-width="3"/><rect x="66" y="74" width="60" height="46" fill="#9fd0e8" stroke="#122848" stroke-width="2"/><rect x="142" y="74" width="30" height="46" fill="#122848"/>`;
  return `<svg viewBox="0 0 240 140" class="th" aria-hidden="true"><rect width="240" height="140" fill="${SK[i%4]}"/><rect y="120" width="240" height="20" fill="#7aa56b"/>${b}</svg>`
}

// rCards: “Evlər” tabının kart görünüşü
function rCards(v) {
  const d = dsel.value,
    sk = $("#sort").value;
  let r = H.filter(x => (!d || x.d === d) && x.p <= maxP());
  if (sk === "fav") r = r.filter(x => fav().includes(key(x)));
  else if (sk) r.sort((a, b) => sk === "p" ? a.p - b.p : b.a - a.a);
  v.innerHTML = r.length ? `<div class="cards">${r.map((x,i)=>`<article class="hc" data-k="${key(x)}" style="animation-delay:${i*60}ms">${thumb(x.t,i)}<button class="fv" data-k="${key(x)}" aria-label="Seç">${fav().includes(key(x))?"★":"☆"}</button><div class="hb"><span class="tag">${x.t}</span><h3>${fmt(x.p)} ₼</h3><p>${x.d} · ${x.a} m²${x.r?" · "+x.r+" otaq":""}</p><p class="mu">${fmt(Math.round(x.p/x.a))} ₼ / m²${x.ph?" · "+x.ph:""}</p></div></article>`).join("")}</div>` : '<p class="sub">Bu filtrə uyğun elan yoxdur.</p>'
}

// rAdm: admin idarəetmə paneli — istifadəçilər, elanlar, bölgə məlumatları, CSV
function rAdm(v) {
  if (!isAdm()) { v.innerHTML = '<p class="sub">Bu bölmə yalnız adminlər üçündür.</p>'; return }
  const us = users(), ks = Object.keys(us), RL = ["Tikintiçi", "Ev alıcısı", "Ev satıcısı", "İnvestor"],
    LB2 = { civ: "Mülki", work: "İşçi", stu: "Tələbə", sch: "Şagird", land: "Boş ərazi m²", plots: "Sahə sayı", ppm: "₼/m²" };
  v.innerHTML = `<div class="adm"><div class="glass cc"><h3>İstifadəçilər (${ks.length})</h3><table><tr><th>Ad</th><th>E-poçt</th><th>Rol</th><th></th></tr>${ks.map(k => { const x = us[k], sd = !!SEED[k]; return `<tr><td><b>${esc(x.nm)}</b></td><td>${esc(k)}</td><td>${sd ? '<span class="tag">Admin</span>' : `<select data-ro="${esc(k)}" aria-label="Rol">${RL.map(r => `<option${r === x.role ? " selected" : ""}>${r}</option>`).join("")}</select>`}</td><td>${sd ? "" : `<button class="btn" data-du="${esc(k)}">Sil</button>`}</td></tr>` }).join("")}</table></div>
<div class="glass cc"><h3>Elanlar (${ADS.length} istifadəçi elanı)</h3>${ADS.length ? `<table><tr><th>Bölgə</th><th>Növ</th><th>Qiymət</th><th>Əlaqə</th><th>Əlavə edən</th><th></th></tr>${ADS.map((a, i) => `<tr><td>${esc(a.d)}</td><td>${esc(a.t)}</td><td class="n">${fmt(a.p)} ₼</td><td>${esc(a.ph)}</td><td>${esc(a.by || "–")}</td><td><button class="btn" data-da="${i}">Sil</button></td></tr>`).join("")}</table>` : '<p class="sub">Hələ istifadəçi elanı yoxdur.</p>'}<div class="row2"><button class="btn" id="csv">Bütün evləri CSV yüklə</button></div></div>
<div class="glass cc"><h3>Bölgə məlumatları</h3><table><tr><th>Bölgə</th>${DK.map(k => `<th>${LB2[k]}</th>`).join("")}</tr>${D.map((x, i) => `<tr><td><b>${x.n}</b></td>${DK.map(k => `<td><input type="number" min="0" data-di="${i}" data-k="${k}" value="${x[k]}" aria-label="${x.n} ${LB2[k]}"></td>`).join("")}</tr>`).join("")}</table><div class="row2"><button class="btn pri" id="dsv">Yadda saxla</button><button class="btn" id="drs">İlkin məlumata qaytar</button></div></div></div>`;
  const w = v.firstElementChild;
  w.onchange = e => {
    const k = e.target.dataset.ro;
    if (!k || SEED[k]) return;
    const u = users(); u[k].role = e.target.value; saveUsers(u); toast("Rol dəyişdirildi")
  };
  w.onclick = e => {
    const t = e.target, du = t.dataset.du, da = t.dataset.da;
    if (du && !SEED[du] && confirm(du + " " + T("silinsin?"))) { const u = users(); delete u[du]; saveUsers(u); toast("İstifadəçi silindi"); rAdm(v) }
    else if (da !== undefined) { const a = ADS.splice(+da, 1)[0]; const j = H.indexOf(a); if (j >= 0) H.splice(j, 1); ls.set("xq_ads", JSON.stringify(ADS)); stats(); toast("Elan silindi"); rAdm(v) }
    else if (t.id === "dsv") {
      $$("[data-di]").forEach(i => { D[+i.dataset.di][i.dataset.k] = Math.max(0, +i.value || 0) });
      ls.set("xq_d", JSON.stringify(D.map(x => Object.fromEntries(DK.map(k => [k, x[k]]))))); stats(); toast("Məlumatlar saxlanıldı")
    } else if (t.id === "drs") { D.forEach((x, i) => Object.assign(x, DEF[i])); ls.set("xq_d", "[]"); stats(); toast("İlkin məlumat bərpa olundu"); rAdm(v) }
    else if (t.id === "csv") {
      const q = s => '"' + String(s == null ? "" : s).replace(/"/g, '""') + '"';
      const c = "\ufeffBölgə,Növ,Sahə m²,Otaq,Qiymət ₼,Əlaqə\n" + H.map(x => [x.d, x.t, x.a, x.r, x.p, x.ph].map(q).join(",")).join("\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([c], { type: "text/csv;charset=utf-8" })); a.download = "smartxan-evler.csv"; a.click()
    }
  }
}

// rCmp: ★ ilə seçilmiş ilk 3 evi yan-yana müqayisə edir (✓ = həmin göstəricidə ən yaxşı)
// ipoteka: 30% ilkin ödəniş, 15 il, 9% faiz
function rCmp(v) {
  const f = fav(),
    it = H.filter(x => f.includes(key(x))).slice(0, 3);
  if (it.length < 2) {
    v.innerHTML = `<div class="glass cc" style="max-width:560px"><h3>Müqayisə üçün ev seç</h3><p class="sub">Evlər bölməsində ən azı 2 elanı ★ ilə seç, burada yan-yana müqayisə olunacaq.</p><button class="btn pri" id="tg">Evlərə keç</button></div>`;
    $("#tg").onclick = () => $(".tabs [data-t=home]").click();
    return
  }
  const pm = x => {
    const P = x.p * .7,
      r = .09 / 12;
    return P * r / (1 - Math.pow(1 + r, -180))
  },
    bp = Math.min(...it.map(x => x.p / x.a)),
    ba = Math.max(...it.map(x => x.a)),
    bm = Math.min(...it.map(pm));
  const rows = [
    ["Bölgə", x => x.d],
    ["Növ", x => x.t],
    ["Sahə", x => x.a + " m²" + (x.a === ba ? " ✓" : "")],
    ["Otaq", x => x.r || "–"],
    ["Qiymət", x => fmt(x.p) + " ₼"],
    ["1 m²", x => fmt(Math.round(x.p / x.a)) + " ₼" + (x.p / x.a === bp ? " ✓" : "")],
    ["Aylıq ipoteka*", x => fmt(Math.round(pm(x))) + " ₼" + (pm(x) === bm ? " ✓" : "")]
  ];
  v.innerHTML = `<div class="glass tw"><table><tr><th></th>${it.map((x,i)=>`<th>Seçim ${i+1}</th>`).join("")}</tr>${rows.map(r=>`<tr class="r"><td><b>${r[0]}</b></td>${it.map(x=>`<td class="n">${r[1](x)}</td>`).join("")}</tr>`).join("")}</table></div><p class="note">✓ həmin göstərici üzrə ən yaxşı seçim. *30% ilkin ödəniş, 15 il, 9% faiz. Seçilmişlərdən ilk 3 ev göstərilir.</p>`
}
// ===== PƏNCƏRƏ SİSTEMİ, MARŞRUT (səhifə keçidləri) =====
let lastF, lastP;
const openM = m => { if (!m.classList.contains("on")) lastF = document.activeElement; m.classList.add("on"); document.body.style.overflow = "hidden"; setTimeout(() => { const f = m.querySelector("input,.chip,.btn,.x"); f && f.focus() }, 120) };
const closeM = m => { if (!m.classList.contains("on")) return; m.classList.remove("on"); document.body.style.overflow = ""; lastF && lastF.focus && lastF.focus() };
$$(".mdl").forEach(m => {
  m.addEventListener("mousedown", e => { if (e.target === m) closeM(m) });
  m.addEventListener("click", e => { if (e.target.classList.contains("x")) closeM(m) })
});
document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".mdl.on").forEach(m => closeM(m)) });
function openAuth(m) { mode = m; step = 1; err = ""; card(); openM($("#authM")) }

// Ev təfərrüatı pəncərəsi
function showHome(k) {
  const x = H.find(h => key(h) === k);
  if (!x) return;
  const P = x.p * .7, r = .09 / 12, m = P * r / (1 - Math.pow(1 + r, -180)), f = fav().includes(k), a = TR[x.d];
  $("#infoB").innerHTML = `<span class="tag">${esc(x.t)}</span><h2>${fmt(x.p)} ₼</h2><p class="sub" style="margin:0">${esc(x.d)} · ${x.a} m²${x.r ? " · " + x.r + " otaq" : ""}</p><div class="mk"><div><b>${fmt(Math.round(x.p / x.a))} ₼</b><span>1 m² qiyməti</span></div><div><b>${fmt(Math.round(m))} ₼</b><span>aylıq ipoteka*</span></div><div><b>${fmt(a[7])} ₼</b><span>bölgə orta 1 m²</span></div>${x.ph ? `<div><b>${esc(x.ph)}</b><span>əlaqə</span></div>` : ""}</div><p class="note">*30% ilkin ödəniş, 15 il, 9% faiz (nümunə).</p><div class="row2"><button class="btn pri" id="mf">${f ? "★ Seçilmişlərdən çıxar" : "☆ Seçilmişlərə əlavə et"}</button></div>`;
  $("#mf").onclick = () => { const l = fav(), i = l.indexOf(k); i < 0 ? l.push(k) : l.splice(i, 1); ls.set("xq_fav", JSON.stringify(l)); toast(i < 0 ? "Seçilmişlərə əlavə olundu" : "Seçilmişlərdən çıxarıldı"); showHome(k); render() };
  openM($("#infoM"))
}
$("#view").addEventListener("click", e => { if (e.target.closest(".fv")) return; const c = e.target.closest("[data-k]"); if (c) showHome(c.dataset.k) });
$("#view").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.matches("tr[data-k]")) showHome(e.target.dataset.k) });

// Marşrut: #/ , #/panel[/tab] , #/about , #/admin
// Naviqasiya: linkləri JS özü idarə edir (iframe/sandbox-da #hash keçidləri səhifəni sıfırlamasın deyə)
let RT = "";
try { RT = location.hash } catch (e) {}
function hs(h) { RT = h; try { history.replaceState(null, "", h) } catch (e) {} }
function goTo(h) {
  RT = h;
  try { history.pushState(null, "", h) } catch (e) {}
  route();
  if (/^#\/panel/.test(h) && !cur()) openAuth("in")
}
document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#/"]');
  if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault();
  goTo(a.getAttribute("href"))
});
const PG = { home: "Ana səhifə", panel: "Şəhər paneli", about: "Haqqımızda", admin: "İdarəetmə" };
function route() {
  const h = (RT || "#/").replace(/^#\/?/, "").split("/");
  let p = PG[h[0]] ? h[0] : "home";
  if (p === "admin" && !isAdm()) { p = "home"; hs("#/") }
  $$(".pg").forEach(s => s.hidden = s.dataset.p !== p);
  $$(".nls a[data-p]").forEach(a => a.classList.toggle("on", a.dataset.p === p));
  document.title = T(PG[p]) + " · SmartXan";
  if (p === "panel" && /^\w+$/.test(h[1] || "")) { const b = $(".tabs [data-t=" + h[1] + "]"); if (b && b.getAttribute("aria-selected") !== "true") b.click() }
  if (p === "admin") rAdm($("#admv"));
  if (p !== lastP) { window.scrollTo(0, 0); lastP = p }
}
$("#team").innerHTML = Object.values(SEED).map(x => `<div class="glass" style="padding:20px"><div class="av">${esc(x.nm[0])}</div><b style="font-size:20px">${esc(x.nm)}</b><p style="margin:0;color:var(--mut)">Admin · SmartXan</p></div>`).join("");
const syncR = () => { try { RT = location.hash } catch (e) {} route() };
addEventListener("hashchange", syncR);
addEventListener("popstate", syncR);

// ===== DİL SİSTEMİ: AZ mənbə dilidir; TR / RU / EN lüğət əsasında tətbiq olunur =====
// Mətn düyünləri və atributlar tərcümə olunur, saytın sonradan yaratdığı məzmunu isə MutationObserver tutur.
const TXT = `Ana səhifə=Ana sayfa|Главная|Home
Panel=Panel|Панель|Dashboard
Kalkulyator=Hesaplayıcı|Калькулятор|Calculator
Elan yerləşdir=İlan ver|Разместить объявление|Post a listing
Haqqımızda=Hakkımızda|О нас|About us
İdarəetmə=Yönetim|Управление|Admin
Şəxsi kabinet=Kişisel hesap|Личный кабинет|Personal account
Qoşul=Katıl|Присоединиться|Join
Çıxış=Çıkış|Выйти|Log out
Tikmək və ev almaq=Ev yapmak ve almak|Строить и покупать жильё|Building and buying a home
indi daha asandır.=artık çok daha kolay.|теперь проще.|is now easier.
Qeydiyyatdan keç, bölgələr üzrə boş torpağı, ev qiymətlərini və əhali sayını gör, sonra düzgün qərar ver.=Kayıt ol, bölgelere göre boş arsayı, ev fiyatlarını ve nüfusu gör, sonra doğru kararı ver.|Зарегистрируйтесь, смотрите свободную землю, цены на жильё и численность населения по районам и принимайте верное решение.|Sign up, see vacant land, home prices and population by district, then make the right decision.
Mərkəz=Merkez|Центр|Center
Şimal massivi=Kuzey bölgesi|Северный массив|North District
Cənub massivi=Güney bölgesi|Южный массив|South District
Şərq qəsəbəsi=Doğu kasabası|Восточный посёлок|East Settlement
Qərb qəsəbəsi=Batı kasabası|Западный посёлок|West Settlement
Ümumi əhali=Toplam nüfus|Общее население|Total population
Boş ərazi (hektar)=Boş alan (hektar)|Свободная территория (га)|Vacant land (hectares)
Satışda sahə=Satışta arsa|Участков в продаже|Plots for sale
Qiymət dəyişməsi=Fiyat değişimi|Изменение цен|Price change
5 bölgə üzrə=5 bölge genelinde|По 5 районам|Across 5 districts
Əhali (bölgələr üzrə)=Nüfus (bölgelere göre)|Население (по районам)|Population by district
Boş ərazi (m²)=Boş alan (m²)|Свободная территория (м²)|Vacant land (m²)
Orta ev qiyməti (₼/m²)=Ortalama ev fiyatı (₼/m²)|Средняя цена жилья (₼/м²)|Average home price (₼/m²)
Ən sərfəli 5 elan=En uygun 5 ilan|5 самых выгодных объявлений|Top 5 best-value listings
sahə planı=arsa planı|план участков|plot plan
nümunə=örnek|пример|sample
Nümunə məlumatlardır. Real rəsmi rəqəmlər əlavə ediləndə panel yenilənəcək.=Örnek verilerdir. Gerçek resmi rakamlar eklendiğinde panel güncellenecek.|Это примерные данные. Панель обновится, когда будут добавлены реальные официальные цифры.|Sample data. The dashboard will update once real official figures are added.
Boş=Boş|Свободно|Vacant
Rezerv=Rezerve|Резерв|Reserved
Satılıb=Satıldı|Продано|Sold
Sahənin üstünə toxun, ölçü və qiyməti gör.=Parsele dokun, ölçüyü ve fiyatı gör.|Нажмите на участок, чтобы увидеть размер и цену.|Tap a plot to see its size and price.
Sahə=Arsa|Участок|Plot
boş=boş|свободен|vacant
rezerv edilib=rezerve edildi|зарезервирован|reserved
satılıb=satıldı|продан|sold
Bu həftənin ən çox baxılan bölgələri=Bu haftanın en çok görüntülenen bölgeleri|Самые просматриваемые районы недели|Most viewed districts this week
baxış=görüntüleme|просмотров|views
Hesab yarat=Hesap oluştur|Создать аккаунт|Create account
Ad, e-poçt və rolunu seç.=Ad, e-posta ve rolünü seç.|Укажите имя, e-mail и роль.|Enter your name, email and choose your role.
Paneli aç=Paneli aç|Открыть панель|Open dashboard
Bölgə üzrə əhali, torpaq və ev cədvəlləri.=Bölgeye göre nüfus, arsa ve ev tabloları.|Таблицы населения, земли и жилья по районам.|Population, land and home tables by district.
Müqayisə et və qərar ver=Karşılaştır ve karar ver|Сравните и решите|Compare and decide
Ən sərfəli sahəni və ya evi tap.=En uygun arsayı veya evi bul.|Найдите самый выгодный участок или дом.|Find the best-value plot or home.
Qərarı məlumatla ver=Kararı verilerle ver|Принимайте решения на основе данных|Decide with data
Pulsuz hesab yarat, bölgələr üzrə əhali, torpaq və ev qiymətlərini bir paneldə gör.=Ücretsiz hesap oluştur; bölgelere göre nüfusu, arsa ve ev fiyatlarını tek panelde gör.|Создайте бесплатный аккаунт и смотрите население, землю и цены на жильё по районам в одной панели.|Create a free account and see population, land and home prices by district in one dashboard.
5 bölgə üzrə interaktiv xəritə=5 bölge için etkileşimli harita|Интерактивная карта по 5 районам|Interactive map of 5 districts
İpoteka və tikinti xərci kalkulyatoru=İpotek ve inşaat maliyeti hesaplayıcısı|Калькулятор ипотеки и стоимости строительства|Mortgage and construction cost calculator
Elan yerləşdirmə və evləri müqayisə=İlan verme ve evleri karşılaştırma|Размещение объявлений и сравнение жилья|Post listings and compare homes
Pulsuz qeydiyyat=Ücretsiz kayıt|Бесплатная регистрация|Free sign-up
Daxil ol=Giriş yap|Войти|Log in
Panelə keç →=Panele geç →|Перейти в панель →|Go to dashboard →
Ümumi əhali=Toplam nüfus|Всего населения|Total population
Boş ərazi (m²)=Boş alan (m²)|Свободная территория (м²)|Vacant land (m²)
Satışda torpaq sahəsi=Satışta arsa|Участков земли в продаже|Plots for sale
Elan olunmuş ev=İlanı verilmiş ev|Объявлений о жилье|Listed homes
Şəhər paneli=Şehir paneli|Городская панель|City dashboard
Bölgəyə görə əhali, boş ərazi və ev qiymətləri.=Bölgeye göre nüfus, boş alan ve ev fiyatları.|Население, свободная территория и цены на жильё по районам.|Population, vacant land and home prices by district.
Məlumatları görmək üçün daxil ol=Verileri görmek için giriş yap|Войдите, чтобы увидеть данные|Log in to see the data
Qeydiyyat 30 saniyə çəkir.=Kayıt 30 saniye sürer.|Регистрация занимает 30 секунд.|Sign-up takes 30 seconds.
Qeydiyyata keç=Kayıt ol|Зарегистрироваться|Sign up
Əhali=Nüfus|Население|Population
Xəritə=Harita|Карта|Map
Boş ərazilər=Boş alanlar|Свободные территории|Vacant lands
Evlər=Evler|Жильё|Homes
Müqayisə=Karşılaştırma|Сравнение|Compare
Qiymət tendensiyası=Fiyat eğilimi|Динамика цен|Price trend
Bütün bölgələr=Tüm bölgeler|Все районы|All districts
Bölgə=Bölge|Район|District
Standart=Standart|Стандартно|Default
Ən böyük sahə=En büyük alan|Наибольшая площадь|Largest area
Ən ucuz m²=En ucuz m²|Самый дешёвый м²|Cheapest m²
Ən ucuz=En ucuz|Самые дешёвые|Cheapest
Yalnız seçilmişlər=Yalnızca seçilenler|Только избранные|Favorites only
Sırala=Sırala|Сортировка|Sort
Kartlar=Kartlar|Карточки|Cards
Cədvəl=Tablo|Таблица|Table
Maks. qiymət:=Maks. fiyat:|Макс. цена:|Max. price:
Mülki vətəndaş=Sivil vatandaş|Гражданские|Civilians
İşçi və qulluqçu=İşçi ve memur|Работники и служащие|Workers and employees
Tələbə=Üniversite öğrencisi|Студенты|Students
Şagird=Okul öğrencisi|Школьники|Pupils
nəfər=kişi|человек|people
nəf.=kişi|чел.|ppl
Orta sahə (m²)=Ortalama alan (m²)|Средняя площадь (м²)|Avg. area (m²)
1 m² qiymət=1 m² fiyatı|Цена 1 м²|Price per m²
Növ=Tür|Тип|Type
Otaq=Oda|Комнаты|Rooms
otaq=oda|комн.|rooms
Qiymət=Fiyat|Цена|Price
Sahə (m²)=Alan (m²)|Площадь (м²)|Area (m²)
Sahə sayı=Parsel sayısı|Кол-во участков|Number of plots
Sahə:=Alan:|Площадь:|Area:
sahə=parsel|участков|plots
Mənzil=Daire|Квартира|Apartment
Həyət evi=Müstakil ev|Частный дом|House with yard
Yarımçıq tikili=Yarım kalmış yapı|Недострой|Unfinished building
Ticarət sahəsi=Ticari alan|Коммерческая площадь|Commercial space
Bu bölgədə hələ elan yoxdur.=Bu bölgede henüz ilan yok.|В этом районе пока нет объявлений.|No listings in this district yet.
Seç=Seç|Выбрать|Select
1 m² orta qiymət (₼), son 8 ay. Nümunə məlumatdır.=1 m² ortalama fiyat (₼), son 8 ay. Örnek veridir.|Средняя цена 1 м² (₼) за последние 8 месяцев. Примерные данные.|Average price per m² (₼), last 8 months. Sample data.
Mar=Mar|Мар|Mar
Apr=Nis|Апр|Apr
May=May|Май|May
İyn=Haz|Июн|Jun
İyl=Tem|Июл|Jul
Avq=Ağu|Авг|Aug
Sen=Eyl|Сен|Sep
Okt=Eki|Окт|Oct
İpoteka kalkulyatoru=İpotek hesaplayıcı|Ипотечный калькулятор|Mortgage calculator
Ev qiyməti:=Ev fiyatı:|Цена жилья:|Home price:
İlkin ödəniş:=Peşinat:|Первоначальный взнос:|Down payment:
Müddət:=Süre:|Срок:|Term:
Faiz:=Faiz:|Ставка:|Interest rate:
il=yıl|лет|years
Aylıq ödəniş=Aylık ödeme|Ежемесячный платёж|Monthly payment
Kredit=Kredi|Кредит|Loan
faiz üzrə artıq ödəniş=faiz üzerinden fazla ödeme|переплата по процентам|extra interest paid
(mavi: əsas borc, qırmızı: faiz)=(mavi: ana borç, kırmızı: faiz)|(синий: основной долг, красный: проценты)|(blue: principal, red: interest)
Tikinti xərci=İnşaat maliyeti|Стоимость строительства|Construction cost
Keyfiyyət səviyyəsi=Kalite seviyesi|Уровень качества|Quality level
Ekonom=Ekonomik|Эконом|Economy
Premium=Premium|Премиум|Premium
Təxmini xərc=Tahmini maliyet|Ориентировочная стоимость|Estimated cost
Təməl=Temel|Фундамент|Foundation
Karkas=Karkas|Каркас|Frame
Dam=Çatı|Крыша|Roof
Daxili işlər=İç işler|Внутренние работы|Interior work
Mühəndis sistemləri=Mühendislik sistemleri|Инженерные системы|Engineering systems
Nümunə qiymətlərdir. Real smeta üçün mütəxəssislə danış.=Örnek fiyatlardır. Gerçek keşif için bir uzmanla görüş.|Цены примерные. Для реальной сметы обратитесь к специалисту.|Sample prices. Talk to a specialist for a real estimate.
Otaq sayı=Oda sayısı|Количество комнат|Number of rooms
Qiymət (₼)=Fiyat (₼)|Цена (₼)|Price (₼)
Əlaqə nömrəsi=İletişim numarası|Контактный номер|Contact number
Elanı əlavə et=İlanı ekle|Добавить объявление|Add listing
Sahəni m² ilə yaz.=Alanı m² olarak yaz.|Укажите площадь в м².|Enter the area in m².
Qiyməti ₼ ilə yaz.=Fiyatı ₼ olarak yaz.|Укажите цену в ₼.|Enter the price in ₼.
Əlaqə nömrəsini düzgün yaz.=İletişim numarasını doğru yaz.|Введите корректный номер.|Enter a valid contact number.
Ev 1 m²=Ev 1 m²|Жильё 1 м²|Home per m²
Boş ərazi=Boş alan|Свободная территория|Vacant land
boş ərazi=boş alan|свободная территория|vacant land
az=az|мало|low
çox=çok|много|high
əhali=nüfus|население|population
torpaq 1 m²=arsa 1 m²|земля 1 м²|land per m²
ev 1 m²=ev 1 m²|жильё 1 м²|home per m²
8 ayda=8 ayda|за 8 месяцев|in 8 months
İnvestisiya cəlbediciliyi:=Yatırım çekiciliği:|Инвестиционная привлекательность:|Investment appeal:
yüksək=yüksek|высокая|high
orta=orta|средняя|medium
aşağı=düşük|низкая|low
Qiymət artımı, boş torpaq və torpağın ucuzluğu əsasında nümunə hesablama.=Fiyat artışı, boş arsa ve arsa ucuzluğuna dayalı örnek hesaplama.|Примерный расчёт на основе роста цен, свободной земли и дешевизны земли.|Sample calculation based on price growth, vacant land and land affordability.
elana bax=ilana bak|объявлений →|listings →
Müqayisə üçün ev seç=Karşılaştırmak için ev seç|Выберите жильё для сравнения|Select homes to compare
Evlər bölməsində ən azı 2 elanı ★ ilə seç, burada yan-yana müqayisə olunacaq.=Evler bölümünde en az 2 ilanı ★ ile seç, burada yan yana karşılaştırılacak.|В разделе «Жильё» отметьте ★ минимум 2 объявления — здесь они будут показаны рядом.|In Homes, mark at least 2 listings with ★ and they will be compared side by side here.
Evlərə keç=Evlere geç|Перейти к жилью|Go to homes
Seçim=Seçim|Вариант|Option
Aylıq ipoteka*=Aylık ipotek*|Ипотека в месяц*|Monthly mortgage*
həmin göstərici üzrə ən yaxşı seçim.=bu gösterge için en iyi seçim.|лучший вариант по этому показателю.|best choice for this metric.
ilkin ödəniş=peşinat|первоначальный взнос|down payment
faiz=faiz|ставка|interest
Seçilmişlərdən ilk 3 ev göstərilir.=Seçilenlerden ilk 3 ev gösterilir.|Показаны первые 3 избранных объекта.|The first 3 favorites are shown.
1 m² qiyməti=1 m² fiyatı|Цена 1 м²|Price per m²
aylıq ipoteka*=aylık ipotek*|ипотека в месяц*|monthly mortgage*
bölgə orta 1 m²=bölge ort. 1 m²|среднее по району 1 м²|district avg. per m²
əlaqə=iletişim|контакт|contact
★ Seçilmişlərdən çıxar=★ Favorilerden çıkar|★ Убрать из избранного|★ Remove from favorites
☆ Seçilmişlərə əlavə et=☆ Favorilere ekle|☆ В избранное|☆ Add to favorites
Seçilmişlərə əlavə olundu=Favorilere eklendi|Добавлено в избранное|Added to favorites
Seçilmişlərdən çıxarıldı=Favorilerden çıkarıldı|Удалено из избранного|Removed from favorites
Elan əlavə olundu=İlan eklendi|Объявление добавлено|Listing added
Platformaya qoşul=Platforma katıl|Присоединяйтесь к платформе|Join the platform
E-poçt=E-posta|E-mail|Email
Parol (ən azı 6 simvol)=Şifre (en az 6 karakter)|Пароль (минимум 6 символов)|Password (at least 6 characters)
Parol=Şifre|Пароль|Password
Ad və soyad=Ad ve soyad|Имя и фамилия|Full name
Məs: Aysel Məmmədova=Örn: Aysel Memmedova|Напр.: Айсель Мамедова|e.g. Aysel Mammadova
Mən kiməm?=Ben kimim?|Кто я?|Who am I?
Tikintiçi=İnşaatçı|Строитель|Builder
Ev alıcısı=Ev alıcısı|Покупатель жилья|Home buyer
Ev satıcısı=Ev satıcısı|Продавец жилья|Home seller
İnvestor=Yatırımcı|Инвестор|Investor
Davam et=Devam et|Продолжить|Continue
Addım=Adım|Шаг|Step
Hesabın var?=Hesabın var mı?|Есть аккаунт?|Have an account?
Hesabın yoxdur?=Hesabın yok mu?|Нет аккаунта?|No account?
Qeydiyyat=Kayıt|Регистрация|Sign up
E-poçt ünvanını düzgün yaz.=E-posta adresini doğru yaz.|Введите корректный e-mail.|Enter a valid email address.
Adını və soyadını yaz.=Adını ve soyadını yaz.|Введите имя и фамилию.|Enter your first and last name.
Parol ən azı 6 simvol olmalıdır.=Şifre en az 6 karakter olmalıdır.|Пароль должен содержать минимум 6 символов.|Password must be at least 6 characters.
Bu e-poçt artıq qeydiyyatdadır. Daxil ol bölməsinə keç.=Bu e-posta zaten kayıtlı. Giriş bölümüne geç.|Этот e-mail уже зарегистрирован. Перейдите ко входу.|This email is already registered. Switch to Log in.
E-poçt və ya parol yanlışdır.=E-posta veya şifre yanlış.|Неверный e-mail или пароль.|Incorrect email or password.
Çox yanlış cəhd.=Çok fazla yanlış deneme.|Слишком много неверных попыток.|Too many failed attempts.
san. gözlə.=sn. bekle.|сек. подождите.|sec. remaining.
Xoş gəldin,=Hoş geldin,|Добро пожаловать,|Welcome,
Rolun:=Rolün:|Ваша роль:|Your role:
Panel açıldı.=Panel açıldı.|Панель открыта.|Dashboard unlocked.
İstifadəçilər, elanlar və bölgə məlumatları.=Kullanıcılar, ilanlar ve bölge verileri.|Пользователи, объявления и данные по районам.|Users, listings and district data.
İdarəetmə paneli=Yönetim paneli|Панель управления|Admin panel
İstifadəçilər=Kullanıcılar|Пользователи|Users
Ad=Ad|Имя|Name
Rol=Rol|Роль|Role
Sil=Sil|Удалить|Delete
Elanlar=İlanlar|Объявления|Listings
istifadəçi elanı=kullanıcı ilanı|объявл. пользователей|user listings
Əlavə edən=Ekleyen|Добавил|Added by
Əlaqə=İletişim|Контакт|Contact
Bütün evləri CSV yüklə=Tüm evleri CSV indir|Скачать всё жильё в CSV|Download all homes as CSV
Bölgə məlumatları=Bölge verileri|Данные по районам|District data
Yadda saxla=Kaydet|Сохранить|Save
İlkin məlumata qaytar=Varsayılana döndür|Вернуть исходные данные|Reset to default
Hələ istifadəçi elanı yoxdur.=Henüz kullanıcı ilanı yok.|Пока нет объявлений пользователей.|No user listings yet.
Bu bölmə yalnız adminlər üçündür.=Bu bölüm yalnızca yöneticiler içindir.|Этот раздел только для администраторов.|This section is for admins only.
Rol dəyişdirildi=Rol değiştirildi|Роль изменена|Role changed
İstifadəçi silindi=Kullanıcı silindi|Пользователь удалён|User deleted
Elan silindi=İlan silindi|Объявление удалено|Listing deleted
Məlumatlar saxlanıldı=Veriler kaydedildi|Данные сохранены|Data saved
İlkin məlumat bərpa olundu=Varsayılan veriler geri yüklendi|Исходные данные восстановлены|Default data restored
silinsin?=silinsin mi?|удалить?|delete?
Mülki=Sivil|Гражд.|Civil
İşçi=İşçi|Работн.|Worker
Boş ərazi m²=Boş alan m²|Своб. земля м²|Vacant m²
SmartXan haqqında=SmartXan hakkında|О SmartXan|About SmartXan
SmartXan Xankəndidə tikmək, ev almaq və ya investisiya etmək istəyənlərə qərarı rəqəmlərlə verməyə kömək edir.=SmartXan, Xankəndi'de inşaat yapmak, ev almak veya yatırım yapmak isteyenlere kararı rakamlarla vermede yardımcı olur.|SmartXan помогает тем, кто хочет строить, покупать жильё или инвестировать в Ханкенди, принимать решения на основе цифр.|SmartXan helps people who want to build, buy a home or invest in Khankendi make decisions based on numbers.
Şəffaf məlumat=Şeffaf veri|Прозрачные данные|Transparent data
Bölgə üzrə əhali, boş ərazi və torpaq qiymətləri bir yerdə.=Bölgeye göre nüfus, boş alan ve arsa fiyatları tek yerde.|Население, свободная земля и цены на землю по районам в одном месте.|Population, vacant land and land prices by district in one place.
Hesablama alətləri=Hesaplama araçları|Инструменты расчёта|Calculation tools
İpoteka və tikinti xərci kalkulyatorları ilə büdcəni əvvəlcədən gör.=İpotek ve inşaat maliyeti hesaplayıcılarıyla bütçeni önceden gör.|Заранее рассчитайте бюджет с помощью калькуляторов ипотеки и стоимости строительства.|See your budget in advance with mortgage and construction cost calculators.
Elan və müqayisə=İlan ve karşılaştırma|Объявления и сравнение|Listings and comparison
Evləri ★ ilə seç, yan-yana müqayisə et, öz elanını yerləşdir.=Evleri ★ ile seç, yan yana karşılaştır, kendi ilanını ver.|Отмечайте жильё ★, сравнивайте рядом и размещайте свои объявления.|Mark homes with ★, compare them side by side and post your own listing.
Komanda=Ekip|Команда|Team
Tikintiçilər, ev alıcıları və investorlar üçün Xankəndi məlumat platforması.=İnşaatçılar, ev alıcıları ve yatırımcılar için Xankəndi veri platformu.|Информационная платформа Ханкенди для строителей, покупателей жилья и инвесторов.|Khankendi data platform for builders, home buyers and investors.
Səhifələr=Sayfalar|Страницы|Pages
Alətlər=Araçlar|Инструменты|Tools
Göstərilən məlumatlar nümunə xarakterlidir.=Gösterilen veriler örnek niteliğindedir.|Показанные данные носят примерный характер.|The data shown is for illustration only.
Bütün məlumatlar nümunə xarakterlidir.=Tüm veriler örnek niteliğindedir.|Все данные примерные.|All data is for illustration only.
Analitika=Analitik|Аналитика|Analytics
Daşınmaz əmlak=Gayrimenkul|Недвижимость|Real estate
Torpaq sahələri=Arsa alanları|Земельные участки|Land plots
Qiymət analizi=Fiyat analizi|Анализ цен|Price analysis
Dashboard=Gösterge paneli|Дашборд|Dashboard
Axtarış=Arama|Поиск|Search
Bağla=Kapat|Закрыть|Close
Bütün növlər=Tüm türler|Все типы|All types
Torpaq=Arsa|Земля|Land
Ev / mənzil=Ev / daire|Дом / квартира|House / apartment
Qiymət aralığı=Fiyat aralığı|Диапазон цен|Price range
100 000 ₼-dək=100 000 ₼'ye kadar|До 100 000 ₼|Up to 100 000 ₼
200 000 ₼-dən yuxarı=200 000 ₼ üzeri|Свыше 200 000 ₼|Over 200 000 ₼
Ərazi, ev və ya torpaq axtarın...=Bölge, ev veya arsa arayın...|Район, дом или участок...|Area, home or land...
Hesabla →=Hesapla →|Рассчитать →|Calculate →
Hamısına bax →=Hepsine bak →|Смотреть все →|View all →
Xəritəyə keç →=Haritaya git →|Перейти к карте →|Go to map →
Məbləğ=Tutar|Сумма|Amount
Müddət=Vade|Срок|Term
İllik faiz dərəcəsi=Yıllık faiz oranı|Годовая процентная ставка|Annual interest rate
İnteraktiv Xəritə=İnteraktif Harita|Интерактивная карта|Interactive Map
İnteraktiv xəritə=İnteraktif harita|Интерактивная карта|Interactive map
Son Elanlar=Son İlanlar|Последние объявления|Latest Listings
İpoteka Kalkulyatoru=İpotek Hesaplayıcı|Ипотечный калькулятор|Mortgage Calculator
Qiymət Dəyişiklikləri=Fiyat Değişiklikleri|Изменения цен|Price Changes
Əhali Bölgüsü=Nüfus Dağılımı|Распределение населения|Population Distribution
Gələcəyin şəhəri birgə qurulur!=Geleceğin şehri birlikte inşa ediliyor!|Город будущего строится вместе!|The city of the future is being built together!
Yeni layihələr və inkişaf planları=Yeni projeler ve gelişim planları|Новые проекты и планы развития|New projects and development plans
SmartXan — Xankəndi şəhərinin inkişafı üçün müasir daşınmaz əmlak və şəhərsalma platforması.=SmartXan — Xankəndi şehrinin gelişimi için modern gayrimenkul ve şehircilik platformu.|SmartXan — современная платформа недвижимости и градостроительства для развития города Ханкенди.|SmartXan — a modern real estate and urban planning platform for the development of Khankendi.
Xankəndinin=Xankəndi'nin|Строим|Building
gələcəyini=geleceğini|будущее Ханкенди|Khankendi's future
birlikdə=birlikte|вместе.|together.
qururuq.=inşa ediyoruz.|\u200b|\u200b
Xankəndi mərkəzi=Xankəndi merkezi|Центр Ханкенди|Khankendi center
Xankəndi=Xankəndi|Ханкенди|Khankendi
Ağdərə yolu=Ağdere yolu|Дорога на Агдере|Aghdara road
Şuşa küçəsi=Şuşa caddesi|Улица Шуша|Shusha Street
Qarabağ=Karabağ|Карабах|Karabakh
Ağdərə=Ağdere|Агдере|Aghdara
Torpaq sahəsi=Arsa alanı|Земельный участок|Land plot
Ev elanı=Ev ilanı|Объявление о доме|Home listing
Elan təfərrüatı=İlan ayrıntıları|Детали объявления|Listing details
Hesab=Hesap|Аккаунт|Account
Tünd rejim=Karanlık mod|Тёмный режим|Dark mode
XANKƏNDİ ÜÇÜN AĞILLI HƏLLƏR=XANKƏNDİ İÇİN AKILLI ÇÖZÜMLER|УМНЫЕ РЕШЕНИЯ ДЛЯ ХАНКЕНДИ|SMART SOLUTIONS FOR KHANKENDI
SmartXan loqosu=SmartXan logosu|Логотип SmartXan|SmartXan logo
© 2026 SmartXan. Göstərilən məlumatlar nümunə xarakterlidir.=© 2026 SmartXan. Gösterilen veriler örnek niteliğindedir.|© 2026 SmartXan. Показанные данные носят примерный характер.|© 2026 SmartXan. The data shown are for illustration only.
SmartXan – Torpaq, ev və əhali məlumatları=SmartXan – Arsa, ev ve nüfus verileri|SmartXan – Земля, жильё и данные о населении|SmartXan – Land, home and population data`;
const DICT = {};
TXT.split("\n").forEach(l => { const i = l.indexOf("="), p = l.slice(i + 1).split("|"); DICT[l.slice(0, i)] = { tr: p[0], ru: p[1], en: p[2] } });
const RX = new RegExp("(?<![\\p{L}\\p{N}])(?:" + Object.keys(DICT).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")(?![\\p{L}\\p{N}])", "gu");
let LANG = "az";
const LGS = ["az", "tr", "ru", "en"], O = new WeakMap(), AT = ["placeholder", "aria-label", "title", "alt"];
const T = s => LANG === "az" ? s : String(s).replace(RX, m => (DICT[m] && DICT[m][LANG]) || m);
function tn(n) {
  const p = n.parentElement;
  if (!p || p.closest("script,style,[data-nt]")) return;
  if (!O.has(n)) O.set(n, n.nodeValue);
  const o = O.get(n);
  if (p.tagName === "OPTION" && !p.hasAttribute("value")) p.setAttribute("value", o.trim());
  const v = T(o);
  if (n.nodeValue !== v) n.nodeValue = v
}
function tx(r) {
  if (r.nodeType === 3) return tn(r);
  if (r.nodeType !== 1) return;
  const w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) tn(n);
  [r, ...r.querySelectorAll("[placeholder],[aria-label],[title],[alt]")].forEach(e => AT.forEach(a => {
    if (!e.hasAttribute(a) || e.closest("[data-nt]")) return;
    const k = "o" + a.replace("-", "");
    if (!(k in e.dataset)) e.dataset[k] = e.getAttribute(a);
    const v = T(e.dataset[k]);
    if (e.getAttribute(a) !== v) e.setAttribute(a, v)
  }))
}
const OPT = { childList: true, subtree: true };
const obs = new MutationObserver(rs => {
  if (LANG === "az") return;
  obs.disconnect();
  rs.forEach(r => r.addedNodes.forEach(tx));
  obs.observe(document.body, OPT)
});
obs.observe(document.body, OPT);
function setLang(l) {
  LANG = LGS.includes(l) ? l : "az";
  ls.set("xq_lang", LANG);
  document.documentElement.lang = LANG;
  obs.disconnect();
  tx(document.body);
  obs.observe(document.body, OPT);
  $$("#lgm button").forEach(b => b.setAttribute("aria-current", b.dataset.l === LANG));
  route()
}
$("#lgm").onclick = e => { const b = e.target.closest("button[data-l]"); if (b) setLang(b.dataset.l) };

stats();
sorts();
render();
session();
setLang(ls.get("xq_lang"));
