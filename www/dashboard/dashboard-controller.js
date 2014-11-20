'use strict';

angular.module('MyApp.controllers')
.value('BASE_URL', 'https://noticeapp.firebaseio.com/')
.controller('DashboardCtrl', function($firebase, $scope, Auth, md5, $ionicModal, User, $rootScope) {
    var noticeRef = new Firebase('https://trynotice.firebaseio.com/notifications');
    $scope.notifications = $firebase(noticeRef);  	
    
    $rootScope.email = Auth.currentUser.email;
    $scope.message = '';
    $scope.activityName = '';
    $scope.isStudent = /([\._a-zA-Z0-9-]+@students.d211.org)/.test($rootScope.email);
    $scope.subscriptions = '';
    
    if(User.getSubscriptions) {
        $scope.subscriptions = User.getSubscriptions;
        console.log('yo1');
        console.log($scope.subscriptions);
    }
    else {
        $scope.subscriptions = [{ id: 1, name: 'Math Team', color: '#43cee6', isChecked: false },
        { id: 2, name: 'Basketball', color: '#4a87ee', isChecked: false },	
        { id: 3, name: 'Horticulture Club', color: '#ef4e3a', isChecked: false },		
        { id: 4, name: 'Science Olympiad', color: '#8a6de9', isChecked: false }];
        console.log('yo2');
    }
    
    $scope.clubs = [
    { id: 1, name: 'Math Team', color: '#43cee6' },
    { id: 2, name: 'Basketball', color: '#4a87ee' },
    { id: 3, name: 'Horticulture Club', color: '#ef4e3a' },
    { id: 4, name: 'Science Olympiad', color: '#8a6de9'}];

    $scope.gravatarURL = 'http://www.gravatar.com/avatar/' + md5.createHash($rootScope.email); 
    
    $scope.manage = function() {
        User.manageSubscriptions($scope.subscriptions);
    };
    
    $scope.postNotification = function(message, tag, color) {
        $scope.notifications.$add({message: message, createdBy: $rootScope.email, gravatarURL: $scope.gravatarURL, dateCreated: Date.now(), tag: tag, color: color});
  	    $scope.message = null;
    };

    $scope.getGravatar = function(md5) {
        return 'http://www.gravatar.com/avatar/' + notifications.md5;
    };
    
    $ionicModal.fromTemplateUrl('templates/modal.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
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
