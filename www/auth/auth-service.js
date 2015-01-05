'use strict';

angular.module('MyApp.services').service('Auth',
  function($q, FIREBASE_ROOT, $firebaseSimpleLogin) {
    var self = this;
    var firebaseSimpleLogin = $firebaseSimpleLogin(new Firebase(FIREBASE_ROOT)); //Create Firebase Simple login instance at Firebase root

    this.currentUser = null;

    // gets current user if logged in 
    this.getCurrentUser = function() {
      var defer = $q.defer();
      
      firebaseSimpleLogin.$getCurrentUser().then(function(user) {
        self.currentUser = user;
        
        if (user === null) {
          defer.reject();
        } else {
          defer.resolve(user);
        }
      });

      return defer.promise;
    };

    // create user with email and password
    this.createUser = function(email, password) {
      var defer = $q.defer();

      firebaseSimpleLogin.$createUser(email, password).then(
        function(user) {
          self.currentUser = user;
          defer.resolve(user);
        },
        function(error) {
          self.currentUser = null;
          defer.reject(error);
        });

      return defer.promise;
    };

    // login with email and hashed password
    this.login = function(email, password) {
      var defer = $q.defer();

      firebaseSimpleLogin.$login('password', { email: email, password: password }).then(
        function(user) {
          self.currentUser = user;
          defer.resolve(user);
        },
        function(error) {
          self.currentUser = null;
          defer.reject(error);
        });

      return defer.promise;
    };

    // exits no matter what state app is in 
    this.logout = function() {
      firebaseSimpleLogin.$logout();
      this.currentUser = null;
    };

    // uses firebase email service to reset email
    this.sendPasswordResetEmail = function(email) {
      return firebaseSimpleLogin.$sendPasswordResetEmail(email);
    };

    // changes password to new password (all hashed)
    this.changePassword = function(oldPassword, newPassword) {
      return firebaseSimpleLogin.$changePassword(this.currentUser.email, oldPassword, newPassword);
    };
  });
