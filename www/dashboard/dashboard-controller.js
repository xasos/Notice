'use strict';

angular.module('MyApp.controllers')
.value('BASE_URL', 'https://noticeapp.firebaseio.com/')
.controller('DashboardCtrl', function($firebase, $scope, Auth, md5) {
    var noticeRef = new Firebase('https://noticeapp.firebaseio.com/notifications');
    $scope.notifications = $firebase(noticeRef);  	
    $scope.email = Auth.currentUser.email;
    $scope.message = '';
    $scope.activityName = '';
    
    $scope.clubs = [
    { id: 1, name: 'Math Team', color: '#43cee6' },
    { id: 2, name: 'Basketball', color: '#4a87ee' },
    { id: 3, name: 'Horticulture Club', color: '#ef4e3a' },
    { id: 4, name: 'Science Olympiad', color: '#8a6de9'}];

    $scope.gravatarURL = 'http://www.gravatar.com/avatar/' + md5.createHash($scope.email); 

    $scope.postNotification = function(message, tag, color) {
        $scope.notifications.$add({message: message, createdBy: $scope.email, gravatarURL: $scope.gravatarURL, dateCreated: Date.now(), tag: tag, color: color});
  	    $scope.message = null;
    };

    $scope.getGravatar = function(md5) {
        return 'http://www.gravatar.com/avatar/' + notifications.md5;
    };
})
.filter('reverse', function() {
      function toArray(list) {
         var k, out = [];
         if( list ) {
            if( angular.isArray(list) ) {
               out = list;
            }
            else if( typeof(list) === 'object' ) {
               for (k in list) {
                  if (list.hasOwnProperty(k)) { out.push(list[k]); }
               }
            }
         }
         return out;
      }
      return function(items) {
         return toArray(items).slice().reverse();
      };
});
