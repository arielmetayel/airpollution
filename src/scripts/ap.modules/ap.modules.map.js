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
                    industryMarker = createMarkerFromPollutantType(results.data[i], "industry", lng, lat);
                    transportationMarker = createMarkerFromPollutantType(results.data[i], "transportation", lng, lat);
                    electricityMarker = createMarkerFromPollutantType(results.data[i], "electricity", lng, lat);

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
            var stripes = new L.StripePattern();
            stripes.addTo(map);

        }
    });

    function createMarkerFromPollutantType(arr, type, lng, lat) {

        //var marker = L.marker([lng, lat]);
        var marker = getPolygonByCityName(arr[1],type, arr) || new L.marker();
        var str = createPopUpStrByType(arr, type);
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
    var num = +arr[2].replace(/[^\d.ex-]+/gi, '');
    var stripes = new L.StripePattern({
        //weight: 7,
        //color: getIndustryColor(num)
    });
    stripes.addTo(map);

    console.log("value:v"+ num +"about to get industry color: "+getIndustryColor(arr[2]));

    return {
        //fillColor: getIndustryColor(num),
        color: getIndustryColor(num),
        weight: 1.7,
        //fillOpacity: 0.6,
        className: "industry-polygon",
        fillPattern: stripes
    };
}

function electricityStyle(arr) {


    var num = +arr[3].replace(/[^\d.ex-]+/gi, '')
    console.log("value:v"+ num +"about to get electricity color: "+getIndustryColor(arr[3]));

    return {
        fillColor: getElectricityColor(num),
        color: getElectricityColor(num),
        weight: 1.7,
        fillOpacity: 0.6,
        className: "electricity-polygon"
    };
}

function transportationStyle(arr) {

    var num = +arr[4].replace(/[^\d.ex-]+/gi, '')
    console.log("value:v"+ num +"about to get electricity color: "+getIndustryColor(arr[4]));

    return {
        fillColor: getTransportationColor(num),
        color: getTransportationColor(num),
        weight: 1.7,
        fillOpacity: 0.6,
        className: "transportation-polygon"
    };
}


function box(id, t) {
  var figure = d3.select("[data=" + id + "]");
  var box = figure.select(".box");
  var svg = box.append("svg")
    .attr('width', 200)
    .attr('height', 100);
  svg.call(t);
  svg.append("path")
    .attr("d", "M 0 0 L 0 200 L 200 200 L 200 0 Z")
    .style({
      "fill": t.url()
    });
  figure.transition().duration(1000).style("opacity", 1);
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


