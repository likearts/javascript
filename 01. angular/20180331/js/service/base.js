(function(){
    angular.module('baseModel',[
        'mainUrls',
    ])
    .service('baseService',function($q){
        this.obsList = {
            list:{},
            add : function(name){
                if(this.list[name]) {
                    console.log('중복 ' + name );
                    return;
                }
                this.list[name] = {
                    defer : $q.defer(),
                    get : function(){
                        return this.value;
                    },
                    set : function(val){
                        this.value = val;
                        this.defer.notify(val);
                    },
                    getDefer : function(){
                        return this.defer.promise;
                    }
                }
            }
        }
    })
    .value('baseObserver',{
        restApi:'restApi'
    })
    .factory('restApi',function(baseService,baseObserver,$http){
        return function( config ) {
            var httpRquest = $http(config);
            httpRquest
            .then(function(res){
                baseService.obsList.list[baseObserver.restApi].set(res);
            },function(err){
                console.log('err',err);
            })
            return httpRquest;
        }
    })
    .run(function(baseService,baseObserver){
        for( var i in baseObserver ) baseService.obsList.add( baseObserver[i] );
    })
})();