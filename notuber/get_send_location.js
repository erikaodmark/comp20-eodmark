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

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), myOptions);
    getMyLocation();
}


function getMyLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            renderMap();
            sendInfo();
        });
    }
    else {
        alert("Geolocation is not supported by your web browser.");
    }
}


function renderMap() {
    myCoords = new google.maps.LatLng(myLat, myLng);
    map.panTo(myCoords);
    marker = new google.maps.Marker({
        position: myCoords,
        title: "<div>"+username+"</div> <div>distance to nearest car: " + "10</div>",
    });
    marker.setMap(map);

    // Open info window on click of marker
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(this.title);
        infowindow.open(map, this);
    });
}

function sendInfo() {
    var http = new XMLHttpRequest();
    var url = "https://jordan-marsh.herokuapp.com/rides"
    var data = "username=" + username + "&lat=" + myLat + "&lng=" + myLng
    http.open("POST", url, true)

    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

    http.onreadystatechange = func() {
        if(http.readyState == 4 && http.status == 200) {
            alert(http.responseText);
        }
    }

    http.send(data)
}
