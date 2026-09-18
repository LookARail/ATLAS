"use strict";

// Sourced from the manually maintained cn_locations_mileage.csv.
// Locations with blank mileage are intentionally absent and are not plotted.
const STATION_POSITIONS = {
  MONMONINT: 74,
  PONVICTOR: 72.31,
  STLAMBERT: 71.2,
  STBRUNO: 63.8,
  DAVIS: 60.87,
  THERIAULT: 51.5,
  STROSJCT: 38.7,
  STHYACINT: 40.9,
  PTSTCHARL: 1.81,
  PICKERING: 311.9,
  AJAX: 310.4,
  WHITBY: 304.9,
  BOWMANVIL: 290.8,
  CLARKE: 287,
  PTHOPE: 270.7,
  COBOURG: 264,
  GRAFTON: 256.1,
  BRIGHTON: 241.6,
  TRENTON: 231.7,
  BELLEVILL: 220.7,
  MARYSVILL: 209.1,
  NAPANEE: 198.9,
  BATSPUR: 190.34,
  ERNESTOWN: 187.7,
  COLBAY: 180.4,
  QUEENS: 174.9,
  KINGS: 162,
  LEEDS: 151.3,
  MALLORYTO: 138.4,
  BROCKVILL: 125.6,
  PRESCOTT: 113.8,
  GALOP: 102.9,
  MORRISBUR: 92.2,
  CRYSLER: 83.4,
  REGIS: 65.4,
  GARRY: 52.4,
  COTEAU: 37.8,
  CEDARS: 27.5,
  DORVAL: 10.8,
  "55IAVE": 11.5,
  OSHAWA: 302.2,
  TREJCT: 232.8,
  CARDINAL: 104.9,
  CORNWALL: 68,
  KINGSTON: 175.4,
  RIVBEAUDE: 43.6,
  STHUBERT: 66.4,
  STHENRY: 4.8,
  MAITLAND: 122.7,
  PTUNION: 319.7,
  VILLEMOYN: 70.2,
  LYN: 127.4,
};

const STATION_SUBDIVISIONS = {
  MONMONINT: "St-Hyacinthe", PONVICTOR: "St-Hyacinthe", STLAMBERT: "St-Hyacinthe", STBRUNO: "St-Hyacinthe",
  DAVIS: "St-Hyacinthe", THERIAULT: "St-Hyacinthe", STROSJCT: "St-Hyacinthe", STHYACINT: "St-Hyacinthe",
  STHUBERT: "St-Hyacinthe", VILLEMOYN: "St-Hyacinthe",
  PTSTCHARL: "Kingston", PICKERING: "Kingston", AJAX: "Kingston", WHITBY: "Kingston", BOWMANVIL: "Kingston",
  CLARKE: "Kingston", PTHOPE: "Kingston", COBOURG: "Kingston", GRAFTON: "Kingston", BRIGHTON: "Kingston",
  TRENTON: "Kingston", BELLEVILL: "Kingston", MARYSVILL: "Kingston", NAPANEE: "Kingston", BATSPUR: "Kingston",
  ERNESTOWN: "Kingston", COLBAY: "Kingston", QUEENS: "Kingston", KINGS: "Kingston", LEEDS: "Kingston",
  MALLORYTO: "Kingston", BROCKVILL: "Kingston", PRESCOTT: "Kingston", GALOP: "Kingston", MORRISBUR: "Kingston",
  CRYSLER: "Kingston", REGIS: "Kingston", GARRY: "Kingston", COTEAU: "Kingston", CEDARS: "Kingston",
  DORVAL: "Kingston", "55IAVE": "Kingston", OSHAWA: "Kingston", TREJCT: "Kingston", CARDINAL: "Kingston",
  CORNWALL: "Kingston", KINGSTON: "Kingston", RIVBEAUDE: "Kingston", STHENRY: "Kingston", MAITLAND: "Kingston",
  PTUNION: "Kingston", LYN: "Kingston",
};

const TYPE_STYLES = {
  P: { color: "#154ed8", label: "P · passenger" },
  M: { color: "#169447", label: "M · manifest" },
  E: { color: "#df7515", label: "E · freight" },
  Q: { color: "#ed861a", label: "Q · intermodal" },
  Z: { color: "#e02f28", label: "Z · intermodal" },
  L: { color: "#9b73da", label: "L · local" },
  B: { color: "#7b4b24", label: "B · bulk" },
  U: { color: "#7b4b24", label: "U · bulk" },
  G: { color: "#7b4b24", label: "G · bulk" },
  X: { color: "#475467", label: "X · extra" },
  A: { color: "#3d7c77", label: "A · freight" },
  O: { color: "#667085", label: "O · other" },
  DEFAULT: { color: "#475467", label: "Other" },
};

const MATCHING_TOLERANCE_MINUTES = 5;

const els = {
  file: document.querySelector("#csvFile"),
  fileZone: document.querySelector("#fileZone"),
  fileName: document.querySelector("#fileName"),
  fileError: document.querySelector("#fileError"),
  workspace: document.querySelector("#workspace"),
  startDate: document.querySelector("#startDate"),
  endDate: document.querySelector("#endDate"),
  subdivisionFilter: document.querySelector("#subdivisionFilter"),
  timeBasis: document.querySelector("#timeBasis"),
  trainSearch: document.querySelector("#trainSearch"),
  plotButton: document.querySelector("#plotButton"),
  statusChip: document.querySelector("#statusChip"),
  chartSubtitle: document.querySelector("#chartSubtitle"),
  canvas: document.querySelector("#stringlineCanvas"),
  chartWrap: document.querySelector("#chartWrap"),
  heatmapSubtitle: document.querySelector("#heatmapSubtitle"),
  trafficHeatmapCanvas: document.querySelector("#trafficHeatmapCanvas"),
  heatmapWrap: document.querySelector("#heatmapWrap"),
  heatmapEmpty: document.querySelector("#heatmapEmpty"),
  odPair: document.querySelector("#odPair"),
  dateMode: document.querySelector("#dateMode"),
  viewTabs: [...document.querySelectorAll(".view-tab")],
  viewPanels: [...document.querySelectorAll("[data-view-panel]")],
  viewControls: [...document.querySelectorAll("[data-view-controls]")],
  histogramSubtitle: document.querySelector("#histogramSubtitle"),
  tripTimeCanvas: document.querySelector("#tripTimeCanvas"),
  histogramWrap: document.querySelector("#histogramWrap"),
  histogramEmpty: document.querySelector("#histogramEmpty"),
  latenessTableBody: document.querySelector("#latenessTableBody"),
  latenessTableSummary: document.querySelector("#latenessTableSummary"),
  travelTimeTableBody: document.querySelector("#travelTimeTableBody"),
  travelTimeSummary: document.querySelector("#travelTimeSummary"),
  emptyState: document.querySelector("#emptyState"),
  tooltip: document.querySelector("#tooltip"),
  legend: document.querySelector("#legend"),
  lineStyleLegend: document.querySelector("#lineStyleLegend"),
  tripCount: document.querySelector("#tripCount"),
  pathCount: document.querySelector("#pathCount"),
  collapsedCount: document.querySelector("#collapsedCount"),
  stationCount: document.querySelector("#stationCount"),
};

const state = {
  records: [],
  headers: [],
  headerMap: new Map(),
  serviceMin: null,
  serviceMax: null,
  renderModel: null,
  hitSegments: [],
  passengerTrips: [],
  odPairs: [],
  hoveredTripKey: null,
  subdivision: "Kingston",
  timelineStart: 0,
  timelineEnd: 1440,
  timelineDefaultStart: 0,
  timelineDefaultEnd: 1440,
  pan: { active: false, startX: 0, startTimelineStart: 0, startTimelineEnd: 1440 },
};

function setDataReady(ready) {
  // Keep the analysis shell visible while waiting for data so the user sees
  // the available views and their empty states. Only the file picker remains
  // usable until a valid CSV has been loaded.
  els.workspace.hidden = false;
  for (const tab of els.viewTabs) {
    tab.disabled = !ready;
    tab.setAttribute("aria-disabled", String(!ready));
  }
  if (!ready) {
    for (const element of [els.startDate, els.endDate, els.dateMode, els.subdivisionFilter, els.timeBasis, els.trainSearch, els.plotButton, els.odPair]) {
      element.disabled = true;
    }
    setActiveView("stringline");
    return;
  }
  setActiveView("stringline");
}

setDataReady(false);

els.file.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (file) loadCsvFile(file);
});

["dragenter", "dragover"].forEach((name) => {
  els.fileZone.addEventListener(name, (event) => {
    event.preventDefault();
    els.fileZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach((name) => {
  els.fileZone.addEventListener(name, (event) => {
    event.preventDefault();
    els.fileZone.classList.remove("is-dragging");
  });
});

els.fileZone.addEventListener("drop", (event) => {
  const file = [...event.dataTransfer.files].find((item) => item.name.toLowerCase().endsWith(".csv"));
  if (file) loadCsvFile(file);
  else setStatus("Drop a CSV file", "error");
});

els.plotButton.addEventListener("click", generatePlot);
els.dateMode.addEventListener("change", () => {
  updateDateModeControls();
  if (state.records.length) generatePlot();
});
els.subdivisionFilter.addEventListener("change", () => {
  state.subdivision = els.subdivisionFilter.value;
  if (state.records.length) generatePlot();
});
els.timeBasis.addEventListener("change", () => {
  if (state.records.length) generatePlot();
});
els.trainSearch.addEventListener("input", () => {
  if (state.renderModel) drawChart(state.renderModel);
});
els.odPair.addEventListener("change", () => {
  if (state.records.length) generatePassengerHistogram(els.startDate.value, els.endDate.value);
});
els.viewTabs.forEach((tab) => tab.addEventListener("click", () => setActiveView(tab.dataset.view)));
[els.startDate, els.endDate].forEach((input) => input.addEventListener("change", () => {
  updateDateModeControls();
  if (state.records.length) {
    generatePassengerHistogram(els.startDate.value, els.endDate.value);
    drawTrafficHeatmap(els.startDate.value, els.endDate.value);
  }
}));
els.canvas.addEventListener("mousemove", handleHover);
els.canvas.addEventListener("mousedown", startTimelinePan);
window.addEventListener("mousemove", handleTimelinePan);
window.addEventListener("mouseup", endTimelinePan);
els.canvas.addEventListener("wheel", (event) => {
  if (!state.renderModel) return;
  event.preventDefault();
  const rect = els.canvas.getBoundingClientRect();
  const fraction = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const anchor = state.timelineStart + fraction * (state.timelineEnd - state.timelineStart);
  zoomTimeline(event.deltaY < 0 ? 0.8 : 1.25, anchor);
}, { passive: false });
els.canvas.addEventListener("mouseleave", () => {
  els.tooltip.hidden = true;
  if (state.hoveredTripKey) {
    state.hoveredTripKey = null;
    if (state.renderModel) drawChart(state.renderModel);
  }
});

new ResizeObserver(() => {
  if (state.renderModel) drawChart(state.renderModel);
}).observe(els.chartWrap);

new ResizeObserver(() => {
  if (state.passengerTrips.length) generatePassengerHistogram(els.startDate.value, els.endDate.value);
}).observe(els.histogramWrap);

new ResizeObserver(() => {
  if (state.records.length) drawTrafficHeatmap(els.startDate.value, els.endDate.value);
}).observe(els.heatmapWrap);

function setActiveView(view) {
  for (const tab of els.viewTabs) {
    const active = tab.dataset.view === view;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  }
  for (const panel of els.viewPanels) panel.hidden = panel.dataset.viewPanel !== view;
  for (const controls of els.viewControls) controls.classList.toggle("hidden", controls.dataset.viewControls !== view);
  if (view === "statistics" && state.records.length) generatePassengerHistogram(els.startDate.value, els.endDate.value);
}

function updateDateModeControls() {
  const calendarMode = els.dateMode.value === "calendar" || els.startDate.value === els.endDate.value;
  const disabled = !state.records.length || calendarMode;
  els.timeBasis.disabled = disabled;
  renderLineStyleLegend(calendarMode, !calendarMode && els.timeBasis.value === "actual");
}

async function loadCsvFile(file) {
  setDataReady(false);
  state.renderModel = null;
  setStatus("Reading CSV…", "empty");
  els.fileName.textContent = file.name;
  try {
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length < 2) throw new Error("The CSV contains no data rows.");

    state.headers = parsed[0].map((value) => value.replace(/^\uFEFF/, "").trim());
    state.headerMap = new Map(state.headers.map((header, index) => [header.toUpperCase(), index]));
    validateColumns(["TRN_ID", "EVT_TMSTMP", "STN_333"]);

    state.records = parsed.slice(1).filter((row) => row.some((value) => value !== ""));
    state.passengerTrips = buildPassengerTrips();
    populateOdPairs();
    const serviceDates = state.records
      .map((row) => getServiceDate(row))
      .filter(Boolean)
      .sort();
    if (!serviceDates.length) throw new Error("No usable service dates were found.");

    state.serviceMin = serviceDates[0];
    state.serviceMax = serviceDates.at(-1);
    const defaultStart = addDays(state.serviceMax, -6);

    els.startDate.min = state.serviceMin;
    els.startDate.max = state.serviceMax;
    els.startDate.value = defaultStart < state.serviceMin ? state.serviceMin : defaultStart;
    els.endDate.min = state.serviceMin;
    els.endDate.max = state.serviceMax;
    els.endDate.value = state.serviceMax;

    [els.startDate, els.endDate, els.dateMode, els.subdivisionFilter, els.timeBasis, els.trainSearch, els.plotButton, els.odPair].forEach((element) => {
      element.disabled = false;
    });
    setDataReady(true);
    updateDateModeControls();

    setStatus(`${state.records.length.toLocaleString()} records ready`, "ready");
    generatePlot();
  } catch (error) {
    console.error(error);
    setDataReady(false);
    setStatus(error.message || "Could not read CSV", "error");
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function generatePlot() {
  try {
    const start = els.startDate.value;
    const end = els.endDate.value;
    if (!start || !end || start > end) throw new Error("Choose a valid date range.");

    const calendarMode = els.dateMode.value === "calendar" || start === end;
    if (start === end) els.dateMode.value = "calendar";
    updateDateModeControls();
    const tolerance = calendarMode ? 0 : MATCHING_TOLERANCE_MINUTES;
    const grouped = new Map();

    for (const row of state.records) {
      const serviceDate = getServiceDate(row);
      if (!serviceDate || serviceDate < start || serviceDate > end) continue;
      const tripId = value(row, "TRN_ID").trim();
      if (!tripId) continue;
      if (!grouped.has(tripId)) grouped.set(tripId, []);
      grouped.get(tripId).push(row);
    }

    const basis = calendarMode ? "actual" : els.timeBasis.value;
    const trips = [...grouped.entries()]
      .map(([tripId, rows]) => prepareTrip(tripId, rows, basis, calendarMode ? "calendar" : "normalized"))
      .filter((trip) => trip.points.length >= 2)
      .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate) || a.tripId.localeCompare(b.tripId));
    if (!trips.length) throw new Error("No plottable trips were found in this date range.");

    const ungroupedActual = !calendarMode && basis === "actual";
    const variants = calendarMode
      ? decorateCalendarTrips(trips)
      : ungroupedActual
        ? expandIndividualTrips(trips)
        : deduplicateTrips(trips, tolerance);
    const compareBoth = calendarMode;
    let actualVariants = null;
    let scheduledVariants = null;
    if (calendarMode) {
      const actualTrips = [...grouped.entries()]
        .map(([tripId, rows]) => prepareTrip(tripId, rows, "actual", "calendar"))
        .filter((trip) => trip.points.length >= 2);
      const scheduledTrips = [...grouped.entries()]
        .map(([tripId, rows]) => prepareTrip(tripId, rows, "scheduled", "calendar"))
        .filter((trip) => trip.points.length >= 2);
      actualVariants = decorateCalendarTrips(actualTrips);
      scheduledVariants = decorateCalendarTrips(scheduledTrips);
    }
    const stationModel = buildStationModel(compareBoth ? [...actualVariants, ...scheduledVariants] : variants);
    if (!stationModel.length) throw new Error("No stations with explicit mileage were found for the selected data.");
    const model = { variants, actualVariants, scheduledVariants, compareBoth, calendarMode, ungroupedActual, stationModel, start, end, basis, tripInstances: trips.length };
    state.renderModel = model;
    state.hoveredTripKey = null;
    setTimelineWindow(model);

    els.tripCount.textContent = trips.length.toLocaleString();
    els.pathCount.textContent = variants.length.toLocaleString();
    els.collapsedCount.textContent = (trips.length - variants.length).toLocaleString();
    els.stationCount.textContent = stationModel.length.toLocaleString();
    const sourceLabel = calendarMode ? "calendar chronology · actual solid + reconstructed schedule dashed" : basis === "scheduled" ? "normalized reconstructed schedule" : "normalized actual event times";
    const matchingLabel = calendarMode || ungroupedActual ? "no trip matching" : `${tolerance}-minute matching`;
    els.chartSubtitle.textContent = `${formatDisplayDate(start)}–${formatDisplayDate(end)} · ${sourceLabel} · ${state.subdivision} subdivision · ${matchingLabel}`;
    els.emptyState.hidden = true;
    renderLegend(compareBoth ? [...actualVariants, ...scheduledVariants] : variants);
    drawChart(model);
    drawTrafficHeatmap(start, end);
    generatePassengerHistogram(start, end);
    setStatus(`${variants.length.toLocaleString()} ${calendarMode || ungroupedActual ? "trips" : "paths"} plotted`, "ready");
  } catch (error) {
    console.error(error);
    setDataReady(false);
    setStatus(error.message || "Could not generate chart", "error");
  }
}

function buildPassengerTrips() {
  const grouped = new Map();
  for (const row of state.records) {
    if (value(row, "TRN_TYPE").trim().toUpperCase() !== "P") continue;
    const tripId = value(row, "TRN_ID").trim();
    if (!tripId) continue;
    if (!grouped.has(tripId)) grouped.set(tripId, []);
    grouped.get(tripId).push(row);
  }

  const trips = [];
  for (const [tripId, rows] of grouped) {
    const events = rows
      .map((row) => ({ row, actualMs: parseTimestamp(value(row, "EVT_TMSTMP")), station: normalizeStation(value(row, "STN_333")) }))
      .filter((event) => Number.isFinite(event.actualMs) && event.station)
      .sort((a, b) => a.actualMs - b.actualMs);
    if (events.length < 2) continue;

    const origin = events[0].station;
    const destination = events.at(-1).station;
    if (origin === destination) continue;
    const departure = events.find((event) => event.station === origin && value(event.row, "EVT_CD").trim().toUpperCase() === "TD") || events.find((event) => event.station === origin);
    const arrival = [...events].reverse().find((event) => event.station === destination && value(event.row, "EVT_CD").trim().toUpperCase() === "TA") || [...events].reverse().find((event) => event.station === destination);
    if (!departure || !arrival || arrival.actualMs <= departure.actualMs) continue;

    const departureDeviation = signedDeviationMinutes(departure.row);
    const arrivalDeviation = signedDeviationMinutes(arrival.row);
    if (!Number.isFinite(departureDeviation) || !Number.isFinite(arrivalDeviation)) continue;
    const scheduledDepartureMs = departure.actualMs - departureDeviation * 60000;
    const scheduledArrivalMs = arrival.actualMs - arrivalDeviation * 60000;
    trips.push({
      tripId,
      serviceName: getTrainName(rows[0], tripId),
      serviceDate: getServiceDate(rows[0]),
      origin,
      destination,
      routeKey: `${origin}|${destination}`,
      scheduledMinutes: (scheduledArrivalMs - scheduledDepartureMs) / 60000,
      actualMinutes: (arrival.actualMs - departure.actualMs) / 60000,
      finalLatenessMinutes: arrivalDeviation,
    });
  }
  return trips;
}

function drawTrafficHeatmap(start, end) {
  const segments = buildTrafficSegments(start, end);
  if (!segments.length) {
    els.heatmapEmpty.hidden = false;
    els.heatmapSubtitle.textContent = "No valid train movements match the selected date range.";
    clearTrafficHeatmap();
    return;
  }

  const canvas = els.trafficHeatmapCanvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const xBins = 288;
  const yBins = 24;
  const passengerDensity = new Float32Array(xBins * yBins);
  const freightDensity = new Float32Array(xBins * yBins);
  const positions = Object.entries(STATION_POSITIONS)
    .filter(([station]) => isStationVisible(station))
    .map(([, position]) => position);
  const minPosition = Math.min(...positions);
  const maxPosition = Math.max(...positions);
  let totalSamples = 0;

  for (const segment of segments) {
    const steps = Math.max(1, Math.ceil((segment.endMs - segment.startMs) / (5 * 60000)));
    for (let step = 0; step <= steps; step += 1) {
      const fraction = step / steps;
      const timeMs = segment.startMs + (segment.endMs - segment.startMs) * fraction;
      const timeMinute = ((timeMs / 60000) % 1440 + 1440) % 1440;
      const x = Math.min(xBins - 1, Math.floor(timeMinute / 5));
      const position = segment.startPosition + (segment.endPosition - segment.startPosition) * fraction;
      const y = Math.max(0, Math.min(yBins - 1, Math.floor((position - minPosition) / Math.max(1, maxPosition - minPosition) * yBins)));
      const cellIndex = y * xBins + x;
      if (segment.category === "passenger") passengerDensity[cellIndex] += 1;
      else freightDensity[cellIndex] += 1;
      totalSamples += 1;
    }
  }

  const maxDensity = Math.max(1, ...passengerDensity.map((value, index) => value + freightDensity[index]));
  const margin = { top: 16, right: 18, bottom: 48, left: 102 };
  const plot = { x: margin.left, y: margin.top, width: rect.width - margin.left - margin.right, height: rect.height - margin.top - margin.bottom };
  const cellWidth = plot.width / xBins;
  const cellHeight = plot.height / yBins;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(plot.x, plot.y, plot.width, plot.height);

  for (let y = 0; y < yBins; y += 1) {
    for (let x = 0; x < xBins; x += 1) {
      const cellIndex = y * xBins + x;
      const passenger = passengerDensity[cellIndex];
      const freight = freightDensity[cellIndex];
      const total = passenger + freight;
      if (!total) continue;
      const passengerShare = passenger / total;
      const intensity = 0.12 + 0.88 * Math.pow(total / maxDensity, 0.55);
      const passengerColor = [62, 127, 231];
      const freightColor = [230, 126, 34];
      const mixedColor = passengerColor.map((value, channel) => Math.round(value * passengerShare + freightColor[channel] * (1 - passengerShare)));
      const displayColor = mixedColor.map((value) => Math.round(255 + (value - 255) * intensity));
      ctx.fillStyle = `rgb(${displayColor.join(",")})`;
      ctx.fillRect(plot.x + x * cellWidth, plot.y + y * cellHeight, Math.ceil(cellWidth) + 0.25, Math.ceil(cellHeight) + 0.25);
    }
  }

  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= xBins; x += 1) {
    const xPosition = plot.x + x * cellWidth;
    ctx.beginPath();
    ctx.moveTo(xPosition, plot.y);
    ctx.lineTo(xPosition, plot.y + plot.height);
    ctx.stroke();
  }

  ctx.font = "10px Inter, system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  for (let hour = 0; hour <= 24; hour += 2) {
    const x = plot.x + (hour / 24) * plot.width;
    ctx.strokeStyle = "rgba(79, 101, 128, 0.28)";
    ctx.beginPath();
    ctx.moveTo(x, plot.y);
    ctx.lineTo(x, plot.y + plot.height);
    ctx.stroke();
    if (hour < 24) {
      ctx.fillStyle = "#53657d";
      ctx.textBaseline = "top";
      ctx.fillText(`${String(hour).padStart(2, "0")}:00`, x, plot.y + plot.height + 8);
    }
  }

  const stations = Object.entries(STATION_POSITIONS)
    .filter(([station]) => isStationVisible(station))
    .sort((a, b) => a[1] - b[1]);
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (const [station, position] of stations) {
    const y = plot.y + ((position - minPosition) / Math.max(1, maxPosition - minPosition)) * plot.height;
    ctx.strokeStyle = "rgba(79, 101, 128, 0.38)";
    ctx.beginPath();
    ctx.moveTo(plot.x, y);
    ctx.lineTo(plot.x + plot.width, y);
    ctx.stroke();
    ctx.fillStyle = "#344054";
    ctx.fillText(shortStation(station, rect.width < 700), plot.x - 9, y);
  }

  ctx.strokeStyle = "#738198";
  ctx.strokeRect(plot.x, plot.y, plot.width, plot.height);
  ctx.fillStyle = "#667085";
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("TIME OF DAY", plot.x + plot.width / 2, rect.height - 20);
  ctx.save();
  ctx.translate(16, plot.y + plot.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("CORRIDOR POSITION", 0, 0);
  ctx.restore();
  const passengerSegments = segments.filter((segment) => segment.category === "passenger").length;
  els.heatmapSubtitle.textContent = `${segments.length.toLocaleString()} train segments (${passengerSegments.toLocaleString()} passenger, ${(segments.length - passengerSegments).toLocaleString()} freight) · 5-minute cells · ${yBins} interpolated distance bands`;
  els.heatmapEmpty.hidden = true;
}

function buildTrafficSegments(start, end) {
  const grouped = new Map();
  for (const row of state.records) {
    const serviceDate = getServiceDate(row);
    if (!serviceDate || serviceDate < start || serviceDate > end) continue;
    const tripId = value(row, "TRN_ID").trim();
    if (!tripId) continue;
    if (!grouped.has(tripId)) grouped.set(tripId, []);
    grouped.get(tripId).push(row);
  }

  const segments = [];
  for (const rows of grouped.values()) {
    const category = rows.some((row) => getTrainType(row) === "P") ? "passenger" : "freight";
    const events = rows
      .map((row) => {
        const station = normalizeStation(value(row, "STN_333"));
        return { actualMs: parseTimestamp(value(row, "EVT_TMSTMP")), station, position: STATION_POSITIONS[station] };
      })
      .filter((event) => Number.isFinite(event.actualMs) && isStationVisible(event.station))
      .sort((a, b) => a.actualMs - b.actualMs);
    for (let index = 1; index < events.length; index += 1) {
      const previous = events[index - 1];
      const current = events[index];
      if (current.actualMs <= previous.actualMs) continue;
      segments.push({ startMs: previous.actualMs, endMs: current.actualMs, startPosition: previous.position, endPosition: current.position, category });
    }
  }
  return segments;
}

function clearTrafficHeatmap() {
  const canvas = els.trafficHeatmapCanvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;
  canvas.width = Math.round(rect.width * Math.min(window.devicePixelRatio || 1, 2));
  canvas.height = Math.round(rect.height * Math.min(window.devicePixelRatio || 1, 2));
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function signedDeviationMinutes(row) {
  const hours = Number(value(row, "LATE_HOURS"));
  return Number.isFinite(hours) ? hours * 60 : Number.NaN;
}

function populateOdPairs() {
  const counts = new Map();
  for (const trip of state.passengerTrips) counts.set(trip.routeKey, (counts.get(trip.routeKey) || 0) + 1);
  state.odPairs = [...counts.entries()]
    .map(([valueRaw, count]) => {
      const [origin, destination] = valueRaw.split("|");
      return { value: valueRaw, origin, destination, count };
    })
    .sort((a, b) => b.count - a.count || a.origin.localeCompare(b.origin) || a.destination.localeCompare(b.destination));

  els.odPair.replaceChildren(...state.odPairs.map((pair) => {
    const option = document.createElement("option");
    option.value = pair.value;
    option.textContent = `${pair.origin} → ${pair.destination} (${pair.count.toLocaleString()})`;
    return option;
  }));

  const preferred = state.odPairs.filter((pair) =>
    (pair.origin === "DORVAL" && pair.destination === "LIVERPOOL") ||
    (pair.origin === "LIVERPOOL" && pair.destination === "DORVAL"),
  );
  const selected = preferred.length ? preferred : state.odPairs;
  for (const option of els.odPair.options) option.selected = selected.some((pair) => pair.value === option.value);
}

function selectedOdPairs() {
  const selected = [...els.odPair.selectedOptions].map((option) => option.value);
  return new Set(selected.length ? selected : state.odPairs.map((pair) => pair.value));
}

function generatePassengerHistogram(start, end) {
  const routes = selectedOdPairs();
  const totalSelected = state.passengerTrips.filter((trip) => routes.has(trip.routeKey)).length;
  const trips = state.passengerTrips.filter((trip) =>
    trip.serviceDate && trip.serviceDate >= start && trip.serviceDate <= end && routes.has(trip.routeKey),
  );
  if (!trips.length) {
    els.histogramEmpty.hidden = false;
    els.histogramSubtitle.textContent = "No passenger trips match the selected date range and OD pairs.";
    clearHistogram();
    renderLatenessTable([]);
    renderTravelTimeTable([]);
    return;
  }
  drawHistogram(trips);
  renderLatenessTable(trips, totalSelected, start, end);
  renderTravelTimeTable(trips);
  const routeCount = routes.size === state.odPairs.length ? "all observed passenger OD pairs" : `${routes.size} selected passenger OD pair${routes.size === 1 ? "" : "s"}`;
  els.histogramSubtitle.textContent = `${trips.length.toLocaleString()} of ${totalSelected.toLocaleString()} selected trips · ${routeCount} · ${formatDisplayDate(start)}–${formatDisplayDate(end)} · 10-minute bins`;
  els.histogramEmpty.hidden = true;
}

function clearHistogram() {
  const canvas = els.tripTimeCanvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;
  canvas.width = Math.round(rect.width * Math.min(window.devicePixelRatio || 1, 2));
  canvas.height = Math.round(rect.height * Math.min(window.devicePixelRatio || 1, 2));
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function drawHistogram(trips) {
  const canvas = els.tripTimeCanvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const values = [...trips.flatMap((trip) => [trip.scheduledMinutes, trip.actualMinutes])];
  const binWidth = chooseHistogramBinWidth(values);
  const min = Math.floor(Math.min(...values) / binWidth) * binWidth - binWidth;
  const max = Math.ceil(Math.max(...values) / binWidth) * binWidth + binWidth;
  const bins = [];
  for (let start = min; start < max || !bins.length; start += binWidth) bins.push({ start, scheduled: 0, actual: 0 });
  for (const trip of trips) {
    bins[Math.min(bins.length - 1, Math.floor((trip.scheduledMinutes - min) / binWidth))].scheduled += 1;
    bins[Math.min(bins.length - 1, Math.floor((trip.actualMinutes - min) / binWidth))].actual += 1;
  }

  const margin = { top: 22, right: 20, bottom: 118, left: 58 };
  const plot = { x: margin.left, y: margin.top, width: rect.width - margin.left - margin.right, height: rect.height - margin.top - margin.bottom };
  const totalTrips = trips.length;
  const maxPercentage = Math.max(1, ...bins.map((bin) => Math.max(bin.scheduled, bin.actual) / totalTrips * 100));
  const yMax = Math.max(10, Math.ceil(maxPercentage / 10) * 10);
  const xStep = plot.width / bins.length;
  const barWidth = Math.max(2, Math.min(24, xStep * 0.34));
  const yScale = (percentage) => plot.y + plot.height - (percentage / yMax) * plot.height;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(plot.x, plot.y, plot.width, plot.height);
  ctx.font = "11px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let percentage = 0; percentage <= yMax; percentage += 10) {
    const y = yScale(percentage);
    ctx.strokeStyle = "#e4e9f0";
    ctx.beginPath();
    ctx.moveTo(plot.x, y);
    ctx.lineTo(plot.x + plot.width, y);
    ctx.stroke();
    ctx.fillStyle = "#667085";
    ctx.fillText(`${percentage}%`, plot.x - 8, y);
  }

  ctx.strokeStyle = "#eef1f5";
  ctx.lineWidth = 1;
  for (let index = 0; index <= bins.length; index += 1) {
    const x = plot.x + index * xStep;
    ctx.beginPath();
    ctx.moveTo(x, plot.y);
    ctx.lineTo(x, plot.y + plot.height);
    ctx.stroke();
  }

  for (let index = 0; index < bins.length; index += 1) {
    const bin = bins[index];
    const center = plot.x + index * xStep + xStep / 2;
    const scheduledHeight = (bin.scheduled / totalTrips * 100 / yMax) * plot.height;
    const actualHeight = (bin.actual / totalTrips * 100 / yMax) * plot.height;
    ctx.fillStyle = "rgba(21, 94, 239, 0.78)";
    ctx.fillRect(center - barWidth - 1, plot.y + plot.height - scheduledHeight, barWidth, scheduledHeight);
    ctx.fillStyle = "rgba(216, 107, 18, 0.78)";
    ctx.fillRect(center + 1, plot.y + plot.height - actualHeight, barWidth, actualHeight);
    {
      ctx.fillStyle = "#475467";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.save();
      ctx.translate(center, plot.y + plot.height + 14);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(formatMinuteRange(bin.start, binWidth), 0, 0);
      ctx.restore();
    }
  }

  ctx.strokeStyle = "#738198";
  ctx.strokeRect(plot.x, plot.y, plot.width, plot.height);
  ctx.fillStyle = "#667085";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.fillText("TRAVEL TIME", plot.x + plot.width / 2, rect.height - 20);
  ctx.save();
  ctx.translate(16, plot.y + plot.height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("PERCENT OF TRIPS", 0, 0);
  ctx.restore();
}

function chooseHistogramBinWidth(values) {
  return 10;
}

function formatMinutes(minutes) {
  const rounded = Math.round(minutes);
  const hours = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return hours ? `${hours}h ${String(remainder).padStart(2, "0")}` : `${remainder}m`;
}

function formatMinuteRange(start, width) {
  return `${formatMinutes(start)}–${formatMinutes(start + width - 1)}`;
}

function renderLatenessTable(trips, totalSelected = 0, start = null, end = null) {
  if (!trips.length) {
    els.latenessTableBody.replaceChildren();
    els.latenessTableSummary.textContent = "No data";
    return;
  }
  const bins = [
    { label: "More than 15 min early", count: 0, test: (minutes) => minutes < -15 },
    { label: "5–15 min early", count: 0, test: (minutes) => minutes >= -15 && minutes < -5 },
    { label: "Within ±5 min", count: 0, test: (minutes) => minutes >= -5 && minutes <= 5 },
    { label: "5–15 min late", count: 0, test: (minutes) => minutes > 5 && minutes <= 15 },
    { label: "15–30 min late", count: 0, test: (minutes) => minutes > 15 && minutes <= 30 },
    { label: "30–60 min late", count: 0, test: (minutes) => minutes > 30 && minutes <= 60 },
    { label: "More than 60 min late", count: 0, test: (minutes) => minutes > 60 },
  ];
  for (const trip of trips) {
    const bin = bins.find((candidate) => candidate.test(trip.finalLatenessMinutes));
    if (bin) bin.count += 1;
  }
  const total = trips.length;
  els.latenessTableBody.replaceChildren(...bins.map((bin) => {
    const row = document.createElement("tr");
    row.innerHTML = `<th scope="row">${bin.label}</th><td>${bin.count.toLocaleString()}</td><td>${(100 * bin.count / total).toFixed(1)}%</td>`;
    return row;
  }));
  const dateSummary = start && end ? ` · ${formatDisplayDate(start)}–${formatDisplayDate(end)}` : "";
  els.latenessTableSummary.textContent = `${total.toLocaleString()} of ${totalSelected.toLocaleString()} selected trips${dateSummary}`;
}

function renderTravelTimeTable(trips) {
  if (!trips.length) {
    els.travelTimeTableBody.replaceChildren();
    els.travelTimeSummary.textContent = "No data";
    return;
  }
  const grouped = new Map();
  for (const trip of trips) {
    const key = `${trip.routeKey}|${trip.serviceName}`;
    if (!grouped.has(key)) grouped.set(key, { serviceName: trip.serviceName, route: `${trip.origin} → ${trip.destination}`, actual: [], scheduled: [], lateness: [] });
    const group = grouped.get(key);
    group.actual.push(trip.actualMinutes);
    group.scheduled.push(trip.scheduledMinutes);
    group.lateness.push(trip.finalLatenessMinutes);
  }
  const rows = [...grouped.values()].sort((a, b) => a.serviceName.localeCompare(b.serviceName) || a.route.localeCompare(b.route));
  const overall = {
    serviceName: "Overall",
    route: "All selected origin–destination pairs",
    actual: trips.map((trip) => trip.actualMinutes),
    scheduled: trips.map((trip) => trip.scheduledMinutes),
    lateness: trips.map((trip) => trip.finalLatenessMinutes),
  };
  els.travelTimeTableBody.replaceChildren(...[overall, ...rows].map((group) => {
    const actual = group.actual;
    const row = document.createElement("tr");
    if (group.serviceName === "Overall") row.className = "stats-overall-row";
    row.innerHTML = `<th scope="row">${group.serviceName}</th><td>${group.route}</td><td>${actual.length.toLocaleString()}</td><td>${formatMinutes(percentile(actual, 0.05))}</td><td>${formatMinutes(percentile(actual, 0.5))}</td><td>${formatMinutes(percentile(actual, 0.95))}</td><td>${actual.length > 1 ? formatMinutes(standardDeviation(actual)) : "—"}</td><td>${formatMinutes(average(group.scheduled))}</td><td>${formatSignedMinutes(average(group.lateness))}</td>`;
    return row;
  }));
  els.travelTimeSummary.textContent = `${rows.length.toLocaleString()} passenger services · ${trips.length.toLocaleString()} observations`;
}

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatSignedMinutes(minutes) {
  if (!Number.isFinite(minutes)) return "—";
  if (Math.abs(minutes) < 0.5) return "0m";
  return `${minutes < 0 ? "−" : "+"}${formatMinutes(Math.abs(minutes))}`;
}

function standardDeviation(values) {
  if (values.length < 2) return Number.NaN;
  const mean = average(values);
  const squaredDifferences = values.reduce((total, value) => total + (value - mean) ** 2, 0);
  return Math.sqrt(squaredDifferences / (values.length - 1));
}

function percentile(values, quantile) {
  const sorted = [...values].sort((a, b) => a - b);
  const position = (sorted.length - 1) * quantile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function prepareTrip(tripId, rows, basis, mode = "normalized") {
  const serviceDate = getServiceDate(rows[0]);
  const name = getTrainName(rows[0], tripId);
  const direction = value(rows[0], "DIR").trim().toUpperCase();
  const type = getTrainType(rows[0], name[0]);

  const points = rows
    .map((row) => {
      const actualMs = parseTimestamp(value(row, "EVT_TMSTMP"));
      if (!Number.isFinite(actualMs)) return null;
      const lateHours = Number(value(row, "LATE_HOURS"));
      const adjustedMs = basis === "scheduled" && Number.isFinite(lateHours)
        ? actualMs - lateHours * 60 * 60 * 1000
        : actualMs;
      return {
        station: normalizeStation(value(row, "STN_333")),
        event: value(row, "EVT_CD").trim().toUpperCase() || "EVT",
        actualMs,
        adjustedMs,
        sequence: Number(value(row, "STN_SEQ_NBR")),
      };
    })
    .filter((point) => point && point.station)
    .sort((a, b) => a.actualMs - b.actualMs || a.event.localeCompare(b.event));

  if (mode === "calendar") {
    for (const point of points) point.timelineMinute = point.adjustedMs / 60000;
  } else if (points.length) {
    const firstDay = Math.floor(points[0].adjustedMs / 86400000) * 1440;
    for (const point of points) point.timelineMinute = point.adjustedMs / 60000 - firstDay;
  }

  return { tripId, serviceDate, name, type, direction, points };
}

function decorateCalendarTrips(trips) {
  const patternCounts = new Map();
  for (const trip of trips) {
    const key = `${trip.name}|${trip.points.map((point) => point.station).join(">")}`;
    patternCounts.set(key, (patternCounts.get(key) || 0) + 1);
  }

  const patternRanks = new Map();
  const names = [...new Set(trips.map((trip) => trip.name))];
  for (const name of names) {
    const patterns = [...patternCounts.entries()]
      .filter(([key]) => key.startsWith(`${name}|`))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    patterns.forEach(([key, repeatCount], index) => patternRanks.set(key, { index, repeatCount }));
  }

  return trips.map((trip) => {
    const key = `${trip.name}|${trip.points.map((point) => point.station).join(">")}`;
    const pattern = patternRanks.get(key) || { index: 0, repeatCount: 1 };
    return {
      ...trip,
      displayName: trip.name,
      variantIndex: pattern.index,
      repeatCount: pattern.repeatCount,
      dates: [trip.serviceDate],
    };
  });
}

function expandIndividualTrips(trips) {
  return trips.map((trip) => ({
    ...trip,
    displayName: trip.tripId,
    variantIndex: 0,
    repeatCount: 1,
    dates: [trip.serviceDate],
  }));
}

function deduplicateTrips(trips, tolerance) {
  const byName = new Map();
  for (const trip of trips) {
    if (!byName.has(trip.name)) byName.set(trip.name, []);
    const variants = byName.get(trip.name);
    const match = variants.find((variant) => pathsEquivalent(variant, trip, tolerance));
    if (match) {
      match.repeatCount += 1;
      match.dates.push(trip.serviceDate);
      if (trip.points.length > match.points.length) match.points = trip.points;
    } else {
      variants.push({ ...trip, repeatCount: 1, dates: [trip.serviceDate] });
    }
  }

  const output = [];
  for (const [name, variants] of byName) {
    variants.sort((a, b) => b.repeatCount - a.repeatCount || a.tripId.localeCompare(b.tripId));
    variants.forEach((variant, index) => {
      const suffix = index === 0 ? "" : `_${alphaSuffix(index - 1)}`;
      output.push({ ...variant, displayName: `${name}${suffix}`, variantIndex: index });
    });
  }
  return output.sort((a, b) => a.type.localeCompare(b.type) || a.displayName.localeCompare(b.displayName));
}

function pathsEquivalent(a, b, tolerance) {
  if (a.direction && b.direction && a.direction !== b.direction) return false;
  const aMap = pointTimeMap(a.points);
  const bMap = pointTimeMap(b.points);
  const common = [...aMap.keys()].filter((key) => bMap.has(key));
  const required = Math.max(2, Math.ceil(Math.min(aMap.size, bMap.size) * 0.6));
  if (common.length < required) return false;

  const stationA = [...new Set(a.points.map((point) => point.station))];
  const stationB = [...new Set(b.points.map((point) => point.station))];
  const sharedStations = stationA.filter((station) => stationB.includes(station));
  if (sharedStations.length < Math.max(2, Math.ceil(Math.min(stationA.length, stationB.length) * 0.6))) return false;

  return common.every((key) => circularMinuteDifference(aMap.get(key), bMap.get(key)) <= tolerance);
}

function pointTimeMap(points) {
  const map = new Map();
  const occurrences = new Map();
  for (const point of points) {
    const base = `${point.station}|${point.event}`;
    const count = occurrences.get(base) || 0;
    occurrences.set(base, count + 1);
    map.set(`${base}|${count}`, point.timelineMinute);
  }
  return map;
}

function buildStationModel(variants) {
  const stations = new Set();
  for (const variant of variants) for (const point of variant.points) stations.add(point.station);
  return [...stations]
    .filter((station) => isStationVisible(station))
    .map((station) => {
      return { station, position: STATION_POSITIONS[station] };
    })
    .sort((a, b) => a.position - b.position || a.station.localeCompare(b.station));
}

function drawChart(model) {
  const canvas = els.canvas;
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 10 || rect.height < 10) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);

  const margin = { top: 34, right: 24, bottom: 46, left: rect.width < 620 ? 100 : 150 };
  const plot = {
    x: margin.left,
    y: margin.top,
    width: rect.width - margin.left - margin.right,
    height: rect.height - margin.top - margin.bottom,
  };
  const positions = model.stationModel.map((item) => item.position);
  const minPosition = Math.min(...positions);
  const maxPosition = Math.max(...positions);
  const timelineSpan = Math.max(1, state.timelineEnd - state.timelineStart);
  const xScale = (minute) => plot.x + ((minute - state.timelineStart) / timelineSpan) * plot.width;
  const yScale = (position) => plot.y + ((position - minPosition) / Math.max(1, maxPosition - minPosition)) * plot.height;
  const stationLookup = new Map(model.stationModel.map((item) => [item.station, item.position]));

  drawGrid(ctx, plot, model.stationModel, xScale, yScale, rect.width, state.timelineStart, state.timelineEnd, model.calendarMode);
  ctx.save();
  ctx.beginPath();
  ctx.rect(plot.x, plot.y, plot.width, plot.height);
  ctx.clip();
  state.hitSegments = [];

  if (model.compareBoth) {
    drawVariantSet(ctx, model.scheduledVariants, stationLookup, xScale, yScale, plot, { scheduled: true, showLabels: false, continuous: model.calendarMode });
    drawVariantSet(ctx, model.actualVariants, stationLookup, xScale, yScale, plot, { scheduled: false, showLabels: true, continuous: model.calendarMode });
  } else {
    drawVariantSet(ctx, model.variants, stationLookup, xScale, yScale, plot, { scheduled: model.basis === "scheduled", showLabels: !model.ungroupedActual, continuous: false });
  }
  ctx.restore();
  ctx.globalAlpha = 1;
  ctx.setLineDash([]);
}

function resetTimelineZoom() {
  state.timelineStart = state.timelineDefaultStart;
  state.timelineEnd = state.timelineDefaultEnd;
  if (state.renderModel) drawChart(state.renderModel);
}

function zoomTimeline(factor, anchor = (state.timelineStart + state.timelineEnd) / 2) {
  const currentSpan = state.timelineEnd - state.timelineStart;
  const defaultSpan = Math.max(60, state.timelineDefaultEnd - state.timelineDefaultStart);
  const nextSpan = Math.max(60, Math.min(defaultSpan, currentSpan * factor));
  const anchorRatio = currentSpan ? (anchor - state.timelineStart) / currentSpan : 0.5;
  let nextStart = anchor - anchorRatio * nextSpan;
  let nextEnd = nextStart + nextSpan;
  if (nextStart < state.timelineDefaultStart) {
    nextEnd += state.timelineDefaultStart - nextStart;
    nextStart = state.timelineDefaultStart;
  }
  if (nextEnd > state.timelineDefaultEnd) {
    nextStart -= nextEnd - state.timelineDefaultEnd;
    nextEnd = state.timelineDefaultEnd;
  }
  state.timelineStart = Math.max(state.timelineDefaultStart, nextStart);
  state.timelineEnd = Math.min(state.timelineDefaultEnd, nextEnd);
  if (state.renderModel) drawChart(state.renderModel);
}

function setTimelineWindow(model) {
  if (!model.calendarMode) {
    state.timelineDefaultStart = 0;
    state.timelineDefaultEnd = 1440;
    state.timelineStart = state.timelineDefaultStart;
    state.timelineEnd = state.timelineDefaultEnd;
    return;
  }
  const variants = model.compareBoth
    ? [...model.actualVariants, ...model.scheduledVariants]
    : model.variants;
  const times = variants.flatMap((variant) => variant.points
    .filter((point) => isStationVisible(point.station))
    .map((point) => point.timelineMinute))
    .filter(Number.isFinite);
  if (!times.length) {
    state.timelineDefaultStart = 0;
    state.timelineDefaultEnd = 1440;
  } else {
    const earliest = Math.min(...times);
    const latest = Math.max(...times);
    state.timelineDefaultStart = Math.floor(earliest / 60) * 60 - 60;
    state.timelineDefaultEnd = Math.ceil(latest / 60) * 60 + 60;
  }
  state.timelineStart = state.timelineDefaultStart;
  state.timelineEnd = state.timelineDefaultEnd;
}

function formatTimelineTick(minute) {
  const date = new Date(minute * 60000);
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function formatClockMinute(minute) {
  const normalized = ((Math.round(minute) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatTimelineDate(minute) {
  const date = new Date(minute * 60000);
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

function drawVariantSet(ctx, variants, stationLookup, xScale, yScale, plot, options) {
  const ordered = [...variants].sort((a, b) => b.repeatCount - a.repeatCount);
  for (const variant of ordered) {
    const style = TYPE_STYLES[variant.type] || TYPE_STYLES.DEFAULT;
    const points = variant.points.filter((point) => stationLookup.has(point.station));
    if (points.length < 2) continue;
    const primary = variant.variantIndex === 0;
    const highlighted = Boolean(
      (state.hoveredTripKey && variant.name === state.hoveredTripKey)
      || tripMatchesSearch(variant),
    );
    ctx.strokeStyle = highlighted ? "#111827" : style.color;
    const baseWidth = primary ? 1.75 : 1.3125;
    const baseAlpha = options.scheduled ? (primary ? 0.55 : 0.28) : (primary ? 0.9 : 0.7);
    ctx.lineWidth = highlighted ? baseWidth * 2.5 : baseWidth;
    ctx.globalAlpha = highlighted ? 1 : baseAlpha;
    const scheduledDash = options.scheduled && options.continuous;
    const normalizedVariantDash = !primary && !options.continuous;
    const dashed = scheduledDash || normalizedVariantDash;
    ctx.setLineDash(dashed ? (primary ? [7, 5] : [4, 5]) : []);

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      drawWrappedSegment(ctx, previous, current, stationLookup, xScale, yScale, variant, options.continuous);
    }
    if (options.showLabels) drawVariantLabel(ctx, variant, points, stationLookup, xScale, yScale, plot, options.continuous);
  }
}

function drawGrid(ctx, plot, stations, xScale, yScale, width, timelineStart, timelineEnd, calendarMode) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(plot.x, plot.y, plot.width, plot.height);
  const span = timelineEnd - timelineStart;
  const minuteStep = span <= 180 ? 15 : span <= 360 ? 30 : span <= 720 ? 60 : 120;
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const firstTick = Math.ceil(timelineStart / minuteStep) * minuteStep;
  for (let minute = firstTick; minute <= timelineEnd; minute += minuteStep) {
    const x = xScale(minute);
    const tickDate = new Date(minute * 60000);
    const midnight = calendarMode && tickDate.getUTCHours() === 0 && tickDate.getUTCMinutes() === 0;
    const major = midnight || minute % 360 === 0;
    ctx.strokeStyle = midnight ? "#6f8198" : major ? "#aeb9c8" : "#e2e7ee";
    ctx.lineWidth = midnight ? 1.5 : major ? 1.15 : 0.75;
    ctx.beginPath();
    ctx.moveTo(x, plot.y);
    ctx.lineTo(x, plot.y + plot.height);
    ctx.stroke();
    ctx.fillStyle = "#31507a";
    ctx.fillText(calendarMode ? formatTimelineTick(minute) : formatClockMinute(minute), x, plot.y - 6);
    if (midnight) {
      ctx.fillStyle = "#53657d";
      ctx.font = "700 10px Inter, system-ui, sans-serif";
      ctx.fillText(formatTimelineDate(minute), x, plot.y - 20);
      ctx.font = "700 11px Inter, system-ui, sans-serif";
    }
  }

  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.font = `${plot.width < 620 ? 10 : 11}px Inter, system-ui, sans-serif`;
  const stationLabelX = plot.x - (plot.width < 620 ? 42 : 76);
  const milepostLabelX = plot.x - 8;
  for (const item of stations) {
    const y = yScale(item.position);
    ctx.strokeStyle = "#d5dce6";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(plot.x, y);
    ctx.lineTo(plot.x + plot.width, y);
    ctx.stroke();
    ctx.fillStyle = "#344054";
    ctx.fillText(shortStation(item.station, plot.width < 620), stationLabelX, y);
    ctx.fillStyle = "#667085";
    ctx.fillText(formatMilepost(item.position), milepostLabelX, y);
  }

  ctx.strokeStyle = "#738198";
  ctx.lineWidth = 1.2;
  ctx.strokeRect(plot.x, plot.y, plot.width, plot.height);
  ctx.fillStyle = "#667085";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.fillText("TIME", plot.x + plot.width / 2, plot.y + plot.height + 18);
}

function drawWrappedSegment(ctx, a, b, stationLookup, xScale, yScale, variant, continuous) {
  const start = a.timelineMinute;
  const end = b.timelineMinute;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return;
  const y1 = yScale(stationLookup.get(a.station));
  const y2 = yScale(stationLookup.get(b.station));
  if (continuous) {
    const x1 = xScale(start);
    const x2 = xScale(end);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    state.hitSegments.push({ x1, y1, x2, y2, variant, from: a, to: b });
    return;
  }

  const firstDay = Math.floor(start / 1440);
  const lastDay = Math.floor(end / 1440);
  for (let day = firstDay; day <= lastDay; day += 1) {
    const segmentStart = Math.max(start, day * 1440);
    const segmentEnd = Math.min(end, (day + 1) * 1440);
    if (segmentEnd < segmentStart) continue;
    const fraction1 = end === start ? 0 : (segmentStart - start) / (end - start);
    const fraction2 = end === start ? 1 : (segmentEnd - start) / (end - start);
    const sy1 = y1 + (y2 - y1) * fraction1;
    const sy2 = y1 + (y2 - y1) * fraction2;
    const x1 = xScale(segmentStart - day * 1440);
    const x2 = xScale(segmentEnd - day * 1440);
    ctx.beginPath();
    ctx.moveTo(x1, sy1);
    ctx.lineTo(x2, sy2);
    ctx.stroke();
    state.hitSegments.push({ x1, y1: sy1, x2, y2: sy2, variant, from: a, to: b });
  }
}

function drawVariantLabel(ctx, variant, points, stationLookup, xScale, yScale, plot, continuous) {
  const point = points[Math.min(1, points.length - 1)];
  const x = xScale(continuous ? point.timelineMinute : mod(point.timelineMinute, 1440));
  const y = yScale(stationLookup.get(point.station));
  const style = TYPE_STYLES[variant.type] || TYPE_STYLES.DEFAULT;
  ctx.save();
  ctx.globalAlpha = 0.92;
  ctx.font = "700 10px Inter, system-ui, sans-serif";
  ctx.textAlign = x > plot.x + plot.width - 75 ? "right" : "left";
  ctx.textBaseline = "bottom";
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,0.92)";
  ctx.strokeText(variant.displayName, x + (ctx.textAlign === "left" ? 3 : -3), y - 2);
  ctx.fillStyle = style.color;
  ctx.fillText(variant.displayName, x + (ctx.textAlign === "left" ? 3 : -3), y - 2);
  ctx.restore();
}

function handleHover(event) {
  if (state.pan.active) return;
  if (!state.hitSegments.length) return;
  const rect = els.canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  let nearest = null;
  let best = 9;
  for (const segment of state.hitSegments) {
    const distance = pointSegmentDistance(x, y, segment.x1, segment.y1, segment.x2, segment.y2);
    if (distance < best) {
      best = distance;
      nearest = segment;
    }
  }
  if (!nearest) {
    els.tooltip.hidden = true;
    if (state.hoveredTripKey) {
      state.hoveredTripKey = null;
      if (state.renderModel) drawChart(state.renderModel);
    }
    return;
  }
  const variant = nearest.variant;
  const groupKey = variant.name || variant.displayName;
  if (state.hoveredTripKey !== groupKey) {
    state.hoveredTripKey = groupKey;
    if (state.renderModel) drawChart(state.renderModel);
  }
  els.tooltip.innerHTML = `<strong>${escapeHtml(variant.displayName)}</strong>${escapeHtml(nearest.from.station)} → ${escapeHtml(nearest.to.station)}<br>${variant.repeatCount} matching occurrence${variant.repeatCount === 1 ? "" : "s"} · ${escapeHtml(variant.direction || "direction unknown")}`;
  els.tooltip.hidden = false;
  const tooltipRect = els.tooltip.getBoundingClientRect();
  els.tooltip.style.left = `${Math.min(x + 12, rect.width - tooltipRect.width - 8)}px`;
  els.tooltip.style.top = `${Math.max(8, y - tooltipRect.height - 12)}px`;
}

function startTimelinePan(event) {
  if (!state.renderModel || event.button !== 0) return;
  state.pan = {
    active: true,
    startX: event.clientX,
    startTimelineStart: state.timelineStart,
    startTimelineEnd: state.timelineEnd,
  };
  state.hoveredTripKey = null;
  els.tooltip.hidden = true;
  els.canvas.style.cursor = "grabbing";
  event.preventDefault();
}

function handleTimelinePan(event) {
  if (!state.pan.active || !state.renderModel) return;
  const rect = els.canvas.getBoundingClientRect();
  if (rect.width < 10) return;
  const span = state.pan.startTimelineEnd - state.pan.startTimelineStart;
  const deltaMinutes = (event.clientX - state.pan.startX) / rect.width * span;
  const maxStart = state.timelineDefaultEnd - span;
  const nextStart = Math.min(
    Math.max(state.timelineDefaultStart, state.pan.startTimelineStart - deltaMinutes),
    Math.max(state.timelineDefaultStart, maxStart),
  );
  state.timelineStart = nextStart;
  state.timelineEnd = nextStart + span;
  drawChart(state.renderModel);
}

function endTimelinePan() {
  if (!state.pan.active) return;
  state.pan.active = false;
  els.canvas.style.cursor = "grab";
}

function pointSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function renderLegend(variants) {
  const used = [...new Set(variants.map((variant) => variant.type))];
  els.legend.innerHTML = used
    .map((type) => {
      const style = TYPE_STYLES[type] || TYPE_STYLES.DEFAULT;
      return `<span class="legend-item"><span class="legend-swatch" style="--swatch:${style.color}"></span>${escapeHtml(style.label)}</span>`;
    })
    .join("");
}

function renderLineStyleLegend(calendarMode, ungroupedActual = false) {
  if (!els.lineStyleLegend) return;
  els.lineStyleLegend.innerHTML = calendarMode
    ? '<span><i class="line-style-swatch actual"></i>Actual</span><span><i class="line-style-swatch scheduled"></i>Scheduled</span>'
    : ungroupedActual
      ? '<span><i class="line-style-swatch actual"></i>Actual event times · individual trips</span>'
    : '<span><i class="line-style-swatch actual"></i>Most common pattern</span><span><i class="line-style-swatch scheduled"></i>Variant pattern</span>';
}

function validateColumns(required) {
  const missing = required.filter((name) => !state.headerMap.has(name));
  if (missing.length) throw new Error(`Missing required column${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
}

function value(row, header) {
  const index = state.headerMap.get(header);
  return index === undefined ? "" : String(row[index] ?? "");
}

function getServiceDate(row) {
  const raw = value(row, "TRN_SCH_DPT_DT") || value(row, "EVT_DT") || value(row, "EVT_TMSTMP");
  const parts = parseDateTimeParts(raw);
  return parts ? `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}` : null;
}

function getTrainType(row, fallback = "") {
  const explicit = value(row, "TRN_TYPE").trim().toUpperCase();
  if (explicit) return explicit;
  const trainId = value(row, "TRN_ID").trim().toUpperCase();
  return trainId[0] || fallback || "DEFAULT";
}

function getTrainName(row, tripId) {
  const type = value(row, "TRN_TYPE").trim().toUpperCase();
  const symbolRaw = value(row, "TRN_SYM").trim();
  const sectionRaw = value(row, "TRN_SECT").trim();
  if (type && symbolRaw) {
    const symbolNumber = Number(symbolRaw);
    const symbol = Number.isFinite(symbolNumber) ? String(Math.trunc(symbolNumber)).padStart(4, "0") : symbolRaw;
    const section = sectionRaw ? String(Math.trunc(Number(sectionRaw)) || sectionRaw) : "";
    return `${type}${symbol}${section}`;
  }
  return tripId.replace(/-\d{4}-\d{2}-\d{2}.*$/, "");
}

function parseTimestamp(raw) {
  const parts = parseDateTimeParts(raw);
  if (!parts || parts.hour === null) return Number.NaN;
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, parts.millisecond);
}

function parseDateTimeParts(raw) {
  const text = String(raw).trim();
  const match = text.match(
    /^(?:(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})|(\d{1,2})[-\/](\d{1,2})[-\/](\d{2}|\d{4}))(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}(?:\.\d+)?))?)?$/,
  );
  if (!match) return null;

  const year = Number(match[1] || match[6]);
  const normalizedYear = match[1] || match[6].length === 4
    ? year
    : year < 70
      ? 2000 + year
      : 1900 + year;
  const month = Number(match[2] || match[4]);
  const day = Number(match[3] || match[5]);
  const hour = match[7] === undefined ? null : Number(match[7]);
  const minute = match[8] === undefined ? 0 : Number(match[8]);
  const seconds = match[9] === undefined ? 0 : Number(match[9]);
  const second = Math.floor(seconds);
  const millisecond = Math.round((seconds - second) * 1000);

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(normalizedYear, month)) return null;
  if (hour !== null && (hour > 23 || minute > 59 || second > 59)) return null;

  return { year: normalizedYear, month, day, hour, minute, second, millisecond };
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function normalizeStation(valueRaw) {
  return String(valueRaw).trim().toUpperCase().replace(/\s+/g, "");
}

function isStationVisible(station) {
  return Number.isFinite(STATION_POSITIONS[station])
    && STATION_SUBDIVISIONS[station] === state.subdivision;
}

function alphaSuffix(index) {
  let number = index;
  let result = "";
  do {
    result = String.fromCharCode(97 + (number % 26)) + result;
    number = Math.floor(number / 26) - 1;
  } while (number >= 0);
  return result;
}

function addDays(isoDate, amount) {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function formatDisplayDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

function shortStation(station, compact) {
  const names = {
    MONTASYAR: compact ? "MTL" : "MONTASYAR",
    BROCKVILL: compact ? "BRO" : "BROCKVILL",
    BELLEVILL: compact ? "BEL" : "BELLEVILL",
    LIVERPOOL: compact ? "LIV" : "LIVERPOOL",
  };
  return names[station] || (compact ? station.slice(0, 4) : station);
}

function formatMilepost(position) {
  return `MP ${Number(position).toFixed(1)}`;
}

function tripMatchesSearch(variant) {
  const prefix = String(els.trainSearch?.value || "").trim().toUpperCase();
  if (!prefix) return false;
  return [variant.name, variant.tripId, variant.displayName]
    .some((candidate) => String(candidate || "").toUpperCase().startsWith(prefix));
}

function mod(valueRaw, divisor) {
  return ((valueRaw % divisor) + divisor) % divisor;
}

function circularMinuteDifference(a, b) {
  const difference = Math.abs(mod(a, 1440) - mod(b, 1440));
  return Math.min(difference, 1440 - difference);
}

function setStatus(text, stateName) {
  if (els.statusChip) {
    els.statusChip.textContent = text;
    els.statusChip.dataset.state = stateName;
  }
  if (!els.fileError) return;
  if (stateName === "error") {
    els.fileError.textContent = text;
    els.fileError.hidden = false;
  } else if (stateName === "empty" || stateName === "ready") {
    els.fileError.textContent = "";
    els.fileError.hidden = true;
  }
}

function escapeHtml(valueRaw) {
  return String(valueRaw)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
