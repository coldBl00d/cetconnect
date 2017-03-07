
application.controller('bformController',function($scope,$http,$rootScope) {
    $scope.bForm = {};
    $scope.bForm.adminApproved=false;
    $scope.bForm.message='Enter your message here';
    $scope.channelSelected = function(channelName){channelSelected(channelName, $rootScope, $scope);}
    // $scope.send = function() {
    //     $scope.bForm.timestamp=new Date();
    //     $http.post("http://localhost:3000/broadcast",{payload:$scope.bForm});
    // }
    $scope.send = function () {send($rootScope, $scope,$http);}


    
});

function channelSelected(channelName, rootScope, scope){
    var adminOf = rootScope.currentUser.adminOf;
    scope.bForm.channel = channelName;
    for(var i=0; i< adminOf.length; i++){
        if(channelName==adminOf[i]){
            scope.adminStyle= {'background-color':'green'}; 
            return;
        }
    }
    scope.adminStyle= {'background-color':'red'};
}

function send($rootScope, $scope, $http){

    $scope.bForm.senderid = $rootScope.currentUser.userId;
    $scope.bForm.sendername = $rootScope.currentUser.name;
    console.log($scope.bForm.channel);
    if($scope.bForm.message && $scope.bForm.channel){
          $scope.bForm.timestamp=new Date();
          $http.post("http://localhost:3000/broadcast",{payload:$scope.bForm});
    }else{
        console.log('No message here');
        alert("Check your message or channel");
        return;
    }


}

function request(){

}