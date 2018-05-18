var map_buildings;
angular.module('mapController', [])
	.controller('mapController', function ($rootScope, $compile, $scope, Building) {
		$scope.getBuildings = function(){
            Building.get().success(function (data) {
                map_buildings = data;
                loadMap();
            });

		};
		
		//FUNCTIONALITY OF GOOGLE MAPS METHODS AND VARIABLES CAN BE FOUND IN THE GOOGLE MAPS DOCUMENTATION
		
		//POLYGON CREATION FOR NEW BUILDINGS CAN BE MADE SIMPLY AND QUICKLY USING: https://www.doogal.co.uk/polylines.php
		
		//TO ADD NEW BUILDING POLYGON, SIMPLY COPY AND PASTE ONE OF THE BUILDING POLYGON CREATION CODE SEGMENTS,
		//CHANGE THE CORRECT VARIABLES TO ASSOCIATE THE CODE TO THE NEW BUILDING, AND REPLACE THE POLYGON COORDINATES WITH
		//THE NEWLY CREATED COORDINATES FROM THE PROVIDED WEBSITE
        function loadMap() {
			$scope.map;
			$scope.markers = [];
			$scope.markerId = 1;
			//Map initialization
			var latlng = new google.maps.LatLng(44.563823618710714, -123.27824699896155);
			var myStyles = [{
				featureType: "poi",
				elementType: "labels",
				stylers: [{
					visibility: "off"
				}]
			}];
			var myOptions = {
				zoom: 16,
				center: latlng,
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				streetViewControl: false,
				fullscreenControl: false,
				Icons: false,
				mapTypeControl: true,
				mapTypeControlOptions: {
					mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.SATELLITE]
				},
				styles: myStyles
			};
			$scope.map = new google.maps.Map(document.getElementById("map"), myOptions);
			$scope.overlay = new google.maps.OverlayView();
			$scope.overlay.draw = function () {}; // empty function required
			$scope.overlay.setMap($scope.map);
			$scope.element = document.getElementById('map');

			//info window pop up variable when polygon is clicked
			var infoWindow = new google.maps.InfoWindow;
			//list of polygons
			var shapes = [];

            jQuery.each(getPaths(), function(i, val) {
				var check = map_buildings.filter(x => x.name == val.name);
            	if(!check.length < 1){
            		//console.log(buildMapObject(check[0], val.path));
            		shapes.push(buildMapObject(check[0], val.path));
                    //console.log(check);
				}
            });
			
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	Arnold Dining Center	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56064873786082, -123.27814686300826),
				new google.maps.LatLng(44.56057038288392, -123.27815759184432),
				new google.maps.LatLng(44.560562738490255, -123.27806103231978),
				new google.maps.LatLng(44.560499672204394, -123.27806103231978),
				new google.maps.LatLng(44.560493938902304, -123.27777135374618),
				new google.maps.LatLng(44.56037927274154, -123.27776867153716),
				new google.maps.LatLng(44.56037927274154, -123.27740389111113),
				new google.maps.LatLng(44.56086851345249, -123.27739316227508),
				new google.maps.LatLng(44.56086851345249, -123.27775257828307),
				new google.maps.LatLng(44.5607614923985, -123.2777579427011),
				new google.maps.LatLng(44.560763403490476, -123.27805298569274),
				new google.maps.LatLng(44.560651031140644, -123.27806746960505)
			];

			var arnold_dining_center = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			arnold_dining_center.setMap($scope.map);
			shapes.push(arnold_dining_center);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(arnold_dining_center, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Arnold Dining Center" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	BLOSS	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56024969961465, -123.277697324761),
				new google.maps.LatLng(44.56024530411668, -123.27732288837637),
				new google.maps.LatLng(44.56020708192489, -123.27732557058539),
				new google.maps.LatLng(44.56020708192489, -123.27734032273497),
				new google.maps.LatLng(44.56019465970712, -123.27733629942145),
				new google.maps.LatLng(44.56018988193037, -123.27712708711829),
				new google.maps.LatLng(44.56012681524035, -123.27712708711829),
				new google.maps.LatLng(44.56012490412749, -123.2771485447904),
				new google.maps.LatLng(44.560067570711695, -123.2771485447904),
				new google.maps.LatLng(44.560077126284924, -123.27787810564246),
				new google.maps.LatLng(44.56013063746594, -123.27787274122443),
				new google.maps.LatLng(44.56013445969126, -123.27789151668753),
				new google.maps.LatLng(44.56019943748352, -123.27789285779204),
				new google.maps.LatLng(44.56019943748352, -123.27767693996634),
				new google.maps.LatLng(44.5602109041452, -123.27769437432494)
			];
			var Bloss = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Bloss.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Bloss, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Bloss Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Bloss);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	BUXTON	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.564468892734894, -123.28211653239123),
				new google.maps.LatLng(44.56446507079434, -123.28144329792849),
				new google.maps.LatLng(44.56430837104367, -123.28145134455553),
				new google.maps.LatLng(44.56430454909256, -123.28147548443667),
				new google.maps.LatLng(44.564080964514915, -123.28147280222765),
				new google.maps.LatLng(44.564080964514915, -123.28161495930544),
				new google.maps.LatLng(44.564228110017396, -123.28161495930544),
				new google.maps.LatLng(44.56422619903924, -123.28166592127673),
				new google.maps.LatLng(44.56429499421366, -123.28166860348574),
				new google.maps.LatLng(44.564302638116885, -123.28161495930544),
				new google.maps.LatLng(44.56435614541153, -123.28165251023165),
				new google.maps.LatLng(44.56435232346354, -123.28211385018221)
			];
			var Buxton = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Buxton.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Buxton, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Buxton Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Buxton);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	CALLAHANN	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.563975860327574, -123.27392238376888),
				new google.maps.LatLng(44.56398732624495, -123.2733322977856),
				new google.maps.LatLng(44.56404360476184, -123.27332901209388),
				new google.maps.LatLng(44.564052299734165, -123.27283340690883),
				new google.maps.LatLng(44.56415358179323, -123.27283340690883),
				new google.maps.LatLng(44.564147848851206, -123.27332693336757),
				new google.maps.LatLng(44.56415921919442, -123.27332700043712),
				new google.maps.LatLng(44.56415530169323, -123.27347660063879),
				new google.maps.LatLng(44.56408841733636, -123.27347660063879),
				new google.maps.LatLng(44.56407981791348, -123.27392452954427)
			];

			var Callahan = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Callahan.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Callahan, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Callahan Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Callahan);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	CAUTHORN	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56405994366929, -123.28280049569003),
				new google.maps.LatLng(44.56378476137159, -123.28280049569003),
				new google.maps.LatLng(44.56378476137159, -123.28282999998919),
				new google.maps.LatLng(44.563643347740026, -123.2828326821982),
				new google.maps.LatLng(44.56363761474772, -123.28212189680926),
				new google.maps.LatLng(44.56375418548039, -123.28212457901827),
				new google.maps.LatLng(44.56375609647406, -123.28266102082125),
				new google.maps.LatLng(44.56405994366929, -123.28265833861224)
			];
			var Cauthorn = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Cauthorn.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Cauthorn, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Cauthorn Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Cauthorn);


			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	CH2M Hill Alumni Center	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.560140384122526, -123.27939945461821),
				new google.maps.LatLng(44.560140384122526, -123.2786055207498),
				new google.maps.LatLng(44.55969891548121, -123.27859747412276),
				new google.maps.LatLng(44.55969127097308, -123.2793967724092),
				new google.maps.LatLng(44.559866134859064, -123.27939674610923),
				new google.maps.LatLng(44.55986709440623, -123.27932971718383),
				new google.maps.LatLng(44.55996265039702, -123.27933239939284),
				new google.maps.LatLng(44.55996265039702, -123.2793967724092)
			];

			var CH2M = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			CH2M.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(CH2M, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "CH2M Hill Alumni Center" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(CH2M);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	FINLEY	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56114339102153, -123.277897283441),
				new google.maps.LatLng(44.56115915742497, -123.277897283441),
				new google.maps.LatLng(44.56116011296443, -123.27790734172481),
				new google.maps.LatLng(44.5612045455322, -123.2779060006203),
				new google.maps.LatLng(44.56120000672307, -123.27754524349757),
				new google.maps.LatLng(44.56115557415184, -123.2775455787737),
				new google.maps.LatLng(44.56115581303671, -123.27755798399039),
				new google.maps.LatLng(44.561140524402255, -123.27755898981877),
				new google.maps.LatLng(44.56113861332267, -123.27734977751561),
				new google.maps.LatLng(44.56107889204662, -123.27734977751561),
				new google.maps.LatLng(44.56107889204662, -123.2773658707697),
				new google.maps.LatLng(44.56103541492073, -123.2773672118742),
				new google.maps.LatLng(44.56103613157685, -123.27754759043046),
				new google.maps.LatLng(44.56102275399443, -123.27754759043046),
				new google.maps.LatLng(44.56102633727573, -123.2779130414292),
				new google.maps.LatLng(44.56103947597198, -123.27791203560082),
				new google.maps.LatLng(44.56104210371089, -123.27818293871132),
				new google.maps.LatLng(44.56111544147767, -123.27818193288294),
				new google.maps.LatLng(44.56111424705241, -123.27815276385991),
				new google.maps.LatLng(44.561146018755736, -123.27815209330765)
			];
			var Finley = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Finley.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Finley, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Finley Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Finley);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	HALSELL	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56123563237605, -123.27722337843625),
				new google.maps.LatLng(44.56123611014515, -123.277177780883),
				new google.maps.LatLng(44.56125999859546, -123.27717711033074),
				new google.maps.LatLng(44.56126047636437, -123.27715766431538),
				new google.maps.LatLng(44.56128388703598, -123.27715766431538),
				new google.maps.LatLng(44.561281975961094, -123.27702087165562),
				new google.maps.LatLng(44.56126286520884, -123.27701953055112),
				new google.maps.LatLng(44.56126286520884, -123.27700477840153),
				new google.maps.LatLng(44.561287231416856, -123.27700477840153),
				new google.maps.LatLng(44.56128627587948, -123.2769632041618),
				new google.maps.LatLng(44.56128627587948, -123.27688743175713),
				new google.maps.LatLng(44.561258087519796, -123.27688542010037),
				new google.maps.LatLng(44.56125904305763, -123.2768559158012),
				new google.maps.LatLng(44.56127910934864, -123.2768545746967),
				new google.maps.LatLng(44.56127910934864, -123.27671509982792),
				new google.maps.LatLng(44.56125665421301, -123.27671308817116),
				new google.maps.LatLng(44.56125713198193, -123.27668827773778),
				new google.maps.LatLng(44.56120983283847, -123.27668425442425),
				new google.maps.LatLng(44.56120983283847, -123.2766661495134),
				new google.maps.LatLng(44.56119597752653, -123.27664402128903),
				new google.maps.LatLng(44.56123419906869, -123.27659104766099),
				new google.maps.LatLng(44.561175911206846, -123.27649448811599),
				new google.maps.LatLng(44.561133389697034, -123.27654477953502),
				new google.maps.LatLng(44.561120012136975, -123.2765246629674),
				new google.maps.LatLng(44.56109803471015, -123.27652265131064),
				new google.maps.LatLng(44.56110329018255, -123.27645291387626),
				new google.maps.LatLng(44.561089434845236, -123.27645023166724),
				new google.maps.LatLng(44.56109134592643, -123.27643078565188),
				new google.maps.LatLng(44.56099005853612, -123.27640932799),
				new google.maps.LatLng(44.560986236367, -123.27643212676662),
				new google.maps.LatLng(44.5609671255176, -123.2764281034531),
				new google.maps.LatLng(44.56096951437413, -123.27639792860168),
				new google.maps.LatLng(44.56089068205726, -123.27638451755661),
				new google.maps.LatLng(44.56088829319753, -123.27641335130352),
				new google.maps.LatLng(44.56087348226485, -123.27641201019901),
				new google.maps.LatLng(44.56087491558111, -123.27638518810886),
				new google.maps.LatLng(44.56077792775538, -123.27636775374515),
				new google.maps.LatLng(44.56077315002652, -123.27639524638755),
				new google.maps.LatLng(44.56074830583009, -123.27638787031276),
				new google.maps.LatLng(44.56075069469561, -123.27636373043163),
				new google.maps.LatLng(44.56065322890349, -123.27634361386401),
				new google.maps.LatLng(44.560649884486175, -123.27637110650642),
				new google.maps.LatLng(44.56063125130036, -123.27636976540191),
				new google.maps.LatLng(44.56062790688177, -123.27639792859657),
				new google.maps.LatLng(44.56060067375905, -123.27639457584041),
				new google.maps.LatLng(44.560585862753165, -123.27653405070919),
				new google.maps.LatLng(44.56062981798541, -123.27654343844074),
				new google.maps.LatLng(44.560629340211335, -123.2765729427399),
				new google.maps.LatLng(44.56072919490254, -123.27659171819278),
				new google.maps.LatLng(44.56073301708856, -123.27655819058009),
				new google.maps.LatLng(44.56075738351847, -123.27656221389361),
				new google.maps.LatLng(44.56075451688019, -123.2765970826108),
				new google.maps.LatLng(44.560852938061686, -123.2766145169694),
				new google.maps.LatLng(44.560855804695144, -123.27658501267024),
				new google.maps.LatLng(44.56086985119402, -123.27658856659923),
				new google.maps.LatLng(44.56086531235878, -123.27662410586868),
				new google.maps.LatLng(44.56094705911901, -123.27664133905955),
				new google.maps.LatLng(44.56095135906213, -123.27660781144687),
				new google.maps.LatLng(44.560971425459265, -123.27661049365588),
				new google.maps.LatLng(44.56096951437413, -123.27664133905955),
				new google.maps.LatLng(44.56107032402973, -123.27666145562716),
				new google.maps.LatLng(44.561075579504624, -123.27661988138743),
				new google.maps.LatLng(44.56113434523693, -123.2767010182306),
				new google.maps.LatLng(44.56113434523693, -123.27671711148469),
				new google.maps.LatLng(44.56111284558565, -123.27671778203694),
				new google.maps.LatLng(44.56111427889597, -123.27685993911473),
				new google.maps.LatLng(44.56113434523693, -123.27686128021924),
				new google.maps.LatLng(44.56113434523693, -123.27689212562291),
				new google.maps.LatLng(44.56110376795273, -123.27689212562291),
				new google.maps.LatLng(44.56110329018255, -123.27696722747532),
				new google.maps.LatLng(44.56110348128768, -123.27700531483515),
				new google.maps.LatLng(44.561135969651794, -123.2770046442829),
				new google.maps.LatLng(44.561135969651794, -123.27702174336537),
				new google.maps.LatLng(44.56111542554131, -123.27702241391762),
				new google.maps.LatLng(44.5611159033114, -123.27706231177672),
				new google.maps.LatLng(44.56111088672523, -123.27706264705284),
				new google.maps.LatLng(44.5611116033804, -123.2771270200692),
				new google.maps.LatLng(44.561113036690784, -123.27716457099541),
				new google.maps.LatLng(44.561137402961535, -123.27716457099541),
				new google.maps.LatLng(44.56113931404118, -123.277226932355)
			];
			var Halsell = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Halsell.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Halsell, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Halsell Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Halsell);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	HAWLEY	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56446889288068, -123.28282731810759),
				new google.maps.LatLng(44.56446908387274, -123.28211840997028),
				new google.maps.LatLng(44.564352992316124, -123.28211572776127),
				new google.maps.LatLng(44.56435824749446, -123.28265686343002),
				new google.maps.LatLng(44.56406003922434, -123.28265860676765),
				new google.maps.LatLng(44.56406061255443, -123.28280170271682),
				new google.maps.LatLng(44.56432862739211, -123.28280304382133),
				new google.maps.LatLng(44.5643291051358, -123.28283120701599)
			];
			var Hawley = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Hawley.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Hawley, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Hawley Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Hawley);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	ILLC	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56000249725427, -123.27628259370613),
				new google.maps.LatLng(44.56000631948799, -123.27624705443668),
				new google.maps.LatLng(44.560415774824335, -123.2762323022871),
				new google.maps.LatLng(44.56040813041039, -123.27630203972149),
				new google.maps.LatLng(44.56045447465457, -123.27630740413952),
				new google.maps.LatLng(44.560453996879026, -123.27633422622966),
				new google.maps.LatLng(44.56052231873927, -123.27634428451347),
				new google.maps.LatLng(44.56053760753616, -123.27615720043468),
				new google.maps.LatLng(44.56052040763938, -123.27615451822567),
				new google.maps.LatLng(44.56052422983911, -123.27609416852283),
				new google.maps.LatLng(44.560541429734776, -123.27609819183635),
				new google.maps.LatLng(44.560587773872776, -123.27563752235619),
				new google.maps.LatLng(44.56050368551262, -123.2756214291021),
				new google.maps.LatLng(44.56050464106284, -123.275602653639),
				new google.maps.LatLng(44.560370386101745, -123.27558052541463),
				new google.maps.LatLng(44.56036465278691, -123.27567037941662),
				new google.maps.LatLng(44.56037607162822, -123.27567225699568),
				new google.maps.LatLng(44.56037134165416, -123.2757381052761),
				new google.maps.LatLng(44.56041864147931, -123.27574615190315),
				new google.maps.LatLng(44.56040239709924, -123.2759801746397),
				new google.maps.LatLng(44.56041381593314, -123.27598138158464),
				new google.maps.LatLng(44.56040999372616, -123.27601524447346),
				new google.maps.LatLng(44.55999771946171, -123.2760251016407),
				new google.maps.LatLng(44.5600053639296, -123.27594463537025),
				new google.maps.LatLng(44.55996140822557, -123.27593792984771),
				new google.maps.LatLng(44.5599623637847, -123.27592049548912),
				new google.maps.LatLng(44.55988974121648, -123.27591110775757),
				new google.maps.LatLng(44.55987636337045, -123.27610154459762),
				new google.maps.LatLng(44.55989547457812, -123.27610690901565),
				new google.maps.LatLng(44.55989117455694, -123.27616591761398),
				new google.maps.LatLng(44.559866329983905, -123.27616457650947),
				new google.maps.LatLng(44.55982858532379, -123.27663061032581),
				new google.maps.LatLng(44.559914107999575, -123.27664133916187),
				new google.maps.LatLng(44.55991076353976, -123.2766641379385),
				new google.maps.LatLng(44.56004406403281, -123.27668023119259),
				new google.maps.LatLng(44.56004979737925, -123.27659440050411),
				new google.maps.LatLng(44.560035464012095, -123.2765930593996),
				new google.maps.LatLng(44.56003880846474, -123.27652600417423),
				new google.maps.LatLng(44.55999485278599, -123.27651795754718),
				new google.maps.LatLng(44.560011575059015, -123.27628460536289)
			];
			var ILLC = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			ILLC.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(ILLC, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "ILLC" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(ILLC);


			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	MPW DINING CENTER	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56409606132508, -123.28402572857158),
				new google.maps.LatLng(44.56409415034256, -123.28304940481758),
				new google.maps.LatLng(44.56386578748138, -123.28304672260856),
				new google.maps.LatLng(44.5638667429764, -123.28402572857158),
				new google.maps.LatLng(44.56391977292489, -123.28402519226074),
				new google.maps.LatLng(44.56392025067194, -123.28405791507976),
				new google.maps.LatLng(44.56404255379124, -123.28405791507976),
				new google.maps.LatLng(44.56404255379124, -123.28402304636256)
			];
			var MPW = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			MPW.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(MPW, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Marketplace West Dining Center" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(MPW);

	
	
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	MCNARY HALL	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56449258883667, -123.27195042391395),
				new google.maps.LatLng(44.56449449980609, -123.27180022020912),
				new google.maps.LatLng(44.56448112301888, -123.27180022020912),
				new google.maps.LatLng(44.56448112301888, -123.27129462380981),
				new google.maps.LatLng(44.564368375690044, -123.27128791828727),
				new google.maps.LatLng(44.564366464716485, -123.2717961968956),
				new google.maps.LatLng(44.56430435804165, -123.2717961968956),
				new google.maps.LatLng(44.56430149157815, -123.27240505834197),
				new google.maps.LatLng(44.564415194522596, -123.27240103502845),
				new google.maps.LatLng(44.5644218829242, -123.27194640060043)
			];
			var Mcnary = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			
			//Creates pop up html when polygon is clicked.
			Mcnary.setMap($scope.map);
			google.maps.event.addListener(Mcnary, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Mcnary Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Mcnary);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	MCNARY DINING CENTER	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56393630293017, -123.27180084586416),
				new google.maps.LatLng(44.564256392492744, -123.27181023359572),
				new google.maps.LatLng(44.56425065956085, -123.27239763736998),
				new google.maps.LatLng(44.56408344879857, -123.27239227295195),
				new google.maps.LatLng(44.56408249330712, -123.2724553048638),
				new google.maps.LatLng(44.563925792496775, -123.2724553048638)
			];
			var Mcnary_D = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			
			//Creates pop up html when polygon is clicked.
			Mcnary_D.setMap($scope.map);
			google.maps.event.addListener(Mcnary_D, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Mcnary Dining Center" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Mcnary_D);
			
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	MU	///////////////////////////////////////////////////
			//////////////////////////////////////////////////////////////////////////////////////////////////////////// 
			var path = [
				new google.maps.LatLng(44.5647086502834, -123.27978247816645),
				new google.maps.LatLng(44.5647086502834, -123.27982237602555),
				new google.maps.LatLng(44.56474734725809, -123.27982271130168),
				new google.maps.LatLng(44.56474830273862, -123.27978650147998),
				new google.maps.LatLng(44.565172773412506, -123.27978583092772),
				new google.maps.LatLng(44.56517301228088, -123.27973553950869),
				new google.maps.LatLng(44.56520478176766, -123.27973419840419),
				new google.maps.LatLng(44.565204304031155, -123.27957661862456),
				new google.maps.LatLng(44.56517253454411, -123.27957728917681),
				new google.maps.LatLng(44.56517205680732, -123.27952833886229),
				new google.maps.LatLng(44.56507388181587, -123.27952666248166),
				new google.maps.LatLng(44.56507340413658, -123.2790203955301),
				new google.maps.LatLng(44.565097529879985, -123.27901972497784),
				new google.maps.LatLng(44.56509681321557, -123.27882526490612),
				new google.maps.LatLng(44.56507388181587, -123.27882492962999),
				new google.maps.LatLng(44.56507340413658, -123.27831631572508),
				new google.maps.LatLng(44.56517038472856, -123.27831564517282),
				new google.maps.LatLng(44.56516990699176, -123.27826904179119),
				new google.maps.LatLng(44.5652026319533, -123.27826770068668),
				new google.maps.LatLng(44.565202393085045, -123.27811246783995),
				new google.maps.LatLng(44.565170623655284, -123.2781121325587),
				new google.maps.LatLng(44.56516942931329, -123.27806653500545),
				new google.maps.LatLng(44.564698856658865, -123.27806720556282),
				new google.maps.LatLng(44.564698856658865, -123.27811649115347),
				new google.maps.LatLng(44.564689301844716, -123.27811447949671),
				new google.maps.LatLng(44.56469025732621, -123.2781580653932),
				new google.maps.LatLng(44.56466207061581, -123.27815873594545),
				new google.maps.LatLng(44.5646623094863, -123.27822579117083),
				new google.maps.LatLng(44.564689062974345, -123.27822612644695),
				new google.maps.LatLng(44.56468960235847, -123.27827222214887),
				new google.maps.LatLng(44.56469957326985, -123.27827239455246),
				new google.maps.LatLng(44.56469861773021, -123.27831832738184),
				new google.maps.LatLng(44.56477696720559, -123.27831799210571),
				new google.maps.LatLng(44.56477959477568, -123.27844170899652),
				new google.maps.LatLng(44.564778161497316, -123.27861907004717),
				new google.maps.LatLng(44.56475666319262, -123.27861907004717),
				new google.maps.LatLng(44.56475638629471, -123.27862427322242),
				new google.maps.LatLng(44.564749497089274, -123.27862342863682),
				new google.maps.LatLng(44.564750616844, -123.27870670706034),
				new google.maps.LatLng(44.564750855714124, -123.27871475368738),
				new google.maps.LatLng(44.56476351582913, -123.27871475368738),
				new google.maps.LatLng(44.56476590452977, -123.27903158962727),
				new google.maps.LatLng(44.56476112712839, -123.27903158962727),
				new google.maps.LatLng(44.56475993277801, -123.27904433012009),
				new google.maps.LatLng(44.56475491650604, -123.27904433012009),
				new google.maps.LatLng(44.56475706633694, -123.27913016080856),
				new google.maps.LatLng(44.56475754407712, -123.27918816357851),
				new google.maps.LatLng(44.56478835831094, -123.27918849885464),
				new google.maps.LatLng(44.564788836050866, -123.27931389212608),
				new google.maps.LatLng(44.56478429752136, -123.27931489795446),
				new google.maps.LatLng(44.564785014131324, -123.27943727374077),
				new google.maps.LatLng(44.5647835809114, -123.27947348356247),
				new google.maps.LatLng(44.56481678382998, -123.27947616577148),
				new google.maps.LatLng(44.56481773930936, -123.2795237749815),
				new google.maps.LatLng(44.56470069296723, -123.279525116086),
				new google.maps.LatLng(44.56470045409689, -123.27958110719919),
				new google.maps.LatLng(44.56469328798664, -123.27958077192307),
				new google.maps.LatLng(44.56469257137556, -123.27962402254343),
				new google.maps.LatLng(44.564661757091, -123.27962502837181),
				new google.maps.LatLng(44.56466247370246, -123.27969040721655),
				new google.maps.LatLng(44.564689943801554, -123.27969074249268),
				new google.maps.LatLng(44.564690421542295, -123.27973533421755),
				new google.maps.LatLng(44.56469997635625, -123.2797360047698),
				new google.maps.LatLng(44.56469997635625, -123.27978160232306)
			];
			var MU = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			MU.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(MU, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Memorial Union" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(MU);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	MILAM	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.5664620960863, -123.27958278357983),
				new google.maps.LatLng(44.566463051538626, -123.27951103448868),
				new google.maps.LatLng(44.566658918942366, -123.27951036393642),
				new google.maps.LatLng(44.566658918942366, -123.27925957739353),
				new google.maps.LatLng(44.56654139857928, -123.27926024794579),
				new google.maps.LatLng(44.56654187630481, -123.27909864485264),
				new google.maps.LatLng(44.56657675025819, -123.27909797430038),
				new google.maps.LatLng(44.56657579480768, -123.27871643006802),
				new google.maps.LatLng(44.56654235403033, -123.27871508896351),
				new google.maps.LatLng(44.56654235403033, -123.27856622636318),
				new google.maps.LatLng(44.56666465163694, -123.27856756746769),
				new google.maps.LatLng(44.56666560708597, -123.27830135822296),
				new google.maps.LatLng(44.56633167669099, -123.27830336987972),
				new google.maps.LatLng(44.56633167669099, -123.27856287360191),
				new google.maps.LatLng(44.566422922525746, -123.27856488525867),
				new google.maps.LatLng(44.56642244479922, -123.278713747859),
				new google.maps.LatLng(44.56639091484086, -123.27871643006802),
				new google.maps.LatLng(44.566391870294396, -123.27909730374813),
				new google.maps.LatLng(44.566423877978764, -123.27909998595715),
				new google.maps.LatLng(44.566422922525746, -123.27925823628902),
				new google.maps.LatLng(44.566307790323194, -123.27925689518452),
				new google.maps.LatLng(44.56630826805064, -123.27958144247532)
			];
			var Milam = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Milam.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Milam, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Milam Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Milam);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	MILNE COMPUTER CENTER	///////////////////////////////////////////////////
			//////////////////////////////////////////////////////////////////////////////////////////////////////////// 
			var path = [
				new google.maps.LatLng(44.56654092085375, -123.27554404735565),
				new google.maps.LatLng(44.566543787206896, -123.2750853896141),
				new google.maps.LatLng(44.56624281935313, -123.2750853896141),
				new google.maps.LatLng(44.566239952985114, -123.27554002404213)
			];
			var Milne_Comp_Center = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Milne_Comp_Center.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Milne_Comp_Center, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Milne Computer Center" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Milne_Comp_Center);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	NASH	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56643295478157, -123.28291743993759),
				new google.maps.LatLng(44.566431043875845, -123.28248023986816),
				new google.maps.LatLng(44.566027841361304, -123.28248828649521),
				new google.maps.LatLng(44.56602401952316, -123.28291743993759)
			];
			var Nash = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Nash.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Nash, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Nash Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Nash);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	POLING	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56408106004074, -123.28161522746086),
				new google.maps.LatLng(44.56408106004074, -123.2814734056592),
				new google.maps.LatLng(44.563781990437946, -123.2814697176218),
				new google.maps.LatLng(44.563782945934335, -123.28144758939743),
				new google.maps.LatLng(44.5636381880528, -123.28144825994968),
				new google.maps.LatLng(44.563637945231854, -123.28212217032626),
				new google.maps.LatLng(44.563754282519476, -123.28212518450658),
				new google.maps.LatLng(44.56375523653272, -123.2816132158041)
			];
			var Poling = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Poling.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Poling, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Poling Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Poling);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	SEC	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56506329699248, -123.27767707407475),
				new google.maps.LatLng(44.56506425246783, -123.27757850289345),
				new google.maps.LatLng(44.56504992033606, -123.27757984399796),
				new google.maps.LatLng(44.56504944259827, -123.27714532613754),
				new google.maps.LatLng(44.56506377473017, -123.27714499086142),
				new google.maps.LatLng(44.56506329699248, -123.27704641968012),
				new google.maps.LatLng(44.56473556802442, -123.27704541385174),
				new google.maps.LatLng(44.56473556802442, -123.27714432030916),
				new google.maps.LatLng(44.56474918362328, -123.27714499086142),
				new google.maps.LatLng(44.56474966136353, -123.2775778323412),
				new google.maps.LatLng(44.56473556802442, -123.27757883816957),
				new google.maps.LatLng(44.564736045764775, -123.27767707407475)
			];
			var SEC = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			SEC.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(SEC, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Student Experience Center" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(SEC);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	TEBEAU	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.5634972518155, -123.27242597937584),
				new google.maps.LatLng(44.563495340813304, -123.2723280787468),
				new google.maps.LatLng(44.56345807625839, -123.27232874929905),
				new google.maps.LatLng(44.56345712075666, -123.27229991555214),
				new google.maps.LatLng(44.56339692411649, -123.27230125665665),
				new google.maps.LatLng(44.563395490862405, -123.27233009040356),
				new google.maps.LatLng(44.56332430586449, -123.27233009040356),
				new google.maps.LatLng(44.563325261368405, -123.2723019272089),
				new google.maps.LatLng(44.56319579044639, -123.27230393886566),
				new google.maps.LatLng(44.56319531269337, -123.27233143150806),
				new google.maps.LatLng(44.5631265162185, -123.27233344316483),
				new google.maps.LatLng(44.56312603846493, -123.27230595052242),
				new google.maps.LatLng(44.562998955872736, -123.27230662107468),
				new google.maps.LatLng(44.562998955872736, -123.27233344316483),
				new google.maps.LatLng(44.56293015916565, -123.27233746647835),
				new google.maps.LatLng(44.56292968141046, -123.27231265604496),
				new google.maps.LatLng(44.5627987763393, -123.2723119854927),
				new google.maps.LatLng(44.56279925409555, -123.27233746647835),
				new google.maps.LatLng(44.562767722173334, -123.27233880758286),
				new google.maps.LatLng(44.562767722173334, -123.27238909900188),
				new google.maps.LatLng(44.562703702763535, -123.27239111065865),
				new google.maps.LatLng(44.56270561379172, -123.27258422970772),
				new google.maps.LatLng(44.562762944607876, -123.27258221805096),
				new google.maps.LatLng(44.56276485563411, -123.27268213033676),
				new google.maps.LatLng(44.5627099136049, -123.27268213033676),
				new google.maps.LatLng(44.562713257903795, -123.27291883528233),
				new google.maps.LatLng(44.56277918832886, -123.27291749417782),
				new google.maps.LatLng(44.56278014384171, -123.27287994325161),
				new google.maps.LatLng(44.56288047260439, -123.2728772610426),
				new google.maps.LatLng(44.56287856158195, -123.27250242233276),
				new google.maps.LatLng(44.563016632791275, -123.27249974012375),
				new google.maps.LatLng(44.56301711054575, -123.27252589166164),
				new google.maps.LatLng(44.563148492879044, -123.27252455055714),
				new google.maps.LatLng(44.56314992613923, -123.27249772846699),
				new google.maps.LatLng(44.56321824483361, -123.27249705791473),
				new google.maps.LatLng(44.56321872258643, -123.27252119779587),
				new google.maps.LatLng(44.5633481934574, -123.27251985669136),
				new google.maps.LatLng(44.56335010446442, -123.27249437570572),
				new google.maps.LatLng(44.56346237601594, -123.27249303460121),
				new google.maps.LatLng(44.56346237601594, -123.27242597937584)
			];
			var Tebeau = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Tebeau.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Tebeau, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Tebeau Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Tebeau);


			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	WEATHERFORD	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56443506855793, -123.28118607401848),
				new google.maps.LatLng(44.56443554630076, -123.28106302767992),
				new google.maps.LatLng(44.564386099896815, -123.2810640335083),
				new google.maps.LatLng(44.564385383281966, -123.28105229884386),
				new google.maps.LatLng(44.564367706779315, -123.28105296939611),
				new google.maps.LatLng(44.564367706779315, -123.28089438378811),
				new google.maps.LatLng(44.56436722903593, -123.2807257398963),
				new google.maps.LatLng(44.56438084472099, -123.2807257398963),
				new google.maps.LatLng(44.56438108359261, -123.2807133346796),
				new google.maps.LatLng(44.56443602404358, -123.28071400523186),
				new google.maps.LatLng(44.56443602404358, -123.2805909588933),
				new google.maps.LatLng(44.564381561335885, -123.28059129416943),
				new google.maps.LatLng(44.56438108359261, -123.28058023005724),
				new google.maps.LatLng(44.56437296195633, -123.28058023005724),
				new google.maps.LatLng(44.56437272308467, -123.28053966164589),
				new google.maps.LatLng(44.56431921580529, -123.28053999692202),
				new google.maps.LatLng(44.56431706595822, -123.28051216900349),
				new google.maps.LatLng(44.564289356811024, -123.28051183372736),
				new google.maps.LatLng(44.56429102891513, -123.2805410027504),
				new google.maps.LatLng(44.56422772779844, -123.28054066747427),
				new google.maps.LatLng(44.564226772309354, -123.28049708157778),
				new google.maps.LatLng(44.56414866102385, -123.28038644045591),
				new google.maps.LatLng(44.564114502233025, -123.28038610517979),
				new google.maps.LatLng(44.56409873663048, -123.2803850993514),
				new google.maps.LatLng(44.56409897550329, -123.28015342354774),
				new google.maps.LatLng(44.564066727666734, -123.28015342354774),
				new google.maps.LatLng(44.56406553330207, -123.28007362782955),
				new google.maps.LatLng(44.56397834461568, -123.2800729572773),
				new google.maps.LatLng(44.56397834461568, -123.2801540941),
				new google.maps.LatLng(44.56397404489627, -123.28015442937613),
				new google.maps.LatLng(44.56397404489627, -123.28017689287663),
				new google.maps.LatLng(44.56385293600199, -123.28017823398113),
				new google.maps.LatLng(44.56373947083283, -123.28017722815275),
				new google.maps.LatLng(44.56373875421002, -123.28015442937613),
				new google.maps.LatLng(44.56372633274633, -123.28015308827162),
				new google.maps.LatLng(44.56372609387201, -123.28007463365793),
				new google.maps.LatLng(44.56363986017561, -123.2800742983818),
				new google.maps.LatLng(44.56363962130094, -123.28015442937613),
				new google.maps.LatLng(44.56363556043116, -123.28015375882387),
				new google.maps.LatLng(44.563635321556475, -123.28046221286058),
				new google.maps.LatLng(44.56366733075759, -123.28046288341284),
				new google.maps.LatLng(44.563667569632145, -123.28050512820482),
				new google.maps.LatLng(44.56372251075697, -123.2805061340332),
				new google.maps.LatLng(44.56372322738001, -123.28048132359982),
				new google.maps.LatLng(44.563695756824394, -123.28048132359982),
				new google.maps.LatLng(44.563695756824394, -123.28046254813671),
				new google.maps.LatLng(44.56373899308428, -123.28046254813671),
				new google.maps.LatLng(44.56373947083283, -123.28032441437244),
				new google.maps.LatLng(44.563851502759114, -123.28032474964857),
				new google.maps.LatLng(44.56397380602295, -123.2803250849247),
				new google.maps.LatLng(44.56397404489627, -123.28046254813671),
				new google.maps.LatLng(44.56400294855959, -123.28046288341284),
				new google.maps.LatLng(44.56393009219059, -123.2805648073554),
				new google.maps.LatLng(44.5639320031785, -123.2805698364973),
				new google.maps.LatLng(44.56391337104387, -123.28059330582619),
				new google.maps.LatLng(44.56395374066135, -123.28064829111099),
				new google.maps.LatLng(44.56394131924358, -123.28066572546959),
				new google.maps.LatLng(44.563943707977955, -123.28067880123854),
				new google.maps.LatLng(44.56394514121856, -123.28069120645523),
				new google.maps.LatLng(44.56395015756035, -123.28070294111967),
				new google.maps.LatLng(44.56395326291458, -123.28071232885122),
				new google.maps.LatLng(44.56396353446967, -123.28073345124722),
				new google.maps.LatLng(44.5639776279958, -123.28074920922518),
				new google.maps.LatLng(44.563994110250846, -123.28075859695673),
				new google.maps.LatLng(44.56401250348645, -123.28076664358377),
				new google.maps.LatLng(44.56402396939663, -123.28075021505356),
				new google.maps.LatLng(44.5640607558432, -123.28080452978611),
				new google.maps.LatLng(44.564079387930626, -123.28078005462885),
				new google.maps.LatLng(44.56415272185781, -123.28068114817142),
				new google.maps.LatLng(44.56415272185781, -123.28067544847727),
				new google.maps.LatLng(44.56416060465228, -123.2806808128953),
				new google.maps.LatLng(44.5641601269072, -123.28072775155306),
				new google.maps.LatLng(44.56426260313918, -123.2807270810008),
				new google.maps.LatLng(44.56426212539493, -123.28105330467224),
				new google.maps.LatLng(44.56416442661287, -123.28105431050062),
				new google.maps.LatLng(44.56416442661287, -123.28120082616806),
				new google.maps.LatLng(44.56425424261418, -123.28119948506355),
				new google.maps.LatLng(44.56425495923066, -123.28121826052666),
				new google.maps.LatLng(44.564376783902965, -123.28121792525053),
				new google.maps.LatLng(44.56437750051792, -123.28119847923517),
				new google.maps.LatLng(44.56438633876842, -123.28119847923517),
				new google.maps.LatLng(44.56438681651165, -123.28118674457073)
			];
			var Weatherford = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Weatherford.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Weatherford, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Weatherford Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Weatherford);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	WENIGER	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.56812073775991, -123.27769450843334),
				new google.maps.LatLng(44.56830370138455, -123.27769383788109),
				new google.maps.LatLng(44.56830226825137, -123.27721372246742),
				new google.maps.LatLng(44.56811882690963, -123.27721305191517),
				new google.maps.LatLng(44.568118349197036, -123.27718019485474),
				new google.maps.LatLng(44.56806866706702, -123.27718086540699),
				new google.maps.LatLng(44.56806818935404, -123.27720768749714),
				new google.maps.LatLng(44.56773235614794, -123.27720835804939),
				new google.maps.LatLng(44.56773140071641, -123.27718086540699),
				new google.maps.LatLng(44.567679807391166, -123.27718287706375),
				new google.maps.LatLng(44.567679807391166, -123.27721305191517),
				new google.maps.LatLng(44.56749636408636, -123.27721506357193),
				new google.maps.LatLng(44.567495886368654, -123.27769920229912),
				new google.maps.LatLng(44.56776317155885, -123.27769741180464),
				new google.maps.LatLng(44.567762929948216, -123.27771797776222),
				new google.maps.LatLng(44.56781547862988, -123.27771730720997),
				new google.maps.LatLng(44.567815956344944, -123.2776965200901),
				new google.maps.LatLng(44.5680665172779, -123.27769482741212),
				new google.maps.LatLng(44.568066756215025, -123.27771194279194),
				new google.maps.LatLng(44.56811978233477, -123.27771194279194)
			];
			var Weniger = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Weniger.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Weniger, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Weniger Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Weniger);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	WEST	///////////////////////////////////////////////////
			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			var path = [
				new google.maps.LatLng(44.563896411018696, -123.28415762633085),
				new google.maps.LatLng(44.56389569439779, -123.28406978398561),
				new google.maps.LatLng(44.563869657166116, -123.28406810760498),
				new google.maps.LatLng(44.56386941829236, -123.2840272039175),
				new google.maps.LatLng(44.563866551807436, -123.2840272039175),
				new google.maps.LatLng(44.56386583518617, -123.28400172293186),
				new google.maps.LatLng(44.56377100222838, -123.28400071710348),
				new google.maps.LatLng(44.56377052448008, -123.28399032354355),
				new google.maps.LatLng(44.56370220643427, -123.2839896529913),
				new google.maps.LatLng(44.563701489811, -123.28400306403637),
				new google.maps.LatLng(44.563610239707465, -123.28400440514088),
				new google.maps.LatLng(44.56361047858226, -123.28386694192886),
				new google.maps.LatLng(44.56361788370069, -123.28386258333921),
				new google.maps.LatLng(44.56361788370069, -123.2837687060237),
				new google.maps.LatLng(44.563610239707465, -123.28376770019531),
				new google.maps.LatLng(44.56361047858226, -123.28348807990551),
				new google.maps.LatLng(44.56356771997683, -123.28348875045776),
				new google.maps.LatLng(44.56356628672694, -123.28345589339733),
				new google.maps.LatLng(44.56349796844131, -123.28345455229282),
				new google.maps.LatLng(44.56349749069077, -123.28415628522635)
			];
			var West = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			West.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(West, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "West Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(West);

			////////////////////////////////////////////////////////////////////////////////////////////////////////////
			////////////////////////////////////	WILSON	///////////////////////////////////////////////////
			//////////////////////////////////////////////////////////////////////////////////////////////////////////// 
			var path = [
				new google.maps.LatLng(44.563827376499, -123.27238373458385),
				new google.maps.LatLng(44.563888050441086, -123.27238574624062),
				new google.maps.LatLng(44.56389330566143, -123.27179297804832),
				new google.maps.LatLng(44.56378820116417, -123.27179163694382),
				new google.maps.LatLng(44.56378342368252, -123.27224090695381),
				new google.maps.LatLng(44.56371462790313, -123.2722395658493),
				new google.maps.LatLng(44.56371319465684, -123.27238641679287),
				new google.maps.LatLng(44.56372716656306, -123.27238607072513),
				new google.maps.LatLng(44.56372131638523, -123.2728873193264),
				new google.maps.LatLng(44.56382116577694, -123.27288933098316)
			];
			var Wilson = new google.maps.Polygon({
				path: path,
				strokeColor: "#DC4405",
				strokeOpacity: 1.0,
				strokeWeight: 2
			});
			Wilson.setMap($scope.map);
			
			//Creates pop up html when polygon is clicked.
			google.maps.event.addListener(Wilson, 'click', function (event) {
				infoWindow.setContent(
					"<h5 class='Stratum2-Light' style='width:150px; min-height:30px'>" + "Wilson Hall" + "</h5>" +
					"<a ng-click='viewBuilding(building)' href='#allBuildings' class='btn' style='color: white; background-color: #DC4405 !important;'>View</a>"
				);
				infoWindow.setPosition(event.latLng);
				infoWindow.open($scope.map);
			});
			shapes.push(Wilson);

		};


        function buildMapObject(obj, path){
            var infoWindow = new google.maps.InfoWindow;
            var map = new google.maps.Polygon({
                path: path,
                strokeColor: "#DC4405",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            map.setMap($scope.map);
            $scope.b = obj;
			
            var content = '<div><h5 class="Stratum2-Light" style="width:150px; min-height:30px">' + obj.name + '</h5>' +
                '<button ng-controller="buildingController" ng-click="view()" '+
                'class="btn" style="color: white; background-color: #DC4405 !important;">View</button>  </div>';
            var compiledContent = $compile(content)($scope);

            google.maps.event.addListener(map, 'click', function (event) {
                infoWindow.setContent(compiledContent[0]);
                infoWindow.setPosition(event.latLng);
                infoWindow.open($scope.map);
                $rootScope.$broadcast("MapBuilding", { building: obj });
            });
            return map;


		}

		$scope.view = function(o){
        	//console.log(o);
		}
        function getPaths(){
        	return {
        		dixon: {name: "Dixon Recreation Center", 
							path : [
							new google.maps.LatLng(44.56370832164261, -123.27905881407332),
							new google.maps.LatLng(44.56371023263777, -123.27824074032378),
							new google.maps.LatLng(44.56340638361597, -123.2782434225328),
							new google.maps.LatLng(44.56340447261081, -123.27832657101226),
							new google.maps.LatLng(44.563391095572946, -123.27831852438521),
							new google.maps.LatLng(44.56338918456728, -123.2781897783525),
							new google.maps.LatLng(44.563322299329585, -123.27818441393447),
							new google.maps.LatLng(44.56332038832165, -123.27822196486068),
							new google.maps.LatLng(44.563274524112714, -123.27822196486068),
							new google.maps.LatLng(44.563274524112714, -123.27830779554915),
							new google.maps.LatLng(44.56324585896378, -123.27831315996718),
							new google.maps.LatLng(44.56324585896378, -123.27816563847136),
							new google.maps.LatLng(44.56295156258851, -123.27816832068038),
							new google.maps.LatLng(44.56295156258851, -123.27845263483596),
							new google.maps.LatLng(44.5629255727127, -123.27845075727737),
							new google.maps.LatLng(44.562924521652626, -123.27846121788639),
							new google.maps.LatLng(44.56288152366525, -123.27846188843864),
							new google.maps.LatLng(44.56288247917641, -123.27844043076652),
							new google.maps.LatLng(44.56287101304127, -123.27844043076652),
							new google.maps.LatLng(44.562871968552614, -123.27827145159858),
							new google.maps.LatLng(44.56259534736897, -123.27827078104633),
							new google.maps.LatLng(44.56259439185307, -123.27832710743564),
							new google.maps.LatLng(44.56258388117721, -123.27832710743564),
							new google.maps.LatLng(44.56258388117721, -123.27841293812412),
							new google.maps.LatLng(44.56259458295334, -123.27841313928673),
							new google.maps.LatLng(44.56259486961103, -123.27844043076652),
							new google.maps.LatLng(44.56258579220935, -123.27844110131878),
							new google.maps.LatLng(44.56258483669329, -123.278481334454),
							new google.maps.LatLng(44.56256238206162, -123.278481334454),
							new google.maps.LatLng(44.56256094878696, -123.27879515291897),
							new google.maps.LatLng(44.56259439185307, -123.27879515291897),
							new google.maps.LatLng(44.56259343633717, -123.27887427808491),
							new google.maps.LatLng(44.562581492387, -123.27887561918942),
							new google.maps.LatLng(44.562581492387, -123.27895876766888),
							new google.maps.LatLng(44.56256668188538, -123.27896010877339),
							new google.maps.LatLng(44.56256620412718, -123.2791337818071),
							new google.maps.LatLng(44.562666533244226, -123.2791337818071),
							new google.maps.LatLng(44.5626670110016, -123.27915523947922),
							new google.maps.LatLng(44.563098902060844, -123.27915859224049),
							new google.maps.LatLng(44.56310081307605, -123.27907343210427),
							new google.maps.LatLng(44.56322646218748, -123.27907611431328),
							new google.maps.LatLng(44.56322837319847, -123.27919077874867),
							new google.maps.LatLng(44.563474893121125, -123.27919077874867),
							new google.maps.LatLng(44.56347680412395, -123.27914786340443),
							new google.maps.LatLng(44.56357378743596, -123.27914585174767),
							new google.maps.LatLng(44.56357569843555, -123.27905935050694)
                ]},
				sackett : {name: "Sackett Hall",
					        path : [
							new google.maps.LatLng(44.56485070333875, -123.28408822417259),
							new google.maps.LatLng(44.565138301759085, -123.28408688306808),
							new google.maps.LatLng(44.565138301759085, -123.28393265604973),
							new google.maps.LatLng(44.56513113570275, -123.28393265604973),
							new google.maps.LatLng(44.565131613439874, -123.28378714621067),
							new google.maps.LatLng(44.56535710492054, -123.28378915786743),
							new google.maps.LatLng(44.56535806039104, -123.28408151865005),
							new google.maps.LatLng(44.565641356706884, -123.28408688306808),
							new google.maps.LatLng(44.56564183443981, -123.28393131494522),
							new google.maps.LatLng(44.565447396814974, -123.28392997384071),
							new google.maps.LatLng(44.565447396814974, -123.28378848731518),
							new google.maps.LatLng(44.56554581004293, -123.28378982841969),
							new google.maps.LatLng(44.56554628777661, -123.28363493084908),
							new google.maps.LatLng(44.56525964684546, -123.28363358974457),
							new google.maps.LatLng(44.56525964684546, -123.28357122838497),
							new google.maps.LatLng(44.565296910246374, -123.28357122838497),
							new google.maps.LatLng(44.565297387982135, -123.2834404706955),
							new google.maps.LatLng(44.56525916910941, -123.2834418118),
							new google.maps.LatLng(44.56525916910941, -123.28336268663406),
							new google.maps.LatLng(44.565544854575464, -123.28336335718632),
							new google.maps.LatLng(44.56554628777661, -123.28320845961571),
							new google.maps.LatLng(44.56544596361139, -123.28320778906345),
							new google.maps.LatLng(44.56544644134591, -123.2830622792244),
							new google.maps.LatLng(44.56564183443981, -123.28306294977665),
							new google.maps.LatLng(44.56564183443981, -123.2829100638628),
							new google.maps.LatLng(44.56535806039104, -123.28290805220604),
							new google.maps.LatLng(44.56535686605289, -123.28306160867214),
							new google.maps.LatLng(44.56535304417068, -123.28306127339602),
							new google.maps.LatLng(44.565351849832425, -123.2832071185112),
							new google.maps.LatLng(44.565132091177006, -123.28320577740669),
							new google.maps.LatLng(44.565132091177006, -123.2830673083663),
							new google.maps.LatLng(44.565132330045536, -123.2829137519002),
							new google.maps.LatLng(44.5648483146416, -123.28291341662407),
							new google.maps.LatLng(44.56484783690215, -123.28306898474693),
							new google.maps.LatLng(44.5650432320067, -123.28307032585144),
							new google.maps.LatLng(44.56504275426884, -123.28320510685444),
							new google.maps.LatLng(44.56493956280313, -123.28320577740669),
							new google.maps.LatLng(44.564938607325736, -123.28336134552956),
							new google.maps.LatLng(44.56522142794792, -123.28336201608181),
							new google.maps.LatLng(44.56521999473878, -123.2834404706955),
							new google.maps.LatLng(44.56519037507519, -123.28343980014324),
							new google.maps.LatLng(44.56519037507519, -123.28357189893723),
							new google.maps.LatLng(44.56522286115702, -123.28357391059399),
							new google.maps.LatLng(44.56522142794792, -123.28363224864006),
							new google.maps.LatLng(44.56493956280313, -123.28362956643105),
							new google.maps.LatLng(44.56494051828051, -123.28378714621067),
							new google.maps.LatLng(44.56503558820076, -123.28378714621067),
							new google.maps.LatLng(44.56503463272493, -123.28393332660198),
							new google.maps.LatLng(44.564850225599336, -123.28393399715424)
				]},
                kelley:
					{name: "Kelley Engineering Center",
							path : 
							[new google.maps.LatLng(44.56718302819598, -123.27931201462889),
							new google.maps.LatLng(44.56718374477637, -123.27925937627697),
							new google.maps.LatLng(44.56717227948899, -123.27925769989633),
							new google.maps.LatLng(44.567172040628826, -123.2789764032259),
							new google.maps.LatLng(44.56729935296451, -123.27897707377815),
							new google.maps.LatLng(44.567300308403134, -123.27886173879051),
							new google.maps.LatLng(44.567382237205926, -123.27886173879051),
							new google.maps.LatLng(44.567382237205926, -123.27885369216347),
							new google.maps.LatLng(44.567448162339524, -123.27885402743959),
							new google.maps.LatLng(44.567449356634725, -123.27814927696977),
							new google.maps.LatLng(44.567375071426, -123.27814994752202),
							new google.maps.LatLng(44.567375071426, -123.27812111377511),
							new google.maps.LatLng(44.56728669340141, -123.27812077850922),
							new google.maps.LatLng(44.567286215681975, -123.27813754231556),
							new google.maps.LatLng(44.56718374477637, -123.27813821285758),
							new google.maps.LatLng(44.56718398363651, -123.2781197726706),
							new google.maps.LatLng(44.56708724523291, -123.27811876684223),
							new google.maps.LatLng(44.56708796181448, -123.2781496122459),
							new google.maps.LatLng(44.56700698804066, -123.27814894170388),
							new google.maps.LatLng(44.567006749179775, -123.2781529650174),
							new google.maps.LatLng(44.56696733712502, -123.27815229446514),
							new google.maps.LatLng(44.56696518737582, -123.27927245204592),
							new google.maps.LatLng(44.56710539860091, -123.2792734578743),
							new google.maps.LatLng(44.56710587632182, -123.2793110088005)
				]},
				valley: {name: "Valley Library",
							path: [
							new google.maps.LatLng(44.56537334791716, -123.27654987573624),
							new google.maps.LatLng(44.56537764753316, -123.27606976032257),
							new google.maps.LatLng(44.56539914560839, -123.27606908977032),
							new google.maps.LatLng(44.565400578813126, -123.27595576643944),
							new google.maps.LatLng(44.565377169798076, -123.27595710754395),
							new google.maps.LatLng(44.56537764753316, -123.27566608786583),
							new google.maps.LatLng(44.56538290261896, -123.27563591301441),
							new google.maps.LatLng(44.5653824248839, -123.27557288110256),
							new google.maps.LatLng(44.565359971332036, -123.27557019889355),
							new google.maps.LatLng(44.565359971332036, -123.27554270625114),
							new google.maps.LatLng(44.565351849832425, -123.27551521360874),
							new google.maps.LatLng(44.56534325059629, -123.27549107372761),
							new google.maps.LatLng(44.56532796306226, -123.27547095716),
							new google.maps.LatLng(44.565312197788586, -123.27545687556267),
							new google.maps.LatLng(44.56529069968123, -123.27544882893562),
							new google.maps.LatLng(44.56526872382994, -123.27544748783112),
							new google.maps.LatLng(44.56524961438728, -123.2754535228014),
							new google.maps.LatLng(44.56523384909239, -123.27546492218971),
							new google.maps.LatLng(44.565217128320384, -123.27548369765282),
							new google.maps.LatLng(44.565204707172356, -123.27550783753395),
							new google.maps.LatLng(44.565197063387636, -123.27553197741508),
							new google.maps.LatLng(44.56519563017789, -123.27559299767017),
							new google.maps.LatLng(44.565165532765064, -123.27559232711792),
							new google.maps.LatLng(44.565164099554536, -123.27553868293762),
							new google.maps.LatLng(44.565077629120964, -123.27557288110256),
							new google.maps.LatLng(44.56507619590827, -123.27561914920807),
							new google.maps.LatLng(44.56490850977993, -123.27561780810356),
							new google.maps.LatLng(44.564908032040975, -123.27570766210556),
							new google.maps.LatLng(44.56476279921892, -123.2757056504488),
							new google.maps.LatLng(44.564755155376126, -123.27652104198933),
							new google.maps.LatLng(44.564754199895724, -123.27661626040936),
							new google.maps.LatLng(44.5648526142964, -123.27661693096161),
							new google.maps.LatLng(44.56485452525399, -123.27652305364609),
							new google.maps.LatLng(44.5650714185324, -123.27652774751186),
							new google.maps.LatLng(44.5650714185324, -123.2765981554985),
							new google.maps.LatLng(44.56519324149491, -123.27660016715527),
							new google.maps.LatLng(44.565194196968115, -123.27654853463173)
                ]},
				dryden: {name: "Dryden Hall",
							path : [
							new google.maps.LatLng(44.56322598446386, -123.2849756331234),
							new google.maps.LatLng(44.56322569779472, -123.285184711267),
							new google.maps.LatLng(44.563220920266865, -123.28518571709537),
							new google.maps.LatLng(44.563221398019664, -123.2852896526947),
							new google.maps.LatLng(44.56314758516507, -123.28528931741857),
							new google.maps.LatLng(44.56314686853495, -123.28518772875213),
							new google.maps.LatLng(44.562932834597596, -123.2851860523715),
							new google.maps.LatLng(44.56293259572, -123.28519342844629),
							new google.maps.LatLng(44.56287478731172, -123.28519342840536),
							new google.maps.LatLng(44.56287478731172, -123.28497449309452),
							new google.maps.LatLng(44.56293104301569, -123.28497469425201),
							new google.maps.LatLng(44.562931162454475, -123.28498153389319),
							new google.maps.LatLng(44.56317171170715, -123.28498086334093),
							new google.maps.LatLng(44.56317171170715, -123.2849741578184)
                    ]}
			}
		}

	});