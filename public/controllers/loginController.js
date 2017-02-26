
application.controller("loginCon",function($scope,$http,$location,$rootScope){
	console.log("In my controller");
	$scope.formModel={};
	$scope.login=function(){
		console.log($scope.formModel);
		$http.post("http://localhost:3000/",$scope.formModel)
			.then(function(response){ //use the term response for data from server for consistency
                    console.log(response);
                    if (response.data.status == '200'){
					   $rootScope.loggedIn=true;
                        $location.path("html/dashboard");
                    }
			},function(err){
				console.log("Something went wrong when sending the data");
			});
	};
});
