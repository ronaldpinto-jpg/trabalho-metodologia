const BRASILIA = [-15.793889, -47.882778];

let offers = [
  {
    id: 1,
    food: "20 pães franceses",
    quantity: 20,
    unit: "unidades",
    category: "padaria",
    place: "Padaria Brasília",
    region: "Asa Norte",
    address: "SQN 204, Brasília - DF",
    time: "20:00",
    lat: -15.7688,
    lng: -47.8711,
    icon: "🍞",
    status: "disponivel"
  },
  {
    id: 2,
    food: "12 marmitas vegetarianas",
    quantity: 12,
    unit: "marmitas",
    category: "restaurante",
    place: "Sabor do Cerrado",
    region: "Asa Sul",
    address: "CLS 205, Brasília - DF",
    time: "19:30",
    lat: -15.8157,
    lng: -47.8959,
    icon: "🍱",
    status: "urgente"
  },
  {
    id: 3,
    food: "8 caixas de frutas",
    quantity: 8,
    unit: "caixas",
    category: "mercado",
    place: "Mercado Central",
    region: "Sudoeste",
    address: "CLSW 302, Brasília - DF",
    time: "18:00",
    lat: -15.8038,
    lng: -47.9236,
    icon: "🍎",
    status: "urgente"
  },
  {
    id: 4,
    food: "15 kits de alimentos",
    quantity: 15,
    unit: "kits",
    category: "instituicao",
    place: "Instituto Esperança",
    region: "Taguatinga",
    address: "Taguatinga Centro, Brasília - DF",
    time: "21:00",
    lat: -15.8362,
    lng: -48.0544,
    icon: "🥫",
    status: "disponivel"
  },
  {
    id: 5,
    food: "10 bolos fatiados",
    quantity: 10,
    unit: "unidades",
    category: "padaria",
    place: "Doce Brasília",
    region: "Lago Sul",
    address: "SHIS QI 11, Brasília - DF",
    time: "20:30",
    lat: -15.8337,
    lng: -47.8728,
    icon: "🍰",
    status: "disponivel"
  },
  {
    id: 6,
    food: "25 kg de hortaliças",
    quantity: 25,
    unit: "kg",
    category: "mercado",
    place: "Feira Verde",
    region: "Ceilândia",
    address: "QNM 1, Ceilândia - DF",
    time: "17:30",
    lat: -15.8166,
    lng: -48.1072,
    icon: "🥬",
    status: "urgente"
  }
];

let map;
let markersLayer;
let markerById = new Map();

const $ = (selector) => document.querySelector(selector);

document.addEventListener("DOMContentLoaded", () => {
  initMap();
  initUI();
  renderAll();
});

function initMap() {
  map = L.map("map", {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView(BRASILIA, 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
}

function initUI() {
  $("#categoryFilter").addEventListener("change", renderAll);
  $("#statusFilter").addEventListener("change", renderAll);
  $("#searchInput").addEventListener("input", renderAll);

  $("#clearSearch").addEventListener("click", () => {
    $("#searchInput").value = "";
    renderAll();
    $("#searchInput").focus();
  });

  $("#resetFilters").addEventListener("click", () => {
    $("#searchInput").value = "";
    $("#categoryFilter").value = "todos";
    $("#statusFilter").value = "todos";
    renderAll();
  });

  $("#locateButton").addEventListener("click", locateUser);

  $("#openOfferButton").addEventListener("click", openModal);
  $("#openHeroOffer").addEventListener("click", openModal);
  $("#closeModal").addEventListener("click", closeModal);

  document.querySelector("[data-close-modal]").addEventListener("click", closeModal);

  $("#offerModal").addEventListener("click", (event) => {
    if (event.target.id === "offerModal") closeModal();
  });

  $("#offerForm").addEventListener("submit", handleOfferSubmit);

  $("#menuButton").addEventListener("click", () => {
    const nav = $("#mainNav");
    const isOpen = nav.classList.toggle("is-open");
    $("#menuButton").setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll("#mainNav a").forEach((link) => {
    link.addEventListener("click", () => {
      $("#mainNav").classList.remove("is-open");
      $("#menuButton").setAttribute("aria-expanded", "false");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

function renderAll() {
  const filtered = getFilteredOffers();
  renderMarkers(filtered);
  renderOfferList(filtered);
  renderCards(filtered);
  renderHeroOffers();
  updateStats();
}

function getFilteredOffers() {
  const search = $("#searchInput").value.trim().toLowerCase();
  const category = $("#categoryFilter").value;
  const status = $("#statusFilter").value;

  return offers.filter((offer) => {
    const searchable = [
      offer.food,
      offer.place,
      offer.region,
      offer.address
    ].join(" ").toLowerCase();

    const matchesSearch = !search || searchable.includes(search);
    const matchesCategory = category === "todos" || offer.category === category;
    const matchesStatus = status === "todos" || offer.status === status;

    return matchesSearch && matchesCategory && matchesStatus;
  });
}

function renderMarkers(filtered) {
  markersLayer.clearLayers();
  markerById.clear();

  filtered.forEach((offer) => {
    const marker = L.marker([offer.lat, offer.lng])
      .bindPopup(createPopup(offer));

    marker.addTo(markersLayer);
    markerById.set(offer.id, marker);
  });

  $("#resultCount").textContent = `${filtered.length} ${filtered.length === 1 ? "oferta" : "ofertas"}`;
}

function createPopup(offer) {
  const statusText = offer.status === "urgente" ? "Retirada urgente" : "Disponível";
  return `
    <div class="popup">
      <strong>${offer.icon} ${escapeHTML(offer.food)}</strong>
      <p>${escapeHTML(offer.place)} • ${escapeHTML(offer.region)}</p>
      <small>${offer.quantity} ${escapeHTML(offer.unit)} · retirada até ${escapeHTML(offer.time)}</small>
      <br><br>
      <button onclick="showInterest(${offer.id})">Tenho interesse</button>
      <span class="status ${offer.status === "urgente" ? "status--urgent" : "status--ok"}">${statusText}</span>
    </div>
  `;
}

function renderOfferList(filtered) {
  const list = $("#offerList");

  if (!filtered.length) {
    list.innerHTML = `<div class="empty">Nenhuma oferta encontrada.<br>Tente outro filtro ou região.</div>`;
    return;
  }

  list.innerHTML = filtered.map((offer) => `
    <article class="offer-item" data-id="${offer.id}">
      <div class="offer-item__top">
        <strong>${offer.icon} ${escapeHTML(offer.food)}</strong>
        <span class="status ${offer.status === "urgente" ? "status--urgent" : "status--ok"}">
          ${offer.status === "urgente" ? "Urgente" : "Disponível"}
        </span>
      </div>
      <small>${escapeHTML(offer.place)} · ${escapeHTML(offer.region)}</small>
      <div class="offer-item__meta">${offer.quantity} ${escapeHTML(offer.unit)} · até ${escapeHTML(offer.time)}</div>
    </article>
  `).join("");

  list.querySelectorAll(".offer-item").forEach((item) => {
    item.addEventListener("click", () => {
      const id = Number(item.dataset.id);
      focusOffer(id);
    });
  });
}

function renderCards(filtered) {
  const cards = $("#offerCards");

  if (!filtered.length) {
    cards.innerHTML = `<div class="empty">Nenhuma oferta para exibir.</div>`;
    return;
  }

  cards.innerHTML = filtered.slice(0, 6).map((offer) => `
    <article class="offer-card">
      <div class="offer-card__icon">${offer.icon}</div>
      <h3>${escapeHTML(offer.food)}</h3>
      <p>${escapeHTML(offer.place)} · ${escapeHTML(offer.region)}</p>
      <div class="offer-card__footer">
        <strong>${offer.quantity} ${escapeHTML(offer.unit)}</strong>
        <button class="button button--small" onclick="showInterest(${offer.id})">Tenho interesse</button>
      </div>
    </article>
  `).join("");
}

function renderHeroOffers() {
  $("#heroOffers").innerHTML = offers.slice(0, 3).map((offer) => `
    <div class="mini-offer">
      <div class="mini-offer__icon">${offer.icon}</div>
      <div>
        <strong>${escapeHTML(offer.food)}</strong>
        <small>${escapeHTML(offer.place)} · ${escapeHTML(offer.region)}</small>
      </div>
    </div>
  `).join("");
}

function updateStats() {
  $("#statOffers").textContent = offers.length;
  $("#statPlaces").textContent = new Set(offers.map((offer) => offer.place)).size;
  $("#statItems").textContent = offers.reduce((sum, offer) => sum + Number(offer.quantity), 0);
}

function focusOffer(id) {
  const offer = offers.find((item) => item.id === id);
  const marker = markerById.get(id);

  if (!offer || !marker) return;

  map.setView([offer.lat, offer.lng], 15, { animate: true });
  marker.openPopup();
}

function showInterest(id) {
  const offer = offers.find((item) => item.id === id);
  if (!offer) return;

  showToast(`Interesse registrado em "${offer.food}". Combine a retirada com o estabelecimento.`);
}

window.showInterest = showInterest;

function openModal() {
  $("#offerModal").classList.add("is-open");
  $("#offerModal").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setTimeout(() => $("#offerForm input")?.focus(), 50);
}

function closeModal() {
  $("#offerModal").classList.remove("is-open");
  $("#offerModal").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function handleOfferSubmit(event) {
  event.preventDefault();

  const form = new FormData(event.target);
  const address = form.get("address");
  const submitButton = event.target.querySelector("button[type='submit']");

  submitButton.disabled = true;
  submitButton.textContent = "Localizando...";

  try {
    const coords = await geocodeAddress(address);

    const quantity = Number(form.get("quantity"));
    const category = form.get("category");

    const newOffer = {
      id: Date.now(),
      food: form.get("food"),
      quantity,
      unit: category === "padaria" ? "unidades" : "itens",
      category,
      place: form.get("place"),
      region: form.get("region"),
      address,
      time: form.get("time"),
      lat: coords?.lat ?? BRASILIA[0],
      lng: coords?.lng ?? BRASILIA[1],
      icon: getCategoryIcon(category),
      status: isUrgent(form.get("time")) ? "urgente" : "disponivel"
    };

    offers.unshift(newOffer);
    renderAll();
    closeModal();
    event.target.reset();

    if (coords) {
      map.setView([newOffer.lat, newOffer.lng], 15, { animate: true });
    }

    showToast("Oferta cadastrada com sucesso!");
  } catch (error) {
    console.error(error);
    showToast("Oferta cadastrada. Não foi possível localizar o endereço, então o mapa usará Brasília como referência.");
    event.target.reset();
    closeModal();
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Cadastrar oferta";
  }
}

async function geocodeAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(address + ", Brasília, DF")}`;

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json"
    }
  });

  if (!response.ok) throw new Error("Falha no geocoding.");

  const data = await response.json();

  if (!data.length) return null;

  return {
    lat: Number(data[0].lat),
    lng: Number(data[0].lon)
  };
}

function locateUser() {
  if (!navigator.geolocation) {
    showToast("Seu navegador não oferece geolocalização.");
    return;
  }

  showToast("Solicitando sua localização...");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      L.circleMarker([latitude, longitude], {
        radius: 8,
        color: "#15803d",
        fillColor: "#16a34a",
        fillOpacity: .9,
        weight: 3
      }).addTo(map).bindPopup("Você está aqui.").openPopup();

      map.setView([latitude, longitude], 14);
      showToast("Localização encontrada.");
    },
    () => showToast("Não foi possível acessar sua localização. Verifique a permissão do navegador."),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function isUrgent(time) {
  if (!time) return false;

  const [hours, minutes] = time.split(":").map(Number);
  const now = new Date();
  const deadline = new Date();

  deadline.setHours(hours, minutes, 0, 0);

  return deadline.getTime() - now.getTime() < 2 * 60 * 60 * 1000;
}

function getCategoryIcon(category) {
  const icons = {
    padaria: "🍞",
    restaurante: "🍱",
    mercado: "🍎",
    instituicao: "🥫"
  };

  return icons[category] || "🍴";
}

function showToast(message) {
  const toast = $("#toast");

  toast.textContent = message;
  toast.classList.add("is-visible");

  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 4500);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
