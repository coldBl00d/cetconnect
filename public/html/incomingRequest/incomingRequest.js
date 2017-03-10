application.controller('requestController', function($scope,$rootScope,$firebaseArray){

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

    firebaseCollection = $firebaseArray(requestRef);
    
    firebaseCollection.$loaded().then(function(){
        $scope.loaded = true;
        $scope.request = requestCollection[0];
    });

    firebaseCollection.$watch(function(whatHappened){
        if(whatHappened.event == "child_added"){
            var newChild = firebaseCollection.find(function(item){return item.$id == whatHappened.key});
            if(newChild){
                if(searchSubList(newChild.channel, subList)){
                    requestCollection.push(newChild);
                }
            }
        }else if(whatHappened.event == 'child_removed'){
            console.log('child_removed from requestCollection');
            var key = whatHappened.key;
            var indexToRemove = requestCollection.findIndex(function(item){
                console.log(item.message+"::"+item.$id+"::"+key);
                return item.$id == key});
            console.log(indexToRemove);
            if(indexToRemove!=-1){
                requestCollection.splice(indexToRemove, 1);
                if(index>=indexToRemove) decIndex(index, requestCollection);
                $scope.request = requestCollection[index];
            }
        }
    });



});

function accept($scope, $rootScope, $http){
    $scope.request.approvedBy = $rootScope.currentUser.userId;
    $http.post("http://localhost:3000/broadcast/request/accept",{payload:$scope.request})
         .then(function(respose){
             if(response.status == 200){
                 console.log('[IncommingRequestController]',"The request was accepted and posted to broadcast");
             }
         })
}

function reject(){

}

function incIndex(index, collection){
     if(++$scope.index >= collection.length){
        $scope.index =0;
    }
}

function decIndex(index, colleciton){
    if(--$scope.index <0){
        $scope.index = firebaseCollection.length-1;
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
