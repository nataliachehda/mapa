let map = L.map('map').setView([51.510067, -0.134024], 17);

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
    <p>${place.wheelchair}</p>
    <div class="rating-container">
      ${getRatingItems().join('')}
    </div>
  `;

  card.addEventListener('click', () => {
    highlightMarker(place.marker);
  });

  return card;
}

function getRatingItems() {
  let ratingItems = [
    'Rampa en entrada',
    'Puertas corredizas',
    'Personal asistente',
    'Pasillos',
    'Ascensor',
    'Desniveles',
    'Baños accesibles',
    'Estacionamiento reservado'
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
                  node["shop"="mall"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="police"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="veterinary"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["tourism"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["wheelchair"="yes"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["wheelchair"="limited"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["wheelchair"="no"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["wheelchair"="designated"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["highway"="steps"]["wheelchair"="no"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["public_transport"="platform"]["wheelchair"="yes"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["public_transport"="platform"]["wheelchair"="limited"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["public_transport"="platform"]["wheelchair"="no"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["tourism"="hotel"]["wheelchair"="yes"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="cinema"]["wheelchair"="limited"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["tourism"="museum"]["wheelchair"="yes"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="toilets"]["toilets:wheelchair"="yes"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="toilets"]["toilets:wheelchair"="no"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="toilets"]["wheelchair"="yes"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="toilets"]["wheelchair"="limited"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["amenity"="toilets"]["wheelchair"="no"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["wheelchair"="yes"]["amenity"="toilets"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["wheelchair"="limited"]["amenity"="toilets"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
                  node["wheelchair"="no"]["amenity"="toilets"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
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
        let wheelchair = getWheelchairAccessibility(place.tags);

        let card = createCard({ name, category, address, wheelchair });
        cardsContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error al obtener los lugares:', error);
    });
}

function getWheelchairAccessibility(tags) {
  let accessibility = [];

  if (tags.wheelchair === 'yes') {
    accessibility.push('Acceso completo para silla de ruedas');
  }
  if (tags.wheelchair === 'limited') {
    accessibility.push('Acceso parcial para silla de ruedas');
  }
  if (tags.wheelchair === 'no') {
    accessibility.push('Sin acceso para silla de ruedas');
  }
  if (tags.wheelchair === 'designated') {
    accessibility.push('Área designada para silla de ruedas');
  }
  if (tags['highway'] === 'steps' && tags.wheelchair === 'no') {
    accessibility.push('Escaleras, sin acceso para silla de ruedas');
  }
  if (tags['public_transport'] === 'platform') {
    if (tags.wheelchair === 'yes') {
      accessibility.push('Plataforma de transporte público con acceso para silla de ruedas');
    }
    if (tags.wheelchair === 'limited') {
      accessibility.push('Plataforma de transporte público con acceso parcial para silla de ruedas');
    }
    if (tags.wheelchair === 'no') {
      accessibility.push('Plataforma de transporte público sin acceso para silla de ruedas');
    }
  }
  if (tags['tourism'] === 'hotel' && tags.wheelchair === 'yes') {
    accessibility.push('Hotel con acceso para silla de ruedas');
  }
  if (tags['amenity'] === 'cinema' && tags.wheelchair === 'limited') {
    accessibility.push('Cine con acceso limitado para silla de ruedas');
  }
  if (tags['tourism'] === 'museum' && tags.wheelchair === 'yes') {
    accessibility.push('Museo con acceso para silla de ruedas');
  }
  if (tags['amenity'] === 'toilets') {
    if (tags['toilets:wheelchair'] === 'yes') {
      accessibility.push('Baño accesible para silla de ruedas');
    }
    if (tags['toilets:wheelchair'] === 'no') {
      accessibility.push('Baño no accesible para silla de ruedas');
    }
    if (tags.wheelchair === 'yes') {
      accessibility.push('Baño público totalmente equipado para silla de ruedas');
    }
    if (tags.wheelchair === 'limited') {
      accessibility.push('Baño público con acceso parcial para silla de ruedas');
    }
    if (tags.wheelchair === 'no') {
      accessibility.push('Baño público sin acceso para silla de ruedas');
    }
  }

  if (accessibility.length === 0) {
    return 'Información de accesibilidad no disponible';
  }

  return accessibility.join(', ');
}

function highlightMarker(marker) {
  let allMarkers = document.getElementsByClassName('leaflet-marker-icon');

  for (let i = 0; i < allMarkers.length; i++) {
    allMarkers[i].style.filter = '';
  }

  marker.options.icon.options.className += ' highlighted-marker';
  marker.getElement().style.filter = 'drop-shadow(0px 0px 5px yellow)';
}

fetchPlaces();
map.on('moveend', fetchPlaces);
