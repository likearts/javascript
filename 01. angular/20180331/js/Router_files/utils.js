(function(){
    angular.module('utils',['baseModel'])
    .factory('amortized',function(){
        return function(originalArray,bale){
          var newArray = [], dummy = Math.ceil(originalArray.length/bale);
          for( var i=0; i<dummy; ++i) {
              var groupArr = [];
              for( var s=0;s<bale; ++s) {
                  var cnt = s+i*bale,
                      cur = originalArray[cnt];
                  if(cur) groupArr.push(cur);
              }
              if(groupArr.length) newArray.push(groupArr);
          }
          return newArray;
        }
    })
    .factory('scrollPage',function(baseService,baseObserver,$q,scrollOption){
        return function(){
            var defer = $q.defer(), per = 100, nextPoint = per-scrollOption.endPer;
                scrollTop = baseService.obsList.list[baseObserver.scrollHeight].get();
            baseService.obsList.list[baseObserver.scrollHeight].getDefer().then(null,null,function(updateHeight){
                scrollTop = updateHeight;
            });
            baseService.obsList.list[baseObserver.scroll].getDefer()
            .then(null,null,function(e){
                var progressing = e.target.scrollTop/(scrollTop-window.innerHeight)*per;
                defer.notify( Math.floor(progressing) > nextPoint ? true : false );
            });
            return defer.promise;
        }
    })
})()