var app = angular.module("tangofx",['ngRoute']);

app.controller("AppController",['$scope','$state','$location',function($scope, $state,$location){

	$scope.chatRoom = "";
	$scope.chatRoomModel = "";

	//Join Room 
	$scope.joinClickHandler = function(){
		if($scope.chatRoomModel == "") {
			alert("Please enter Session")
		}
		else if($scope.chatRoomModel.indexOf(" ")>0){
			alert("Please enter 1 word session name");
		}
		else{
			$scope.chatRoom = $scope.chatRoomModel;
			window.location.href = "?"+$scope.chatRoomModel+"#/widgets/"+$scope.chatRoomModel;
		}
	}

	//Right side Button actions
	$scope.logoffHandler = function(){
		$scope.chatRoom = "";
		$scope.chatRoomModel = "";
		window.location.href = "index.html";
		//$state.go("home");
	}

	//Resize Handler	
	$scope.resize = function(){
		var localVideo = $("#localVideo")
		localVideo.css({width:window.innerWidth+"px",height:window.innerHeight+"px"})
	}
	$(window).resize($scope.resize);
	//Video Related starts
	windowOnload();
	TFXjoinroom();
	//Video related ends
	
}])

app.controller("HomeController",['$scope','$sce',function($scope,$sce){

	$scope.$parent.chatRoom = "";
	$scope.$parent.chatRoomModel = ""
	//$(".navbar-form").show();

	//Video Related code
	$scope.$parent.resize();
	//windowOnload();

	//$scope.$parent.notifications= $sce.trustAsHtml('<div class="roboto"> <span class="fw-100-small">Put a name in the box. </span> <br/> <span class="fw-100-small">Click </span> <span class="fw-100">Tango Now</span> <span class="fw-100-small">button above </span>');
}])

app.controller("WidgetsController",['$scope',"widgetData",'$location','$stateParams','$sce',

	function($scope,widgetData,$location,$stateParams ,$sce){

	$scope.widgets = widgetData.data;
	$scope.currentWidget = -1;
	//console.log(widgetData)

	// display room name on head bar after joiing a room 
	document.getElementById("roonnameDiv").removeAttribute("hidden");
	$scope.$parent.chatRoom = $stateParams.roomId;
	$scope.$parent.myStyle = {
          color: "#fff",
          "font-size": "16px"
        };
	
	//$scope.$parent.notifications= $sce.trustAsHtml('<div class="roboto"> <span class="fw-100">Oops!</span> <br/> <span class="fw-400">It takes two to Tango</span> <br/> <span class="fw-100-small">Why dont you invite someone</span>  </div>');
	
	/*	$scope.$parent.notificationStyle = {
	          color: "#fff",
	          "font-size": "16px"
	        };*/

	window.updateWidget = $scope.updateWidget = function(_id){
		$scope.currentWidget = _id;
		$scope.$apply();
	}

	$scope.linkClickHandler = function(_widget, _index){
		var _elem = document.getElementsByClassName("widget_"+_index);
		TFXPluginFunction(_widget.plugintype,window.innerWidth,window.innerHeight);
		$scope.currentWidget = _index;
	}

}])


app.run( function ($rootScope,$location) {
	var locationSearch;
    $rootScope.$on('$stateChangeStart',
    	function (event, toState, toParams, fromState, fromParams) {
        //save location.search so we can add it back after transition is done
        	locationSearch = $location.search();
    });

	$rootScope.$on('$stateChangeSuccess',
	    function (event, toState, toParams, fromState, fromParams) {
	        //restore all query string parameters back to $location.search
	        $location.search(locationSearch);
	});
});

app.config(function($urlRouterProvider,$stateProvider,$locationProvider){

	$urlRouterProvider.otherwise("/home");

	$stateProvider.
	state('home',{
		url:'/home',
		templateUrl:"templates/home.html",
		controller:"HomeController"
	}).
	state('widgets',{
		url:'/widgets/:roomId',
		templateUrl:"templates/widgets.html",
		controller:"WidgetsController",
		resolve:{
			widgetData:function($http){
				return $http.get('widgetsmanisfest.json').then(function(res){
					return res;
				})				
			}
		} 
		
	})
		
})
