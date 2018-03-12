(function(){
	var app = angular.module('likearts',['hwSingleSwipe']);
	app.controller( 'likeartsCtrl', [ '$scope', '$timeout', function( $scope, $timeout ){

		$scope.swipeData = [ 0, 1, 2, 3, 4, 5 ];
		$scope.colorMatch = [];
        $scope.page = 0;
		for( var i in $scope.swipeData ) {
			$scope.colorMatch.push( rColor(255) );
		}

		function rand ( n ) {
			return  Math.floor( Math.random()*n );
		}

		function rColor ( c ){
			return 'rgba(' + rand(c) + ', ' + rand(c) + ', ' + rand(c) + ', '+1+')';
		}
		
		$scope.GARray = function( arr, cnt ) {
			var ar = [];
			for( var i=0; i<arr.length; ++i ) {
				var n = [];
				for( var s=0; s<cnt; ++s ) {
					n.push( arr[i*cnt+s] );
				}
				if( n.length ) ar.push(n);
			}
			return ar;
		}

		$scope.addListData = function(){
        	$scope.loading = true;
        	$scope.page++;
        	$timeout(function(){
				var s = $scope.swipeData.length;
				for( var i=s;i<s+3;++i) {
					$scope.swipeData.push(i);
				};
				console.log('page :' + $scope.page, $scope.swipeData );
                $scope.loading = false;
            },1000);
		}

		$scope.art=function(t){
			//alert(t);
			console.log(t);
		}

		$scope.$watch( 'swpIndex', function(n){
			console.log( 'swpIndex', n );
			if(!n) return;
			if( n >= $scope.swipeData.length-3 ) $scope.addListData();
		});

	}]);
})();
