/**
 * GridPulse — Unified Grid Operations & Intelligence Platform
 * Complete Real-Time Reactive SCADA Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // 1. SOUND & TOAST NOTIFICATION SUBSYSTEM
  // =========================================================================
  const toast = document.getElementById("toast");
  let toastTimer;

  function notify(message, type = "normal") {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
  }

  // Web Audio Context for realistic SCADA chime
  let audioCtx = null;
  function playAlertChime(critical = false) {
    if (!GridState.config.audioAlerts) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = critical ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(critical ? 880 : 587.33, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (critical ? 0.4 : 0.25));
      osc.start();
      osc.stop(audioCtx.currentTime + (critical ? 0.4 : 0.25));
    } catch (_) {}
  }

  // Safe CSV / text file exporter
  function csvEscape(val) {
    return `"${String(val ?? "").replace(/"/g, '""')}"`;
  }

  function downloadBlob(filename, content, mime = "text/csv;charset=utf-8;") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  // =========================================================================
  // 2. CENTRAL REAL-TIME STATE & ASSET REPOSITORY
  // =========================================================================
  const GridState = {
    config: {
      tickIntervalMs: 2000,
      theme: "light",
      audioAlerts: false,
      tempLimit: 80,
      thdiLimit: 6.5,
      flowAnimation: true,
      simulationActive: true,
      activeShift: "Evening"
    },
    activeAssetId: "TX-04",
    activeParameter: "Temperature",
    activeRange: "7D",
    chartMode: "Overlay",
    activeOrderTab: "Work orders",
    telemetryRecords: 8421950,
    reroutedState: false,
    assets: {
      "TX-01": {
        id: "TX-01",
        name: "Transformer TX-01",
        location: "North Substation",
        type: "Power Transformer",
        capacity: "25 MVA",
        voltage: "132 kV / 11 kV",
        score: 91,
        status: "Healthy",
        temp: 62.4,
        thdi: 3.1,
        loadA: 210,
        voltageKv: 11.2,
        pf: 0.97,
        img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      },
      "TX-02": {
        id: "TX-02",
        name: "Transformer TX-02",
        location: "Riverside",
        type: "Power Transformer",
        capacity: "25 MVA",
        voltage: "132 kV / 11 kV",
        score: 76,
        status: "Warning",
        temp: 78.2,
        thdi: 5.2,
        loadA: 280,
        voltageKv: 11.1,
        pf: 0.91,
        img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      },
      "TX-03": {
        id: "TX-03",
        name: "Transformer TX-03",
        location: "Maple Grove",
        type: "Power Transformer",
        capacity: "25 MVA",
        voltage: "132 kV / 11 kV",
        score: 62,
        status: "Warning",
        temp: 80.1,
        thdi: 5.8,
        loadA: 295,
        voltageKv: 11.0,
        pf: 0.89,
        img: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      },
      "TX-04": {
        id: "TX-04",
        name: "Transformer TX-04",
        location: "Lakeside Substation",
        type: "Power Transformer",
        capacity: "25 MVA",
        voltage: "132 kV / 11 kV",
        score: 34,
        status: "Critical",
        temp: 85.0,
        thdi: 6.8,
        loadA: 320,
        voltageKv: 11.2,
        pf: 0.82,
        img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      },
      "TX-05": {
        id: "TX-05",
        name: "Transformer TX-05",
        location: "West Feeder",
        type: "Distribution Transformer",
        capacity: "15 MVA",
        voltage: "33 kV / 11 kV",
        score: 88,
        status: "Healthy",
        temp: 65.2,
        thdi: 3.4,
        loadA: 180,
        voltageKv: 11.3,
        pf: 0.96,
        img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      },
      "TX-06": {
        id: "TX-06",
        name: "Transformer TX-06",
        location: "East Feeder",
        type: "Distribution Transformer",
        capacity: "15 MVA",
        voltage: "33 kV / 11 kV",
        score: 81,
        status: "Healthy",
        temp: 69.1,
        thdi: 4.1,
        loadA: 195,
        voltageKv: 11.2,
        pf: 0.95,
        img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      },
      "TX-07": {
        id: "TX-07",
        name: "Transformer TX-07",
        location: "Central Substation",
        type: "Power Transformer",
        capacity: "50 MVA",
        voltage: "132 kV / 33 kV",
        score: 69,
        status: "Warning",
        temp: 76.5,
        thdi: 5.1,
        loadA: 380,
        voltageKv: 33.1,
        pf: 0.90,
        img: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      },
      "TX-08": {
        id: "TX-08",
        name: "Transformer TX-08",
        location: "Hillview",
        type: "Distribution Transformer",
        capacity: "10 MVA",
        voltage: "33 kV / 0.415 kV",
        score: 77,
        status: "Healthy",
        temp: 68.3,
        thdi: 4.0,
        loadA: 140,
        voltageKv: 0.41,
        pf: 0.96,
        img: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=900&q=90",
        history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
      }
    },
    gridLoad: {
      total: 42.4,
      north: 14.2,
      west: 12.8,
      east: 15.4,
      reroutedLoadMW: 12.0
    },
    notifications: [
      { id: "n1", type: "critical", title: "TX-04 Critical Temperature Alert", text: "Core oil temp exceeded 85 °C threshold at Lakeside Substation.", time: "Just now", unread: true },
      { id: "n2", type: "warning", title: "TX-03 Elevated Harmonic THDi", text: "Harmonic THDi at 5.8% exceeds normal operating baseline.", time: "8m ago", unread: true },
      { id: "n3", type: "info", title: "Feeder F-3 Capacity Verified", text: "12 MW reserve verified and ready for bypass reroute.", time: "18m ago", unread: true }
    ]
  };

  // Prepopulate 25 initial data points for smooth chart rendering
  Object.values(GridState.assets).forEach(a => {
    for (let i = 0; i < 25; i++) {
      const noise = (Math.random() - 0.5);
      a.history.temp.push(Math.round((a.temp + noise * 1.5) * 10) / 10);
      a.history.voltage.push(Math.round((a.voltageKv + noise * 0.1) * 100) / 100);
      a.history.current.push(Math.round(a.loadA + noise * 12));
      a.history.thdi.push(Math.round((a.thdi + noise * 0.3) * 10) / 10);
      a.history.pf.push(Math.round((a.pf + noise * 0.02) * 100) / 100);
    }
  });

  // =========================================================================
  // 3. NAVIGATION, SCROLLSPY & SETTINGS
  // =========================================================================
  const navItems = document.querySelectorAll(".nav-item[data-page]");
  const sections = document.querySelectorAll(".dashboard-section");

  navItems.forEach(link => {
    link.addEventListener("click", e => {
      const page = link.dataset.page;
      if (page === "Settings") {
        e.preventDefault();
        openSettingsModal();
        return;
      }
      navItems.forEach(item => item.classList.remove("selected"));
      link.classList.add("selected");
    });
  });

  const sectionObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(item => {
            if (item.getAttribute("href") === `#${id}`) {
              navItems.forEach(nav => nav.classList.remove("selected"));
              item.classList.add("selected");
            }
          });
        }
      });
    },
    { root: null, rootMargin: "-25% 0px -55% 0px", threshold: 0 }
  );
  sections.forEach(sec => sectionObserver.observe(sec));

  // =========================================================================
  // 4. TOPBAR CONTROLS: SEARCH, DATE/SHIFT, NOTIFICATIONS, PROFILE
  // =========================================================================
  const globalSearch = document.getElementById("globalSearch");
  const dateButton = document.getElementById("dateButton");
  const notificationButton = document.getElementById("notificationButton");
  const profileButton = document.getElementById("profileButton");

  // Keyboard shortcut '/' to focus global search
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== globalSearch && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      globalSearch?.focus();
    }
  });

  globalSearch?.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const q = globalSearch.value.trim().toLowerCase();
      if (!q) {
        notify("Type an asset name (e.g. TX-04, North, Voltage) to search.");
        return;
      }
      document.querySelectorAll(".search-match").forEach(el => el.classList.remove("search-match"));
      const targets = [
        ...document.querySelectorAll(".stat-card, .metric-card, .summary-card, tr, .transformer-info, .bottom-card, .asset-card")
      ];
      let matches = 0;
      let first = null;
      targets.forEach(el => {
        if (el.textContent.toLowerCase().includes(q)) {
          el.classList.add("search-match");
          matches++;
          if (!first) first = el;
        }
      });
      if (first) {
        first.scrollIntoView({ behavior: "smooth", block: "center" });
        notify(`Found ${matches} match${matches === 1 ? "" : "es"} across dashboard.`);
      } else {
        notify(`No items found matching “${globalSearch.value.trim()}”.`);
      }
    }
  });

  globalSearch?.addEventListener("input", () => {
    if (!globalSearch.value.trim()) {
      document.querySelectorAll(".search-match").forEach(el => el.classList.remove("search-match"));
    }
  });

  // Date & Shift Picker Modal
  const datePickerModal = document.getElementById("datePickerModal");
  dateButton?.addEventListener("click", () => datePickerModal?.showModal());
  document.getElementById("closeDateModal")?.addEventListener("click", () => datePickerModal?.close());
  document.getElementById("datePickerForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const date = document.getElementById("operationalDateInput")?.value || "2024-05-20";
    const shift = document.getElementById("operationalShiftSelect")?.value || "Evening";
    const mode = document.getElementById("operationalModeSelect")?.value || "live";
    GridState.config.activeShift = shift;

    const span = dateButton?.querySelector("span");
    if (span) {
      const parts = date.split("-");
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      span.textContent = `${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · ${shift} Shift`;
    }
    datePickerModal?.close();
    notify(`Operational context updated: ${shift} Shift (${mode === "live" ? "Live Telemetry" : "Archive Replay"}).`);
  });

  // Notification Center
  const notificationModal = document.getElementById("notificationModal");
  notificationButton?.addEventListener("click", () => {
    renderNotificationList();
    notificationModal?.showModal();
  });
  document.getElementById("closeNotificationModal")?.addEventListener("click", () => notificationModal?.close());

  function renderNotificationList() {
    const list = document.getElementById("notificationList");
    const badge = document.getElementById("notificationCountBadge");
    if (!list) return;

    list.innerHTML = GridState.notifications
      .map(
        n => `
      <div class="notif-item ${n.unread ? "unread" : ""} ${n.type}" data-notif-id="${n.id}">
        <span class="notif-icon ${n.type}-icon">${n.type === "critical" ? "⚠" : n.type === "warning" ? "⚡" : "ℹ"}</span>
        <div class="notif-content">
          <strong>${n.title}</strong>
          <p>${n.text}</p>
          <span class="notif-time">${n.time}</span>
        </div>
      </div>
    `
      )
      .join("");

    const unread = GridState.notifications.filter(n => n.unread).length;
    if (badge) badge.textContent = `${unread} Active Alert${unread === 1 ? "" : "s"}`;
    const dot = notificationButton?.querySelector("i");
    if (dot) dot.style.display = unread > 0 ? "block" : "none";

    const sideBadge = document.querySelector(".nav-count");
    if (sideBadge) sideBadge.textContent = unread;

    list.querySelectorAll(".notif-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.dataset.notifId;
        const n = GridState.notifications.find(x => x.id === id);
        if (n) {
          n.unread = false;
          renderNotificationList();
          notificationModal?.close();
          document.getElementById("alerts")?.scrollIntoView({ behavior: "smooth" });
          notify(`Viewing alert: ${n.title}`);
        }
      });
    });
  }

  document.getElementById("markAllNotificationsRead")?.addEventListener("click", () => {
    GridState.notifications.forEach(n => (n.unread = false));
    renderNotificationList();
    notify("All notifications marked as read.");
  });

  document.getElementById("clearAllNotifications")?.addEventListener("click", () => {
    GridState.notifications = [];
    renderNotificationList();
    notify("Notification center cleared.");
  });

  // Profile Modal & Theme Switcher
  const profileModal = document.getElementById("profileModal");
  profileButton?.addEventListener("click", () => profileModal?.showModal());
  document.getElementById("closeProfileModal")?.addEventListener("click", () => profileModal?.close());

  document.getElementById("roleSwitcher")?.addEventListener("change", e => {
    const role = e.target.value;
    const roleEl = document.getElementById("profileRole");
    const btnSpan = profileButton?.querySelector("small");
    if (roleEl) roleEl.textContent = role;
    if (btnSpan) btnSpan.textContent = role;
    notify(`Switched operational role to: ${role}`);
  });

  document.getElementById("toggleThemeQuick")?.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark");
  });

  document.getElementById("lockSessionBtn")?.addEventListener("click", () => {
    profileModal?.close();
    notify("Operator console locked. Click profile to unlock.");
  });

  // Settings Modal Handlers
  const settingsModal = document.getElementById("settingsModal");
  function openSettingsModal() {
    settingsModal?.showModal();
  }
  document.getElementById("closeSettingsModal")?.addEventListener("click", () => settingsModal?.close());

  function setTheme(t) {
    GridState.config.theme = t;
    if (t === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    const select = document.getElementById("settingTheme");
    if (select) select.value = t;
    notify(`Theme set to ${t === "dark" ? "Dark SCADA Console" : "Default Slate"}.`);
  }

  document.getElementById("settingTheme")?.addEventListener("change", e => setTheme(e.target.value));

  document.getElementById("settingTickInterval")?.addEventListener("change", e => {
    const val = Number(e.target.value);
    GridState.config.tickIntervalMs = val;
    restartRealtimeEngine();
    notify(val > 0 ? `Telemetry tick interval set to ${val / 1000}s.` : "Telemetry stream paused.");
  });

  document.getElementById("settingTempLimit")?.addEventListener("input", e => {
    GridState.config.tempLimit = Number(e.target.value);
    const d = document.getElementById("tempLimitDisplay");
    if (d) d.textContent = `${e.target.value} °C`;
  });

  document.getElementById("settingThdiLimit")?.addEventListener("input", e => {
    GridState.config.thdiLimit = Number(e.target.value);
    const d = document.getElementById("thdiLimitDisplay");
    if (d) d.textContent = `${e.target.value} %`;
  });

  document.getElementById("settingAudioAlerts")?.addEventListener("change", e => {
    GridState.config.audioAlerts = e.target.checked;
    if (e.target.checked) playAlertChime(false);
    notify(e.target.checked ? "Audio alarm alerts enabled." : "Audio alerts muted.");
  });

  document.getElementById("settingFlowAnimation")?.addEventListener("change", e => {
    GridState.config.flowAnimation = e.target.checked;
    document.querySelectorAll(".reroute-workspace").forEach(w => w.classList.toggle("flow-animating", e.target.checked));
  });

  document.getElementById("resetSettingsBtn")?.addEventListener("click", () => {
    setTheme("light");
    GridState.config.tickIntervalMs = 2000;
    GridState.config.tempLimit = 80;
    GridState.config.thdiLimit = 6.5;
    GridState.config.audioAlerts = false;
    GridState.config.flowAnimation = true;
    const intervalSelect = document.getElementById("settingTickInterval");
    if (intervalSelect) intervalSelect.value = "2000";
    restartRealtimeEngine();
    notify("Settings restored to factory defaults.");
  });

  document.getElementById("saveSettingsBtn")?.addEventListener("click", () => {
    settingsModal?.close();
    notify("System preferences saved.");
  });

  // =========================================================================
  // 5. SECTION 1: OVERVIEW CONTROLS & INTERACTIVE MAP
  // =========================================================================
  // Stat cards jump to Asset Health filtered
  document.querySelectorAll(".stats-grid .stat-card").forEach((card, idx) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const statuses = ["", "Healthy", "Warning", "Critical"];
      const targetStatus = statuses[idx];
      const filter = document.getElementById("statusFilter");
      if (filter) {
        filter.value = targetStatus;
        filterAssetRows();
      }
      document.getElementById("asset-health")?.scrollIntoView({ behavior: "smooth" });
      notify(`Filtered Asset Health by ${targetStatus || "All Assets"}.`);
    });
  });

  // Transformer TX-04 jump button
  document.querySelector(".transformer-title .arrow-button")?.addEventListener("click", () => {
    selectAsset("TX-04");
    document.getElementById("telemetry")?.scrollIntoView({ behavior: "smooth" });
  });

  // Overview recent alert jump button & chevron
  document.querySelectorAll(".alert-card button, .alert-card .row-chevron").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("alerts")?.scrollIntoView({ behavior: "smooth" });
      notify("Navigated to Alerts & Events.");
    });
  });

  // Overview maintenance queue jump button & chevron
  document.querySelectorAll(".bottom-card:not(.alert-card) button, .bottom-card:not(.alert-card) .row-chevron").forEach(btn => {
    btn.addEventListener("click", () => {
      document.getElementById("maintenance")?.scrollIntoView({ behavior: "smooth" });
      notify("Navigated to Maintenance & Dispatch queue.");
    });
  });

  // Overview Map Layer Button & Zoom Controls
  let overviewZoom = 1;
  const overviewMapLines = document.querySelector("#overviewMapPanel .map-lines");

  document.getElementById("overviewZoomIn")?.addEventListener("click", () => {
    overviewZoom = Math.min(overviewZoom + 0.15, 1.7);
    if (overviewMapLines) overviewMapLines.style.transform = `scale(${overviewZoom})`;
    notify(`Overview zoom: ${Math.round(overviewZoom * 100)}%`);
  });

  document.getElementById("overviewZoomOut")?.addEventListener("click", () => {
    overviewZoom = Math.max(overviewZoom - 0.15, 0.8);
    if (overviewMapLines) overviewMapLines.style.transform = `scale(${overviewZoom})`;
    notify(`Overview zoom: ${Math.round(overviewZoom * 100)}%`);
  });

  document.getElementById("overviewRecenter")?.addEventListener("click", () => {
    overviewZoom = 1;
    if (overviewMapLines) overviewMapLines.style.transform = "scale(1)";
    notify("Overview map recentered.");
  });

  document.getElementById("topologyButton")?.addEventListener("click", () => {
    const isThermal = overviewMapLines?.classList.toggle("thermal-view");
    notify(isThermal ? "Overview: Thermal gradient layer enabled." : "Overview: Standard schematic topology.");
  });

  // Interactive map labels in Overview
  document.querySelectorAll("#overviewMapPanel .map-label").forEach(label => {
    label.style.cursor = "pointer";
    label.addEventListener("click", () => {
      const txt = label.textContent.replace(/[^A-Za-z0-9\-]/g, "");
      const match = Object.keys(GridState.assets).find(id => txt.includes(id));
      if (match) {
        selectAsset(match);
        notify(`Substation Node: ${match} selected.`);
      }
    });
  });

  // =========================================================================
  // 6. SECTION 2: TELEMETRY (DYNAMIC STREAMING & INTERACTIVE GRAPHS)
  // =========================================================================
  const assetSelectBtn = document.getElementById("assetSelect");
  const assetPickerPopover = document.getElementById("assetPickerPopover");

  // Build the asset picker popover list
  function buildAssetPickerList() {
    const list = document.getElementById("assetPickerList");
    if (!list) return;
    list.innerHTML = Object.values(GridState.assets)
      .map(
        a => `
      <button type="button" class="asset-picker-option ${a.id === GridState.activeAssetId ? "selected" : ""}" data-asset-id="${a.id}">
        <div>
          <strong>${a.id} — ${a.name}</strong>
          <small>${a.location} · ${a.capacity}</small>
        </div>
        <span class="chi-badge chi-${a.status.toLowerCase()}">${a.score}</span>
      </button>
    `
      )
      .join("");

    list.querySelectorAll(".asset-picker-option").forEach(btn => {
      btn.addEventListener("click", () => {
        selectAsset(btn.dataset.assetId);
        assetPickerPopover.hidden = true;
      });
    });
  }

  assetSelectBtn?.addEventListener("click", e => {
    e.stopPropagation();
    buildAssetPickerList();
    const rect = assetSelectBtn.getBoundingClientRect();
    if (assetPickerPopover) {
      assetPickerPopover.style.top = `${rect.bottom + 6}px`;
      assetPickerPopover.style.left = `${rect.left}px`;
      assetPickerPopover.hidden = !assetPickerPopover.hidden;
    }
  });

  // Range select popover
  document.getElementById("rangeSelect")?.addEventListener("click", () => {
    notify(`Current Telemetry Window: ${GridState.activeRange} sliding time-series.`);
  });

  // Range tabs
  document.querySelectorAll(".range-tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".range-tabs button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      GridState.activeRange = btn.dataset.range;
      updateChartAxisLabels(btn.dataset.range);
      renderMainTelemetryChart();
      notify(`Telemetry range updated to ${btn.dataset.range}.`);
    });
  });

  function updateChartAxisLabels(range) {
    const xLabels = document.querySelector("#telemetry .x-labels");
    if (!xLabels) return;
    if (range === "1H") {
      xLabels.innerHTML = "<span>10:00</span><span>10:12</span><span>10:24</span><span>10:36</span><span>10:48</span><span>11:00</span>";
    } else if (range === "1D") {
      xLabels.innerHTML = "<span>00:00</span><span>04:00</span><span>08:00</span><span>12:00</span><span>16:00</span><span>20:00</span>";
    } else if (range === "7D") {
      xLabels.innerHTML = "<span>May 14</span><span>May 15</span><span>May 16</span><span>May 17</span><span>May 18</span><span>May 19</span><span>May 20</span>";
    } else {
      xLabels.innerHTML = "<span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>Current</span>";
    }
  }

  // Parameter Metric Cards switch active graph
  document.querySelectorAll("#telemetry .metric-card").forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const metric = card.dataset.metric;
      if (metric) {
        setParameter(metric);
      }
    });
  });

  // Parameter Tabs
  document.querySelectorAll(".parameter-tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      const param = btn.dataset.parameter;
      setParameter(param);
    });
  });

  function setParameter(param) {
    GridState.activeParameter = param;
    document.querySelectorAll(".parameter-tabs button").forEach(b => {
      b.classList.toggle("active", b.dataset.parameter === param);
    });
    document.querySelectorAll("#telemetry .metric-card").forEach(c => {
      c.classList.toggle("active-metric", c.dataset.metric === param);
    });

    const thresholdEl = document.querySelector("#telemetry .threshold span");
    const yLabels = document.querySelector("#telemetry .y-labels");

    const thresholds = {
      Temperature: "Threshold: 80 °C (Critical)",
      Voltage: "Reference Range: 10.8 – 11.8 kV",
      Current: "Max Thermal Rating: 400 A",
      THDi: "IEEE 519 Standard Limit: 5.0 %",
      "Power Factor": "Target Power Factor: ≥ 0.95"
    };

    const scales = {
      Temperature: "<span>120</span><span>90</span><span>60</span><span>30</span><span>0</span>",
      Voltage: "<span>15</span><span>12</span><span>9</span><span>6</span><span>0</span>",
      Current: "<span>500</span><span>400</span><span>300</span><span>200</span><span>0</span>",
      THDi: "<span>12%</span><span>9%</span><span>6%</span><span>3%</span><span>0%</span>",
      "Power Factor": "<span>1.0</span><span>0.95</span><span>0.90</span><span>0.85</span><span>0.80</span>"
    };

    if (thresholdEl) thresholdEl.textContent = thresholds[param] || "Operating Range";
    if (yLabels && scales[param]) yLabels.innerHTML = scales[param];

    renderMainTelemetryChart();
    notify(`${param} active on telemetry trend analyzer.`);
  }

  // Chart Mode Dropdown
  document.getElementById("chartMode")?.addEventListener("change", e => {
    GridState.chartMode = e.target.value;
    renderMainTelemetryChart();
    notify(`Chart display mode: ${e.target.value}`);
  });

  // Expand Chart
  document.getElementById("expandChart")?.addEventListener("click", () => {
    const card = document.querySelector("#telemetry .chart-card");
    if (card) {
      const exp = card.classList.toggle("expanded");
      notify(exp ? "Telemetry chart expanded." : "Telemetry chart restored.");
    }
  });

  // Interactive mouse tracking over main chart SVG
  const telemetryChartSvg = document.querySelector("#telemetryChartPlot .main-chart");
  const crosshairLine = document.querySelector("#telemetry .chart-crosshair");
  const chartPoint = document.querySelector("#telemetry .chart-point");
  const tooltipVal = document.getElementById("tooltipValue");

  telemetryChartSvg?.addEventListener("mousemove", e => {
    const rect = telemetryChartSvg.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const svgX = Math.round(xRatio * 850);

    const asset = GridState.assets[GridState.activeAssetId];
    const series = getParamHistory(asset, GridState.activeParameter);
    const idx = Math.min(series.length - 1, Math.floor(xRatio * series.length));
    const val = series[idx];

    const y = computeChartY(val, GridState.activeParameter);

    if (crosshairLine) {
      crosshairLine.setAttribute("x1", svgX);
      crosshairLine.setAttribute("x2", svgX);
    }
    if (chartPoint) {
      chartPoint.setAttribute("cx", svgX);
      chartPoint.setAttribute("cy", y);
    }
    if (tooltipVal) {
      tooltipVal.textContent = formatParamValue(val, GridState.activeParameter);
    }
  });

  // Telemetry info button
  document.getElementById("telemetryInfoButton")?.addEventListener("click", () => {
    notify("Displaying rolling SCADA harmonics, winding temperature & load telemetry.");
  });

  // Photo Lightbox modal trigger
  const lightboxModal = document.getElementById("imageLightboxModal");
  document.getElementById("expandPhoto")?.addEventListener("click", () => {
    const asset = GridState.assets[GridState.activeAssetId];
    const img = document.getElementById("lightboxImage");
    const title = document.getElementById("lightboxTitle");
    if (img && asset) img.src = asset.img;
    if (title && asset) title.textContent = `${asset.name} — ${asset.location}`;
    lightboxModal?.showModal();
  });
  document.getElementById("closeLightboxModal")?.addEventListener("click", () => lightboxModal?.close());

  // Expand Substation Map
  document.getElementById("telemetryExpandMap")?.addEventListener("click", () => {
    const modal = document.getElementById("routeModal");
    modal?.showModal();
  });

  // Quick action buttons in Telemetry sidebar
  document.querySelectorAll("#telemetry .quick-grid button").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action || btn.innerText;
      if (action.includes("View asset health")) {
        document.getElementById("asset-health")?.scrollIntoView({ behavior: "smooth" });
        selectAsset(GridState.activeAssetId);
      } else if (action.includes("Compare with assets")) {
        openAssetComparison();
      } else if (action.includes("Add to maintenance")) {
        const orderDialog = document.getElementById("workOrderDialog");
        const select = orderDialog?.querySelector('select[name="asset"]');
        if (select) select.value = GridState.activeAssetId;
        orderDialog?.showModal();
      } else if (btn.id === "downloadData" || action.includes("Download data")) {
        exportTelemetryCSV();
      }
    });
  });

  // Multi-Asset Comparison Dialog
  function openAssetComparison() {
    const compareModal = document.getElementById("compareAssetsModal");
    const body = document.getElementById("compareTableBody");
    if (!body) return;

    const ids = ["TX-04", "TX-01", "TX-02", "TX-03"];
    const rows = [
      ["Location", ids.map(id => GridState.assets[id].location)],
      ["Composite Health Index (CHI)", ids.map(id => `${GridState.assets[id].score} / 100`)],
      ["Status", ids.map(id => `<span class="status ${GridState.assets[id].status.toLowerCase()}"><i></i>${GridState.assets[id].status}</span>`)],
      ["Operating Temperature", ids.map(id => `${GridState.assets[id].temp} °C`)],
      ["Harmonic THDi", ids.map(id => `${GridState.assets[id].thdi} %`)],
      ["Load Current", ids.map(id => `${GridState.assets[id].loadA} A`)],
      ["Operating Power Factor", ids.map(id => GridState.assets[id].pf)],
      ["Primary Capacity", ids.map(id => GridState.assets[id].capacity)]
    ];

    body.innerHTML = rows
      .map(
        r => `
      <tr>
        <td><strong>${r[0]}</strong></td>
        ${r[1].map(val => `<td>${val}</td>`).join("")}
      </tr>
    `
      )
      .join("");

    compareModal?.showModal();
  }
  document.getElementById("closeCompareModal")?.addEventListener("click", () => {
    document.getElementById("compareAssetsModal")?.close();
  });

  // Recent events row click
  document.querySelectorAll("#telemetry .event-row[data-event]").forEach(row => {
    row.addEventListener("click", () => {
      openEventDetails(row.dataset.event);
    });
  });

  document.getElementById("viewAllEvents")?.addEventListener("click", () => {
    openEventDetails("Comprehensive event history for " + GridState.activeAssetId);
  });

  // Event Details Modal
  function openEventDetails(eventName) {
    const modal = document.getElementById("eventDetailsModal");
    const title = document.getElementById("eventModalTitle");
    const body = document.getElementById("eventModalBody");
    if (title) title.textContent = eventName;
    if (body) {
      body.innerHTML = `
        <div class="route-stat"><span>Triggered Time</span><strong>May 20, 2024 · 10:24 AM</strong></div>
        <div class="route-stat"><span>Monitored Asset</span><strong>${GridState.activeAssetId} (${GridState.assets[GridState.activeAssetId].location})</strong></div>
        <div class="route-stat"><span>Parameter</span><strong>${GridState.activeParameter}</strong></div>
        <div class="route-stat"><span>Telemetry Value</span><strong>${GridState.assets[GridState.activeAssetId].temp} °C</strong></div>
        <div class="route-stat"><span>SCADA State</span><strong>Above Standard Threshold</strong></div>
      `;
    }
    modal?.showModal();
  }
  document.getElementById("closeEventModal")?.addEventListener("click", () => {
    document.getElementById("eventDetailsModal")?.close();
  });
  document.getElementById("acknowledgeEventBtn")?.addEventListener("click", () => {
    document.getElementById("eventDetailsModal")?.close();
    notify("Event acknowledged and archived in SCADA audit ledger.");
  });

  // Export Telemetry CSV
  function exportTelemetryCSV() {
    const asset = GridState.assets[GridState.activeAssetId];
    const header = ["Index", "Timestamp", "Asset ID", "Temperature (°C)", "Voltage (kV)", "Current (A)", "THDi (%)", "Power Factor"];
    const rows = asset.history.temp.map((t, i) => [
      i + 1,
      `May 20, ${10 + Math.floor(i / 4)}:${String((i * 12) % 60).padStart(2, "0")} AM`,
      asset.id,
      t,
      asset.history.voltage[i] || asset.voltageKv,
      asset.history.current[i] || asset.loadA,
      asset.history.thdi[i] || asset.thdi,
      asset.history.pf[i] || asset.pf
    ]);
    const csv = [header, ...rows].map(l => l.map(csvEscape).join(",")).join("\r\n");
    downloadBlob(`gridpulse-${asset.id.toLowerCase()}-telemetry.csv`, csv);
    notify(`Telemetry dataset for ${asset.id} exported.`);
  }

  document.getElementById("exportButton")?.addEventListener("click", exportTelemetryCSV);
  document.getElementById("downloadData")?.addEventListener("click", exportTelemetryCSV);

  // =========================================================================
  // 7. SECTION 3: ASSET HEALTH & MANAGEMENT
  // =========================================================================
  const assetRows = [...document.querySelectorAll("#assetRows tr")];
  const locationFilter = document.getElementById("locationFilter");
  const statusFilter = document.getElementById("statusFilter");
  const typeFilter = document.getElementById("typeFilter");
  const sortFilter = document.getElementById("sortFilter");
  const assetSearch = document.getElementById("assetSearch");
  const selectAllAssets = document.getElementById("selectAllAssets");

  // Add Asset Modal
  const addAssetDialog = document.getElementById("addAssetDialog");
  document.getElementById("addAsset")?.addEventListener("click", () => addAssetDialog?.showModal());
  document.getElementById("closeAddAssetDialog")?.addEventListener("click", () => addAssetDialog?.close());

  document.getElementById("addAssetForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = data.get("id")?.trim().toUpperCase() || "TX-09";
    const loc = data.get("location") || "North Substation";
    const tp = data.get("type") || "Power Transformer";
    const cap = data.get("capacity") || "25 MVA";
    const volt = data.get("voltage") || "132 kV / 11 kV";
    const st = data.get("status") || "Healthy";
    const score = st === "Healthy" ? 88 : st === "Warning" ? 68 : 42;

    GridState.assets[id] = {
      id,
      name: `Transformer ${id}`,
      location: loc,
      type: tp,
      capacity: cap,
      voltage: volt,
      score,
      status: st,
      temp: st === "Healthy" ? 64.0 : 82.0,
      thdi: st === "Healthy" ? 3.5 : 6.0,
      loadA: 240,
      voltageKv: 11.2,
      pf: 0.94,
      img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=90",
      history: { temp: [], voltage: [], current: [], thdi: [], pf: [] }
    };
    for (let i = 0; i < 25; i++) {
      GridState.assets[id].history.temp.push(GridState.assets[id].temp);
      GridState.assets[id].history.voltage.push(11.2);
      GridState.assets[id].history.current.push(240);
      GridState.assets[id].history.thdi.push(GridState.assets[id].thdi);
      GridState.assets[id].history.pf.push(0.94);
    }

    const tr = document.createElement("tr");
    tr.dataset.id = id;
    tr.dataset.location = loc;
    tr.dataset.type = tp;
    tr.dataset.score = score;
    tr.dataset.status = st;
    tr.innerHTML = `
      <td><input type="checkbox" class="row-check" aria-label="Select ${id}"></td>
      <td class="asset-id">${id}</td>
      <td>${loc}</td>
      <td>${tp}</td>
      <td class="score">${score}</td>
      <td><span class="status ${st.toLowerCase()}"><i></i>${st}</span></td>
      <td><svg class="spark" viewBox="0 0 80 24"><path d="M2 19 12 15 21 17 30 12 39 14 48 8 58 10 68 4 78 3"/></svg></td>
      <td><button class="row-open" aria-label="View ${id}">›</button></td>
    `;
    document.getElementById("assetRows")?.prepend(tr);
    assetRows.unshift(tr);

    tr.querySelector(".row-open")?.addEventListener("click", () => selectAsset(id));
    tr.addEventListener("dblclick", () => selectAsset(id));

    addAssetDialog?.close();
    e.currentTarget.reset();
    updateAssetSummaryCounts();
    filterAssetRows();
    notify(`Asset ${id} commissioned into SCADA network.`);
  });

  // Summary counts update
  function updateAssetSummaryCounts() {
    const list = Object.values(GridState.assets);
    const total = list.length;
    const healthy = list.filter(a => a.status === "Healthy").length;
    const warning = list.filter(a => a.status === "Warning").length;
    const critical = list.filter(a => a.status === "Critical").length;

    const cards = document.querySelectorAll("#asset-health .summary-card strong");
    if (cards.length >= 4) {
      cards[0].textContent = String(total).padStart(2, "0");
      cards[1].textContent = String(healthy).padStart(2, "0");
      cards[2].textContent = String(warning).padStart(2, "0");
      cards[3].textContent = String(critical).padStart(2, "0");
    }

    const overviewStats = document.querySelectorAll(".stats-grid .stat-card strong");
    if (overviewStats.length >= 4) {
      overviewStats[0].textContent = String(total).padStart(2, "0");
      overviewStats[1].textContent = String(healthy).padStart(2, "0");
      overviewStats[2].textContent = String(warning).padStart(2, "0");
      overviewStats[3].textContent = String(critical).padStart(2, "0");
    }
  }

  // Summary cards filter table
  document.querySelectorAll("#asset-health .summary-card").forEach((card, i) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const statuses = ["", "Healthy", "Warning", "Critical"];
      if (statusFilter) statusFilter.value = statuses[i];
      filterAssetRows();
    });
  });

  // Asset filtering and pagination
  let currentPage = 1;
  const PAGE_SIZE = 6;

  function filterAssetRows() {
    const q = assetSearch?.value.trim().toLowerCase() || "";
    const loc = locationFilter?.value || "";
    const st = statusFilter?.value || "";
    const tp = typeFilter?.value || "";
    const sort = sortFilter?.value || "default";

    let visible = assetRows.filter(row => {
      const matchText = row.textContent.toLowerCase().includes(q);
      const matchLoc = !loc || row.dataset.location.toLowerCase().includes(loc.toLowerCase());
      const matchSt = !st || row.dataset.status.toLowerCase() === st.toLowerCase();
      const matchTp = !tp || row.dataset.type.toLowerCase().includes(tp.toLowerCase());
      return matchText && matchLoc && matchSt && matchTp;
    });

    if (sort === "high") visible.sort((a, b) => Number(b.dataset.score) - Number(a.dataset.score));
    if (sort === "low") visible.sort((a, b) => Number(a.dataset.score) - Number(b.dataset.score));
    if (sort === "name") visible.sort((a, b) => a.dataset.id.localeCompare(b.dataset.id));

    const totalVisible = visible.length;
    const totalPages = Math.max(1, Math.ceil(totalVisible / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    const pageItems = visible.slice(start, end);

    assetRows.forEach(row => {
      row.hidden = !pageItems.includes(row);
    });

    const empty = document.getElementById("assetEmptyState");
    if (empty) empty.hidden = totalVisible !== 0;

    const countEl = document.getElementById("assetCount");
    if (countEl) countEl.textContent = `Showing ${Math.min(pageItems.length, totalVisible)} of ${totalVisible} assets`;

    // Pagination buttons state
    const prevBtn = document.getElementById("prevPage");
    const nextBtn = document.getElementById("nextPage");
    const pageOne = document.getElementById("pageOne");
    const pageTwo = document.getElementById("pageTwo");

    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    if (pageOne) {
      pageOne.classList.toggle("page-active", currentPage === 1);
      pageOne.textContent = "1";
    }
    if (pageTwo) {
      pageTwo.classList.toggle("page-active", currentPage === 2);
      pageTwo.hidden = totalPages < 2;
      pageTwo.textContent = "2";
    }
  }

  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      filterAssetRows();
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    currentPage++;
    filterAssetRows();
  });

  document.getElementById("pageOne")?.addEventListener("click", () => {
    currentPage = 1;
    filterAssetRows();
  });

  document.getElementById("pageTwo")?.addEventListener("click", () => {
    currentPage = 2;
    filterAssetRows();
  });

  [assetSearch, locationFilter, statusFilter, typeFilter, sortFilter].forEach(el => {
    el?.addEventListener(el.tagName === "INPUT" ? "input" : "change", () => {
      currentPage = 1;
      filterAssetRows();
    });
  });

  document.getElementById("clearFilters")?.addEventListener("click", () => {
    if (assetSearch) assetSearch.value = "";
    if (locationFilter) locationFilter.value = "";
    if (statusFilter) statusFilter.value = "";
    if (typeFilter) typeFilter.value = "";
    if (sortFilter) sortFilter.value = "default";
    currentPage = 1;
    filterAssetRows();
    notify("Asset filters reset.");
  });

  selectAllAssets?.addEventListener("change", e => {
    assetRows.filter(r => !r.hidden).forEach(r => {
      const chk = r.querySelector(".row-check");
      if (chk) chk.checked = e.target.checked;
    });
    notify(e.target.checked ? "All visible assets selected." : "Asset selection cleared.");
  });

  // Asset Context Menu button
  document.getElementById("assetMoreButton")?.addEventListener("click", e => {
    showContextMenu(e.currentTarget, [
      {
        label: "Export All Assets (CSV)",
        action: () => {
          const header = ["ID", "Location", "Type", "Capacity", "Voltage", "CHI Score", "Status"];
          const lines = Object.values(GridState.assets).map(a => [a.id, a.location, a.type, a.capacity, a.voltage, a.score, a.status]);
          const csv = [header, ...lines].map(l => l.map(csvEscape).join(",")).join("\r\n");
          downloadBlob("gridpulse-asset-registry.csv", csv);
          notify("Asset registry exported.");
        }
      },
      {
        label: "Recalculate All CHI Scores",
        action: () => {
          Object.values(GridState.assets).forEach(a => {
            a.score = Math.max(20, Math.min(99, Math.round(100 - (a.temp - 50) * 1.2 - a.thdi * 3)));
          });
          updateAssetSummaryCounts();
          filterAssetRows();
          notify("Composite Health Indexes recalculated via live neural model.");
        }
      },
      {
        label: "Compare Selected Assets",
        action: openAssetComparison
      }
    ]);
  });

  // Select Asset across entire platform
  function selectAsset(id) {
    const asset = GridState.assets[id];
    if (!asset) return;
    GridState.activeAssetId = id;

    // Telemetry section updates
    const nameEls = document.querySelectorAll("#assetSelect .asset-name");
    nameEls.forEach(el => {
      el.innerHTML = `<strong>${asset.id}</strong><small>${asset.location}</small>`;
    });

    const breadcrumb = document.querySelector("#telemetry .breadcrumb");
    if (breadcrumb) breadcrumb.innerHTML = `TELEMETRY <span>/</span> ${asset.id}`;

    const sidebarHead = document.querySelector(".asset-details .asset-heading");
    if (sidebarHead) {
      sidebarHead.innerHTML = `<div><h2>${asset.id}</h2><p>${asset.location}</p></div><span class="healthy-badge ${asset.status.toLowerCase()}"><i></i>${asset.status}</span>`;
    }

    const facts = document.querySelectorAll(".asset-facts strong");
    if (facts.length >= 4) {
      facts[0].textContent = asset.type;
      facts[1].textContent = asset.capacity;
      facts[2].textContent = asset.voltage;
      facts[3].textContent = asset.location;
    }

    // Asset Health detail column updates
    assetRows.forEach(r => r.classList.toggle("selected-row", r.dataset.id === id));
    const dtId = document.getElementById("detailId");
    const dtLoc = document.getElementById("detailLocation");
    const dtSc = document.getElementById("detailScore");
    const dtSt = document.getElementById("detailStatus");
    const dtImg = document.querySelector(".detail-photo img");

    if (dtId) dtId.textContent = asset.id;
    if (dtLoc) dtLoc.textContent = `${asset.location} Substation`;
    if (dtSc) dtSc.innerHTML = `${asset.score} <small>/ 100</small>`;
    if (dtSt) {
      dtSt.className = `status ${asset.status.toLowerCase()}`;
      dtSt.innerHTML = `<i></i>${asset.status}`;
    }
    if (dtImg && asset.img) dtImg.src = asset.img;

    const detailMetrics = document.querySelectorAll("#asset-health .detail-metrics strong");
    if (detailMetrics.length >= 3) {
      detailMetrics[0].innerHTML = `${asset.temp} °C <em class="${asset.temp > 75 ? "up" : "down"}">${asset.temp > 75 ? "↑" : "↓"}</em>`;
      detailMetrics[1].innerHTML = `${asset.thdi} % <em class="up">↑</em>`;
      detailMetrics[2].innerHTML = `${asset.pf} <em class="down">↓</em>`;
    }

    // Risk card title
    const riskTitle = document.getElementById("riskModalTitle");
    if (riskTitle) riskTitle.textContent = `Risk Factors — ${asset.id} (${asset.location})`;

    renderMainTelemetryChart();
    notify(`Asset ${asset.id} loaded (${asset.location} · CHI: ${asset.score}).`);
  }

  // Row open clicks
  document.querySelectorAll("#assetRows .row-open").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const tr = btn.closest("tr");
      if (tr?.dataset.id) selectAsset(tr.dataset.id);
    });
  });

  assetRows.forEach(tr => {
    tr.addEventListener("dblclick", () => {
      if (tr.dataset.id) selectAsset(tr.dataset.id);
    });
  });

  // Cycle previous / next asset in detail pane
  const assetIdList = () => Object.keys(GridState.assets);
  document.getElementById("previousAsset")?.addEventListener("click", () => {
    const list = assetIdList();
    const idx = list.indexOf(GridState.activeAssetId);
    selectAsset(list[(idx - 1 + list.length) % list.length]);
  });

  document.getElementById("nextAsset")?.addEventListener("click", () => {
    const list = assetIdList();
    const idx = list.indexOf(GridState.activeAssetId);
    selectAsset(list[(idx + 1) % list.length]);
  });

  document.getElementById("backAssets")?.addEventListener("click", () => {
    document.querySelector(".asset-list-area")?.scrollIntoView({ behavior: "smooth" });
  });

  // Risk Breakdown Modal
  const riskModal = document.getElementById("riskBreakdownModal");
  document.getElementById("viewRisks")?.addEventListener("click", () => {
    riskModal?.showModal();
  });
  document.getElementById("closeRiskModal")?.addEventListener("click", () => riskModal?.close());
  document.getElementById("dispatchMitigationOrder")?.addEventListener("click", () => {
    riskModal?.close();
    const workOrderDialog = document.getElementById("workOrderDialog");
    const assetSelect = workOrderDialog?.querySelector('select[name="asset"]');
    if (assetSelect) assetSelect.value = GridState.activeAssetId;
    workOrderDialog?.showModal();
    notify(`Work order form pre-filled for ${GridState.activeAssetId} risk mitigation.`);
  });

  // Expand topology modal
  document.getElementById("assetExpandTopology")?.addEventListener("click", () => {
    const modal = document.getElementById("routeModal");
    modal?.showModal();
  });

  // =========================================================================
  // 8. SECTION 4: ALERTS & EVENTS
  // =========================================================================
  const alertRows = [...document.querySelectorAll("#eventRows tr")];
  const severityFilter = document.getElementById("severityFilter");
  const periodFilter = document.getElementById("periodFilter");
  const eventSearch = document.getElementById("eventSearch");
  const selectAllAlerts = document.getElementById("selectAllAlerts");

  function filterAlerts() {
    const q = eventSearch?.value.trim().toLowerCase() || "";
    const sev = severityFilter?.value || "";

    let count = 0;
    alertRows.forEach(row => {
      const matchText = row.textContent.toLowerCase().includes(q);
      const matchSev = !sev || row.dataset.severity === sev;
      const match = matchText && matchSev;
      row.hidden = !match;
      if (match) count++;
    });

    const empty = document.getElementById("alertsEmptyState");
    if (empty) empty.hidden = count !== 0;

    const countEl = document.getElementById("eventCount");
    if (countEl) countEl.textContent = `Showing ${count} recent event${count === 1 ? "" : "s"}`;
  }

  eventSearch?.addEventListener("input", filterAlerts);
  severityFilter?.addEventListener("change", filterAlerts);
  periodFilter?.addEventListener("change", e => notify(`Alerts time period: ${e.target.value}`));

  document.getElementById("filterToggle")?.addEventListener("click", () => {
    severityFilter?.focus();
    notify("Use severity dropdown to filter alerts.");
  });

  selectAllAlerts?.addEventListener("change", e => {
    alertRows.filter(r => !r.hidden).forEach(r => {
      const chk = r.querySelector(".row-check");
      if (chk) chk.checked = e.target.checked;
    });
    notify(e.target.checked ? "All visible alerts selected." : "Alert selection cleared.");
  });

  document.getElementById("alertsInfoButton")?.addEventListener("click", () => {
    notify("Alerts & Events: Live automated SCADA monitoring across 8 regional substations.");
  });

  // Alert Context Menu button
  document.getElementById("alertsMoreButton")?.addEventListener("click", e => {
    showContextMenu(e.currentTarget, [
      {
        label: "Export Alerts (CSV)",
        action: exportAlertsCSV
      },
      {
        label: "Acknowledge All Visible",
        action: () => {
          alertRows.filter(r => !r.hidden).forEach(r => {
            const st = r.querySelector(".event-status");
            if (st) {
              st.textContent = "Acknowledged";
              st.classList.remove("new-status");
              r.dataset.status = "Acknowledged";
            }
          });
          notify("All visible alerts marked as Acknowledged.");
        }
      },
      {
        label: "Clear Resolved Alerts",
        action: () => {
          alertRows.filter(r => r.dataset.status === "Resolved").forEach(r => (r.hidden = true));
          filterAlerts();
          notify("Resolved alerts cleared from view.");
        }
      }
    ]);
  });

  function exportAlertsCSV() {
    const header = ["Time", "Asset", "Alert", "Parameter", "Severity", "Status"];
    const rows = alertRows.filter(r => !r.hidden).map(r => {
      const cells = [...r.cells];
      return [
        cells[1]?.innerText.trim(),
        r.dataset.asset || "",
        cells[3]?.innerText.replace(/\n/g, " ").trim(),
        cells[4]?.innerText.trim(),
        r.dataset.severity || "",
        r.dataset.status || ""
      ];
    });
    const csv = [header, ...rows].map(l => l.map(csvEscape).join(",")).join("\r\n");
    downloadBlob("gridpulse-alerts-export.csv", csv);
    notify("Alerts exported as CSV.");
  }
  document.getElementById("exportAlertsCsv")?.addEventListener("click", exportAlertsCSV);

  // Click row to show in alert detail pane
  alertRows.forEach(row => {
    row.addEventListener("click", e => {
      if (e.target.closest("button") || e.target.matches("input")) return;
      const assetId = row.dataset.asset || "TX-04";
      showAlertDetails(assetId, row);
    });

    row.querySelector(".event-more")?.addEventListener("click", e => {
      e.stopPropagation();
      showContextMenu(e.currentTarget, [
        {
          label: "Mark Acknowledged",
          action: () => {
            const s = row.querySelector(".event-status");
            if (s) {
              s.textContent = "Acknowledged";
              s.classList.remove("new-status");
              row.dataset.status = "Acknowledged";
            }
            notify(`${row.dataset.asset} marked Acknowledged.`);
          }
        },
        {
          label: "Mark Resolved",
          action: () => {
            const s = row.querySelector(".event-status");
            if (s) {
              s.textContent = "Resolved";
              s.classList.remove("new-status");
              row.dataset.status = "Resolved";
            }
            notify(`${row.dataset.asset} alert resolved.`);
          }
        },
        {
          label: "Create Work Order",
          action: () => {
            const orderDialog = document.getElementById("workOrderDialog");
            const select = orderDialog?.querySelector('select[name="asset"]');
            if (select) select.value = row.dataset.asset;
            orderDialog?.showModal();
          }
        }
      ]);
    });
  });

  function showAlertDetails(assetId, targetRow) {
    const asset = GridState.assets[assetId] || GridState.assets["TX-04"];
    alertRows.forEach(r => r.classList.toggle("critical-row", r === targetRow));

    const dtId = document.getElementById("alertDetailId");
    const dtLoc = document.getElementById("alertDetailLocation");
    const dtSt = document.getElementById("alertDetailStatus");
    const alTemp = document.getElementById("alertTemperatureValue");
    const alThdi = document.getElementById("alertThdiValue");
    const alLoad = document.getElementById("alertLoadValue");

    if (dtId) dtId.textContent = asset.id;
    if (dtLoc) dtLoc.textContent = `${asset.location} Substation`;
    if (dtSt) {
      dtSt.className = `status ${asset.status.toLowerCase()}`;
      dtSt.innerHTML = `<i></i>${asset.status}`;
    }
    if (alTemp) alTemp.innerHTML = `${asset.temp} °C <em class="up">↑</em>`;
    if (alThdi) alThdi.textContent = `${asset.thdi} %`;
    if (alLoad) alLoad.textContent = `${asset.loadA} A`;

    notify(`Loaded alert details for ${asset.id} (${asset.location}).`);
  }

  document.getElementById("openAsset")?.addEventListener("click", () => {
    const assetId = document.getElementById("alertDetailId")?.textContent || "TX-04";
    selectAsset(assetId);
    document.getElementById("asset-health")?.scrollIntoView({ behavior: "smooth" });
  });

  // Alerts topology zoom & locate
  let alertsZoom = 1;
  const alertsTopologySvg = document.querySelector("#alerts .topology-map svg");
  document.getElementById("alertsZoomIn")?.addEventListener("click", () => {
    alertsZoom = Math.min(alertsZoom + 0.15, 1.6);
    if (alertsTopologySvg) alertsTopologySvg.style.transform = `scale(${alertsZoom})`;
    notify("Alert topology zoomed in.");
  });

  document.getElementById("alertsZoomOut")?.addEventListener("click", () => {
    alertsZoom = Math.max(alertsZoom - 0.15, 0.85);
    if (alertsTopologySvg) alertsTopologySvg.style.transform = `scale(${alertsZoom})`;
    notify("Alert topology zoomed out.");
  });

  document.getElementById("alertsLocateMap")?.addEventListener("click", () => {
    alertsZoom = 1.15;
    if (alertsTopologySvg) alertsTopologySvg.style.transform = "scale(1.15)";
    notify("Target substation centered on alerts map.");
  });

  document.getElementById("alertsExpandTopology")?.addEventListener("click", () => {
    const modal = document.getElementById("routeModal");
    modal?.showModal();
  });

  // Summary cards filter alerts
  document.querySelectorAll("#alerts .summary-card").forEach((card, i) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const sevs = ["Critical", "Warning", "Normal", ""];
      if (severityFilter) severityFilter.value = sevs[i];
      filterAlerts();
    });
  });

  // =========================================================================
  // 9. SECTION 5: GRID REROUTE & AUTOMATED POWER FLOW
  // =========================================================================
  const simToggle = document.getElementById("simulationToggle");
  simToggle?.addEventListener("click", () => {
    GridState.config.simulationActive = !GridState.config.simulationActive;
    simToggle.classList.toggle("off", !GridState.config.simulationActive);
    const span = simToggle.querySelector("span");
    if (span) span.textContent = GridState.config.simulationActive ? "Simulation Mode" : "Simulation Paused";
    notify(GridState.config.simulationActive ? "Reroute simulation engine active." : "Reroute simulation paused.");
  });

  document.getElementById("regionSelect")?.addEventListener("change", e => {
    notify(`Switched topology focus to: ${e.target.value}`);
  });

  document.getElementById("mapLayer")?.addEventListener("change", e => {
    const layer = e.target.value;
    const panel = document.getElementById("rerouteTopologyPanel");
    panel?.classList.toggle("capacity-layer", layer === "Feeder capacity");
    panel?.classList.toggle("health-layer", layer === "Substation health");
    notify(`Reroute map layer: ${layer}`);
  });

  let rerouteZoom = 1;
  const rerouteSvg = document.querySelector(".large-topology");
  document.getElementById("rerouteZoomIn")?.addEventListener("click", () => {
    rerouteZoom = Math.min(rerouteZoom + 0.15, 1.7);
    if (rerouteSvg) rerouteSvg.style.transform = `scale(${rerouteZoom})`;
    notify(`Reroute topology zoom: ${Math.round(rerouteZoom * 100)}%`);
  });

  document.getElementById("rerouteZoomOut")?.addEventListener("click", () => {
    rerouteZoom = Math.max(rerouteZoom - 0.15, 0.85);
    if (rerouteSvg) rerouteSvg.style.transform = `scale(${rerouteZoom})`;
    notify(`Reroute topology zoom: ${Math.round(rerouteZoom * 100)}%`);
  });

  document.getElementById("rerouteLocateMap")?.addEventListener("click", () => {
    rerouteZoom = 1.15;
    if (rerouteSvg) rerouteSvg.style.transform = "scale(1.15)";
    notify("TX-04 and Feeder F-3 centered on topology canvas.");
  });

  document.getElementById("rerouteExpandMap")?.addEventListener("click", () => {
    const panel = document.getElementById("rerouteTopologyPanel");
    if (panel) {
      panel.classList.toggle("expanded");
      notify(panel.classList.contains("expanded") ? "Topology expanded." : "Topology restored.");
    }
  });

  // SIMULATE REROUTE BUTTON: Real-time animated load shifting
  document.getElementById("simulateButton")?.addEventListener("click", () => {
    GridState.reroutedState = !GridState.reroutedState;
    const btn = document.getElementById("simulateButton");
    const recTitle = document.getElementById("recommendationTitle");
    const reliability = document.getElementById("reliabilityValue");
    const reroutedLoadEl = document.getElementById("reroutedLoad");
    const loadReductionEl = document.getElementById("loadReduction");
    const panel = document.getElementById("rerouteTopologyPanel");

    if (GridState.reroutedState) {
      if (btn) btn.innerHTML = "Reset simulation <span>↺</span>";
      if (recTitle) recTitle.textContent = "Bypass active via Feeder F-3";
      if (reliability) reliability.textContent = "Optimized";
      if (reroutedLoadEl) reroutedLoadEl.textContent = "12.0 MW";
      if (loadReductionEl) loadReductionEl.textContent = "-48 %";
      panel?.classList.add("simulated", "flow-animating");
      playAlertChime(false);
      notify("Reroute executed: 12 MW transferred to Feeder F-3. TX-04 load stabilized.");
    } else {
      if (btn) btn.innerHTML = "Simulate reroute <span>→</span>";
      if (recTitle) recTitle.textContent = "Alternative path ready";
      if (reliability) reliability.textContent = "Stable";
      if (reroutedLoadEl) reroutedLoadEl.textContent = "0.0 MW";
      if (loadReductionEl) loadReductionEl.textContent = "0 %";
      panel?.classList.remove("simulated");
      notify("Reroute simulation reset to nominal grid topology.");
    }
  });

  // Path list interaction
  document.querySelectorAll(".path-list article").forEach((art, i) => {
    art.style.cursor = "pointer";
    art.addEventListener("click", () => {
      const details = [
        "TX-02 (Riverside Substation): 18 MW available spinning reserve.",
        "Feeder F-3: Direct 33kV bypass line to Lakeside industrial zone.",
        "TX-04 (Lakeside Substation): Load drops from 320A to 166A."
      ];
      notify(details[i]);
    });
  });

  // =========================================================================
  // 10. SECTION 6: MAINTENANCE & DISPATCH
  // =========================================================================
  const orderSearch = document.getElementById("orderSearch");
  const orderRows = [...document.querySelectorAll("#ordersBody tr")];
  const orderEmpty = document.getElementById("ordersEmptyState");
  const orderCount = document.getElementById("tableCount");
  let highPriorityOnly = false;

  // Tabs: Work orders, Spare assets, Dispatch queue
  document.querySelectorAll(".work-orders-panel .tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".work-orders-panel .tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      GridState.activeOrderTab = tab.dataset.tab;
      renderMaintenanceTab(tab.dataset.tab);
    });
  });

  function renderMaintenanceTab(tabName) {
    const table = document.querySelector(".orders-table");
    const thead = table?.querySelector("thead tr");
    const tbody = document.getElementById("ordersBody");
    if (!tbody || !thead) return;

    if (tabName === "Spare assets") {
      thead.innerHTML = `<th>Component</th><th>Part Number</th><th>Compatibility</th><th>In Stock</th><th>Bin Location</th><th>Action</th>`;
      tbody.innerHTML = `
        <tr><td><strong>Cooling Fan Unit (CF-200)</strong></td><td>CF-200-HV</td><td>TX-04, TX-05</td><td><span class="status healthy">3 Units</span></td><td>Bin B-14</td><td><button class="primary-btn req-btn" data-spare="CF-200">Requisition</button></td></tr>
        <tr><td><strong>132 kV High-Voltage Bushing</strong></td><td>BSH-132-K</td><td>TX-01, TX-04</td><td><span class="status healthy">2 Units</span></td><td>Bin A-08</td><td><button class="primary-btn req-btn" data-spare="BSH-132">Requisition</button></td></tr>
        <tr><td><strong>Buchholz Gas Accumulator Relay</strong></td><td>RLY-BCH-02</td><td>All Power TX</td><td><span class="status healthy">4 Units</span></td><td>Bin C-03</td><td><button class="primary-btn req-btn" data-spare="RLY-BCH">Requisition</button></td></tr>
        <tr><td><strong>Nitrile Gasket Overhaul Kit</strong></td><td>GSK-NIT-90</td><td>TX-02, TX-03, TX-04</td><td><span class="status warning">1 Kit</span></td><td>Bin D-12</td><td><button class="primary-btn req-btn" data-spare="GSK-NIT">Requisition</button></td></tr>
      `;
      tbody.querySelectorAll(".req-btn").forEach(b => {
        b.addEventListener("click", () => {
          document.getElementById("spareRequisitionModal")?.showModal();
        });
      });
      if (orderCount) orderCount.textContent = "Showing 4 spare components in central depot";
    } else if (tabName === "Dispatch queue") {
      thead.innerHTML = `<th>Crew ID</th><th>Lead Engineer</th><th>Vehicle</th><th>Target</th><th>Status</th><th>ETA</th><th>Action</th>`;
      tbody.innerHTML = `
        <tr><td><strong>CREW-ALPHA</strong></td><td>Rohan Sharma</td><td>Van 04 (DGA Lab)</td><td>TX-04 Lakeside</td><td><span class="status-pill in-progress">En Route</span></td><td>14 mins</td><td><button class="secondary-btn track-btn">Track GPS</button></td></tr>
        <tr><td><strong>CREW-BRAVO</strong></td><td>Priya Patel</td><td>Truck 12 (Rigging)</td><td>TX-02 Riverside</td><td><span class="status-pill pending">Standby</span></td><td>Available</td><td><button class="secondary-btn track-btn">Dispatch</button></td></tr>
        <tr><td><strong>RAPID-01</strong></td><td>Vikram Das</td><td>Unit 02 (Switching)</td><td>Central Depot</td><td><span class="status-pill completed">Ready</span></td><td>Available</td><td><button class="secondary-btn track-btn">Assign</button></td></tr>
      `;
      tbody.querySelectorAll(".track-btn").forEach(b => {
        b.addEventListener("click", () => {
          document.getElementById("routeModal")?.showModal();
        });
      });
      if (orderCount) orderCount.textContent = "Showing 3 field dispatch units";
    } else {
      thead.innerHTML = `
        <th class="check-cell"><input type="checkbox" id="selectAllOrders" aria-label="Select all work orders"></th>
        <th>ID</th><th>Asset</th><th>Type</th><th>Priority</th><th>Status</th><th>Scheduled Date</th><th>Actions</th>
      `;
      tbody.innerHTML = "";
      orderRows.forEach(r => tbody.appendChild(r));
      filterOrders();
    }
    notify(`Switched maintenance view to ${tabName}.`);
  }

  function filterOrders() {
    if (GridState.activeOrderTab !== "Work orders") return;
    const q = orderSearch?.value.trim().toLowerCase() || "";
    let visibleCount = 0;

    orderRows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const prio = !highPriorityOnly || row.dataset.priority === "High";
      const matches = text.includes(q) && prio;
      row.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (orderEmpty) orderEmpty.hidden = visibleCount !== 0;
    if (orderCount) orderCount.textContent = `Showing ${visibleCount} work orders`;
  }

  orderSearch?.addEventListener("input", filterOrders);

  document.getElementById("maintenanceFilterButton")?.addEventListener("click", e => {
    highPriorityOnly = !highPriorityOnly;
    e.currentTarget.classList.toggle("filter-active", highPriorityOnly);
    filterOrders();
    notify(highPriorityOnly ? "Filtered: High priority orders only." : "Maintenance filter cleared.");
  });

  document.getElementById("clearSearch")?.addEventListener("click", () => {
    if (orderSearch) orderSearch.value = "";
    highPriorityOnly = false;
    filterOrders();
    notify("Search reset.");
  });

  // Create Work Order Dialog
  const workOrderDialog = document.getElementById("workOrderDialog");
  document.getElementById("createWorkOrder")?.addEventListener("click", () => workOrderDialog?.showModal());
  document.getElementById("closeWorkOrderDialog")?.addEventListener("click", () => workOrderDialog?.close());

  document.getElementById("workOrderForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const id = `WO-${String(25 + orderRows.length).padStart(3, "0")}`;
    const asset = data.get("asset") || "TX-04";
    const type = data.get("type") || "Preventive Maintenance";
    const priority = data.get("priority") || "Medium";
    const date = data.get("date") || "2024-05-21";

    const tr = document.createElement("tr");
    tr.dataset.id = id;
    tr.dataset.asset = asset;
    tr.dataset.type = type;
    tr.dataset.priority = priority;
    tr.dataset.status = "Pending";
    tr.dataset.date = date;

    const prioCls = priority === "High" ? "priority-high" : priority === "Low" ? "priority-low" : "priority-medium";
    tr.innerHTML = `
      <td class="check-cell"><input type="checkbox" class="row-check" aria-label="Select ${id}"></td>
      <td><strong>${id}</strong></td>
      <td><strong>${asset}</strong><small>${asset} Substation</small></td>
      <td>${type}</td>
      <td><span class="status-pill ${prioCls}"><i></i>${priority}</span></td>
      <td><span class="status-pill pending"><i></i>Pending</span></td>
      <td>${date}</td>
      <td><button class="row-more" aria-label="Actions for ${id}">•••</button></td>
    `;

    document.getElementById("ordersBody")?.prepend(tr);
    orderRows.unshift(tr);

    tr.querySelector(".row-more")?.addEventListener("click", () => cycleOrderStatus(tr));

    workOrderDialog?.close();
    e.currentTarget.reset();
    filterOrders();

    const pendingEl = document.getElementById("pendingCount");
    if (pendingEl) pendingEl.textContent = String(Number(pendingEl.textContent) + 1).padStart(2, "0");

    notify(`Work Order ${id} created for ${asset}.`);
  });

  function cycleOrderStatus(row) {
    const cur = row.dataset.status;
    const next = cur === "Pending" ? "In Progress" : cur === "In Progress" ? "Completed" : "Pending";
    row.dataset.status = next;
    const cell = row.children[5];
    const cls = next === "Pending" ? "pending" : next === "Completed" ? "completed" : "in-progress";
    if (cell) cell.innerHTML = `<span class="status-pill ${cls}"><i></i>${next}</span>`;
    notify(`${row.dataset.id} status updated to ${next}.`);
  }

  document.querySelectorAll("#ordersBody .row-more").forEach(btn => {
    btn.addEventListener("click", () => cycleOrderStatus(btn.closest("tr")));
  });

  document.getElementById("maintenanceMoreButton")?.addEventListener("click", e => {
    showContextMenu(e.currentTarget, [
      {
        label: "Export Work Orders (CSV)",
        action: () => {
          const header = ["ID", "Asset", "Type", "Priority", "Status", "Date"];
          const lines = orderRows.filter(r => !r.hidden).map(r => [r.dataset.id, r.dataset.asset, r.dataset.type, r.dataset.priority, r.dataset.status, r.dataset.date]);
          const csv = [header, ...lines].map(l => l.map(csvEscape).join(",")).join("\r\n");
          downloadBlob("gridpulse-work-orders.csv", csv);
          notify("Work orders exported.");
        }
      },
      {
        label: "Filter High Priority Only",
        action: () => {
          highPriorityOnly = true;
          filterOrders();
        }
      },
      {
        label: "Clear All Filters",
        action: () => {
          highPriorityOnly = false;
          if (orderSearch) orderSearch.value = "";
          filterOrders();
        }
      }
    ]);
  });

  // Maintenance bottom card buttons
  const addEngineerDialog = document.getElementById("addEngineerDialog");
  document.getElementById("addEngineer")?.addEventListener("click", () => addEngineerDialog?.showModal());
  document.getElementById("closeEngineerDialog")?.addEventListener("click", () => addEngineerDialog?.close());
  document.getElementById("addEngineerForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const eng = data.get("engineer")?.split("(")[0].trim() || "Field Engineer";
    const sub = data.get("substation") || "Lakeside Substation";
    addEngineerDialog?.close();
    notify(`${eng} dispatched to ${sub}.`);
  });

  // Maintenance schedule modal
  const calendarModal = document.getElementById("calendarModal");
  document.getElementById("scheduleButton")?.addEventListener("click", () => calendarModal?.showModal());
  document.getElementById("closeCalendarModal")?.addEventListener("click", () => calendarModal?.close());

  // Maintenance location modal
  const routeModal = document.getElementById("routeModal");
  document.getElementById("locationButton")?.addEventListener("click", () => routeModal?.showModal());
  document.getElementById("closeRouteModal")?.addEventListener("click", () => routeModal?.close());
  document.getElementById("sendRouteToGPS")?.addEventListener("click", () => {
    routeModal?.close();
    notify("GPS dispatch coordinates sent to Van 04 terminal.");
  });

  // Maintenance right column buttons
  document.getElementById("assetDetailsButton")?.addEventListener("click", () => {
    document.getElementById("asset-health")?.scrollIntoView({ behavior: "smooth" });
    selectAsset("TX-04");
  });

  document.getElementById("recommendedAction")?.addEventListener("click", () => {
    riskModal?.showModal();
  });

  // Spare requisition modal
  const spareModal = document.getElementById("spareRequisitionModal");
  document.getElementById("spareButton")?.addEventListener("click", () => spareModal?.showModal());
  document.getElementById("closeSpareModal")?.addEventListener("click", () => spareModal?.close());
  document.getElementById("spareRequisitionForm")?.addEventListener("submit", e => {
    e.preventDefault();
    spareModal?.close();
    notify("Cooling Fan Unit (CF-200) requisition ticket submitted to Central Depot.");
  });

  // =========================================================================
  // 11. SECTION 7: REPORTS & DATA EXPORT
  // =========================================================================
  const reportSearch = document.getElementById("reportSearch");
  const reportFilter = document.getElementById("reportFilter");
  const reportRows = [...document.querySelectorAll("#reportsBody tr")];
  const reportEmpty = document.getElementById("reportsEmptyState");
  let completedOnly = false;

  function filterReports() {
    const q = reportSearch?.value.trim().toLowerCase() || "";
    let count = 0;
    reportRows.forEach(row => {
      const matchText = row.textContent.toLowerCase().includes(q);
      const matchComp = !completedOnly || row.querySelector(".completed-pill");
      const match = matchText && matchComp;
      row.hidden = !match;
      if (match) count++;
    });
    if (reportEmpty) reportEmpty.hidden = count !== 0;
  }

  reportSearch?.addEventListener("input", filterReports);
  reportFilter?.addEventListener("click", () => {
    completedOnly = !completedOnly;
    filterReports();
    notify(completedOnly ? "Showing completed reports only." : "Reports filter reset.");
  });

  function exportReport(name, type = "CSV") {
    const asset = GridState.assets[GridState.activeAssetId];
    if (type === "PDF") {
      const text = `
GRIDPULSE UNIFIED REPORT: ${name.toUpperCase()}
Generated on: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
Operations Shift: ${GridState.config.activeShift} Shift
Target Asset: ${asset.id} (${asset.location})
Composite Health Index: ${asset.score} / 100 [${asset.status}]
Operating Temp: ${asset.temp} °C
Harmonic THDi: ${asset.thdi} %
Active Load: ${asset.loadA} A
Power Factor: ${asset.pf}
=========================================================
Telemetry samples verified by GridPulse SCADA Controller.
      `.trim();
      downloadBlob(`${name.toLowerCase().replace(/\s+/g, "-")}.txt`, text, "text/plain;charset=utf-8;");
      notify(`Report summary downloaded for ${name}.`);
    } else {
      const header = ["Report Name", "Asset", "Status", "Timestamp", "Metric", "Value"];
      const rows = [
        [name, asset.id, asset.status, "May 20, 2024", "Temperature", `${asset.temp} °C`],
        [name, asset.id, asset.status, "May 20, 2024", "THDi", `${asset.thdi} %`],
        [name, asset.id, asset.status, "May 20, 2024", "Current", `${asset.loadA} A`],
        [name, asset.id, asset.status, "May 20, 2024", "Voltage", `${asset.voltageKv} kV`]
      ];
      const csv = [header, ...rows].map(l => l.map(csvEscape).join(",")).join("\r\n");
      downloadBlob(`${name.toLowerCase().replace(/\s+/g, "-")}.csv`, csv);
      notify(`Exported ${name} as CSV.`);
    }
  }

  document.querySelectorAll(".download-icon").forEach(btn => {
    btn.addEventListener("click", () => {
      const tr = btn.closest("tr");
      exportReport(tr.dataset.report, tr.dataset.type);
    });
  });

  document.querySelectorAll(".download-report").forEach(btn => {
    btn.addEventListener("click", () => {
      exportReport(btn.dataset.reportName, btn.dataset.type);
    });
  });

  // Report Generator Dialog
  const reportDialog = document.getElementById("reportDialog");
  document.getElementById("generateReport")?.addEventListener("click", () => reportDialog?.showModal());
  document.getElementById("closeReportDialog")?.addEventListener("click", () => reportDialog?.close());

  document.getElementById("reportForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("report") || "Monthly Grid Health Report";
    const format = data.get("format") || "PDF";
    const loc = data.get("location") || "All Locations";

    const tr = document.createElement("tr");
    tr.dataset.report = name;
    tr.dataset.type = format;
    tr.dataset.range = "May 14 – May 20, 2024";
    tr.dataset.generated = "May 20, 2024";
    tr.innerHTML = `
      <td>${name}</td>
      <td>${format}</td>
      <td>May 14 – May 20, 2024</td>
      <td>May 20, 2024</td>
      <td><span class="completed-pill"><i>✓</i>Completed</span></td>
      <td>
        <button class="download-icon" aria-label="Download ${name}"><svg viewBox="0 0 24 24"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg></button>
        <button class="report-more" aria-label="More actions">•••</button>
      </td>
    `;

    document.getElementById("reportsBody")?.prepend(tr);
    reportRows.unshift(tr);

    tr.querySelector(".download-icon")?.addEventListener("click", () => exportReport(name, format));

    reportDialog?.close();
    e.currentTarget.reset();
    filterReports();
    exportReport(name, format);
  });

  // Reports More Options button
  document.getElementById("reportsMoreButton")?.addEventListener("click", e => {
    showContextMenu(e.currentTarget, [
      {
        label: "Export Performance Metrics (CSV)",
        action: () => {
          const header = ["Location", "Metric", "Value", "Date"];
          const lines = [
            ["Lakeside Region", "Total Load", `${GridState.gridLoad.total} MW`, "May 20, 2024"],
            ["North Substation", "Feeder Load", `${GridState.gridLoad.north} MW`, "May 20, 2024"],
            ["West Feeder", "Feeder Load", `${GridState.gridLoad.west} MW`, "May 20, 2024"],
            ["East Feeder", "Feeder Load", `${GridState.gridLoad.east} MW`, "May 20, 2024"]
          ];
          const csv = [header, ...lines].map(l => l.map(csvEscape).join(",")).join("\r\n");
          downloadBlob("gridpulse-performance-metrics.csv", csv);
          notify("Grid performance metrics exported.");
        }
      },
      {
        label: "Clear Reports Filter",
        action: () => {
          completedOnly = false;
          if (reportSearch) reportSearch.value = "";
          filterReports();
          notify("Reports filter reset.");
        }
      }
    ]);
  });

  document.querySelectorAll(".report-more").forEach(btn => {
    btn.addEventListener("click", e => {
      const tr = btn.closest("tr");
      const name = tr?.dataset.report || "Report";
      const type = tr?.dataset.type || "PDF";
      showContextMenu(e.currentTarget, [
        {
          label: `Download ${type}`,
          action: () => exportReport(name, type)
        },
        {
          label: "Email to Operations Team",
          action: () => notify(`Report “${name}” sent to operations distribution list.`)
        },
        {
          label: "Copy Share Link",
          action: () => {
            navigator.clipboard?.writeText(window.location.href);
            notify("Secure report link copied.");
          }
        }
      ]);
    });
  });

  // Format Dialog
  const formatDialog = document.getElementById("formatDialog");
  let quickExportName = "Telemetry Data";

  document.querySelectorAll(".export-option").forEach(btn => {
    btn.addEventListener("click", () => {
      quickExportName = btn.dataset.export || "Telemetry Data";
      const title = document.getElementById("formatTitle");
      if (title) title.textContent = quickExportName;
      formatDialog?.showModal();
    });
  });
  document.getElementById("closeFormatDialog")?.addEventListener("click", () => formatDialog?.close());

  document.querySelectorAll("[data-format-choice]").forEach(btn => {
    btn.addEventListener("click", () => {
      exportReport(quickExportName, btn.dataset.formatChoice);
      formatDialog?.close();
    });
  });

  document.getElementById("viewAllSummaries")?.addEventListener("click", () => {
    document.querySelector(".reports-table-panel")?.scrollIntoView({ behavior: "smooth" });
  });

  // Reports Performance Chart Metric Switcher
  const metricSelect = document.getElementById("metricSelect");
  metricSelect?.addEventListener("change", () => {
    renderPerformanceChart();
    notify(`Performance chart series switched to: ${metricSelect.value}`);
  });

  document.getElementById("reportsLocationSelect")?.addEventListener("change", e => {
    notify(`Filtered performance overview for ${e.target.value}.`);
  });

  document.getElementById("dateRange")?.addEventListener("click", () => {
    document.getElementById("datePickerModal")?.showModal();
  });

  // Location Map zoom controls in Reports
  let reportsMapZoom = 1;
  const reportsMapSvg = document.querySelector("#mapArt > svg");
  document.getElementById("reportsZoomIn")?.addEventListener("click", () => {
    reportsMapZoom = Math.min(reportsMapZoom + 0.15, 1.6);
    if (reportsMapSvg) reportsMapSvg.style.transform = `scale(${reportsMapZoom})`;
    notify("Location map zoomed in.");
  });

  document.getElementById("reportsZoomOut")?.addEventListener("click", () => {
    reportsMapZoom = Math.max(reportsMapZoom - 0.15, 0.9);
    if (reportsMapSvg) reportsMapSvg.style.transform = `scale(${reportsMapZoom})`;
    notify("Location map zoomed out.");
  });

  document.getElementById("reportsMapLocate")?.addEventListener("click", () => {
    reportsMapZoom = 1;
    if (reportsMapSvg) reportsMapSvg.style.transform = "scale(1)";
    notify("Map centered on Lakeside Substation.");
  });

  const mapArt = document.getElementById("mapArt");
  document.getElementById("reportsMapExpand")?.addEventListener("click", () => {
    if (mapArt) {
      const isExp = mapArt.style.height === "450px";
      mapArt.style.height = isExp ? "" : "450px";
      notify(isExp ? "Map view restored." : "Map view expanded.");
    }
  });

  document.getElementById("mapLocation")?.addEventListener("change", e => {
    const label = document.querySelector(".label-lakeside");
    if (label) label.innerHTML = e.target.value.replace(" ", "<br>");
    notify(`Map location updated to ${e.target.value}.`);
  });

  // Interactive mouse tracking over Performance Chart
  const perfChartSvg = document.getElementById("performanceChart");
  const perfHoverLine = document.getElementById("hoverLine");
  const perfHoverDot = document.getElementById("hoverDot");
  const reportsTooltipVal = document.getElementById("reportsTooltipValue");

  perfChartSvg?.addEventListener("mousemove", e => {
    const rect = perfChartSvg.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const svgX = Math.round(xRatio * 820);

    const baseMw = GridState.gridLoad.total;
    const currentMw = Math.round((baseMw + (Math.sin(xRatio * 8) * 4) + (Math.random() - 0.5)) * 10) / 10;
    const y = Math.round(165 - (currentMw / 50) * 165);

    if (perfHoverLine) {
      perfHoverLine.setAttribute("x1", svgX);
      perfHoverLine.setAttribute("x2", svgX);
    }
    if (perfHoverDot) {
      perfHoverDot.setAttribute("cx", svgX);
      perfHoverDot.setAttribute("cy", y);
    }
    if (reportsTooltipVal) {
      const metric = metricSelect?.value || "Load (MW)";
      if (metric.includes("Voltage")) {
        reportsTooltipVal.textContent = "132 kV";
      } else if (metric.includes("Current")) {
        reportsTooltipVal.textContent = "320 A";
      } else {
        reportsTooltipVal.textContent = `${currentMw} MW`;
      }
    }
  });

  // =========================================================================
  // 12. FLOATING CONTEXT MENU HELPER
  // =========================================================================
  const contextMenu = document.getElementById("universalContextMenu");
  const contextMenuItems = document.getElementById("contextMenuItems");

  function showContextMenu(anchorEl, items) {
    if (!contextMenu || !contextMenuItems) return;
    contextMenuItems.innerHTML = items
      .map(it => `<button type="button" class="popover-item">${it.label}</button>`)
      .join("");

    const rect = anchorEl.getBoundingClientRect();
    contextMenu.style.top = `${Math.min(window.innerHeight - 200, rect.bottom + 4)}px`;
    contextMenu.style.left = `${Math.min(window.innerWidth - 220, rect.left)}px`;
    contextMenu.hidden = false;

    contextMenuItems.querySelectorAll(".popover-item").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        contextMenu.hidden = true;
        items[i].action();
      });
    });
  }

  document.addEventListener("click", e => {
    if (contextMenu && !contextMenu.hidden && !e.target.closest("#universalContextMenu") && !e.target.closest(".more-button, .event-more, .row-more, .report-more")) {
      contextMenu.hidden = true;
    }
    if (assetPickerPopover && !assetPickerPopover.hidden && !e.target.closest("#assetPickerPopover") && !e.target.closest("#assetSelect")) {
      assetPickerPopover.hidden = true;
    }
  });

  // =========================================================================
  // 13. REAL-TIME RENDERING ENGINE: CHARTS, VALUES & SVGs
  // =========================================================================

  function getParamHistory(asset, param) {
    if (param === "Voltage") return asset.history.voltage;
    if (param === "Current") return asset.history.current;
    if (param === "THDi") return asset.history.thdi;
    if (param === "Power Factor") return asset.history.pf;
    return asset.history.temp;
  }

  function computeChartY(val, param) {
    // chart height is 150 (0 to 150)
    if (param === "Voltage") {
      // 0 to 15 kV
      const ratio = Math.max(0, Math.min(1, val / 15));
      return Math.round(150 - ratio * 140);
    }
    if (param === "Current") {
      // 0 to 500 A
      const ratio = Math.max(0, Math.min(1, val / 500));
      return Math.round(150 - ratio * 140);
    }
    if (param === "THDi") {
      // 0 to 12%
      const ratio = Math.max(0, Math.min(1, val / 12));
      return Math.round(150 - ratio * 140);
    }
    if (param === "Power Factor") {
      // 0.80 to 1.0
      const ratio = Math.max(0, Math.min(1, (val - 0.8) / 0.2));
      return Math.round(150 - ratio * 140);
    }
    // Temperature: 0 to 120 °C
    const ratio = Math.max(0, Math.min(1, val / 120));
    return Math.round(150 - ratio * 140);
  }

  function formatParamValue(val, param) {
    if (param === "Voltage") return `${val} kV`;
    if (param === "Current") return `${val} A`;
    if (param === "THDi") return `${val} %`;
    if (param === "Power Factor") return `${val}`;
    return `${val} °C`;
  }

  // Render Telemetry Main Chart SVG
  function renderMainTelemetryChart() {
    const asset = GridState.assets[GridState.activeAssetId];
    if (!asset) return;

    const series = getParamHistory(asset, GridState.activeParameter);
    if (!series || series.length < 2) return;

    const chartLine = document.querySelector("#telemetry .chart-line");
    const chartArea = document.querySelector("#telemetry .chart-area");
    const pointEl = document.querySelector("#telemetry .chart-point");
    const crosshairEl = document.querySelector("#telemetry .chart-crosshair");
    const tooltipEl = document.getElementById("tooltipValue");

    const totalWidth = 850;
    const step = totalWidth / (series.length - 1);

    const coords = series.map((val, idx) => {
      const x = Math.round(idx * step);
      const y = computeChartY(val, GridState.activeParameter);
      return { x, y };
    });

    const dLine = coords.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x} ${pt.y}`).join(" ");
    const dArea = `${dLine} V150 H0 Z`;

    if (chartLine) chartLine.setAttribute("d", dLine);
    if (chartArea) {
      if (GridState.chartMode === "Line") {
        chartArea.setAttribute("d", "");
      } else {
        chartArea.setAttribute("d", dArea);
      }
    }

    const latest = coords[coords.length - 1];
    const latestVal = series[series.length - 1];

    if (pointEl) {
      pointEl.setAttribute("cx", latest.x);
      pointEl.setAttribute("cy", latest.y);
    }
    if (crosshairEl) {
      crosshairEl.setAttribute("x1", latest.x);
      crosshairEl.setAttribute("x2", latest.x);
    }
    if (tooltipEl) {
      tooltipEl.textContent = formatParamValue(latestVal, GridState.activeParameter);
    }
  }

  // Render Mini Sparklines in Telemetry Metric Cards
  function renderMetricCardSparklines(asset) {
    const cards = document.querySelectorAll("#telemetry .metric-card");
    cards.forEach(card => {
      const metric = card.dataset.metric;
      const history = getParamHistory(asset, metric);
      if (!history || history.length < 2) return;

      const path = card.querySelector(".mini-chart path");
      if (!path) return;

      const w = 180;
      const h = 42;
      const step = w / (history.length - 1);
      const d = history
        .map((v, i) => {
          const x = Math.round(i * step);
          const y = Math.round(h - (Math.max(0, Math.min(1, v / (metric === "Temperature" ? 100 : metric === "Current" ? 400 : 15))) * 36 + 3));
          return `${i === 0 ? "M" : "L"}${x} ${y}`;
        })
        .join(" ");

      path.setAttribute("d", d);
    });
  }

  // Render Reports Performance Multi-Series Chart
  function renderPerformanceChart() {
    const totalLine = document.getElementById("totalLine");
    const totalArea = document.getElementById("totalArea");
    const northLine = document.getElementById("northLine");
    const westLine = document.getElementById("westLine");
    const eastLine = document.getElementById("eastLine");

    const baseMw = GridState.gridLoad.total;
    const w = 820;
    const pointsCount = 15;
    const step = w / (pointsCount - 1);

    const makeSeriesPath = (base, amp, freq, offset) => {
      const pts = [];
      for (let i = 0; i < pointsCount; i++) {
        const x = Math.round(i * step);
        const noise = Math.sin(i * freq + offset) * amp + (Math.random() - 0.5) * 1.2;
        const val = Math.max(5, base + noise);
        const y = Math.round(165 - (val / 55) * 165);
        pts.push({ x, y });
      }
      return pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
    };

    const dTotal = makeSeriesPath(baseMw, 5, 0.5, 0.4);
    const dNorth = makeSeriesPath(GridState.gridLoad.north, 2.5, 0.6, 1.2);
    const dWest = makeSeriesPath(GridState.gridLoad.west, 2.0, 0.4, 2.5);
    const dEast = makeSeriesPath(GridState.gridLoad.east, 2.2, 0.5, 0.8);

    if (totalLine) totalLine.setAttribute("d", dTotal);
    if (totalArea) totalArea.setAttribute("d", dTotal + " V165 H0 Z");
    if (northLine) northLine.setAttribute("d", dNorth);
    if (westLine) westLine.setAttribute("d", dWest);
    if (eastLine) eastLine.setAttribute("d", dEast);
  }

  // =========================================================================
  // 14. REAL-TIME TICK ENGINE (LIVE DATA STREAM SIMULATOR)
  // =========================================================================
  let realtimeTimer = null;

  function runRealtimeTick() {
    if (GridState.config.tickIntervalMs <= 0) return;

    // 1. Increment operational telemetry records
    GridState.telemetryRecords += Math.floor(Math.random() * 24 + 12);
    const recEl = document.querySelector("#reports .summary-grid article:nth-child(2) strong");
    if (recEl) {
      recEl.textContent = `${(GridState.telemetryRecords / 1000000).toFixed(2)}M`;
    }

    // 2. Fluctuate grid loads
    const loadNoise = (Math.random() - 0.5) * 0.4;
    GridState.gridLoad.total = Math.round((GridState.gridLoad.total + loadNoise) * 10) / 10;
    GridState.gridLoad.north = Math.round((GridState.gridLoad.north + (Math.random() - 0.5) * 0.2) * 10) / 10;
    GridState.gridLoad.west = Math.round((GridState.gridLoad.west + (Math.random() - 0.5) * 0.2) * 10) / 10;
    GridState.gridLoad.east = Math.round((GridState.gridLoad.east + (Math.random() - 0.5) * 0.2) * 10) / 10;

    // 3. Fluctuate each asset's physical parameters
    Object.values(GridState.assets).forEach(asset => {
      const tDrift = (Math.random() - 0.5) * 0.4;
      const vDrift = (Math.random() - 0.5) * 0.04;
      const cDrift = Math.round((Math.random() - 0.5) * 4);
      const hDrift = (Math.random() - 0.5) * 0.06;
      const pfDrift = (Math.random() - 0.5) * 0.005;

      asset.temp = Math.round(Math.max(45, Math.min(98, asset.temp + tDrift)) * 10) / 10;
      asset.voltageKv = Math.round(Math.max(9, Math.min(13.5, asset.voltageKv + vDrift)) * 100) / 100;
      asset.loadA = Math.max(100, Math.min(480, asset.loadA + cDrift));
      asset.thdi = Math.round(Math.max(2.0, Math.min(10.5, asset.thdi + hDrift)) * 10) / 10;
      asset.pf = Math.round(Math.max(0.75, Math.min(0.99, asset.pf + pfDrift)) * 100) / 100;

      // Append to sliding window (keep last 30 samples)
      asset.history.temp.push(asset.temp);
      if (asset.history.temp.length > 30) asset.history.temp.shift();

      asset.history.voltage.push(asset.voltageKv);
      if (asset.history.voltage.length > 30) asset.history.voltage.shift();

      asset.history.current.push(asset.loadA);
      if (asset.history.current.length > 30) asset.history.current.shift();

      asset.history.thdi.push(asset.thdi);
      if (asset.history.thdi.length > 30) asset.history.thdi.shift();

      asset.history.pf.push(asset.pf);
      if (asset.history.pf.length > 30) asset.history.pf.shift();

      // Recalculate dynamic status
      if (asset.temp >= GridState.config.tempLimit || asset.thdi >= GridState.config.thdiLimit) {
        asset.status = "Critical";
        asset.score = Math.max(25, Math.min(50, Math.round(90 - (asset.temp - 60) * 1.5 - asset.thdi * 4)));
      } else if (asset.temp >= 75 || asset.thdi >= 5.0) {
        asset.status = "Warning";
        asset.score = Math.max(55, Math.min(79, Math.round(92 - (asset.temp - 60) * 1.2 - asset.thdi * 2)));
      } else {
        asset.status = "Healthy";
        asset.score = Math.max(80, Math.min(98, Math.round(98 - (asset.temp - 50) * 0.6)));
      }
    });

    // 4. Update Overview section (TX-04 live panel)
    const tx4 = GridState.assets["TX-04"];
    const chiValEl = document.querySelector(".transformer-info .chi-value");
    if (chiValEl) {
      chiValEl.innerHTML = `${tx4.score}<span>/ 100</span><span class="warning-tag ${tx4.status.toLowerCase()}"><i></i> ${tx4.status}</span>`;
    }

    const overviewMetrics = document.querySelectorAll(".transformer-info .detail-list strong");
    if (overviewMetrics.length >= 4) {
      overviewMetrics[0].innerHTML = `${tx4.temp} °C <i>${tx4.temp > 75 ? "↑" : "↓"}</i>`;
      overviewMetrics[1].innerHTML = `${tx4.thdi} % <i>↑</i>`;
      overviewMetrics[2].innerHTML = `${Math.round((tx4.loadA / 400) * 100)} %`;
      const now = new Date();
      overviewMetrics[3].textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    }

    // Sparkline in overview panel
    const overviewSparkPath = document.querySelector(".transformer-panel .spark-path");
    const overviewSparkFill = document.querySelector(".transformer-panel .spark-fill");
    if (overviewSparkPath && tx4.history.temp.length > 2) {
      const step = 236 / (tx4.history.temp.length - 1);
      const d = tx4.history.temp
        .map((t, idx) => {
          const x = Math.round(idx * step + 2);
          const y = Math.round(40 - ((t - 50) / 50) * 36);
          return `${idx === 0 ? "M" : "L"}${x} ${y}`;
        })
        .join(" ");
      overviewSparkPath.setAttribute("d", d);
      if (overviewSparkFill) overviewSparkFill.setAttribute("d", `${d} V44 H2 Z`);
    }

    // 5. Update Telemetry Section live metric cards
    const activeAsset = GridState.assets[GridState.activeAssetId];
    if (activeAsset) {
      const metricValues = document.querySelectorAll("#telemetry .metric-card .metric-value");
      if (metricValues.length >= 4) {
        metricValues[0].innerHTML = `${activeAsset.temp} °C <span class="change ${activeAsset.temp > 75 ? "up" : "down"}">${activeAsset.temp > 75 ? "↑ +12%" : "↓ -2%"}</span>`;
        metricValues[1].innerHTML = `${activeAsset.voltageKv} kV <span class="change down">↓ -2%</span>`;
        metricValues[2].innerHTML = `${activeAsset.loadA} A <span class="change up">↑ +6%</span>`;
        metricValues[3].innerHTML = `${activeAsset.thdi} % <span class="change up">↑ +1.4%</span>`;

        // Subtle flash animation on active card
        metricValues.forEach(m => m.classList.add("flash-tick"));
        setTimeout(() => metricValues.forEach(m => m.classList.remove("flash-tick")), 600);
      }

      renderMetricCardSparklines(activeAsset);
      renderMainTelemetryChart();
    }

    // 6. Update Asset Health table row values
    assetRows.forEach(tr => {
      const id = tr.dataset.id;
      const a = GridState.assets[id];
      if (a) {
        tr.dataset.score = a.score;
        tr.dataset.status = a.status;
        const scoreCell = tr.querySelector(".score");
        const statusCell = tr.querySelector(".status");
        if (scoreCell) scoreCell.textContent = a.score;
        if (statusCell) {
          statusCell.className = `status ${a.status.toLowerCase()}`;
          statusCell.innerHTML = `<i></i>${a.status}`;
        }
      }
    });

    // 7. Update Reroute live simulation metrics
    if (GridState.config.simulationActive) {
      const reroutedMwEl = document.getElementById("reroutedLoad");
      if (reroutedMwEl && GridState.reroutedState) {
        reroutedMwEl.textContent = `${(12.0 + (Math.random() - 0.5) * 0.3).toFixed(1)} MW`;
      }
    }

    // 8. Update Reports Performance Chart
    renderPerformanceChart();
  }

  function restartRealtimeEngine() {
    if (realtimeTimer) clearInterval(realtimeTimer);
    if (GridState.config.tickIntervalMs > 0) {
      realtimeTimer = setInterval(runRealtimeTick, GridState.config.tickIntervalMs);
    }
  }

  // Initialize Real-Time Engine
  restartRealtimeEngine();
  renderPerformanceChart();
  selectAsset("TX-04");

  // Initial toast announcement
  notify("GridPulse Unified Platform active. Real-time telemetry streaming.", "healthy");
});
