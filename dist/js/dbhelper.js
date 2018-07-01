/**
 * Common database helper functions.
 */
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */
    static get DATABASE_URL() {
        const port = 1337 // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }


    static openDatabase() {
        // If the browser doesn't support service worker,
        // we don't care about having a database
        if (!navigator.serviceWorker) {
            return Promise.resolve();
        }

        return idb.open('restaurantDb', 1, function(upgradeDb) {
            var store = upgradeDb.createObjectStore('restaurantDb', {
                keyPath: 'id'
            });
            store.createIndex('by-id', 'id');

            var reviewSstore = upgradeDb.createObjectStore('restaurantReview', { keyPath: 'id' });
            reviewSstore.createIndex('restaurant_id', 'restaurant_id');
            //var offlineReview = upgradeDb.createObjectStore('review2', { keyPath: 'updatedAt' });
        });
    }

    static saveToDatabase(data) {
        return DBHelper.openDatabase().then(function(db) {
            if (!db) return;

            var tx = db.transaction('restaurantDb', 'readwrite');
            var store = tx.objectStore('restaurantDb');
            data.forEach(function(restaurant) {
                store.put(restaurant);
            });
            return tx.complete;
        });
    }


    static addRestaurantsFromAPI() {
        return fetch(DBHelper.DATABASE_URL)
            .then(function(response) {
                return response.json();
            }).then(restaurants => {
                DBHelper.saveToDatabase(restaurants);
                return restaurants;
            });
    }

    static getCachedRestaurants() {
            return DBHelper.openDatabase().then(function(db) {
                if (!db) return;

                var store = db.transaction('restaurantDb').objectStore('restaurantDb');
                return store.getAll();
            });
        }
        /** @description Fetching reviews from API 
         * 
         */
    static saveReviewsToDatabase(data) {
        return DBHelper.openDatabase().then(function(db) {
            if (!db) return;
            // 3. Put fetched reviews into IDB
            const tx = db.transaction('restaurantReview', 'readwrite');
            const store = tx.objectStore('restaurantReview');
            data.forEach(review => {
                store.put(review);
            });
            return tx.complete;
        });
    }

    static addReviewsFromAPI(id) {

        fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
            .then(response => {
                return response.json();
            })
            .then(reviews => {
                DBHelper.saveReviewsToDatabase(reviews);
                return reviews;
            });
    }
    static fetchReviewsForRestaurant(id, callback) {

        return DBHelper.openDatabase().then(function(db) {
            if (!db) return;
            // 1. Check if there are reviews in the IDB 
            const tx = db.transaction('restaurantReview');
            const index = tx.objectStore('restaurantReview').index('restaurant_id');

            index.getAll(id).then(results => {
                if (results && results.length > 0) {
                    // Continue with reviews from IDB
                    console.log("Reviews already fetched");
                    callback(null, results);
                } else {
                    // 2. If there are no reviews in the IDB, fetch reviews from the network
                    fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
                        .then(response => {
                            return response.json();
                        })
                        .then(reviews => {
                            return DBHelper.openDatabase().then(function(db) {
                                if (!db) return;
                                // 3. Put fetched reviews into IDB
                                DBHelper.saveReviewsToDatabase(reviews);

                                callback(null, reviews);
                            });
                        })
                        .catch(error => {
                            // Unable to fetch reviews from network
                            callback(error, null);
                        })
                }
            })
        });
    }
    static addReviewToDToDatabase(data) {
        return DBHelper.openDatabase().then(function(db) {
            if (!db) return;

            var tx = db.transaction('restaurantReview', 'readwrite');
            var store = tx.objectStore('restaurantReview');
            store.put(data);

            return tx.complete;
        })
    }

    static readAllIdbData() {
        return DBHelper.openDatabase().then(function(db) {
            if (!db) return;
            return db.transaction('restaurantReview')
                .objectStore('restaurantReview').getAll();
        })
    }
    static DeleteAllIdbData(body) {
        return DBHelper.openDatabase().then(function(db) {
            if (!db) return;
            var tx = db.transaction('review2', 'readwrite');
            var store = tx.objectStore('review2');
            store.delete(body.updatedAt);
        })
    }
    static postReview(body) {

        fetch(`http://localhost:1337/reviews/`, {
                method: 'POST',
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json , text/plain',
                    'content-type': 'application/json'
                }
            })
            .then(response => {
                response.json()
                    .then(data => {
                        DBHelper.addReviewToDToDatabase(data);
                    })
            })
            .catch(error => {
                console.log(error);
            });

    }


    static waitingReviews() {
        DBHelper.readAllIdbData()
            .then(data => {
                if (data && data.length == 0) {
                    if (data.flag == 'unsynced') {

                        data.forEach(reviews => {

                            const body = {
                                "restaurant_id": reviews.restaurant_id,
                                "name": reviews.name,
                                "date": reviews.date,
                                "rating": reviews.rating,
                                "comments": reviews.comments
                            };
                            fetch(`http://localhost:1337/reviews/`, {
                                method: 'post',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(body),
                            }).then(res => console.log('new review has been synced to the server', res.json()))

                        });
                    }
                } else {

                    console.log("everything is good ");
                }

            });

    }




    /**
     * Fetch all restaurants.
     */
    static fetchRestaurants(callback) {
        return DBHelper.getCachedRestaurants().then(restaurants => {
                if (restaurants.length) {
                    return Promise.resolve(restaurants);
                } else {
                    return DBHelper.addRestaurantsFromAPI();
                }
            })
            .then(restaurants => {
                callback(null, restaurants);
            })
            .catch(error => {
                callback(error, null);
            })
    }

    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id);
                if (restaurant) { // Got the restaurant
                    callback(null, restaurant);
                } else { // Restaurant does not exist in the database
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, favorite, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all') { // filter by cuisine
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') { // filter by neighborhood
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                if (favorite === true) { // filter by favorites
                    results = results.filter(r => r.is_favorite == "true");
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                    // Remove duplicates from neighborhoods
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
                    // Remove duplicates from cuisines
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
                callback(null, uniqueCuisines);
            }
        });
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static largeImageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph_large}`);
    }
    static mediumImageUrlForRestaurant(restaurant) {
        return (`/img/${restaurant.photograph_medium}`);
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
            position: restaurant.latlng,
            title: restaurant.name,
            url: DBHelper.urlForRestaurant(restaurant),
            map: map,
            animation: google.maps.Animation.DROP
        });
        return marker;
    }


    static toggleFavorite(id, condition) {
        fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${condition}`, { method: 'PUT' })
            .then(res => { return res.json() })
            .then(data => {
                return DBHelper.openDatabase().then(function(db) {
                        if (!db) return;

                        var tx = db.transaction('restaurantDb', 'readwrite');
                        var store = tx.objectStore('restaurantDb');

                        store.put(data);

                        return tx.complete;
                    })
                    .then(location.reload());
            })
    }



}