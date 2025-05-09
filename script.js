document.addEventListener("DOMContentLoaded", () => {
  const identityForm = document.getElementById('identity-form');
  const introPage = document.getElementById('intro-page');
  const mainApp = document.getElementById('main-app');

  // Handle opt-out or text value
  function getValue(name) {
    const skip = document.querySelector(`input[name="${name}-skip"]`).checked;
    return skip ? 'N/A' : document.querySelector(`input[name="${name}"]`).value || 'N/A';
  }

  // Show main app
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

  // Save identity
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

  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
    });
  }

  // Reset user identity
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem('identity');
      location.reload();
    });
  }

  // Report form
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

      // Future: Airtable API POST will go here
    });
  }

  // Map + heat layer
  function initMap(identity) {
    const map = L.map('map', {
      maxBounds: [
        [49.5, -125],  // top-left corner of U.S.
        [24.5, -66.5]  // bottom-right corner
      ],
      maxBoundsViscosity: 1.0
    }).setView([39.5, -98.35], 5); // center on U.S.

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

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

  if (localStorage.getItem('identity')) {
    showMainApp();
  }
});
