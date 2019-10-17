app.controller("Login", ["$scope", "$firebaseAuth", "$firebaseObject" , "$firebaseArray", "$localStorage" , "$timeout", "$window" , "$route" , "SessionService" ,
  function($scope, $firebaseAuth ,$firebaseObject,$firebaseArray ,$localStorage, $timeout ,$window,$route,SessionService) {
	if($localStorage.userDetail!=null){
		$scope.userDetail=$localStorage.userDetail;
	}
	if($localStorage.adminDetail!=null){
		$scope.adminDetail=$localStorage.adminDetail;
	}
	var authObj = $firebaseAuth();
	setTimeout(function() {
		window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
		'size': 'invisible',
		'callback': function(response) {
		  // reCAPTCHA solved, allow signInWithPhoneNumber.
		}
	  });
	},2000);
	


	$scope.showNumber = true;
	$scope.login=function(){
		$scope.errorMessage=null;
		var phoneNumber = '+91'+$scope.phoneNumber;
		var appVerifier = window.recaptchaVerifier;
		firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
			.then(function (confirmationResult) {
				window.confirmationResult = confirmationResult;
				setTimeout(function () {
					$scope.$apply(function(){
						$scope.showNumber = false;
					});
				}, 1000);
			}).catch(function (error) {
				$scope.errorMessage = error['message'];
			});
	}
	
	$scope.loginOTPConfirm = function(){
		$scope.errorMessage=null;
		var code = $scope.otp;
		confirmationResult.confirm(code).then(function (result) {
			var user = result.user;
			console.log($scope.phoneNumber,">>>>",typeof $scope.phoneNumber,'success oxxxo login ====>',result.user.uid);
			firebase.database().ref().child("profiles").orderByChild('mobile').equalTo($scope.phoneNumber).limitToFirst(1).once("value", snapshot => {
			// firebase.database().ref().child("profiles").orderByChild('mobile').equalTo('7845473173').limitToFirst(1).once("value", snapshot => {
				if (snapshot.exists()){
					console.log("innn");
					$scope.userDetail = $firebaseObject(firebase.database().ref().child("profiles").child(user.uid));
					console.log($scope.userDetail,"<===== user detail =====>",user.uid);
					$timeout(function () {
						if($scope.userDetail['role'] == 2){ //Volunteer login
							console.log("333333333333",$scope.userDetail);
							console.log("44444444444",$scope.userDetail['role']);
							$localStorage.userDetail=$scope.userDetail;
							SessionService.setUserAuthenticated(true);
							$window.location.href = '#/volunteerUpcomingDonations';
						}else{
							console.log("333333333333",$scope.userDetail);
							console.log("5555555555",$scope.userDetail['role']);
							$localStorage.userDetail=$scope.userDetail;
							SessionService.setUserAuthenticated(true);
							$window.location.href = '#/upcomingDonations';
						}
						// window.location.reload(true);
					},2000);
					
				}else{
					console.log("not found");
					$scope.errorMessage = "Mobile number not found. Please Register and try again";
				}
			});
		}).catch(function (error) {
			console.log('error login ====>',error);
			$scope.errorMessage = error['message'];
		});
	}
	$scope.adminLogin = function(){
		$scope.errorMessage=null;
		authObj.$signInWithEmailAndPassword($scope.username,$scope.password).then(function(firebaseUser) {
			$scope.adminDetail = $firebaseObject(firebase.database().ref().child("profiles").child(firebaseUser.uid));
			$scope.adminDetail.$loaded().then(function() {
				if($scope.adminDetail['admin'] == true){
					console.log("adminDetail",$scope.adminDetail);
					$localStorage.adminDetail=$scope.adminDetail;
					$window.location.href = '#/adminProfile';
					window.location.reload(true);			
				}else{
					$window.location.href = '#/login';
				}
				SessionService.setUserAuthenticated(true);
			});
		}).catch(function(error) {
			$scope.errorMessage = error['message'];
			console.error("Authentication failed:", error);
		});
	}
	
	$scope.reset = function(){
		firebase.auth().sendPasswordResetEmail($scope.resetEmail)
			.then(function() {
				$scope.message="Please Check your Email and update Password "
			})
			.catch(function(error) {
				$scope.errorMessage = error['message'];
			});
	}
	
	$scope.logout = function(){
		firebase.auth().signOut().then(function() {
		  console.log("signed out");
		}).catch(function(error) {
		  // An error happened.
		  console.log("signed out error",error);
		});
		$localStorage.userDetail=null;
		$localStorage.adminDetail=null;
		$scope.userDetail=null;
		$scope.adminDetail=null;
		$window.location.href = '#/';
		SessionService.setUserAuthenticated(false);
	}

	$scope.updateProfile = function(){
		$scope.message=null;
		var ref = firebase.database().ref().child("profiles").child($scope.userDetail['$id']);
		var obj = $firebaseObject(ref);
		  ref.update({
			first_name: $scope.userDetail.first_name,
			mobile: $scope.userDetail.mobile,
			last_name: $scope.userDetail.last_name,
			address: $scope.userDetail.address,
			email: $scope.userDetail.email,
			locality: $scope.userDetail.locality,
		});
		$scope.message='Successfully Updated'
		$timeout(function () {
			$scope.message=null;
		},5000);
		
	}
  
  }
]);

app.controller("createDrivePlan", ["$scope", "$firebaseArray", "$firebaseObject", "dateFilter", function ($scope, $firebaseArray, $firebaseObject) {

	$scope.drive_plan = {};
	$scope.driveChapter = [];

	$scope.toggle = true;
	$scope.toggleChapter = function () {
		$scope.toggle = $scope.toggle === false ? true : false;
	}
	$scope.selectedChapter = [];
	$scope.selectedCluster = [];

	let RHA_capter = firebase.database().ref().child("RHA_chapters");
	let RHA_cluster = firebase.database().ref().child("RHA_clusters");
	var donation_details = firebase.database().ref().child("donation_details");
	$scope.donation_details = $firebaseArray(donation_details);

	console.log($scope.donation_details);
	$scope.chapters = $firebaseArray(RHA_capter);
	$scope.clusters = $firebaseArray(RHA_cluster);

	$scope.filteredData = (data) => {
		return $scope.clusters[data.chapter_id];
	};

	$scope.selectChapter = (chapter) => {
		var idx = $scope.selectedChapter.indexOf(parseInt(chapter));

		// is currently selected
		if (idx > -1) {
			$scope.selectedChapter.splice(idx, 1);
		}

		// is newly selected
		else {
			$scope.selectedChapter.push(parseInt(chapter));
			console.log($scope.selectedChapter);
		}
	};

	
	$scope.selectCluster = (cluster) => {
		var idx = $scope.selectedCluster.indexOf(cluster);

		// is currently selected
		if (idx > -1) {
			$scope.selectedCluster.splice(idx, 1);
		}

		// is newly selected
		else {
			$scope.selectedCluster.push(cluster);
		}
		console.log($scope.selectedCluster)
	};

	let user = JSON.parse(localStorage.getItem('ngStorage-userDetail'));
	console.log(user);
	$scope.addDrivePlan = () => {
		driveDetails = {
			'driveTitle': $scope.drive_plan.driveTitle,
			'schedule': new Date($scope.drive_plan.schedule) / 1000,
			'PIC': $scope.drive_plan.pic,
			// 'PIC_ID': user.$id,
			'contactNumber': $scope.drive_plan.mobile,
			'chapter': $scope.selectedChapter,
			"cluster" : $scope.selectedCluster,
			// 'attendees':user.first_name,
			'comments': 'demo comment',
		};
		var ref = firebase.database().ref('drive_details');
		$firebaseArray(ref).$add(driveDetails)
			.then(
				(ref) => {
					$scope.drive_plan.driveTitle = '';
					$scope.drive_plan.schedule = '';
					$scope.drive_plan.pic = '';
					$scope.drive_plan.mobile = '';
					$scope.drive_plan.chapter = '';
				}, (err) => {
					console.log(err);
				});
		console.log(driveDetails);
	}
}]);

app.filter('selectedTags', function() {
	// filter to check array of elements
    return function(data, tags) {
        return data.filter(function(d) {
            if (tags.indexOf(d.chapter_id) != -1) {
                return true;
            } else if(tags.length == 0) {
            	return true;
            }
            return false;

        });
    };
});

app.controller("userDonationDetail", ["$scope", "$firebaseAuth", "$firebaseObject" , "$firebaseArray", "$localStorage" , "$timeout", "$window" , "$rootScope", "$route" , "SessionService" ,
  function($scope,$firebaseAuth ,$firebaseObject, $firebaseArray ,$localStorage, $timeout ,$window,$rootScope,$route,SessionService) {
		// $scope.DonationList = [];
		$scope.userDetail = $localStorage.userDetail;
		console.log("inside donation controller>>>>",$scope.userDetail);

		var don_cat = firebase.database().ref().child("Donation_category");
		$scope.donationCategory = $firebaseObject(don_cat);
		$scope.donationCategory.$loaded().then(function() {

			var rha_city = firebase.database().ref().child("RHA_city");
			$scope.RHACity = $firebaseObject(rha_city);
			$scope.RHACity.$loaded().then(function() {

				var dbRef = firebase.database().ref().child("donation_details");
				// console.log(dbRef);
				dbRef.orderByChild('userMobile').equalTo($scope.userDetail['mobile']).on("value", function(snapshot) {
					if(!$scope.$$phase) {
						$scope.$apply(function(){
							$scope.DonationList = Object.values(snapshot.val());
						});
					}
					$scope.DonationList = Object.values(snapshot.val());
					console.log($scope.DonationList)
				});
			});
		});

		$scope.reDonationData = function(donation){
			$rootScope.reDonationDetails = donation;
			console.log($rootScope.reDonationDetails);
			$scope.redirectFunc('donate')
		}
		$scope.redirectFunc = function(page){
			console.log($window.location.href)
			$window.location.href = "#/"+page;
			console.log($window.location.href)
		}
	}
]);
app.controller("volunteerDonationDetail", ["$scope", "$firebaseAuth", "$firebaseObject" , "$firebaseArray", "$localStorage" , "$timeout", "$window" , "$route" , "SessionService" ,
  function($scope, $firebaseAuth ,$firebaseObject, $firebaseArray ,$localStorage, $timeout ,$window,$route,SessionService) {
		// $scope.DonationList = [];
		$scope.showUpcomingTab = true;
		$scope.showPastTab = false;
		$scope.userDetail = $localStorage.userDetail;
		$scope.statusFilter = 'all';
		$scope.statusDriveFilter = 'all';
		console.log("inside volunteer donation controller>>>>",$scope.userDetail);

		var don_cat = firebase.database().ref().child("Donation_category");
		$scope.donationCategory = $firebaseObject(don_cat);
		$scope.donationCategory.$loaded().then(function() {

			var rha_city = firebase.database().ref().child("RHA_city");
			$scope.RHACity = $firebaseObject(rha_city);
			$scope.RHACity.$loaded().then(function() {
				// All donations
				var dbRef = firebase.database().ref().child("donation_details");
				dbRef.orderByChild('status').on("value", function(snapshot) {
					if(!$scope.$$phase) {
						$scope.$apply(function(){
							$scope.DonationList = Object.values(snapshot.val());
							console.log("###########>>>",$scope.DonationList);
						});
					}
					$scope.DonationList = Object.values(snapshot.val());
				});
				// my donations
				dbRef.orderByChild('userMobile').equalTo(9008858220).on("value", function(snapshot) {
					if(!$scope.$$phase) {
						$scope.$apply(function(){
							$scope.myDonationList = Object.values(snapshot.val());
							console.log("###########>>>",$scope.myDonationList);
						});
					}
					$scope.myDonationList = Object.values(snapshot.val());
				});

				//All Drive
				var drivebRef = firebase.database().ref().child("drive_details");
				drivebRef.orderByChild('status').on("value", function(snapshot) {
					if(!$scope.$$phase) {
						$scope.$apply(function(){
							$scope.DriveList = Object.values(snapshot.val());
							console.log("###########>>>",$scope.DriveList);
						});
					}
					$scope.DriveList = Object.values(snapshot.val());
				});
				// my donations
				drivebRef.orderByChild('PIC').equalTo('nikitha.nimbalkar').on("value", function(snapshot) {
					if(!$scope.$$phase) {
						$scope.$apply(function(){
							$scope.myDriveList = Object.values(snapshot.val());
							console.log("###########>>>",$scope.myDriveList);
						});
					}
					$scope.myDriveList =  Object.values(snapshot.val());
				});
				// my attended Drive
				drivebRef.orderByChild('attendees/masdada/attended').on("value", function(snapshot) {
					if(!$scope.$$phase) {
						$scope.$apply(function(){
							$scope.volDriveList = Object.values(snapshot.val());
							console.log("########### attendees >>>",$scope.volDriveList);
						});
					}
					$scope.volDriveList =  Object.values(snapshot.val());
				});
			});
		});

		$scope.showDonationTab = function(tab){
			if(tab == 'Upcoming'){
				$scope.showUpcomingTab = true;
				$scope.showPastTab = false;
			}else{
				$scope.showUpcomingTab = false;
				$scope.showPastTab = true;
			}
		}
		$scope.selectFilter = function(selectedFilter){
			$scope.statusFilter = selectedFilter;
		}
		$scope.selectDriveFilter = function(selectedDriveFilter){
			$scope.statusDriveFilter = selectedDriveFilter;
		}
		$scope.redirectFunc = function(page){
			$window.location.href = "#/"+page;
		}

		$scope.showImages = function(donationID){
			console.log("innn showImages");
			let storage =firebase.storage();
			let storageRef = storage.ref();
			var listRef = storageRef.child(donationID);
			listRef.listAll().then(function(res) {
				console.log("images",res);
			});
			// listRef.once('value').then(function(snapshot){
			// 	var value = snapshot.val();
			// 	console.log("images value",value);
			//   })

		}
	}
]);
app.controller("orderDetail", ["$scope", "$firebaseAuth", "$firebaseObject" , "$localStorage" , "$timeout", "$window" , "$route" , "SessionService" ,"$firebaseArray",
  function($scope, $firebaseAuth ,$firebaseObject ,$localStorage, $timeout ,$window,$route,SessionService,$firebaseArray) {
	if($localStorage.userDetail!=null){
		$scope.userDetail=$localStorage.userDetail;
	}
	$scope.showDetail = false;
	$scope.orderedProducts = $firebaseArray(firebase.database().ref().child("orders").child($scope.userDetail['$id']));
	
	$scope.showDetailFunc = function(product){
		$scope.productDetailInfo=product;
		$scope.showDetail = true;
		if(Date.now()-$scope.productDetailInfo['orderTime'] > 3600000*100){
			$scope.updateOrderCond = false;
		}else{
			$scope.updateOrderCond = true;
		}
	}
	
	$scope.closeDetailWin=function(){
		$scope.showDetail = false;
	}
	
	$scope.cancelOrderFunc = function(product){
		var ref = firebase.database().ref().child("orders").child($scope.userDetail['$id']).child(product['orderTime']);
		var obj = $firebaseObject(ref);
		ref.child('cancel').set(true);
		$scope.showDetail = false;  
		$scope.modalObj = {'head':'Order Cancelled Successfully','body':'Order Cancelled Successfully'};
		
		/* send mail  */
		var service_id = "default_service";
		var template_id = "ordermail123";		
		var template_params = {
			sender_name:  product.firstName+" "+ product.lastName,
			sender_email:  product.email,
			sender_mobile: product.mobile,
			sender_address: product.address,
			sender_pincode:  product.pincode,
			sender_city:  product.city,
			sender_state:  product.state,
			sender_landmark:  product.landmark,
			sender_altmobile:  product.altMobile,
			sender_order:  "Product Name - "+product.name + " | Quantity - "+product.quantity+"  | Price - "+product.price
		};
		emailjs.send(service_id,template_id,template_params)
		.then(function(){ 
			console.log("emaiil js successs");
		}, function(err) {
			console.log("error");
		});
	}
  }
]);	  


app.controller("viewOrderCntrlr", ["$scope", "$firebaseAuth", "$firebaseObject" , "$localStorage" , "$timeout", "$window" , "$route" , "$filter","SessionService" , "NgTableParams","$firebaseArray",
  function($scope, $firebaseAuth ,$firebaseObject ,$localStorage, $timeout ,$window,$route,$filter,SessionService,NgTableParams,$firebaseArray) {
	$scope.showPendingOrder = true;
	$scope.showDetail = false;
	$scope.fetchOrderedProductFunc = function(){
		var dbRef = firebase.database().ref().child("orders");
		$scope.orderDetail = $firebaseArray(dbRef);
		$scope.orderDetail.$loaded().then(function() {
			$scope.pendingOrder = [];
			$scope.DeliveredOrder = [];
			for(i=0;i<$scope.orderDetail.length;i++){
				if(Object.keys($scope.orderDetail[i]).length > 0){
					angular.forEach($scope.orderDetail[i], function(value, key){
					if(value != null && typeof value == 'object'){
					  if(value['cancel'] != false && value['delivered']!= true){
							$scope.pendingOrder.push(value);
						}else if(value['cancel'] != false && value['delivered']== true){
							$scope.DeliveredOrder.push(value);
						}
					}
					});
				}
			}
			$scope.tableData = $scope.pendingOrder;
		});
	}
	$scope.fetchOrderedProductFunc();

	$scope.changeOrderView = function(){
		$scope.showPendingOrder=!$scope.showPendingOrder;
		if($scope.showPendingOrder == true){
			$scope.tableParams = new NgTableParams({}, { dataset: $scope.pendingOrder});
			$scope.tableData = $scope.pendingOrder;
		}else{
			$scope.tableParams = new NgTableParams({}, { dataset: $scope.DeliveredOrder});
			$scope.tableData = $scope.DeliveredOrder;
		}
	}

	$scope.showDetailFunc = function(product){
		$scope.productDetailInfo=product;
		$scope.showDetail = !$scope.showDetail;
		$window.scrollTo(0, 0);
	}

	$scope.updateStatus = function(product){
		var ref = firebase.database().ref().child("orders").child(product['userId']).child(product['orderTime']);
		var obj = $firebaseObject(ref);
		ref.child('delivered').set(true);
		$scope.showDetail = false;  
		$scope.modalObj = {'head':'Order Updated To delivered Successfully','body':'Order Updated To delivered Successfully'};
		$scope.fetchOrderedProductFunc();
		/* send mail  
		var service_id = "default_service";
		var template_id = "ordermail123";		
		var template_params = {
			sender_name:  product.firstName+" "+ product.lastName,
			sender_email:  product.email,
			sender_mobile: product.mobile,
			sender_address: product.address,
			sender_pincode:  product.pincode,
			sender_city:  product.city,
			sender_state:  product.state,
			sender_landmark:  product.landmark,
			sender_altmobile:  product.altMobile,
			sender_order:  "Product Name - "+product.name + " | Quantity - "+product.quantity+"  | Price - "+product.price
		};
		emailjs.send(service_id,template_id,template_params)
		.then(function(){ 
			console.log("emaiil js successs");
		}, function(err) {
			console.log("error");
		});
		*/
	}
  }  
]);

app.controller("adminProfile", ["$scope", "$firebaseAuth", "$firebaseObject" , "$localStorage" , "$timeout", "$window" , "$route" , "$filter","SessionService" , "NgTableParams","$firebaseArray",
  function($scope, $firebaseAuth ,$firebaseObject ,$localStorage, $timeout ,$window,$route,$filter,SessionService,NgTableParams,$firebaseArray) {
	  if($localStorage.adminDetail!=null){
		$scope.adminDetail=$localStorage.adminDetail;
	}
	
	$scope.updateAdminProfile = function(){
		$scope.message=null;
		var ref = firebase.database().ref().child("profiles").child($scope.adminDetail['$id']);
		var obj = $firebaseObject(ref);
		  ref.set({
			first_name: $scope.adminDetail.first_name,
			mobile: $scope.adminDetail.mobile,
			last_name: $scope.adminDetail.last_name,
			address: $scope.adminDetail.address,
			email: $scope.adminDetail.email
		});
		$scope.message='Successfully Updated'
		$timeout(function () {
			$scope.message=null;
		},5000);		
	}
 
	$scope.productType = ['Milk','Cheese','Paneer','Ghee','Ice Cream','Kefir'];
	$scope.redirectAdmin = function(page){
		$window.location.href = '#/'+page;
	}

	$scope.addProduct = function(){
		var pattern = new RegExp(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g); // fragment locater
		var keyPointList={'point1':' ','point2':' ','point3':' ','point4':' ','point5':' '}
		if (!('producttype' in $scope.newProduct)){
			$scope.errorMessage = "Please select Product Type";
		}
		// else if (!pattern.test($scope.newProduct.productimage) == false){
			// $scope.errorMessage = "Invalid Image Url";
		// }
		else{
			var productRef = firebase.database().ref().child("products")
			productRef.child($scope.newProduct['productcode']).set({
				category: $scope.newProduct.producttype,
				class: $scope.newProduct.productFocus,
				code: $scope.newProduct.productcode,
				description: $scope.newProduct.productdescription,
				discount: $scope.newProduct.productdiscount,
				quantity: $scope.newProduct.productquantity,
				name:$scope.newProduct.productname,
				price:$scope.newProduct.productprice,
				src_retro:$scope.newProduct.productimage,
				features:JSON.stringify(keyPointList),
				insertDate: (new Date).getTime()
			});
			$scope.message = "Registration Successful";
			$scope.newProduct={}
		}
	}
	
	// fetch existing Product data
	var dbRef = firebase.database().ref().child("products");
    $scope.fetchedProduct = $firebaseArray(dbRef);
	$scope.fetchedProduct.$loaded().then(function() {
		$scope.tableParams = new NgTableParams({}, { dataset: $scope.fetchedProduct});
	});
	
	$scope.showEditWindow = false;
	$scope.updateProductWindow = function(editproduct){
		if($scope.showEditWindow == false){
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
			$scope.editProduct = editproduct;
			$scope.editProduct.features = JSON.parse($scope.editProduct.features);
		}
		$scope.showEditWindow = !$scope.showEditWindow;
	}
	
	$scope.editProductFunc = function(){
		$scope.message=null;
		var ref = firebase.database().ref().child("products").child($scope.editProduct.code);
		var obj = $firebaseObject(ref);
		  ref.set({
			category: $scope.editProduct.category,
			class: $scope.editProduct.class,
			code: $scope.editProduct.code,
			description: $scope.editProduct.description,
			discount: $scope.editProduct.discount,
			quantity: $scope.editProduct.quantity,
			name:$scope.editProduct.name,
			price:$scope.editProduct.price,
			active:$scope.editProduct.active,
			src_retro:$scope.editProduct.src_retro,
			features:JSON.stringify($scope.editProduct.features),
			updatedDate: (new Date).getTime()
		});
		$scope.message='Successfully Updated'
		$timeout(function () {
			$scope.message=null;
		},5000);
		
	}
	// $scope.Statistics = function(){
		
	// }
	
  
  }  
]);

app.controller("Register", ["$scope", "$firebaseAuth", "$firebaseArray" , "$firebaseObject",  "$localStorage" ,"$window" , "$route" , "SessionService" ,
  function($scope, $firebaseAuth, $firebaseArray ,$firebaseObject ,$localStorage ,$window,$route,SessionService) {
    var auth = $firebaseAuth();
	$scope.showLoginInfo=false;
	$scope.showForm = true;
	$scope.register=function(){
		$scope.errorMessage=null;
		$scope.message=null;

		setTimeout(function() {
			window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
			'size': 'invisible',
			'callback': function(response) {
			  // reCAPTCHA solved, allow signInWithPhoneNumber.
			}
		  });
		},2000);

		var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

		firebase.database().ref().child("profiles").orderByChild('mobile').equalTo($scope.user.mobile).limitToFirst(1).once("value", snapshot => {
			if (snapshot.exists()){
			   console.log("user exists!");
			   $scope.errorMessage = "Mobile Number already used";
			   var element = angular.element($('#errorMessageId'));
				element.scope().$apply();
			}else if(reg.test($scope.user.email) == false) 
			{
				$scope.errorMessage = "Incorrect Email Address";
			}else{

			var phoneNumber = '+91'+$scope.user.mobile;
			console.log('phoneNumber>>',phoneNumber)
			var appVerifier = window.recaptchaVerifier;
			console.log("appVerifier>>>>>>>",appVerifier);
			firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
				.then(function (confirmationResult) {
					console.log("$scope.showForm111",$scope.showForm);
					window.confirmationResult = confirmationResult;
					console.log("sent success");
					// $scope.showForm = false;
					setTimeout(function () {
						$scope.$apply(function(){
							$scope.showForm = false;
						});
					}, 1000);
					
					console.log("$scope.showshowForm222",$scope.showForm);
				}).catch(function (error) {
					console.log("error in sending",error);
					$scope.errorMessage = error['message'];
				});
			}
		 });

	}
	$scope.otpConfirm = function(){
		$scope.errorMessage=null;
		console.log("%%%%%%%%%%%%%%%OTP>>",$scope.otp);
		var code = $scope.otp;
		confirmationResult.confirm(code).then(function (result) {
			console.log(" User signed in successfully.");
			var user = result.user;
			console.log("userrrr detail >>",user.uid);
			console.log("form detail>>",$scope.user);
			// $scope.userDetail = $firebaseObject(firebase.database().ref().child("profiles").child(user.uid));
			var profileRef=firebase.database().ref().child("profiles")
			profileRef.child(user.uid).set({
				first_name: $scope.user.firstName,
				last_name: $scope.user.lastName,
				mobile: $scope.user.mobile,
				email: $scope.user.email,
				signupDate: (new Date).getTime(),
				address:'Bangalore'
			});

			$scope.userDetail = $firebaseObject(firebase.database().ref().child("profiles").child(user.uid));
			console.log("$scope.userDetail>>>",$scope.userDetail);
			$scope.user='';
			if ($scope.userDetail.hasOwnProperty('email')) {
				$scope.errorMessage = "Try again after sometime";
			}else{
				$localStorage.userDetail=$scope.userDetail;
				$window.location.href = '#/';
				SessionService.setUserAuthenticated(true);
				window.location.reload(true);
			}

		}).catch(function (error) {
		// User couldn't sign in (bad verification code?)
		// ...
			console.error("Authentication failed:", error);
			$scope.errorMessage = error['message'];
		});
	}
  }
]);
