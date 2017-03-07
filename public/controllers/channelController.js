//var channels_for_view = [{name:'All',subbed:false},{name:'CSE',subbed:true},{name:'IEEE',subbed:false},{name:'Robocet',subbed:true}];
var channels_for_view = [];
var header = '[channelsController]';
var channelListURI = 'channelList/'

application.controller('channelsController', function ($scope, $rootScope, $firebaseArray,$http){
	console.log(header, "+++");
	
	var channelListRef = firebase.database().ref(channelListURI).orderByChild('channelName');
	var firebase_channels = $firebaseArray(channelListRef);
	var userChannels = $rootScope.currentUser.subChannels;
	$scope.channels_for_view = firebase_channels;
	console.log($rootScope.currentUser);

	$scope.subChanged = function(channelName, status){
		var payload = packagePayload(channelName, status, $rootScope.currentUser.userId);
		$http.post("http://localhost:3000/channel/subunsub",{payload:payload})
			 .then(function(res){
					if(res.status == 200){
						if(status){
							userChannels.push(channelName);
						}else{
							for(var i=0; i< userChannels.length; i++){
								if(userChannels[i]==channelName){
									delete userChannels[i];
								}
							}
						}
					}else{
						console.log(header, "subbing or unsubbing failed in the server side");
						status = !status;
					}
			 });

	}
	
	firebase_channels.$loaded().then(function(){
		console.log(firebase_channels);
		setToggles(userChannels, firebase_channels);
	});

});


function packagePayload(channelName, status, userId){
	return { 
		userId:userId,
		channelName:channelName, 
		status:status
	 }
}

function setToggles(userChannels, firebase_channels){
	for(var i=0; i<userChannels.length; i++){
		firebase_channels.forEach(function(channel){
			console.log(channel.channelName+"===??"+userChannels[i]);
			if(channel.channelName == userChannels[i]){
				console.log("Setting true");
				channel.status = true;
			}
		});
	}
}
