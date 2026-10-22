// Кровельный пирог: выбираешь тип кровли — видишь разрез слоёв и материалы.
// Общий для обоих вариантов сайта. Разметка: <div data-pie> с пустыми .pie__tabs, .pie__svg, .pie__layers.
(function () {
  const root = document.querySelector("[data-pie]");
  if (!root) return;

  // Слои сверху вниз. h — высота полосы на рисунке (условная, не в масштабе), kind — как её рисовать.
  const ROOFS = [
    {
      id: "flat",
      name: "Плоская мембранная",
      system: "ТехноНИКОЛЬ ТН-Кровля Смарт",
      layers: [
        { kind: "membrane", h: 12, name: "ПВХ-мембрана", material: "LOGICROOF V-RP", size: "1,2–1,5 мм", text: "Гидроизоляция. Полотна сваривают горячим воздухом в один сплошной ковёр." },
        { kind: "wool-dense", h: 34, name: "Жёсткий слой утеплителя", material: "Каменная вата ТЕХНОРУФ В ЭКСТРА", size: "40–50 мм", text: "Верхний плотный слой: по кровле можно ходить при монтаже и обслуживании, мембрана не продавливается." },
        { kind: "wool", h: 92, name: "Основной утеплитель", material: "Каменная вата ТЕХНОРУФ Н ЭКСТРА", size: "100–200 мм", text: "Держит тепло зимой и не даёт дому перегреваться летом. Не горит." },
        { kind: "film", h: 7, name: "Пароизоляция", material: "Плёнка ТехноНИКОЛЬ", size: "0,2 мм", text: "Не пускает тёплый влажный воздух из дома в утеплитель. Без неё вата намокает и перестаёт греть." },
        { kind: "profile", h: 50, name: "Основание", material: "Профлист Н60–Н114", size: "60–114 мм", text: "Несущее основание. Утеплитель и мембрану крепят к нему телескопическим крепежом." },
      ],
    },
    {
      id: "ballast",
      name: "Балластная",
      system: "ТехноНИКОЛЬ ТН-Кровля Балласт",
      caseId: "troitsky",
      caseName: "КП «Троицкий парк»",
      layers: [
        { kind: "gravel", h: 44, name: "Балласт", material: "Гравий или щебень фракции 20–40 мм", size: "от 50 мм", text: "Прижимает кровлю своим весом, поэтому мембрану не пробивают сквозным крепежом." },
        { kind: "geo", h: 7, name: "Защитный геотекстиль", material: "Иглопробивной, от 300 г/м²", size: "2–3 мм", text: "Защищает мембрану от острых краёв камня." },
        { kind: "membrane", h: 12, name: "ПВХ-мембрана", material: "LOGICROOF V-GR", size: "1,5 мм", text: "Гидроизоляция, рассчитанная на работу под балластом." },
        { kind: "geo", h: 7, name: "Разделительный геотекстиль", material: "Иглопробивной", size: "2–3 мм", text: "Разделяет мембрану и утеплитель, чтобы материалы не взаимодействовали." },
        { kind: "xps", h: 70, name: "Утеплитель", material: "XPS ТЕХНОНИКОЛЬ CARBON PROF", size: "100–200 мм", text: "Плиты не боятся влаги и нагрузки от балласта." },
        { kind: "film", h: 7, name: "Пароизоляция", material: "Плёнка ТехноНИКОЛЬ", size: "0,2 мм", text: "Отсекает пар из помещений." },
        { kind: "slab", h: 56, name: "Основание", material: "Железобетонная плита", size: "от 160 мм", text: "Несущая плита перекрытия выдерживает вес балласта." },
      ],
    },
    {
      id: "terrace",
      name: "Эксплуатируемая",
      system: "ТехноНИКОЛЬ ТН-Кровля Терраса",
      caseId: "fortops",
      caseName: "КП «Фортопс»",
      layers: [
        { kind: "deck", h: 26, name: "Покрытие террасы", material: "Террасная доска или плитка", size: "20–40 мм", text: "Ровный пол для мебели, зоны отдыха или купели. Вода уходит в зазоры и стекает к воронкам." },
        { kind: "supports", h: 40, name: "Регулируемые опоры", material: "Пластиковые опоры", size: "30–200 мм", text: "Выводят пол в идеальную горизонталь над уклоном кровли." },
        { kind: "geo", h: 7, name: "Геотекстиль", material: "Иглопробивной", size: "2–3 мм", text: "Защищает утеплитель и пропускает воду." },
        { kind: "xps", h: 62, name: "Утеплитель", material: "XPS ТЕХНОНИКОЛЬ CARBON PROF 300", size: "100–150 мм", text: "Выдерживает нагрузку от людей, мебели и купели." },
        { kind: "membrane", h: 12, name: "ПВХ-мембрана", material: "LOGICROOF V-GR", size: "1,5 мм", text: "Лежит под утеплителем, поэтому защищена от солнца, мороза и каблуков." },
        { kind: "slope", h: 30, name: "Уклон", material: "Клиновидный утеплитель или керамзит", size: "уклон 1,5–3 %", text: "Задаёт уклон, по которому вода уходит к воронкам." },
        { kind: "slab", h: 50, name: "Основание", material: "Железобетонная плита", size: "от 160 мм", text: "Несущая плита перекрытия." },
      ],
    },
    {
      id: "inverted",
      name: "Инверсионная",
      system: "Утеплитель поверх гидроизоляции",
      layers: [
        { kind: "gravel", h: 40, name: "Балласт", material: "Гравий фракции 20–40 мм", size: "от 50 мм", text: "Прижимает лёгкие плиты утеплителя и защищает их от солнца." },
        { kind: "geo", h: 7, name: "Геотекстиль", material: "Иглопробивной", size: "2–3 мм", text: "Не даёт гравию забиваться между плитами." },
        { kind: "xps", h: 70, name: "Утеплитель", material: "XPS ТЕХНОНИКОЛЬ CARBON PROF", size: "100–200 мм", text: "Лежит поверх гидроизоляции и бережёт её от перепадов температуры." },
        { kind: "membrane", h: 12, name: "ПВХ-мембрана", material: "LOGICROOF V-GR", size: "1,5 мм", text: "Гидроизоляция работает в тепле и без ультрафиолета — дольше служит." },
        { kind: "geo", h: 7, name: "Геотекстиль", material: "Иглопробивной", size: "2–3 мм", text: "Защищает мембрану снизу от неровностей основания." },
        { kind: "slope", h: 30, name: "Уклон", material: "Керамзит или клиновидный утеплитель", size: "уклон 1,5–3 %", text: "Ведёт воду к воронкам." },
        { kind: "slab", h: 50, name: "Основание", material: "Железобетонная плита", size: "от 160 мм", text: "Несущая плита перекрытия." },
      ],
    },
    {
      id: "seam",
      name: "Фальцевая",
      system: "Скатная кровля из металла",
      caseId: "glagolevo",
      caseName: "КП «Глаголево-парк»",
      pitched: true,
      layers: [
        { kind: "metal", h: 22, name: "Фальцевое покрытие", material: "Сталь с полимером, медь или цинк-титан", size: "0,5–0,7 мм", text: "Листы соединяют двойным стоячим фальцем — герметично и без сквозных саморезов." },
        { kind: "mat", h: 9, name: "Разделительный слой", material: "Структурированная мембрана", size: "8 мм", text: "Отводит конденсат с обратной стороны металла и гасит шум дождя." },
        { kind: "wood", h: 22, name: "Сплошной настил", material: "Доска или плита OSB-3", size: "22–25 мм", text: "Ровное основание под фальцевые листы." },
        { kind: "air", h: 30, name: "Вентилируемый зазор", material: "Контробрешётка", size: "50 мм", text: "Поток воздуха под настилом выносит влагу из пирога." },
        { kind: "film", h: 7, name: "Ветро-влагозащита", material: "Диффузионная мембрана", size: "0,5 мм", text: "Выпускает пар наружу и не пускает ветер и воду внутрь." },
        { kind: "wool", h: 92, name: "Утеплитель", material: "Каменная вата между стропилами", size: "200 мм", text: "Основной тёплый слой скатной кровли." },
        { kind: "film", h: 7, name: "Пароизоляция", material: "Плёнка ТехноНИКОЛЬ", size: "0,2 мм", text: "Отсекает пар со стороны жилой мансарды." },
      ],
    },
    {
      id: "slate",
      name: "Из натурального сланца",
      system: "Скатная кровля из камня",
      caseId: "castle",
      caseName: "Замок Гарибальди",
      pitched: true,
      layers: [
        { kind: "slate", h: 30, name: "Натуральный сланец", material: "Плитка на нержавеющих крюках", size: "5–7 мм", text: "Европейский камень: не выгорает и не боится мороза. Подходит для башен и куполов." },
        { kind: "mat", h: 9, name: "Подкладочный ковёр", material: "Битумный ковёр ТехноНИКОЛЬ", size: "2–3 мм", text: "Второй рубеж гидроизоляции под камнем." },
        { kind: "wood", h: 22, name: "Сплошной настил", material: "Доска", size: "25 мм", text: "Основание, к которому крепят сланец." },
        { kind: "air", h: 30, name: "Вентилируемый зазор", material: "Контробрешётка", size: "50 мм", text: "Выносит влагу и не даёт настилу гнить." },
        { kind: "film", h: 7, name: "Ветро-влагозащита", material: "Диффузионная мембрана", size: "0,5 мм", text: "Выпускает пар и защищает утеплитель от ветра." },
        { kind: "wool", h: 92, name: "Утеплитель", material: "Каменная вата между стропилами", size: "200 мм", text: "Держит тепло под каменной кровлей." },
        { kind: "film", h: 7, name: "Пароизоляция", material: "Плёнка ТехноНИКОЛЬ", size: "0,2 мм", text: "Отсекает пар со стороны дома." },
      ],
    },
  ];

  const NS = "http://www.w3.org/2000/svg";
  const W = 640;
  const SCALE = 1.5; // полосы выше — разрез читается крупнее
  const tabs = root.querySelector(".pie__tabs");
  const svg = root.querySelector(".pie__svg");
  const list = root.querySelector(".pie__layers");
  const system = root.querySelector("[data-pie-system]");
  const caseBtn = root.querySelector("[data-pie-case]");
  const panel = root.querySelector(".pie__body");
  let current = ROOFS[0];

  const el = (tag, attrs = {}, parent) => {
    const node = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    if (parent) parent.append(node);
    return node;
  };

  // Узоры материалов: гравий, вата, XPS, бетон, дерево, разделительный мат
  const defs = el("defs", {}, svg);
  const pattern = (id, w, h, draw) => {
    const p = el("pattern", { id, width: w, height: h, patternUnits: "userSpaceOnUse" }, defs);
    draw(p);
  };
  pattern("pie-p-gravel", 26, 22, (p) => {
    el("circle", { cx: 6, cy: 7, r: 5, class: "pie__mark" }, p);
    el("circle", { cx: 19, cy: 15, r: 6, class: "pie__mark" }, p);
    el("circle", { cx: 20, cy: 3, r: 2.5, class: "pie__mark" }, p);
  });
  pattern("pie-p-wool", 24, 12, (p) => el("path", { d: "M0 6 Q6 0 12 6 T24 6", class: "pie__stroke" }, p));
  pattern("pie-p-xps", 40, 10, (p) => el("path", { d: "M0 5 H40", class: "pie__stroke" }, p));
  pattern("pie-p-slab", 18, 18, (p) => {
    el("circle", { cx: 4, cy: 5, r: 1.6, class: "pie__mark" }, p);
    el("circle", { cx: 13, cy: 12, r: 1.2, class: "pie__mark" }, p);
  });
  pattern("pie-p-wood", 60, 8, (p) => el("path", { d: "M0 4 Q20 1 40 4 T80 4", class: "pie__stroke" }, p));
  pattern("pie-p-mat", 8, 8, (p) => el("path", { d: "M0 8 L8 0", class: "pie__stroke" }, p));
  pattern("pie-p-geo", 6, 6, (p) => el("circle", { cx: 3, cy: 3, r: 0.8, class: "pie__mark" }, p));

  // Рисунок одной полосы
  function drawBand(g, layer, y) {
    const { kind, h } = layer;
    const base = (fill) => el("rect", { x: 0, y, width: W, height: h, class: `pie__fill pie__fill--${fill}` }, g);
    const over = (id) => el("rect", { x: 0, y, width: W, height: h, fill: `url(#${id})`, class: "pie__overlay" }, g);
    switch (kind) {
      case "gravel": base("gravel"); over("pie-p-gravel"); break;
      case "wool": case "wool-dense": base(kind); over("pie-p-wool"); break;
      case "xps": base("xps"); over("pie-p-xps"); break;
      case "slab": base("slab"); over("pie-p-slab"); break;
      case "wood": base("wood"); over("pie-p-wood"); break;
      case "mat": base("mat"); over("pie-p-mat"); break;
      case "geo": base("geo"); over("pie-p-geo"); break;
      case "profile": {
        // трапециевидный профлист: гребни и впадины
        let d = `M0 ${y + h}`;
        for (let x = 0; x < W; x += 80) d += ` L${x + 10} ${y + h} L${x + 22} ${y} L${x + 58} ${y} L${x + 70} ${y + h} L${x + 80} ${y + h}`;
        el("path", { d: d + ` L${W} ${y + h} Z`, class: "pie__fill pie__fill--metal" }, g);
        break;
      }
      case "metal": {
        el("rect", { x: 0, y: y + 8, width: W, height: h - 8, class: "pie__fill pie__fill--metal" }, g);
        for (let x = 40; x < W; x += 120) el("rect", { x: x, y, width: 6, height: h, class: "pie__fill pie__fill--metal-seam" }, g);
        break;
      }
      case "slate": {
        for (let row = 0; row < 2; row++) {
          for (let x = row ? -30 : 0; x < W; x += 60) {
            el("rect", { x: x + 1, y: y + row * (h / 2), width: 58, height: h / 2 + 4, rx: 3, class: "pie__fill pie__fill--slate" }, g);
          }
        }
        break;
      }
      case "deck": {
        for (let x = 0; x < W; x += 64) el("rect", { x: x + 2, y, width: 60, height: h, class: "pie__fill pie__fill--deck" }, g);
        break;
      }
      case "supports": {
        for (let x = 30; x < W; x += 120) {
          el("path", { d: `M${x} ${y} H${x + 30} L${x + 24} ${y + h - 6} H${x + 6} Z`, class: "pie__fill pie__fill--support" }, g);
          el("rect", { x: x - 6, y: y + h - 6, width: 42, height: 6, class: "pie__fill pie__fill--support" }, g);
        }
        break;
      }
      case "air": {
        for (let x = 20; x < W; x += 110) el("rect", { x, y, width: 44, height: h, class: "pie__fill pie__fill--wood" }, g);
        break;
      }
      case "slope":
        el("path", { d: `M0 ${y + h * 0.35} L${W} ${y} V${y + h} H0 Z`, class: "pie__fill pie__fill--slope" }, g);
        break;
      default:
        base(kind); // membrane, film
    }
    // область наведения и обводка выбранного слоя
    el("rect", { x: 0, y, width: W, height: h, class: "pie__hit" }, g);
  }

  function setActive(index) {
    svg.querySelectorAll(".pie__band").forEach((g, i) => g.classList.toggle("is-active", i === index));
    list.querySelectorAll(".pie__layer").forEach((li, i) => {
      const active = i === index;
      li.classList.toggle("is-active", active);
      li.querySelector("button").setAttribute("aria-expanded", String(active));
    });
    svg.classList.toggle("has-active", index >= 0);
  }

  function render(roof) {
    current = roof;
    svg.querySelectorAll(".pie__stack").forEach((n) => n.remove());
    const gap = 3;
    const total = roof.layers.reduce((sum, l) => sum + l.h * SCALE + gap, 0) - gap;
    // у скатных кровель разрез наклонён — сразу видно, что это скат
    const tilt = roof.pitched ? 40 : 0;
    svg.setAttribute("viewBox", `0 0 ${W} ${total + tilt}`);
    const stack = el("g", { class: "pie__stack" }, svg);
    if (tilt) stack.setAttribute("transform", `translate(0 ${tilt}) skewY(${(-Math.atan(tilt / W) * 180) / Math.PI})`);

    let y = 0;
    roof.layers.forEach((layer, i) => {
      const g = el("g", { class: "pie__band", "data-i": i, style: `--i:${i}` }, stack);
      drawBand(g, { ...layer, h: layer.h * SCALE }, y);
      g.addEventListener("pointerenter", () => setActive(i));
      g.addEventListener("click", () => setActive(i));
      y += layer.h * SCALE + gap;
    });

    list.innerHTML = roof.layers
      .map(
        (l, i) => `<li class="pie__layer" data-i="${i}">
          <button type="button" aria-expanded="false" aria-controls="pie-layer-${i}">
            <span class="pie__swatch pie__fill--${l.kind === "profile" || l.kind === "metal" ? "metal" : l.kind === "air" ? "wood" : l.kind === "supports" ? "support" : l.kind}" aria-hidden="true"></span>
            <span class="pie__layer-name">${l.name}<span class="pie__layer-material">${l.material}</span></span>
            <span class="pie__layer-size">${l.size}</span>
          </button>
          <p class="pie__layer-text" id="pie-layer-${i}">${l.text}</p>
        </li>`
      )
      .join("");
    list.querySelectorAll(".pie__layer").forEach((li, i) => {
      li.addEventListener("pointerenter", () => setActive(i));
      li.querySelector("button").addEventListener("click", () => setActive(i));
      li.querySelector("button").addEventListener("focus", () => setActive(i));
    });

    system.textContent = `${roof.system} · ${roof.layers.length} слоёв`;
    panel.setAttribute("aria-labelledby", `pie-tab-${roof.id}`);
    caseBtn.hidden = !roof.caseId;
    if (roof.caseId) caseBtn.querySelector("span").textContent = roof.caseName;
    setActive(0);
  }

  // Вкладки: стрелки влево/вправо переключают тип кровли
  tabs.innerHTML = ROOFS.map(
    (r, i) => `<button class="pie__tab" type="button" role="tab" id="pie-tab-${r.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-id="${r.id}">${r.name}</button>`
  ).join("");
  const tabButtons = [...tabs.querySelectorAll(".pie__tab")];
  const select = (i, focus) => {
    tabButtons.forEach((b, n) => {
      b.setAttribute("aria-selected", String(n === i));
      b.tabIndex = n === i ? 0 : -1;
    });
    if (focus) tabButtons[i].focus();
    render(ROOFS[i]);
  };
  tabButtons.forEach((b, i) => b.addEventListener("click", () => select(i)));
  tabs.addEventListener("keydown", (e) => {
    const i = tabButtons.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === "ArrowRight") select((i + 1) % tabButtons.length, true);
    else if (e.key === "ArrowLeft") select((i - 1 + tabButtons.length) % tabButtons.length, true);
    else return;
    e.preventDefault();
  });

  // «Где делали» открывает окно кейса — тот же путь, что клик по карточке кейса
  caseBtn.addEventListener("click", () => {
    const card = document.querySelector(`a.case[href="#case-${current.caseId}"]`);
    if (card) card.click();
  });

  root.classList.add("is-ready");
  render(ROOFS[0]);
})();
