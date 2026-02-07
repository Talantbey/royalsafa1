/* =========================
   ROYAL SAFA — SITE SCRIPT
   ========================= */

let DATA = null;
let LANG = "ru";

const ID_KEYS = [
  "subtitle","priceLabel","navWaText",
  "heroTitle","heroText","heroWaText","moreBtnText","phoneText",
  "featTitle","feat1","feat2","feat3","feat4",
  "useTitle","use1","use2","use3","use4",
  "ctaLabel","ctaNote","ctaWaText",
  "galTitle","galText",
  "igTitle","igHint",
  "ctTitle","ctPhone","workTime","ctWaText",
  "waFloatText",
  
  "prod_advantages_title", "prod_adv1", "prod_adv2", "prod_adv3", "prod_adv4",

  "about_title", "about_intro", "about_h2", "about_p1",
  "about_h3_1", "about_p2", "about_h3_2", "about_p3",
  "about_li_1", "about_li_2", "about_li_3", "about_h3_3",
  "about_li_4", "about_li_5", "about_li_6", "about_li_7", "about_p4",

  "tech_params_title", "tech_mod1_title", "tech_mod1_dims", "tech_mod1_spec1_lbl", "tech_mod1_spec2_lbl", "tech_mod1_spec3_lbl", "tech_mod1_spec4_lbl",
  "tech_mod2_title", "tech_mod2_dims", "tech_mod2_spec1_lbl", "tech_mod2_spec2_lbl", "tech_mod2_spec3_lbl", "tech_mod2_spec4_lbl",
  "tech_main_title", "tech_main_intro", "tech_h1", "tech_p1",
  "tech_planning_title", "tech_planning_desc", "tech_planning_li1", "tech_planning_li2", "tech_planning_li3",
  "tech_design_title", "tech_design_desc", "tech_design_li1", "tech_design_li2", "tech_design_li3",
  "tech_h2", "tech_p2", "tech_step1_title", "tech_step1_desc", "tech_step2_title", "tech_step2_desc", "tech_step3_title", "tech_step3_desc",
  "tech_h3", "tech_p3", "tech_concrete_li1", "tech_concrete_li2", "tech_concrete_li3",
  "tech_h4", "tech_p4", "tech_h5", "tech_p5",
  
  "gos_title", "gos_intro",

  "price_h1", "price_intro",
  "price_mod1_dims", "price_mod1_area", "price_mod1_price",
  "price_mod2_dims", "price_mod2_area", "price_mod2_price",
  "price_canopy",
  "notes_title", "notes_li1", "notes_li2", "notes_li3", "notes_li4", "notes_li5", "notes_address"
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
  const msg = DATA.whatsappText?.[LANG] || DATA.whatsappText?.ru || "";
  const link = waLink(msg);
  const ids = ["navWa", "heroWa", "prodWa", "ctaWa", "ctWa", "waFloat", "galWa", "waHero", "waPrice", "waExtras", "waNotes"];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.setAttribute("href", link);
  });
}

function setActiveLang() {
  document.querySelectorAll(".lang__btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === LANG);
  });
}

function getDict() {
  return (DATA && (DATA[LANG] || DATA.ru)) ? (DATA[LANG] || DATA.ru) : {};
}

function applyText() {
  if (!DATA) return;
  const d = getDict();
  ID_KEYS.forEach(k => {
    const el = document.getElementById(k);
    if (el && d[k] !== undefined) el.innerHTML = d[k];
  });
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key && d[key] !== undefined) el.innerHTML = d[key];
  });
  document.documentElement.lang = LANG;
  setWaLinks();
  setActiveLang();
}

function renderInstagram() {
  const grid = document.getElementById("igGrid");
  if (!grid || !DATA) return;

  let sourceArray;

  if (document.getElementById('gos_title')) {
    sourceArray = DATA.instagramEmbeds_gos || [];
  } else {
    sourceArray = DATA.instagramEmbeds_main || [];
  }

  const urls = sourceArray
    .map(u => (u || "").split("?")[0].trim())
    .filter(u => u && !u.includes("REPLACE_") && !u.includes("ССЫЛКА_"));
  
  grid.innerHTML = "";

  if (urls.length === 0) {
    const d = getDict();
    grid.innerHTML = `<div class="muted small">${d.igHint || "Ссылки на видео не найдены."}</div>`;
    return;
  }

  urls.forEach(url => {
    const card = document.createElement("div");
    card.className = "ig-card";
    card.innerHTML = `<blockquote class="instagram-media" data-instgrm-permalink="${url}" data-instgrm-version="14" style="margin:0; width:100%"></blockquote>`;
    grid.appendChild(card);
  });

  if (window.instgrm?.Embeds?.process) {
    window.instgrm.Embeds.process();
  }
}

function initLangButtons() {
  document.querySelectorAll(".lang__btn").forEach(btn => {
    btn.addEventListener("click", () => {
      LANG = (btn.dataset.lang === "ky") ? "ky" : "ru";
      localStorage.setItem("lang", LANG);
      applyText();
      renderInstagram();
    });
  });
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.subnav__link');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initGalleryModal() {
  const modal = document.getElementById("imgModal");
  if (!modal) return;
  const modalImg = modal.querySelector("img");
  if (!modalImg) return;
  const imgs = Array.from(document.querySelectorAll(".zoom-img"));
  if (imgs.length === 0) return;
  const closeBtn = modal.querySelector(".close");
  const prevBtn = modal.querySelector(".nav.prev");
  const nextBtn = modal.querySelector(".nav.next");
  let idx = 0;
  let touchStartX = 0;
  let touchStartY = 0;

  function open(i) {
    idx = i;
    modal.classList.add("open");
    modal.style.display = "flex";
    modalImg.src = imgs[idx].src;
    document.body.style.overflow = "hidden";
  }

  function close() {
    modal.classList.remove("open");
    modal.style.display = "";
    modalImg.src = "";
    document.body.style.overflow = "";
  }

  function show(step) {
    idx = (idx + step + imgs.length) % imgs.length;
    modalImg.src = imgs[idx].src;
  }
  imgs.forEach((img, i) => img.addEventListener("click", () => open(i)));
  closeBtn?.addEventListener("click", e => { e.stopPropagation(); close(); });
  prevBtn?.addEventListener("click", e => { e.stopPropagation(); show(-1); });
  nextBtn?.addEventListener("click", e => { e.stopPropagation(); show(1); });
  modal.addEventListener("click", e => {
    if (e.target === modal) close();
  });
  document.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(-1);
    if (e.key === "ArrowRight") show(1);
  });
  modal.addEventListener('touchstart', e => {
    if (e.target.closest('.nav') || e.target.closest('.close')) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  modal.addEventListener('touchmove', e => {
    if (touchStartX === 0 || touchStartY === 0) return;
    const diffX = Math.abs(touchStartX - e.touches[0].clientX);
    const diffY = Math.abs(touchStartY - e.touches[0].clientY);
    if (diffX > diffY) {
      e.preventDefault();
    }
  });
  modal.addEventListener('touchend', e => {
    if (touchStartX === 0) return;
    const swipeDiff = touchStartX - e.changedTouches[0].clientX;
    if (swipeDiff > 50) show(1);
    else if (swipeDiff < -50) show(-1);
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
  highlightActiveLink(); // <--- ВЫЗОВ НОВОЙ ФУНКЦИИ
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
