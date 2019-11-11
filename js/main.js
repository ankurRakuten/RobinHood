

/**
 * Main AngularJS Web Application
 */
var app = angular.module('angula', [
  'ngRoute', 'ui.bootstrap', 'ngAnimate', 'ngMaterial' , 'firebase' , 'ngStorage' , 'ngTable' , 'mgo-angular-wizard', 'ngFileUpload',
]);

window.routes =
{
    "/": { templateUrl: "partials/home.html", controller: "HomeCtrl" ,requireLogin: false},
    "/volunteer": { templateUrl: "partials/volunteer.html" ,requireLogin: false},
    "/successful": { templateUrl: "partials/donationSuccessful.html" ,requireLogin: false},
    "/donate": { templateUrl: "partials/donate.html", controller: "DonateCtrl" ,requireLogin: false},
    "/about": { templateUrl: "partials/aboutUs.html" ,requireLogin: false},
    "/contact": { templateUrl: "partials/contact.html",requireLogin: false},
    "/login": { templateUrl: "partials/login.html", controller: "Login" ,requireLogin: false},
    // Drive 
  "/driveDetails":{templateUrl: "partials/volunteer/driveDetails.html", controller: "DriveCtrl" ,requireLogin: true},
  "/commentList":{templateUrl: "partials/volunteer/commentList.html",controller: "DriveCtrl",requireLogin: true},
  "/attendanceList":{templateUrl: "partials/volunteer/attendanceList.html",controller: "DriveCtrl",requireLogin: true},
	"/adminLogin": { templateUrl: "partials/admin/adminLogin.html", controller: "Login" ,requireLogin: false},
	"/adminProfile": { templateUrl: "partials/admin/adminProfile.html", controller: "adminProfile" ,requireLogin: false},
	"/addProduct": { templateUrl: "partials/admin/addProduct.html", controller: "adminProfile" ,requireLogin: false},
	"/updateProduct": { templateUrl: "partials/admin/updateProduct.html", controller: "adminProfile" ,requireLogin: false},
	"/viewOrder": { templateUrl: "partials/admin/viewOrders.html", controller: "viewOrderCntrlr" ,requireLogin: false},
	"/donarRegister": { templateUrl: "partials/donarRegister.html", controller: "donarCtrl" ,requireLogin: false},
  "/volunteerRegister": { templateUrl: "partials/volunteerRegister.html", controller: "donarCtrl" ,requireLogin: false},
	// "/viewOrder": { templateUrl: "partials/admin/viewOrders.html", controller: "viewOrderCntrlr" ,requireLogin: false},
	// "/statistics": { templateUrl: "partials/admin/statistics.html", controller: "adminProfile" ,requireLogin: false},
	"/forgotPassword": { templateUrl: "partials/forgotPassword.html", controller: "Login" ,requireLogin: false},
	"/upcomingDonations": { templateUrl: "partials/user/upcomingDonations.html", controller: "userDonationDetail" ,requireLogin: true},
  "/volunteerUpcomingDonations": { templateUrl: "partials/user/volunteerUpcomingDonations.html", controller: "volunteerDonationDetail" ,requireLogin: true},
  "/createDrivePlan": { templateUrl: "partials/user/createDrivePlan.html", controller: "createDrivePlan" ,requireLogin: false},
	"/pastDonations": { templateUrl: "partials/user/pastDonations.html", controller: "userDonationDetail" ,requireLogin: true},
	"/drivePlanList": { templateUrl: "partials/user/drivePlanList.html", controller: "volunteerDonationDetail" ,requireLogin: true},
	"/userProfile": { templateUrl: "partials/user/userProfile.html", controller: "Login" ,requireLogin: true},
	"/userOrderHistory": { templateUrl: "partials/user/userOrderHistory.html", controller: "orderDetail" ,requireLogin: true},
	"/register": { templateUrl: "partials/register.html", controller: "Register" ,requireLogin: false},
	"/about": { templateUrl: "partials/about.html", controller: "PageCtrl" ,requireLogin: false},
	"/shop": { templateUrl: "partials/shop/store.html", controller: "storeController_sound" ,requireLogin: false},
	"/products/:productCode": { templateUrl: 'partials/shop/product.html', controller: "storeController_sound" ,requireLogin: false},
	"/cart": { templateUrl: 'partials/shop/shoppingCart.html', controller: "storeController_sound" ,requireLogin: false},
	"/contact": {templateUrl: "partials/contact.html", controller: "PageCtrl" ,requireLogin: false},
	"/blog": {templateUrl: "partials/blog.html", controller: "BlogCtrl" ,requireLogin: false},
	"/blog/post": {templateUrl: "partials/blog_item.html", controller: "BlogCtrl" ,requireLogin: false},
	"/404": {templateUrl: "partials/404.html", controller: "PageCtrl" ,requireLogin: false},
	"/services": {templateUrl: "partials/services.html", controller: "PageCtrl" ,requireLogin: false},
	"/pricing": {templateUrl: "partials/pricing.html", controller: "PageCtrl" ,requireLogin: false},
  "/checkout": {templateUrl: "partials/shop/checkout.html", controller: "checkout" ,requireLogin: true},

	
};
 
app.service('SessionService', ['$localStorage','$location','$rootScope',function($localStorage,$location,$rootScope) {
	if($localStorage.userIsAuthenticated == undefined){
		$localStorage.userIsAuthenticated = false;
	}	
	
	console.log("$localStorage.userIsAuthenticated",$localStorage.userIsAuthenticated);
    this.setUserAuthenticated = function(value){
        $localStorage.userIsAuthenticated = value;
    };

    this.getUserAuthenticated = function(){
        return $localStorage.userIsAuthenticated;
    };
}]);
 
 
 
 app.config(['$routeProvider', function($routeProvider){

    //this loads up our routes dynamically from the previous object 
    for(var path in window.routes) {
        $routeProvider.when(path, window.routes[path]);
    }
    $routeProvider.otherwise({redirectTo: '/'});

}]).run(['$rootScope','SessionService','$window',function($rootScope,SessionService,$window){
        $rootScope.$on("$locationChangeStart", function(event, next, current) {
        for(var i in window.routes) {
            if(next.indexOf(i) != -1) {
                if(window.routes[i].requireLogin && !SessionService.getUserAuthenticated()) {
                    // alert("You need to be authenticated to see this page!");
                    event.preventDefault();
					$window.location.href = '#/login';
                }
            }
        }
    });
}]);

 app.directive('fileModel', ['$parse', function ($parse) {
    return {
       restrict: 'A',
       link: function(scope, element, attrs) {
          element.bind('change', function(){
          $parse(attrs.fileModel).assign(scope,element[0].files)
             scope.$apply();
          });
       }
    };
 }]);



/**
 * Controls the Ananomus Donations 
 */
app.controller('DonateCtrl', function ($scope, $window, $rootScope,$firebaseObject,$firebaseArray,$firebaseStorage, $location, $http, $q, $timeout, WizardHandler) {
    getRHA_CityList()
    getDonationCategory()
    getRHA_LocalityList()

    $scope.perishableTime=["2 Hours","4 Hours","6 Hours","8 Hours","10 Hours","12 Hours","24 Hours","48 Hours","72 Hours"]
    $scope.donationFormDetails={}
    
    if ($rootScope.reDonationDetails){
        $scope.donation=$rootScope.reDonationDetails;
        ts = new Date($rootScope.reDonationDetails["pickup_time"]);
        $scope.donation["pickup_time"]= ts.toJSON();
        $scope.donation["path"]="";
    }
  //Wizard 
  $scope.canExit = true;
  $scope.stepActive = true;
  $scope.finished = function() {
    //   alert("Thanks For Donating. Our volunteers will get in touch with you ");
      sendDonationDetails($scope.donationFormDetails);
      var landingUrl = "http://" + $window.location.host + "/#/successful";
      console.log($window.location.host)
      $window.location.href = landingUrl;
  };
  $scope.logStep = function(donation) {
      let stepDetails= angular.copy(donation)
      $scope.donationFormDetails = {...$scope.donationFormDetails,...stepDetails}
      console.log($scope.donationFormDetails)
  };
  $scope.goBack = function() {
      WizardHandler.wizard().goTo(0);
  };

$scope.onFileSelect = function($files) {
    for (var i = 0; i < $files.length; i++) {
      let file = $files[i];
    //   let path = uploadImage(file,"test")
      console.log(file)
    }
    $scope.uploadedImages=$files
    console.log($scope.uploadedImages[0])
}

//Local Functions 
function sendDonationDetails(donationDetails){
 console.log(donationDetails);
 let donationDetailsRef = firebase.database().ref().child("donation_details");
 let donation = labelToCategory(donationDetails);
 donation["path"]="";
 console.log(donation)
 donationDetailsRef.push().set(donation,function(){
     $rootScope.reDonationDetails=null;
    console.log("Donation Submitted")
})
 donationDetailsRef.orderByKey().limitToLast(1).on("child_added",function(snapshot){
    $scope.key=snapshot.key;
    console.log($scope.key)
});
let imagePath=[];
 if($scope.uploadedImages){
    angular.forEach($scope.uploadedImages,function(image){
        let path = uploadImage(image,$scope.key);
        console.log(path)
        imagePath.push(path)
    })
 } 
 console.log(imagePath);
 let submittedDonation = $firebaseObject(donationDetailsRef.child($scope.key))
    console.log(submittedDonation);
    donationDetailsRef.child($scope.key).child("path").set("https://firebasestorage.googleapis.com/v0/b/rakutenrobin.appspot.com/o/"+$scope.key,function(){
        console.log("Path Updated")
    });

  
}

async function uploadImage(file,donationId){
    // Create a Firebase Storage reference
    let storage = firebase.storage();
    let storageRef = storage.ref();
    var filesRef = storageRef.child(donationId);
 let imagePath
    await filesRef.child(file.name).put(file).then(async function(snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(snapshot)
        await snapshot.ref.getDownloadURL().then(function(downloadURL) {
            console.log('File available at', downloadURL);
            imagePath=downloadURL
        });
        if (progress===100){
            console.log('Uploaded a blob or file!');
        }
        
      }).catch(function(error){
          console.log(error)
      })  
      return imagePath
}
function getDonationKey(){
    let donationDetailsRef= firebase.database().ref().child("donation_details");
     donationDetailsRef.orderByKey().limitToLast(1).on("child_added",function(snapshot){
        $scope.key=snapshot.key;
        console.log($scope.key)
    });
}

function getRHA_CityList(){
    let RHA_CityRef = firebase.database().ref("RHA_city")
    let RHA_cityList = $firebaseArray(RHA_CityRef);
    RHA_cityList.$loaded().then(function() {
        RHA_cityList = RHA_cityList.filter(item => item.active === "True");
    
        angular.forEach(RHA_cityList, function(item) {
                delete  item["active"];
                delete item["$priority"];
        });
        $scope.cityList=RHA_cityList
    });
}
function getDonationCategory(){
    let Donation_categoryRef = firebase.database().ref("Donation_category")
    let Donation_category = $firebaseArray(Donation_categoryRef);
    Donation_category.$loaded().then(function() {
        Donation_category = Donation_category.filter(item => item.active === "True");
        angular.forEach(Donation_category, function(item) {
                delete  item["active"];
                delete item["$priority"];
        });
        $scope.donationCategory=Donation_category;
        console.log(Donation_category)
    });
}
function getRHA_LocalityList(){
  let RHA_LocalityRef = firebase.database().ref("RHA_locality")
let RHA_LocalityList = $firebaseArray(RHA_LocalityRef);
RHA_LocalityList.$loaded().then(function() {
  angular.forEach(RHA_LocalityList, function(item) {
    delete item["$priority"];
    delete item["$id"];
  });
  $scope.localityList=RHA_LocalityList;
  // console.log(RHA_LocalityList)
});
}

function getRHA_capterList(){
    let RHA_capterRef = firebase.database().ref("RHA_capter")
    let RHA_capterList = $firebaseArray(RHA_capterRef);
    RHA_capterList.$loaded().then(function() {
        $scope.capterList=RHA_capterList;
        angular.forEach(RHA_capterList, function(item) {
            delete item["$priority"];
    });
    $scope.chapterList=RHA_capterList;
        console.log(RHA_capterList)
    });
}

function labelToCategory(donationDetails){
    // Label to ID
    delete donationDetails["Locality"]["name"];
        // donationDetails["Locality"] = donationDetails["Locality"]["name"];
        // donationDetails["RHA_city_id"] = donationDetails["RHA_city"]["$id"];
        // delete donationDetails["RHA_city"]
        // donationDetails["donation_category_id"] = donationDetails["donation_category"]["$id"];
        // delete donationDetails["donation_category"];

    // Creation Time and Station 
        let now = new Date();
        let created_at = now.getTime();
        donationDetails["created_at"]=created_at;
        donationDetails["pickup_time"]= new Date(donationDetails["pickup_time"]).getTime();
        donationDetails["status"]="Pending";
        donationDetails["PIC"]="";
        return donationDetails
    }

});

app.controller('HomeCtrl', function ($scope, $location, $http ) {
    $scope.confirm = false;
    
  });


  app.controller('DriveCtrl', function ($scope,$window,$location,$firebaseObject,$localStorage,$firebaseArray,$firebaseStorage) {
    var param = $location.search();
    $scope.driveId=param.driveId;
    getDriveDetails()
    getRHA_capterList()
    getRHA_clusterList()
    $scope.driveDetails={}
    let userName = $localStorage.userDetail.first_name +" "+$localStorage.userDetail.last_name;
    // let userName= "nikitha nimbalkar"
    // console.log(userName)
    // console.log($localStorage)

    $scope.updateAttendeeList = function(action){
      let driveDetailsRef = firebase.database().ref().child("drive_details").child($scope.driveId).child("attendees")
      if (action=="Join"){
        $scope.driveDetails["attendees"][userName]={attended:"False"};
        driveDetailsRef.child(userName).set({attended:"False"});

      }else if (action=="Quit"){
        delete $scope.driveDetails["attendees"][userName];
        driveDetailsRef.child(userName).remove()
      }
      checkJoinStatus($scope.driveDetails["attendees"]);

    }
    $scope.joinOrQuit="";
    $scope.commentKeys='';
  

    $scope.postComment = function(comment){
      console.log(comment);
      let commentDetails={}
      commentDetails["commentBy"]=userName;
      commentDetails["commentDetails"]= comment;
      addComment(commentDetails)
    }
    function checkJoinStatus(attendeeList){
      if (userName in attendeeList){
        $scope.joinOrQuit="Quit"
      }
      else{
        $scope.joinOrQuit = "Join"
      }
    }

    function addComment(commentDetails){
      let driveDetailsRef = firebase.database().ref().child("drive_details").child($scope.driveId).child("comment")
      let time = (new Date()).getTime();
      driveDetailsRef.child(time).set(commentDetails)
      $scope.comment ="";
      getDriveDetails();
    }
    
    function getDriveDetails(){
      let driveListRef = firebase.database().ref().child("drive_details");
      let driveDetailsRef = driveListRef.child($scope.driveId);
      console.log($scope.driveId)
      // console.log(driveDetailsRef)
      let driveDetails = $firebaseObject(driveDetailsRef);
      console.log(driveDetails)
      driveDetails.$loaded().then(function() {
          console.log(driveDetails)
          delete driveDetails["$priority"]
          // let time = new Date(driveDetails["schedule"])
          $scope.driveDetails = driveDetails;
          $scope.attendeeList = $firebaseArray(driveDetailsRef.child("attendees"))
          checkJoinStatus(driveDetails["attendees"]);

          if($firebaseArray(driveDetailsRef.child("comment"))){
            $scope.comments = $firebaseArray(driveDetailsRef.child("comment"));
          }else {
            $scope.comments = {}
          }
         
          // if($firebaseArray(driveDetailsRef.child("comment"))){
          //    $scope.attendeeList = $firebaseArray(driveDetailsRef.child("attendees"))
          // }else {
          //   $scope.attendeeList= {}
          // }
          // console.log($scope.attendeeList)
          // $scope.driveDetails.status="Successful"



      });
    }

    function getRHA_capterList(){
      let RHA_capterRef = firebase.database().ref("RHA_chapters")
      let RHA_capterList = $firebaseArray(RHA_capterRef);
      RHA_capterList.$loaded().then(function() {
          angular.forEach(RHA_capterList, function(item) {
              delete item["$priority"];
      });
          let chapterList=[]
          console.log($scope.driveDetails.chapter);
          console.log(RHA_capterList)
          angular.forEach($scope.driveDetails.chapter,function(chapterId){
            RHA_capterList.find(x=>{
              if (parseInt(x["$id"])===chapterId){
                chapterList.push(x["chapter_name"])
              }
            });          
          })
          console.log(chapterList)
          $scope.chapterList=chapterList
      });
  }
  function getRHA_clusterList(){
    let RHA_clusterRef = firebase.database().ref("RHA_clusters")
      let RHA_clusterList = $firebaseArray(RHA_clusterRef);
      RHA_clusterList.$loaded().then(function() {
          angular.forEach(RHA_clusterList, function(item) {
              delete item["$priority"];
      });
          let clusterList=[]
          console.log($scope.driveDetails.cluster);
          console.log(RHA_clusterList)
          angular.forEach($scope.driveDetails.chapter,function(clusterId){
            RHA_clusterList.find(x=>{
              // console.log(x)
              if (parseInt(x["$id"])===clusterId){
                clusterList.push(x["cluster_name"])
              }
            });          
          })
          console.log(clusterList)
          $scope.clusterList=clusterList
      });

  }

  ///Comment List Page 
  $scope.redirect = function(page){
    var landingUrl = "http://" + $window.location.host + "/#/"+page+"?driveId="+$scope.driveId;
      $window.location.href = landingUrl;
  }
  
  // Attendance Page
  $scope.changeAttendance = function(id,currentState){
    $scope.accessToMarkAttendance = $scope.driveDetails["PIC"]===userName?true:false;
    console.log($scope.accessToMarkAttendance)
    if ($scope.accessToMarkAttendance){
      let item = $scope.attendeeList.find(x=>x.$id==id);
      let attendanceRef = firebase.database().ref().child("drive_details").child($scope.driveId).child("attendees")
      attendanceRef.child(item.$id).child("attended").set(!currentState)
      $scope.attendeeList.find(x=>x.$id==id)["attended"]=!currentState;
    }
  }
//  $scope.updateAttendance = function(){
//    console.log($scope.driveId)
//   let attendanceRef = firebase.database().ref().child("drive_details").child($scope.driveId).child("attendees")
//   $scope.attendeeList.forEach(function(item){
//     console.log(item["$id"],{"attended":item["attended"]})
//     attendanceRef.child(item["$id"]).set({"attended":item["attended"]})
//   })
//   $scope.redirect('driveDetails');
  
//  }

  
  });

 

/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function ( /*$scope, $location, $http */) {
    console.log("Page Controller reporting for duty.");

    
    // Activates Tooltips for Social Links
    $('.tooltip-social').tooltip({
        selector: "a[data-toggle=tooltip]"
    });
});


app.controller("donarCtrl", function ($scope, $firebaseAuth, $firebaseArray ,$firebaseObject ,$localStorage ,$window,$route,SessionService,WizardHandler) {
$scope.donar_info = {};
$scope.otp="";
$scope.otpInValid =  false;
console.log("check");
getRHA_CityList();
getRHA_ChapterList();
getRHA_LocalityList();

var authObj = $firebaseAuth();
  setTimeout(function() {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    'size': 'invisible',
    'callback': function(response) {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      console.log(response);
    }
    });
  },2000);

$scope.register=function(){
    $scope.errorMessage=null;
    $scope.message=null;
    var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

    // firebase.database().ref().child("profiles").orderByChild('mobile').equalTo($scope.donar_info.mobile).limitToFirst(1).once("value", snapshot => {
    //   if (snapshot.exists()){
    //      console.log("user exists!");
    //      $scope.errorMessage = "Mobile Number already used";
    //      var element = angular.element($('#errorMessageId'));
    //     element.scope().$apply();
    //   }else if(reg.test($scope.donar_info.email) == false) 
    //   {
    //     $scope.errorMessage = "Incorrect Email Address";
    //   }else{
      var phoneNumber = '+91'+$scope.donar_info.mobile;
      var appVerifier = window.recaptchaVerifier;
      console.log(appVerifier,"here");
      firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
          window.confirmationResult = confirmationResult;
          console.log("sent success");
          // $scope.showForm = false;
          setTimeout(function () {
            $scope.$apply(function(){
              WizardHandler.wizard().next();
            });
          }, 1000);
          
        }).catch(function (error) {
          console.log("error in sending",error);
          $scope.errorMessage = error['message'];
          $scope.$apply();
        });
     //  }
     // });

  }
  $scope.errorMessagee = "error";
$scope.validateOtp=function(otp,role){
  $scope.errorMessage=null;
  var code = otp;
  confirmationResult.confirm(code).then(function (result) {
    var user = result.user;
    // $scope.userDetail = $firebaseObject(firebase.database().ref().child("profiles").child(user.uid));
    var profileRef=firebase.database().ref().child("profiles")
    let userProfileDetails={
      first_name: $scope.donar_info.firstName,
      last_name: $scope.donar_info.lastName,
      mobile: $scope.donar_info.mobile,
      email: $scope.donar_info.email,
      signupDate: (new Date).getTime(),
      role:role
    }
    if($scope.donar_info.chapter) {
      $scope.donar_info.chapter.id=$scope.donar_info.chapter.$id;
      delete $scope.donar_info.chapter.$id;
      userProfileDetails["chapter"] = $scope.donar_info.chapter;
    }
    if ($scope.donar_info.locality){
      userProfileDetails["locality"] = $scope.donar_info.locality; 
    }
    if ($scope.donar_info.landmark){
      userProfileDetails["address"]=$scope.donar_info.locality +"," +$scope.donar_info.landmark +"," +$scope.donar_info.city
    }
    profileRef.child(user.uid).set(userProfileDetails);

    $scope.userDetail = $firebaseObject(profileRef.child(user.uid));
    $scope.user='';
    console.log($scope.userDetail)
    WizardHandler.wizard().next();
  }).catch(function (error) {
    console.error("Authentication failed:", error['message']);
    $scope.errorMessage = error['message'];
    $scope.$apply();
  });
}
function getRHA_CityList(){

  var rha_city = firebase.database().ref().child("RHA_city");
          $scope.RHACity = $firebaseObject(rha_city);
          
  let RHA_CityRef = firebase.database().ref("RHA_city")
  let RHA_cityList = $firebaseArray(RHA_CityRef);
  RHA_cityList.$loaded().then(function() {
      console.log(RHA_cityList)
      RHA_cityList = RHA_cityList.filter(item => item.active === "True");
      angular.forEach(RHA_cityList, function(item) {
              delete  item["active"];
              delete item["$priority"];
      });
      $scope.cityList=RHA_cityList
  });
}
function getRHA_LocalityList(){
  let RHA_LocalityRef = firebase.database().ref("RHA_locality")
let RHA_LocalityList = $firebaseArray(RHA_LocalityRef);
RHA_LocalityList.$loaded().then(function() {
  angular.forEach(RHA_LocalityList, function(item) {
    delete item["$priority"];
  });
  $scope.localityList=RHA_LocalityList;
  });
}
function getRHA_ChapterList(){
  let RHA_capterRef = firebase.database().ref("RHA_chapters")
  let RHA_capterList = $firebaseObject(RHA_capterRef);
  RHA_capterList.$loaded().then(function() {
      $scope.capterList=RHA_capterList;
      angular.forEach(RHA_capterList, function(item) {
          delete item["$priority"];
  });
  $scope.chapterList=RHA_capterList;
      console.log(RHA_capterList)
  });
}


// Locality Search Dropdown 
$scope.complete=function(string){
  // console.log(string)
  var output=[];
  angular.forEach($scope.localityList,function(locality){
    // console.log(locality["location_name"])
    if(locality["location_name"].toLowerCase().indexOf(string.toLowerCase())>=0){
      
      output.push(locality);
    }
  });
  $scope.filterLocality=output;
}

$scope.fillTextbox=function(selectedLocality){
  // console.log(selectedLocality);
  $scope.donar_info.chapter=""
   $scope.donar_info.locality = selectedLocality["location_name"];
  $scope.filterLocality=null;
  console.log(selectedLocality.chapter_id)
  angular.forEach(selectedLocality.chapter_id,function(chapter_id,index){
    console.log(index,chapter_id)
    console.log($scope.chapterList[chapter_id]["chapter_name"])
    $scope.donar_info.chapter+=$scope.chapterList[chapter_id]["chapter_name"]
    if(!(index===(selectedLocality.chapter_id.length -1))){
      $scope.donar_info.chapter+=" , "
    }
  })
}

});

//app.controller('fbController', function ($scope) {

//    $scope.fetchUser = function () {

//        $scope.name = "Test";
//    }
//});

//app.controller('tabController', function () {
//    this.tab = 1;

//    this.selectTab = function (setTab) {
//        this.tab = setTab;
//    };
//    this.isSelected = function (checkTab) {
//        return this.tab === checkTab;
//    };
//});


//tabs management
app.controller('TabsDemoCtrl', function ($scope, $window) {
    $scope.tabs = [
    { title: 'Dynamic Title 1', content: 'Dynamic content 1' },
    { title: 'Dynamic Title 2', content: 'Dynamic content 2', disabled: true }
  ];

    $scope.alertMe = function () {
        setTimeout(function () {
            $window.alert('You\'ve selected the alert tab!');
        });
    };
});

// monitor animation 
app.controller('HomeCtrl', function ($scope) {

    $scope.optionList=[
        {
            name:"Donate For Poor",
            icon:""
        },
        {
            name:"Join RobinHood Army",
            icon:""
        },
        {
            name:"About Us",
            icon:""
        }, {
            name:"Call Us",
            icon:""
        }]
    

});

app.controller('AccordionDemoCtrl', function ($scope) {
    $scope.oneAtATime = true;

    $scope.isopen = {
        first: true,
        second: true,
        three: true,
        four: true,
        five: true,
        six: true,
        seven: true
    }
    $scope.icon = {
        "false": 'fa fa-plus',
        "true": 'fa fa-minus'
    }

    $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
    };
});

/* Skill Controller Page About 3*/

app.controller('SkillLinear', ['$scope', '$interval', function($scope, $interval) {
    $scope.mode = 'query';
    $scope.determinateValue1 =  $scope.determinateValue2 =  $scope.determinateValue3 = $scope.determinateValue4 = $scope.determinateValue5 =  30;
    $scope.determinateValue1a = $scope.determinateValue2a =  $scope.determinateValue3a = $scope.determinateValue4a =  $scope.determinateValue5a = 30;

    $interval(function() {
      $scope.determinateValue1 = $scope.determinateValue2 = $scope.determinateValue3 = $scope.determinateValue4 = $scope.determinateValue5 += 1;
      $scope.determinateValue1a =  $scope.determinateValue2a = $scope.determinateValue3a = $scope.determinateValue4a = $scope.determinateValue5a += 1.5;

      if ($scope.determinateValue1 > 70) {
        $scope.determinateValue1 = $scope.determinateValue1a = 70;
      }
      if ($scope.determinateValue2 > 83) {
        $scope.determinateValue2 = $scope.determinateValue2a = 83;
      }
      if ($scope.determinateValue3 > 56) {
        $scope.determinateValue3 = $scope.determinateValue3a = 56;
      }
      if ($scope.determinateValue4 > 65) {
        $scope.determinateValue4 = $scope.determinateValue4a = 65;
      }
      if ($scope.determinateValue5 > 95) {
        $scope.determinateValue5 = $scope.determinateValue5a = 95;
      }
    }, 100, 0, true);
    $interval(function() {
      $scope.mode = ($scope.mode == 'query' ? 'determinate' : 'query');
    }, 7200, 0, true);
  }]);

//Carousel general management
app.directive('owlcarousel', function () {

    var linker = function (scope, element, attr) {
        link: (scope, element, attr)
        $(element).owlCarousel({
            navigation: false,
            slideSpeed: 300,
            paginationSpeed: 400,
            singleItem: true,
            autoPlay: true
            // "singleItem:true" is a shortcut for:
            // items : 1, 
            // itemsDesktop : false,
            // itemsDesktopSmall : false,
            // itemsTablet: false,
            // itemsMobile : false
        });

    }

    return {
        restrict: "A",
        link: linker
    }

});

//Carousel store management
app.directive('carouselprod', function () {

    var linker = function (scope, element, attr) {
        link: (scope, element, attr)
        $(element).owlCarousel({
            navigation: false,
            slideSpeed: 300,
            paginationSpeed: 400,
            autoPlay: true,
            items : 4
            // itemsDesktop : false,
            // itemsDesktopSmall : false,
            // itemsTablet: false,
            // itemsMobile : false
        });

    }

    return {
        restrict: "A",
        link: linker
    }

});

// create a data service that provides a store and a shopping cart that
// will be shared by all views (instead of creating fresh ones for each view).
app.factory("DataService", function () {

    // create store
    var myStore = new store();
    var storeDetails = new detailsprod();
    // create shopping cart
    var myCart = new shoppingCart("AngularStore");

    // enable PayPal checkout
    // note: the second parameter identifies the merchant; in order to use the 
    // shopping cart with PayPal, you have to create a merchant account with 
    // PayPal. You can do that here:
    // https://www.paypal.com/webapps/mpp/merchant
    myCart.addCheckoutParameters("PayPal", "corsaro22-facilitator@tiscali.it");

    // return data object with store and cart
    return {
        store: myStore,
        cart: myCart,
        detailsprod: storeDetails
    };
});