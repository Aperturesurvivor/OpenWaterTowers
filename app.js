const map = L.map("map", {
  zoomControl: true,
  scrollWheelZoom: true
}).setView([47.73, -116.84086], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const towerIcon = L.divIcon({
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
  html: `
    <span class="tower-marker" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path d="M5 20h14" />
        <path d="M7 20V9a5 5 0 0 1 10 0v11" />
        <path d="M7 9h10" />
      </svg>
    </span>
  `
});

const numberFormatter = new Intl.NumberFormat("en-US");
const recordRoot = document.querySelector("#record");
const template = document.querySelector("#recordTemplate");
let featureLayer;
let serviceAreaLayer;
let towerData;
let allFeatures = [];

function fact(label, value) {
  const wrapper = document.createElement("div");
  wrapper.className = "fact";

  const term = document.createElement("dt");
  term.textContent = label;

  const description = document.createElement("dd");
  description.textContent = value || "Unknown";

  wrapper.append(term, description);
  return wrapper;
}

function sourceLink(source) {
  const el = document.createElement(source.url ? "a" : "span");
  el.className = "source-chip";
  if (source.url) {
    el.href = source.url;
    el.target = "_blank";
    el.rel = "noreferrer";
  }

  el.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 3h7v7" />
      <path d="M10 14 21 3" />
      <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
    </svg>
  `;
  el.append(document.createTextNode(source.label));
  return el;
}

function renderRecord(feature) {
  const properties = feature.properties;
  const node = template.content.cloneNode(true);

  const photo = node.querySelector(".record-photo");
  if (properties.photo) {
    photo.src = properties.photo;
    photo.alt = `${properties.name}, photographed from a public roadside view`;
  } else {
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder-photo";
    placeholder.textContent = "Photo needed";
    photo.replaceWith(placeholder);
  }

  node.querySelector("h2").textContent = properties.name;
  node.querySelector(".record-area").textContent = `${properties.area} · ${properties.nearbyIntersection}`;
  const confidence = node.querySelector(".confidence-pill");
  confidence.textContent = properties.confidence;
  if (properties.confidence === "candidate") {
    confidence.classList.add("candidate");
  }

  const [lng, lat] = feature.geometry.coordinates;
  const facts = node.querySelector(".facts");
  facts.append(
    fact("Coordinates", `${lat.toFixed(5)}, ${lng.toFixed(5)}`),
    fact("Capacity", properties.capacityDisplay),
    fact("Height", properties.heightFeet ? `${properties.heightFeet} ft` : "unknown"),
    fact("Type", properties.structureType),
    fact("Owner", properties.ownerOperator),
    fact("Service Role", properties.serviceRole),
    fact("Built", properties.constructedDisplay),
    fact("Pressure Zone", properties.pressureZone || "unknown"),
    fact("Overflow", properties.overflowElevationFeetMsl ? `${numberFormatter.format(properties.overflowElevationFeetMsl)} ft MSL` : "unknown")
  );

  const notes = node.querySelector(".notes");
  for (const note of properties.publicNotes) {
    const item = document.createElement("li");
    item.textContent = note;
    notes.append(item);
  }

  if (properties.constructedNote) {
    const constructionNote = document.createElement("li");
    constructionNote.textContent = properties.constructedNote;
    notes.append(constructionNote);
  }

  const sources = node.querySelector(".sources");
  for (const source of properties.sources) {
    sources.append(sourceLink(source));
  }

  recordRoot.replaceChildren(node);
}

function popupHtml(feature) {
  const properties = feature.properties;
  return `
    <div class="popup-title">${properties.name}</div>
    <div class="popup-meta">${properties.capacityDisplay} · ${properties.structureType}</div>
  `;
}

async function loadGeoJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Unable to load ${path}: ${response.status}`);
  }
  return response.json();
}

async function loadTowers() {
  const [verifiedData, candidateData, serviceAreaData] = await Promise.all([
    loadGeoJson("data/towers.geojson"),
    loadGeoJson("data/candidates.geojson"),
    loadGeoJson("data/service-areas.geojson")
  ]);

  if (serviceAreaData.features.length > 0) {
    serviceAreaLayer = L.geoJSON(serviceAreaData, {
      style: {
        color: "#376f95",
        weight: 2,
        opacity: 0.85,
        fillColor: "#68a8c5",
        fillOpacity: 0.16
      },
      onEachFeature(feature, layer) {
        const properties = feature.properties;
        layer.bindPopup(`
          <div class="popup-title">${properties.name}</div>
          <div class="popup-meta">${properties.areaType} · ${properties.geometryConfidence}</div>
        `);
      }
    }).addTo(map);
  }

  allFeatures = [...verifiedData.features, ...candidateData.features];
  towerData = {
    type: "FeatureCollection",
    features: allFeatures
  };

  featureLayer = L.geoJSON(towerData, {
    pointToLayer(feature, latlng) {
      const isCandidate = feature.properties.confidence === "candidate";
      const icon = L.divIcon({
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -26],
        html: `
          <span class="tower-marker${isCandidate ? " candidate" : ""}" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 20h14" />
              <path d="M7 20V9a5 5 0 0 1 10 0v11" />
              <path d="M7 9h10" />
            </svg>
          </span>
        `
      });
      return L.marker(latlng, { icon, title: feature.properties.name });
    },
    onEachFeature(feature, layer) {
      layer.bindPopup(popupHtml(feature));
      layer.on("click", () => renderRecord(feature));
    }
  }).addTo(map);

  const firstFeature = verifiedData.features[0];
  renderRecord(firstFeature);
  fitTowers();
}

function fitTowers() {
  if (!featureLayer || !towerData) return;

  if (towerData.features.length === 1) {
    const [lng, lat] = towerData.features[0].geometry.coordinates;
    map.setView([lat, lng], 12);
    return;
  }

  let bounds = featureLayer.getBounds();
  if (serviceAreaLayer) {
    bounds = bounds.extend(serviceAreaLayer.getBounds());
  }
  map.fitBounds(bounds.pad(0.25), { maxZoom: 13 });
}

document.querySelector("#fitButton").addEventListener("click", () => {
  fitTowers();
});

loadTowers().catch((error) => {
  recordRoot.textContent = error.message;
  console.error(error);
});
