application.controller('inboxController', function($scope, $rootScope, $validateLogin){
    $validateLogin();
    var messages = [ 
        {
            senderId:"s1304",
            senderName:"Akhil Raj R", 
            subject:"Sports day to be conducted on Tuesday Wednesday", 
            message:"Some really really long message goes here.",
            timestamp: "22-02-2017",
            read: false
        },
          {
            senderId:"s1304",
            senderName:"Akhil Raj R", 
            subject:"Sports day to be conducted on Tuesday Wednesday", 
            message:"Some really really long message goes here.",
            timestamp: "22-02-2017",
            read: false
        },
          {
            senderId:"s1304",
            senderName:"Akhil Raj R", 
            subject:"Sports day to be conducted on Tuesday Wednesday", 
            message:"Some really really long message goes here.",
            timestamp: "22-02-2017",
            read: false
        },
          {
            senderId:"s1304",
            senderName:"Akhil Raj R", 
            subject:"Sports day to be conducted on Tuesday Wednesday", 
            message:"Some really really long message goes here.",
            timestamp: "22-02-2017",
            read: false
        }
    ];

    $scope.messages = messages;
    $scope.click = function(button){
        console.log(button+" is pressed");
    }

});