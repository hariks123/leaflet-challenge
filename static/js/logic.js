//Tile for map background
var DefaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//garyscale layer

var GrayScale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//WaterColor

var Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});


//Topography map
var TopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

//basemaps
var BaseMaps={
    //Default:DefaultMap,
    "Satellite":Watercolor,
    GrayScale:GrayScale,
    "Outdoors":TopoMap
}

//map object
var myMap = L.map("map",{
    center:[36.7783,-119.4179],
    zoom:3,
    layers:[Watercolor,TopoMap,GrayScale]
})

//add default map to the map
DefaultMap.addTo(myMap)

//get data for Tectonic plates
var TectonicPlates = new L.layerGroup()

//API Call to get Tectonic Plate info
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    //console.log(plateData)

    //load data using GeoJson
    L.geoJson(plateData,{
        //styling
        color:"yellow",
        weight:1.5
    }).addTo(TectonicPlates) //add to Tectonic layer group
})

TectonicPlates.addTo(myMap)

//get data for Earthquakes
var EarthQuakes = new L.layerGroup()

//API call to get Earthquakes data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(function(EarthQuakeData){
    //console.log(EartQuakeData)
    //plot circles where the radius is dependent on magnitude and color on the depth

    //function to get color based on depth
    function DataColor(depth){
        if (depth >90) return "red"
        else if (depth>70) return "#eb7d34"
        else if(depth>50) return "#eb8f34"
        else if (depth>30) return "#ebdf34"
        else if (depth>10) return "#ebe234"
        else return "green"
    }

    //function for redius size based on magnitude
    function RadiusSize(mag) {
        if (mag==0) return 1
        else return mag*5
    }

    function dataStyle(feature) {
        return {
            opacity:0.5,
            fillOpacity:0.5,
            fillColor: DataColor(feature.geometry.coordinates[2]), //depth index is 2
            color:"black",
            radius:RadiusSize(feature.properties.mag),
            weight:0.5,
            stroke:true
        }
    }
    //Add geojson for Earthquake data
    L.geoJson(EarthQuakeData,{
        //make each feature a marker on the map.Each marker is aCircle
        pointToLayer:function(feature,latLng) {
            return L.circleMarker(latLng)
        },
        //set Style for each marker
        style:dataStyle,
        //add popups
        onEachFeature:function(feature,layer){
            layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                            Depth:<b>${feature.geometry.coordinates[2]}</b><br>
                            Location:<b>${feature.properties.place}</b>`)
        }
    }).addTo(EarthQuakes)
})

//add Eathquake layer
EarthQuakes.addTo(myMap)

//overlay for Tectonic plate
let overlays= {
    "Tectonic Plates":TectonicPlates,
    "Earthquake Data":EarthQuakes
}

//layer control
L.control
    .layers(BaseMaps,overlays)
    .addTo(myMap)

//add legend to map
var legend=L.control({
    position:"bottomright"
})

//add properties to legend
legend.onAdd = function(){
    var div=L.DomUtil.create("div","info legend")
    //let labels=[]
    let intervals=[-10,10,30,50,70,90]
    let intervalcolors=["green","#ebe234","#ebdf34","#eb8f34","#eb7d34","red"]

    //Loop through intervals and colors and generate a label,a colored square for every interval
    /*for (var i=0;i<intervals.length;i++) {
        //set square for each interval
        div.innerHTML += "<li style='background-color: "
                        +intervalcolors[i]+"'><li>"
                        +intervals[i]
                        +(intervals[i+1] ? "-"+intervals[i+1]+" km <br>":"+ km")
    }*/

    //div.innerHTML += "<h3>Legend</h3>"
    
    for (var i=0;i<intervals.length;i++) {
        //set square for each interval
        div.innerHTML += '<i style="background:'
                        +intervalcolors[i]+'"></i>'
                        +intervals[i]
                        +(intervals[i+1] ? '&ndash;' + intervals[i+1] + ' km<br>' : '+ km')
    }

    
    return div
}

legend.addTo(myMap)