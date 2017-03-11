application.controller('requestController', function($scope,$rootScope,$firebaseArray,$http){

    const requestUri = '/request';
    var requestRef = firebase.database().ref(requestUri);
    var index =0;
    var requestCollection = [];
    var firebaseCollection = [];
    var request;
    var subList = Array.from($rootScope.currentUser.adminOf);

    $scope.index = index;
    $scope.request=request;
    $scope.requestCollection = requestCollection;
    $scope.next = function(){next(requestCollection, $scope);}
    $scope.prev = function(){prev(requestCollection, $scope);}
    $scope.loaded = false;
    $scope.accept = function(){accept($scope,$rootScope,$http);}
    $scope.noContent = true;

    firebaseCollection = $firebaseArray(requestRef);
    
    firebaseCollection.$loaded().then(function(){
        if(firebaseCollection.length>0){ $scope.loaded = true; $scope.noContent = false;}
        $scope.request = requestCollection[0];
    });

    firebaseCollection.$watch(function(whatHappened){
        if(firebaseCollection.length>0){ $scope.loaded = true; $scope.noContent = false;}
        if(whatHappened.event == "child_added"){
            var newChild = firebaseCollection.find(function(item){return item.$id == whatHappened.key});
            if(newChild){
                if(searchSubList(newChild.channel, subList)){
                    requestCollection.push(newChild);
                    $scope.request = requestCollection[$scope.index];
                }
            }
        }else if(whatHappened.event == 'child_removed'){
            if(firebaseCollection.length == 0) {$scope.loaded = false; $scope.noContent=true;}
            console.log('child_removed from requestCollection');
            var key = whatHappened.key;
            var indexToRemove = requestCollection.findIndex(function(item){return item.$id == key});
            if(indexToRemove!=-1){
                requestCollection.splice(indexToRemove, 1);
                if(index>=indexToRemove) decIndex($scope, requestCollection);
                $scope.request = requestCollection[index];
            
            }
        }
    });

});

function accept($scope, $rootScope, $http){
    $scope.request.approvedBy = $rootScope.currentUser.userId;
    var payload = makePayload($scope.request); 
    $http.post(address+"broadcast/request/accept",{payload:payload})
         .then(function(response){
             if(response.status == 200){
                 console.log('[IncommingRequestController]',"The request was accepted and posted to broadcast");
             }
         });
}

function reject(){

}

function incIndex($scope, collection){
     if(++$scope.index >= collection.length){
        $scope.index =0;
    }
}

function decIndex($scope, collection){
    if(--$scope.index <0){
        $scope.index = collection.length-1;
        if($scope.index < 0) $scope.index=0;
    }
}

function next(firebaseCollection, $scope) {
    if(++$scope.index >= firebaseCollection.length){
        $scope.index =0;
    }
    $scope.request = firebaseCollection[$scope.index];
    return;
}

function prev(firebaseCollection, $scope){
    if(--$scope.index <0){
        $scope.index = firebaseCollection.length-1;
    }
    $scope.request = firebaseCollection[$scope.index];
    return;
}

function searchSubList(channel, subList){
    return subList.findIndex(function(item){return item==channel;}) != -1;
}

function makePayload(payload){
    return {
        'userId':payload.userId, 
        'userName':payload.userName,
        'key':payload.$id,
        'channel':payload.channel,
        'post':payload.post,
        'title':payload.title,
        'message':payload.message,
        'approvedBy':payload.approvedBy,
        'timestamp':payload.timestamp
    }
}