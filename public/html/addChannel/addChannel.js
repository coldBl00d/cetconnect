var app = angular.module('channelApp',[]);

app.controller('channelAdmin',function($scope,$http) {
    $scope.cForm = {};
    $scope.send = function() {
        console.log("Sending channel data ");
        console.log($scope.cForm);
        $http.post("http://localhost:3000/channel",{payload:$scope.cForm});
    }
    
});