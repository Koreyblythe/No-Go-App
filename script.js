document.addEventListener("DOMContentLoaded", () => {
  const identityForm = document.getElementById("identity-form");
  const introPage = document.getElementById("intro-page");
  const mainApp = document.getElementById("main-app");

  let userLocation = null;
  let userIdentity = {};

  function getValue(name) {
    const skip = document.querySelector(`input[name="${name}-skip"]`).checked;
    return skip ? "N/A" : document.querySelector(`input[name="${name}"]`).value || "N/A";
  }

  function showMainApp() {
    introPage.style.display = "none";
    mainApp.style.display = "block";

    userIdentity = JSON.parse(localStorage.getItem("identity"));
    document.getElementById("user-race").textContent = userIdentity.race;
    document.getElementById("user-gender").textContent = userIdentity.gender;
    document.getElementById("user-orientation").textContent = userIdentity.orientation;
    document.getElementById("user-politics").textContent = userIdentity.politics;

    initMap();
  }

  if (identityForm) {
    identityForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const identity = {
        race: getValue("race").toLowerCase(),
        gender: getValue("gender").toLowerCase(),
        orientation: getValue("orientation").toLowerCase(),
        politics: getValue("politics").toLowerCase()
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

  async function initMap() {
    const map = L.map("map", {
      maxBounds: [
        [49.5, -125],
        [24.5, -66.5]
      ],
      maxBoundsViscosity: 1.0
    });

    const defaultCenter = [39.5, -98.35];
    const defaultZoom = 5;
    map.setView(userLocation || defaultCenter, userLocation ? 7 : defaultZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    if (userLocation) {
      L.marker(userLocation).addTo(map).bindPopup("You are here").openPopup();
    }

    const heatPoints = [];

    try {
      const response = await fetch("police-data.csv");
      const csvText = await response.text();
      const rows = csvText.split("\n").slice(1);

      rows.forEach((row) => {
        const cells = row.split(",");
        const name = cells[0];
        const race = cells[2].toLowerCase();
        const gender = cells[3].toLowerCase();
        const cause = cells[12];
        const date = cells[5];
        const city = cells[6];
        const state = cells[7];
        const lat = parseFloat(cells[37]);
        const lon = parseFloat(cells[38]);

        if (!isNaN(lat) && !isNaN(lon)) {
          heatPoints.push([lat, lon, 0.25]);

          const matchesUser = (
            race === userIdentity.race ||
            gender === userIdentity.gender ||
            userIdentity.orientation === "any"
          );

          if (matchesUser) {
            const popupText = `
              <strong>${name || "Unnamed Victim"}</strong><br>
              Race: ${race}<br>
              Gender: ${gender}<br>
              Cause: ${cause}<br>
              Date: ${date}<br>
              Location: ${city}, ${state}
            `;

            L.marker([lat, lon]).addTo(map).bindPopup(popupText);
          }
        }
      });

      const heat = L.heatLayer(heatPoints, {
        radius: 25,
        blur: 20,
        minOpacity: 0.2,
        gradient: {
          0.2: "#00ffff",
          0.4: "#03dac5",
          0.6: "#ff8c00",
          1.0: "#ff0000"
        }
      }).addTo(map);

      map.on("zoomend", () => {
        const zoom = map.getZoom();
        const opacity = zoom >= 8 ? 0.6 : 0.3;
        heat.setOptions({ minOpacity: opacity });
      });

    } catch (err) {
      console.error("Failed to load CSV:", err);
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
      () => {
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
