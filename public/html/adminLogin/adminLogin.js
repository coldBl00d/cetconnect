application.controller('adminLogin', ['$rootScope', '$scope', '$http','$mdToast', function(rootScope, scope, http, mdToast){
    rootScope.hidesidebar = true;
    var payload = {
        userId: "", 
        password: ""
    };

    scope.login = function () {
        http.post(address+'admin', payload)
        .then(function(res){
            if(res.status == 200){
                $rootScope.adminToken = res.adminToken; 
                //add view here 
                $state.go();
            }else{
                mdToast.show(mdToast.simple().textContent("Check credential"));
            }
        })
        .catch(function(err) {
            mdToast.show(mdToast.simple().textContent("Connection Error"));
        });
    }    

}]);


