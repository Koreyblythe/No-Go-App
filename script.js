// Initialize the map
const map = L.map('map').setView([38.6270, -90.1994], 5); // Default to St. Louis, MO

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fake report data for demo purposes
const reports = [
  {
    coords: [38.6270, -90.1994],
    identity: ['racial', 'woman'],
    description: "Uncomfortable vibes near downtown, stares and rude comments."
  },
  {
    coords: [34.0522, -118.2437],
    identity: ['lgbtq'],
    description: "Felt unsafe in West LA at night due to harassment."
  },
  {
    coords: [40.7128, -74.0060],
    identity: ['political'],
    description: "Received backlash for wearing political merch near subway."
  }
];

// Filter and render pins
function renderPins() {
  const selected = Array.from(document.querySelectorAll('#identity-selector input:checked')).map(i => i.value);

  reports.forEach(report => {
    const match = report.identity.some(id => selected.includes(id));
    if (match) {
      L.marker(report.coords).addTo(map).bindPopup(report.description);
    }
  });
}

document.querySelectorAll('#identity-selector input').forEach(box => {
  box.addEventListener('change', () => {
    map.eachLayer(layer => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });
    renderPins();
  });
});

// Initial load
renderPins();
