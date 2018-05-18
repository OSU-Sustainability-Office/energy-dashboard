var viewStory;
var editStory;
angular.module('storyController', [])
    .controller('storyController', function ($route, $scope, $location, Dashboard, Story) {

        /*---------------------------------------------------------------------------------------
        ------------------------------------CREATE FUNCTIONS-------------------------------------
        ---------------------------------------------------------------------------------------*/
        function CreateStory() {
            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject($scope.nameForm)) {
                // call the create function from our service (returns a promise object)
                var StoryData = {
                    "name": $scope.nameForm,
                    "is_public" : $scope.publicCheck,
                    "dashboards": $scope.selectedDashboards
                };
                Story.create(StoryData)
                    // if successful creation
                    .success(function (data) {
                        $scope.nameForm = "";
                        Story.get()
                            .success(function (user_stories) {
                                $scope.stories = user_stories;
                                console.log($scope.stories);
                                $location.path('/');
                            });
                    });
            }
        }
        $scope.create = function () {
            editStory = null;
            $location.path('/createStory');
        };

        /*---------------------------------------------------------------------------------------
       ----------------------------------EDIT/UPDATE FUNCTIONS----------------------------------
       ---------------------------------------------------------------------------------------*/
        $scope.EditStory = function (story) {
            editStory = story;
            $location.path('/createStory');
        };

        $scope.getName = function () {
            if (editStory) {
                $scope.nameForm = editStory.name;
            }
        };
        $scope.getTitle = function () {
            if (editStory != null) {
                $scope.title = "Update Story";
                $scope.buttontext = "Update";
            } else {
                $scope.title = "Create Story";
                $scope.buttontext = "Create";
            }
        };
        $scope.getStoryDashboards = function () {
            $scope.selectedDashboards = [];
            $scope.user_dashboards = [];
            if (editStory != null) {
                Dashboard.getName()
                    .then(function (data) {
                        $scope.user_dashboards = data.data;
                        editStory.dashboards.forEach(function (dashboard) {
                            var count = 0;
                            $scope.user_dashboards.forEach(function (obj) {
                                if (obj._id == dashboard._id) {
                                    $scope.user_dashboards.splice(count, 1);
                                    $scope.selectedDashboards.push(obj);
                                    count++;
                                } else count++;
                            });
                        });
                        $scope.dashboardSelection = "";
                    });
            } else {
                Dashboard.getName()
                    .then(function (data) {
                        $scope.user_dashboards = data.data;
                    });
            }
        };

        $scope.selectedStory = viewStory;
        $scope.user_dashboards = [];

        $scope.selection = function (dashboard) {
            $scope.selectedDashboards.push(dashboard);
            var index = $scope.user_dashboards.indexOf(dashboard);
            if (index > -1) {
                $scope.user_dashboards.splice(index, 1);
            }
            $scope.dashboardSelection = "";
        };

        $scope.removeDashboard = function (dashboard) {
            $scope.user_dashboards.push(dashboard);
            var index = $scope.selectedDashboards.indexOf(dashboard);
            if (index > -1) {
                $scope.selectedDashboards.splice(index, 1);
            }
            $scope.dashboardSelection = "";
        };

        function UpdateStory() {
            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject($scope.nameForm)) {
                // call the create function from our service (returns a promise object)
                var StoryData = {
                    "_id": editStory._id,
                    "name": $scope.nameForm,
                    "is_public" : $scope.publicCheck,
                    "dashboards": $scope.selectedDashboards
                };
                Story.update(StoryData)
                    // if successful creation
                    .success(function (data) {
                        $scope.nameForm = "";
                        Story.get()
                            .success(function (user_stories) {
                                $scope.stories = user_stories;
                                $location.path('/');
                            });
                    });
            }
        }

        $scope.submit = function () {
            if (editStory) {
                UpdateStory();
            } else {
                /*
                Need to create an "Update" function and API
                 */
                CreateStory();
            }
        };

        $scope.viewStory = function (story) {
            viewStory = story;
            console.log(viewStory);
            $location.path('/viewStory');
        };

        $scope.DeleteStory = function (story) {
            console.log(story);
            Story.delete({
                    _id: story._id
                })
                .success(function () {
                    Story.get()
                        .success(function (user_stories) {
                            $scope.stories = user_stories;
                            $location.path('/');
                        });
                });
            $scope.getStories;
        };

        $scope.getStories = function(){
            Story.get()
                .success(function (user_stories) {
                    $scope.stories = user_stories;
                });
        };


        $scope.getPublicStories = function(){
            Story.getPublic().then(function (data) {
                $scope.publicStories = data.data;
            });
        }

    });