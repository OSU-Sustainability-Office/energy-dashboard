var editMeter = null;
angular.module('meterController', [])
    .controller('meterController', function ($scope, $location, $route, Meter, Building) {
        $scope.buttonText = "Create";
        $scope.meterFormTitle = "Add a Meter";

        /*
        Meter Service to call getMeter API
         */
        Meter.get()
            .success(function (data) {
                $scope.meters = data;
            });

        /*---------------------------------------------------------------------------------------
        ------------------------------------CREATE FUNCTIONS-------------------------------------
        ---------------------------------------------------------------------------------------*/
        $scope.addMeter = function (meter) {
            editMeter = null;
            $location.path('/addmeter');
        };

        function createMeter() {
            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject($scope.meterNameForm) && !$.isEmptyObject($scope.meterSerialForm)) {
                // call the create function from our service (returns a promise object)
                var meterData = {
                    "name": $scope.meterNameForm,
                    "meter_id": $scope.meterSerialForm,
                    "building": $scope.buildingSelection
                };

                Meter.create(meterData)
                    // if successful creation
                    .success(function (meter) {
                        $scope.meterNameForm = "";
                        $scope.meterSerialForm = "";
                        $location.path('/meters');
                    });
            }
        }
        /*---------------------------------------------------------------------------------------
        ----------------------------------EDIT/UPDATE FUNCTIONS----------------------------------
        ---------------------------------------------------------------------------------------*/

        /*
        Building Service to call getBuilding API
         */
        $scope.EditMeter = function (meter) {
            editMeter = meter;
            $location.path('/addmeter');
        };

        $scope.getMeterName = function () {
            if (editMeter != null) {
                $scope.meterNameForm = editMeter.name;
            }
        };

        $scope.getMeterSerial = function () {
            if (editMeter != null) {
                $scope.meterSerialForm = editMeter.meter_id;
            }
        };

        function UpdateMeter(editMeter) {
            if (!$.isEmptyObject($scope.meterNameForm) && !$.isEmptyObject($scope.meterSerialForm)) {
                // call the create function from our service (returns a promise object)
                var meterData = {
                    "name": $scope.meterNameForm,
                    "meter_id": $scope.meterSerialForm,
                    "id": editMeter._id
                };

                Meter.update(meterData)
                    // if successful creation
                    .success(function (meter) {
                        $scope.nameForm = "";
                        $scope.serialForm = "";
                        $location.path('/meters');
                    });
            }
        }

        /*
        A function called on ng-init of title H4 in create-block.html
        Sets scope variables depending on if user is creating or editing
        Sets title heading and submit button text
        */
        $scope.getTitle = function () {
            if (editMeter == null) {
                $scope.title = "Create Meter";
                $scope.buttontext = "Create";
            } else {
                $scope.title = "Update Meter";
                $scope.buttontext = "Update";
            }
        };

        /*
        This function is called on ng-click of submit button,
        this decides whether to call the create API or edit API
        */
        $scope.submit = function () {
            if (editMeter == null) {
                createMeter();
            } else {
                UpdateMeter(editMeter);
            }
        };

        $scope.DeleteMeter = function (meter) {
            Meter.delete(meter)
                .success(function () {
                    $route.reload();
                });
        };

    });