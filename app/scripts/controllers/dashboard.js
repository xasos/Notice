'use strict';

/**
 * @ngdoc function
 * @name devFlowApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the devFlowApp
 */
angular.module('devFlowApp')
  .controller('DashboardCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
