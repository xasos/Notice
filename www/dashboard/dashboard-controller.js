'use strict';

angular.module('MyApp.controllers')
.controller('DashboardCtrl', function($firebase, $scope, Auth) {
  	var noticeRef = new Firebase('https://noticeapp.firebaseio.com/notifications');
  	$scope.textMessages = $firebase(noticeRef);
  	
  	$scope.email = Auth.currentUser.email;
  	$scope.message = "";

  	$scope.postNotification = function(message) {
  		// textMessages.$add({tag: tag});
  		$scope.textMessages.$add({message: message, createdBy: $scope.email, dateCreated: Date.now()});
  		$scope.message = "";
  	};  	
});

//change textmessages to notifs