let map = L.map('map').setView([-31.417, -64.183], 13); // Se establece la ubicación de Córdoba y el nivel de zoom inicial

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
  maxZoom: 18,
}).addTo(map);

function createCard(place) {
    let card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${place.name}</h3>
      <p>${place.category}</p>
      <p>${place.address}</p>
      <div class="rating-container">
        ${getRatingItems().join('')}
      </div>
    `;
  
    return card;
  }
  
  function getRatingItems() {
    let ratingItems = [
      'Rampa en entrada',
      'Ángulo de la rampa',
      'Puertas corredizas',
      'Personal asistente',
      'Ancho de los pasillos',
      'Mobiliario y decoración',
      'Ascensor',
      'Desniveles',
      'Baños accesibles',
      'Altura de mostradores',
      'Lugar reservado estacionamiento'
    ];
  
    return ratingItems.map((item) => {
      return `
        <div class="rating-item">
          <label for="${getItemId(item)}">${item}:</label>
          <select id="${getItemId(item)}">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
      `;
    });
  }
  
  function getItemId(item) {
    return item.toLowerCase().replace(/\s/g, '-');
  }

  function ratePlace(name, rating) {
    // Aquí puedes implementar la lógica para registrar la puntuación en tu sistema
    console.log(`Lugar: ${name}, Puntuación: ${rating}`);
  }

function fetchPlaces() {
  let bounds = map.getBounds();
  let overpassUrl = 'https://lz4.overpass-api.de/api/interpreter?data=';

  let query = `[out:json];
                (
                  node["amenity"="hospital"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="school"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="park"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="restaurant"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["shop"="supermarket"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="veterinary"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["tourism"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                );
                out body;`;

  let encodedQuery = encodeURIComponent(query);
  let apiUrl = overpassUrl + encodedQuery;

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      let cardsContainer = document.getElementById('cards');
      cardsContainer.innerHTML = '';

      data.elements.forEach(place => {
        let name = place.tags.name || 'Sin nombre';
        let category = place.tags.amenity || place.tags.shop || place.tags.tourism || 'Sin categoría';
        let address = place.tags['addr:street'] || 'Sin dirección';

        let card = createCard({ name, category, address });
        cardsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error al obtener los lugares:', error);
    });
}

map.on('moveend', fetchPlaces);
fetchPlaces();