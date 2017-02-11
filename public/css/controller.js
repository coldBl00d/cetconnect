var application=angular.module("myApp",[]);
application.controller("loginCon",function($scope,$http){
	$scope.formModel={};
	$scope.onSubmit=function(){
		console.log($scope.formModel);
		$http.post("http://httpbin.org/post",$scope.formModel)
			.then(function(data){
				console.log(data);
			})
			.catch(function(data){
				console.log("errorOccured :(  !!!!!!!");
			});
	};
});
