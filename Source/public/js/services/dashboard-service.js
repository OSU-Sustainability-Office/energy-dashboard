// js/services/block-service.js
angular.module('DashboardService', [])

    // super simple service
    // each function returns a promise object
    .factory('Dashboard', function ($http) {
        return {
            create: function (dashboardData) {
                return $http.post('/api/addDashboard', dashboardData);
            },
            delete: function (dashboard) {
                return $http.post('/api/deleteDashboard', dashboard);
            },
            update: function (dashboard) {
                return $http.post('/api/updateDashboard', dashboard);
            },
            getName: function () {
                return $http.get('/api/getDashboardNames');
            },
            getPublic: function () {
                return $http.get('/api/getPublicDashboards');
            },
            get: function () {
                return $http.get('/api/getDashboards');
            }
        }
    })