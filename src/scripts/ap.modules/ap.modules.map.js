/**
 * Created by michael.katz on 6/15/15.
 */
var ap = ap || {};
ap.modules = ap.modules || {};

ap.modules.map = (function () {
    var map = L.map('map');

    var industryLayer = new L.LayerGroup();
    var electricityLayer = new L.LayerGroup();
    var transportationLayer = new L.LayerGroup();

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
            groupName: "תחומוצות חנקן NOx",
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
        exclusive: true
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
    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        L.marker(e.latlng, {iconUrl: '/src/pin-black256.png'}).addTo(map)
            .bindPopup("אתם נמצאים " + radius + " מטרים מכאן").openPopup();
        L.circle(e.latlng, radius).addTo(map);
    }

    function onLocationError(e) {
        map.setView([31.782, 35.21933], 10);
        //alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.locate({setView: true, maxZoom: 10});


    Papa.parse("data/pollutants.csv", {
        header: false,
        download: true,
        complete: function (results) {
            //console.log(results);
            var len = results.data.length;
            for (var i = 0; i < len; i++) {
                line = results.data[i];
                if (line[10] === undefined || line[11] === undefined) {
                    console.log("COORDS: are undefined!");
                }
                else {
                    var lat = parseFloat(line[10]);
                    var lng = parseFloat(line[11]);
                    if (isNaN(lat) || isNaN(lng)) {
                        console.log("Address: " + +" could not be parsed!");
                    }
                    else {
                        industryMarker = createMarkerFromPollutantType(results.data[i], "industry", lng, lat, iconDictionary);
                        transportationMarker = createMarkerFromPollutantType(results.data[i], "transportation", lng, lat, iconDictionary);
                        electricityMarker = createMarkerFromPollutantType(results.data[i], "electricity", lng, lat, iconDictionary);

                        industryLayer.addLayer(industryMarker);

                        electricityLayer.addLayer(electricityMarker);

                        transportationLayer.addLayer(transportationMarker);
                    }
                }
            }

            var control = L.Control.styledLayerControl([], overlays, styledLayerOptions);
            map.addControl(control);

        }
    });

    function createMarkerFromPollutantType(arr, type, lng, lat, iconDictionary) {
        var marker = L.marker([lng, lat]);
        var str = createPopUpStrByType(arr, type);
        setIconByTypeRange(marker, type, arr, iconDictionary);
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

        str = "<div class=\"marker\">"
        str += "<b>עיר:" + arr[0] + "</b><br/>";
        str += "קוד תחנה: " + arr[1] + "<br/>";
        str += "סוג המזהם: " + title + "<br/>";
        str += "טונות זיהום/שנה: " + arr[pollutantIndex] + " טון<br/>";
        str += "עלויות חיצוניות מזיהום האויר: " + accounting.formatNumber(arr[costIndex]) + ' ש"ח<br/>';

        str += "</div>";
        return str;
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
/*

    $("#opener").click(function () {
        console.log("AHA!!")
        $("#hide-me ~ label").css({
            'position': 'absolute',
            'display': 'flex',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'z-index': '1',
            'background': 'rgba(0,0,0,.5)',
            'background': 'radial-gradient(ellipse at center, rgba(0,0,0,.2) 0%, rgba(0,0,0,.9) 150%)'
        });



        var $label =  $("#hide-me ~ label");

        $label.find(".message").css({
            'position': 'relative',
            'margin': 'auto',
            'width': '60%',
            'height': '60%',
            'background': '#F7F9F3',
            'padding': '2.5em',
            'font-size': '1.25em',
            'box-shadow': '0 5px 30px 5px #222'
        });


        $label.find(".close").css({
            'display': 'block',
            'position': 'absolute',
            'top': '5px',
            'right': '5px',
            'color': '#eee',
            'background': '#C00',
            'padding': '3px',
            'border-radius': '2em',
            'width': '1.2em',
            'height': '1.2em',
            'text-align': 'center',
            'cursor': 'pointer'
        });

    });

    $(".close").click(function () {
        console.log("ANA");
        $("#hide-me ~ label").css({
            'display': 'none'
        });
    });
*/

    return {}

}());



