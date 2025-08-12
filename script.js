// API URL’leri
const USGS_TURKEY_ENDPOINT =
  "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson" +
  "&minlatitude=35.8&maxlatitude=42.1&minlongitude=25.0&maxlongitude=45.0" +
  "&minmagnitude=2.5&orderby=time&limit=50";

const NASA_EONET_ENDPOINT = "https://eonet.gsfc.nasa.gov/api/v3/events?status=open";

// Harita oluşturma
const map = L.map("map").setView([39, 35], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);

const quakeLayer = L.layerGroup().addTo(map);
const eventLayer = L.layerGroup().addTo(map);

// İkonlar
const quakeIcon = L.icon({
  iconUrl: "assets/earthquake.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const fireIcon = L.icon({
  iconUrl: "assets/fire.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

// Deprem verisini çek ve göster
async function loadQuakes() {
  quakeLayer.clearLayers();
  const quakeList = document.getElementById("quake-list");
  quakeList.textContent = "Depremler yükleniyor...";

  try {
    const res = await fetch(USGS_TURKEY_ENDPOINT);
    const data = await res.json();

    quakeList.innerHTML = "";

    data.features.forEach((feature) => {
      const coords = feature.geometry.coordinates;
      const props = feature.properties;

      const lat = coords[1];
      const lng = coords[0];
      const depth = coords[2];
      const mag = props.mag;
      const place = props.place;
      const time = new Date(props.time).toLocaleString();

      // Haritaya marker ekle
      const marker = L.marker([lat, lng], { icon: quakeIcon })
        .bindPopup(`<b>${place}</b><br>Büyüklük: ${mag} Mw<br>Derinlik: ${depth} km<br>${time}`)
        .addTo(quakeLayer);

      // Listeye ekle
      const item = document.createElement("div");
      item.className = "quake-item";
      item.innerHTML = `<b>${place}</b> <small>(${mag} Mw)</small><br><small>${time}</small>`;
      item.onclick = () => {
        map.setView([lat, lng], 7);
        marker.openPopup();
      };
      quakeList.appendChild(item);
    });
  } catch (error) {
    quakeList.textContent = "Deprem verisi yüklenemedi.";
    console.error(error);
  }
}

// Afet verisini çek ve göster
async function loadEvents() {
  eventLayer.clearLayers();
  const eventList = document.getElementById("event-list");
  eventList.textContent = "Afetler yükleniyor...";

  try {
    const res = await fetch(NASA_EONET_ENDPOINT);
    const data = await res.json();

    eventList.innerHTML = "";

    data.events.forEach((event) => {
      event.geometry.forEach((geo) => {
        const coords = geo.coordinates;
        const title = event.title;
        const category = event.categories[0].title;
        const date = new Date(geo.date).toLocaleString();

        let icon = fireIcon;
        if (category.toLowerCase().includes("fire")) icon = fireIcon;
        // İstersen kategoriye göre başka ikonlar da ekleyebilirsin

        L.marker([coords[1], coords[0]], { icon })
          .bindPopup(`<b>${title}</b><br>Kategori: ${category}<br>Tarih: ${date}`)
          .addTo(eventLayer);

        // Listeye ekle
        const item = document.createElement("div");
        item.className = "event-item";
        item.innerHTML = `<b>${title}</b><br><small>${category} - ${date}</small>`;
        item.onclick = () => {
          map.setView([coords[1], coords[0]], 7);
        };
        eventList.appendChild(item);
      });
    });
  } catch (error) {
    eventList.textContent = "Afet verisi yüklenemedi.";
    console.error(error);
  }
}

// Sayfa yüklendiğinde verileri çek
window.onload = () => {
  loadQuakes();
  loadEvents();

  // 10 dakikada bir yenile
  setInterval(() => {
    loadQuakes();
    loadEvents();
  }, 10 * 60 * 1000);
};
