var app = angular.module('bform',[]);

app.controller('bformController',function($scope,$http) {
    $scope.bForm = {};
    $scope.bForm.adminApproved=false;
    $scope.send = function() {
        $scope.bForm.timestamp=new Date();
        $http.post("http://localhost:3000/broadcast",{payload:$scope.bForm});
    }
    
});