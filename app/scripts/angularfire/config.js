angular.module('firebase.config', [])
  .constant('FBURL', 'https://trynotice.firebaseio.com')
  .constant('SIMPLE_LOGIN_PROVIDERS', ['password'])

  .constant('loginRedirectPath', '/login');
