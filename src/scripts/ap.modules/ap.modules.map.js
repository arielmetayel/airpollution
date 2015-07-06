/**
 * Created by michael.katz on 6/15/15.
 */
var ap = ap || {};
ap.modules = ap.modules || {};

var map;
var geoJsonCollection = {}; //should be []
var svg;
var g;

ap.modules.map = (function () {
    map = L.map('map');

    var industryLayer = new L.LayerGroup();
    var electricityLayer = new L.LayerGroup();
    var transportationLayer = new L.LayerGroup();
    var topLeft = [966,-547];
    var bottomRight = [1007, -178];

    industryLayer.StyledLayerControl = {
        removable: false
    };
    electricityLayer.StyledLayerControl = {
        removable: false
    };

    transportationLayer.StyledLayerControl = {
        removable: false
    };

    //create Icons


    var iconIndustry32 = L.icon({
        iconUrl: 'images/industry32.png',
        iconSize: [32, 32], popupAnchor: [0, -5]
    });
    var iconIndustry64 = L.icon({
        iconUrl: 'images/industry64.png',
        iconSize: [64, 64], popupAnchor: [0, -5]
    });
    var iconIndustry128 = L.icon({
        iconUrl: 'images/industry128.png',
        iconSize: [128, 128], popupAnchor: [0, -5]
    });

    var iconElectricity32 = L.icon({
        iconUrl: 'images/electricity32.png',
        iconSize: [32, 32], popupAnchor: [0, -5]
    });
    var iconElectricity64 = L.icon({
        iconUrl: 'images/electricity64.png',
        iconSize: [64, 64], popupAnchor: [0, -5]
    });
    var iconElectricity128 = L.icon({
        iconUrl: 'images/electricity128.png',
        iconSize: [128, 128], popupAnchor: [0, -5]
    });

    var iconTransportation32 = L.icon({
        iconUrl: 'images/transport32.png',
        iconSize: [32, 32], popupAnchor: [0, -5]
    });
    var iconTransportation64 = L.icon({
        iconUrl: 'images/transport64.png',
        iconSize: [64, 64], popupAnchor: [0, -5]
    });
    var iconTransportation128 = L.icon({
        iconUrl: 'images/transport128.png',
        iconSize: [128, 128], popupAnchor: [0, -5]
    });

    var iconDictionary = {}; //TODO remove redundant instatiation + assignments

    iconDictionary["iconIndustry32"] = iconIndustry32;
    iconDictionary["iconIndustry64"] = iconIndustry64;
    iconDictionary["iconIndustry128"] = iconIndustry128;

    iconDictionary["iconElectricity32"] = iconElectricity32;
    iconDictionary["iconElectricity64"] = iconElectricity64;
    iconDictionary["iconElectricity128"] = iconElectricity128;

    iconDictionary["iconTransportation32"] = iconTransportation32;
    iconDictionary["iconTransportation64"] = iconTransportation64;
    iconDictionary["iconTransportation128"] = iconTransportation128;

    var overlays = [
        {
            groupName: "",
            expanded: true,
            layers: {
                "תעשיה": industryLayer,
                "ייצור חשמל": electricityLayer,
                "תחבורה": transportationLayer
            }
        }
    ];

    var styledLayerOptions = {
        container_width: "300px",
        container_maxHeight: "350px",
        group_maxHeight: "80px",
        exclusive: true,
        collapsed: false
    };

    //var pruneCluster = new L.layerGroup([]);
    L.tileLayer('https://{s}.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiaXRhaGFnYWkiLCJhIjoiZmxIdGF5MCJ9.L_VBtl5noeLVHw_bIr4Hag', {
            maxZoom: 18,
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
                '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="http://mapbox.com">Mapbox</a>',
            //id: 'examples.map-i875mjb7'
            id: 'itahagai.md8f4gg5',
            subdomains: ['a','b','c','d'],
            token: 'pk.eyJ1IjoiaXRhaGFnYWkiLCJhIjoiZmxIdGF5MCJ9.L_VBtl5noeLVHw_bIr4Hag'
    }).addTo(map);

    map.setView(new L.LatLng(31.782, 35.21933), 8);

    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        //L.marker(e.latlng, {iconUrl: '/src/pin-black256.png'}).addTo(map)
        //    .bindPopup("אתם נמצאים " + radius + " מטרים מכאן").openPopup();
        //L.circle(e.latlng, radius).addTo(map);
    }

    function onLocationError(e) {
        map.setView([31.782, 35.21933], 10);
        //alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.locate({setView: true, maxZoom: 10});

    //prepare D3 / svg support
    // svg = d3.select(map.getPanes().overlayPane).append("svg");
    // g = svg.append("g").attr("class", "leaflet-zoom-hide");

    //Papa.parse("data/pollutants.csv", {
    Papa.parse("data/Pollutant-emissions-inventory-with-names01012015.csv", {
        header: false,
        download: true,
        complete: function (results) {
            //console.log(results);
            var len = results.data.length;
            for (var i = 0; i < len; i++) {
                line = results.data[i];
                if (line[1] === undefined) {
                    console.log("city name is undefined!");
                }
                else {
                    var lat = parseFloat(line[10]);
                    var lng = parseFloat(line[11]);
                    //if (isNaN(lat) || isNaN(lng)) {
                    //    console.log("Address: " + +" could not be parsed!");
                    //}
                    //else {
                    industryMarker = createMarkerFromPollutantType(results.data[i], "industry", lng, lat, iconDictionary);
                    transportationMarker = createMarkerFromPollutantType(results.data[i], "transportation", lng, lat, iconDictionary);
                    electricityMarker = createMarkerFromPollutantType(results.data[i], "electricity", lng, lat, iconDictionary);

                    industryLayer.addLayer(industryMarker);

                    electricityLayer.addLayer(electricityMarker);

                    transportationLayer.addLayer(transportationMarker);

                    /* TODO REMOVE THIS!
                    var svg = d3.select(map.getPanes().overlayPane).append("svg"),
                    g = svg.append("g").attr("class", "industry");

                    //var svg = d3.selectAll(".industry")
                    var svg = d3.select("body").selectAll(".industry");
                    var t = textures.lines().thicker();
                    svg.call(t);
                    svg.append("circle").style("fill", t.url());
                    */


                    //}
                }
            }

            var control = L.Control.styledLayerControl([], overlays, styledLayerOptions);
            map.addControl(control);

            control._container.remove();


            $('#pollutantList').append(control.onAdd(map));

        }
    });

    function createMarkerFromPollutantType(arr, type, lng, lat, iconDictionary) {
        
        //var marker = L.marker([lng, lat]);
        var marker = getPolygonByCityName(arr[1],type, arr) || new L.marker();
        var str = createPopUpStrByType(arr, type);
        //setIconByTypeRange(marker, type, arr, iconDictionary);
        marker.bindPopup(str);

        return marker;
    }

    function createPopUpStrByType(arr, type) {
        var pollutantIndex = 0;
        var costIndex = 0;
        var title = "";

        //Set the above indexes according to  type of pollutants:
        if (type == "industry") {
            pollutantIndex = 2;
            costIndex = 6;
            title = "תעשיה";

        }
        else if (type == "transportation") {
            pollutantIndex = 4;
            costIndex = 8;
            title = "תחבורה";
        }
        else { //electricity
            pollutantIndex = 3;
            costIndex = 7;
            title = "ייצור חשמל";
        }

        str = "<div class=\"marker "+type+"\">"
        str += "<b>" + arr[0] + "</b><br/>";
        str += "קוד תחנה: " + arr[1] + "<br/>";
        str += "סוג המזהם: " + title + "<br/>";
        str += "טונות זיהום/שנה: " + arr[pollutantIndex] + " טון<br/>";
        str += "עלויות חיצוניות מזיהום האויר: " + accounting.formatNumber(arr[costIndex]) + ' ש"ח<br/>';

        str += "</div>";
        return str;
    }

    function getPolygonByCityName(name, type,arr){
        if (name===undefined || name==='') {
            console.log("Could not get city name!");
            return none;
        }

        console.log("GOT array:");
        console.log(arr);

        var urlString = 'http://cdn.rawgit.com/idoivri/israel-municipalities-polygons/master/'+name+'/'+name+'.geojson'
        //var geojsonLayer = L.geoJson.ajax(urlString,{dataType:"vnd.geo+json"}); //this doesn't work
        
        var geojsonLayer = "";


        var layerStyle = getStyleByType(type,arr);
        //console.log("after stting style object");
        //console.log(layerStyle);

        var geojsonLayer = new L.GeoJSON.AJAX(urlString, {style:layerStyle}); //this works!

        function getStyleByType(type,arr) {
            if (type==="industry") {

                return industryStyle(arr);


            }
            else if (type==="electricity") {

                return electricityStyle(arr);


            }
            else //transportation
            {
                return transportationStyle(arr);
            } 
        }

        geoJsonCollection = geojsonLayer;
        return geojsonLayer;
    }

    function setIconByTypeRange(marker, type, arr, iconDictionary) {
        var checkIndex = 0
        var dictionary = {};
        if (type == "industry") {
            checkIndex = 2;
            dictionary["32"] = iconDictionary["iconIndustry32"];
            dictionary["64"] = iconDictionary["iconIndustry64"];
            dictionary["128"] = iconDictionary["iconIndustry128"];
        }
        else if (type == "transportation") {
            checkIndex = 4;
            dictionary["32"] = iconDictionary["iconTransportation32"];
            dictionary["64"] = iconDictionary["iconTransportation64"];
            dictionary["128"] = iconDictionary["iconTransportation128"];
        }
        else { //eletricity
            checkIndex = 3
            dictionary["32"] = iconDictionary["iconElectricity32"];
            dictionary["64"] = iconDictionary["iconElectricity64"];
            dictionary["128"] = iconDictionary["iconElectricity128"];
        }

        //now, match the right icon according to the pollutant level
        if (arr[checkIndex] < 100) {
            marker.setIcon(dictionary["32"]);
        }
        else if (arr[checkIndex] < 200) {
            marker.setIcon(dictionary["64"]);
        }
        else {
            marker.setIcon(dictionary["128"]);
        }

    }

    // Reposition the SVG to cover the features.
    function reset() {


        
    }
 
    //add more D3 stuff
    function projectPoint(x, y) {
      var point = map.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }


    return {}

}());


function industryStyle(arr) {


    var num = +arr[2].replace(/[^\d.ex-]+/gi, '')
    console.log("value:v"+ num +"about to get industry color: "+getIndustryColor(arr[2]));

    return {
        fillColor: getIndustryColor(num),
        color: getIndustryColor(num),
        weight: 1.7,
        fillOpacity: 0.6
    };
}

function electricityStyle(arr) {


    var num = +arr[3].replace(/[^\d.ex-]+/gi, '')
    console.log("value:v"+ num +"about to get electricity color: "+getIndustryColor(arr[3]));

    return {
        fillColor: getElectricityColor(num),
        color: getElectricityColor(num),
        weight: 1.7,
        fillOpacity: 0.6
    };
}

function transportationStyle(arr) {

    var num = +arr[4].replace(/[^\d.ex-]+/gi, '')
    console.log("value:v"+ num +"about to get electricity color: "+getIndustryColor(arr[4]));

    return {
        fillColor: getTransportationColor(num),
        color: getTransportationColor(num),
        weight: 1.7,
        fillOpacity: 0.6
    };
}



function getIndustryColor(d) {
    return d > 50 ? "#8856a7" :
           d > 25  ? "#9ebcda" :
                      "#e0ecf4";
}

function getElectricityColor(d) {
    return d > 750 ? '#f03b20' :
           d > 500  ? '#feb24c' :
                      "#ffeda0";
}

function getTransportationColor(d) {
    return d > 750 ? '#2ca25f' :
           d > 500  ? '#99d8c9' :
                      '#e5f5f9';
}


