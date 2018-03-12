/**
 * @Autor 박해원
 * @date 20171130
 *
 * @namdoc module
 * @name hwSwipe
 * @description
 * - 스와이프 모듈
 */
(function(){
    angular.module('hwSwipe',[])

    /**
     * @namdoc run
     * @description
     * - 전용 style추가
     */
    .run([function(){
        document.styleSheets[0].addRule('.hwswipe_clear:after','content:"";padding:0; margin:0; display:block;clear:both;');
        console.log("%cHWSWIPE", "background: white; color: skyblue; font-size: 16px; font-weight: bold");
    }])

    /**
     * @ngdoc factory
     * @name cubicbezier
     * @description
     * - transition효과
     */
    .factory('cubicbezier',[function(){
        return function( type ){
            switch( type ) {
                // Expo
                case "easeInExpo":
                    return "cubic-bezier(0.950, 0.050, 0.795, 0.035)";
                    break;
                case "easeOutExpo":
                    return "cubic-bezier(0.190, 1.000, 0.220, 1.000)";
                    break;
                case "easeInOutExpo":
                    return "cubic-bezier(1, 0, 0, 1)";
                    break;
                // Cubic
                case "easeOutCubic":
                    return "cubic-bezier(0.215, 0.610, 0.355, 1.000)";
                    break;
                // Quart
                case "easeInQuart":
                    return "cubic-bezier(0.895, 0.030, 0.685, 0.220)";
                    break;
                case "easeOutQuart":
                    return "cubic-bezier(0.165, 0.840, 0.440, 1.000)";
                    break;
                case "easeInOutQuart":
                    return "cubic-bezier(0.77, 0, 0.175, 1)";
                    break;
                // Qunit
                case "easeInQunut":
                    return "cubic-bezier(0.755, 0.050, 0.855, 0.060)";
                    break;
                case "easeOutQuint":
                    return "cubic-bezier(0.230, 1.000, 0.320, 1.000)";
                    break;
                case "easeInOutQuint":
                    return "cubic-bezier(0.860, 0.000, 0.070, 1.000)";
                    break;
                // Circ
                case "easeInCirc":
                    return "cubic-bezier(0.600, 0.040, 0.980, 0.335";
                    break;
                case "easeOutCirc":
                    return "cubic-bezier(0.075, 0.820, 0.165, 1.000)";
                    break;
                case "easeInOutCirc":
                    return "cubic-bezier(0.785, 0.135, 0.150, 0.860)";
                    break;
                // Back
                case "easeInBack":
                    return "cubic-bezier(0.600, 0, 0.735, 0.045)";
                    break;
                case "easeOutBack":
                    return "cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                    break;
                case "easeInOutBack":
                    return "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
                    break;
                // Sine
                case "easeInSine":
                    return "cubic-bezier(0.47, 0, 0.745, 0.715)";
                    break;
                case "easeOutSine":
                    return "cubic-bezier(0.39, 0.575, 0.565, 1)";
                    break;
                case "easeInOutSine":
                    return "cubic-bezier(0.445, 0.05, 0.55, 0.95)";
                    break;
                case "easeOutElastic":
                    return "cubic-bezier(.75,-0.5,0,1.75)";
                default: return "";
            }
        }
    }])

    /**
     * @ngdoc directive
     * @name hwSwipe
     * @description
     * - 스와이프 적용 directive
     *
     * @Attributes
     * - w320 : 화면넓이 320과 같거나 낮을때 화면에 보여질 개 수
     * - w630 : 화면넓이 640과 같거나 낮을때 화면에 보여질 개 수
     * - w900 : 화면넓이 900과 같거나 낮을때 화면에 보여질 개 수
     * - swipe-controller : 스와이프 컨트롤러 오픈 변수 설정
     * - swipe-index : 스와이프 index 오픈 변수 설정
     * - swipe-total : 스와이프 총페이지 오픈 변수 설정
     * - infinity : 무한 스와이프 적용 여부
     * - auto-play : 자동롤링 적용 여부
     * - interval : 자동롤링 시간설정
     * - easing : 효과
     * - duration : 효과 적용시간
     *
     * @Example
     *  <ul
     *      hw-swipe
     *      w320="1"
     *      w640="2"
     *      w900="2"
     *      swipe-controller="hwswipeControl"
     *      infinity="true"
     *      swipe-index="sindex"
     *      swipe-total="stotal"
     *      auto-play="true"
     *      interval="3000"
     *      easing="easeOutQuart"
     *      duration="500>
     *
     *      <li ng-repeat='...'><li>
     *  </ul>
     *
     *  <div class='indicator'>
     *       <span
     *          ng-repeat='item in stotal | hwRange'
     *          ng-class='{active:$index==sindex}'
     *          ng-click='hwswipeControl($index or "prev" or "next" )'>
     *       </span>
     *  </div>
     */
    .directive('hwSwipe',['$timeout','cubicbezier',function($timeout,cubicbezier){
        return {
            scope: {swipeIndex:'=?',swipeTotal:'=?',swipeController:'=?'},
            link : function(scope,el,attrs){
                var option = {}, dragevent = false, items, $w = angular.element(window);

                el.css({
                    display:'none',
                    position:'relative',
                    '-webkit-box-sizing':'border-box',
                    '-moz-box-sizing':'border-box',
                    'box-sizing':'border-box',
                    'will-change': 'transform',
                    'pointer-events': 'auto'
                });
                el.parent().css({
                    '-webkit-user-drag' : 'none',
                    'touch-action' : 'pan-y',
                    'user-select' : 'none',
                    'will-change' : 'transform',
                    '-webkit-font-smoothing': 'antialiased',
                    'box-sizing': 'border-box'
                });

                el.addClass('hwswipe_clear');

                function init(){
                    el.css({display:'block'});
                    option = {
                        touchPos : 0,
                        movePos : 0,
                        wrap : el.parent(),
                        view : 1,
                        page : 0,
                        total : 0,
                        containerWidth:0,
                        overWidth:0,
                        itemWidth:0,
                        duration:attrs.duration||300,
                        posx:[],
                        swipe:false,
                        side:'',
                        infinity:attrs.infinity=='true'?true:false,
                        auto:attrs.autoPlay=='true'?true:false,
                        autotimer:0,
                        interval:attrs.interval||5000,
                        easing:attrs.easing,
                        parentWidth:el.parent()[0].clientWidth,
                        scrolly:0,
                        useScrollPos:''
                    }
                    swipe();
                    itemAlign();
                    if(!option.swipe) return;
                    dragInit();
                }

                function swipe(){
                    var winWidth = window.innerWidth;
                    if(attrs.w900&&winWidth<=900) option.view = attrs.w900;
                    if(attrs.w640&&winWidth<=640) option.view = attrs.w640;
                    if(attrs.w320&&winWidth<=320) option.view = attrs.w320;
                    if( el.children().length <= option.view ) option.swipe=false;
                    else option.swipe=true;
                }

                function itemAlign(){
                    var len = el.children().length,
                        itemWidth = el.parent()[0].clientWidth/option.view,
                        containerWidth = (itemWidth*len)+(itemWidth*option.view)*2;

                    option.containerWidth = itemWidth*len;
                    option.overWidth = itemWidth*option.view;
                    option.total = Math.ceil(len/option.view);
                    option.itemWidth = itemWidth;

                    if(!items) items = el.children();
                    el.css({width:containerWidth+"px"});
                    items.css({
                        width:itemWidth+"px",
                        display:'block',
                        float:'left',
                        '-webkit-box-sizing':'border-box',
                        '-moz-box-sizing':'border-box',
                        'box-sizing':'border-box'
                    });

                    if(!option.swipe) return;

                    for( var i=0; i<option.total;++i ){
                        var itemgroup = [];
                        for( var s=0; s<option.view;++s) {
                            var cnt=i*option.view+s, item = items[cnt];
                            if(cnt<el.children().length) {
                                angular.element(item).attr('item-index', cnt);
                                itemgroup.push({left: item.offsetLeft, page: i, index: cnt});
                            }
                        }
                        if(itemgroup.length) option.posx.push(itemgroup);
                    }

                    for( var i=0;i<option.view;++i) copyItems(i,'next');
                    for( var i=items.length-1;i>(items.length-1)-option.view;--i) copyItems(i,'prev');

                    moveX(0);
                }

                function copyItems( index, str ){
                    var item = angular.element(items[index]).clone(true,true);
                    if(!option.infinity) item.css({opacity:0});
                    if(str=="next") {
                        el.append( item );
                    } else {
                        el.prepend( item );
                    }
                }

                function dragInit(){
                    // 드래그 이벤트 활성화
                    dragevent = true;

                    angular.element(document.body).attr("ondragstart","return false");
                    angular.element(document.body).attr("onselectstart","return false");

                    option.wrap.bind( 'touchstart.hwswipe touchmove.hwswipe touchend.hwswipe', function(e){
                        var touchProps;

                        try{ touchProps = e.originalEvent.changedTouches[0] }
                        catch(er) { touchProps = e.changedTouches[0] }
                        var touchX = touchProps.clientX, dy = touchProps.clientY;

                        switch( e.type ){
                            case "touchstart":
                                e.stopPropagation();
                                option.touchPos = touchX;
                                option.scrolly = dy;
                                break;
                            case "touchmove":
                                var cpos = option.touchPos-touchX, cy = option.scrolly-dy;
                                if( Math.abs(cy) > 10 && option.useScrollPos != 'X' ) option.useScrollPos = 'Y'; //위,아래 이동
                                if( Math.abs(cpos) > 20 && option.useScrollPos != 'Y' ) option.useScrollPos = 'X'; //좌,우 이동
                                option.side = option.touchPos < touchX ? 'prev' : 'next';
                                if( option.useScrollPos != 'Y' ) {
                                    e.preventDefault();
                                    draging( cpos );
                                }
                                break;
                            case "touchend":
                                if(option.useScrollPos!='Y') draging( option.touchPos-touchX, true );
                                option.touchPos = option.scrolly = 0;
                                option.useScrollPos = '';
                                break;
                        }
                    });
                }

                /**
                 * Transition 효과 적용
                 * @param easing
                 * @return {*}
                 */
                function getEasing( easing, posx ) {
                    return easing ? {
                        '-webkit-transition': '-webkit-transform '+option.duration+'ms '+cubicbezier( option.easing ),
                        '-moz-transition': '-moz-transform '+option.duration+'ms '+cubicbezier( option.easing ),
                        '-o-transition': '-o-transform '+option.duration+'ms '+cubicbezier( option.easing ),
                        'transition': 'transform '+option.duration+'ms '+cubicbezier( option.easing ),
                        '-webkit-transform':'translateX('+posx+'px)',
                        '-moz-transform':'translateX('+posx+'px)',
                        '-o-transform':'translateX('+posx+'px)',
                        '-ms-transform':'translateX('+posx+'px)',
                        'transform':'translateX('+posx+'px)'
                    } : {
                        '-webkit-transition': '-webkit-transform 0ms',
                        '-moz-transition': '-moz-transform 0ms',
                        '-o-transition': '-o-transform 0ms',
                        'transition': 'transform 0ms',
                        '-webkit-transform':'translateX('+posx+'px)',
                        '-moz-transform':'translateX('+posx+'px)',
                        '-o-transform':'translateX('+posx+'px)',
                        '-ms-transform':'translateX('+posx+'px)',
                        'transform':'translateX('+posx+'px)'
                    }
                }

                function draging(posx,end){
                    if( !Math.abs(posx) || option.transition ) return;
                    var cposx = option.movePos-posx;
                    if(end){
                        if(Math.abs(posx)<(window.innerWidth/6)) {
                            setPox(option.movePos);
                            return;
                        }
                        option.transition = true;
                        getPage();
                        moveX(option.page,true);

                        $timeout(function(){
                            // 처음 일경우
                            if( option.page < 0 ) {
                                moveX( option.total-1, false );
                                option.page = option.total-1;
                            }
                            // 끝일경우
                            if( option.page > option.total-1 ) {
                                moveX( 0, false );
                                option.page = 0;
                            }
                            option.transition = false;
                        },option.duration);
                    } else {
                        el.css( getEasing(end,cposx) );
                    }
                }

                function moveX(index,easing,apply) {
                    var posx;
                    if( index>-1&&index<option.total) {
                        posx = -(option.parentWidth+option.posx[index][0].left);
                        if(index==option.total-1){
                            var basew = el.children()[0].offsetWidth;
                            posx = -(basew+option.posx[index][option.posx[index].length-1].left);
                        }
                    } else {
                        if( index<0) posx = 0;
                        if(index>option.total-1) posx = -(el[0].clientWidth-option.parentWidth);
                    }
                    el.css( getEasing(easing,posx) );
                    option.movePos = posx;
                    if(apply) option.page = index;
                }

                function setPox(pos){
                    el.css( getEasing(true,pos) );
                    option.movePos = pos;
                }

                function getPage() {
                    if( option.side == 'next' ) {
                        if(option.page<option.total)option.page++;
                        if(!option.infinity&&option.page>=option.total-1) option.page = option.total-1;
                    } else {
                        if(option.page>-1)option.page--;
                        if(!option.infinity&&option.page<0) option.page = 0;
                    }
                }

                function reset(){
                    if(!items) return;
                    el.children().remove();
                    el.append(items);
                    init();
                }

                /**
                 * 변동이 생길때
                 */
                scope.$watch(function(){
                    return option.page
                },function(n,o){
                    if(n==o||n<0||n>option.total-1||!option.total) return;
                    scope.swipeIndex = n;
                    if(option.auto) {
                        clearTimeout(option.autotimer);
                        option.autotimer = setTimeout(function(){
                            option.side="next";
                            draging(50,true);
                        },option.interval)
                    }
                })
                scope.$watch(function(){
                    return option.total;
                },function(n,o){
                    if(n==o) return;
                    scope.swipeTotal = n;
                })

                // 리사이징
                scope.$watch(function(){ return $w.width() },function(n,o){
                    if(!n||n==o) return;
                    if(!items) return;
                    reset();
                },true)
                $w.bind('resize',function(){ scope.$apply() })

                /**
                 * PUBLIC CONTROLLER
                 * @param type
                 */
                scope.swipeController = function(type){
                    switch(type){
                        case "next":
                            option.side="next";
                            draging(window.innerWidth/2,true);
                            break;
                        case "prev":
                            option.side="prev";
                            draging(window.innerWidth/2,true);
                            break;
                        default:
                            if(typeof type != 'number') return;
                            moveX(type,true,true);
                    }
                }

                scope.$watch(function(){
                    return el.children().length
                },function(n,o){
                    console.log('children',n);
                   if(!n||n<2||items) return;
                   $timeout(function(){init()},300);
                });
            }
        }
    }])

    .filter('hwRange', function(){
        return function(n) {
            var res = [];
            for (var i = 0; i < n; i++) res.push(i);
            return res;
        };
    });
})();