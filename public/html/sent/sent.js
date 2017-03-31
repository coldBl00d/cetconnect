application.controller('sentItemsController', function($scope,$validateLogin, $messaging){
    $validateLogin();
    $messaging.getLoadedSent($scope);
    $scope.showMessage = function(message){
        console.log(message);
        $messaging.showMessage(message, false, $scope);
    }
});