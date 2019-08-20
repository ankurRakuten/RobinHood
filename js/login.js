app.controller("Login", ["$scope", "$firebaseAuth", "$firebaseObject" , "$localStorage" , "$timeout", "$window" , "$route" , "SessionService" ,
  function($scope, $firebaseAuth ,$firebaseObject ,$localStorage, $timeout ,$window,$route,SessionService) {
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
		console.log('phoneNumber>>',phoneNumber)
		var appVerifier = window.recaptchaVerifier;
		console.log("appVerifier>>>>>>>",appVerifier);
		firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
			.then(function (confirmationResult) {
				console.log("$scope.showNumber111",$scope.showNumber);
				window.confirmationResult = confirmationResult;
				console.log("sent success");
				// $scope.showNumber = false;
				setTimeout(function () {
					$scope.$apply(function(){
						$scope.showNumber = false;
					});
				}, 1000);
				console.log("$scope.showNumber222",$scope.showNumber);
			}).catch(function (error) {
				console.log("error in sending",error);
				$scope.errorMessage = error['message'];
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
			// $scope.userDetail = $firebaseObject(firebase.database().ref().child("profiles").child(user.uid));
			$scope.userDetail = $firebaseObject(firebase.database().ref().child("profiles").child('wRcVIfiRriOrrAjlCaUrLeFZo5y2'));
			console.log("$scope.userDetail>>>",$scope.userDetail);
			if ($scope.userDetail.hasOwnProperty('email')) {
				$scope.errorMessage = "Mobile number not found. Please Register and try again";
			}else{
				$localStorage.userDetail=$scope.userDetail;
				$window.location.href = '#/';
				SessionService.setUserAuthenticated(true);
				window.location.reload(true);
			}
			
			// $scope.userDetail = $firebaseObject(firebase.database().ref().child("profiles").child(user.uid));
			// $scope.userDetail.$loaded().then(function() {
			// 	$localStorage.userDetail=$scope.userDetail;
			// 	$window.location.href = '#/';
			// 	SessionService.setUserAuthenticated(true);
			// 	window.location.reload(true);
			// });
		}).catch(function (error) {
		// User couldn't sign in (bad verification code?)
		// ...
			console.error("Authentication failed:", error);
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
					window.location.reload(true);			
					$window.location.href = '#/adminProfile';
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
		  ref.set({
			first_name: $scope.userDetail.first_name,
			mobile: $scope.userDetail.mobile,
			last_name: $scope.userDetail.last_name,
			address: $scope.userDetail.address,
			email: $scope.userDetail.email
		});
		$scope.message='Successfully Updated'
		$timeout(function () {
			$scope.message=null;
		},5000);
		
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
	console.log("%%%%%%%%%%%%%%%%%%%%%%%%");
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