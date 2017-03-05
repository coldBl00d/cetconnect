//var channels_for_view = [{name:'All',subbed:false},{name:'CSE',subbed:true},{name:'IEEE',subbed:false},{name:'Robocet',subbed:true}];
var channels_for_view = [];
var header = '[channelsController]';
var channelListURI = 'channelList/'

application.controller('channelsController', function ($scope, $rootScope, $firebaseArray){
	console.log(header, "+++");
	
	var channelListRef = firebase.database().ref(channelListURI);
	var firebase_channels = $firebaseArray(channelListRef);
	$scope.channels_for_view = firebase_channels;
	firebase_channels.$loaded().then(function(){
	
	});

});
