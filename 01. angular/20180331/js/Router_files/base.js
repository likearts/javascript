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
    .value('scrollOption',{
        endPer : 10 // 스크롤 페이징 처리시 스크롤이 하단에서 몇 프로 남있을때 추가 로드를 할지 설정값(%)
    })
    .run(function(baseService,baseObserver){
        for( var i in baseObserver ) baseService.obsList.add( baseObserver[i] );
    })
})();