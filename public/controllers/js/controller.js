var application=angular.module("myApp",['ngRoute']);

application.config(function($routeProvider){
	$routeProvider
	.when('/',{
		templateUrl:'login.html'
	})
	.when('/dashboard',{
		resolve:{
			"check":function($location,$rootScope){
				if(!$rootScope.loggedIn){
					$location.path('/');
				}
			}
		},
		templateUrl:'dashboard.html'
	})
	.when('/login',{
		templateUrl:'login.html'
	})
	.otherwise({
		redirectTo:'/'
	});
})

application.controller("loginController",function($scope,$http,$location,$rootScope){
	$scope.formModel={};
	$scope.login=function(){
		console.log($scope.formModel);
		$http.post("http://localhost:3000/index",$scope.formModel)
			.then(function(response){ //use the term response for data from server for consistency
					$rootScope.loggedIn=true;
					$location.path("/dashboard");
			},function(){
				alert("Invalid Credentials");
				console.log("errorOccured :(  !!!!!");
			});
	};
});
