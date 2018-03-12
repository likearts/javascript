(function(){
    var app = angular.module('app',['ngTouch','hwSwipe']);
    app.controller('BrandCtrl',['$scope',function($scope){
        var len = 7, ar = [];
        for(var i=0; i<len;++i) ar.push( i+1 );
       $scope.swipeData = ar;
       $scope.colorMatch = [];
       for( var i in ar ) $scope.colorMatch.push( rColor(255) );

       function rand ( n ) {
            return  Math.floor( Math.random()*n );
       }

        function rColor ( c ){
            return 'rgba(' + rand(c) + ', ' + rand(c) + ', ' + rand(c) + ', '+1+')';
       }
    }]);   
    
})();
