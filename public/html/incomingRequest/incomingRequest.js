application.controller('requestController', function($scope,$rootScope,$firebaseArray,$http,$validateLogin, $mdToast){

    $validateLogin();

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
    $scope.accept = function(request){accept(request,$scope,$rootScope,$http, $mdToast);}
    $scope.reject = function(request){reject(request,$rootScope,$http,$mdToast);}
    $scope.noContent = true;
    $scope.contentWait = true;

    firebaseCollection = $firebaseArray(requestRef);
    
    firebaseCollection.$loaded().then(function(){
        if(firebaseCollection.length>0){ $scope.loaded = true; $scope.noContent = false;}
        $scope.request = requestCollection[0];
        $scope.contentWait = false;
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

function accept(request,$scope, $rootScope, $http,mdToast){
    var header = '[AcceptRequest]';
    request.wait = true;
    request.approvedBy = $rootScope.currentUser.userId;
    var payload = makePayload(request); 
    $http.post(address+"broadcast/request/accept",{payload:payload})
         .then(function(response){
             request.wait=false;
             if(response.status == 200){
                 console.log('[IncommingRequestController]',"The request was accepted and posted to broadcast");
                 mdToast.show(mdToast.simple().textContent('Request accepted and posted'));
             }
         })
         .catch(function(err) {
             request.wait=false;
            console.log(header,err);
            mdToast.show(mdToast.simple().textContent('Something went wrong'));
        });
}

function reject(request,$rootScope, http, mdToast){
    request.wait = true;
    request.approvedBy = $rootScope.currentUser.userId;
    var payload = makePayload(request);
    http.post(address+"broadcast/request/reject",{payload:payload})
    .then(function(res){
        request.wait = false;
        mdToast.show(mdToast.simple().textContent(res.data.message));
    })
    .catch(function(err){
        request.wait = false;
        console.log(header,err);
        mdToast.show(mdToast.simple().textContent('Something went wrong'));
    });

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