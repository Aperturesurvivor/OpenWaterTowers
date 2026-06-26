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
const workspace = document.querySelector(".workspace");
const recordRoot = document.querySelector("#record");
const template = document.querySelector("#recordTemplate");
const panelResizer = document.querySelector("#panelResizer");
const pdfButton = document.querySelector("#pdfButton");
let featureLayer;
let serviceAreaLayer;
let towerData;
let allFeatures = [];
let serviceAreasById = new Map();
let selectedFeature;

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

function serviceAreaNames(ids = []) {
  const names = ids
    .map((id) => serviceAreasById.get(id)?.properties?.name || id)
    .filter(Boolean);
  return names.length ? names.join(", ") : "unknown";
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "record";
}

function renderRecord(feature) {
  selectedFeature = feature;
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
    fact("Service Area", serviceAreaNames(properties.serviceAreaIds)),
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

function addWrappedText(doc, text, x, y, width, lineHeight = 5) {
  const lines = doc.splitTextToSize(text || "Unknown", width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSectionTitle(doc, title, x, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(52, 68, 63);
  doc.text(title.toUpperCase(), x, y);
  return y + 6;
}

function addPdfPageIfNeeded(doc, y, needed = 24) {
  if (y + needed <= 280) return y;
  doc.addPage();
  return 18;
}

async function loadImageDataUrl(path) {
  if (!path) return "";
  const response = await fetch(path);
  if (!response.ok) return "";
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(blob);
  });
}

async function downloadSelectedPdf() {
  if (!selectedFeature || !window.jspdf?.jsPDF) return;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const properties = selectedFeature.properties;
  const [lng, lat] = selectedFeature.geometry.coordinates;
  const left = 18;
  const contentWidth = 180;
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(23, 32, 30);
  y = addWrappedText(doc, properties.name, left, y, contentWidth, 8) + 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(99, 112, 108);
  y = addWrappedText(doc, `${properties.area} · ${properties.nearbyIntersection}`, left, y, contentWidth) + 5;

  const imageData = await loadImageDataUrl(properties.photo);
  if (imageData) {
    doc.addImage(imageData, "JPEG", left, y, 88, 66);
    y += 73;
  }

  const facts = [
    ["Coordinates", `${lat.toFixed(5)}, ${lng.toFixed(5)}`],
    ["Capacity", properties.capacityDisplay],
    ["Height", properties.heightFeet ? `${properties.heightFeet} ft` : "unknown"],
    ["Type", properties.structureType],
    ["Owner", properties.ownerOperator],
    ["Service Area", serviceAreaNames(properties.serviceAreaIds)],
    ["Service Role", properties.serviceRole],
    ["Built", properties.constructedDisplay],
    ["Pressure Zone", properties.pressureZone || "unknown"],
    ["Overflow", properties.overflowElevationFeetMsl ? `${numberFormatter.format(properties.overflowElevationFeetMsl)} ft MSL` : "unknown"]
  ];

  y = addPdfPageIfNeeded(doc, y, 42);
  y = addSectionTitle(doc, "Facts", left, y);
  doc.setFontSize(9);
  for (const [label, value] of facts) {
    y = addPdfPageIfNeeded(doc, y, 12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(23, 32, 30);
    doc.text(`${label}:`, left, y);
    doc.setFont("helvetica", "normal");
    y = addWrappedText(doc, value || "Unknown", left + 38, y, contentWidth - 38) + 2;
  }

  const notes = [...(properties.publicNotes || [])];
  if (properties.constructedNote) notes.push(properties.constructedNote);
  if (notes.length) {
    y = addPdfPageIfNeeded(doc, y + 4, 28);
    y = addSectionTitle(doc, "Observation Notes", left, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(63, 79, 74);
    for (const note of notes) {
      y = addPdfPageIfNeeded(doc, y, 16);
      y = addWrappedText(doc, `- ${note}`, left, y, contentWidth) + 2;
    }
  }

  if (properties.sources?.length) {
    y = addPdfPageIfNeeded(doc, y + 4, 28);
    y = addSectionTitle(doc, "Sources", left, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(63, 79, 74);
    for (const source of properties.sources) {
      y = addPdfPageIfNeeded(doc, y, 16);
      const sourceText = source.url ? `${source.label}: ${source.url}` : source.label;
      y = addWrappedText(doc, `- ${sourceText}`, left, y, contentWidth) + 2;
    }
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(99, 112, 108);
  doc.text("Generated by OpenWaterTowers", left, 270);
  doc.save(`${slugify(properties.name)}-openwatertowers.pdf`);
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

  serviceAreasById = new Map(
    serviceAreaData.features.map((feature) => [feature.id, feature])
  );

  const drawableServiceAreas = serviceAreaData.features.filter((feature) => feature.geometry);
  if (drawableServiceAreas.length > 0) {
    serviceAreaLayer = L.geoJSON({
      type: "FeatureCollection",
      features: drawableServiceAreas
    }, {
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

pdfButton.addEventListener("click", () => {
  downloadSelectedPdf().catch((error) => {
    recordRoot.textContent = `Unable to create PDF: ${error.message}`;
    console.error(error);
  });
});

function setInspectorWidth(width) {
  const maxWidth = Math.round(window.innerWidth * 0.7);
  const nextWidth = Math.min(Math.max(width, 320), maxWidth);
  workspace.style.setProperty("--inspector-width", `${nextWidth}px`);
  localStorage.setItem("openWaterTowersInspectorWidth", String(nextWidth));
  window.requestAnimationFrame(() => map.invalidateSize());
}

function initPanelResizer() {
  const savedWidth = Number(localStorage.getItem("openWaterTowersInspectorWidth"));
  if (savedWidth) setInspectorWidth(savedWidth);

  panelResizer.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    panelResizer.setPointerCapture(event.pointerId);
    document.body.classList.add("is-resizing-panel");
  });

  panelResizer.addEventListener("pointermove", (event) => {
    if (!panelResizer.hasPointerCapture(event.pointerId)) return;
    setInspectorWidth(window.innerWidth - event.clientX);
  });

  function stopResize(event) {
    if (panelResizer.hasPointerCapture(event.pointerId)) {
      panelResizer.releasePointerCapture(event.pointerId);
    }
    document.body.classList.remove("is-resizing-panel");
  }

  panelResizer.addEventListener("pointerup", stopResize);
  panelResizer.addEventListener("pointercancel", stopResize);

  panelResizer.addEventListener("keydown", (event) => {
    const currentWidth = Number(getComputedStyle(workspace).getPropertyValue("--inspector-width").replace("px", "")) || 430;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setInspectorWidth(currentWidth + 24);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setInspectorWidth(currentWidth - 24);
    }
  });
}

initPanelResizer();

loadTowers().catch((error) => {
  recordRoot.textContent = error.message;
  console.error(error);
});
