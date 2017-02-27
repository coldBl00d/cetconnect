var application=angular.module("myApp",['ngRoute']);
var broadcastsLocal = [];

application.config(function($routeProvider){
    $routeProvider
	.when('/',{
		templateUrl:'html/login.html',
		
	})
	.when('/dashboard',{
		resolve:{
			"check":function($location,$rootScope){
				if(!$rootScope.loggedIn){
					$location.path('/');
				}
			}
		},
		templateUrl:'html/dashboard.html',
		css:'styles/bootstrap.min.css'
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

application.controller('sidebarcontroller', function($scope,$location){



});

/* Dashboard controllers */

application.controller('broadcastViewController', function($scope, $rootScope){
	
	
	$rootScope.showsidebar=false;
	$scope.broadcastCollection = [];
	broadcastReference.on('value', function(snapshot){ 
			$scope.broadcastCollection = snapshot.val();
			// snapshot.forEach(function (child) {

			// 	var temp = {};
			// 	temp.senderid = child.val().sender;
			// 	temp.message = child.val().message;
			// 	temp.timestamp = child.val().timestamp;
			// 	$scope.broadcastCollection.push(temp);
			
			// });
			$scope.$apply();
			console.log($scope.broadcastCollection);
	});


});

