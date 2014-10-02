'use strict';

angular.module('MyApp.controllers')
.controller('DashboardCtrl', function($firebase, $scope, Auth) {
  	var noticeRef = new Firebase('https://noticeapp.firebaseio.com/notifications');
  	var textMessages = $firebase(noticeRef);
  	$scope.email = Auth.currentUser.email;
  	$scope.message = "";
  	$scope.postNotification = function(message) {
  		// textMessages.$add({message: message, createdBy: email, tag: tag});
  		textMessages.$add({message: message});
  		message = "";
  	};
});
