document.addEventListener("DOMContentLoaded", () => {
  const identityForm = document.getElementById('identity-form');
  const introPage = document.getElementById('intro-page');
  const mainApp = document.getElementById('main-app');

  let userLocation = null;

  function getValue(name) {
    const skip = document.querySelector(`input[name="${name}-skip"]`).checked;
    return skip ? 'N/A' : document.querySelector(`input[name="${name}"]`).value || 'N/A';
  }

  function showMainApp() {
    introPage.style.display = 'none';
    mainApp.style.display = 'block';

    const identity = JSON.parse(localStorage.getItem('identity'));

    document.getElementById('user-race').textContent = identity.race;
    document.getElementById('user-gender').textContent = identity.gender;
    document.getElementById('user-orientation').textContent = identity.orientation;
    document.getElementById('user-politics').textContent = identity.politics;

    initMap(identity);
  }

  if (identityForm) {
    identityForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const identity = {
        race: getValue('race'),
        gender: getValue('gender'),
        orientation: getValue('orientation'),
        politics: getValue('politics')
      };

      localStorage.setItem('identity', JSON.stringify(identity));
      showMainApp();
    });
  }

  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('identity');
      location.reload();
    });
  }

  const reportForm = document.getElementById('user-report-form');
  const submitStatus = document.getElementById('submit-status');

  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(reportForm);
      const location = formData.get('location');
      const description = formData.get('description');

      console.log("User submitted report:", { location, description });

      submitStatus.textContent = "Report submitted. Thank you.";
      reportForm.reset();
    });
  }

  function initMap(identity) {
    const map = L.map('map', {
      maxBounds: [
        [49.5, -125],
        [24.5, -66.5]
      ],
      maxBoundsViscosity: 1.0
    });

    const defaultCenter = [39.5, -98.35];
    const defaultZoom = 5;

    map.setView(userLocation || defaultCenter, userLocation ? 10 : defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    if (userLocation) {
      L.marker(userLocation).addTo(map).bindPopup("You are here").openPopup();
    }

    const reports = [
      {
        coords: [38.6270, -90.1994],
        identity: ['racial', 'woman'],
        description: "Uncomfortable vibes downtown."
      },
      {
        coords: [34.0522, -118.2437],
        identity: ['lgbtq'],
        description: "Verbal harassment at night."
      },
      {
        coords: [40.7128, -74.0060],
        identity: ['political'],
        description: "Judged for political clothing."
      }
    ];

    const identityValues = Object.values(identity).map(v => v.toLowerCase());

    reports.forEach(report => {
      const match = report.identity.some(id => identityValues.includes(id));
      if (match) {
        L.marker(report.coords).addTo(map).bindPopup(report.description);
      }
    });

    const heatPoints = [
      [38.6270, -90.1994, 0.8],
      [34.0522, -118.2437, 0.6],
      [40.7128, -74.0060, 0.7],
      [41.8781, -87.6298, 0.5],
      [29.7604, -95.3698, 0.3]
    ];

    L.heatLayer(heatPoints, {
      radius: 35,
      blur: 10,
      minOpacity: 0.4,
      maxZoom: 15
    }).addTo(map);
  }

  // Try to get user's location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = [position.coords.latitude, position.coords.longitude];
        if (localStorage.getItem('identity')) {
          showMainApp();
        }
      },
      (error) => {
        console.warn("Geolocation denied or failed:", error.message);
        if (localStorage.getItem('identity')) {
          showMainApp();
        }
      }
    );
  } else {
    console.warn("Geolocation not supported");
    if (localStorage.getItem('identity')) {
      showMainApp();
    }
  }
});
