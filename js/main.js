

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
    "/donate": { templateUrl: "partials/donate.html", controller: "DonateCtrl" ,requireLogin: false},
    "/about": { templateUrl: "partials/aboutUs.html" ,requireLogin: false},
    "/contact": { templateUrl: "partials/contact.html",requireLogin: false},
	"/login": { templateUrl: "partials/login.html", controller: "Login" ,requireLogin: false},
	"/adminLogin": { templateUrl: "partials/admin/adminLogin.html", controller: "Login" ,requireLogin: false},
	"/adminProfile": { templateUrl: "partials/admin/adminProfile.html", controller: "adminProfile" ,requireLogin: false},
	"/addProduct": { templateUrl: "partials/admin/addProduct.html", controller: "adminProfile" ,requireLogin: false},
	"/updateProduct": { templateUrl: "partials/admin/updateProduct.html", controller: "adminProfile" ,requireLogin: false},
	"/viewOrders": { templateUrl: "partials/admin/viewOrders.html", controller: "viewOrderCntrlr" ,requireLogin: false},
	"/statistics": { templateUrl: "partials/admin/statistics.html", controller: "adminProfile" ,requireLogin: false},
	"/forgotPassword": { templateUrl: "partials/forgotPassword.html", controller: "Login" ,requireLogin: false},
	"/upcomingDonations": { templateUrl: "partials/user/upcomingDonations.html", controller: "userDonationDetail" ,requireLogin: true},
	"/pastDonations": { templateUrl: "partials/user/pastDonations.html", controller: "userDonationDetail" ,requireLogin: true},
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
	"/checkout": {templateUrl: "partials/shop/checkout.html", controller: "checkout" ,requireLogin: true}
	
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
app.controller('DonateCtrl', function ($scope, $firebaseObject,$firebaseArray,$firebaseStorage, $location, $http, $q, $timeout, WizardHandler) {
    getRHA_CityList()
    getDonationCategory()
    getRHA_capterList()
    // getDonationKey();

  $scope.donationFormDetails={}

  //Wizard 
  $scope.canExit = true;
  $scope.stepActive = true;
  $scope.finished = function() {
      alert("Thanks For Donating. Our volunteers will get in touch with you ");
      sendDonationDetails($scope.donationFormDetails);
  };
  $scope.logStep = function(donation) {
      let stepDetails= angular.copy(donation)
      $scope.donationFormDetails = {...$scope.donationFormDetails,...stepDetails}
      console.log($scope.donationFormDetails)
  };
  $scope.goBack = function() {
      WizardHandler.wizard().goTo(0);
  };
//   $scope.exitWithAPromise = function() {
//       var d = $q.defer();
//       $timeout(function() {
//           d.resolve(true);
//       }, 1000);
//       return d.promise;
//   };
//   $scope.exitToggle = function() {
//       $scope.canExit = !$scope.canExit;
//   };
//   $scope.stepToggle = function() {
//       $scope.stepActive = !$scope.stepActive;
//   }
//   $scope.exitValidation = function() {
//       return $scope.canExit;
//   };

$scope.onFileSelect = function($files) {
    //$files: an array of files selected, each file has name, size, and type.
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
        console.log(RHA_cityList)
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
        donationDetails["Locality"] = donationDetails["Locality"]["name"];
        donationDetails["RHA_city_id"] = donationDetails["RHA_city"]["$id"];
        delete donationDetails["RHA_city"]
        donationDetails["donation_category_id"] = donationDetails["donation_category"]["$id"];
        delete donationDetails["donation_category"];
    // Creation Time and Station 
        donationDetails["pickup_time"]= donationDetails["pickup_time"].toString();
        let now = new Date();
        let created_at = now.getTime();
        donationDetails["created_at"]=created_at;
        donationDetails["status"]="Pending";
       
        return donationDetails
    }

});

app.controller('HomeCtrl', function ($scope, $location, $http ) {
    $scope.confirm = false;
    
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



/*Controller Porfolio and filter Images*/

app.controller("dataImagesWork", function ($scope) {
$scope.images_work = [
          { num: 1, code: 'APL', category: 'mac', name: 'Nature Pro', src: "1.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 2, code: 'AVC', category: 'ipad', name: 'Boat NC', src: "2.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 3, code: 'BAN', category: 'phone', name: 'Creative', src: "3.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 4, code: 'CTP', category: 'mac', name: 'Room Pro', src: "4.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 5, code: 'FIG', category: 'ipad', name: 'Office Airs', src: "5.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 6, code: 'FIG', category: 'sound', name: 'Dancing', src: "6.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. '}];

});

app.controller("dataImagesWork2", function ($scope) {
    $scope.images_work = [
          { num: 1,  category: 'mac', name: 'Nature Pro', src: "8.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 2,  category: 'ipad', name: 'Boat NC', src: "10.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 3,  category: 'phone', name: 'Creative', src: "11.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 4,  category: 'mac', name: 'Room Pro', src: "5.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 5,  category: 'ipad', name: 'Office Airs', src: "4.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 6,  category: 'sound', name: 'Dancing', src: "6.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 7,  category: 'sound', name: 'Dancing', src: "12.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ' },
          { num: 8,  category: 'sound', name: 'Dancing', src: "9.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. '}];

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