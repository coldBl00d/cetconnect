application.controller('sentItemsController', function($scope,$validateLogin, $messaging){
    $validateLogin();
    $messaging.getLoadedSent($scope);
    $scope.showMessage = function(message){
        console.log(message);
        $messaging.showMessage(message, false, $scope);
    }
    $scope.delete = function(id){
        console.log('Calling delete on '+ id);
        $messaging.deleteMessage(id, false);
    }
});