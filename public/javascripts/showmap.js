mapboxgl.accessToken = mapToken; //mapToken is defined in show.ejs
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/light-v11", // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl()); //add map controls

// Create a default Marker and add it to the map.
const marker1 = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
            `<h3>${campground.title}</h3> <p> ${campground.location}</p>`
        )
    )
    .addTo(map);
