# SmartXan – Xankəndinin Ağıllı Şəhər Portalı

Xankəndi üzrə torpaq, ev qiymətləri və əhali məlumatları, xəritə, kalkulyatorlar və elanlar bir platformada.
Saf **HTML + CSS + JavaScript** layihədir, heç bir qurulum (npm, server) tələb etmir.

## Qovluq strukturu

```
SmartXan/
├── index.html          # Əsas səhifə (bütün bölmələr)
├── css/
│   └── style.css       # Bütün stillər (rəng palitrası, ana səhifə, panel, dashboard)
├── js/
│   ├── app.js          # Əsas məntiq: məlumatlar, panel, dashboard, giriş, tərcümə
│   ├── plan.js         # Sahə planı (SVG)
│   └── home.js         # Yeni ana səhifə: statistika, elanlar, kalkulyator, qrafik, tünd rejim
├── assets/
│   └── images/         # Loqo, hero foto, xəritə, elan şəkilləri, ikonlar
└── README.md
```

## İşə salmaq

`index.html` faylını brauzerdə iki dəfə klikləyib açmaq kifayətdir.

İstəsən lokal server ilə:

```bash
python3 -m http.server 8000
# sonra brauzerdə: http://localhost:8000
```

## GitHub Pages ilə yayımlamaq

1. Layihəni GitHub-a yüklə (repository-nin kökündə `index.html` olmalıdır).
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Branch: `main`, qovluq: `/ (root)` seç və **Save** bas.
4. Bir neçə dəqiqə sonra sayt `https://İSTİFADƏÇİ.github.io/REPO-ADI/` ünvanında açılacaq.

## Qeydlər

- Saytdakı rəqəmlər və elanlar **nümunə məlumatlardır**. Real məlumatlar `js/app.js` faylının əvvəlindəki `D` (bölgələr), `H` (evlər) və `TR` (qiymət tendensiyası) massivlərində dəyişdirilə bilər.
- Qeydiyyat/giriş və seçilmişlər brauzerin `localStorage`-ında saxlanılır (server yoxdur).
- Şrift (Outfit, Barlow) Google Fonts-dan yüklənir; internet olmasa sistem şrifti istifadə olunur.
- Dillər: Azərbaycanca, Türkcə, Rusca, İngiliscə (`js/app.js` içindəki tərcümə siyahısı).
