// js/services/building-service.js
angular.module('ChartService', [])

    // super simple service
    // each function returns a promise object
    .factory('Chart', function ($http) {
        return {
            create: function (buildingData) {
                return $http.post('/api/addBuilding', buildingData);
            },
            get: function (buildings) {
                return $http.get('/api/buildings');
            },
            delete: function (building) {
                return $http.post('/api/deleteBuilding', building);
            },
            getById: function (id) {
                return $http({
                    url: '/api/getChartData',
                    method: "GET",
                    params: {
                        _id: id
                    }
                });
            }
        }
    });