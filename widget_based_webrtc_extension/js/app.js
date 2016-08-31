var app = angular.module("tangofx",['ui.router']);

app.controller("AppController",['$scope','$state','$location',function($scope, $state,$location){

	$scope.chatRoom = "";
	$scope.chatRoomModel = "";

	//Join Room 
	$scope.joinClickHandler = function(){
		if($scope.chatRoomModel == "") {
			alert("Please enter Room name.")
		}else{
			$scope.chatRoom = $scope.chatRoomModel;
			//$location.search('',$scope.chatRoom)
			window.location.href = "?"+$scope.chatRoomModel+"#/widgets/"+$scope.chatRoomModel;
			//$location.path("?"+$scope.chatRoomModel+"/#/widgets")
			//$state.go("widgets")
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

app.controller("HomeController",['$scope',function($scope){

	$scope.$parent.chatRoom = "";
	$scope.$parent.chatRoomModel = ""
	//$(".navbar-form").show();

	//Video Related code
	$scope.$parent.resize();
	//windowOnload();

}])

app.controller("WidgetsController",['$scope',"widgetData",'$location','$stateParams',function($scope,widgetData,$location,$stateParams){

	$scope.widgets = widgetData.data;//[{title:"Code",path:"AddCode"},
					//{title:"Draw",path:"AddDraw"}]

	//Video Related starts
	//$scope.$parent.resize();
	//windowOnload();
	//TFXjoinroom();
	//Video related ends
	
	$scope.currentWidget = -1;
	//console.log(widgetData)

	$scope.$parent.chatRoom = $stateParams.roomId

	//$(".navbar-form").hide();

	window.updateWidget = $scope.updateWidget = function(_id){
		$scope.currentWidget = _id;
		$scope.$apply();
	}

	$scope.linkClickHandler = function(_widget, _index){

		//if($scope.currentWidget == _index)	return;	
		//if($scope.currentWidget != -1) $(".widget_"+$scope.currentWidget).hide();

		var _elem = document.getElementsByClassName("widget_"+_index);
		
		console.log("--------------------------------------------");
		console.log(_elem)

		TFXPluginFunction(_widget.plugintype,window.innerWidth,window.innerHeight);

		if(_elem.item.length != 0){
			//hide existing widget iframe
			//$(".widget_"+_index).show();
		}else{
			//load new widget iframe
			//TFXPluginFunction(_widget.plugintype,window.innerWidth,window.innerHeight);
			//$("#widget_loader").append('<iframe src="widgets/'+_widget.path+'/index.html" class="widget_'+_index+'" id="'+_widget.plugintype+'"></iframe>')
			//$("#widget_loader").append('<iframe src="'+_widget.url+'" id="widget_'+_index+'"></iframe>')
		}
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
