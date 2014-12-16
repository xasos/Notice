'use strict';

angular.module('MyApp.controllers')
    .controller('DashboardCtrl', function($firebase, $scope, Auth, md5, $ionicModal, User, $http) {

        $scope.message = '';
        $scope.activityName = '';

        // Initialize reference to Firebase object
        var noticeRef = new Firebase('https://trynotice.firebaseio.com/notifications');
        $scope.notifications = $firebase(noticeRef);

        // Test email and check if student + create Gravatar image
        $scope.email = Auth.currentUser.email;
        $scope.isStudent = /([\._a-zA-Z0-9-]+@students.d211.org)/.test($scope.email);
        $scope.gravatarURL = 'http://www.gravatar.com/avatar/' + md5.createHash($scope.email);

        // Get users from a returned url to get json object from Firebase
        $http.get(User.getSubscriptions())
            .success(function(data) {
                if (data == null) {
                    $scope.subscriptions = [{
                        id: 1,
                        name: 'Math Team',
                        color: '#43cee6',
                        isChecked: false
                    }, {
                        id: 2,
                        name: 'Basketball',
                        color: '#4a87ee',
                        isChecked: false
                    }, {
                        id: 3,
                        name: 'Horticulture Club',
                        color: '#ef4e3a',
                        isChecked: false
                    }, {
                        id: 4,
                        name: 'Science Olympiad',
                        color: '#8a6de9',
                        isChecked: false
                    }];
                } else {
                    $scope.subscriptions = data;
                }
            });

        // Post notification to Firebase
        $scope.postNotification = function(message, tag, color) {
            if (tag != null) {
                $scope.notifications.$add({
                    message: message,
                    createdBy: $scope.email,
                    gravatarURL: $scope.gravatarURL,
                    dateCreated: Date.now(),
                    tag: tag,
                    color: color
                });
                $scope.message = null;
            }
        };

        // Update subscriptions in Firebase
        $scope.manage = function() {
            User.manageSubscriptions($scope.subscriptions);
        };

        // Return gravatar url of user to get image in view
        $scope.getGravatar = function(md5) {
            return 'http://www.gravatar.com/avatar/' + notifications.md5;
        };

        // Modal to change subscription preferences
        $ionicModal.fromTemplateUrl('templates/modal.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.modal = modal;
        });

        // Filters subscriptions based on user preference
        $scope.filterSubscriptions = function(index) {
            console.log(User.getSubscriptions())
            console.log(index)
            if (User.getSubscriptions()[0].name == $scope.notifications[index].tag) {
                return true;
            } else {
                return false;
            }
        };
    })

// Filter to return json object in reverse order
.filter('reverse', function() {
    function toArray(list) {
        var k, out = [];
        if (list) {
            if (angular.isArray(list)) {
                out = list;
            } else if (typeof(list) === 'object') {
                for (k in list) {
                    if (list.hasOwnProperty(k)) {
                        out.push(list[k]);
                    }
                }
            }
        }
        return out;
    }
    return function(items) {
        return toArray(items).slice().reverse();
    };
});
