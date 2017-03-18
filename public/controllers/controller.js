var application=angular.module("myApp",['ngRoute','firebase','ui.router','luegg.directives','ngAria','ngMaterial','ngLetterAvatar']);
var address = 'http://localhost:3000/';


application.factory('$validateLogin',function($rootScope,$window){

	return function(){
        var loggedIn = sessionStorage.getItem('loggedIn');
		if(!loggedIn){
		 	$window.location.href = address;
		}else{
			$rootScope.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            $rootScope.loggedIn = loggedIn; 
		}
	}

});

application.factory('$myElementInkRipple', function($mdInkRipple) {
  return {
    attach: function (scope, element, options) {
      return $mdInkRipple.attach(scope, element, angular.extend({
        center: true,
        dimBackground: true
      }, options));
    }
  };
});

application.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
	 
     
	 $urlRouterProvider.otherwise("login");
	 
	 $stateProvider
	 .state("login",{
		 url:"/login",
		 templateUrl:'html/login.html',
		 controller:'loginCon'
	 })
	 .state('dashboard', {
		 url:'/dashboard',
		 templateUrl:'html/broadcast.html',
		 controller:'broadcastViewController'
	 })
	 .state('broadcast', {
		 url:'/broadcast',
		 templateUrl:'html/broadcast.html',
		 controller:'broadcastViewController'
	 }).state('channels',{
		 url:'/channels',
		 templateUrl:'html/channels.html',
		 controller:'channelsController'
	 }).state('requestSendBroadcast',{
		 url:'/broadcastsend',
		 templateUrl:'html/broadcastForm/bForm.html',
		 controller:'bformController'
	 }).state('requests',{
		 url:'/requests',
		 templateUrl:'html/incomingRequest/incomingRequest.html',
		 controller:'requestController'
	 	}	
	 ); 
	 
}]);


application.controller("loginCon",function($scope,$http,$state,$rootScope){
	console.log("In my controller");
    $rootScope.loggedIn = false;
	$rootScope.hidesidebar=true;
	$rootScope.currentUser = {};
	$rootScope.currentUser.name = "User";
	$scope.formModel={admissionNumber:"", passwordLogin:""};
	$scope.login=function(){
		$http.post(address,$scope.formModel)
			.then(function(response){ //use the term response for data from server for consistency
                    if (response.status == 210){
					   var currentUser = packUser(response.data);
					   sessionStorage.setItem('currentUser', currentUser);
					   sessionStorage.setItem('loggedIn', true);
					   $rootScope.loggedIn=true;
					   $rootScope.currentUser = response.data;
                        console.log($rootScope.currentUser);
                       $state.go("broadcast");
                    }else if(response.data.auth == false){
						console.log(response);
						alert("Check credentials");
					}
			},function(err){
				alert("Cant reach server");
			});
	};
});

function packUser(user){
	var pack =  {
		'userId':user.userId,
		'name':user.name, 
		'department':user.department,
		'post':user.post,
		'adminOf':user.adminOf,
		'subChannels':user.subChannels
	}

	return JSON.stringify(pack);

}

/*sidebar routing controller*/

application.controller('sidebarcontroller', function($rootScope,$scope,$location,$state,$timeout,$mdSidenav,$mdMedia,$element, $myElementInkRipple){
	var header = "[sidebasrcontroller]";
	$scope.toggleSideNav = buildToggler('left');
	$scope.enableMenuButton = $mdMedia('gt-xs');
	$scope.openMenu= menuWorker;
	$scope.$watch(function(){return $mdMedia('gt-xs');}, function(value){$scope.enableMenuButton=value;});
	
	function buildToggler(componentId) {
			return function() {
			$mdSidenav(componentId).toggle();
		};
	}

	function menuWorker(mdMenu, event){
		originatorEv = event;
		mdMenu.open(event);
	}


	$scope.changeView = function(view){
		$state.go(view);
	}
    
    $scope.onClick = function (ev) {
        $myElementInkRipple.attach($scope, angular.element(ev.target), { center: true });
    }
    
	console.log(header);

});

/* Dashboard controllers */

application.controller('broadcastViewController', function($scope, $rootScope, $firebaseArray, $anchorScroll, $location,$window,$validateLogin ){
	
	$validateLogin();
	$rootScope.hidesidebar=false;
	$scope.channels=$rootScope.currentUser.subChannels;
	var userSubbedChannels = $rootScope.currentUser.subChannels;
	var today = new Date();
	var todayString = today.getDate().toString()+'-'+today.getMonth().toString()+'-'+today.getFullYear().toString();
	var today_reference = firebase.database().ref('today/'+todayString);
	var firebaseToday = $firebaseArray(today_reference);
	var firebaseCollection;
	var toDisplay=[];
	

	firebaseToday.$watch(function(someThingHappened){
		if(someThingHappened.event == 'child_added'){
			var newChild = firebaseToday.find(function(item){return item.$id == someThingHappened.key;});
			if(newChild){
				if(searchSubList(newChild.channel, userSubbedChannels)){
					toDisplay.push(newChild);
				}
			}
			$scope.broadcastCollection = toDisplay;	
		}
	})	

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
    
    $scope.$watch(function(){return $rootScope.hidesidebar}, function(newValue){$rootScope.hidesidebar=newValue;});
	
});

function searchSubList(channel, subList){
    return subList.findIndex(function(item){return item==channel;}) != -1;
}