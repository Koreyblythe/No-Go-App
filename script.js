document.addEventListener("DOMContentLoaded", () => {
  const identityForm = document.getElementById("identity-form");
  const introPage = document.getElementById("intro-page");
  const mainApp = document.getElementById("main-app");

  let userLocation = null;

  function getValue(name) {
    const skip = document.querySelector(`input[name="${name}-skip"]`).checked;
    return skip ? "N/A" : document.querySelector(`input[name="${name}"]`).value || "N/A";
  }

  function showMainApp() {
    introPage.style.display = "none";
    mainApp.style.display = "block";

    const identity = JSON.parse(localStorage.getItem("identity"));

    document.getElementById("user-race").textContent = identity.race;
    document.getElementById("user-gender").textContent = identity.gender;
    document.getElementById("user-orientation").textContent = identity.orientation;
    document.getElementById("user-politics").textContent = identity.politics;

    initMap();
  }

  if (identityForm) {
    identityForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const identity = {
        race: getValue("race"),
        gender: getValue("gender"),
        orientation: getValue("orientation"),
        politics: getValue("politics"),
      };

      localStorage.setItem("identity", JSON.stringify(identity));
      showMainApp();
    });
  }

  const sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      document.getElementById("sidebar").classList.toggle("open");
    });
  }

  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("identity");
      location.reload();
    });
  }

  const reportForm = document.getElementById("user-report-form");
  const submitStatus = document.getElementById("submit-status");

  if (reportForm) {
    reportForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const formData = new FormData(reportForm);
      const location = formData.get("location");
      const description = formData.get("description");

      console.log("User submitted report:", { location, description });

      submitStatus.textContent = "Report submitted. Thank you.";
      reportForm.reset();
    });
  }

  async function fetchAirtableRecords() {
    const allRecords = [];
    let offset = "";
    const baseId = "appCgfEfLOlcf3RbH";
    const tableName = "Police%20Violence%20Data";
    const token = "patEEWO4nELIhjRsJ.e44b3ecaea0ae8e9fbbfb5b151db087cc5834b489001dd97a4a190a6e39c98a6";

    try {
      do {
        const url = `https://api.airtable.com/v0/${baseId}/${tableName}?pageSize=100${offset ? `&offset=${offset}` : ""}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        allRecords.push(...data.records);
        offset = data.offset;
      } while (offset);
    } catch (error) {
      console.error("Error fetching from Airtable:", error);
    }

    return allRecords;
  }

  async function initMap() {
    const map = L.map("map", {
      maxBounds: [
        [49.5, -125],
        [24.5, -66.5],
      ],
      maxBoundsViscosity: 1.0,
    });

    const defaultCenter = [39.5, -98.35];
    const defaultZoom = 5;
    map.setView(userLocation || defaultCenter, userLocation ? 10 : defaultZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    if (userLocation) {
      L.marker(userLocation).addTo(map).bindPopup("You are here").openPopup();
    }

    const records = await fetchAirtableRecords();

    const heatPoints = [];

    records.forEach((record) => {
      const fields = record.fields;
      const lat = fields.latitude;
      const lon = fields.longitude;

      if (lat && lon) {
        heatPoints.push([lat, lon, 0.5]);
      }
    });

    if (heatPoints.length > 0) {
      L.heatLayer(heatPoints, {
        radius: 35,
        blur: 10,
        minOpacity: 0.4,
        maxZoom: 15,
      }).addTo(map);
    } else {
      console.warn("No valid coordinates found in Airtable data.");
    }
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = [position.coords.latitude, position.coords.longitude];
        if (localStorage.getItem("identity")) {
          showMainApp();
        }
      },
      (error) => {
        console.warn("Geolocation error:", error.message);
        if (localStorage.getItem("identity")) {
          showMainApp();
        }
      }
    );
  } else {
    if (localStorage.getItem("identity")) {
      showMainApp();
    }
  }
});
