application.controller('inboxController', function($scope, $rootScope, $validateLogin, $messaging, $mdDialog, $http, $mdToast){
    $validateLogin();
    $messaging.getLoadedInbox($scope);
    $scope.showMessage = function(message){$messaging.showMessage(message,true, $scope);}
    $scope.delete = function(id){$messaging.deleteMessage(id, true);}
    $scope.replyMessage = function(message){ $messaging.replyMessage(message, $scope); }
    $scope.cancel = function(){$mdDialog.hide();}
    $scope.replyToMessage = function (){
        console.log($scope.reply);
        $http.post(address+'messages/send', {message:$scope.reply})
             .then(function(res){
                 if(res.status == 200){
                     $mdToast.show($mdToast.simple().textContent('Message Sent'));
                     $mdDialog.hide();
                 }else{
                     console.log("message not sent");
                     $mdToast.show($mdToast.simple().textContent('Message not sent.'));
                 }
             })
             .catch(function(err){
                 $mdToast.show($mdToast.simple().textContent('Message not sent.'));
        });
    }

    $scope.newReply = function (message){
        $messaging.replyMessage(message, $scope);
    }

});

application.factory('$messaging', function($http, $rootScope,$mdToast, $mdDialog){
    var messaging = {};
    messagesSent = [];
    messagesInbox = [];

    function deleteMessage(id, inbox){
        var local;
        var dest;
        if(inbox){
            local = messagesInbox;
            dest ='messages/deleteInbox/';
        }else{
            local = messagesSent;
            dest ='messages/deleteSent/';
        }

        $http.get(address+dest+id)
        .then(function(res){
            if(res.status == 200){
                var index = local.findIndex(function(item){
                    if(item.id  == id) return true;
                    else return false;
                });
                if(index != -1){
                    local.splice(index, 1);
                }
            }else{
                $mdToast.show($mdToast.simple().textContent('Server Error - Message not deleted'));
            }
        })
        .catch(function(err){
            $mdToast.show($mdToast.simple().textContent('Cant reach server'));
        });
    }

    function loadMessageMetadata(inbox,callBack){

        if(inbox) path= 'messages/getMetadata/';
        else path = 'messages/getMetadataSent/';

        $http.get(address+ path + $rootScope.currentUser.userToken).then(function(res){
            if(res.status == 200){
                var messages;
                var count=0;
                if(inbox){
                    messagesInbox = JSON.parse(res.data);
                    messages = messagesInbox;
                    messages.forEach(function(message){
                        if(!message.read) count++;
                    });
                    $rootScope.messageCount = count;
                }
                else{ 
                    messagesSent = JSON.parse(res.data);
                    messages = messagesSent;
                }

                callBack(messages);
            }
            
        }).catch(function(err){ 
            $mdToast.show($mdToast.simple().textContent('Error loding message.'));
        });
    }

    function getLoadedInbox($scope){
        var count =0;
        if(messagesInbox!=0){ 
            $scope.messages= messagesInbox;
        }else{
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

        if(!message.read&&inbox){
            message.read = true;
            $rootScope.messageCount--;
        }
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

    function replyMessage (message, $scope){
        $scope.reply = {};
        $mdDialog.show({
            templateUrl: 'html/replyDialog/replyDialog.html',
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

        console.log(message);
        $scope.reply.timestamp = new Date();
        $scope.reply.senderName = $rootScope.currentUser.name;
        $scope.reply.recipientId = message.senderId;
        $scope.reply.senderId = $rootScope.currentUser.userId;
        $scope.reply.senderName = $rootScope.currentUser.name;
        $scope.reply.recipientName = message.senderName;


        console.log($scope.reply);

    }

    messaging.loadMessageMetadata = loadMessageMetadata;
    messaging.getLoadedInbox = getLoadedInbox;
    messaging.getLoadedSent = getLoadedSent;
    messaging.deleteMessage = deleteMessage;
    messaging.replyMessage = replyMessage;
    return messaging;
});

