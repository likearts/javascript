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
            scope : { swipeIndex : "=?", swipeTotal: "=?", swipeController:"=?", swipeReset:"=?", swiepeMove:"=?" },
            link : function( scope, el, attrs ) {
                var options,
                    win = angular.element($window),
                    ww = angular.element($window).innerWidth(),
                    swipeID = Math.floor(  Math.random()*9999999 ),
                    reload = false,
                    dragEvent = false;

                win.bind( 'resize', function(){
                    var nww = angular.element($window).innerWidth();
                    if( Math.ceil( ww ) == Math.ceil( nww ) ) return;
                    reload = true;
                    reStart();
                });

                function reStart( useSettings ) {
                    clearTimeout(options.play);
                    try {  // 복사된 아이템 삭제
                        angular.element("[copy-item-id="+swipeID+"]").remove();
                        options.copy = false;
                    } catch(e) {};
                    // 설정 초기화
                    init();
                }

                    function init(){
                    options = {
                        parentwrap:  angular.element(el).parent(),
                        containerWidth : 0,
                        wrap: angular.element(el),
                        wrapWidth : 0,
                        siwpeContainer: angular.element(el)[0],
                        spaceX: ( attrs.spaceX || 10 ),
                        infinite: attrs.infinite == "true" ? true : false,
                        resphones: 50,
                        auto: attrs.rolling == "true" ? true : false,
                        interval: attrs.interval || null,
                        view : 1,
                        w320 : attrs.width320 || 1,
                        w640 : attrs.width640,
                        w900 : attrs.width900,
                        itemsList:[],
                        posX: 0,
                        width:0,
                        height:0,
                        touchPos: 0,
                        touchPosY:0,
                        slicew : 0,
                        viewgroup:[],
                        swipe:true,
                        swipepage:0,
                        swipeIndex: 0,
                        input: true,
                        copy: false,
                        play: null,
                        moveY : false,
                        side:"",
                        swipeResponseX : 50
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

                    if( angular.element(el).children().length < options.view  ) {
                        options.view = angular.element(el).children().length;
                        options.infinite = false;
                        options.swipe = false
                    }

                    options.resphones = options.view == 1 ? 100 : 50;

                    align();
                    paging();
                    setPage( options.swipeIndex );
                    if( !dragEvent ) dragInit();

                    autoPlay();
                }

                function getEasing( easing ) {
                    return easing ? { /*
                        '-webkit-transition': '-webkit-transform 500ms cubic-bezier(0.715, 0, 0.110, 1)', // old -webkit-
                        '-webkit-transition': '-webkit-transform 500ms cubic-bezier(0.715, -0.115, 0.110, 1.130)',
                        '-moz-transition': '-webkit-transform 500ms cubic-bezier(0.715, -0.115, 0.110, 1.130)',
                        '-o-transition': '-webkit-transform 500ms cubic-bezier(0.715, -0.115, 0.110, 1.130)',
                        'transition': '-webkit-transform 500ms cubic-bezier(0.715, -0.115, 0.110, 1.130)' */
                        '-webkit-transition': '-webkit-transform ease .3s',
                        '-moz-transition': '-webkit-transform ease .3s',
                        '-o-transition': '-webkit-transform ease .3s',
                        'transition': '-webkit-transform ease .3s'
                    } : {
                        '-webkit-transition': '-webkit-transform ease 0s',
                        '-moz-transition': '-webkit-transform ease 0s',
                        '-o-transition': '-webkit-transform ease 0s',
                        'transition': '-webkit-transform ease 0s'
                    }
                }

                function getInfo () {
                    return {
                        minimum : 0,
                        maximum : -( options.wrapWidth - options.containerWidth )
                    }
                }

                function copyItems () {
                    var s = 0, limit = options.wrap.children().length*2
                    if( limit < options.view*3 ) limit = options.view*3;
                    for( var i=options.wrap.children().length; i<limit; ++i ) {
                        var copyItem = angular.element( angular.element(options.wrap.children()[s]).clone(true,true)[0] );
                        copyItem.attr( "index", i );
                        copyItem.attr('ng-repeat','');
                        copyItem.attr('copy-item-id',swipeID);
                        copyItem.css({ width : options.slicew, left: i*options.slicew+"px", position: 'absolute' });
                        options.wrap.append( copyItem );
                        var c = angular.element( options.wrap.children()[i] );
                        options.itemsList.push( [ c, (c.attr('index') || i) ] );
                        s++;
                    }
                    options.wrap.css( { position: 'relative', width:options.wrapWidth, height: options.height });
                }

                function align() {
                    options.containerWidth = options.parentwrap[0].clientWidth;
                    options.slicew = options.containerWidth/options.view;
                    options.width = options.containerWidth;

                    var items = options.wrap.children();
                    if( reload && options.infinite ) options.wrap.children().remove();
                    options.wrapWidth = 0;
                    
                    angular.forEach( items, function(e,i){
                        var c = angular.element(e);
                        if( reload && options.infinite ) options.wrap.append( c );
                        //if( c.attr('index') == null || c.attr('index') == undefined )  c.attr( "index", i );
                        c.attr( "index", i );
                        c[0].removeAttribute('ng-repeat');
                        c.css({ width : options.slicew, left: options.wrapWidth, position: 'absolute' });
                        options.wrapWidth += c[0].clientWidth;
                        options.itemsList.push( [ e, (c.attr('index') || i) ] );
                        if( !options.height ) options.height = c[0].clientHeight;
                    });
                    options.wrap.css( { position: 'relative', width:options.wrapWidth, height: options.height });

                    if( reload ) slide(0);
                    reload = false;

                    // 복사 ( 화면 출력 개수와 아이템 개수가 맞는데 무한 스크롤 조건에 맞는 개수가 되지 않을때 )
                    if( options.wrap.children().length < options.view * 3 && options.infinite ) {
                        if( options.wrap.children().length%options.view == 0 && options.wrap.children().length*2 >= options.view*3 ) {
                            copyItems();
                            options.copy = true;
                        } else {
                            options.infinite = false;
                        }
                    }
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
                    // 카피된 개수는 총 개수에서 제외
                    scope.swipeTotal = options.copy ? options.viewgroup.length/2 : options.viewgroup.length;
                    try{ scope.$apply(); } catch(e) { };
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

                function setPage( no, outside ) {
                    options.swipeIndex = no;
                    // 카피된 아이템이 있으면 실 개수 기준으로 출력
                    if( options.copy ) scope.swipeIndex = no%scope.swipeTotal;
                    else scope.swipeIndex = no;
                    // public scope 업데이트를 위한 출력을 위한 강제적용
                    if(!outside) { try{ scope.$apply(); } catch(e) { } };
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

                        if( xpc > options.spaceX && xpc < options.resphones ) {
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
                        infinite();
                    }
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
                        options.input = false;
                        options.posX = npos;
                        $timeout(function(){
                            options.input = true;
                            autoPlay();
                        }, 600 );
                    }

                    if( page != null || page != undefined ) setPage( page, outside );
                    try{ if(!outside) scope.$apply(); } catch(e) { };
                }

                function dragInit() {
                    if( dragEvent ) return;
                    dragEvent = true;
                    angular.element(document.body).attr("ondragstart","return false");
                    angular.element(document.body).attr("onselectstart","return false");
                    options.wrap.bind( 'touchstart touchmove touchend', function(e){
                        if( options.wrap.children().length < 2 ) return;
                        var touchX = e.originalEvent.changedTouches[0].clientX,
                            touchY = e.originalEvent.changedTouches[0].clientY;
                        switch( e.type ){
                            case "touchstart":
                                options.touchPos = touchX;
                                options.touchPosY = touchY;
                                break;
                            case "touchmove":
                                var cpos = options.touchPos-touchX, cy = touchX;
                                if( Math.abs( cpos ) < options.swipeResponseX ) return;
                                options.side = options.touchPos < touchX ? 'prev' : 'next';
                                draging( cpos < 0 ? (cpos + options.swipeResponseX) : (cpos-options.swipeResponseX) );
                                break;
                            case "touchend":
                                draging( options.touchPos-touchX, true );
                                options.touchPos = 0;
                                break;
                        }
                        infinite();
                    });
                }

                function autoPlay() {
                    if( !options.interval || !options.auto || options.play != null ) return;
                    options.play = setTimeout( function(){
                        if(options.play!=null) scope.swipeController('next');
                    }, options.interval );
                }

                /*
                    @public
                    외부에서 접근가능한 함수
                */
                scope.swipeReset = reStart;
                scope.swiepeMove = function( index ) { // 임시 코드 무한 롤링이 아니고 1개씩 롤링 타입에만 적용
                    if( typeof index != 'number' || options.view != 1 || options.infinite ) return;
                    var xx = options.wrap.children()[index].offsetLeft;
                    slide( -xx, true, index, true );
                }
                scope.swipeController = function( type ){
                    if( type == null || type == undefined || !options.input ) return;
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
                        break;
                        case "prev" :
                            options.side = "prev";
                            future();

                            var page = options.swipeIndex > 0 ? options.swipeIndex-1 : options.viewgroup.length-1,
                                pageItem = options.viewgroup[page],
                                itemIdnex = pageItem[0][1],
                                itemInfo = getIndexPosition( itemIdnex );

                            slide( -itemInfo.posx, true, page, true );
                        break;
                        case "end" :
                            options.side = "next";
                            future();

                            var p = options.wrap.children().length-1, endx = options.wrap.children()[p].offsetLeft;
                            slide( -endx, true, p, true );
                        break;
                        default:
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
