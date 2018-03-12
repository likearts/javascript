/**
 * @Autor 박해원
 * @date 20171130
 *
 * @namdoc module
 * @name hwSwipe
 * @description
 * - 스와이프 모듈
 * - 짝수, 홀수 짤림 없음
 * --------------------------------------------------------------
 *   3개씩 스와이프 화면에 개수가 [1,2,3] [4,5,6] [7,8] 일경우
 *   인디케이터 3개 생성되고 마지막 페이지 화면은 [6,7,8]이 됨
 * --------------------------------------------------------------
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
            console.log("%cHWSWIPE", "background: white; color: #e68a97; font-size: 11px; font-weight: 400");
        }])

        /**
         * @ngdoc controller
         * @name hwSwipeCtrl
         */
        .controller( 'hwSwipeCtrl', ['$scope',function($scope){
            this.addStyle = function( id, style ){
                document.styleSheets[0].addRule(id, style );
            }
            this.deleteStyle = function(id){
                var style = document.styleSheets[0];
                if(!style.cssRules.length) return;
                for(var i=0; i<style.cssRules.length; ++i) {
                    if( style.cssRules[i].cssText.indexOf(id) !=-1 ) style.deleteRule(i);
                }
            }
            this.swipe = {
                base : "hwsiwpe_",
                max : 99999,
                get : function(){
                    var date = new Date(),
                        res = date.toISOString().slice(0,10).replace(/-/g,""),
                        h = String(date.getHours()),
                        m = String(date.getMinutes()),
                        s = String(date.getSeconds()),
                        vid = this.base + this.rStr() + this.rNum() + "_"+ res +(h+m+s);
                    return vid.toLowerCase();
                },
                rStr : function(){
                    var str = "",
                        txt = "ABCDEFGHIJKMLNOPQRSTUVWXYZ";
                    for( var i=0; i< 5; i++ ) str += txt.charAt( Math.floor( Math.random() * txt.length ));
                    return str;
                },
                rNum : function(){
                    return String( Math.floor( Math.random() * this.max ) ) + String( Math.floor( Math.random() * this.max) );
                }
            }
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
                controller:'hwSwipeCtrl',
                scope: {swipeIndex:'=?',swipeTotal:'=?',swipeController:'=?'},
                link : function(scope,el,attrs,ctrl){
                    var option = {}, dragevent = false, items, $w = angular.element(window),
                        swipeID = ctrl.swipe.get();

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
                    el.addClass(swipeID);

                    /**
                     * 설정
                     */
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

                    /**
                     * 화면 사이즈별 스와이프 적용 여부
                     */
                    function swipe(){
                        var winWidth = window.innerWidth;
                        if(attrs.w900&&winWidth<=900) option.view = attrs.w900;
                        if(attrs.w640&&winWidth<=640) option.view = attrs.w640;
                        if(attrs.w320&&winWidth<=320) option.view = attrs.w320;
                        if( el.children().length <= option.view ) {
                            option.view = el.children().length;
                            option.swipe=false;
                            dragevent = false;
                            option.wrap.unbind( 'touchstart.hwswipe touchmove.hwswipe touchend.hwswipe' );
                        }
                        else option.swipe=true;
                    }

                    /**
                     * 아이템 정렬, 페이지 생성
                     */
                    function itemAlign(){
                        var len = el.children().length,
                            itemWidth = el.parent()[0].clientWidth/option.view,
                            containerWidth = (itemWidth*len)+(itemWidth*option.view)*2;

                        option.containerWidth = itemWidth*len;
                        option.overWidth = itemWidth*option.view;
                        option.total = Math.ceil(len/option.view);
                        option.itemWidth = itemWidth;

                        angular.forEach(el.children(),function(e){
                            if(e.hasAttribute('ng-repeat')) e.removeAttribute('ng-repeat');
                        });
                        if(!items) items = el.children();

                        var cssContainerRule = "."+swipeID,
                            cssItemRule = "."+swipeID+" > li";

                        // 기존 룰 삭제
                        ctrl.deleteStyle(cssContainerRule);
                        ctrl.deleteStyle(cssItemRule);
                        // 신규 룰 추가
                        ctrl.addStyle( cssContainerRule, 'width:'+containerWidth+'px !important' );
                        ctrl.addStyle( cssItemRule, 'width:'+itemWidth+'px !important; display:block !important; float:left !important; -webkit-box-sizing:border-box' );

                        if(!option.swipe) return;

                        for( var i=0; i<option.total;++i ){
                            var itemgroup = [];
                            for( var s=0; s<option.view;++s) {
                                var cnt=i*option.view+s, item = items[cnt];
                                if(cnt<el.children().length) {
                                    itemgroup.push({left: item.offsetLeft, page: i, index: cnt});
                                }
                            }
                            if(itemgroup.length) option.posx.push(itemgroup);
                        }

                        for( var i=0;i<option.view;++i) copyItems(i,'next');
                        for( var i=items.length-1;i>(items.length-1)-option.view;--i) copyItems(i,'prev');

                        moveX(0);
                    }

                    /**
                     * 좌, 우 각 1페이지 복사
                     * @param index
                     * @param str
                     */
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
                        if(dragevent) return;
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
                                    else setPox( option.movePos )
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
                    
                    /**
                     * 드래그 값 적용
                     * @param posx
                     * @param end
                     */
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

                    /**
                     * 페이지 번호로 이동
                     * @param index
                     * @param easing
                     * @param apply
                     */
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

                    /**
                     * 위치값 적용
                     * @param pos
                     */
                    function setPox(pos){
                        el.css( getEasing(true,pos) );
                        option.movePos = pos;
                    }

                    /**
                     * 이전, 다음 페이지
                     */
                    function getPage() {
                        if( option.side == 'next' ) {
                            if(option.page<option.total)option.page++;
                            if(!option.infinity&&option.page>=option.total-1) option.page = option.total-1;
                        } else {
                            if(option.page>-1)option.page--;
                            if(!option.infinity&&option.page<0) option.page = 0;
                        }
                    }

                    /**
                     * 초기화
                     */
                    function reset(){
                        if(!items) return;
                        el.children().remove();
                        el.append(items);
                        init();
                    }

                    // indicator 갱신
                    scope.$watch(function(){
                        return option.page
                    },function(n,o){
                        if(n==o||n<0||n>option.total-1||!option.total) return;
                        scope.swipeIndex = n;
                        if(option.auto) {
                            clearTimeout(option.autotimer);
                            option.autotimer = setTimeout(function(){
                                option.side="next";
                                draging(window.innerWidth/2,true);
                            },option.interval)
                        }
                    })

                    // 총 페이지 갱신
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


                    var initWatch = scope.$watch(function(){
                        return el.children().length
                    },function(n){
                        if(!n) return;
                        if(n==1) {
                            el.css({display: 'block'});
                            // 4초 뒤에도 목록이 1개면 watch clear
                            $timeout(function(){
                                if( el.children().length == 1) initWatch();
                            },4000)
                            return;
                        }
                        $timeout(function(){
                            initWatch();
                            init();
                        },300);
                    });

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