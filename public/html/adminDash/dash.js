application.factory('$validateAdmin', ['$rootScope', '$state','$http', function(rootscope, state, http){

    var validateAdmin = {};
    
    validateAdmin.validate = function() {
        if(rootscope.adminToken){
            http.post(address+'admin/validate', adminToken)
            .then(function(res){
                if(res.status == 200){
                    return true;
                    state.go('adminDash');
                }else {
                    return false;
                    state.go('adminConsoleLogin');
                }
            })
            .catch(function(err){
                return false;
                state.go('adminConsoleLogin');
            });
        }else{
            state.go('adminConsoleLogin');
        }
    }

    validateAdmin.stay = function(){
        if(validateAdmin.validate()){
            state.go('adminDash');
        }else{
            state.go('adminConsoleLogin');
        }
    }


    return validateAdmin;

}]);

application.controller('dashController', ['$rootScope', '$scope', '$http','$validateAdmin', function(rootscope, scope, http, validateAdmin){

    validateAdmin.stay();

}]);