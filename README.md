###### How to Start the server
``` In the terminal```

###### Install project dependancies
```Install project dependancies
# npm i
```
###### Install Sails.js globally
```Install sails global
# npm i sails -g
```
###### Start the server
``` 
$ cd mws-restaurant-stage-3
$ node server
```

###### How to start client
gulpfile serves the content on port 8000. To start it, you need to run gulp in the root directory.

``` In the terminal
$ cd mws-restaurant-stage-3
$ gulp

``` 

# Lighthouse Scores:

Progressive Web App: 91
Performance: >90
Accessibility: >94

https://github.com/yusraalbarazi/mws-restaurant-stage-3/blob/master/Restaurant-Review.jpg

https://github.com/yusraalbarazi/mws-restaurant-stage-3/blob/master/restaurant-Review2.jpg



### GET Endpoints

#### Get all restaurants
```
http://localhost:1337/restaurants/
```

#### Get favorite restaurants
```
http://localhost:1337/restaurants/?is_favorite=true
```

#### Get a restaurant by id
```
http://localhost:1337/restaurants/<restaurant_id>
```

#### Get all reviews for a restaurant
```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```

#### Get all restaurant reviews
```
http://localhost:1337/reviews/
```

#### Get a restaurant review by id
```
http://localhost:1337/reviews/<review_id>
```

#### Get all reviews for a restaurant
```
http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
```
