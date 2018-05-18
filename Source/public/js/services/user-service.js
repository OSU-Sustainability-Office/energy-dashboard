// js/services/user_service.js
angular.module('UserService', [])

    // super simple service
    // each function returns a promise object
    .factory('GetUser', function ($http) {
        return {
            get: function () {
                return $http.get('/api/google_user');
            }
        }
    })
    .factory('EmailRegistration', function ($http) {
        return {
            post: function (email) {
                return $http.post('/api/emailRegistration', email)
            }
        }
    });