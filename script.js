/* =========================
   ROYAL SAFA — SITE SCRIPT
   - RU/KG localization (default RU)
   - WhatsApp links from data.json
   - Instagram embeds (index)
   - Gallery lightbox (click to enlarge + prev/next + keyboard)
   - Ad/Promo image slider in hero
   ========================= */

let DATA = null;
let LANG = "ru";

/** IDs that are translated via element id="..." */
const ID_KEYS = [
  "subtitle","priceLabel","navWaText",
  "heroTitle","heroText","heroWaText","moreBtn","phoneText",
  "sideTitle","chip1","chip2","chip3","chip4","sideNote",
  "featTitle","feat1","feat2","feat3","feat4",
  "prodTitle","prodText","prodLi1","prodLi2","prodLi3","prodLi4","prodWaText",
  "useTitle","use1","use2","use3","use4",
  "ctaLabel","ctaNote","ctaWaText",
  "galTitle","galText",
  "igTitle","igHint",
  "ctTitle","ctPhone","workTime","ctWaText",
  "waFloatText",
  "pricePageTitle","priceWaText",

  /* PRICE page extra keys (optional) */
  "price_h1","price_intro","price_source","price_quick_title",
  "modules_title","modules_desc",
  "extras_title","extras_desc","extras_note",
  "openings_title","openings_desc",
  "notes_title","notes_after",
  "pdf_title","pdf_text",

  /* ABOUT page keys */
  "about_title", "about_intro", "about_h2", "about_p1",
  "about_h3_1", "about_p2", "about_h3_2", "about_p3",
  "about_li_1", "about_li_2", "about_li_3", "about_h3_3",
  "about_li_4", "about_li_5", "about_li_6", "about_li_7", "about_p4",

  /* NEW: Product advantages keys */
  "prod_advantages_title", "prod_adv1", "prod_adv2", "prod_adv3", "prod_adv4"
];

function normalizePhone(p) {
  return String(p || "").replace(/[^\d]/g, "");
}

function waLink(text) {
  const phone = normalizePhone(DATA?.phone);
  const msg = encodeURIComponent(text || "");
  return `https://wa.me/${phone}?text=${msg}`;
}

function setWaLinks() {
  if (!DATA) return;

  const msg =
    DATA.whatsappText?.[LANG] ||
    DATA.whatsappText?.ru ||
    DATA.whatsappText?.ky ||
    "";

  const link = waLink(msg);

  const ids = [
    "navWa","heroWa","prodWa","ctaWa","ctWa","waFloat","galWa",
    "waHero","waPrice","waExtras","waNotes"
  ];

  ids.forEach(id=>{
    const el = document.getElementById(id);
    if (el) el.setAttribute("href", link);
  });
}

function setActiveLang() {
  document.querySelectorAll(".lang__btn").forEach(btn=>{
    btn.classList.toggle("active", btn.dataset.lang === LANG);
  });
}

function getDict() {
  return (DATA && (DATA[LANG] || DATA.ru || DATA.ky)) ? (DATA[LANG] || DATA.ru || DATA.ky) : {};
}

function applyText() {
  if (!DATA) return;

  const d = getDict();

  // 1) translate by id list
  ID_KEYS.forEach(k=>{
    const el = document.getElementById(k);
    if (!el) return;
    if (d[k] !== undefined) el.innerHTML = d[k];
  });

  // 2) translate by data-i18n="key"
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    if (d[key] !== undefined) el.innerHTML = d[key];
  });

  document.documentElement.lang = (LANG === "ru") ? "ru" : "ky";

  setWaLinks();
  setActiveLang();
}

function renderInstagram() {
  const grid = document.getElementById("igGrid");
  if (!grid || !DATA) return;

  grid.innerHTML = "";

  const urls = (DATA.instagramEmbeds || [])
    .map(u => (u || "").split("?")[0].trim())
    .filter(u => u && !u.includes("REPLACE_"))
    .map(u => (u.endsWith("/") ? u : (u + "/")));

  if (urls.length === 0) {
    const d = getDict();
    grid.innerHTML = `<div class="muted small">${d.igHint || ""}</div>`;
    return;
  }

  urls.forEach((url) => {
    const card = document.createElement("div");
    card.className = "ig-card";
    card.innerHTML = `
      <blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="margin:0; width:100%"></blockquote>
    `;
    grid.appendChild(card);
  });

  if (window.instgrm && window.instgrm.Embeds && typeof window.instgrm.Embeds.process === "function") {
    window.instgrm.Embeds.process();
  }
}

function initLangButtons() {
  document.querySelectorAll(".lang__btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      LANG = (btn.dataset.lang === "ky") ? "ky" : "ru";
      localStorage.setItem("lang", LANG);
      applyText();
      renderInstagram();
    });
  });
}

function initGalleryModal() {
  const modal = document.getElementById("imgModal");
  if (!modal) return;

  const modalImg =
    document.getElementById("modalImg") ||
    document.getElementById("imgModalContent") ||
    modal.querySelector("img");

  if (!modalImg) return;

  const imgs = Array.from(document.querySelectorAll(".zoom-img"));
  if (imgs.length === 0) return;

  const closeBtn =
    modal.querySelector(".close") ||
    modal.querySelector("#imgClose") ||
    modal.querySelector(".img-close");

  const prevBtn =
    modal.querySelector(".prev") ||
    modal.querySelector(".nav.prev");

  const nextBtn =
    modal.querySelector(".next") ||
    modal.querySelector(".nav.next");

  let idx = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function open(i){
    idx = i;
    modal.classList.add("open");
    modal.style.display = "flex";
    modalImg.src = imgs[idx].src;
    document.body.style.overflow = "hidden";
  }

  function close(){
    modal.classList.remove("open");
    modal.style.display = "";
    modalImg.src = "";
    document.body.style.overflow = "";
  }

  function show(step){
    idx = (idx + step + imgs.length) % imgs.length;
    modalImg.src = imgs[idx].src;
  }

  imgs.forEach((img, i)=> img.addEventListener("click", ()=>open(i)));

  closeBtn?.addEventListener("click", (e)=>{ e.stopPropagation(); close(); });
  prevBtn?.addEventListener("click", (e)=>{ e.stopPropagation(); show(-1); });
  nextBtn?.addEventListener("click", (e)=>{ e.stopPropagation(); show(1); });

  modal.addEventListener("click", (e)=>{
    if (e.target === modal) close();
  });

  document.addEventListener("keydown", (e)=>{
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(-1);
    if (e.key === "ArrowRight") show(1);
  });
  
  modal.addEventListener('touchstart', (e) => {
    if (e.target.closest('.nav') || e.target.closest('.close')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  modal.addEventListener('touchmove', (e) => {
    if (touchStartX === 0 || touchStartY === 0) return;

    const touchCurrentX = e.touches[0].clientX;
    const touchCurrentY = e.touches[0].clientY;
    
    const diffX = Math.abs(touchStartX - touchCurrentX);
    const diffY = Math.abs(touchStartY - touchCurrentY);

    if (diffX > diffY) {
      e.preventDefault();
    }
  });

  modal.addEventListener('touchend', (e) => {
    if (touchStartX === 0) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const swipeDiff = touchStartX - touchEndX;

    if (swipeDiff > 50) {
      show(1);
    } else if (swipeDiff < -50) {
      show(-1);
    }
    
    touchStartX = 0;
    touchStartY = 0;
  }, { passive: true });
}

function initAdSlider() {
  const slides = document.querySelectorAll('.hero-slideshow .slide');
  if (slides.length === 0) return;

  let currentSlide = 0;

  setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 4000);
}

function setYear() {
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

async function boot() {
  const saved = localStorage.getItem("lang");
  LANG = (saved === "ru" || saved === "ky") ? saved : "ru";

  initLangButtons();
  setYear();
  initGalleryModal();
  initAdSlider();

  try {
    const res = await fetch("data.json", { cache: "no-store" });
    if (!res.ok) {
        console.error("Failed to load data.json", res.status, res.statusText);
        return;
    }
    DATA = await res.json();
    applyText();
    renderInstagram();
  } catch (err) {
    console.error("BOOT ERROR:", err);
  }
}

document.addEventListener("DOMContentLoaded", boot);
