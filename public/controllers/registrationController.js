var application=angular.module("myApp",[]);
application.controller("loginCon",function($scope,$http){
	$scope.formModel={};
	$scope.onSubmit=function(){
		console.log($scope.formModel);
		$http.post("http://localhost:3000/register",$scope.formModel)
			.then(function(data){
				//console.log(data);
			})
			.catch(function(data){
				console.log("errorOccured :(  !!!!!!!");
			});
	};
});