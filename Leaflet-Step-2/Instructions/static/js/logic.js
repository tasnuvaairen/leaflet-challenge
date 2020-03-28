// Store our API endpoint inside queryUrl

// Earthquake
var queryUrl_1 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
//var queryUrl = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-03-19&endtime=2020-03-26&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Fault lines
//var queryUrl_2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
var queryUrl_2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";



d3.json(queryUrl_1, function(data_1) {
  // Once we get a response, send the data.features object to the createFeatures function
  //createFeatures(data_1.features, data_1.features);
  d3.json(queryUrl_2, function(data_2) {
    //console.log(data_1.features);   
    createFeatures(data_1.features, data_2.features);
  });  
});

function getColor(d) {
    var r = 255;  var g = 255; var b = 0;
    
    if (d >= 0.0 && d <= 1.0) {
      r = 0;  g = 255; b = 0;  
    } else if (d > 1.0 && d <= 2.0) {
      r = 200; g = 255; b = 0;
    } else if (d > 2.0 && d <= 3.0) {
      r = 255;  g = 230; b = 0;
    } else if (d > 3.0 && d <= 4.0) {
      r = 255;  g = 180; b = 0;
    } else if (d > 4.0 && d <= 5.0) {
      r = 255; g = 140; b = 0;   
    } else {
      r = 255; g = 80; b = 0;
    }  

    return d3.rgb(r, g, b).hex().toString();
}

function createFeatures(earthquakeData, faultLinesData) {

  //console.log(earthquakeData);

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
   
    layer.bindPopup("<h3>" + feature.properties.place + "</h3>" + 
      "<p> Earthquake Magnitude: " + feature.properties.mag + "</p>" +
      "<hr><p>" + new Date(feature.properties.time) + "</p>"            
      );
  }

 
  var scaleColors = new Array();

  function geojsonMarkerOptions(feature) {
    var _radius = feature.properties.mag * 5;  
 
    var fillColor_hex_string = getColor(feature.properties.mag);

    var gjmo = {
      radius: _radius,
      fillColor: fillColor_hex_string, //"#ff7800",
      color: "#000",
      weight: 0.5,
      opacity: 1,
      fillOpacity: 0.8
    };

    scaleColors.push(fillColor_hex_string);

    return gjmo;
  }

  var earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, geojsonMarkerOptions(feature));
      },
      onEachFeature: onEachFeature
  });//.addTo(map);

  var faultLines = L.geoJSON(faultLinesData, 
    {style: {color: 'red', weight: 2.5}}, 
  );//.addTo(map);

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, faultLines);
}

function createMap(earthquakes, faultLines) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": faultLines
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      40.7128, -74.0059
    ],
    zoom: 5,
    layers: [streetmap, earthquakes, faultLines]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML += '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(myMap);
  
}


