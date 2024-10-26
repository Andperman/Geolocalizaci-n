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
    //diseño círculo 
    const marker = L.circleMarker([lat, lng], {
        radius: magnitude * 2,
        fillColor: color,
        color: color,
        weight: 1,


    }).addTo(map2); //añadir marcador al mapa

    //bindPopup función para vincular popup con mapas
    marker.bindPopup(`  
        <strong>${title}</strong><br>
        Fecha: ${date}<br>
        Ubicación: ${location}<br>
        Código: ${code}<br>
        Magnitud: ${magnitude}
    `);

    return marker;
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



//EJERCICIO 3 : Dibujar en un mapa las coordenadas de posiciones donde
// hay terremotos filtrando por magnitud y por fecha de inicio/fin

//Añadir filtro por magnitud en el HTML
//Input magnitud

//Añadir filtro por fechas en el HTML
//Input start date
//Input end date


//terminar este ejericio

let earthquakeLayer = L.layerGroup().addTo(map2);

document.getElementById('filterMagnitude').addEventListener('submit', function (event) {
    event.preventDefault();
    //parseFloat convierte una cadena de texto en numero decimal 
    currentMagnitudeFilter = parseFloat(document.getElementById('magnitude').value) || null;
    //llama a la función para pintar en el mapa los nuevos filtros
    pintarTerremotos(magnitudeFilter);
});


document.getElementById('filterDate').addEventListener('submit', function (event) {
    event.preventDefault();

    currentStartDateFilter = new Date(document.getElementById('startDate').value) || null;
    currentEndDateFilter = new Date(document.getElementById('endDate').value)  || null;
    pintarTerremotos(null, startDate, endDate);
});


// Obtener y pintar los terremotos filtrados
async function pintarTerremotos(magnitudeFilter, startDate , endDate ) {
    try {
        //elimina la capa que habia de marcadores y crea una nueva capa
        map2.removeLayer(earthquakeLayer);
        earthquakeLayer = L.layerGroup().addTo(map2);

        let response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson');
        if (!response.ok) {
            throw new Error('Error al obtener los datos de terremotos');
        }

        let data = await response.json();

        // Filtrar los datos magnitud y fecha
        const filteredData = data.features.filter(item => {
            const magnitude = item.properties.mag;
            const date = new Date(item.properties.time);

            // Aplicar los filtros
            const magnitudeCondition = !magnitudeFilter || magnitude >= magnitudeFilter; //si está defnido devuelve tre sin filtro , si esta, verifiva la magnitud del terrremto
            const startDateCondition = !startDate || date >= startDate; //verifica si hay un filtro de fecha de inicio y si la fecha del trremeto
            const endDateCondition = !endDate || date <= endDate; //Comprueba si hay un filtro de fecha de fin y si la fecha del terremoto es igual o anterior a esta.

            // Retornar solo los datos que cumplan con todos los filtros
            return magnitudeCondition && startDateCondition && endDateCondition;
        });


        // Crear un grupo de marcadores para los terremotos filtrados
        filteredData.forEach(item => {
            const coords = item.geometry.coordinates;
            const magnitude = item.properties.mag;
            const title = item.properties.title;
            const date = new Date(item.properties.time).toLocaleString();
            const location = item.properties.place;
            const code = item.id;

            // Añadir marcador al mapa con los datos filtrados
            addMarker(map2, coords[1], coords[0], magnitude, title, date, location, code);
            earthquakeLayer.addLayer(marker);
        });


        // Crear una nueva capa de grupo de marcadores y añadirla al mapa
        earthquakeLayer = L.layerGroup(markers).addTo(map2);

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

pintarTerremotos();


