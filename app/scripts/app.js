'use strict';

/**
 * @ngdoc overview
 * @name globalInkApp
 * @description
 * # globalInkApp
 *
 * Main module of the application.
 */
angular
  .module('globalInkApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  /**
   * Service to access to the Application data
   */
  .factory('services', ['$http', function($http) {
    var serviceBase = 'http://api.openweathermap.org/data/2.5/';
    var obj = {};
    obj.getCity = function(city) {
      return $http.get(serviceBase + 'weather?q=' + city);
    };
    obj.getCityIdList = function(cityIdList) {
      var cityIdString = cityIdList.join(',');
      return $http.get(serviceBase + 'group?id=' + cityIdString + '&units=metric');
    };
    return obj;
  }])
  .controller('AppController', function($scope, $location, services) {
    $scope.citySelected = null;
    $scope.cityList = [];
    
     /** 
     * with the following method I need N http requests, where N is equal to the number of the cities
     * */
    /*function pushCity(results) {
      if(results.statusText === 'OK') {
        $scope.cityList.push(results.data);
      }
    }
    services.getCity('London').then(pushCity);
    services.getCity('Luton').then(pushCity);
    services.getCity('Manchester').then(pushCity);
    services.getCity('Birmingham,uk').then(pushCity);*/
    /** 
     * this is a better method since I only perform a http request to get all the cities I need
     * */
    services.getCityIdList(['2643743', '2643339', '2643123', '2655603']).then(function(results) {
      if(results.statusText === 'OK') {
        $scope.cityList = results.data.list;
        /**
         * To obtain a scalable sorting solution, we use the native sort method and we cache the result
         * for future use to boost performance 
         */
        // we need slice() to avoid passing the reference
        $scope.cityListOrderByTempAsc = $scope.cityList.slice();
        $scope.cityListOrderByTempAsc.sort(function(a, b) {
          return a.main.temp - b.main.temp;
        });
        /**
         * Then we get the reverse array and we cache the result for future use to boost performance
         */
        // we need slice() to avoid passing the reference
        $scope.cityListOrderByTempDesc = $scope.cityListOrderByTempAsc.slice();
        $scope.cityListOrderByTempDesc.reverse();
        /**
         * Save into another variable the reference to update the view
         */
        $scope.cityListOrderByTempActive = $scope.cityListOrderByTempAsc;
      }
    });
    
    /**
     * Function that triggers the visualization of the selected city
     */
    $scope.update = function() {
      if($scope.citySelected === null) {
        $location.url('/');
      }
      else {
        $location.url('/about');
      }
    };
    
    /**
     * This function filter the visualization of the selected city
     */
    $scope.filterIds = function () {
      return function(city) {
        var filter = $scope.citySelected === null ? [] : $scope.citySelected.name;
        return filter.indexOf(city.name) !== -1;
      };
    };
    
    /**
     * Function used to reverse the order of the cities according of their temperature
     */
    $scope.toggleCityListOrder = function() {
      if($scope.cityListOrderByTempActive === $scope.cityListOrderByTempAsc) {
        $scope.cityListOrderByTempActive = $scope.cityListOrderByTempDesc;
        $scope.isAsc = true;
      }
      else {
        $scope.cityListOrderByTempActive = $scope.cityListOrderByTempAsc;
        $scope.isAsc = false;
      }
    };
  })
  /**
   * Custom filter that allows text capitalization
   */
  .filter('capitalize', function() {
    return function(input) {
      if(input !== null) {
        input = input.toLowerCase();
      }
      return input.substring(0, 1).toUpperCase() + input.substring(1);
    };
  });
