var map;
var myLat = 0;
var myLng = 0;
var myCoords = new google.maps.LatLng(myLat, myLng);
var myOptions = {
    zoom: 15,
    center: myCoords,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var myMarker
var infowindow = new google.maps.InfoWindow();
var username = "RG8IotI93V"

// myType is either passenger or person, and dataObjects is either an array
// of passengers or an array of vehicles (theirType opposite of myType)
var dataObjects
var myType
var theirType

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), myOptions);
    getMyLocation();
}


function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            httpPost();
            renderMap();
        });

    }
    else {
        alert("Geolocation is not supported by your web browser.");
    }
}


function renderMap() {
    myCoords = new google.maps.LatLng(myLat, myLng);
    map.panTo(myCoords);

    //Assign Icons based on who is a vehicle and who is a passenger
    var theirIcon;
    var myIcon;
    if (theirType == "vehicle") {
        theirIcon = "vehicle.png";
        myIcon = "passenger.png";
    } else {
        myIcon = "vehicle.png";
        theirIcon = "passenger.png";
    }

    //Caclulate relative distances and assign markers for the vehicles or passengers
    var minDistance = Infinity;
    for (i = 0; i < dataObjects.length; i++) {
        var latLng = new google.maps.LatLng(dataObjects[i].lat, dataObjects[i].lng);
        var usr = dataObjects[i].username;
        var distToMe = 0.000621371 * google.maps.geometry.spherical.computeDistanceBetween(myCoords, latLng);
        if (distToMe < minDistance){
            minDistance = distToMe;
        }

        m = new google.maps.Marker({
            position: latLng,
            title: "<div>" + usr + "</div><div>distance to me: " +
                    distToMe +  " miles</div>",
            icon: theirIcon,
        });
        m.setMap(map);
        google.maps.event.addListener(m, 'click', function() {
            infowindow.setContent(this.title);
            infowindow.open(map, this);
        });
    }

    // the marker for me
    if (isFinite(minDistance)) {
        var myInfo = "<div>" + username + "</div><div>distance to nearest "
                + theirType + ": " + minDistance + " miles</div>"
    } else {
        var myInfo = "<div>" + username + "</div><div>We can't find any "+theirType+"s!</div>"
    }
    marker = new google.maps.Marker({
        position: myCoords,
        title: myInfo,
        icon: myIcon,
    });
    marker.setMap(map);
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(this.title);
        infowindow.open(map, this);
    });


}

function httpPost() {
    var http = new XMLHttpRequest();
    var url = "https://jordan-marsh.herokuapp.com/rides";
    var data = "username=" + username + "&lat=" + myLat + "&lng=" + myLng;
    http.open("POST", url, false);

    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            obj = JSON.parse(http.responseText);
            if(obj.hasOwnProperty('vehicles')){
                dataObjects = obj.vehicles
                myType = "passenger"
                theirType = "vehicle"
            } else if(obj.hasOwnProperty('passengers')){
                dataObjects = obj.passengers
                myType = "vehicle"
                theirType = "passenger"
            }
        }
    }
    http.send(data);
}
