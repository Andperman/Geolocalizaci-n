document.addEventListener("DOMContentLoaded", function () {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
            console.log(`Latitud: ${position.coords.latitude}\nLongitud: ${position.coords.longitude}`);



            // Crear un mapa en el div con id "map"
            var map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 13);

            // Agregar capa de OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Agregar un marcador en la ubicación del usuario
            L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)
                .bindPopup('Estás aquí')
                .openPopup();

        }, error => {
            console.error("Error al obtener la ubicación:", error);
        });
    } else {
        console.warn("Tu navegador no soporta Geolocalización!!");
    }
});


//EJERCICOS 2
// CREAR UN SEGUNDO MAPA
var map2 = L.map('map2').setView([40.4165, -3.70256], 13); 


//  Agregar capa de OpenStreetMap
L.tileLayer('https://tile.openstreetmap.bzh/br/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map2);
//Personalizar capa
L.tileLayer.provider('OpenStreetMap.Mapnik').addTo(map2);


//OBTENER TERREMOTOS
async function pintarTerremotos() {
    try {
        let response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');
        if (!response.ok) {
            throw new Error('Error al obtener los datos de terremotos');
        }

        let data = await response.json();
        data.features.forEach(item => {
            const coords = item.geometry.coordinates;
            const magnitude = item.properties.mag;
            const title = item.properties.title;
            const date = new Date(item.properties.time).toLocaleString();
            const location = item.properties.place;
            const code = item.id;

            // AÑADIMOS UN MARCADOR
            addMarker(map2, coords[1], coords[0], magnitude, title, date, location, code);
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// FUNCIÓN AGREGAR MARCADOR MAPA
function addMarker(map2, lat, lng, magnitude, title, date, location, code) {
    const color = getColor(magnitude);
    const marker = L.circleMarker([lat, lng], {   //diselño círculos
        radius: magnitude * 2,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.6,
    }).addTo(map2); //añadir marcador al mapa

    //bindPopup función para vincular popup con mapas
    marker.bindPopup(`  
        <strong>${title}</strong><br>
        Fecha: ${date}<br>
        Ubicación: ${location}<br>
        Código: ${code}<br>
        Magnitud: ${magnitude}
    `);
}
    pintarTerremotos();


//FUNCIÓN COLOR A LOS MARCADORES

function getColor(magnitude) {
    let color;

    if (magnitude >= 7) {
        color = "#792472"; 
    } else if (magnitude >= 6) {
        color = "#FF0000"; 
    } else if (magnitude >= 5) {
        color = "#FF4500"; 
    } else if (magnitude >= 4) {
        color = "#FFA500"; 
    } else if (magnitude >= 3) {
        color = "#FFCC80"; 
    } else if (magnitude >= 2) {
        color = "#FFFF00"; 
    } else if (magnitude >= 1) {
        color = "#008000"; 
    } else {
        color = "#808080";  
    }

    return color;
}
