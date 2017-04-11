application.factory('$validateAdmin', ['$rootScope, $state','$http', function(rootscope, state, http){

    var validateAdmin = {};
    console.log("Herre");
    if(rootscope.adminToken){

        http.post(address+'admin/validate', adminToken)
        .then(function(res){
            if(res.status == 200){

            }else {
                state.go('adminConsoleLogin');
            }
        })
        .catch(function(err){
            state.go('adminConsoleLogin');
        });
    }else{
        state.go('adminConsoleLogin');
    }

    return validateAdmin;

}]);

application.controller('dashController', ['$rootScope', '$scope', '$http','$validateAdmin', function(rootscope, scope, http, validateAdmin){

}]);