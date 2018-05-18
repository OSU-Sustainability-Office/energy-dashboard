var charts = [];
var blockData = [];

angular.module('chartController', [])
    .controller('chartController', function ($route, $scope, $rootScope, $element, $timeout, Building) {

        /*
        This function gets a range int and produces a random number within 
		that specified range.
         */
        var randomNum = function (range) {
            var num = Math.floor(Math.random() * range);
            return num;
        };

        /*
        This function gets either no argument or an array of ranges
		to generate a random unique bright color
         */
        function generateColor(ranges) {
            //https://stackoverflow.com/questions/1484506/random-color-generator
            if (!ranges) {
                ranges = [
                    [150, 256],
                    [0, 190],
                    [0, 30]
                ];
            }
            var g = function () {
                //select random range and remove
                var range = ranges.splice(Math.floor(Math.random() * ranges.length), 1)[0];
                //pick a random number from within the range
                return Math.floor(Math.random() * (range[1] - range[0])) + range[0];
            }
            return "rgb(" + g() + "," + g() + "," + g() + ")";
        };

		/*
        This function gets an array of buildings retrieved from user block object and 
		 and updates a canvas element with a chart based on data parameters
         */
        $scope.createChart = function (buildingsArray) {
            var daterange = Last7Days();

            //will hold each buildings data in the block
            //x and y axis data
            var to_pass = {
                buildings: buildingsArray.building.map(b => b._id),
                var: buildingsArray.var,
                start: daterange[0],
                end: daterange[daterange.length -1]
            };
            var buildingAxisData = [];
            Building.getBuildingData(to_pass).then(function (data) {
                buildingsArray.building.forEach(function(x){
                    buildingAxisData.push({name: x.name, data: data.data.filter(b => b.building_id === x._id)});
                });
                //each building's points received from service
                //buildingAxisData.push({name: buildingsArray.building.filter(b => b._id == to_chart.b_id)[0].name, data:  to_chart.points});


                //push all the values to the array of each buildings x axis data
                //fills buildingAxisData array with building data.

                buildChart(buildingAxisData, buildingsArray.type, buildingsArray.name );
                if(buildingsArray.vals != 'none'){
                    calculateVals(buildingAxisData, buildingsArray.id);
                }

            });
        };

        /*
        This function handles the date filters applied to the chart
        passes a date range into the service to filter results from query
         */
        $scope.filterResults = function (object) {

            var range = getDateRange(object.range);
            //will hold each buildings data in the block
            //x and y axis data
            var to_pass = {
                buildings: object.building.map(b => b._id),
                var: object.var,
                start: range.start,
                end: range.end
            };
            var buildingAxisData = [];

            Building.getBuildingData(to_pass).then(function (data) {
                //each building's points received from service
                object.building.forEach(function(x){
                    buildingAxisData.push({name: x.name, data: data.data.filter(b => b.building_id === x._id)});
                });
                ///push all the values to the array of each buildings x axis data
                //fills buildingAxisData array with building data.
                $scope.chartData = buildingAxisData;
                if(object.vals != 'none') {
                    $scope.maxValues = $scope.maxValues.filter(b => b.id != object.id);
                    $scope.medValues = $scope.medValues.filter(b => b.id != object.id);
                    $scope.minValues = $scope.minValues.filter(b => b.id != object.id);
                }
                updateChart(buildingAxisData, object.index, object.name);
                if(object.vals != 'none'){
                    calculateVals(buildingAxisData, object.id);
                }
            });
        };


        /*
        This function is called as the ng init of the stats section for each block
        it calculates the high, median, and low for each buildings data and pushed them to arrays.
        These arrays are then ng-repeated in the view and the values for each building are displayed in the block
         */
        function calculateVals(dataset, block_id) {
            dataset.forEach(function (currBuilding) {
                var max = {
                    id : block_id,
                    name: parseName(currBuilding.name),
                    max: null,
                    units: null
                };
                var med = {
                    id : block_id,
                    name: parseName(currBuilding.name),
                    med: null,
                    units: null
                };
                var min = {
                    id : block_id,
                    name: parseName(currBuilding.name),
                    min: null,
                    units: null
                };
                var values = currBuilding.data.map(x => x.val);

                max.max = formatNumber(parseInt(Math.max(...values), 10));
                max.units = "KwH";
                min.min = formatNumber(parseInt(Math.min(...values), 10));
                min.units = "KwH";
                values.sort((a, b) => a - b);
                var lowMiddle = Math.floor((values.length - 1) / 2);
                var highMiddle = Math.ceil((values.length - 1) / 2);
                med.med = formatNumber(parseInt(((values[lowMiddle] + values[highMiddle]) / 2), 10));
                med.units = "KwH";

                $scope.maxValues.push(max);
                $scope.medValues.push(med);
                $scope.minValues.push(min);
            });
        }

        /*
        This function updates the chart when a new date filter is selected.
        the global array charts holds the chart objects as they are created
        it simply updates the dataset of the calling chart
         */
        function updateChart(buildingAxisData, index, name) {
            var datasetsArray = [];
            buildingAxisData.forEach(function (element) {
                datasetsArray.push({
                    fill: false,
                    borderColor: generateColor(),
                    label: element.name,
                    data: element.data.map(x=> x.val)
                });
            });
            if(name){
                var c = charts.find(c => c.block_name.toString() === name.toString());
            }else{
                console.log(charts);
                var c = charts[0];
            }

            c.chart.data.datasets = datasetsArray;
            c.chart.data.labels = buildingAxisData[0].data.map(x=> x.date);
            c.chart.update();
        }

        /*
        Function takes shortens the name of buildings. It takes in a building name
		string and returns an abbreviated version if the name has more than 2 words
		or returns the first word if else.
         */
        function parseName(name) {
            if (name.trim().split(/\s+/).length > 2) {
                return name.match(/\b\w/g).join('');
            }
            return name.replace(/ .*/, '');
        };

        //a regex to add commas to integers for better readability
        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        };

        //This function simply initializes the scope variable arrays that hold the min/max/median values
        $scope.initVals = function () {
            $scope.maxValues = [];
            $scope.medValues = [];
            $scope.minValues = [];
            charts = [];
        };


        /*
        This function is what creates the chart in the canvas element once the data is retrieved and parsed
        the $element is the calling element of the function, which is the canvas element that called createChart
         */
        function buildChart(buildingAxisData, type, name) {
            //function could be made here to dynamically fill the datasetsArray's for each value in block.buildings
            var datasetsArray = [];
            buildingAxisData.forEach(function (element) {
                datasetsArray.push({
                    fill: false,
                    borderColor: generateColor(),
                    label: element.name,
                    data: element.data.map(x=> x.val)
                });
            });

            //an example of a completed auto generated chart object to be passed to the chart creation function
            var completedChartObj = {
                chartType: type,
                chartYtitle: 'kWh',
                chartDataLabels: buildingAxisData[0].data.map(x=> x.date),
                chartDatasets: datasetsArray
            };
            //set current element of the html function call as context for chart
            var ctx = $element.find( "canvas" );

            if(type == 'line'){
                //create the chart on the element
                var myChart = new Chart(ctx, {
                    type: completedChartObj.chartType,
                    data: {
                        labels: completedChartObj.chartDataLabels,
                        datasets: completedChartObj.chartDatasets
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                scaleLabel: {
                                    display: true,
                                    labelString: completedChartObj.chartYtitle
                                }
                            }]
                        }
                    }
                });
            }
            charts.push({block_name: name, chart : myChart});
        }

        function formatDate(date){
            var dd = date.getDate();
            var mm = date.getMonth()+1;
            var yyyy = date.getFullYear();
            if(dd<10) {dd='0'+dd}
            if(mm<10) {mm='0'+mm}
            date = yyyy+'-'+mm+'-'+dd;
            return date
        }

        function Last7Days() {
            var result = [];
            for (var i=0; i<7; i++) {
                var d = new Date();
                d.setDate(d.getDate() - i);
                result.push( formatDate(d).toString() )
            }
            return(result.sort());
        }

        function LastWeek() {
            var result = [];
            for (var i=0; i<15; i++) {
                var d = new Date();
                d.setDate(d.getDate() - i);
                result.push( formatDate(d).toString() )
            }
            console.log(result.sort());
            return(result.sort().slice(0, 7));
        }
        /*
        Input:
        range - Array of date string
        data - {id: "5aab1076dbdd3c325439a214",
                points: [ {building: "5aab1076dbdd3c325439a214",
                           timestamp: "2018-03-29 00:00:00",
                           point: 469646.06}
                        ]
                }
         */
        function getDailyData(range, data){
            var to_return = [];
            range.forEach(function (date){
                //get data points for just one whole day
                var temp = data.points.filter(p => {
                    if(p)
                        return p.timestamp.substring(0,10) == date
                });
                if (temp.length > 0){
                    //find the consumption for that day by subtracting
                    //net accumulated at 23:45:00 from net accumulated at 00:00:00
                    var dif = Math.abs(temp[temp.length-1].point) - Math.abs(temp[0].point);
                    to_return.push({date: temp[0].timestamp.substring(0,10), val: dif});
                }
            });
            return to_return;
        }

        function getDateRange(range){
            var startDate;
            var endDate;
            var curr = new Date; // get current date
            var last;
            var first;
            var daterange = [];
            switch (range) {
                case "lastweek":

                    daterange = LastWeek();
                    startDate = daterange[0];
                    endDate = daterange[daterange.length - 1];

                    break;
                case "thisweek":
                    daterange = Last7Days();
                    startDate = daterange[0];
                    endDate = daterange[daterange.length - 1];
                    break;
                default:
                    curr.setMonth(curr.getMonth() -1);

                    for(var i = 0; i < 30; i++){
                        var dat = new Date(curr.valueOf());
                        dat.setDate(dat.getDate() + i);
                        if(dat.getDate().toString().length == 1){
                            daterange.push("" + dat.getFullYear() + "-0" + (dat.getMonth()+ 1) + "-" + "0"+dat.getDate());
                        }
                        else{
                            daterange.push("" + dat.getFullYear() + "-0" + (dat.getMonth()+ 1) + "-" + dat.getDate());
                        }
                    }
                    curr.setMonth(curr.getMonth() +1);
                    if(curr.getDate().toString().length == 1){
                        startDate = "" + curr.getFullYear() + "-0" + (curr.getMonth() -1 ) + "-" + "0"+curr.getDate();
                        endDate = "" + curr.getFullYear() + "-0" + (curr.getMonth() + 1) + "-" +"0"+ curr.getDate();
                    }
                    else{
                        startDate = "" + curr.getFullYear() + "-0" + (curr.getMonth()) + "-" + curr.getDate();
                        endDate = "" + curr.getFullYear() + "-0" + (curr.getMonth() + 1) + "-" + curr.getDate();
                    }
            }
            return {start: startDate, end : endDate, daterange: daterange}
        }

        $scope.$on("GetBlockData", function(evt, data) {
            var c = charts.find(c => c.block_name == data.block.name);

            var vals = c.chart.data.datasets;
            var labels = c.chart.data.labels;

            $rootScope.$broadcast("SendCSV", {l:labels, v: vals});
            // handler code here });
        });

        $scope.initCharts = function(){
            charts = [];
        }
    });
