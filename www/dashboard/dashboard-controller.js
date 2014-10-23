'use strict';

angular.module('MyApp.controllers')
.value('BASE_URL', 'https://noticeapp.firebaseio.com/')
.controller('DashboardCtrl', function($firebase, $scope, Auth, md5, ui.utils) {
    var noticeRef = new Firebase('https://noticeapp.firebaseio.com/notifications');
  	// var activityRef = new Firebase('https://noticeapp.firebaseio.com/activities');
   //  $scope.activities = $firebase(activityRef);
  	$scope.notifications = $firebase(noticeRef);  	
  	$scope.email = Auth.currentUser.email;
  	$scope.message = "";
    $scope.activityName = "";
    
  	
$scope.clubs = [
    { id: 1, name: 'Math Teams', color: 'green' },
    { id: 2, name: 'Basketball', color: 'red' },
    { id: 3, name: 'Horticulture Club', color: 'orange' },
    { id: 4, name: 'Science Olympiad', color: 'blue'}];


  	$scope.gravatarURL = 'http://www.gravatar.com/avatar/' + md5.createHash($scope.email); 

  	$scope.postNotification = function(message, tag) {
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

  		$scope.notifications.$add({message: message, createdBy: $scope.email, gravatarURL: $scope.gravatarURL, dateCreated: Date.now(), tag: tag});
  		$scope.message = null;
  	};

  	$scope.getGravatar = function(md5) {
  		return 'http://www.gravatar.com/avatar/' + notifications.md5;
  	};

    // $scope.refresh = function() {
    //   $scope.$broadcast('scroll.refreshComplete');
    // };
});
