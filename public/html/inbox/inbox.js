application.controller('inboxController', function($scope, $rootScope, $validateLogin, $messaging){
    $validateLogin();
    $messaging.getLoadedInbox($scope);
    $scope.showMessage = function(message){$messaging.showMessage(message,true, $scope);}
    
    socket.on('loadMessage', function(data){
            console.log('Firing');
            loadMessageMetadata(true,function(messages){
            $scope.messages=messages;
         });
    });
});

application.factory('$messaging', function($http, $rootScope,$mdToast, $mdDialog){
    var messaging = {};
    messagesSent = [];
    messagesInbox = [];

    function loadMessageMetadata(inbox,callBack){

        if(inbox) path= 'messages/getMetadata/';
        else path = 'messages/getMetadataSent/';

        $http.get(address+ path + $rootScope.currentUser.userToken).then(function(res){
            if(res.status == 200){
                var messages;
                if(inbox){
                    messagesInbox = JSON.parse(res.data);
                    messages = messagesInbox;
                }
                else{ 
                    messagesSent = JSON.parse(res.data);
                    messages = messagesSent;
                }
                callBack(messages);
            }
            return null;
        }).catch(function(err){ 
            $mdToast.show($mdToast.simple().textContent('Error loding message.'));
        });
    }

    function getLoadedInbox($scope){
        if(messagesInbox!=0)
            $scope.messages= messagesInbox;
        else{
            loadMessageMetadata(true, function(messages_callback){
                console.log('binding messages with inbox');
                $scope.messages= messages_callback;
            });
        }
     }
   

    
    function getMessageFromServer(id, $scope, inbox, callBack){
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
        getMessageFromServer(message.id, $scope,inbox, function(){
            $mdDialog.show({
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

    function getLoadedSent($scope){
        if(messagesSent!=0)
            $scope.messages= messagesSent;
        else{
            loadMessageMetadata(false, function(messages_callback){
                console.log('binding message with sent');
                $scope.messages= messages_callback;
            });
        }
    }

    messaging.loadMessageMetadata = loadMessageMetadata;
    messaging.getLoadedInbox = getLoadedInbox;
    messaging.getLoadedSent = getLoadedSent;
    return messaging;
});

