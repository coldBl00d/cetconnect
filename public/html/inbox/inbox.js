application.controller('inboxController', function($scope, $rootScope, $validateLogin, $messaging){
    $validateLogin();
    $messaging.loadMessageMetadata(function(messages){
        $scope.messages=messages;
    });
    $scope.showMessage = function(message){$messaging.showMessage(message, $scope);}

});

application.factory('$messaging', function($http, $rootScope,$mdToast, $mdDialog){
    var messaging = {};
    messaging.loadMessageMetadata = function(callBack){
        console.log($rootScope.currentUser.userToken);
        $http.post(address+'messages/getMetadata', {userToken:$rootScope.currentUser.userToken}).then(function(res){
            if(res.status == 200){
                var messagesArray = JSON.parse(res.data);
                callBack(messagesArray);
            }
            return null;
        }).catch(function(err){ 
            $mdToast.show($mdToast.simple().textContent('Error loding message.'));
        });
    }

     function getMessage(id, $scope, callBack){
        $http.get(address+'messages/getMessageInbox/'+id)
        .then(function(res){
            $scope.currentMessage.message = res.data.message;
            callBack();
        })
        .catch(function(err){
            $mdToast.show($mdToast.simple().textContent('Error loding message.'));
        });
    }

    messaging.showMessage = function(message, $scope) {

        $scope.currentMessage = message;
        $scope.cancel = function(){$mdDialog.hide();}
        getMessage(message.id, $scope, function(){
            console.log($scope.currentMessage);
            $mdDialog.show({
                controller: 'inboxController',
                templateUrl: 'html/messageDialog/messageDialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose:true,
                scope:$scope,
                preserveScope:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            })
            .then(function(answer) {
             
            },function() {
               console.log("cancelled dialog");
            });
        });

    }

   

    return messaging;
});

