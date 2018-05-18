var editBlock = null;
//needs a function that goes through each block in User.blocks and retrieves chart data from that object.
var blocksChartData = [];
let accept = true;
angular.module('blockController', [])
    .controller('blockController', function ($route, $scope, $rootScope, $http, $location, $timeout, Building, Block, GetBlockByID) {
        //this is to clear the selection
        $scope.maxValues = [];
        $scope.medValues = [];
        $scope.minValues = [];
        /*
        This is the function for removing from the dropdown
        and adding to the selection list group
         */
        $scope.selection = function (building) {
            $scope.selectedBuildings.push(building);
            var index = $scope.buildings.indexOf(building);
            if (index > -1) {
                $scope.buildings.splice(index, 1);
            }
            $scope.buildingSelection = "";
        };

        /*
        This is the function for removing from the selection list group
        and adding the building back to the dropdown menu
         */
        $scope.removeBuilding = function (building) {
            $scope.buildings.push(building);
            var index = $scope.selectedBuildings.indexOf(building);
            if (index > -1) {
                $scope.selectedBuildings.splice(index, 1);
            }
            $scope.buildingSelection = "";
        };

        /*
        A service call to retrieve all user blocks from API
        INPUT: the block that was selected from DOM
        OUTPUT: loads the $scope variable userBlocks with API data
        */
        Block.get()
            .success(function (data) {
                $scope.userBlocks = data;
            });

        /*
        A service call to delete a specific block when prompted
        INPUT: the block that was selected from DOM
        OUTPUT: reloads current page to show updated user blocks
        */
        $scope.DeleteBlock = function (block) {
            Block.delete({
                    _id: block._id
                })
                .success(function () {
                    $route.reload();
                });
        };

        /*
        A function called on ng-init of title H4 in create-block.html
        Sets scope variables depending on if user is creating or editing
        Sets title heading and submit button text
        */
        $scope.getTitle = function () {
            if (editBlock == null) {
                $scope.title = "Create Block";
                $scope.buttontext = "Create";
            } else {
                $scope.title = "Update Block";
                $scope.buttontext = "Update";
            }
        };

        /*
        This function is called on ng-click of the create block button in blocks.html
        makes sure that our edit variable is null to indicate we are creating
        */
        $scope.create = function () {
            editBlock = null;
        };

        /*
        A function called on ng-init of the dropdown menu for buildings
        This function checks the editBlock variable to see if the user is editing or not

        If Edit:
        the function calls two services, GetBlockByID
            --> which populates all the building objects in the API
        and then calls Building.get to populate the drop down of buildings
        The function then removes the buildings in the editblock from the dropdown and
        adds them to the selected buildings list group as if to "pre-populate" selections

        If creating:
        Calls the Building.get service to populate dropdown
        */
        $scope.getBlockBuildings = function () {
            if (editBlock != null) {
                GetBlockByID.get(editBlock)
                    .then(function (block) {
                        Building.get()
                            .then(function (data) {
                                $scope.buildings = data.data;
                                $scope.selectedBuildings = [];
                                block.data.building.forEach(function (building) {
                                    var count = 0;
                                    $scope.buildings.forEach(function (obj) {
                                        if (obj._id == building._id) {
                                            $scope.buildings.splice(count, 1);
                                            $scope.selectedBuildings.push(obj);
                                            count++;
                                        } else count++;
                                    });
                                });
                                $scope.buildingSelection = "";
                            });
                    });
            } else {
                Building.get()
                    .then(function (data) {
                        $scope.buildings = data.data;
                        $scope.selectedBuildings = [];
                    });
            }
        };

        /*---------------------------------------------------------------------------------------
        ----------------------------------EDIT/UPDATE FUNCTIONS----------------------------------
        ---------------------------------------------------------------------------------------*/

        /*
        This function is called on ng-click of the edit block button in blocks.html
        makes sure that our editBlock variable is set to the correct block
        */
        $scope.EditBlock = function (block) {
            editBlock = block;
            $location.path('/createblock');
        };

        /*
        A function called on ng-init of the nameForm input tag
        prepopulates input form with the name of the block being edited
        */
        $scope.getName = function () {
            if (editBlock != null) {
                $scope.nameForm = editBlock.name;
            }
        };

        /*
        A function called on ng-init of the chartForm input tag
        prepopulates input form with the chart-name of the block being edited
        */
        $scope.getChartType = function () {
            $scope.chart = "";
            if (editBlock != null) {
                if(editBlock.chart == 'line'){
                    $scope.linecheck = true;
                    $scope.chart.type = 'line';
                }
                else if(editBlock.chart == 'heat'){
                    $scope.heatcheck = true;
                    $scope.chart.type = 'heat';
                }
                $scope.chartForm = editBlock.chart;
            }
            else{
                $scope.chart.type = 'line';
            }
        };

        $scope.getPublicFlag = function(){
            if (editBlock != null) {
                $scope.publicCheck = editBlock.is_public;
            }
        };

        /*
        This function is called on ng-click of submit button,
        this decides whether to call the create API or edit API
        */
        $scope.submit = function () {
            if (editBlock == null) {
                CreateBlock();
            } else {
                /*
                Need to create an "Update" function and API
                 */
                UpdateBlock(editBlock);
            }
        };

        /*
        This function gathers all the form data and creates a block object
        it then passes this block object to the API to create and store in the database
        */
        function CreateBlock() {
            // validate the formData to make sure that something is there
            // if form is empty, nothing will happen
            // people can't just hold enter to keep adding the same to-do anymore
            if (!$.isEmptyObject($scope.nameForm) ) {
                // call the create function from our service (returns a promise object)
                var BlockData = {
                    "name": $scope.nameForm,
                    "chart": 'line',
                    "is_public" : $scope.publicCheck,
                    "buildings": $scope.selectedBuildings
                };
                console.log($scope.selectedBuildings);
                Block.create(BlockData)
                    // if successful creation
                    .success(function (data) {
                        $scope.nameForm = "";
                        $scope.chartForm = "";
                        $location.path('/blocks');
                    });
            }
        }

        $scope.printCSV =function(block){
            console.log(block);
            accept = true;
            $scope.$broadcast("GetBlockData", block);

        };
        $rootScope.$on("SendCSV", function(evt, data) {
            if(accept){
                accept = false;
                let csvContent = "data:application/octet-stream,";
                let row = "building," + data.l.join(",");
                csvContent += row + "\r\n";
                data.v.forEach(function(rowArray){
                    let row = rowArray.data.join(",");
                    csvContent += rowArray.label+","+ row + "\r\n";
                });

                var encodedUri = encodeURI(csvContent);
                window.open(encodedUri);
            }
        });
        /*
        Function to update block information by taking the id of the current block and 
        taking the $scope variables for updated info.
        */
        function UpdateBlock(editBlock) {
            var chart = $scope.chart.type;
            if(!$scope.chart.type){
                chart = 'line'
            }
            var update_block_data = {
                "_id": editBlock._id,
                "name": $scope.nameForm,
                "chart": chart,
                "is_public" : $scope.publicCheck,
                "building": $scope.selectedBuildings,
                "variable": 'Killowatts/Hr'
            };
            Block.update(update_block_data)
                .success(function () {
                    $location.path('/blocks');
                });
        }


    });