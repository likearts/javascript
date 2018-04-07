(function(){
    angular.module('gnb',[])
    .directive('gnbView',function(routeName){
        return {
            restrict:'EA',
            scope:true,
            templateUrl : '/inc/gnb.html',
            //template:'<h3>test</h3>',
            link : function(scope){
                scope.rname = routeName;
            }
        }
    })
})()