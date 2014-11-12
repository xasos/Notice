'use strict';

/**
 * @ngdoc overview
 * @name devFlowApp
 * @description
 * # devFlowApp
 *
 * Main module of the application.
 */
angular.module('devFlowApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'firebase',
    'firebase.utils',
    'simpleLogin'
  ]);

'use strict';

/**
 * @ngdoc function
 * @name devFlowApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the devFlowApp
 */
angular.module('devFlowApp')
  .controller('MainCtrl', ["$scope", function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);

angular.module('firebase.config', [])
  .constant('FBURL', 'https://trynotice.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])

  .constant('loginRedirectPath', '/login');


// a simple wrapper on Firebase and AngularFire to simplify deps and keep things DRY
angular.module('firebase.utils', ['firebase', 'firebase.config'])
  .factory('fbutil', ['$window', 'FBURL', '$firebase', function($window, FBURL, $firebase) {
    'use strict';

    return {
      syncObject: function(path, factoryConfig) { // jshint ignore:line
        return syncData.apply(null, arguments).$asObject();
      },

      syncArray: function(path, factoryConfig) { // jshint ignore:line
        return syncData.apply(null, arguments).$asArray();
      },

      ref: firebaseRef
    };

    function pathRef(args) {
      for (var i = 0; i < args.length; i++) {
        if (angular.isArray(args[i])) {
          args[i] = pathRef(args[i]);
        }
        else if( typeof args[i] !== 'string' ) {
          throw new Error('Argument '+i+' to firebaseRef is not a string: '+args[i]);
        }
      }
      return args.join('/');
    }

    /**
     * Example:
     * <code>
     *    function(firebaseRef) {
         *       var ref = firebaseRef('path/to/data');
         *    }
     * </code>
     *
     * @function
     * @name firebaseRef
     * @param {String|Array...} path relative path to the root folder in Firebase instance
     * @return a Firebase instance
     */
    function firebaseRef(path) { // jshint ignore:line
      var ref = new $window.Firebase(FBURL);
      var args = Array.prototype.slice.call(arguments);
      if( args.length ) {
        ref = ref.child(pathRef(args));
      }
      return ref;
    }

    /**
     * Create a $firebase reference with just a relative path. For example:
     *
     * <code>
     * function(syncData) {
         *    // a regular $firebase ref
         *    $scope.widget = syncData('widgets/alpha');
         *
         *    // or automatic 3-way binding
         *    syncData('widgets/alpha').$bind($scope, 'widget');
         * }
     * </code>
     *
     * Props is the second param passed into $firebase. It can also contain limit, startAt, endAt,
     * and they will be applied to the ref before passing into $firebase
     *
     * @function
     * @name syncData
     * @param {String|Array...} path relative path to the root folder in Firebase instance
     * @param {object} [props]
     * @return a Firebase instance
     */
    function syncData(path, props) {
      var ref = firebaseRef(path);
      props = angular.extend({}, props);
      angular.forEach(['limit', 'startAt', 'endAt'], function(k) {
        if( props.hasOwnProperty(k) ) {
          var v = props[k];
          ref = ref[k].apply(ref, angular.isArray(v)? v : [v]);
          delete props[k];
        }
      });
      return $firebase(ref, props);
    }
  }]);
'use strict';
/**
 * @ngdoc function
 * @name devFlowApp.controller:ChatCtrl
 * @description
 * # ChatCtrl
 * A demo of using AngularFire to manage a synchronized list.
 */
angular.module('devFlowApp')
  .controller('ChatCtrl', ["$scope", "fbutil", "$timeout", function ($scope, fbutil, $timeout) {
    // synchronize a read-only, synchronized array of messages, limit to most recent 10
    $scope.messages = fbutil.syncArray('messages', {limit: 10});

    // display any errors
    $scope.messages.$loaded().catch(alert);

    // provide a method for adding a message
    $scope.addMessage = function(newMessage) {
      if( newMessage ) {
        // push a message to the end of the array
        $scope.messages.$add({text: newMessage})
          // display any errors
          .catch(alert);
      }
    };

    function alert(msg) {
      $scope.err = msg;
      $timeout(function() {
        $scope.err = null;
      }, 5000);
    }
  }]);

'use strict';

angular.module('devFlowApp')
  .filter('reverse', function() {
    return function(items) {
      return angular.isArray(items)? items.slice().reverse() : [];
    };
  });

(function() {
  'use strict';
  angular.module('simpleLogin', ['firebase', 'firebase.utils', 'firebase.config'])

    // a simple wrapper on simpleLogin.getUser() that rejects the promise
    // if the user does not exists (i.e. makes user required), useful for
    // setting up secure routes that require authentication
    .factory('authRequired', ["simpleLogin", "$q", function(simpleLogin, $q) {
      return function() {
        return simpleLogin.getUser().then(function (user) {
          return user ? user : $q.reject({ authRequired: true });
        });
      };
    }])

    .factory('simpleLogin', ["$firebaseSimpleLogin", "fbutil", "$q", "$rootScope", "createProfile", "changeEmail", function($firebaseSimpleLogin, fbutil, $q, $rootScope, createProfile, changeEmail) {
      var auth = $firebaseSimpleLogin(fbutil.ref());
      var listeners = [];

      function statusChange() {
        fns.initialized = true;
        fns.user = auth.user || null;
        angular.forEach(listeners, function(fn) {
          fn(fns.user);
        });
      }

      var fns = {
        user: null,

        initialized: false,

        getUser: function() {
          return auth.$getCurrentUser();
        },

        login: function(provider, opts) {
          return auth.$login(provider, opts);
        },

        logout: function() {
          auth.$logout();
        },

        createAccount: function(email, pass, name) {
          return auth.$createUser(email, pass)
            .then(function() {
              // authenticate so we have permission to write to Firebase
              return fns.login('password', {email: email, password: pass});
            })
            .then(function(user) {
              // store user data in Firebase after creating account
              return createProfile(user.uid, email, name).then(function() {
                return user;
              });
            });
        },

        changePassword: function(email, oldpass, newpass) {
          return auth.$changePassword(email, oldpass, newpass);
        },

        changeEmail: function(password, newEmail) {
          return changeEmail(password, fns.user.email, newEmail, this);
        },

        removeUser: function(email, pass) {
          return auth.$removeUser(email, pass);
        },

        watch: function(cb, $scope) {
          listeners.push(cb);
          fns.getUser().then(function(user) {
            cb(user);
          });
          var unbind = function() {
            var i = listeners.indexOf(cb);
            if( i > -1 ) { listeners.splice(i, 1); }
          };
          if( $scope ) {
            $scope.$on('$destroy', unbind);
          }
          return unbind;
        }
      };

      $rootScope.$on('$firebaseSimpleLogin:login', statusChange);
      $rootScope.$on('$firebaseSimpleLogin:logout', statusChange);
      $rootScope.$on('$firebaseSimpleLogin:error', statusChange);
      auth.$getCurrentUser(statusChange);

      return fns;
    }])

    .factory('createProfile', ["fbutil", "$q", "$timeout", function(fbutil, $q, $timeout) {
      return function(id, email, name) {
        var ref = fbutil.ref('users', id), def = $q.defer();
        ref.set({email: email, name: name||firstPartOfEmail(email)}, function(err) {
          $timeout(function() {
            if( err ) {
              def.reject(err);
            }
            else {
              def.resolve(ref);
            }
          });
        });

        function firstPartOfEmail(email) {
          return ucfirst(email.substr(0, email.indexOf('@'))||'');
        }

        function ucfirst (str) {
          // credits: http://kevin.vanzonneveld.net
          str += '';
          var f = str.charAt(0).toUpperCase();
          return f + str.substr(1);
        }

        return def.promise;
      };
    }])

    .factory('changeEmail', ["fbutil", "$q", function(fbutil, $q) {
      return function(password, oldEmail, newEmail, simpleLogin) {
        var ctx = { old: { email: oldEmail }, curr: { email: newEmail } };

        // execute activities in order; first we authenticate the user
        return authOldAccount()
          // then we fetch old account details
          .then( loadOldProfile )
          // then we create a new account
          .then( createNewAccount )
          // then we copy old account info
          .then( copyProfile )
          // and once they safely exist, then we can delete the old ones
          // we have to authenticate as the old user again
          .then( authOldAccount )
          .then( removeOldProfile )
          .then( removeOldLogin )
          // and now authenticate as the new user
          .then( authNewAccount )
          .catch(function(err) { console.error(err); return $q.reject(err); });

        function authOldAccount() {
          return simpleLogin.login('password', {email: ctx.old.email, password: password})
            .then(function(user) {
              ctx.old.uid = user.uid;
            });
        }

        function loadOldProfile() {
          var def = $q.defer();
          ctx.old.ref = fbutil.ref('users', ctx.old.uid);
          ctx.old.ref.once('value',
            function(snap){
              var dat = snap.val();
              if( dat === null ) {
                def.reject(oldEmail + ' not found');
              }
              else {
                ctx.old.name = dat.name;
                ctx.curr.name = dat.name;
                def.resolve();
              }
            },
            function(err){
              def.reject(err);
            });
          return def.promise;
        }

        function createNewAccount() {
          return simpleLogin.createAccount(ctx.curr.email, password, ctx.old.name).then(function(user) {
            ctx.curr.uid = user.uid;
          });
        }

        function copyProfile() {
          var d = $q.defer();
          ctx.curr.ref = fbutil.ref('users', ctx.curr.uid);
          var profile = {email: ctx.curr.email, name: ctx.curr.name};
          ctx.curr.ref.set(profile, function(err) {
            if (err) {
              d.reject(err);
            } else {
              d.resolve();
            }
          });
          return d.promise;
        }

        function removeOldProfile() {
          var d = $q.defer();
          ctx.old.ref.remove(function(err) {
            if (err) {
              d.reject(err);
            } else {
              d.resolve();
            }
          });
          return d.promise;
        }

        function removeOldLogin() {
          var def = $q.defer();
          simpleLogin.removeUser(ctx.old.email, password).then(function() {
            def.resolve();
          }, function(err) {
            def.reject(err);
          });
          return def.promise;
        }

        function authNewAccount() {
          return simpleLogin.login('password', {email: ctx.curr.email, password: password});
        }
      };
    }]);
})();
'use strict';
/**
 * @ngdoc function
 * @name devFlowApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('devFlowApp')
  .controller('LoginCtrl', ["$scope", "simpleLogin", "$location", function ($scope, simpleLogin, $location) {
    $scope.passwordLogin = function(email, pass) {
      login('password', {
        email: email,
        password: pass,
        rememberMe: true
      });
    };

    $scope.createAccount = function(email, pass, confirm) {
      $scope.err = null;
      if( !pass ) {
        $scope.err = 'Please enter a password';
      }
      else if( pass !== confirm ) {
        $scope.err = 'Passwords do not match';
      }
      else {
        simpleLogin.createAccount(email, pass/*, name*/)
          .then(function() {
            $location.path('/account');
          }, function(err) {
            $scope.err = err;
          });
      }
    };

    function login(provider, opts) {
      $scope.err = null;
      simpleLogin.login(provider, opts).then(
        function() {
          $location.path('/account');
        },
        function(err) {
          $scope.err = err;
        }
      );
    }

  }]);
'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('devFlowApp')
  .controller('AccountCtrl', ["$scope", "user", "simpleLogin", "fbutil", "$timeout", function ($scope, user, simpleLogin, fbutil, $timeout) {
    $scope.user = user;
    $scope.logout = simpleLogin.logout;
    $scope.messages = [];
    loadProfile(user);

    $scope.changePassword = function(oldPass, newPass, confirm) {
      $scope.err = null;
      if( !oldPass || !newPass ) {
        error('Please enter all fields');
      }
      else if( newPass !== confirm ) {
        error('Passwords do not match');
      }
      else {
        simpleLogin.changePassword(user.email, oldPass, newPass)
          .then(function() {
            success('Password changed');
          }, error);
      }
    };

    $scope.changeEmail = function(pass, newEmail) {
      $scope.err = null;
      simpleLogin.changeEmail(pass, newEmail)
        .then(function(user) {
          loadProfile(user);
          success('Email changed');
        })
        .catch(error);
    };

    function error(err) {
      alert(err, 'danger');
    }

    function success(msg) {
      alert(msg, 'success');
    }

    function alert(msg, type) {
      var obj = {text: msg, type: type};
      $scope.messages.unshift(obj);
      $timeout(function() {
        $scope.messages.splice($scope.messages.indexOf(obj), 1);
      }, 10000);
    }

    function loadProfile(user) {
      if( $scope.profile ) {
        $scope.profile.$destroy();
      }
      fbutil.syncObject('users/'+user.uid).$bindTo($scope, 'profile');
    }
  }]);
/**
 * @ngdoc function
 * @name devFlowApp.directive:ngShowAuth
 * @description
 * # ngShowAuthDirective
 * A directive that shows elements only when user is logged in. It also waits for simpleLogin
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('devFlowApp')
  .directive('ngShowAuth', ['simpleLogin', '$timeout', function (simpleLogin, $timeout) {
    'use strict';
    var isLoggedIn;
    simpleLogin.watch(function(user) {
      isLoggedIn = !!user;
    });

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it

        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', !isLoggedIn);
          }, 0);
        }

        simpleLogin.watch(update, scope);
        simpleLogin.getUser(update);
      }
    };
  }]);


/**
 * @ngdoc function
 * @name devFlowApp.directive:ngHideAuth
 * @description
 * # ngHideAuthDirective
 * A directive that shows elements only when user is logged out. It also waits for simpleLogin
 * to be initialized so there is no initial flashing of incorrect state.
 */
angular.module('devFlowApp')
  .directive('ngHideAuth', ['simpleLogin', '$timeout', function (simpleLogin, $timeout) {
    'use strict';
    var isLoggedIn;
    simpleLogin.watch(function(user) {
      isLoggedIn = !!user;
    });

    return {
      restrict: 'A',
      link: function(scope, el) {
        el.addClass('ng-cloak'); // hide until we process it
        function update() {
          // sometimes if ngCloak exists on same element, they argue, so make sure that
          // this one always runs last for reliability
          $timeout(function () {
            el.toggleClass('ng-cloak', isLoggedIn !== false);
          }, 0);
        }

        simpleLogin.watch(update, scope);
        simpleLogin.getUser(update);
      }
    };
  }]);

'use strict';
/**
 * @ngdoc overview
 * @name devFlowApp:routes
 * @description
 * # routes.js
 *
 * Configure routes for use with Angular, and apply authentication security
 * Add new routes to the ROUTES constant or use yo angularfire:route to create them
 *
 * Any controller can be secured so that it will only load if user is logged in by
 * using `whenAuthenticated()` in place of `when()`. This requires the user to
 * be logged in to view this route, and adds the current user into the dependencies
 * which can be injected into the controller. If user is not logged in, the promise is
 * rejected, which is handled below by $routeChangeError
 *
 * Any controller can be forced to wait for authentication to resolve, without necessarily
 * requiring the user to be logged in, by adding a `resolve` block similar to the one below.
 * It would then inject `user` as a dependency. This could also be done in the controller,
 * but abstracting it makes things cleaner (controllers don't need to worry about auth state
 * or timing of displaying its UI components; it can assume it is taken care of when it runs)
 *
 *   resolve: {
 *     user: ['simpleLogin', function(simpleLogin) {
 *       return simpleLogin.getUser();
 *     }]
 *   }
 *
 */
angular.module('devFlowApp')

/**
 * Adds a special `whenAuthenticated` method onto $routeProvider. This special method,
 * when called, invokes the authRequired() service (see simpleLogin.js).
 *
 * The promise either resolves to the authenticated user object and makes it available to
 * dependency injection (see AccountCtrl), or rejects the promise if user is not logged in,
 * forcing a redirect to the /login page
 */
  .config(['$routeProvider', 'SECURED_ROUTES', function($routeProvider, SECURED_ROUTES) {
    // credits for this idea: https://groups.google.com/forum/#!msg/angular/dPr9BpIZID0/MgWVluo_Tg8J
    // unfortunately, a decorator cannot be use here because they are not applied until after
    // the .config calls resolve, so they can't be used during route configuration, so we have
    // to hack it directly onto the $routeProvider object
    $routeProvider.whenAuthenticated = function(path, route) {
      route.resolve = route.resolve || {};
      route.resolve.user = ['authRequired', function(authRequired) {
        return authRequired();
      }];
      $routeProvider.when(path, route);
      SECURED_ROUTES[path] = true;
      return $routeProvider;
    };
  }])

  // configure views; the authRequired parameter is used for specifying pages
  // which should only be available while logged in
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })

      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      })

      .when('/chat', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })

      .whenAuthenticated('/account', {
        templateUrl: 'views/account.html',
        controller: 'AccountCtrl'
      })

      .when('/chat', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })
      .when('/dashboard', {
        templateUrl: 'views/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .when('/profile/:name', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileCtrl'
      })
      .when('/dashboard', {
      templateUrl: 'views/dashboard.html',
      controller: 'DashboardCtrl'
      })
      .when('/profile', {
      templateUrl: 'views/profile.html',
      controller: 'ProfileCtrl'
      })
      .otherwise({redirectTo: '/'});
  }])

  /**
   * Apply some route security. Any route's resolve method can reject the promise with
   * { authRequired: true } to force a redirect. This method enforces that and also watches
   * for changes in auth status which might require us to navigate away from a path
   * that we can no longer view.
   */
  .run(['$rootScope', '$location', 'simpleLogin', 'SECURED_ROUTES', 'loginRedirectPath',
    function($rootScope, $location, simpleLogin, SECURED_ROUTES, loginRedirectPath) {
      // watch for login status changes and redirect if appropriate
      simpleLogin.watch(check, $rootScope);

      // some of our routes may reject resolve promises with the special {authRequired: true} error
      // this redirects to the login page whenever that is encountered
      $rootScope.$on('$routeChangeError', function(e, next, prev, err) {
        if( angular.isObject(err) && err.authRequired ) {
          $location.path(loginRedirectPath);
        }
      });

      function check(user) {
        if( !user && authRequired($location.path()) ) {
          $location.path(loginRedirectPath);
        }
      }

      function authRequired(path) {
        return SECURED_ROUTES.hasOwnProperty(path);
      }
    }
  ])

  // used by route security
  .constant('SECURED_ROUTES', {});

'use strict';

/**
 * @ngdoc function
 * @name devFlowApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the devFlowApp
 */
angular.module('devFlowApp')
  .controller('ProfileCtrl', ["$scope", function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);

'use strict';

/**
 * @ngdoc function
 * @name devFlowApp.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the devFlowApp
 */
angular.module('devFlowApp')
  .controller('DashboardCtrl', ["$scope", function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  }]);
