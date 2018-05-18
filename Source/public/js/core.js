var myApp = angular.module('myApp', ['dashboardController', 'mainController', 'blockController',
    'buildingController', 'mapController', 'meterController', 'storyController', 'sideNavController', 'chartController',
    'BlockService', 'UserService', 'MeterService', 'BuildingService',
    'DashboardService', 'StoryService', 'ngRoute'
]);
myApp.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        ///////////////////////////
        ///////HOME PAGE///////
        ///////////////////////////
        .when("/", {
            templateUrl: "../views/home.html"
        })

        ///////////////////////////
        ///////TOP NAV ITEMS///////
        ///////////////////////////
        .when("/about", {
            templateUrl: "../views/top-nav-views/about.html"
        })
        .when("/contact", {
            templateUrl: "../views/top-nav-views/contact.html"
        })
        .when("/register", {
            templateUrl: "../views/register.html"
        })

        ///////////////////////////
        ////////DASHBOARDS/////////
        ///////////////////////////
        .when("/dashboards", {
            templateUrl: "../views/dashboard/dashboards.html"
        })
        .when("/createdashboard", {
            templateUrl: "../views/dashboard/create-dashboard.html"
        })
        .when("/viewdashboard", {
            templateUrl: "../views/dashboard/view-dashboard.html"
        })
        .when("/public-dashboards", {
            templateUrl: "../views/dashboard/public-dashboard.html"
        })


        ///////////////////////////
        //////////BLOCKS///////////
        ///////////////////////////
        .when("/editblock", {
            templateUrl: "../views/block/edit-block.html"
        })
        .when("/blocks", {
            templateUrl: "../views/block/blocks.html"
        })
        .when("/createblock", {
            templateUrl: "../views/block/create-block.html"
        })

        ///////////////////////////
        /////////STORIES///////////
        ///////////////////////////
        .when("/createStory", {
            templateUrl: "../views/story/create-story.html"
        })
        .when("/viewStory", {
            templateUrl: "../views/story/view-story.html"
        })
        .when("/public-stories", {
            templateUrl: "../views/story/public-story.html"
        })
        ///////////////////////////
        ////////BUILDINGS//////////
        ///////////////////////////
        .when("/allBuildings", {
            templateUrl: "../views/building/buildings.html"
        })
        .when("/viewBuilding", {
            templateUrl: "../views/building/view-building.html",
        })
        .when("/addBuilding", {
            templateUrl: "../views/building/create-building.html"
        })

        ///////////////////////////
        ///////////METERS////////////
        ///////////////////////////

        .when("/addmeter", {
            templateUrl: "../views/meter-controls/add-meter-form.html",
            controller: "meterController"
        })
        .when("/meters", {
            templateUrl: "../views/meter-controls/meters.html",
            controller: "meterController"
        });
    //$locationProvider.html5Mode(true);   //this is what is breaking page reload
});

myApp.controller('buildingEditController', function ($scope, $location, $route, Meter, Building, editbuilding) {

    $scope.buildingFormTitle = "Update Building";
    $scope.buttonText = "Update";
    $scope.buildingNameForm = editbuilding.name;
    $scope.buildingType = editbuilding.building_type;
    $scope.buildingMeters = editbuilding.meters;

    $scope.submit = function () {
        if (!$.isEmptyObject($scope.buildingNameForm) && !$.isEmptyObject($scope.buildingSerialForm)) {
            // call the create function from our service (returns a promise object)
            var buildingData = {
                "name": $scope.buildingNameForm,
                "building_type": $scope.buildingType,
                "id": editbuilding._id
            };

            Building.update(buildingData)
                // if successful creation
                .success(function (meter) {
                    $scope.nameForm = "";
                    $scope.type = "";
                    $location.path('/buildings');
                });
        }
    }
});

myApp.controller('userController', function ($scope, EmailRegistration) {
    $scope.email = {
        email: '',
        access: '0'
    };
    $scope.submit = function () {
        console.log('controller hit');
        EmailRegistration.post($scope.email)
            .success(function () {
                $scope.email.email = '';
                $scope.email.access = '0';
            });
    };
});