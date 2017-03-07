
application.controller('bformController',function($scope,$http,$rootScope) {
    $scope.bForm = {};
    $scope.bForm.adminApproved=false;
    $scope.channelSelected = function(channelName){channelSelected(channelName, $rootScope, $scope);}
    // $scope.send = function() {
    //     $scope.bForm.timestamp=new Date();
    //     $http.post("http://localhost:3000/broadcast",{payload:$scope.bForm});
    // }


    
});

function channelSelected(channelName, rootScope, scope){
    var adminOf = rootScope.currentUser.adminOf;
    for(var i=0; i< adminOf.length; i++){
        if(channelName==adminOf[i]){
            scope.adminStyle= {'background-color':'green'}; 
            return;
        }
    }
    scope.adminStyle= {'background-color':'red'};
}

function send(){

}

function request(){
    
}