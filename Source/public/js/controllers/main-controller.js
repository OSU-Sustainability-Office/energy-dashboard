angular.module('mainController', [])
    .controller('mainController', function ($scope, $rootScope, GetUser) {

        GetUser.get()
            .success(function (data) {
                if (data) {
                    console.log(data);
                    $scope.login_status = "Logout";
                    $scope.greeting = "Hello " + data.google.name.split(' ')[0] + "!";
                    $scope.myLink = "logout";
                    $scope.userLoggedIn = true;
                    $scope.accountAccess = data.accessLevel;
                    $scope.mainContent = 'shiftRight';
                    
                } else {
                    $scope.login_status = "Login";
                    $scope.greeting = '';
                    $scope.myLink = "auth/google";
                    $scope.userLoggedIn = false;
                    $scope.accountAccess = -1;
                    $scope.mainContent = 'shiftLeft';
                }
            });
        $scope.dashboardClass = 'hideDash';
        $scope.showDashboards = function () {
            $scope.dashboardClass = 'showDash';
        }
    })

    .directive('sideNav', function () {
        return {
            restrict: 'E',
            scope: {
                model: '='
            },
            templateUrl: '../../views/side-navigation.html'
        };
    })
    .directive('topNav', function () {
        return {
            restrict: 'E',
            scope: {
                model: '='
            },
            templateUrl: '../../views/top-navigation.html'
        };
    });