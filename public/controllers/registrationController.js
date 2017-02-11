var application=angular.module("myApp",[]);
application.controller("loginCon",function($scope,$http){
	$scope.formModel={};
	$scope.onSubmit=function(){
		console.log($scope.formModel);
		$http.post("http://localhost:3000/register",$scope.formModel)
			.then(function(response){ //use the term response for data from server for consistency

				console.log(response.data);
			})
			.catch(function(data){
				console.log("errorOccured :(  !!!!!!!");
			});
	};
});