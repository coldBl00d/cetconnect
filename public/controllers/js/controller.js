var application=angular.module("myApp",['ngRoute']);

application.config(function($routeProvider){
	$routeProvider
	.when('/',{
		templateUrl:'login.html'
	})
	.when('/dashboard',{
		templateUrl:'dashboard.html'
	})
	.otherwise({
		redirectTo:'/'
	});
})

application.controller("loginController",function($scope,$http,$location){
	$scope.formModel={};
	$scope.login=function(){
		console.log($scope.formModel);
		$http.post("http://localhost:3000/index",$scope.formModel)
			.then(function(response){ //use the term response for data from server for consistency
					alert("Login Successful!.");
			},function(){
				alert("Invalid Credentials");
				console.log("errorOccured :(  !!!!!");
			});
	};
});
