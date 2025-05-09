// Identity Form Logic
const identityForm = document.getElementById('identity-form');
const introPage = document.getElementById('intro-page');
const mainApp = document.getElementById('main-app');

identityForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const formData = new FormData(identityForm);
  const identity = {
    race: formData.get('race'),
    gender: formData.get('gender'),
    orientation: formData.get('orientation'),
    politics: formData.get('politics') || 'N/A'
  };
  localStorage.setItem('identity', JSON.stringify(identity));
  showMainApp();
});

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

// Sidebar Toggle
document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// Reset Identity
document.getElementById('reset-btn').addEventListener('click', () => {
  localStorage.removeItem('identity');
  location.reload();
});

// Map Logic
function initMap(identity) {
  const map = L.map('map').setView([38.6270, -90.1994], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

  const reports = [
    {
      coords: [38.6270, -90.1994],
      identity: ['racial', 'woman'],
      description: "Uncomfortable vibes near downtown."
    },
    {
      coords: [34.0522, -118.2437],
      identity: ['lgbtq'],
      description: "Felt unsafe in West LA."
    },
    {
      coords: [40.7128, -74.0060],
      identity: ['political'],
      description: "Got negative reactions for wearing political merch."
    }
  ];

  const identityValues = Object.values(identity).map(v => v.toLowerCase());

  reports.forEach(report => {
    const match = report.identity.some(id => identityValues.includes(id));
    if (match) {
      L.marker(report.coords).addTo(map).bindPopup(report.description);
    }
  });
}

// Auto-load if identity already exists
if (localStorage.getItem('identity')) {
  showMainApp();
}
