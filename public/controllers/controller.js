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
		 templateUrl:'html/broadcast.html',
		 controller:'broadcastViewController'
	 }).state('channels',{
		 templateUrl:'html/channels.html',
		 controller:'channelsController'
	 }).state('requestSendBroadcast',{
		 url:'/broadcastsend',
		 templateUrl:'html/broadcastForm/bForm.html',
		 controller:'bformController'
	 }); 
	 
}]);


application.controller("loginCon",function($scope,$http,$state,$rootScope){
	console.log("In my controller");
	$rootScope.showsidebar=true;
	$rootScope.currentUser = {};
	$rootScope.currentUser.name = "User";
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
	$scope.channels=$rootScope.currentUser.subChannels;
	var userSubbedChannels = $rootScope.currentUser.subChannels;
	var today = new Date();
	var todayString = today.getDate().toString()+'-'+today.getMonth().toString()+'-'+today.getFullYear().toString();
	var today_reference = firebase.database().ref('today/'+todayString);
	var firebaseCollection;
	var toDisplay = [];
	

	$scope.broadcastCollection = toDisplay;	

	today_reference.once('value').then(function(dataSnapshot){
			toDisplay = [];
			dataSnapshot.forEach(function(item){
				for(var i=0; i<userSubbedChannels.length; i++){
					if(userSubbedChannels[i]==item.val().channel){
						toDisplay.push(item.val());
						$scope.$apply();
						break;
					}
				}
			});
			
			$anchorScroll();
		
	});
	
	today_reference.on('child_added', function(childSnapshot, prevChildKey) {
		for(var i=0; i<userSubbedChannels.length; i++){
				if(userSubbedChannels[i]==childSnapshot.val().channel){
					toDisplay.push(childSnapshot.val());
					break;
				}
			}
		//$scope.$apply();
	});

	/*filter selected in the broadcast page*/
	$scope.filterSelected = function(channel){
		$scope.currentFilter = channel;
		if($scope.currentFilter == 'All'){
			$scope.broadcastCollection = toDisplay;
			$anchorScroll();
		}else{
			/*load recent ones for all the selected channel*/
			firebaseCollection = $firebaseArray(firebase.database().ref('channel/'+channel+'/broadcasts').limitToLast(50));
			firebaseCollection.$loaded().then(function(){
				$scope.broadcastCollection = firebaseCollection;
				$anchorScroll();
			});
			return;
		}
	}
	
});

function loadToday(fromFirebase, toDisplay, subList){
	
}

