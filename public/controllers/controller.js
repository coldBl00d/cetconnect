var application=angular.module("myApp",['ngRoute']);


application.config(function($routeProvider){
	console.log("Routing...");
    $routeProvider
	.when('/',{
		templateUrl:'html/login.html'
	})
	.when('/dashboard',{
		resolve:{
			"check":function($location,$rootScope){
				if(!$rootScope.loggedIn){
					$location.path('/');
				}
			}
		},
		templateUrl:'html/dashboard.html'
	})
	.when('/login',{
		templateUrl:'html/login.html'
	})
	.otherwise({
		redirectTo:'/'
	});
})


application.controller("loginCon",function($scope,$http,$location,$rootScope){
	console.log("In my controller");
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
