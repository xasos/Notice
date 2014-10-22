'use strict';

angular.module('MyApp.controllers')
.value('BASE_URL', 'https://noticeapp.firebaseio.com/')
.controller('DashboardCtrl', function($firebase, $scope, Auth, md5) {
    var noticeRef = new Firebase('https://noticeapp.firebaseio.com/notifications');
  	// var activityRef = new Firebase('https://noticeapp.firebaseio.com/activities');
   //  $scope.activities = $firebase(activityRef);
  	$scope.notifications = $firebase(noticeRef);  	
  	$scope.email = Auth.currentUser.email;
  	$scope.message = "";
    $scope.activityName = "";
    $scope.clubs = ["Math Team", "Basketball", "Horticulture Club", "Science Olympiad"]
  	
$scope.items = [
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' },
    { id: 3, name: 'blah' }];


  	$scope.gravatarURL = 'http://www.gravatar.com/avatar/' + md5.createHash($scope.email); 

  	$scope.postNotification = function(message) {
  		// notifications.$add({tag: tag});
  		  		// if ($scope.message.length == 0) {
  		// 	$ionicLoading.show({
    //     		template: 'Please try again!'
    //   		});
  		// }
  		// else {
  		// 	$scope.notifications.$add({message: message, createdBy: $scope.email, md5: $scope.hashedEmail, dateCreated: Date.now()});
  		// 	$scope.message = null;
  		// }

  		$scope.notifications.$add({message: message, createdBy: $scope.email, gravatarURL: $scope.gravatarURL, dateCreated: Date.now(), tag: $scope.clubs[Math.floor(Math.random()*5)]});
  		$scope.message = null;
  	};

  	$scope.getGravatar = function(md5) {
  		return 'http://www.gravatar.com/avatar/' + notifications.md5;
  	};

    // $scope.refresh = function() {
    //   $scope.$broadcast('scroll.refreshComplete');
    // };
});
