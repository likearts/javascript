(function(){

	var app = angular.module('likearts',['ngHwSwipe']);
	
	app.controller( 'likeartsCtrl', [ '$scope', function( $scope){

		$scope.swipeData = [ 1,2,3 ];
		$scope.colorMatch = [];
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

	}]);
})();
