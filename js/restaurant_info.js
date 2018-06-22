let restaurant;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) { // restaurant already fetched!
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) { // no id found in URL
        error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const picture = document.createElement('picture');

    const source = document.createElement('source');
    source.media = '(min-width: 600px)';
    source.srcset = DBHelper.mediumImageUrlForRestaurant(restaurant);
    picture.prepend(source);
    const image = document.getElementById('restaurant-img');

    image.className = 'restaurant-img';
    image.src = DBHelper.largeImageUrlForRestaurant(restaurant);
    image.alt = `${restaurant.name} restaurant`;

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    // fill operating hours
    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }

    // fill reviews
    fillReviewsHTML();
    return picture;

}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 * adding aria-label for oping days and times
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');

    for (let key in operatingHours) {
        const row = document.createElement('tr')

        const day = document.createElement('td');
        day.innerHTML = key;

        row.appendChild(day);
        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];

        if (day.innerHTML === "Monday") {
            const weekdays = document.createElement('p');
            weekdays.tabIndex = "0";

            weekdays.id = 'weekdays';
            weekdays.setAttribute('aria-hidden', 'true');
            weekdays.setAttribute('aria-label', "weekdays: " + time.innerHTML);
            restaurant - hours.appendChild(weekdays);
        }
        if (day.innerHTML === "Sunday") {
            const weekend = document.createElement('p');
            weekend.tabIndex = "0";
            weekend.id = 'weekend';
            weekend.setAttribute('aria-hidden', "true");
            weekend.setAttribute('aria-label', "weekdend: " + time.innerHTML);
            restaurant - hours.appendChild(weekend);
        }
        row.appendChild(time);


        hours.appendChild(row);

    }


}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
    const container = document.getElementById('reviews-container');
    const title = document.createElement('h2');
    title.innerHTML = 'Reviews';
    container.appendChild(title);

    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');

    const name = document.createElement('p');
    name.id = 'reviewer-name';
    name.innerHTML = review.name;
    li.appendChild(name);


    const date = document.createElement('p');
    date.id = 'review-date';
    date.innerHTML = review.date;
    li.appendChild(date);


    const rating = document.createElement('p');
    rating.id = 'reviewer-rating';
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.id = 'reviewer-comments';
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const breadcrumb = document.getElementById('breadcrumb');
    const li = document.createElement('li');
    li.innerHTML = restaurant.name;
    breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/*
const showMapButton = document.createElement('div');
showMapButton.setAttribute("id", "button");
const header = document.querySelector('header');
header.append(showMapButton);

showMapButton.setAttribute('id', 'show-map');
showMapButton.setAttribute('role', 'button');
showMapButton.setAttribute('tabindex', '0');
showMapButton.setAttribute("aria-pressed", "false");

const mapToHide = document.getElementById("map-container");
mapToHide.style.display = "none";

if (mapToHide.style.display == "none") {
    showMapButton.textContent = 'Map view' || mapToHide.style.display == "flex";
}

showMapButton.setAttribute('aria-label', showMapButton.textContent);

showMeMap = () => {
    showMapButton.focus();
    showMapButton.setAttribute("aria-pressed", "true");

    if (mapToHide.style.display == "none") {
        mapToHide.style.display = "flex";
        showMapButton.style.display = "none";
    } else {
        mapToHide.style.display = "none";
    }
};

/**
 * @description Add event listeners to the various buttons
 * @param keydown - Keydown event
 * @param function
 */
/*
// Define values for keycodes
const VK_ENTER = 13;
const VK_SPACE = 32;

showMapButton.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case VK_SPACE:
        case VK_ENTER:
            {

                showMeMap();
                event.stopPropagation();
                event.preventDefault();
                break;
            }
    }
});

showMapButton.addEventListener('click', showMeMap);
*/
/**
 * @description Create a div for skip to the main content :
 * <div class='invisible' role='complementary'></div>
 */

const skipNav = document.createElement('div');
skipNav.setAttribute("role", "complementary");
skipNav.className = 'invisible';

const nav = document.querySelector('nav');
nav.prepend(skipNav);

const linkMain = document.createElement('a');
linkMain.href = '#restaurant-name';
linkMain.textContent = 'Skip to the main content';
linkMain.setAttribute('aria-label', linkMain.textContent);
linkMain.className = 'skip-main';

skipNav.prepend(linkMain);