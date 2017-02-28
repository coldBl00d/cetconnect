var application=angular.module("myApp",['ngRoute','firebase','ui.router']);
var broadcastsLocal = [];

application.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

	 $urlRouterProvider.otherwise("login");
	 
	 $stateProvider.state("login",{
		 url:"/login",
		 templateUrl:'html/login.html',
		 controller:'loginCon'
	 })
	 .state('dashboard', {
		 url:'/dashboard',
		 templateUrl:'html/broadcast.html',
		 controller:'broadcastViewController'
	 })
	 .state('broadcast', {
		 url:'/broadcast',
		 templateUrl:'html/broadcast.html',
		 controller:'broadcastViewController'
	 }).state('channel',{
		 url:'/channel',
		 templateUrl:'html/channels.html',
		 controller:''
	 }); 
	 
}]);





// application.config(function($routeProvider){
//     $routeProvider
// 	.when('/',{
// 		templateUrl:'html/login.html',
		
// 	})
// 	.when('/dashboard',{
// 		resolve:{
// 			"check":function($location,$rootScope){
// 				if(!$rootScope.loggedIn){
// 					$location.path('/');
// 				}
// 			}
// 		},
// 		templateUrl:'html/broadcast.html',
// 		css:'styles/bootstrap.min.css'
// 	})
// 	.when('/login',{
// 		templateUrl:'html/login.html'
// 	})
// 	.when('/channels',{
// 		templateUrl:'html/channels.html'
// 	})
// 	.when('/broadcast', {
// 		templateUrl:'html/broadcast.html'
// 	})
// 	.otherwise({
// 		redirectTo:'/'
// 	});
// });


application.controller("loginCon",function($scope,$http,$location,$rootScope){
	console.log("In my controller");
	$rootScope.showsidebar=true;
	$scope.formModel={admissionNumber:"", passwordLogin:""};
	$scope.login=function(){
		console.log($scope.formModel);
		$http.post("http://localhost:3000/",$scope.formModel)
			.then(function(response){ //use the term response for data from server for consistency
                    console.log(response);
                    if (response.data.status == '200'){
					   $rootScope.loggedIn=true;
                        $location.path("/dashboard");
                    }
			},function(err){
				console.log("Something went wrong when sending the data");
			});
	};
});


/*sidebar routing controller*/

application.controller('sidebarcontroller', function($scope,$location,$state){
	var header = "[sidebasrcontroller]";
	$scope.changeView = function(view){
		console.log(header, "changing view to "+ view);
	$state.go(view);
	}

});

/* Dashboard controllers */

application.controller('broadcastViewController', function($scope, $rootScope, $firebaseArray){
	
	$rootScope.showsidebar=false;
	var broadcast_reference = firebase.database().ref('channel/all').child('broadcasts');
	$scope.broadcastCollection = $firebaseArray(broadcast_reference);
	
});


