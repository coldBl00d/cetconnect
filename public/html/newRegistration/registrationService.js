application.factory('$registration', ['$rootScope', '$http', '$mdDialog','$mdToast', function(rootScope, http, $mdDialog, mdToast) {
var header = '[registration service]';

    var registrationService = {} ;

    registrationService.showUI = function($scope){
        
        $mdDialog.show({
            templateUrl: 'html/newRegistration/register.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            scope:$scope,
            preserveScope:true,
            
        })
        .then(function(answer) {

        },function() {
            console.log("cancelled dialog");
            $scope.newUser = {};
        });

        
    }

    registrationService.addUser=function(scope, payload){
        payload.adminToken = rootScope.adminToken;
        rootScope.new_user_response = false;
        //scope.$digest();    
        console.log(header,payload);
        
        http.post(address+'admin/addUser', {payload:payload})
        .then(function(res){
            //scope.new_user_response = true
            rootScope.new_user_response = true;
            //$mdDialog.hide();
            scope.new_user_status = res.data.message;
            if(res.status == 200){
                payload.name = "";
                payload.userid = "";
                payload.password = "";
                payload.department ="";
                payload.post ="";
                payload.batch ="";
                $mdDialog.hide();
                mdToast.show(mdToast.simple().textContent('User Added'));
            }else if(res.status == 201) {
                //registrationService.showUI(scope);
                mdToast.show(mdToast.simple().textContent('Duplicate userid'));
            }else if (res.status ==202){
                mdToast.show(mdToast.simple().textContent('You are not authorized, Login again'));
            }else if(res.status == 204){
                //registrationService.showUI(scope);
                mdToast.show(mdToast.simple().textContent('Malformed form'));
            }else{
                registrationService.showUI(scope);
                mdToast.show(mdToast.simple().textContent('server error'));
            }
        })
        .catch(function(err){
            //scope.new_user_response = true
            console.log(err);
            registrationService.showUI(scope);
            mdToast.show(mdToast.simple().textContent('Connection problem'));
        });
        

    }

    return registrationService;

}]);