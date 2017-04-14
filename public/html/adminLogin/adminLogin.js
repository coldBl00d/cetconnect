//initialize admin app
var application=angular.module("adminApp",['ngMessages','ngRoute','firebase','ui.router','ngAria','ngMaterial', 'material.components.expansionPanels']);
var address = 'http://localhost:3000/';
//var address = 'https://blooming-reaches-58473.herokuapp.com/';

application.config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
	 var header = '[Application config]';
     
     console.log(header,'Config initialized');
     
     
	 $urlRouterProvider.otherwise("adminLogin");
	 
	 $stateProvider
	 .state('adminConsoleLogin', {
		 url:'/adminLogin', 
		 templateUrl:'html/adminLogin/adminLogin.html',
		 controller:'adminLogin'
	 }).state('adminDash',{
		 url:'/dash',
		 templateUrl:'html/adminDash/dash.html',
		 controller:'dashController'
	 });
	 
}]);



application.factory('$socket', ['$rootScope', '$http', '$mdToast', function(rootScope, http, mdToast){

    var header = '[Socket Service]'


    var socket; 
    var socketService = {};

    socketService.connect = function() {
        socket = io.connect();
    }

    socketService.getSocket = function (){
        return socket;
    }

    //connection established, send the token to server for verificationi as admin socket. 
    //This token is verified as the current token and if matched this socket is saved as admin Socket.
    socket.on('identifyYourself', function(data){
        console.log(header,'Server asked to identify myself');
        console.log(header,'Sending token ' + rootScope.adminToken);
        socket.emit('adminIdentify', rootScope.adminToken);
    });

    //if token is rejected 
    socket.on('tokenRejected', function(data) {
        console.log(header,'token rejected');
        mdToast.show(mdToast.simple().textContent("Your token expired, login again"));
    });

    //server accepted token 
    

    return socketService;

}]);

application.factory('$consoleData', ['$socket', '$mdToast', function(socket, mdToast){

    var header = '[consoleData Service]';

    var onlineList = [];
    var channelList = [];
    var onlineCount = 0;
    var registeredCount =0;
    var openRegistration = false;
    var consoleData ={};

    var socket = socket.getSocket();

    

    function getData () {
        console.log(header,'getdata called');
        
        socket.emit('getOnlineList', {});
        socket.emit('getChannelList', {});
        socket.emit('getRegisteredCount', {});
        socket.emit('getOpenRegistration', {});
    }

    socket.on('registeredCount', function(data) {
       registeredCount = data.registeredCount;
       console.log(header,'Got registed count '+ registeredCount);
    });

    socket.on('OpenRegistration', function(data) {
       openRegistration = data.openRegistration;
    });

    socket.on('onlineList', function(data) {
       onlineList = JSON.parse(data.onlineList);
       onlineCount = onlineList.length;
    });

    socket.on('channelList', function(data) {
       channelList = JSON.parse(data.channelList);
    });

    socket.on('adminAccepted', function(data) {
       mdToast.show(mdToast.simple().textContent(data.message));
       consoleData.getData();
    });

    consoleData.getData = getData;
    consoleData.onlineList = onlineList;
    consoleData.channelList = channelList;
    consoleData.registeredCount = registeredCount;
    consoleData.openRegistration = openRegistration;

    return consoleData;

}]);

application.controller('adminLogin', ['$rootScope', '$scope', '$http','$mdToast', '$state', function(rootScope, scope, http, mdToast, state, socket){
    var header = '[adminLoginController]'
    console.log(header,'Starting controller');
    
    var payload = {
        userId: "", 
        password: ""
    };

    scope.payload = payload;
    
    scope.login = function () {
        http.post(address+'admin', payload)
        .then(function(res){
            if(res.status == 200){
                rootScope.adminToken = res.data.adminToken;
                state.go('adminDash');
            }else if(res.status == 201) {
                mdToast.show(mdToast.simple().textContent("Check credential"));
            }
        })
        .catch(function(err) {
            console.log("Something is wrong");
            console.log(err);
            mdToast.show(mdToast.simple().textContent("Something went wrong"));
        });
    }    
}]);


