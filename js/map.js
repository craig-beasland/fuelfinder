var map;

function Map()
{
}

Map.displayMap = function(locations)
{
    ShowMap();
    map=null;
    //set the div to be "full" screen
    $('#map_canvas').css({width: $(document).width() * 0.8, height: $(document).height() * 0.8});
    $('#map_canvas').trigger('resize');

    //now set the current position on the map with a marker and center the map on this position
    //this is the GPS for the CBD of Perth?
    if (MyPosition === '')
    {
        //MyPosition = '-31.95222,115.85888';
        var options = {
            zoom: 14,
            disableDefaultUI: true,
            streetViewControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    }
    else
    {
        var userLatLng = new google.maps.LatLng(MyPosition.split(',')[0], MyPosition.split(',')[1]);
        var options = {
            zoom: 14,
            disableDefaultUI: true,
            streetViewControl: true,
            center: userLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    }
    //draw the map
    var bounds = new google.maps.LatLngBounds();
    map = new google.maps.Map(document.getElementById("map_canvas"), options);
    //add a point/pin/marker for the users current position
    if (MyPosition !== '')
    {
        var marker = new google.maps.Marker({
            map: map,
            position: userLatLng,
            icon: 'css/images/here.png',
            title: 'You are here'
        });
        bounds.extend(userLatLng);
    }
    //now loop through and add in the sites...
    for (var i = 0; i < locations.length; i++)
    {
        //if this marker would be outside of WA, dont put it on...
        if (locations[i]['latitude'] < -13.2 && locations[i]['latitude'] > -34.7 && locations[i]['longitude'] > 111.2 && locations[i]['longitude'] < 129.3)
           {
        var latlong = new google.maps.LatLng(locations[i]['latitude'], locations[i]['longitude']);
        bounds.extend(latlong);
        var marker = new google.maps.Marker({
            map: map,
            position: latlong,
            title: locations[i].title
        });
        if (i === 0)
        {
            marker.setIcon('css/images/fuel_cheap.png');
        }
        else
        {
            marker.setIcon('css/images/fuel.png');
        }
        var infowindow = new google.maps.InfoWindow();

        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                infowindow.setContent(buildDisplay(locations[i]));
                infowindow.open(map, marker);
            };
        })(marker, i));
           }
           
    }
    map.fitBounds(bounds);
};

Map.CalculateRoute = function(Destination)
{
    if (MyPosition === '')
    {
        alert("Can't determine your current location, directions are unavailable.");
    }
    else
    {
        var userLatLng = new google.maps.LatLng(MyPosition.split(',')[0], MyPosition.split(',')[1]);
        var destLatLng = new google.maps.LatLng(Destination.split(',')[0], Destination.split(',')[1]);
        var directionsService = new google.maps.DirectionsService();

        var directionsRequest = {
            origin: userLatLng,
            destination: destLatLng,
            travelMode: google.maps.DirectionsTravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC
        };
        directionsService.route(directionsRequest, function(response, status)
        {
            if (status === google.maps.DirectionsStatus.OK)
            {
                var directionsDisplay = new google.maps.DirectionsRenderer(
                        {
                            map: map,
                            directions: response
                        });
                directionsDisplay.setPanel(document.getElementById("map_directions"));
                ShowDirections();
            }
            else
            {
                alert("Unable to retrieve your route");
            }
        }
        );
    }
    ;
};