// Cinema Palette — Client-side cinematic color tool
// Multilingual: FR / EN / Tamazight (Tifinagh via Noto)

const i18n = {
  fr: {
    title: "Cinema Palette",
    labelBase: "Couleur de base",
    generate: "Générer",
    presetsTitle: "Presets cinématiques",
    extractTitle: "Extraire d'une image",
    exportCss: "Exporter CSS",
    exportJson: "Exporter JSON",
    exportPng: "Exporter PNG",
    copyHex: "Copier HEX",
    footer: "Outil gratuit open source · MIT · Aucune donnée envoyée",
    copied: "Copié !"
  },
  en: {
    title: "Cinema Palette",
    labelBase: "Base color",
    generate: "Generate",
    presetsTitle: "Cinematic presets",
    extractTitle: "Extract from image",
    exportCss: "Export CSS",
    exportJson: "Export JSON",
    exportPng: "Export PNG",
    copyHex: "Copy HEX",
    footer: "Free open-source tool · MIT · No data sent",
    copied: "Copied!"
  },
  tz: {
    title: "ⵜⴰⵍⵉⵙⵜ ⵏ ⵜⵎⵓⵙⵏⵉⵏ",
    labelBase: "ⴰⴽⵍⵓ ⴰⵙⵏⵜⵉ",
    generate: "ⵙⵏⵓⵍⴼⵓ",
    presetsTitle: "ⵉⵎⵓⴴⴰⵏ ⵏ ⵙⵉⵏⵉⵎⴰ",
    extractTitle: "ⵙⵙⵓⴼⵖ ⵙⴳ ⵜⵕⵍⴰⴼⵜ",
    exportCss: "ⵙⵙⵓⴼⵖ CSS",
    exportJson: "ⵙⵙⵓⴼⵖ JSON",
    exportPng: "ⵙⵙⵓⴼⵖ PNG",
    copyHex: "ⵏⵖⵍ HEX",
    footer: "ⴰⵍⵍⴰⵍ ⵉⵍⵍⵍⵉ · MIT · ⵓⵍⴰ ⵉⵙⵍⴼⴽ ⵏ ⵉⵙⴼⴽⴰ",
    copied: "ⵉⵜⵜⵓⵏⵖⵍ !"
  }
};

let currentLang = "fr";
let currentPalette = [];

const presets = [
  { name: "Teal & Orange", colors: ["#0d3b4c", "#1a5f7a", "#e07a3d", "#f4a261", "#2c1810"] },
  { name: "Noir", colors: ["#0a0a0a", "#1c1c1c", "#3d3d3d", "#8b7355", "#c9b896"] },
  { name: "Golden Hour", colors: ["#1a1208", "#4a3018", "#c17f3e", "#e8b86d", "#f5e6c8"] },
  { name: "Sci-Fi", colors: ["#0a1628", "#1e3a5f", "#4a90a4", "#7ec8c3", "#e8f4f8"] },
  { name: "Blade Runner", colors: ["#1a0a1e", "#4a1c3a", "#c44b6a", "#e8a0b0", "#2a1a28"] },
  { name: "Western", colors: ["#2c1810", "#5c3a21", "#a67c52", "#d4a574", "#f0e6d2"] }
];

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll(".lang-switch button").forEach(b => b.classList.remove("active"));
  document.querySelector(`[data-lang="${lang}"]`).classList.add("active");
  const t = i18n[lang];
  document.getElementById("title").textContent = t.title;
  document.getElementById("label-base").textContent = t.labelBase;
  document.getElementById("generate").textContent = t.generate;
  document.getElementById("presets-title").textContent = t.presetsTitle;
  document.getElementById("extract-title").textContent = t.extractTitle;
  document.getElementById("export-css").textContent = t.exportCss;
  document.getElementById("export-json").textContent = t.exportJson;
  document.getElementById("export-png").textContent = t.exportPng;
  document.getElementById("copy-hex").textContent = t.copyHex;
  document.getElementById("footer-text").textContent = t.footer;
  if (lang === "tz") {
    document.body.style.fontFamily = "'Noto Sans Tifinagh', 'Inter', sans-serif";
  } else {
    document.body.style.fontFamily = "'Inter', system-ui, sans-serif";
  }
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(base, mode) {
  const [h, s, l] = hexToHsl(base);
  const colors = [base];
  if (mode === "teal-orange") {
    colors.push(hslToHex((h + 180) % 360, Math.min(s + 10, 90), Math.max(l - 15, 15)));
    colors.push(hslToHex((h + 30) % 360, Math.min(s + 5, 85), Math.min(l + 20, 70)));
    colors.push(hslToHex((h + 15) % 360, Math.max(s - 20, 20), Math.min(l + 35, 85)));
    colors.push(hslToHex(h, Math.max(s - 40, 10), Math.max(l - 40, 8)));
  } else if (mode === "analogous") {
    for (let i = 1; i <= 4; i++) colors.push(hslToHex((h + i * 25) % 360, s, l + (i % 2 ? 8 : -8)));
  } else if (mode === "complementary") {
    colors.push(hslToHex((h + 180) % 360, s, l));
    colors.push(hslToHex(h, s, Math.min(l + 25, 85)));
    colors.push(hslToHex((h + 180) % 360, s, Math.max(l - 25, 15)));
    colors.push(hslToHex(h, Math.max(s - 30, 15), 50));
  } else if (mode === "triadic") {
    colors.push(hslToHex((h + 120) % 360, s, l));
    colors.push(hslToHex((h + 240) % 360, s, l));
    colors.push(hslToHex(h, Math.max(s - 20, 20), Math.min(l + 15, 75)));
    colors.push(hslToHex((h + 120) % 360, Math.max(s - 15, 25), Math.max(l - 15, 20)));
  } else {
    colors.push(hslToHex((h + 150) % 360, s, l));
    colors.push(hslToHex((h + 210) % 360, s, l));
    colors.push(hslToHex(h, s, Math.min(l + 20, 80)));
    colors.push(hslToHex((h + 180) % 360, Math.max(s - 25, 15), 45));
  }
  return colors.slice(0, 5);
}

function renderPalette(colors) {
  currentPalette = colors;
  const container = document.getElementById("palette");
  container.innerHTML = "";
  colors.forEach(hex => {
    const div = document.createElement("div");
    div.className = "color-swatch";
    div.innerHTML = `<div class="swatch-color" style="background:${hex}"></div><div class="swatch-hex">${hex.toUpperCase()}</div>`;
    div.onclick = () => navigator.clipboard.writeText(hex);
    container.appendChild(div);
  });
}

function renderPresets() {
  const grid = document.getElementById("presets");
  grid.innerHTML = "";
  presets.forEach(p => {
    const card = document.createElement("div");
    card.className = "preset-card";
    const sw = document.createElement("div");
    sw.className = "preset-swatches";
    p.colors.forEach(c => {
      const s = document.createElement("span");
      s.style.background = c;
      sw.appendChild(s);
    });
    const name = document.createElement("div");
    name.className = "preset-name";
    name.textContent = p.name;
    card.appendChild(sw);
    card.appendChild(name);
    card.onclick = () => renderPalette(p.colors);
    grid.appendChild(card);
  });
}

document.getElementById("generate").onclick = () => {
  const base = document.getElementById("base-color").value;
  const mode = document.getElementById("harmony").value;
  renderPalette(generatePalette(base, mode));
};

document.querySelectorAll(".lang-switch button").forEach(btn => {
  btn.onclick = () => setLang(btn.dataset.lang);
});

document.getElementById("export-css").onclick = () => {
  const css = currentPalette.map((c, i) => `--color-${i + 1}: ${c};`).join("\n");
  download(`:root {\n${css}\n}`, "cinema-palette.css", "text/css");
};

document.getElementById("export-json").onclick = () => {
  download(JSON.stringify({ palette: currentPalette }, null, 2), "cinema-palette.json", "application/json");
};

document.getElementById("copy-hex").onclick = () => {
  navigator.clipboard.writeText(currentPalette.join(", "));
  const btn = document.getElementById("copy-hex");
  const orig = btn.textContent;
  btn.textContent = i18n[currentLang].copied;
  setTimeout(() => btn.textContent = orig, 1500);
};

document.getElementById("export-png").onclick = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  const w = canvas.width / currentPalette.length;
  currentPalette.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(i * w, 0, w, canvas.height);
  });
  canvas.toBlob(blob => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cinema-palette.png";
    a.click();
  });
};

document.getElementById("image-upload").onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const canvas = document.getElementById("extract-canvas");
    const ctx = canvas.getContext("2d");
    const size = 80;
    canvas.width = size;
    canvas.height = size;
    ctx.drawImage(img, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const buckets = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const key = `${Math.round(r/32)*32},${Math.round(g/32)*32},${Math.round(b/32)*32}`;
      buckets[key] = (buckets[key] || 0) + 1;
    }
    const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const colors = sorted.map(([k]) => {
      const [r, g, b] = k.split(",").map(Number);
      return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
    });
    renderPalette(colors);
  };
  img.src = URL.createObjectURL(file);
};

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// Init
setLang("fr");
renderPresets();
renderPalette(presets[0].colors);
