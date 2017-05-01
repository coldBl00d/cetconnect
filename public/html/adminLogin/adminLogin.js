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

application.factory('$socketConnect', [ '$rootScope', '$mdToast' , function(rootScope, mdToast){

    var header = '[Socket Connect Service]'

    var socket;
    var socketConnectService = {};

    socketConnectService.getSocket = function (){
        return socket;
    }

    socketConnectService.connect = function () {
        socket = io.connect();

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

        socket.on('message', function(data) {
           mdToast.show(mdToast.simple().textContent(data.message));
        });

    }

    return socketConnectService;


}]);

application.factory('$socket', ['$rootScope', '$http', '$mdToast','$socketConnect', function(rootScope, http, mdToast, socketConnect){

    var header = '[Socket Service]'

    var socketService = {};
    
    var socket

    var onlineList = [];
    var channelList = [];
    var onlineCount = 0;
    var registeredCount =0;
    var openRegistration = false;
    var socketService ={};

    
    //connection established, send the token to server for verificationi as admin socket. 
    //This token is verified as the current token and if matched this socket is saved as admin Socket.

    function setUpBaseListeners () { 
        socket = socketConnect.getSocket();
        console.log(header,'Setting up listeners');    
    }

    function dataListeners(scope) {

         socket.on('registeredCount', function(data) {
            scope.registeredCount = data.registeredCount;
            registeredCount = data.registeredCount;
            scope.$apply();
            console.log(header,'Got registed count '+ scope.registeredCount);
        });

        socket.on('openRegistration', function(data) {
            console.log(header,'Recieved open registration event');
            scope.openRegistration = data.openRegistration;
        });

        socket.on('onlineList', function(data) {
            scope.onlineList = data.onlineList;
            scope.onlineCount = scope.onlineList.length;
        });

        socket.on('channelList', function(data) {
            channelList = data.channelList;
            scope.channelList = channelList;
            rootScope.rootscope_channelListWait = false; 
        });


        //buggy, this might not set up in time. 

        socket.on('adminAccepted', function(data) {
            mdToast.show(mdToast.simple().textContent(data.message));
            socketService.getData();
        });

        socket.on('userLoggedIn', function(data) {
            console.log(header,'user logged in '+data.user);
           if(scope.onlineList.indexOf(data.user) == -1){
                scope.onlineList.push(data.user);
                scope.onlineCount = scope.onlineList.length;
                scope.$apply();
           }
        });

        socket.on('userLoggedOut', function(data) {
            console.log(header,'user logged out '+ data.user);
            
           var index = scope.onlineList.indexOf(data.user);
           console.log(header,'Index to delete: '+ index);
           if(index != -1){
                scope.onlineList.splice(index,1);
                scope.onlineCount = scope.onlineList.length;
                scope.$apply();
            }
        });

        socket.on('statistics', function(data){
            var header = '[statistics]';
            scope.stat_wait = false;
            console.log(header,data);
             function round(value, decimals) {
                return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
            }

            console.log(header,data.statistics);
            scope.statistics = data.statistics;
            scope.usersize = Math.round(scope.statistics.user/1024);
            scope.messagesize = Math.round(scope.statistics.message/1024);
            scope.devicesize = Math.round(scope.statistics.device/1024);
            scope.channelsize = Math.round(scope.statistics.channel/1024);

            var total = scope.usersize+scope.messagesize+scope.devicesize+scope.channelsize;
            scope.user_percent = Math.round ((scope.usersize/total)*100);
            console.log(header,scope.user_percent);
            scope.message_percent = Math.round((scope.messagesize/total)*100);
            scope.device_percent = Math.round((scope.devicesize/total)*100);
            scope.channel_percent = Math.round((scope.channelsize/total)*100);
        });
        
    }

   

    function getData () {
        console.log(header,'getdata called');
        
        socket.emit('getOnlineList', {adminToken:rootScope.adminToken});
        socket.emit('getChannelList', {adminToken:rootScope.adminToken});
        socket.emit('getRegisteredCount', {});
        socket.emit('getOpenRegistration', {adminToken:rootScope.adminToken});
        socket.emit('getStatistics', {adminToken:rootScope.adminToken});
    }

    function getChannelList () {
        socket.emit('getChannelList', {adminToken:rootScope.adminToken});
        rootScope.rootscope_channelListWait = true;
    }

    socketService.getChannelList = getChannelList;
    socketService.getData = getData;
    socketService.onlineList = onlineList;
    socketService.channelList = channelList;
    socketService.registeredCount = registeredCount;
    socketService.openRegistration = openRegistration;
    socketService.dataListeners = dataListeners;

    socketService.setUpBaseListeners = setUpBaseListeners;
    socketService.getSocket = function() {return socket}

    return socketService;

}]);

application.controller('adminLogin', ['$rootScope', '$scope', '$http','$mdToast', '$state', '$socketConnect', '$socket', function(rootScope, scope, http, mdToast, state, socketConnect, socket){
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
                socketConnect.connect();
                socket.setUpBaseListeners();
                state.go('adminDash');
                rootScope.adminId = payload.userId;
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


