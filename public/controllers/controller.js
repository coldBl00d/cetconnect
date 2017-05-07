var application=angular.module("myApp",['ngMessages','ngRoute','firebase','ui.router','luegg.directives','ngAria','ngMaterial','ngLetterAvatar', 'material.components.expansionPanels']);
var address = 'http://localhost:3000/';
var socket;
//var address = 'https://blooming-reaches-58473.herokuapp.com/';


application.factory('$validateLogin',function($rootScope,$window,$socket){

	return function(){
        var loggedIn = sessionStorage.getItem('loggedIn');
		if(!loggedIn){
		 	$window.location.href = address;
		}else{
			$rootScope.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            $rootScope.loggedIn = loggedIn;
			//make sure this is commented -- keku 
			//$socket.identify($rootScope.currentUser.userId);
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

application.factory('$packingService', function($rootScope){

	return {

		storeUser: function(){
			var user = $rootScope.currentUser;
			var pack =  {
			'userId':user.userId,
			'name':user.name, 
			'department':user.department,
			'post':user.post,
			'adminOf':user.adminOf,
			'subChannels':user.subChannels,
			'userToken':user.userToken,
			'batch':user.batch
			}
		
			var packedUser = JSON.stringify(pack);
			sessionStorage.setItem('currentUser', packedUser);
			return;
		},

		packUser: function packUser(user){
			var pack =  {
				'userToken':user.userToken,
				'userId':user.userId,
				'name':user.name, 
				'department':user.department,
				'post':user.post,
				'adminOf':user.adminOf,
				'subChannels':user.subChannels,
				'batch':user.batch
			}
			console.log('packed');
			return JSON.stringify(pack);
		}

	}
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
	 ).state('composeMessage',{
		 url:'/composeMessage',
		 templateUrl:'html/composeMessage/composeMessage.html',
		 controller:'messageController'
	 }).state('inbox',{
	     url:'/inbox',
		 templateUrl:'html/inbox/inbox.html',
		 controller:'inboxController'
	 }).state('sentItems',{
	     url:'/setItems',
		 templateUrl:'html/sent/sent.html',
		 controller:'sentItemsController'
	 }).state('adminConsoleLogin', {
		 url:'/admin', 
		 templateUrl:'html/adminLogin/adminLogin.html',
		 controller:'adminLogin'
	 }).state('adminDash',{
		 url:'/dash',
		 templateUrl:'html/adminDash/dash.html',
		 controller:'dashController'
	 });
	 
}]);

application.controller("loginCon",function($scope,$http,$state,$rootScope, $rememberMe, $packingService, $notificationService, $mdToast, $registration){
	var header = '[LoginController]';
	console.log(header,'Starting login controller');
	$rootScope.openRegistration = false;
	$rootScope.editUser = {};
    $rootScope.loggedIn = false;
	$rootScope.hidesidebar=true;
	$rootScope.currentUser = {};
	$rootScope.currentUser.name = "User";
	$scope.payload={userId:"", password:""};
	$scope.loginWait = false;

	//prevents identifying itself many times over.

	//look if registration is open
	$http.get(address+'registrationStatus')
	.then(function(res){
		if(res.status==200){
			$rootScope.openRegistration = true;
		}else{
			$rootScope.openRegistration = false;
		}
		console.log(header,'registration status ' + $rootScope.openRegistration);
	});

	if(!$rootScope.deviceToken){
		$notificationService.identify(function(token){
			$rootScope.deviceToken = token;
			console.log("token",token);
		});
	}

	$scope.login=function(){
		$scope.loginWait = true;
		console.log($scope.rememberMe);
		if($scope.rememberMe){
			console.log("getting token");
			$scope.payload.deviceToken = $notificationService.getToken();
			console.log($scope.payload.deviceToken);
		}else{
			$scope.payload.deviceToken = null;
		}

		$http.post(address,$scope.payload)
			.then(function(response){ //use the term response for data from server for consistency
                    if (response.status == 210){
					   $scope.loginWait = false;
					   var currentUser = $packingService.packUser(response.data);
					   sessionStorage.setItem('currentUser', currentUser);
					   sessionStorage.setItem('loggedIn', true);
					   $rootScope.loggedIn=true;
					   $rootScope.currentUser = response.data;
                       console.log($rootScope.currentUser);
					  
					   //remember the user if remember me is selected 
					   if($scope.rememberMe) $rememberMe.remember($scope.payload.userId, $scope.payload.password);
					   else $rememberMe.forget();
                       $state.go("broadcast");
                    }else if(response.data.auth == false){
						$scope.loginWait = false;
						console.log(response);
						$mdToast.show($mdToast.simple().textContent('Check credential'));
					}
			},function(err){
				$scope.loginWait = false;
				$mdToast.show($mdToast.simple().textContent('Cant reach server'));
			});
	};

	/** Registration Of new User */

	$scope.newUser = {};
    $scope.postList = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'Faculty'];
    $scope.departmentList = ['Applied Electronics' , 'Civil', 'Computer' , 'Electrical', 'Electronics' , 'Industrial' , 'Mechanical' ];
    $rootScope.new_user_response = true;

	$scope.registerUI = function() {
		$registration.showUI($scope);
	}

	$scope.addUser = function() {
		console.log(header,$scope.newUser);
		$registration.addUser($scope, $scope.newUser);
	}

	/* ************************** */


});


/*sidebar routing controller*/
application.controller('sidebarcontroller', function($rootScope,$scope,$location,$state,$timeout,$mdSidenav,$mdMedia,$element, $myElementInkRipple, $notificationService, $mdToast, $http, $window, $mdDialog){
	var header = "[sidebasrcontroller]";
	$scope.toggleSideNav = buildToggler('left');
	$scope.enableMenuButton = $mdMedia('gt-xs');
	$scope.openMenu= menuWorker;
	$scope.$watch(function(){return $mdMedia('gt-xs');}, function(value){$scope.enableMenuButton=value;});
	$scope.logout = logout;
	$scope.broadcastStyle =  true;
	$scope.channelsStyle = false;
	$scope.requestSendBroadcastStyle =  false;
	$scope.requestStyle =  false;
	$scope.composeMessageStyle =  false;
	$scope.inboxStyle =  false;
	$scope.sentItemStyle =  false;
	
	$scope.postList = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'Faculty'];
    $scope.departmentList = ['Applied Electronics' , 'Civil', 'Computer' , 'Electrical', 'Electronics' , 'Industrial' , 'Mechanical' ];

	$rootScope.viewMode = true;
	
	
	messaging.onMessage(function(payload){
		console.log(payload);
		$mdToast.show($mdToast.simple().textContent(payload.notification.title+" - "+payload.notification.body));
	});

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
		clearAllStyle($scope, function(){
			switch(view){
				case 'broadcast':
					highlight =  "{'background-color':'lightgrey';}";
					$scope.broadcastStyle =  true;
					break;

				case 'channels':
					$scope.channelsStyle =  "{'background-color':'lightgrey'}";
					break;

				case 'requestSendBroadcast':
					$scope.requestSendBroadcastStyle = true;
					break;

				case 'requests':
					$scope.requestStyle = true;
					break;

				case 'composeMessage':
					$scope.composeMessageStyle = true;
					break;

				case 'sentItems':
					$scope.sentItemStyle = true;
					break;

				case 'inbox':
					$scope.inboxStyle = true;
					break;
			}
		});
		$state.go(view);
	}
    
    $scope.onClick = function (ev) {
        $myElementInkRipple.attach($scope, angular.element(ev.target), { center: true });
    }

	function logout(){
		/*clear rootscope user*/ 
		$rootScope.currentUser = null;
		/*logout*/
		$rootScope.loggedIn = false;
		/*clear sessionStorage*/
		sessionStorage.clear();
		/*clear localstorage */
		localStorage.clear();
		/*redirect to login page after detaching user*/
		$http.post(address+'detachUser', {deviceToken : $notificationService.getToken()})
		.then(function(res){
			$window.location.href = address;
		})
		.catch(function(err){
			 $mdToast.show($mdToast.simple().textContent('Something went wrong'));
		});
		/*diconnect socket*/
		//$socket.getSocket().disconnect();

	}

	$scope.showProfile = function(){

			$mdDialog.show({
                templateUrl: 'html/profile/profile.html',
                clickOutsideToClose:true,
                scope:$scope,
                preserveScope:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
            .then(function(answer) {
            },function() {
               console.log("cancelled dialog");
            });

	}

	$scope.edit = function(){
		$rootScope.viewMode = false;
	}

	$scope.cancel = function(){
		$rootScope.viewMode = true;
	}

	$scope.save = function(user){
		if(!$rootScope.editUser.name)
			$rootScope.editUser.name = $rootScope.currentUser.name;
		console.log(header,$rootScope.editUser);
	}

	console.log(header);
});

/* Dashboard controllers */
application.controller('broadcastViewController', function($scope, $rootScope, $firebaseArray, $anchorScroll, $location,$window,$validateLogin, $socket, $messaging){
	
	$validateLogin();
	$messaging.loadMessageMetadata(true, function(message){});
	$rootScope.hidesidebar=false;
	$scope.channels=$rootScope.currentUser.subChannels;
	$scope.broadcastWait = true;
	var userSubbedChannels = $rootScope.currentUser.subChannels;
	var today = new Date();
	var todayString = today.getDate().toString()+'-'+today.getMonth().toString()+'-'+today.getFullYear().toString();
	var today_reference = firebase.database().ref('today/'+todayString);
	var firebaseToday = $firebaseArray(today_reference);
	var firebaseCollection;
	var toDisplay=[];
	$scope.currentFilter="All";

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
	});

	firebaseToday.$loaded(function(array){
		console.log(header,'loaded');
		$scope.broadcastWait = false;
	});	

	/*filter selected in the broadcast page*/
	$scope.filterSelected = function(channel){
		$scope.broadcastWait = true;
		$scope.currentFilter = channel;
		if($scope.currentFilter == 'All'){
			$scope.broadcastCollection = toDisplay;
			$scope.broadcastWait = false;
			$anchorScroll();
			
		}else{
			/*load recent ones for all the selected channel*/
			firebaseCollection = $firebaseArray(firebase.database().ref('channel/'+channel+'/broadcasts').limitToLast(50));
			firebaseCollection.$loaded().then(function(){
				$scope.broadcastCollection = firebaseCollection;
				$scope.broadcastWait = false;
				$anchorScroll();
				
			});
			return;
		}
	}
    
    $scope.$watch(function(){return $rootScope.hidesidebar}, function(newValue){$rootScope.hidesidebar=newValue;});

	$scope.showMore = function(broadcast){
		broadcast.expand = !broadcast.expand;
	}
	
});

function searchSubList(channel, subList){
    return subList.findIndex(function(item){return item==channel;}) != -1;
}

function clearAllStyle($scope, callBack){
	$scope.broadcastStyle =  false;
	$scope.channelsStyle = false;
	$scope.requestSendBroadcastStyle =  false;
	$scope.requestStyle =  false;
	$scope.composeMessageStyle =  false;
	$scope.inboxStyle =  false;
	$scope.sentItemStyle =  false;
	callBack();
}

