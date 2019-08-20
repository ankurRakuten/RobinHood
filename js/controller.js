'use strict';

// the storeController contains two objects:
// - store: contains the product list
// - cart: the shopping cart object
// - detailsprod: contains the details product
app.controller('storeController', function ($scope, $routeParams, DataService) {

    // get store and cart from service
    $scope.detailsprod = DataService.detailsprod;
    $scope.store = DataService.store;
    $scope.cart = DataService.cart;

    if ($routeParams.productCode != null) {
        $scope.product = $scope.store.getProduct($routeParams.productCode);
        $scope.detail = $scope.detailsprod.getDetail($routeParams.productCode);
    }
});

app.controller('storeController_sound', function ($scope, $routeParams, DataService,$firebaseArray) {
	var dbRef = firebase.database().ref().child("products");
    $scope.productList = $firebaseArray(dbRef);
    // get store and cart from service
    $scope.detailsprod = DataService.detailsprod;
    $scope.store = DataService.store;
    $scope.cart = DataService.cart;
	$scope.productList.$loaded().then(function() {
		$scope.filterProduct = function (code) {
			for (var i = 0; i < $scope.productList.length; i++) {
				if ($scope.productList[i].code == code)
					return $scope.productList[i];
			}
			return null;
		}

		if ($routeParams.productCode != null) {
			$scope.product = $scope.filterProduct($routeParams.productCode);
			console.log("$scope.product",$scope.product);
			$scope.detail = JSON.parse($scope.product['features']);
			console.log("$scope.detail",$scope.detail);
		}
	});
});

app.controller('checkout', function ($scope, $routeParams, DataService,$firebaseArray,$firebaseObject,$localStorage,$http,$modal) {
	$scope.hideButton=true;
	$scope.deliveryDetails = $localStorage.userDetail;
    $scope.cart = DataService.cart;
	
	$scope.checkLocality = function(){
		var geocoder = new google.maps.Geocoder();
		if ($scope.deliveryDetails.pincode.length == 6) {
			geocoder.geocode({ 'address': $scope.deliveryDetails.pincode }, function (result, status) {
				for (var component in result[0]['address_components']) {
					for (var i in result[0]['address_components'][component]['types']) {
						if (result[0]['address_components'][component]['types'][i] == "administrative_area_level_1") {
							$scope.deliveryDetails.state = result[0]['address_components'][component]['long_name'];
							$scope.deliveryDetails.city = result[0]['address_components'][1]['long_name'];
						}
					}
				}
			});
		}		
	}
	$scope.gotoShopPage = function(){
		console.log("gotoShopPage");
		$window.location.href = '#/shop';
	}
	
	$scope.reduceProductQuantity = function(productInfo){
		/*--- decrease quantity of product---*/
		$scope.productDetail = $firebaseObject(firebase.database().ref().child("products").child(productInfo['code']));
		$scope.productDetail.$loaded().then(function() {
			var ref = firebase.database().ref().child("products").child($scope.productDetail['code']);
			ref.update({'quantity':$scope.productDetail.quantity - productInfo['quantity']});
		});
	}
	
	$scope.checkoutCart = function(){
		$scope.hideButton=false;
		var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
		var mobReg = /^\d{10}$/;
		var pinReg = /^[1-9][0-9]{5}$/;
		if(reg.test($scope.deliveryDetails.email) == false) 
        {
            $scope.errorMessage = "Incorrect Email Address";
			$scope.hideButton=true;
        }else if(mobReg.test($scope.deliveryDetails.mobile) == false){
			$scope.errorMessage = "Incorrect Mobile Number";
			$scope.hideButton=true;
		}else if(pinReg.test($scope.deliveryDetails.pincode) == false){
			$scope.errorMessage = "Incorrect Pin Code";
			$scope.hideButton=true;
		}else{
			if($scope.deliveryDetails.altmobile == null){
				$scope.deliveryDetails.altmobile = " ";
			}
			if($scope.deliveryDetails.landmark == null){
				$scope.deliveryDetails.landmark = " ";
			}
			var OrderString='';
			for (var i = 0; i < $scope.cart['items'].length; i++) {
				var orderRef=firebase.database().ref().child("orders");
				orderRef.child($scope.deliveryDetails['$id']).child((new Date).getTime()).set({
					address:$scope.deliveryDetails.address,
					altMobile:$scope.deliveryDetails.altmobile,
					city: $scope.deliveryDetails.city,
					code: $scope.cart['items'][i]['code'],
					email: $scope.deliveryDetails.email,
					firstName: $scope.deliveryDetails.first_name,
					landmark: $scope.deliveryDetails.landmark,
					lastName: $scope.deliveryDetails.last_name,
					mobile: $scope.deliveryDetails.mobile,
					orderTime: (new Date).getTime(),
					pincode: $scope.deliveryDetails.pincode,
					price: $scope.cart['items'][i]['price'],
					quantity: $scope.cart['items'][i]['quantity'],
					name: $scope.cart['items'][i]['name'],
					state: $scope.deliveryDetails.state,
					userId: $scope.deliveryDetails['$id'],
					src_retro:$scope.cart['items'][i]['src'],
				});
				OrderString = OrderString+" // "+$scope.cart['items'][i]['code'] + " | "+$scope.cart['items'][i]['name']+" X "+$scope.cart['items'][i]['quantity']+" = "+$scope.cart['items'][i]['price']
				$scope.reduceProductQuantity($scope.cart['items'][i]);
			}
			
			/* send mail  */
			var service_id = "default_service";
			var template_id = "template_gH5QFYLH";		
			var template_params = {
				sender_name:  $scope.deliveryDetails.first_name+" "+ $scope.deliveryDetails.last_name,
				sender_email:  $scope.deliveryDetails.email,
				sender_mobile: $scope.deliveryDetails.mobile,
				sender_address: $scope.deliveryDetails.address,
				sender_pincode:  $scope.deliveryDetails.pincode,
				sender_city:  $scope.deliveryDetails.city,
				sender_state:  $scope.deliveryDetails.state,
				sender_landmark:  $scope.deliveryDetails.landmark,
				sender_altmobile:  $scope.deliveryDetails.altmobile,
				sender_order:  OrderString
			};
			emailjs.send(service_id,template_id,template_params)
			.then(function(){ 
				console.log("emaiil js successs");
			}, function(err) {
				console.log("error");
			});
			$scope.errorMessage = null;
			$scope.message="Order successful"
			$scope.cart.clearItems();
			$scope.deliveryDetails = '';
			/*-- open modal --*/
			$modal.open({
				templateUrl: 'myModalContent.html', // loads the template
				backdrop: false, // setting backdrop allows us to close the modal window on clicking outside the modal window
				windowClass: 'myModal', // windowClass - additional CSS class(es) to be added to a modal window template
				controller: function ($scope, $modalInstance,$window) {
						$scope.gotoShopPage = function(){
							$modalInstance.dismiss('cancel'); 
							$window.location.href = '#/shop';
						}
				}
			});
		}
	}

});
