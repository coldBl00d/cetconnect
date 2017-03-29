application.controller('sentItemsController', function($scope,$validateLogin, $messaging){
    $validateLogin();
    $messaging.loadMessageMetadata(false,function(messages){
        $scope.messages=messages;
    });
    $scope.showMessage = function(message){
        console.log(message);
        $messaging.showMessage(message, false, $scope);
    }
});