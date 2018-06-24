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


    createReviewFormHTML();
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
 * Create all reviewForm HTML and add them to the webpage.
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

/**
 * @description Create a div for writing a review
 */
createReviewFormHTML = (id = self.restaurant.id) => {
    const formContainer = document.getElementById('review-form');

    const createform = document.createElement('form');
    createform.setAttribute('id', 'restoForm');
    createform.setAttribute('onsubmit', `DBHelper.saveOfflineReview(event, this);`);

    const heading = document.createElement('h2');
    heading.innerHTML = 'Write A Review';
    createform.appendChild(heading);

    const hiddenRestaurantId = document.createElement('input');
    hiddenRestaurantId.setAttribute('type', 'hidden');
    hiddenRestaurantId.setAttribute('name', 'id');
    hiddenRestaurantId.setAttribute('value', `${id}`);
    createform.appendChild(hiddenRestaurantId);

    const hiddenReviewDate = document.createElement('input');
    unixTime = Math.round(Date.now());
    hiddenReviewDate.setAttribute('type', 'hidden');
    hiddenReviewDate.setAttribute('name', 'ddate');
    hiddenReviewDate.setAttribute('value', `${unixTime}`);
    createform.appendChild(hiddenReviewDate);

    const hiddenFlag = document.createElement('input');
    hiddenFlag.setAttribute('type', 'hidden');
    hiddenFlag.setAttribute('name', 'dflag');
    hiddenFlag.setAttribute('value', 'unsynced');
    createform.appendChild(hiddenFlag);

    const name = document.createElement('p');
    namelabel.innerHTML = 'Name: ';
    createform.appendChild(name);

    const inputelement = document.createElement('input');
    inputelement.setAttribute('type', 'text');
    inputelement.setAttribute('name', 'dname');
    inputelement.setAttribute('placeholder', 'eg. James Bond');
    inputelement.setAttribute('aria-label', 'reviewer name');
    createform.appendChild(inputelement);


    const ratingelement = document.createElement('ul');
    ratingelement.innerHTML = 'Rate: ';
    for (var i = 0; i < 5; i++) {
        const stars = document.createElement('li');
        stars.className = 'fontawesome-star-empty';
        ratingelement.appendChild(stars);
    }
    createform.appendChild(ratingelement);

    const ratingbreak = document.createElement('br');
    createform.appendChild(ratingbreak);

    const review = document.createElement('p');
    reviewlabel.innerHTML = 'Review: ';
    createform.appendChild(review);

    const texareaelement = document.createElement('textarea');
    texareaelement.setAttribute('name', 'dreview');
    texareaelement.setAttribute('placeholder', 'Please write your review');
    texareaelement.setAttribute('aria-label', 'restaurant review');
    createform.appendChild(texareaelement);

    const reviewbreak = document.createElement('br');
    createform.appendChild(reviewbreak);

    const submitelement = document.createElement('input');
    submitelement.setAttribute('type', 'submit');
    submitelement.setAttribute('name', 'dsubmit');
    submitelement.setAttribute('value', 'Submit');
    createform.appendChild(submitelement);

    formContainer.appendChild(createform);
}