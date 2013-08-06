var MyPosition = '';
var location_timeout;

function initiate_geolocation()
{
    $("#manual_search").hide();
    location_timeout = setTimeout("handle_errors(-1)", 10000);
    if (navigator.geolocation)
    {
        var options = {timeout: 8000};
        navigator.geolocation.getCurrentPosition(handle_geolocation_query, handle_errors, options);
    }
    else
    {
        alert("Geolocation is not supported by this browser.");
    }
}

function handle_errors(error)
{
    if (error === -1)
    {
        msg = "timeout expired.";
    }
    else
    {
        switch (error.code)
        {
            case -1:
                msg = "tmeout expired.";
                break;
            case error.PERMISSION_DENIED:
                msg = "user did not share geolocation data";
                break;
            case error.POSITION_UNAVAILABLE:
                msg = "could not detect current position";
                break;
            case error.TIMEOUT:
                msg = "retrieving position timed out";
                break;
            default:
                msg = "unknown error";
                break;
        }
    }
    $("#manual_search").show();
    $("#searchtab").show();
}

function handle_geolocation_query(position) {
    //now look this up is the geocode db to get a suburb
    clearTimeout(location_timeout);
    $("#suburb").html('Found GPS: ' + position.coords.latitude + ',' + position.coords.longitude);
    $("#suburb").trigger("create");
    MyPosition = position.coords.latitude + ',' + position.coords.longitude;

    jeoquery.userName = 'craigbeasland';
    jeoquery.findNearbyPlaceName(cbfunc, position.coords.latitude, position.coords.longitude);
}

function manualsearch()
{
    if ($('#search_suburb').val().substring(0, 1) === 's')
    {
        //suburb
        $("#suburb").html($('#search_suburb').val().substring(2));
        if ($('#search_brand').val() === "ALL")
        {
            //fw_suburb
            var url = 'http://pipes.yahoo.com/pipes/pipe.run?Product=' + encodeURIComponent($('#search_fuel').val()) + '&Suburb=' + encodeURIComponent($('#search_suburb').val().substring(2)) + '&_id=f4ed2d96092e66622586a799278b0bc2&_render=json&_callback=?';
        }
        else
        {
            //fw_suburb_brand
            var url = 'http://pipes.yahoo.com/pipes/pipe.run?Brand=' + encodeURIComponent($('#search_brand').val()) + '&Product=' + encodeURIComponent($('#search_fuel').val()) + '&Suburb=' + encodeURIComponent($('#search_suburb').val().substring(2)) + '&_id=99d18b0979cea80deca14325037c6c66&_render=json&_callback=?';
        }
    }
    else
    {
        //region
        $("#suburb").html($('#search_suburb option:selected').text());
        if ($('#search_brand').val() === "ALL")
        {
            //fw_region
            var url = 'http://pipes.yahoo.com/pipes/pipe.run?Product=' + encodeURIComponent($('#search_fuel').val()) + '&Region=' + encodeURIComponent($('#search_suburb').val()) + '&_id=424d8db64eded765b50541a59127ee08&_render=json&_callback=?';
        }
        else
        {
            //fw_region_brand
            var url = 'http://pipes.yahoo.com/pipes/pipe.run?Brand=' + encodeURIComponent($('#search_brand').val()) + '&Product=' + encodeURIComponent($('#search_fuel').val()) + '&Region=' + encodeURIComponent($('#search_suburb').val()) + '&_id=235623d487e6fbd9f84c4a7b16a9df2f&_render=json&_callback=?';
        }
    }



$.getJSON(url, rssfeed);
}

function cbfunc(data)
{
    var ll = data;
    $("#suburb").html(ll.geonames[0].name);

    var url = 'http://pipes.yahoo.com/pipes/pipe.run?FuelType=1&Suburb=' + encodeURIComponent(ll.geonames[0].name) + '&_id=f4ed2d96092e66622586a799278b0bc2&_render=json&_callback=?';
    $.getJSON(url, rssfeed);
//    
    //http://blog.ouseful.info/2010/07/19/grabbing-the-output-of-a-yahoo-pipe-into-a-web-page/
}

function rssfeed(data)
{
    var rss = data.value.items;
    if (rss.length === 0)
    {
        //nothing returned, dont bother mapping
        alert("Nothing found, try a manual search.");
        ShowSearch();
    }
    else
    {
        var out = '';
        for (var i = 0; i < rss.length; i++)
        {
            out += buildDisplay(rss[i]);
        }
        $("#tabs-suburb").html('<ul>' + out + '</ul>');
        //$("#suburb").html(JSON.stringify(rss));
        Map.displayMap(rss);
        $("#searchtab").show();
    }
}

function buildDisplay(data)
{
    var out = '<li><span class="bubbletext"><strong>' + data['trading-name'] + '- ' + data['price'] + '</strong><br>' + data['address'] + ', ' + data['location'];
    if (data['phone'])
    {
        out += '<br><a href="tel:' + data['phone'] + '">' + data['phone'] + '</a>';
    }
    ;
    var pos = data['latitude'] + ',' + data['longitude'];
    out += '<BR><a href="#" onClick="Map.CalculateRoute(\'' + pos + '\');return false;">Directions</a></span>';
    out += '</li>';
    return out;
}

function urlParam(name)
{
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    if (results !== null && typeof results[1] !== 'undefined')
        return results[1];
    else
        return null;
}

function ShowList()
{
    $("#map_canvas").hide();
    $("#map_directions").hide();
    $("#manual_search").hide();
    $("#tabs-suburb").show();
    return false;
}

function ShowMap()
{
    $("#tabs-suburb").hide();
    $("#map_directions").hide();
    $("#manual_search").hide();
    $("#map_canvas").show();
    return false;
}

function ShowDirections()
{
    $("#tabs-suburb").hide();
    $("#map_canvas").hide();
    $("#manual_search").hide();
    $("#map_directions").show();
    $("#directionstab").show();
    return false;
}

function ShowSearch()
{
    $("#tabs-suburb").hide();
    $("#map_canvas").hide();
    $("#map_directions").hide();
    $("#manual_search").show();
    $("#searchtab").show();
    return false;
}
