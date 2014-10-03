'use strict';

angular.module('MyApp.controllers')
.constant('BASE_URL', 'http://www.gravatar.com/avatar/')
.controller('DashboardCtrl', function($firebase, $scope, Auth, md5) {
  	var noticeRef = new Firebase('https://noticeapp.firebaseio.com/notifications');
  	$scope.textMessages = $firebase(noticeRef);  	
  	$scope.email = Auth.currentUser.email;
  	$scope.message = "";

  	// this needs to be done for the person that created the url (push to firebase?)
  	$scope.hashedEmail = md5.createHash($scope.email);
  	$scope.gravatarURL = BASE_URL + $scope.hashedEmail;
  	console.log($scope.gravatarURL);

  	$scope.postNotification = function(message) {
  		// textMessages.$add({tag: tag});
  		$scope.textMessages.$add({message: message, createdBy: $scope.email, dateCreated: Date.now()});
  		$scope.message = "";
  	};  	 	  	

  	$scope.getGravatar = function($id) {
  		Return BASE_URL + md5.createHash(textMessages.$id.createdBy);
  	}
});

//change textmessages to notifs
//http://momentjs.com/ for dates