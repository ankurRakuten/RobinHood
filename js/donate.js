app.controller('DonateCtrl',["$scope", "$firebaseAuth", "$firebaseObject" , "$localStorage" , "$timeout", "$window" , "$route" , "SessionService" , function ($scope, $firebaseObject,$firebaseArray,$location, $http, $q, $timeout, WizardHandler) {
    $scope.donationFormDetails={}
    $scope.cityList=[{label:'Banglore',id:1},{label:'Mumbai',id:2},{label:'Kolkata',id:3}]
  
    $scope.uploadImage=function(image){
        console.log(image);
    }
    //Wizard 
    $scope.canExit = true;
    $scope.stepActive = true;
    $scope.finished = function() {
        alert("Thanks For Donating. Our volunteers will get in touch with you ");
    };
    $scope.logStep = function(donation) {
        console.log("Step continued");
        let stepDetails= angular.copy(donation)
        $scope.donationFormDetails = {...$scope.donationFormDetails,...stepDetails}
        console.log($scope.donationFormDetails)
    };
    $scope.goBack = function() {
        WizardHandler.wizard().goTo(0);
    };
    $scope.exitWithAPromise = function() {
        var d = $q.defer();
        $timeout(function() {
            d.resolve(true);
        }, 1000);
        return d.promise;
    };
  //   $scope.exitToggle = function() {
  //       $scope.canExit = !$scope.canExit;
  //   };
  //   $scope.stepToggle = function() {
  //       $scope.stepActive = !$scope.stepActive;
  //   }
    $scope.exitValidation = function() {
        return $scope.canExit;
    };
  
    //Database
    var ref = firebase.database().ref("RHA_city");
  
      //  var obj = $firebaseObject(ref);
  
      //  // to take an action after the data loads, use the $loaded() promise
      //  obj.$loaded().then(function() {
      //     console.log("loaded record:", obj.$id, obj.someOtherKeyInData);
  
      //    // To iterate the key/value pairs of the object, use angular.forEach()
      //    angular.forEach(obj, function(value, key) {
      //       console.log(key, value);
      //    });
      //  });
  
      //  // To make the data available in the DOM, assign it to $scope
      //  $scope.data = obj;
  
      //  // For three-way data bindings, bind it to the scope instead
      //  obj.$bindTo($scope, "data");
      var list = $firebaseArray(ref);
      console.log(list)
      // add an item
      // list.$add({ foo: "bar" }).then(function(output){console.log(output)});
      // console.log(list)
      // make the list available in the DOM
      $scope.list = list;
  }]);