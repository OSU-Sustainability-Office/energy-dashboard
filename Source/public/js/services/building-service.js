// js/services/building-service.js
angular.module('BuildingService', [])

    // super simple service
    // each function returns a promise object
    .factory('Building', function ($http) {
        return {
            create: function (buildingData) {
                return $http.post('/api/addBuilding', buildingData);
            },
            csv: function (block) {
                return $http.post('/api/toCSV', block);
            },
            get: function () {
                return $http.get('/api/buildings');
            },
            delete: function (building) {
                return $http.post('/api/deleteBuilding', building);
            },
            update: function (building) {
                return $http.post('/api/updateBuilding', building);
            },
            getById: function (id) {
                return $http({
                    url: '/api/getBuildingById',
                    method: "GET",
                    params: {
                        _id: id
                    }
                }).then(function (response) {
                    return response.data;
                }, function (error) {
                    alert(error);
                });
            },
            getBuildingData: function (buildings) {
                return $http({
                    url: '/api/getBuildingData',
                    method: "GET",
                    params: {
                        buildings: buildings.buildings,
                        variable: buildings.var,
                        start: buildings.start,
                        end: buildings.end
                    }
                });
            }
        }
    });
