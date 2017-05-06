
application.controller('bformController',function($scope,$http,$rootScope,$validateLogin, $mdToast) {
    $validateLogin();
    $scope.bForm = {};
    $scope.bForm.adminApproved=false;
    $scope.bForm.message='';
    $scope.bForm.post=$rootScope.currentUser.post;
    $scope.bForm.department=$rootScope.currentUser.department;
    $scope.sendWait = false;
    $scope.channelSelected = function(channelName){channelSelected(channelName, $rootScope, $scope);}
    $scope.send = function () {send($rootScope, $scope,$http, $mdToast);}
    $scope.request = function() {request($rootScope, $scope, $http, $mdToast);}
});

function channelSelected(channelName, rootScope, scope){
    var adminOf = rootScope.currentUser.adminOf;
    scope.bForm.channel = channelName;
    for(var i=0; i< adminOf.length; i++){
        if(channelName==adminOf[i]){
            scope.isAdmin=true;
            return;
        }
    }
    scope.isAdmin = false;
}

function send($rootScope, $scope, $http, mdToast){
    console.log($scope.bForm);
    $scope.bForm.userId = $rootScope.currentUser.userId;
    $scope.bForm.userName = $rootScope.currentUser.name;
    console.log($scope.bForm.channel);
    if($scope.bForm.message && $scope.bForm.channel){
          $scope.bForm.timestamp=new Date();
          $scope.sendWait = true;
          $http.post(address+"broadcast",{payload:$scope.bForm}).then(function(res){
                console.log(header,'status recieved sending broadcast '+ res.status);
                if(res.status==200){
                    console.log(header,'status recieved');
                    mdToast.show(mdToast.simple().textContent('Broadcast sent...'));
                    $scope.sendWait = false;
                    clearFields($scope);
                }else{
                    mdToast.show(mdToast.simple().textContent('Something went wrong'));
                    $scope.sendWait = false;
                    clearFields($scope);
                }
            });
    }else{
        $scope.sendWait = false;
        mdToast.show(mdToast.simple().textContent('Check message form'));
        return;
    }
}

function request($rootScope, $scope, $http, mdToast){
    $scope.bForm.userId = $rootScope.currentUser.userId;
    $scope.bForm.userName = $rootScope.currentUser.name;
    console.log($scope.bForm);
    if($scope.bForm.message && $scope.bForm.channel){
          $scope.bForm.timestamp=new Date();
          $scope.sendWait = true;
          $http.post(address+"broadcast/request",{payload:$scope.bForm}).then(function(res){
              if(res.status == 200){
                  $scope.sendWait = false;
                  clearFields($scope);
                  mdToast.show(mdToast.simple().textContent('Request successfully posted'));
              }else {
                  $scope.sendWait = false;
                  mdToast.show(mdToast.simple().textContent('Something went wrong, try again'));
              }
          });
    }else{
        $scope.sendWait = false;
        console.log('No message here');
        mdToast.show(mdToast.simple().textContent('Check message form'));
        return;
    }
}

function clearFields(scope){
    scope.bForm.message = "";
    scope.bForm.title="";
}