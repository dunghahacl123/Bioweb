const socialLinks = [
  { name: "Discord", handle: "haunek0532", icon: "fa-brands fa-discord", color: "#8ea1ff", url: "https://discord.com/users/1280040102562893921" },
  { name: "TikTok", handle: "xiplord", icon: "fa-brands fa-tiktok", color: "#25f4ee", url: "https://tiktok.com/@xiplord" },
  { name: "GitHub", handle: "dunghahacl123", icon: "fa-brands fa-github", color: "#f5f5f5", url: "https://github.com/dunghahacl123" },
  { name: "Facebook", handle: "Dũng Xịp", icon: "fa-brands fa-facebook", color: "#5aa2ff", url: "https://www.facebook.com/Dungxip" },
];

const themes = {
  dark: { label: "Dark", a: "#00f5ff", b: "#ff2bd6" },
  neon: { label: "Neon", a: "#00f5ff", b: "#7cff6b" },
  synthwave: { label: "Synthwave", a: "#ff8a00", b: "#ff2bd6" },
  hacker: { label: "Hacker", a: "#39ff14", b: "#00f5a0" },
  minimal: { label: "Minimal", a: "#e8f0ff", b: "#8ea1ff" }
};

const backgrounds = {
  aurora: { label: "Aurora", a: "#00f5ff", b: "#ff2bd6" },
  matrix: { label: "Matrix", a: "#39ff14", b: "#00f5a0" },
  city: { label: "Neon City", a: "#ff2bd6", b: "#00f5ff" },
  void: { label: "Void", a: "#8ea1ff", b: "#101827" }
};

const state = {
  mouseX: innerWidth / 2,
  mouseY: innerHeight / 2,
  particleCount: Number(localStorage.getItem("particleCount")) || 72,
  playing: false,
  progress: 0,
  konami: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function initLoader() {
  setTimeout(() => {
    $("#loader").classList.add("hidden");
    if (!localStorage.getItem("welcomeSeen")) {
      openModal("welcomeModal");
      localStorage.setItem("welcomeSeen", "true");
    }
  }, 900);
}

function renderLinks() {
  $("#socialLinks").innerHTML = socialLinks.map((link) => `
    <a class="social-link magnetic" href="${link.url}" target="_blank" rel="noreferrer" style="--link-color:${link.color}" aria-label="${link.name}">
      <i class="${link.icon}"></i>
      <span><strong>${link.name}</strong><span>${link.handle}</span></span>
      <i class="fa-solid fa-arrow-up-right-from-square arrow"></i>
    </a>
  `).join("");

  $$(".social-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      const ripple = document.createElement("span");
      const rect = link.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      link.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });
  });
}

function typingEffect() {
  const phrases = [
    "Sell ske rate 1/1.5kvnđ",
    "Giá rẻ, uy tín, nhanh chóng",
    "Sell elytra rate 1/10kvnđ",
    "Sell money rate 150vnđ/1m",
  ];
  const target = $("#typingText");
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const phrase = phrases[phraseIndex];
    target.textContent = phrase.slice(0, charIndex);
    if (!deleting && charIndex < phrase.length) charIndex++;
    else if (deleting && charIndex > 0) charIndex--;
    else {
      deleting = !deleting;
      if (!deleting) phraseIndex = (phraseIndex + 1) % phrases.length;
    }
    setTimeout(tick, deleting ? 38 : 70);
  };
  tick();
}

function initThemes() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  const savedBg = localStorage.getItem("background") || "aurora";
  const savedAccent = localStorage.getItem("accent");
  document.body.dataset.theme = savedTheme;
  document.body.dataset.bg = savedBg;
  if (savedAccent) document.documentElement.style.setProperty("--accent", savedAccent);
  $("#themeOptions").innerHTML = Object.entries(themes).map(([key, theme]) => `
    <button class="theme-choice ${key === savedTheme ? "active" : ""}" data-theme="${key}">
      <span class="swatch" style="--swatch-a:${theme.a};--swatch-b:${theme.b}"></span>${theme.label}
    </button>
  `).join("");
  $("#backgroundOptions").innerHTML = Object.entries(backgrounds).map(([key, bg]) => `
    <button class="theme-choice ${key === savedBg ? "active" : ""}" data-bg="${key}">
      <span class="swatch" style="--swatch-a:${bg.a};--swatch-b:${bg.b}"></span>${bg.label}
    </button>
  `).join("");

  $$(".theme-choice").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.theme) setTheme(button.dataset.theme);
      if (button.dataset.bg) setBackground(button.dataset.bg);
    });
  });

  $("#accentPicker").addEventListener("input", (event) => {
    document.documentElement.style.setProperty("--accent", event.target.value);
    localStorage.setItem("accent", event.target.value);
  });

  $("#particleIntensity").value = state.particleCount;
  $("#particleIntensity").addEventListener("input", (event) => {
    state.particleCount = Number(event.target.value);
    localStorage.setItem("particleCount", state.particleCount);
    createParticles();
  });
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  $$("[data-theme]").forEach((button) => button.classList.toggle("active", button.dataset.theme === theme));
  showToast(`${themes[theme].label} theme activated`);
}

function setBackground(background) {
  document.body.dataset.bg = background;
  localStorage.setItem("background", background);
  $$("[data-bg]").forEach((button) => button.classList.toggle("active", button.dataset.bg === background));
  showToast(`${backgrounds[background].label} background active`);
}

function cycleTheme() {
  const keys = Object.keys(themes);
  const current = document.body.dataset.theme || "dark";
  setTheme(keys[(keys.indexOf(current) + 1) % keys.length]);
}

function initClockAndStats() {
  const updateClock = () => {
    $("#digitalClock").textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(new Date());
  };
  updateClock();
  setInterval(updateClock, 1000);

  let visitors = 24800;
  setInterval(() => {
    visitors += Math.floor(Math.random() * 4);
    $("#visitorCount").textContent = visitors.toLocaleString();
  }, 2200);
}

let particles = [];
const canvas = $("#particleCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * ratio;
  canvas.height = innerHeight * ratio;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
}

function createParticles() {
  particles = Array.from({ length: state.particleCount }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    size: Math.random() * 2.1 + 0.7,
    hue: Math.random() > 0.5 ? "accent" : "accent-2"
  }));
}

function animateParticles() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const accentTwo = getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim();

  particles.forEach((p, i) => {
    const dx = state.mouseX - p.x;
    const dy = state.mouseY - p.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 170) {
      p.x -= dx * 0.0025;
      p.y -= dy * 0.0025;
    }
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.vy *= -1;

    ctx.beginPath();
    ctx.fillStyle = p.hue === "accent" ? accent : accentTwo;
    ctx.globalAlpha = 0.62;
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const gap = Math.hypot(p.x - q.x, p.y - q.y);
      if (gap < 95) {
        ctx.beginPath();
        ctx.strokeStyle = accent;
        ctx.globalAlpha = (1 - gap / 95) * 0.12;
        ctx.lineWidth = 1;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }
    }
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(animateParticles);
}

function initCursor() {
  const dot = $("#cursorDot");
  const ring = $("#cursorRing");
  const glow = $("#mouseGlow");
  let ringX = state.mouseX;
  let ringY = state.mouseY;

  addEventListener("mousemove", (event) => {
    state.mouseX = event.clientX;
    state.mouseY = event.clientY;
    dot.style.transform = `translate(${state.mouseX}px, ${state.mouseY}px)`;
    glow.style.left = `${state.mouseX}px`;
    glow.style.top = `${state.mouseY}px`;

    if (Math.random() > 0.78 && innerWidth > 640) {
      const trail = document.createElement("span");
      trail.className = "trail-dot";
      trail.style.left = `${state.mouseX}px`;
      trail.style.top = `${state.mouseY}px`;
      $("#trailLayer").appendChild(trail);
      setTimeout(() => trail.remove(), 750);
    }
  });

  const follow = () => {
    ringX += (state.mouseX - ringX) * 0.18;
    ringY += (state.mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  };
  follow();

  document.addEventListener("mouseover", (event) => {
    ring.classList.toggle("active", Boolean(event.target.closest("a, button, input")));
  });
}

function initModals() {
  $("#settingsBtn").addEventListener("click", () => openModal("settingsModal"));
  $("#floatingSettings").addEventListener("click", () => openModal("settingsModal"));
  $("#shareBtn").addEventListener("click", () => openModal("shareModal"));
  $("#qrBtn").addEventListener("click", () => openModal("qrModal"));
  $("#coffeeQrBtn").addEventListener("click", () => openModal("qrModal"));
  $$("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });
  $$("dialog").forEach((modal) => {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
    modal.addEventListener("close", syncModalCursor);
  });
  $("#copyShare").addEventListener("click", async () => {
    await navigator.clipboard.writeText($("#shareUrl").value);
    showToast("Profile link copied");
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal.open) modal.showModal();
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  document.getElementById(id).close();
  syncModalCursor();
}

function syncModalCursor() {
  const hasOpenModal = $$("dialog").some((modal) => modal.open);
  document.body.classList.toggle("modal-open", hasOpenModal);
}

function initMusicPlayer() {
  const audio = $("#audioTrack");
  const progress = $("#progress");
  const playPause = $("#playPause");
  const disk = $("#disk");
  const volume = $("#volume");
  const currentTime = $("#currentTime");
  const durationTime = $("#durationTime");
  audio.volume = 0.24;
  volume.value = 24;

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  const setPlaying = (playing) => {
    state.playing = playing;
    playPause.innerHTML = state.playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    disk.classList.toggle("playing", state.playing);
  };

  const playTrack = async () => {
    try {
      await audio.play();
      setPlaying(true);
      showToast("Có Em is playing");
    } catch {
      setPlaying(false);
      showToast("Tap play to start music");
    }
  };

  const unlockAutoplay = () => {
    if (audio.paused) playTrack();
    removeEventListener("pointerdown", unlockAutoplay);
    removeEventListener("keydown", unlockAutoplay);
    removeEventListener("touchstart", unlockAutoplay);
  };

  playPause.addEventListener("click", async () => {
    if (audio.paused) await playTrack();
    else {
      audio.pause();
      setPlaying(false);
      showToast("Track paused");
    }
  });

  progress.addEventListener("input", () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value) / 100;
  });

  audio.addEventListener("loadedmetadata", () => {
    durationTime.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    progress.value = (audio.currentTime / audio.duration) * 100;
    currentTime.textContent = formatTime(audio.currentTime);
    durationTime.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    progress.value = 0;
    currentTime.textContent = "0:00";
    setPlaying(false);
  });

  $("#prevTrack").addEventListener("click", () => showToast("Previous demo track"));
  $("#nextTrack").addEventListener("click", () => showToast("Next demo track"));
  setTimeout(() => {
    playTrack();
    addEventListener("pointerdown", unlockAutoplay, { once: true });
    addEventListener("keydown", unlockAutoplay, { once: true });
    addEventListener("touchstart", unlockAutoplay, { once: true });
  }, 1500);
}

function initVisualizer() {
  const canvasViz = $("#visualizer");
  const vtx = canvasViz.getContext("2d");
  let enabled = true;
  $("#visualizerToggle").addEventListener("click", () => {
    enabled = !enabled;
    showToast(enabled ? "Visualizer on" : "Visualizer idle");
  });

  const draw = () => {
    vtx.clearRect(0, 0, canvasViz.width, canvasViz.height);
    const bars = 34;
    const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    const accentTwo = getComputedStyle(document.documentElement).getPropertyValue("--accent-2").trim();
    for (let i = 0; i < bars; i++) {
      const phase = Date.now() * 0.004 + i * 0.55;
      const activity = state.playing && enabled ? 1 : 0.35;
      const h = (Math.sin(phase) * 0.5 + 0.5) * 48 * activity + 8;
      const x = i * 7;
      const gradient = vtx.createLinearGradient(0, 70 - h, 0, 70);
      gradient.addColorStop(0, accent);
      gradient.addColorStop(1, accentTwo);
      vtx.fillStyle = gradient;
      vtx.globalAlpha = 0.82;
      vtx.fillRect(x, 70 - h, 4, h);
    }
    vtx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };
  draw();
}

function initGsap() {
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".reveal", {
    opacity: 0,
    y: 26,
    duration: 0.85,
    ease: "power3.out",
    stagger: 0.08,
    scrollTrigger: { trigger: ".shell", start: "top 82%" }
  });

  $$(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      gsap.to(el, {
        x: (event.clientX - rect.left - rect.width / 2) * 0.08,
        y: (event.clientY - rect.top - rect.height / 2) * 0.08,
        duration: 0.25,
        ease: "power2.out"
      });
    });
    el.addEventListener("mouseleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.35, ease: "elastic.out(1, 0.4)" }));
  });
}

function initParallax() {
  addEventListener("mousemove", () => {
    $$("[data-depth]").forEach((el) => {
      const depth = Number(el.dataset.depth);
      el.style.transform = `translate3d(${(state.mouseX - innerWidth / 2) * depth}px, ${(state.mouseY - innerHeight / 2) * depth}px, 0)`;
    });
  });
}

function initKeyboard() {
  const konamiCode = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "s") openModal("settingsModal");
    if (event.key.toLowerCase() === "t") cycleTheme();
    if (event.key.toLowerCase() === "q") openModal("qrModal");

    state.konami.push(event.key);
    state.konami = state.konami.slice(-konamiCode.length);
    if (state.konami.join(",") === konamiCode.join(",")) {
      document.body.classList.add("konami");
      state.particleCount = 140;
      createParticles();
      showToast("Easter egg unlocked: Hyper Neon");
      setTimeout(() => document.body.classList.remove("konami"), 900);
    }
  });
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function boot() {
  initLoader();
  renderLinks();
  typingEffect();
  initThemes();
  initClockAndStats();
  resizeCanvas();
  animateParticles();
  initCursor();
  initModals();
  initMusicPlayer();
  initVisualizer();
  initGsap();
  initParallax();
  initKeyboard();
}

addEventListener("resize", resizeCanvas);
document.addEventListener("DOMContentLoaded", boot);
