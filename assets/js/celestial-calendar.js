// celestial-calendar.js — Module-based, audit-grade clarity, no backend required.
//
// Usage: Include <script type="module" src="assets/js/celestial-calendar.js"></script>
// This file exposes no global symbols. All DOM wiring is done on DOMContentLoaded.

const DEFAULT_MODEL = "gpt-4o-mini"; // change if you prefer another model
const SAMPLE_EVENTS = [
  {
    id: "le-2025-03-14",
    name: "Total Lunar Eclipse",
    date: "2025-03-14",
    visibility: "Visible across Europe, Africa, Asia",
    type: "lunar_eclipse"
  },
  {
    id: "perseids-2025-08",
    name: "Perseid Meteor Shower (Peak)",
    date: "2025-08-13",
    visibility: "Best in Northern Hemisphere",
    type: "meteor_shower"
  },
  {
    id: "falcon9-2025-01-20",
    name: "Falcon 9 Launch — Starlink",
    date: "2025-01-20",
    visibility: "Launch region and downrange viewers",
    type: "launch"
  }
];

// -------------------------- Utility helpers --------------------------
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") node.className = v;
    else if (k.startsWith("aria-")) node.setAttribute(k, v);
    else if (k === "html") node.innerHTML = v;
    else node[k] = v;
  });
  (Array.isArray(children) ? children : [children]).forEach(c => {
    if (!c) return;
    if (typeof c === "string") node.appendChild(document.createTextNode(c));
    else node.appendChild(c);
  });
  return node;
}

function formatDateISO(d) {
  try {
    const dt = new Date(d + "T00:00:00Z");
    return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return d;
  }
}

// -------------------------- Rendering functions --------------------------
function renderEventCard(event, onExplainClick) {
  const title = el("div", { class: "event-title" }, event.name);
  const date = el("div", { class: "event-meta" }, `Date: ${formatDateISO(event.date)}`);
  const visibility = el("div", { class: "event-meta" }, `Visibility: ${event.visibility || "Varies"}`);
  const badge = el("span", { class: "badge" }, (event.type || "event").replace("_", " ").toUpperCase());

  const explainBtn = el("button", { class: "btn", type: "button", onclick: () => onExplainClick(event) }, "Why does this happen?");
  const card = el("article", { class: "event-card", role: "article", "aria-labelledby": `title-${event.id}` }, [
    el("div", {}, [
      el("h3", { id: `title-${event.id}`, class: "event-title" }, event.name),
      date,
      visibility
    ]),
    el("div", { class: "event-actions" }, [badge, explainBtn])
  ]);
  return card;
}

function renderEventsGrid(container, events, onExplainClick) {
  container.innerHTML = "";
  if (!events.length) {
    container.appendChild(el("div", { class: "event-card" }, "No upcoming events."));
    return;
  }
  events.forEach(ev => container.appendChild(renderEventCard(ev, onExplainClick)));
}

// -------------------------- Modal logic --------------------------
const modal = {
  root: null,
  title: null,
  body: null,
  closeBtn: null,
  copyBtn: null,
  cancelBtn: null,

  open() {
    this.root.setAttribute("aria-hidden", "false");
    this.root.style.display = "flex";
    // trap focus:
    this.closeBtn.focus();
    document.body.style.overflow = "hidden";
  },

  close() {
    this.root.setAttribute("aria-hidden", "true");
    this.root.style.display = "none";
    document.body.style.overflow = "";
  },

  setContent(title, htmlContent) {
    this.title.textContent = title;
    this.body.innerHTML = "";
    if (typeof htmlContent === "string") this.body.textContent = htmlContent;
    else this.body.appendChild(htmlContent);
  },

  showLoading() {
    this.body.innerHTML = "";
    const spinner = el("div", { class: "badge" }, "Fetching explanation…");
    this.body.appendChild(spinner);
  }
};

// -------------------------- OpenAI API call (client-side) --------------------------
// WARNING: embedding a long-lived API key in client code is insecure. This page uses a user-entered key
// stored in sessionStorage for convenience. For public sites you should use a short-lived token or a
// server-side proxy.
async function fetchAIExplanationOpenAI(apiKey, event, model = DEFAULT_MODEL) {
  // Minimal, audit-grade request using chat completions endpoint
  const prompt = [
    { role: "system", content: "You are a concise astronomy explainer for general audiences." },
    { role: "user", content:
      `Explain, in plain language (2-6 short paragraphs), why the following celestial event happens and what an observer should expect.\n\nEvent name: ${event.name}\nDate: ${event.date}\nVisibility: ${event.visibility}\n\nKeep the explanation focused and cite no external URLs.` }
  ];

  const payload = {
    model,
    messages: prompt,
    max_tokens: 450,
    temperature: 0.2
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`OpenAI API error: ${resp.status} ${resp.statusText} - ${txt}`);
  }

  const data = await resp.json();
  // safety: defend against unexpected shapes
  if (data.choices && data.choices.length && data.choices[0].message) {
    return data.choices[0].message.content.trim();
  } else if (data.choices && data.choices.length && data.choices[0].text) {
    return data.choices[0].text.trim();
  } else {
    throw new Error("Unexpected response structure from OpenAI API.");
  }
}

// -------------------------- Demo fallback (no API) --------------------------
function generateDemoExplanation(event) {
  // Short, generic demos per type
  if (event.type === "lunar_eclipse") {
    return `A lunar eclipse happens when the Earth passes between the Sun and the Moon, casting Earth's shadow onto the Moon. Observers in the eclipse visibility zone will see the Moon darken and often take on a reddish tint as sunlight refracts through Earth's atmosphere. Totality can last from minutes to a few hours depending on geometry.`;
  }
  if (event.type === "meteor_shower") {
    return `Meteor showers occur when Earth crosses a trail of debris left by a comet or asteroid. Small particles burn up in the upper atmosphere, creating streaks of light. The “peak” night is when the Earth intersects the densest part of the debris stream, and you can see dozens to hundreds of meteors per hour under dark skies.`;
  }
  if (event.type === "launch") {
    return `A rocket launch is the result of a spacecraft being propelled from Earth by rocket engines. Depending on the trajectory and staging, launches may be visible as a bright moving light in the sky from some regions. Visibility windows depend on the launch azimuth and viewer location.`;
  }
  return `This is a celestial event. Observers nearby may see changes in brightness, motion, or shading depending on event type and geography.`;
}

// -------------------------- App wiring and init --------------------------
function readSessionApiKey() {
  return sessionStorage.getItem("openai_api_key") || "";
}

function saveSessionApiKey(key) {
  if (key) sessionStorage.setItem("openai_api_key", key);
  else sessionStorage.removeItem("openai_api_key");
}

function promptForApiKey() {
  const current = readSessionApiKey();
  const key = window.prompt("Paste your OpenAI API key (it will be stored in session only):", current || "");
  if (key !== null) {
    const trimmed = key.trim();
    if (trimmed) saveSessionApiKey(trimmed);
    else saveSessionApiKey("");
    updateKeyIndicator();
  }
}

function updateKeyIndicator() {
  const indicator = document.getElementById("key-indicator");
  const k = readSessionApiKey();
  indicator.textContent = k ? "API key set (session)" : "Demo mode (no API key)";
}

async function onExplainRequest(event) {
  modal.showLoading();
  modal.setContent(`Why does "${event.name}" happen?`, document.createTextNode(""));
  modal.open();

  const apiKey = readSessionApiKey();
  try {
    let explanation;
    if (!apiKey) {
      // demo fallback
      await new Promise(r => setTimeout(r, 400)); // small delay for UX
      explanation = generateDemoExplanation(event);
    } else {
      explanation = await fetchAIExplanationOpenAI(apiKey, event);
    }
    modal.setContent(`Why does "${event.name}" happen?`, explanation);
  } catch (err) {
    modal.setContent("Error collecting explanation", `Failed to fetch explanation: ${err.message}\n\nYou can enable demo mode (no API) or enter a valid API key.`);
  }
}

function attachModalEvents() {
  modal.root = document.getElementById("explain-modal");
  modal.title = document.getElementById("modal-title");
  modal.body = document.getElementById("modal-body");
  modal.closeBtn = document.getElementById("modal-close");
  modal.copyBtn = document.getElementById("modal-copy");
  modal.cancelBtn = document.getElementById("modal-cancel");

  modal.closeBtn.addEventListener("click", () => modal.close());
  modal.cancelBtn.addEventListener("click", () => modal.close());
  modal.copyBtn.addEventListener("click", () => {
    const txt = modal.body.innerText || modal.body.textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(txt);
  });

  // close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.root.getAttribute("aria-hidden") === "false") {
      modal.close();
    }
  });

  // click outside to close
  modal.root.addEventListener("click", (ev) => {
    if (ev.target === modal.root) modal.close();
  });
}

function initControls(events, container) {
  document.getElementById("set-key").addEventListener("click", () => promptForApiKey());
  document.getElementById("toggle-demo").addEventListener("click", () => {
    const k = readSessionApiKey();
    if (k) { saveSessionApiKey(""); } else { /* ask user to paste to enable real mode */ }
    updateKeyIndicator();
  });
  updateKeyIndicator();
}

function initCalendar({ events = SAMPLE_EVENTS } = {}) {
  const container = document.getElementById("calendar-root");
  attachModalEvents();

  function onExplainClick(event) {
    onExplainRequest(event);
  }

  renderEventsGrid(container, events, onExplainClick);
  initControls(events, container);
}

document.addEventListener("DOMContentLoaded", () => {
  // Here you could fetch a simple events JSON file if you prefer not to hardcode:
  // fetch('events.json').then(r=>r.json()).then(list=>initCalendar({events:list}));
  initCalendar({ events: SAMPLE_EVENTS });
});
