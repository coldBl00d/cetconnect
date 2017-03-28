application.factory('$messaging', function($http, $rootScope,$mdToast){
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
    return messaging;
});

application.controller('inboxController', function($scope, $rootScope, $validateLogin, $messaging){
    $validateLogin();
    $messaging.loadMessageMetadata(function(messages){
        $scope.messages=messages;
    });


});