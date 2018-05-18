// js/services/block-service.js
angular.module('MeterService', [])
    // super simple service
    // each function returns a promise object
    .factory('Meter', function ($http) {
        return {
            create: function (meterData) {
                return $http.post('/api/addMeter', meterData);
            },
            delete: function (meter) {
                return $http.post('/api/deleteMeter', meter);
            },
            update: function (meter) {
                return $http.post('/api/updateMeter', meter);
            },
            get: function () {
                return $http.get('/api/getMeters');
            },
            getById: function (id) {
                return $http({
                    url: '/api/getMeterById',
                    method: "GET",
                    params: {
                        meter_id: id
                    }
                }).then(function (response) {
                    return response.data;
                }, function (error) {
                    alert(error);
                });
            }
        }
    });