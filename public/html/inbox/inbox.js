application.controller('inboxController', function($scope, $rootScope, $validateLogin, $messaging){
    $validateLogin();
    $messaging.loadMessageMetadata(true,function(messages){
        $scope.messages=messages;
    });
    $scope.showMessage = function(message){$messaging.showMessage(message,true, $scope);}

});

application.factory('$messaging', function($http, $rootScope,$mdToast, $mdDialog){
    var messaging = {};
    messaging.loadMessageMetadata = function(inbox,callBack){

        if(inbox) path= 'messages/getMetadata/';
        else path = 'messages/getMetadataSent/';

        $http.get(address+ path + $rootScope.currentUser.userToken).then(function(res){
            if(res.status == 200){
                var messagesArray = JSON.parse(res.data);
                callBack(messagesArray);
            }
            return null;
        }).catch(function(err){ 
            $mdToast.show($mdToast.simple().textContent('Error loding message.'));
        });
    }



     function getMessage(id, $scope, inbox, callBack){
         console.log('get message method');
        if(inbox)
            path = 'messages/getMessageInbox/';
        else 
            path = 'messages/getMessageSent/';
        $http.get(address+path+id)
        .then(function(res){
            $scope.currentMessage.message = res.data.message;
            callBack();
        })
        .catch(function(err){
            $mdToast.show($mdToast.simple().textContent('Error loding message.'));
        });
    }

    messaging.showMessage = function(message, inbox, $scope) {
        console.log('Show message');
        $scope.currentMessage = message;
        $scope.cancel = function(){$mdDialog.hide();}
        getMessage(message.id, $scope,inbox, function(){
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

