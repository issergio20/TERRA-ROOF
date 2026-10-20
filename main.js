// Мобильное меню
const burger = document.querySelector(".burger");
const menu = document.getElementById("mobile-menu");

function setMenu(open) {
  burger.setAttribute("aria-expanded", String(open));
  menu.hidden = !open;
  document.body.classList.toggle("menu-open", open);
}

burger.addEventListener("click", () => setMenu(menu.hidden));
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

// Закреплённая кнопка: появляется, когда ни одна кнопка «Рассчитать стоимость» не видна
const sticky = document.querySelector(".sticky-cta");
const ctas = document.querySelectorAll("[data-cta]");
const visible = new Set();

const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
  const show = visible.size === 0;
  sticky.classList.toggle("is-visible", show);
  sticky.setAttribute("aria-hidden", String(!show));
  sticky.tabIndex = show ? 0 : -1;
});
ctas.forEach((el) => io.observe(el));

// Окно кейса
const modal = document.querySelector(".case-modal");
const modalMain = modal.querySelector(".case-modal__main img");
const modalThumbs = modal.querySelector(".case-modal__thumbs");

function showImage(img, btn) {
  modalMain.src = img.src;
  modalMain.alt = img.alt;
  modalMain.classList.toggle("is-darkened", !!img.darkened);
  modalThumbs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
}

function el(tag, text) {
  const node = document.createElement(tag);
  node.textContent = text;
  return node;
}

function openCase(id) {
  const data = window.CASES[id];
  if (!data) return;

  modal.querySelector(".case-modal__title").textContent = data.name;
  modal.querySelector(".case-modal__lead").textContent = data.lead;
  modal.querySelector('[data-field="task"]').textContent = data.task;
  modal.querySelector('[data-field="materials"]').textContent = data.materials;
  modal.querySelector('[data-field="done"]').replaceChildren(...data.done.map((t) => el("li", t)));
  modal.querySelector(".case-modal__facts").replaceChildren(
    ...data.facts.map(([k, v]) => {
      const row = document.createElement("div");
      row.append(el("dt", k), el("dd", v));
      return row;
    })
  );

  modalThumbs.replaceChildren(
    ...data.images.map((img, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "case-modal__thumb";
      btn.setAttribute("aria-label", `Фото ${i + 1}`);
      const thumb = el("img", "");
      thumb.src = img.src;
      thumb.alt = "";
      if (img.darkened) thumb.className = "is-darkened";
      btn.append(thumb);
      btn.addEventListener("click", () => showImage(img, btn));
      return btn;
    })
  );
  showImage(data.images[0], modalThumbs.firstElementChild);

  modal.querySelector(".case-modal__content").scrollTop = 0;
  modal.scrollTop = 0;
  if (!modal.open) modal.showModal();
  document.body.classList.add("modal-open");
  if (location.hash !== `#case-${id}`) history.pushState(null, "", `#case-${id}`);
}

function onCaseClosed() {
  // событие close приходит асинхронно — окно могли уже открыть снова
  if (modal.open) return;
  if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-open");
  if (location.hash.startsWith("#case-")) history.pushState(null, "", location.pathname + location.search);
}

function closeCase() {
  if (modal.open) modal.close();
  onCaseClosed();
}

modal.addEventListener("close", onCaseClosed);
modal.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeCase();
});
modal.querySelector(".case-modal__close").addEventListener("click", closeCase);
modal.querySelector(".case-modal__cta").addEventListener("click", closeCase);
// клик по затемнённому фону
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeCase();
});

document.querySelectorAll('a.case[href^="#case-"]').forEach((card) => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    openCase(card.getAttribute("href").slice(6));
  });
});

// прямая ссылка на кейс и кнопки «назад/вперёд»
function syncFromHash() {
  const m = location.hash.match(/^#case-(\w+)$/);
  if (m) openCase(m[1]);
  else closeCase();
}
window.addEventListener("popstate", syncFromHash);
syncFromHash();


// Кастомный курсор: точка под мышью и кольцо, которое мягко догоняет.
// Только для мыши и только если пользователь не отключил анимацию.
const cursor = document.querySelector(".cursor");
const cursorQuery = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");

if (cursorQuery.matches) {
  document.documentElement.classList.add("has-cursor");
  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  const mouse = { x: -100, y: -100 };
  const pos = { x: -100, y: -100 };
  let cursorFrame;

  function moveCursor() {
    pos.x += (mouse.x - pos.x) * 0.18;
    pos.y += (mouse.y - pos.y) * 0.18;
    ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    // кольцо догнало мышь — останавливаем цикл до следующего движения
    cursorFrame = Math.abs(mouse.x - pos.x) + Math.abs(mouse.y - pos.y) > 0.1 ? requestAnimationFrame(moveCursor) : undefined;
  }

  addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    if (!cursor.classList.contains("is-visible")) {
      // первое появление — кольцо сразу на месте, без пролёта из угла
      pos.x = mouse.x;
      pos.y = mouse.y;
      cursor.classList.add("is-visible");
    }
    if (!cursorFrame) cursorFrame = requestAnimationFrame(moveCursor);
  });

  document.addEventListener("mouseover", (e) => {
    // над карточкой кейса курсор обычный: она сама подсвечивается подложкой
    const link = !e.target.closest("a.case") && e.target.closest("a, button, [role='button']");
    cursor.classList.toggle("is-link", Boolean(link));
  });
  document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));
  addEventListener("mousedown", () => cursor.classList.add("is-down"));
  addEventListener("mouseup", () => cursor.classList.remove("is-down"));

  // окно кейса открывается в верхнем слое браузера — переносим курсор внутрь, иначе он окажется под окном
  const dialogs = document.querySelectorAll("dialog");
  const placeCursor = () => (document.querySelector("dialog[open]") || document.body).append(cursor);
  const dialogObserver = new MutationObserver(placeCursor);
  dialogs.forEach((d) => dialogObserver.observe(d, { attributes: true, attributeFilter: ["open"] }));
}

// Плавный переход между первым экраном и следующим блоком.
// Колесо вниз на первом экране — едем к следующему блоку, колесо вверх от его начала — обратно.
// Ссылки на якоря (кнопка «вниз», меню) прокручиваются той же анимацией.
const nextBlock = document.querySelector(".hero").nextElementSibling;
const snapQuery = matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
let pageScrolling = false;

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function smoothScrollTo(top, duration = 1100) {
  const start = scrollY;
  const distance = top - start;
  if (Math.abs(distance) < 2) return;
  if (!snapQuery.matches) {
    scrollTo({ top, behavior: "smooth" });
    return;
  }
  pageScrolling = true;
  const t0 = performance.now();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    scrollTo({ top, behavior: "instant" });
    pageScrolling = false;
  };
  requestAnimationFrame(function step(now) {
    if (done) return;
    const t = Math.min(1, (now - t0) / duration);
    // instant — иначе scroll-behavior: smooth из CSS растянет каждый шаг
    scrollTo({ top: start + distance * easeInOutCubic(t), behavior: "instant" });
    if (t < 1) requestAnimationFrame(step);
    else finish();
  });
  // страховка: если вкладка в фоне и кадры не идут, всё равно доезжаем и снимаем блокировку колеса
  setTimeout(finish, duration + 300);
}

addEventListener(
  "wheel",
  (e) => {
    if (!snapQuery.matches || e.ctrlKey) return;
    if (document.body.classList.contains("modal-open") || document.body.classList.contains("menu-open")) return;
    if (pageScrolling) {
      e.preventDefault();
      return;
    }
    const casesTop = nextBlock.offsetTop;
    if (e.deltaY > 0 && scrollY < casesTop - 2) {
      e.preventDefault();
      smoothScrollTo(casesTop);
    } else if (e.deltaY < 0 && scrollY > 0 && scrollY <= casesTop + 2) {
      e.preventDefault();
      smoothScrollTo(0);
    }
  },
  { passive: false }
);

document.addEventListener("click", (e) => {
  const link = e.target.closest('a[href^="#"]:not([href^="#case-"]):not([data-calc])');
  if (!link || link.getAttribute("href") === "#") return;
  const target = document.querySelector(link.getAttribute("href"));
  if (!target) return;
  e.preventDefault();
  smoothScrollTo(target.getBoundingClientRect().top + scrollY);
});

// Окно «Рассчитать стоимость»
const calc = document.getElementById("calc");
const calcForm = calc.querySelector(".calc");
const calcFormView = calc.querySelector(".calc__form");
const calcSuccess = calc.querySelector(".calc__success");

function openCalc() {
  calcFormView.hidden = false;
  calcSuccess.hidden = true;
  if (!calc.open) calc.showModal();
  document.body.classList.add("modal-open");
}

function onCalcClosed() {
  // событие close приходит асинхронно — окно могли уже открыть снова
  if (calc.open) return;
  if (!document.querySelector("dialog[open]")) document.body.classList.remove("modal-open");
  // после успешной отправки начинаем с чистой формы
  if (!calcSuccess.hidden) {
    calcForm.reset();
    calcFormView.hidden = false;
    calcSuccess.hidden = true;
  }
}

function closeCalc() {
  if (calc.open) calc.close();
  onCalcClosed();
}

calc.addEventListener("close", onCalcClosed);
calc.addEventListener("click", (e) => {
  if (e.target === calc || e.target.closest("[data-close]")) closeCalc();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest("[data-calc]")) return;
  e.preventDefault();
  openCalc();
});

// маска телефона: +7 (900) 000-00-00
function formatPhone(value) {
  let d = value.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = "+7";
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ")";
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}

// Заявка: маска телефона, проверка имени, телефона и согласия. onSuccess — что показать после отправки.
function bindLeadForm(form, onSuccess) {
  const phone = form.elements.phone;
  phone.addEventListener("input", () => {
    phone.value = phone.value.trim() ? formatPhone(phone.value) : "";
  });
  phone.addEventListener("focus", () => {
    if (!phone.value) phone.value = "+7 (";
  });
  phone.addEventListener("blur", () => {
    if (phone.value.replace(/\D/g, "").length <= 1) phone.value = "";
  });

  const setError = (name, message) => {
    form.querySelector(`[data-error="${name}"]`).textContent = message;
    form.elements[name].setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  };

  const validate = () => {
    const f = form.elements;
    const ok = [
      setError("name", f.name.value.trim() ? "" : "Как к вам обращаться?"),
      setError("phone", f.phone.value.replace(/\D/g, "").length === 11 ? "" : "Проверьте номер: нужно 10 цифр после +7"),
      setError("consent", f.consent.checked ? "" : "Нужно согласие, чтобы мы могли вам перезвонить"),
    ];
    const firstBad = form.querySelector('[aria-invalid="true"]');
    if (firstBad) firstBad.focus();
    return ok.every(Boolean);
  };

  ["name", "phone", "consent"].forEach((name) =>
    form.elements[name].addEventListener("input", () => {
      if (form.elements[name].getAttribute("aria-invalid") === "true") setError(name, "");
    })
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: отправка заявки на сервер / в CRM. Данные: Object.fromEntries(new FormData(form))
    onSuccess();
  });
}

bindLeadForm(calcForm, () => {
  calcFormView.hidden = true;
  calcSuccess.hidden = false;
  calc.scrollTop = 0;
});

const leadForm = document.querySelector(".lead-form");
bindLeadForm(leadForm, () => {
  leadForm.querySelector(".lead-form__fields").hidden = true;
  leadForm.querySelector(".lead-form__success").hidden = false;
});

// Шапка: после прокрутки первого экрана получает тёмную подложку
const header = document.querySelector(".header");
const updateHeader = () => header.classList.toggle("is-scrolled", scrollY > 40);
addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// Лента услуг: стрелки, перетаскивание мышью; на телефоне — обычная прокрутка пальцем
const servicesTrack = document.querySelector(".services__track");
const servicesButtons = document.querySelectorAll(".services__nav [data-scroll]");

function updateServicesNav() {
  const max = servicesTrack.scrollWidth - servicesTrack.clientWidth - 2;
  servicesButtons.forEach((b) => {
    b.disabled = b.dataset.scroll < 0 ? servicesTrack.scrollLeft <= 2 : servicesTrack.scrollLeft >= max;
  });
}

servicesButtons.forEach((b) =>
  b.addEventListener("click", () => {
    const card = servicesTrack.querySelector(".service");
    const step = card.offsetWidth + parseFloat(getComputedStyle(card.parentElement).columnGap || 0);
    servicesTrack.scrollBy({ left: step * Number(b.dataset.scroll), behavior: "smooth" });
  })
);
servicesTrack.addEventListener("scroll", updateServicesNav, { passive: true });
addEventListener("resize", updateServicesNav);
updateServicesNav();

let drag = null;
servicesTrack.addEventListener("pointerdown", (e) => {
  if (e.pointerType !== "mouse" || e.button !== 0) return;
  drag = { x: e.clientX, left: servicesTrack.scrollLeft, moved: false };
});
addEventListener("pointermove", (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (!drag.moved && Math.abs(dx) < 5) return;
  drag.moved = true;
  servicesTrack.classList.add("is-dragging");
  servicesTrack.scrollLeft = drag.left - dx;
});
addEventListener("pointerup", () => {
  if (!drag) return;
  const wasMoved = drag.moved;
  drag = null;
  servicesTrack.classList.remove("is-dragging");
  // после перетаскивания не считаем отпускание кликом
  if (wasMoved) servicesTrack.addEventListener("click", (e) => e.preventDefault(), { capture: true, once: true });
});
