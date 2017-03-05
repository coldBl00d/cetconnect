//var channels_for_view = [{name:'All',subbed:false},{name:'CSE',subbed:true},{name:'IEEE',subbed:false},{name:'Robocet',subbed:true}];
var channels_for_view = [];
var header = '[channelsController]';
var channelListURI = 'channelList/'

application.controller('channelsController', function ($scope, $rootScope, $firebaseArray){
	console.log(header, "+++");
	$scope.channels_for_view = channels_for_view;

	var channelListRef = firebase.database().ref(channelListURI);
	var firebase_channels = $firebaseArray(channelListRef);

	firebase_channels.$loaded().then(function(){
		firebase_channels.forEach(function(firebaseChannel){
			var channelName = firebaseChannel.channelName;
			var status = false;
			var userChannels = $rootScope.currentUser.subChannels;
			console.log(userChannels);

			for(var i=0; i < userChannels.length; i++){
				if (userChannels[i] == channelName.toLowerCase()){
					status = true;
					break;
				}
			}

			channels_for_view.push({name:channelName, subbed:status});
		});
	});

});
