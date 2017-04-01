application.factory('$rememberMe', function($http, $rootScope, $state, $packingService, $notificationService){

    var userId, password, flag;
    var rememberMe ={};

    flag = localStorage.getItem('rememberMe');
    if(flag == null){
        localStorage.setItem('rememberMe', false);
    }else{
        flag = localStorage.getItem('rememberMe');
        if(flag){
            /*notification stuffs*/ 
            /*console.log('calling gettoken from $rememberMe');
            var token = $notificationService.getToken();*/

            //continue to login
            userId = localStorage.getItem('userId');
            password = localStorage.getItem('password');
            
            if(userId&&password){
                var payload = {
                    userId:userId,
                    password:password,
                    deviceToken: null
                };
                console.log(payload);
                $http.post(address, payload)
                .then(function(response){
                    console.log(response.status);
                    if (response.status == 210){  
					   var currentUser = $packingService.packUser(response.data);
					   sessionStorage.setItem('currentUser', currentUser);
					   sessionStorage.setItem('loggedIn', true);
					   $rootScope.loggedIn=true;
					   $rootScope.currentUser = response.data;
                       console.log($rootScope.currentUser);
                       $state.go("broadcast");
                    }else if(response.data.auth == false){
						localStorage.setItem('rememberMe', false);
                        localStorage.setItem('userId', null);
                        localStorage.setItem('password', null);
					}
                })
                .catch(function(err){
                   console.log('Remember Me service couldnt reach service'); 
                });
            }
        }else{
            //do nothing
        }
    }

    function remember(userId, password){
         localStorage.setItem('rememberMe', true);
         localStorage.setItem('userId', userId);
         localStorage.setItem('password', password);
    }


    function forget(){
        localStorage.setItem('rememberMe', false);
        localStorage.setItem('userId', null);
        localStorage.setItem('password', null);
    }

    rememberMe.remember = remember;
    rememberMe.forget = forget;

    return rememberMe;

});