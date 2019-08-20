
/* CONTROLLER PAGINATION FILTER FOR MUSIC OBJ SHOP */

app.controller('AdminController_Store', function ($scope, $filter,$firebaseArray,$timeout) {
	var dbRef = firebase.database().ref().child("products");
    $scope.productList = $firebaseArray(dbRef);
	 $scope.productList.$loaded().then(function() {
		console.log("$scope.productList",$scope.productList);
		$scope.currentPage = 0;
		$scope.pageSize = 9;
		$scope.numberOfPages = Math.ceil($scope.productList.length / $scope.pageSize);
		$scope.filteredItems = [];
		$scope.groupedItems = [];
		$scope.pagedItems = [];

		var searchMatch = function (haystack, needle) {
			if (!needle) {
				return true;
			}
			return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
		};
		$scope.search = function (name) {
			$scope.filteredItems = $filter('filter')($scope.productList, function (product) {
				for (var attr in product) {
					if (searchMatch(product[name], $scope.query))
						return true;
				}
				return false;
			});
			
			$scope.currentPage = 0;
			$scope.groupToPages();
		};
		$scope.myFilter = function (column, category) {
			$scope.filteredItems = $filter('filter')($scope.productList, function (product) {
				for (var attr in product) {
					if (searchMatch(product[column], category))
						return true;
				}
				return false;
			});
			$scope.currentPage = 0;
			$scope.groupToPages();
		};
		$scope.groupToPages = function () {
			$scope.pagedItems = [];
			// console.log("$scope.pagedItems ",$scope.pagedItems );
			for (var i = 0; i < $scope.filteredItems.length; i++) {
				if (i % $scope.pageSize === 0) {
					$scope.pagedItems[Math.floor(i / $scope.pageSize)] = [$scope.filteredItems[i]];
				} else {
					$scope.pagedItems[Math.floor(i / $scope.pageSize)].push($scope.filteredItems[i]);
				}
			}
		};
		
		// functions have been describe process the data for display
		$scope.myFilter(('category',null));
		$scope.search();
	});
});

/* CONTROLLER PAGINATION FILTER FOR DRESS SHOP */

app.controller('AdminController', function ($scope, $filter) {

    var myStore = new store();
    $scope.currentPage = 0;
    $scope.pageSize = 9;
    $scope.numberOfPages = Math.ceil(myStore.products.length / $scope.pageSize);

    $scope.filteredItems = [];
    $scope.groupedItems = [];
    $scope.pagedItems = [];

    var searchMatch = function (haystack, needle) {
        if (!needle) {
            return true;
        }
        return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
    };
    $scope.search = function (name) {
        $scope.filteredItems = $filter('filter')(myStore.products, function (product) {
            for (var attr in product) {
                if (searchMatch(product[name], $scope.query))
                    return true;
            }
            return false;
        });
        $scope.currentPage = 0;
        $scope.groupToPages();
    };
    $scope.myFilter = function (column, category) {
        $scope.filteredItems = $filter('filter')(myStore.products, function (product) {
            for (var attr in product) {
                if (searchMatch(product[column], category))
                    return true;
            }
            return false;
        });
        $scope.currentPage = 0;
        $scope.groupToPages();
    };
    $scope.groupToPages = function () {
        $scope.pagedItems = [];

        for (var i = 0; i < $scope.filteredItems.length; i++) {
            if (i % $scope.pageSize === 0) {
                $scope.pagedItems[Math.floor(i / $scope.pageSize)] = [$scope.filteredItems[i]];
            } else {
                $scope.pagedItems[Math.floor(i / $scope.pageSize)].push($scope.filteredItems[i]);
            }
        }
    };
    // functions have been describe process the data for display
    $scope.myFilter();
    $scope.search();

});


function store() {
    this.products = [
          { num: 1, code: '001', category: 'Blouses', name: 'Berto G.', src: "product/dresses/1.jpg", src_retro: "product/dresses/1r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 200, discount: '20%', class: 'show-down' },
          { num: 2, code: '002', category: 'Shirt', name: 'Rhon Doe', src: "product/dresses/2.jpg", src_retro: "product/dresses/2r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 110, class: 'show-down' },
          { num: 3, code: '003', category: 'Blouses', name: 'Sesto Brisi', src: "product/dresses/3.jpg", src_retro: "product/dresses/3r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 68, discount: '10%', class: 'show-up' },
          { num: 4, code: '004', category: 'Jeans', name: 'Redo Bag', src: "product/dresses/4.jpg", src_retro: "product/dresses/4r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 134, class: 'show-down' },
          { num: 5, code: '005', category: 'Shirt', name: 'Mikore', src: "product/dresses/5.jpg", src_retro: "product/dresses/5r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 350, discount: '50%', class: 'show-up' },
          { num: 6, code: '006', category: 'Shirt', name: 'Big Hoddie', src: "product/dresses/6.jpg", src_retro: "product/dresses/6r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 127, class: 'show-down' },
          { num: 7, code: '007', category: 'Sweatshirt', name: 'Roberto J.', src: "product/dresses/7.jpg", src_retro: "product/dresses/7r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 500, discount: '30%', class: 'show-up' },
          { num: 8, code: '008', category: 'Jeans', name: 'Rigo S.', src: "product/dresses/8.jpg", src_retro: "product/dresses/8r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 346, class: 'show-down' },
          { num: 9, code: '009', category: 'Shirt', name: 'Eliteme', src: "product/dresses/9.jpg", src_retro: "product/dresses/9r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 234, discount: '30%', class: 'show-down'}];
    
    this.products_sound = [
          { num: 1, code: '001s', category: 'Speakers', name: 'Sound G.', src: "product/1.jpg", src_retro: "product/1r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 200, discount: '20%', class: 'show-down' },
          { num: 2, code: '002s', category: 'Watches', name: 'Rhon Doe', src: "product/2.jpg", src_retro: "product/2r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 110, class: 'show-down' },
          { num: 3, code: '003s', category: 'Speakers', name: 'Patrol SR', src: "product/3.jpg", src_retro: "product/3r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 68, discount: '10%', class: 'show-up' },
          { num: 4, code: '004s', category: 'Station', name: 'Redo Bag', src: "product/4.jpg", src_retro: "product/4r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 134, class: 'show-down' },
          { num: 5, code: '005s', category: 'Phone', name: 'Mikore', src: "product/5.jpg", src_retro: "product/5r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 350, discount: '50%', class: 'show-up' },
          { num: 6, code: '006s', category: 'Station', name: 'Big Hoddie', src: "product/6.jpg", src_retro: "product/6r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 127, class: 'show-down' },
          { num: 7, code: '007s', category: 'Watches', name: 'Roberto J.', src: "product/7.jpg", src_retro: "product/7r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 500, discount: '30%', class: 'show-up' },
          { num: 8, code: '008s', category: 'Phone', name: 'Rigo S.', src: "product/8.jpg", src_retro: "product/8r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 346, class: 'show-down' },
          { num: 9, code: '009s', category: 'Speakers', name: 'Eliteme', src: "product/9.jpg", src_retro: "product/9r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 234, discount: '30%', class: 'show-down'},
		  { num: 1, code: '001s', category: 'Speakers', name: 'Sound G.', src: "product/1.jpg", src_retro: "product/1r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 200, discount: '20%', class: 'show-down' },
          { num: 2, code: '002s', category: 'Watches', name: 'Rhon Doe', src: "product/2.jpg", src_retro: "product/2r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 110, class: 'show-down' },
          { num: 3, code: '003s', category: 'Speakers', name: 'Patrol SR', src: "product/3.jpg", src_retro: "product/3r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 68, discount: '10%', class: 'show-up' },
          { num: 4, code: '004s', category: 'Station', name: 'Redo Bag', src: "product/4.jpg", src_retro: "product/4r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 134, class: 'show-down' },
          { num: 5, code: '005s', category: 'Phone', name: 'Mikore', src: "product/5.jpg", src_retro: "product/5r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 350, discount: '50%', class: 'show-up' },
          { num: 6, code: '006s', category: 'Station', name: 'Big Hoddie', src: "product/6.jpg", src_retro: "product/6r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 127, class: 'show-down' },
          { num: 7, code: '007s', category: 'Watches', name: 'Roberto J.', src: "product/7.jpg", src_retro: "product/7r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 500, discount: '30%', class: 'show-up' },
          { num: 8, code: '008s', category: 'Phone', name: 'Rigo S.', src: "product/8.jpg", src_retro: "product/8r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 346, class: 'show-down' },
          { num: 9, code: '009s', category: 'Speakers', name: 'Eliteme', src: "product/9.jpg", src_retro: "product/9r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 234, discount: '30%', class: 'show-down'},
		  { num: 1, code: '001s', category: 'Speakers', name: 'Sound G.', src: "product/1.jpg", src_retro: "product/1r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 200, discount: '20%', class: 'show-down' },
          { num: 2, code: '002s', category: 'Watches', name: 'Rhon Doe', src: "product/2.jpg", src_retro: "product/2r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 110, class: 'show-down' },
          { num: 3, code: '003s', category: 'Speakers', name: 'Patrol SR', src: "product/3.jpg", src_retro: "product/3r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 68, discount: '10%', class: 'show-up' },
          { num: 4, code: '004s', category: 'Station', name: 'Redo Bag', src: "product/4.jpg", src_retro: "product/4r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 134, class: 'show-down' },
          { num: 5, code: '005s', category: 'Phone', name: 'Mikore', src: "product/5.jpg", src_retro: "product/5r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 350, discount: '50%', class: 'show-up' },
          { num: 6, code: '006s', category: 'Station', name: 'Big Hoddie', src: "product/6.jpg", src_retro: "product/6r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 127, class: 'show-down' },
          { num: 7, code: '007s', category: 'Watches', name: 'Roberto J.', src: "product/7.jpg", src_retro: "product/7r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 500, discount: '30%', class: 'show-up' },
          { num: 8, code: '008s', category: 'Phone', name: 'Rigo S.', src: "product/8.jpg", src_retro: "product/8r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 346, class: 'show-down' },
          { num: 9, code: '009s', category: 'Speakers', name: 'Eliteme', src: "product/9.jpg", src_retro: "product/9r.jpg", description: 'Lorem ipsum dolor sit amet, consectetur adipisici elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquid ex ea commodi consequat. ', price: 234, discount: '30%', class: 'show-down'}];

}

function detailsprod() {
    this.details = [
          { id: '001', material: '100% Polyester', size: { s1: { value: '30' }, s2: { value: '32' }, s3: { value: '34'} }, color: { c1: { value: 'Blue' }, c2: { value: 'Black'} }, color_selected: "Blue", size_selected:"30" },
          { id: '002', material: '100% Cotton', size: { s1: { value: 'S' }, s2: { value: 'M' }, s3: { value: 'L' }, s4: { value: 'XL'} }, color: { c1: { value: 'Red' }, c2: { value: 'Black'}}, color_selected: "Red", size_selected:"S" },
          { id: '003', material: 'Pelt', size: { s1: { value: '36' }, s2: { value: '37' }, s3: { value: '38'} }, color: { c1: { value: 'Yellow' }, c2: { value: 'Green'} }, color_selected: "Yellow", size_selected: "36" },
          { id: '004', material: '30% Cotton, 70% Polyester', size: { s1: { value: '30' }, s2: { value: '32' }, s3: { value: '34'} }, color: { c1: { value: 'Gray' }, c2: { value: 'Black'} }, color_selected: "Gray", size_selected: "30" },
          { id: '005', material: '100% Cotton', size: { s1: { value: 'S' }, s2: { value: 'M' }, s3: { value: 'L'} }, color: { c1: { value: 'Red' }, c2: { value: 'Green'} }, color_selected: "Red", size_selected: "S" },
          { id: '006', material: '100% Cotton', size: { s1: { value: 'S' }, s2: { value: 'M' }, s3: { value: 'L'} }, color: { c1: { value: 'White' }, c2: { value: 'Black'} }, color_selected: "White", size_selected: "S" },
          { id: '007', material: '100% Cotton', size: { s1: { value: 'S' }, s2: { value: 'M' }, s3: { value: 'L'} }, color: { c1: { value: 'Red' }, c2: { value: 'Black'} }, color_selected: "Red", size_selected: "S" },
          { id: '008', material: '100% Cotton', size: { s1: { value: '30' }, s2: { value: '32' }, s3: { value: '34'} }, color: { c1: { value: 'Blue' }, c2: { value: 'Black'} }, color_selected: "Blue", size_selected: "30" },
          { id: '009', material: '100% Cotton', size: { s1: { value: 'S' }, s2: { value: 'M' }, s3: { value: 'L'} }, color: { c1: { value: 'Red' }, c2: { value: 'Black'} }, color_selected: "Red", size_selected: "S"}];
   
    this.details_sound = [
          { id: '001s', material: 'Pelt', power: '10-100W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '002s', material: 'Wood', power: '30-140W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '003s', material: 'Pelt', power: '10-150W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '004s', material: 'Metal', power: '40-200W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '005s', material: 'Wood', power: '10-100W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '006s', material: 'Wood', power: '10-150W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '007s', material: 'Metal', power: '10-180W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '008s', material: 'Metal', power: '10-100W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg' },
          { id: '009s', material: 'Pelt', power: '10-100W', size: '(LxAxP) 194x296x200 mm', weight: '5,5 kg'}];
}


/*** Get Prouct Dresses ***/
store.prototype.getProduct = function (code) {
    for (var i = 0; i < this.products.length; i++) {
        if (this.products[i].code == code)
            return this.products[i];
    }
    return null;
}

detailsprod.prototype.getDetail = function (code) {
    for (var i = 0; i < this.details.length; i++) {
        if (this.details[i].id == code)

            return this.details[i];

    }
    return null;
}

store.prototype.getSize = function (code) {
    var myDetails = new detailsprod();

    for (var i = 0; i < myDetails.details.length; i++) {
        if (myDetails.details[i].id == code) {
            return myDetails.details[i].size;
        }
    }
    return null;
}

/*** Get Prouct Sound ***/
store.prototype.getProduct_sound = function (code) {
    for (var i = 0; i < this.products_sound.length; i++) {
        if (this.products_sound[i].code == code)
            return this.products_sound[i];
    }

    return null;
}

detailsprod.prototype.getDetail_sound = function (code) {
    for (var i = 0; i < this.details_sound.length; i++) {
        if (this.details_sound[i].id == code)

            return this.details_sound[i];

    }
    return null;
}