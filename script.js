const identityForm = document.getElementById('identity-form');
const introPage = document.getElementById('intro-page');
const mainApp = document.getElementById('main-app');

identityForm.addEventListener('submit', function (e) {
  e.preventDefault();

  function getValue(name) {
    const skip = document.querySelector(`input[name="${name}-skip"]`).checked;
    return skip ? 'N/A' : document.querySelector(`input[name="${name}"]`).value || 'N/A';
  }

  const identity = {
    race: getValue('race'),
    gender: getValue('gender'),
    orientation: getValue('orientation'),
    politics: getValue('politics')
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

document.getElementById('sidebar-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

document.getElementById('reset-btn').addEventListener('click', () => {
  localStorage.removeItem('identity');
  location.reload();
});

function initMap(identity) {
  const map = L.map('map').setView([38.6270, -90.1994], 5);
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
}

if (localStorage.getItem('identity')) {
  showMainApp();
}
