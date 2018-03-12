(function(){
    var app = angular.module('app',['ngTouch','hwSwipe']);
    app.controller('BrandCtrl',['$scope',function($scope){
       $scope.swipeData = [ 1, 2, 3, 4, 5, 6, 7 ];
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
    }]);   
    
})();
