// Create a map object.
let myMap = L.map("map", {
    center: [0, 0],
    zoom: 3
});
  
// Add a tile layer.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

link = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson';

d3.json(link).then(function(data) {
    // get quakes from geojson data
    const quakes = data['features'];
    console.log(quakes);

    // loop through all quakes in the data
    for (let i = 0; i < quakes.length; i++) {
        let quake = quakes[i]; // get current quake

        try {
            // get quake's essential properties
            let properties = quake['properties'];
            let geometry = quake['geometry'];
            let magnitude = properties.mag;
            let depth = geometry['coordinates'][2];
            let longlat = geometry['coordinates'].slice(0,2);
            let place = properties['place'];
            let url = properties['url'];

            // create popup text
            let popupText = `
                <h1>${place}</h1><hr>
                <h3>Location: ${longlat}</h3>
                <h3>Magnitude: ${magnitude}</h3>
                <h3>Depth: ${depth}</h3>
                <a href=${url} target="_blank">Details link</a>
            `;

            // primitive color scale
            let color = '';
            if (depth < 10) {
                color = '#1eff00';
            } else if (depth < 30) {
                color = '#ccff00';
            } else if (depth < 50) {
                color = '#fff700';
            } else if (depth < 70) {
                color = '#ffb300';
            } else if (depth < 90) {
                color = '#ff5500';
            } else {
                color = '#ff0000';
            }

            console.log(longlat)

            L.circle(longlat, {
                fillOpacity: 1.0,
                color: "black",
                weight: 0.5,
                fillColor: color,
                radius: (magnitude**2) * 10000
            }).bindPopup(popupText).addTo(myMap);
        } catch(e) {
            console.log(`Err: ${e}, iter: ${i}`)
            continue;
        }
    }

    // Set up the legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "legend");
        let depthLevels = ['<10', '10-30', '30-50', '50-70', '70-90', '>90'];
        let colors = ['#1eff00', '#ccff00', '#fff700', '#ffb300', '#ff5500', '#ff0000'];

        // Add header
        let legendInfo = "<h1>Depth</h1>";
        div.innerHTML = legendInfo;

        // adds a color-to-depth item for each depth range to the legend
        depthLevels.forEach(function(limit, i) {
            div.innerHTML += `
                <div>
                    <span class='square' style="background-color: ${colors[i]};"></span> 
                    <span style="vertical-align: super;">${limit}</span>
                </div>
            `;
        });
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
})
