// Edit the center point and zoom level
var map = L.map('map', {
  center: [28,95],
  zoom: 8,
  minZoom : 5,
  scrollWheelZoom: true
});

// layer controls
var controlLayers = L.control.layers( null, null, {
     position:"topleft",
     collapsed: true // truw = closed by default
    }).addTo(map);

// new L.tileLayer('https://{s}.tile.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png', {
//   attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//   ,var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
//         attribution: '©OpenStreetMap, ©CartoDB'
// }).addTo(map);


// Edit links to your GitHub repo and data source credit
map.attributionControl.addAttribution('View <a href="https://github.com/monsoonforest/nasa-landslide-nowcast">open-source code on GitHub</a>');
map.attributionControl.addAttribution('Landslide Nowcast &copy; <a href="https://gpm.nasa.gov/data/visualizations/precip-apps">NASA GPM </a>');


new L.esri.basemapLayer('Imagery').addTo(map);
new L.esri.basemapLayer('ImageryLabels').addTo(map);

$.getJSON("arunachal-pradesh-circles.geojson", function (data) {
  geoJsonLayer = L.geoJson(data, {
    style: {color: '#42ff3f', weight:1, fillOpacity: 0},
        onEachFeature: onEachFeature
  }).addTo(map);
  controlLayers.addOverlay(geoJsonLayer, 'Circles');
});

// $.getJSON("arunachal-pradesh-districts.geojson", function (data) {
//   geoJsonLayer = L.geoJson(data, {
//     style: {color: '#f4f007', weight:1, fillOpacity: 0},
//         onEachFeature: onEachFeature
//   }).addTo(map);
//   controlLayers.addOverlay(geoJsonLayer, 'Districts');
// });


$.getJSON("global_landslide_nowcast_3hr.20200713.233000.geojson", function (data) {
 geoJsonLayer = L.geoJson(data, {
    style: style
      }).addTo(map);
controlLayers.addOverlay(geoJsonLayer, 'Landslide Nowcast 0500 hrs IST 14th July 2020');

});

// FOR MAGMA COLOUR SCHEME
function getColor(d) {
  return d === 2  ? '#fc3407' :
         d === 1  ? '#ffcdb4' :
                   '#000000';
}


// Edit the getColor property to match data column header in your GeoJson file
function style(feature) {
  return {
    fillColor: getColor(feature.properties.nowcast),
    weight: 0.8,
    opacity: 1,
    color: 'white',
    fillOpacity: 1
  };
}


// This highlights the layer on hover, also for mobile
function highlightFeature(e) {
  resetHighlight(e);
  var layer = e.target;
  layer.setStyle({
    weight: 2,
    color: '#42ff3f',
    fillOpacity: 0
  });
  info.update(layer.feature.properties);
}

// This resets the highlight after hover moves away
function resetHighlight(e) {
  geoJsonLayer.setStyle(style);
  info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

// This instructs highlight and reset functions on hover movement
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: highlightFeature,
    click: zoomToFeature
  });
}


// Creates an info box on the map
var info = L.control();
info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

// Edit info box text and variables to match those in your GeoJSON data
info.update = function (props) {
  this._div.innerHTML = '<h4>Circle Name <h4>' +  (props ?
    '<b>' + props.circle + ' ' + '</b><br /><b>' + props.district + '</b><br />' 
    : 'Click on a Circle');
};  


info.addTo(map);

// Edit grades in legend to match the ranges cutoffs inserted above
// In this example, the last grade will appear as 50+
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
  
  var div = L.DomUtil.create('div', 'legend');
 
  var categories = [1, 2];
 
  var labels = ["Moderate", "High"];
 
  div.innerHTML='<div><b>NASA Landslide Nowcast</b></div';
 
  for(var i=0; i < categories.length; i++){
                    div.innerHTML+='<i style="background:'
                   + getColor(categories[i]) + '">&nbsp;&nbsp;</i>&nbsp;&nbsp;'
                   + labels[i] + '<br/>';
                }
    return div;
}
legend.addTo(map);

// Use in info.update if GeoJSON data contains null values, and if so, displays "--"
function checkNull(val) {
  if (val != null || val == "NaN") {
    return comma(val);
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed as a percentage
function checkThePct(a,b) {
  if (a != null && b != null) {
    return Math.round(a/b*1000)/10 + "%";
  } else {
    return "--";
  }
}

// Use in info.update if GeoJSON data needs to be displayed with commas (such as 123,456)
function comma(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
  }
  return val;
}
