var viewDashboard;
var editDashboard;
angular.module('dashboardController', [])
    .controller('dashboardController', function ($route, $scope, $location, Dashboard, Block) {

        /*---------------------------------------------------------------------------------------
        ------------------------------------CREATE FUNCTIONS-------------------------------------
        ---------------------------------------------------------------------------------------*/
        function CreateDashboard() {
            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject($scope.nameForm) && !$.isEmptyObject($scope.descriptionForm)) {
                // call the create function from our service (returns a promise object)
                var DashboardData = {
                    "name": $scope.nameForm,
                    "description": $scope.descriptionForm,
                    "is_public" : $scope.publicCheck,
                    "blocks": $scope.selectedBlocks
                };
                Dashboard.create(DashboardData)
                    // if successful creation
                    .success(function (data) {
                        $scope.nameForm = "";
                        $scope.descriptionForm = "";
                        $location.path('/dashboards');
                    });
            }
        }
        $scope.create = function () {
            editDashboard = null;
            $location.path('/createdashboard');
        };
        /*---------------------------------------------------------------------------------------
        ----------------------------------EDIT/UPDATE FUNCTIONS----------------------------------
        ---------------------------------------------------------------------------------------*/

        $scope.EditDashboard = function (dashboard) {
            editDashboard = dashboard;
            $location.path('/createdashboard');
        };

        $scope.getPublicFlag = function(){
            if (editDashboard != null) {
                $scope.publicCheck = editDashboard.is_public;
            }
        };
        $scope.getTitle = function () {
            if (editDashboard != null) {
                $scope.title = "Update Dashboard";
                $scope.buttontext = "Update";
            } else {
                $scope.title = "Create Dashboard";
                $scope.buttontext = "Create";
            }
        };

        $scope.getDescription = function () {
            if (editDashboard) {
                $scope.descriptionForm = editDashboard.description;
            }
        };

        $scope.getName = function () {
            if (editDashboard) {
                $scope.nameForm = editDashboard.name;
            }
        };

        $scope.getDashboardBlocks = function () {
            $scope.selectedBlocks = [];
            $scope.userBlocks = [];
            if (editDashboard != null) {
                Block.getForDashboard()
                    .then(function (data) {
                        $scope.userBlocks = data.data;
                        editDashboard.blocks.forEach(function (block) {
                            var count = 0;
                            $scope.userBlocks.forEach(function (obj) {
                                if (obj._id == block._id) {
                                    $scope.userBlocks.splice(count, 1);
                                    $scope.selectedBlocks.push(obj);
                                    count++;
                                } else count++;
                            });
                        });
                        $scope.blockSelection = "";
                    });
            } else {
                Block.getForDashboard()
                    .then(function (data) {
                        $scope.userBlocks = data.data;
                    });
            }
        };
        /*---------------------------------------------------------------------------------------
        -------------------------------------VIEW FUNCTIONS--------------------------------------
        ---------------------------------------------------------------------------------------*/

        Dashboard.get()
            .success(function (data) {
                $scope.dashboards = data;
            });


        $scope.selection = function (block) {
            $scope.selectedBlocks.push(block);
            var index = $scope.userBlocks.indexOf(block);
            if (index > -1) {
                $scope.userBlocks.splice(index, 1);
            }
            $scope.blockSelection = "";
        };

        $scope.removeBlock = function (block) {
            $scope.userBlocks.push(block);
            var index = $scope.selectedBlocks.indexOf(block);
            if (index > -1) {
                $scope.selectedBlocks.splice(index, 1);
            }
            $scope.blockSelection = "";
        };

        function UpdateDashboard() {
            console.log($scope.selectedBlocks);
            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject($scope.nameForm) && !$.isEmptyObject($scope.descriptionForm)) {
                // call the create function from our service (returns a promise object)
                var DashboardData = {
                    "_id": editDashboard._id,
                    "name": $scope.nameForm,
                    "description": $scope.descriptionForm,
                    "is_public" : $scope.publicCheck,
                    "blocks": $scope.selectedBlocks
                };

                Dashboard.update(DashboardData)
                    // if successful creation
                    .then(function (data) {
                        $scope.nameForm = "";
                        $scope.descriptionForm = "";
                        $location.path('/dashboards');
                    });
            }
        }

        $scope.DeleteDashboard = function (dashboard) {
            Dashboard.delete({
                    _id: dashboard._id
                })
                .success(function () {
                    $location.path('/dashboards');
                });
        };

        $scope.ViewDashboard = function (dashboard) {
            viewDashboard = dashboard;
            $location.path('/viewdashboard');
        };

        $scope.getView = function () {
            $scope.selectedDashboard = viewDashboard;
        };

        $scope.submit = function () {
            if (editDashboard) {
                UpdateDashboard();
            } else {
                /*
                Need to create an "Update" function and API
                 */
                CreateDashboard();
            }
        };

        $scope.getPublicDashboards = function(){
            Dashboard.getPublic().then(function (data) {
                $scope.publicDashboards = data.data;
            });
        }

    });