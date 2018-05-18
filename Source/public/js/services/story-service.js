// js/services/story-service.js
angular.module('StoryService', [])

    // super simple service
    // each function returns a promise object
    .factory('Story', function ($http) {
        return {
            create: function (storyData) {
                return $http.post('/api/addStory', storyData);
            },
            delete: function (id) {
                return $http.post('/api/deleteStory', id);
            },
            update: function (story) {
                return $http.post('/api/updateStory', story);
            },
            getPublic: function () {
                return $http.get('/api/getPublicStories');
            },
            get: function () {
                return $http.get('/api/getUserStories');
            }
        }
    });