let restaurants,
    neighborhoods,
    cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
    fetchNeighborhoods();
    fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
            fillNeighborhoodsHTML();
        }
    });
}

/**
 * Set neighborhoods HTML.
 * Set accessability attribute Role='option', and aria-label='name of the neighborhood'
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-label', neighborhood)
        select.append(option);
    });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
            fillCuisinesHTML();
        }
    });
}

/**
 * Set cuisines HTML.
 * Set accessability attribute Role='option', and aria-label='name of the cuisine'
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
    const select = document.getElementById('cuisines-select');

    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-label', cuisine)
        select.append(option);
    });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false
    });
    updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;

    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;

    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
            fillRestaurantsHTML();
        }
    })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';

    // Remove all map markers
    self.markers.forEach(m => m.setMap(null));
    self.markers = [];
    self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
    });
    addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
    const li = document.createElement('li');


    const image = document.createElement('img');
    image.className = 'restaurant-img';
    const imageSrc = DBHelper.mediumImageUrlForRestaurant(restaurant);
    image.alt = `${restaurant.name} restaurant`;
    image.setAttribute('data-frz-src', imageSrc);
    image.setAttribute('src', "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
    image.setAttribute('onload', "lzld(this)");
    image.setAttribute('onerror', "lzld(this)");


    li.prepend(image);


    const name = document.createElement('h3');
    name.innerHTML = restaurant.name;

    li.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);

    // add aria-label to the view details button
    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.className = 'viewDetails';
    more.href = DBHelper.urlForRestaurant(restaurant);
    more.setAttribute('aria-label', 'view details of the ' + restaurant.name + ' restaurant')
    li.append(more)

    return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
        google.maps.event.addListener(marker, 'click', () => {
            window.location.href = marker.url
        });
        self.markers.push(marker);
    });
}

/**
 * @description Add an accessibility attribute to option if it's selected
 * @param {string} id - The neighborhood or the cuisines select tag
 */

function SelectGroup(id) {
    this.el = document.querySelector(id);
    this.el.setAttribute('role', 'listbox');

    this.options = slice(this.el.querySelectorAll('option'));
    let firstOption = true;

    this.options.map(option => {
        if (firstOption) {
            option.setAttribute('aria-selected', 'true');
            firstOption = false;
        } else {
            option.setAttribute('role', 'option');
        }

        option.setAttribute('role', 'option');
    });

    const neighborhoodList = new SelectGroup('#neighborhoods-select');
    const cuisinesList = new SelectGroup('#cuisines-select');
}

/**
 * Create an element to skip to the main content
 * <div class='invisible'>
 * <a href='#neighborhoods-select' class='skip-main' aria-label='Skip to the main content'>Skip to the main content</a>
 * </div>
 */
const skipNav = document.createElement('div');
skipNav.className = 'invisible';
skipNav.setAttribute("role", "complementary");
const nav = document.querySelector('nav');
nav.prepend(skipNav);

const linkNeighborhoods = document.createElement('a');
linkNeighborhoods.href = '#neighborhoods-select';
linkNeighborhoods.textContent = 'Skip to the main content';
linkNeighborhoods.setAttribute('aria-label', linkNeighborhoods.textContent);
linkNeighborhoods.className = 'skip-main';

skipNav.prepend(linkNeighborhoods);