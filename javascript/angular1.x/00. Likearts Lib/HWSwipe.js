(function(window, angular, undefined) {
    'use strict';

    /*
        @ auther : 박해원
        @ date : 20170614
        @ last modify :
        @ example1 :
            <div> <-- container
                <div hw-swipe view-item="1">
                    <div> content </div>
                </div>
            </div>
        @example2 :
            <div> <-- container
                <div hw-swipe view-item="1" infinite="true">
                    <div> content </div>
                </div>
            </div>
    */
    var app = angular.module('hwSwipe',['ngTouch']);
    app.directive( 'hwSwipe', ['$timeout','$window', '$compile', function($timeout,$window,$compile) {
        return {
            scope : { swipeIndex : "=?", swipeTotal: "=?", swipeController:"=?" },
            link : function( scope, el, attrs ) {
                var options,
                    win = angular.element($window),
                    swipeID = Math.floor(  Math.random()*9999999 ),
                    reload = false,
                    initWidth = 0,
                    initItems,
                    duration = 600;

                win.bind( 'resize', function(){
                    if( parseInt( initWidth )  == parseInt( getWindowSize().width ) ) return;
                    clearTimeout(options.play);
                    init();
                });

                function getWindowSize() {
                    return { width:win.innerWidth(), height:win.innerHeight() }
                };

                function init(){
                    options = {
                        parentwrap:  angular.element(el).parent(),
                        containerWidth : 0,
                        wrap: angular.element(el),
                        wrapWidth : 0,
                        siwpeContainer: angular.element(el)[0],
                        infinite: attrs.infinite == "true" ? true : false,
                        resphones: 50,
                        auto: attrs.rolling == "true" ? true : false,
                        interval: attrs.interval || null,
                        easing: attrs.easing || "",
                        view : 1,
                        w320 : attrs.width320 || 1,
                        w640 : attrs.width640,
                        w900 : attrs.width900,
                        itemsList:[],
                        posX: 0,
                        width:0,
                        height:0,
                        touchPos: 0,
                        evt : false,
                        slicew : 0,
                        viewgroup:[],
                        swipe:true,
                        swipepage:0,
                        swipeIndex: 0,
                        copy: false,
                        play: null,
                        side:""
                    }

                    if( win[0].innerWidth < 640 ) {
                        options.view = options.w320;
                    }
                    if( win[0].innerWidth > 640 && win[0].innerWidth < 900 ) {
                        options.view = options.w640 || ( options.w320 || 1 );
                    }
                    if( win[0].innerWidth > 900 ) {
                        options.view = options.w900 || ( options.w640 || options.w320 );
                    }
                    options.view = Number(options.view);

                    if( angular.element(el).children().length <= options.view  ) {
                        options.view = angular.element(el).children().length;
                        options.infinite = false;
                        options.swipe = false
                    }
                    if( angular.element(el).children().length <= options.view*2  ) options.infinite = false;

                    initWidth = getWindowSize().width;
                    options.resphones = options.view == 1 ? 100 : 50;

                    align();
                    paging();
                    setPage( options.swipeIndex );
                    if( !options.evt ) dragInit();

                    autoPlay();
                }

                function getCubicBezier( type ){
                    switch( type ) {
                        case "easeOutExpo":
                            return "cubic-bezier(0.190, 1.000, 0.220, 1.000)";
                        break;
                        case "easeOutCubic":
                            return "cubic-bezier(0.215, 0.610, 0.355, 1.000)";
                        break;
                        case "easeOutQuart":
                            return "cubic-bezier(0.165, 0.840, 0.440, 1.000)";
                        break;
                        case "easeOutQuint":
                            return "cubic-bezier(0.230, 1.000, 0.320, 1.000)";
                        break;
                        case "easeOutCirc":
                            return "cubic-bezier(0.785, 0.135, 0.150, 0.860)";
                        break;
                        default: return "";
                    }
                }

                function getEasing( easing ) {
                    return easing ? {
                        '-webkit-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( options.easing ),
                        '-moz-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( options.easing ),
                        '-o-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( options.easing ),
                        'transition': '-webkit-transform '+duration+'ms '+getCubicBezier( options.easing )
                    } : {
                        '-webkit-transition': '-webkit-transform 0ms',
                        '-moz-transition': '-webkit-transform 0ms',
                        '-o-transition': '-webkit-transform 0ms',
                        'transition': '-webkit-transform 0ms'
                    }
                }

                function align() {
                    options.containerWidth = parseInt( options.parentwrap[0].clientWidth );
                    options.slicew = parseInt( options.containerWidth/options.view );
                    options.width = parseInt( options.containerWidth );

                    if( initItems ) {
                      options.wrap.children().remove();
                      options.wrap.append( initItems );
                    }

                    var items = options.wrap.children();
                    initItems = items.clone(true,true);
                    options.wrapWidth = 0;

                    angular.forEach( items, function(e,i){
                        var c = angular.element(e);
                        if( c.attr('index') == null || c.attr('index') == undefined ) c.attr( "index", i );
                        c[0].removeAttribute('ng-repeat');
                        c.css({ width:options.slicew, left:options.slicew*Number(c.attr('index')), position:'absolute' });
                        options.wrapWidth += options.slicew;
                        options.itemsList.push( [ e, (c.attr('index') || i) ] );
                        if( !options.height ) options.height = c[0].clientHeight;
                        console.log( i, c.attr('index') );
                    });
                    options.wrap.css( { position: 'relative', width:options.wrapWidth, height: options.height });
                    slide(0);
                }

                function paging () {
                    options.swipepage = Math.ceil( options.itemsList.length/options.view );
                    for( var i =0; i<options.swipepage; ++i ) {
                        var n = [];
                        for( var s=0; s<options.view; ++s ) {
                            var item = options.itemsList[i*options.view+s];
                            if(item) n.push( item );
                        }
                        options.viewgroup.push(n);
                    }
                    scope.swipeTotal = options.swipepage;
                    try{ scope.$apply() } catch(e) { };
                }

                function future() {
                    var first = angular.element( options.wrap.children()[0] ),
                        last = angular.element( options.wrap.children()[ options.wrap.children().length-1 ] );

                    if( options.side == "prev" ) {
                        var lost = Math.ceil( Math.abs( first.offset().left )/options.slicew );
                        for( var i=0; i<Math.ceil(options.view-lost);++i) infinite("prev");
                    }
                    if( options.side == "next" ) {
                        var lost = Math.floor( Math.abs( last.offset().left - ( options.containerWidth) )/options.slicew );
                        for( var i=0; i<Math.ceil( options.view-lost );++i) infinite("next");
                    }
                }

                function setPage( no, outside ){
                    options.swipeIndex = scope.swipeIndex = no;
                    // public scope 업데이트를 위한 강제적용
                    if(!outside) {
                        try{ scope.$apply() } catch(e) { }
                    }
                }

                function getPage( no ) {
                    var info = { posx:null };
                    for( var i=0; i<options.viewgroup.length;++i) {
                        for( var s=0; s<options.viewgroup[i].length; ++s){
                            var n = options.viewgroup[i][s], group = options.viewgroup[i];
                            if( no == n[1] ) {
                                info = {
                                    index : group.length < options.view ? group[group.length-1][1] :group[0][1],
                                    page : i,
                                    minus : options.view - group.length,
                                    side : group.length < options.view ? 'last' : 'first'
                                }
                            }
                        }
                    }
                    future();

                    return info;
                }

                function getPositionX ( target  ) {
                    return Number( angular.element( target ).css("left").replace("px","") );
                }

                function getIndexPosition( index ) {
                    var info = null;
                    angular.forEach( options.wrap.children(), function(e,i){
                        var c = angular.element(e);
                        if(info==null && index == c.attr('index') ) {
                            info = { posx:getPositionX( c ), index:c.index() }
                        }
                    });
                    return info;
                }

                function getCenterItem () {
                    var itemIndex = null, cw = options.containerWidth, posx;
                    angular.forEach( options.wrap.children(), function(e,i){
                        if( itemIndex > 0 ) return;

                        var c = angular.element(e), itemX = c.offset().left,
                            sw = c[0].clientWidth,
                            xpc = ( (options.side=="prev"?itemX+options.slicew:(cw-itemX))/cw ) * 100;

                        if( options.side == "prev" && itemX > cw/2 ) return;
                        if( options.side == "next" && itemX < ( options.view == 1 ? 0 : cw/2)  ) return;

                        if( xpc < 0 ) xpc = 0;
                        if( xpc > 100 ) xpc = 100;

                        if( xpc > 10 && xpc < options.resphones ) {
                            itemIndex = Number( c.attr('index') )+1;
                            posx = getPositionX( c );
                        }
                    });
                    if( itemIndex == null ) return { posx:options.posX };

                    var info =  { index:itemIndex > 0 ? itemIndex-1 : itemIndex, posx:posx },
                        currinfo = getPage(info.index),
                        iteminfo = getIndexPosition( currinfo.index );

                    info.page = currinfo.page;
                    info.itemIndex = currinfo.index;
                    info.targetIndex = iteminfo.index;
                    info.posx = iteminfo.posx;

                    if( currinfo.side == "last" ) info.posx -= ( cw - options.slicew );

                    return info;
                }

                function infinite ( move ) {
                    if(!options.infinite) return;
                    var first = angular.element( options.wrap.children()[0] ),
                        last = angular.element( options.wrap.children()[ options.wrap.children().length-1 ] );
                    if( first.offset().left >= -options.slicew && first.offset().left < options.containerWidth || move == "prev" ) {
                        options.wrap.prepend( angular.element( last.clone(true,true)[0] ).css("left", ( getPositionX( first )  - options.slicew ) +"px") );
                        last.remove();
                        return;
                    }
                    if( last.offset().left < (options.containerWidth + options.slicew ) && last.offset().left > -options.slicew || move == "next" ) {
                        options.wrap.append( angular.element( first.clone(true,true)[0] ).css("left", ( getPositionX( last ) + options.slicew )+"px") );
                        first.remove();
                        return;
                    }
                }

                function draging ( pos, end ) {
                    var npos = options.posX - pos, d = {};
                    if( !options.infinite && end ) {
                        d = getCenterItem();
                        npos = (d.index != undefined && d.index != null) ? -d.posx : d.posx;
                    }
                    if( options.infinite && end ) {
                        d = getCenterItem();
                        if( d.index != null ) {
                            npos = -d.posx;
                        } else {
                            npos = d.posx;
                        }
                    }
                    infinite();
                    slide( npos, end, d.page );
                }

                function slide ( npos, end, page, outside ) {
                    var css = getEasing(end);
                    css["-webkit-transform"] = 'translateX('+npos+'px)';
                    options.wrap.css(css);

                    if( options.play != null ) {
                        clearTimeout(options.play);
                        options.play = null;
                    }

                    if( end ) {
                        options.posX = npos;
                        scope.transition = true;
                        future();
                        $timeout(function(){
                            scope.transition = false;
                            options.wrap.css(getEasing());
                            autoPlay();
                        }, 600 );
                    }
                    if( page != null || page != undefined ) setPage( page, outside );
                }

                function dragInit(){
                    options.evt = true;
                    angular.element(document.body).attr("ondragstart","return false");
                    angular.element(document.body).attr("onselectstart","return false");
                    options.parentwrap.bind( 'touchstart touchmove touchend', function(e){
                        var touchX = e.originalEvent.changedTouches[0].clientX;
                        switch( e.type ){
                            case "touchstart":
                                options.touchPos = touchX;
                                break;
                            case "touchmove":
                                var cpos = options.touchPos-touchX;
                                options.side = options.touchPos < touchX ? 'prev' : 'next';
                                draging( cpos );
                                break;
                            case "touchend":
                                draging( options.touchPos-touchX, true );
                                options.touchPos = 0;
                                break;
                        }
                    });
                }
                
                function autoPlay() {
                    if( !options.interval || !options.auto || options.play != null ) return;
                    options.play = setTimeout( function(){
                        if(options.play!=null) scope.swipeController('next');
                    }, options.interval );
                }
                
                function liveApply() {
                    var cnt = 0, extime = 50, max = duration/extime;
                    function liveCopy() {
                        $timeout(function(){
                            if(cnt<max){
                                infinite();
                                cnt++;
                                liveCopy();
                            }
                        },50);
                    }
                    liveCopy();
                }
                
                // public
                scope.swipeController = function( type ){
                    if( type == null || type == undefined || scope.transition ) return;

                    switch( type ) {
                        case "next" :
                            options.side = "next";
                            future();

                            var page = options.swipeIndex < options.viewgroup.length-1 ? options.swipeIndex+1 : 0,
                                pageItem = options.viewgroup[page],
                                itemIdnex = pageItem.length < options.view ? pageItem[ pageItem.length-1 ][1] : pageItem[0][1],
                                itemInfo = getIndexPosition( itemIdnex );

                            if( pageItem.length < options.view ) {
                                itemInfo.posx = itemInfo.posx - ( options.containerWidth - options.slicew );
                            }

                            slide( -itemInfo.posx, true, page, true );
                            
                            liveApply();
                        break;
                        case "prev" :
                            options.side = "prev";
                            future();
                            
                            var page = options.swipeIndex > 0 ? options.swipeIndex-1 : options.viewgroup.length-1,
                                pageItem = options.viewgroup[page],
                                itemIdnex = pageItem.length < options.view ? pageItem[ pageItem.length-1 ][1] : pageItem[0][1],
                                itemInfo = getIndexPosition( itemIdnex );
                            
                            if( pageItem.length < options.view ) {
                                itemInfo.posx = itemInfo.posx - (getWindowSize().width-options.slicew);
                            }
                            slide( -itemInfo.posx, true, page, true );

                            liveApply();
                        break;
                        default:
                            options.side = options.swipeIndex < type ? "next" : "prev";
                            future();
                            setPage( type );
                    }
                }

                window.onbeforeunload = function (event) {
                    clearTimeout(options.play);
                }

                $timeout(init);
            }
        }
    }]);

    app.filter('range', function(){
        return function(n) {
          var res = [];
          for (var i = 0; i < n; i++) {
            res.push(i);
          }
          return res;
        };
     });

})(window, window.angular);
