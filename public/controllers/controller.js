var application=angular.module("myApp",['ngRoute','firebase','ui.router','luegg.directives']);

application.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

	 $urlRouterProvider.otherwise("login");
	 
	 $stateProvider
	 .state("login",{
		 url:"/login",
		 templateUrl:'html/login.html',
		 controller:'loginCon'
	 })
	 .state('dashboard', {
		 templateUrl:'html/broadcast.html',
		 controller:'broadcastViewController'
	 })
	 .state('broadcast', {
		 url:'/broadcast',
		 templateUrl:'html/broadcast.html',
		 controller:'broadcastViewController'
	 }).state('channels',{
		 templateUrl:'html/channels.html',
		 controller:'channelsController'
	 }); 
	 
}]);


application.controller("loginCon",function($scope,$http,$state,$rootScope){
	console.log("In my controller");
	$rootScope.showsidebar=true;
	$scope.formModel={admissionNumber:"", passwordLogin:""};
	$scope.login=function(){
		$http.post("http://localhost:3000/",$scope.formModel)
			.then(function(response){ //use the term response for data from server for consistency
                    if (response.status == 210){
					   $rootScope.loggedIn=true;
					   $rootScope.currentUser = response.data;
					   console.log($rootScope.currentUser);
                       $state.go("broadcast");
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

application.controller('broadcastViewController', function($scope, $rootScope, $firebaseArray, $anchorScroll, $location){
	
	$rootScope.showsidebar=false;
	var today = new Date();
	var todayString = today.getDate().toString()+'-'+today.getMonth().toString()+'-'+today.getFullYear().toString();
	console.log(todayString);
	var broadcast_reference = firebase.database().ref('today/'+todayString);
	$scope.broadcastCollection = $firebaseArray(broadcast_reference);
	
	/* called when the data is loaded into the broadcastCollection */
	$scope.broadcastCollection.$loaded().then(function(){
      	$anchorScroll();
	});

	/*filter selected in the broadcast page*/
	$scope.filterSelected = function(channel){
		$scope.currentFilter = channel.name;
		if($scope.currentFilter == 'All'){
			/*load broadcast from today for all the subbed channels*/
			$scope.broadcastCollection = $firebaseArray(broadcast_reference);
			$scope.broadcastCollection.$loaded().then(function(){
      			$anchorScroll();
			});
		}else{
			/*load recent ones for all the selected channel*/
			$scope.broadcastCollection = $firebaseArray(firebase.database().ref('channel/'+channel.name.toLowerCase()+'/broadcasts'));
			$scope.broadcastCollection.$loaded().then(function(){
      			$anchorScroll();
			});
			return;
		}
	}
	
});

