import React, {Component} from 'react';
import LocationList from './LocationList';

class App extends Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {
                    'name': "Bangkok Bay Restaurant",
                    'type': "Restaurant",
                    'latitude': 37.468319,
                    'longitude': -122.143936,
                    'streetAddress': "825 El Camino Real"
                },
                {
                    'name': "Whole Foods",
                    'type': "Groceries",
                    'latitude': 37.482460,
                    'longitude': -122.231680,
                    'streetAddress': "1250 Jefferson Ave Redwood City CA 94062"
                },
                {
                    'name': "Ikea",
                    'type': "Store",
                    'latitude': 37.4609,
                    'longitude': -122.1393,
                    'streetAddress': "1700 E Bayshore Rd"
                },
                {
                    'name': "Fox Theatre",
                    'type': "Theatre",
                    'latitude': 37.4863,
                    'longitude': -122.2296,
                    'streetAddress': "2215 Broadway"
                },
                {
                    'name': "Cinemark Redwood Downtown 20",
                    'type': "Movie Theatre",
                    'latitude': 37.4862,
                    'longitude': -122.2289,
                    'streetAddress': "825 Middlefield Rd"
                },
                {
                    'name': "Trader Joe's",
                    'type': "Groceries",
                    'latitude': 37.4964,
                    'longitude': -122.2486,
                    'streetAddress': "1482 El Camino Real"
                },
                {
                    'name': "Starbucks",
                    'type': "Coffee Shop",
                    'latitude': 37.4905,
                    'longitude': -122.2252,
                    'streetAddress': "400 Walnut St"
                },
                {
                    'name': "Pizzeria Delfina",
                    'type': "Restaurant",
                    'latitude': 37.7891,
                    'longitude': -122.4344,
                    'streetAddress': "2406 California St"
                },
                {
                    'name': "Iris & B. Gerald Cantor Center for Visual Arts",
                    'type': "Museum",
                    'latitude': 37.4330,
                    'longitude': -122.1708,
                    'streetAddress': "328 Lomita Dr"
                },
                {
                    'name': "Palo Alto History Museum",
                    'type': "Museum",
                    'latitude': 37.4436,
                    'longitude': -122.1574,
                    'streetAddress': "300 Homer Ave"
                }
            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        // retain object instance when used in the function
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        // Connect the initMap() function within this class to the global window context,
        // so Google Maps can invoke it
        window.initMap = this.initMap;
        // Asynchronously load the Google Maps script, passing in the callback reference
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyCLA5jZ-KMwJu97x9X8NRrKEeOp66uFf6o&callback=initMap')
    }

    /**
     * Initialise the map once the google map script is loaded
     */
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 37.4419, lng: -122.1430},
            zoom: 15,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /**
     * Open the infowindow for the marker
     * @param {object} location marker
     */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /**
     * Retrive the location data from the foursquare api for the marker and display it in the infowindow
     * @param {object} location marker
     */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "TPIDDHBKB2QFBWEV2MPDOFGUSWXCXGAA5IVOWEMN5ASR3UJW";
        var clientSecret = "4HB1ZZJBVXC3F0BREBPSGXYK0VZ5ALS4XRNJZSBP1JROG0DE";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                        var usersCount = '<b>Number of Users: </b>' + location_data.stats.usersCount + '<br>';
                        var tipCount = '<b>Number of Tips: </b>' + location_data.stats.tipCount + '<br>';
                        var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                        self.state.infowindow.setContent(checkinsCount + usersCount + tipCount + verified + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    /**
     * Close the infowindow for the marker
     * @param {object} location marker
     */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /**
     * Render function of App
     */
    render() {
        return (
            <div>
                <LocationList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

/**
 * Load the google maps Asynchronously
 * @param {url} url of the google maps script
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}
