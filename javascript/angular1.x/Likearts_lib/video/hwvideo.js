/**
 *
 * 비디오 컨트롤 모듈
 * @autor : 박해원
 * @date : 20171110
 *
 * @ngdoc Module
 * @name hwVideo
 * @description
 * - 단독모듈 (연결모듈 없음)
 * - 멀티생성시 중복 재생 비활성 ( 기본값 )
 */
(function(){
    angular.module('hwVideo',[])

    /**
     * @ngdoc service
     * @name hwVideoModel
     * @description
     * - 비디오 모델
     */
        .service('hwVideoModel', ['$q',function($q){
            var self = this;

            /**
             * 비 Angular(app_interface)에서 사용을 위한 추가
             */
            window.hwVideoModel = this;

            /**
             * video id 업데이트
             * hwVideo로 생성된 비디오는 동기업데이트 받음
             * video id 변경시 기존 영상 재생 중지
             *
             * @return object ( deferred )
             */
            this.videoID = {
                _id : null,
                defer : $q.defer(),
                get : function(){
                    return this._id;
                },
                set : function(id){
                    this._id = id;
                    this.defer.notify(id);
                },
                update : function(){
                    return this.defer.promise;
                }
            }

            // 재생,정지 Observer
            this.state_defer = $q.defer();
            this.setState = function(state){
                // lotteCommon -> videoStateModel(service)
                try{ window.videoStateModel.setPlay(state) } catch(e){}
                // notify
                self.state_defer.notify(state);
            }
            this.getState = function(){
                return self.state_defer.promise;
            }

            /**
             * 비디오 아이디 생성
             *
             * @return string
             */
            this.createVideoID = {
                base : "hwvideoID_",
                max : 99999999,
                get : function(){
                    var date = new Date(),
                        res = date.toISOString().slice(0,10).replace(/-/g,""),
                        h = String(date.getHours()),
                        m = String(date.getMinutes()),
                        s = String(date.getSeconds()),
                        vid = this.base + this.rStr() + this.rNum() + "_" + res +(h+m+s);
                    return vid.toUpperCase();
                },
                rStr : function(){
                    var str = "",
                        txt = "ABCDEFGHIJKMLNOPQRSTUVWXYZ";
                    for( var i=0; i< 20; i++ ) str += txt.charAt( Math.floor( Math.random() * txt.length ));
                    return str;
                },
                rNum : function(){
                    return String( Math.floor( Math.random() * this.max ) ) +"_"+ String( Math.floor( Math.random() * this.max) );
                }
            }
        }])

        /**
         * @ngdoc directive
         * @ngname hwVideo
         * @description
         * - 비디오 컨트롤러
         *
         * @Attributes
         *  - auto-play : Boolean 자동재생여부
         * 	# 티클릭
         *  - play-Ticlick : String 재생클릭시 티클릭
         *  - stop-Ticlick : String 정지클릭시 티클릭
         *	- end-Ticlick : String 영상종료시 티클릭
         * 	# 콜백
         *  - start-func : Function 영상 시작시 콜백
         *  - end-func : Function 영상 종료시 콜백
         *  # 재생,정지
         *  - scroll-leave-stop : Boolean 비디오가 스크린영역 벗어날시 정지 여부
         *  - scroll-view-play : Boolean 비디오가 스크린영역에 들어왔을때 '자동재생' 여부
         *
         * @Public
         *  - state : { play:Boolean, mute:Boolean, drag:Boolean, fullscreen:Boolean }
         *  - video : { play:Fnction, pause:Fnction, mute:Fnction }
         *  - progress : String ( 진행률 )
         *  - videotime : String ( 재생시간 )
         *  - waiting : Boolean ( 버퍼 로딩 )
         *  - vctr : Boolean ( 컨트롤 버튼 show, hide )
         *
         *  @Filter
         *  - trustUrl : reutrn String
         *    ex : <source ng-src="{{vitem.videoUrl | trustUrl}}"/>
         *
         *  @Example
         *  <div hw-video auto-play="false" play-Ticlick="playticlick" stop-Ticlick="" end-Ticlick="">
         *      <video poster="{{vitem.posterUrl}}" >
         *          <source ng-src="{{vitem.videoUrl | trustUrl}}"/>
         *      </video>
         *      <div class="video_controller" ng-class="{showVctrl:vctr}"> <!-- control button -->
         *          <div class="control_in_wrap">
         *              <em class="ctr_btn btn_play" ng-class="{btn_pause:state.play}" ng-click="video.play()"></em>
         *              <em ng-if="state.play" class="ctr_btn btn_volume" ng-class="{btn_volume:!state.mute,mute:state.mute}" ng-click="video.mute()"></em>
         *              <em ng-if="state.play" class="ctr_btn btn_arrow"></em>
         *          </div>
         *          <em class="btn_fullscreen" ng-click="video.fullscreen()"></em>
         *      </div>
         *      <div class="video_bottom"> <!-- progress & time -->
         *          <div class="table">
         *              <div class="cell progress">
         *                  <pregress>
         *                      <bar style="width:{{progress}}"/>
         *                      <dragBar seeker/>
         *                  </pregress>
         *              </div>
         *          	<div class="cell timer">
         *          	    <time>{{videotime}}</time>
         *          	</div>
         *         </div>
         *     </div>
         *     <loading ng-if="waiting"></loading> <!-- loading -->
         *  </div>
         */
        .directive( 'hwVideo', ['hwVideoModel','$timeout', function(hwVideoModel,$timeout){
            return {
                link : function( scope, el, attrs){
                    var option = {
                        vobj : el.find('video'),
                        video : el.find('video')[0], // 비디오 엘리먼트
                        controller : el.find(".video_controller"), // 컨트롤러
                        videoID : hwVideoModel.createVideoID.get(), // 비디오 모델
                        startCallBack : false,
                        altmsg : false,
                        buttonCloseDelay : 3000,
                        useplay : false,

                        // 비디오 이벤트
                        eventListener : [
                            'ended',
                            'error',
                            'loadstart',
                            'loadeddata',
                            'loadedmetadata',
                            'loadstart',
                            'pause',
                            'play',
                            'playing',
                            'progress',
                            'seeked',
                            'seeking',
                            'stalled',
                            'timeupdate',
                            'volumechange',
                            'waiting'
                        ],

                        finishCnt: 0, // 재생완료 카운트
                        autoPlay : attrs.autoPlay == "true" ? true : false, // 자동 재생
                        muliPlay : attrs.multiPlay == "true" ? true : false, // 중복 재생 ( 1개 이상일때 )
                        playTiclick : attrs.playTiclick || "", // 플레이 티 클릭
                        stopTiclick : attrs.stopTiclick || "", // 일시정지 티 클릭
                        endTiclick : attrs.endTiclick || "", // 재생종료 티 클릭
                        leaveStop : attrs.scrollLeaveStop == "true" ? true : false, // 스크린영역 벗어나면 재생정지
                        scrollViewPlay : attrs.scrollViewPlay == "true" ? true : false, // 스크롤뷰 자동 재생,
                        itv1:0 // 컨트롤러 타임아웃1
                    };
                    console.log("%cHWVIDEO", "background: white; color: skyblue; font-size: 11px; font-weight: 400");
                    //console.log("%cid:"+option.videoID, "background: white; color: #e68a97; font-size: x-small");

                    /** app_interface.js로 제어되는 비디오 정지 */
                    function videoAllSstop(){
                        try{ $timeout(function(){ angular.element('.btn_move_stop').trigger('click')},500) }
                        catch(e) { }
                    }

                    // 티클릭
                    function tiClick ( str ){
                        if(!str) return;
                        try{ getScope().sendTclick( str ) }
                        catch(e) {};
                    }

                    // 2자리 미만 숫자에 "0" 붙여주기
                    function addZero( n ) {
                        return n<10?'0'+n:n;
                    }

                    // 재생시간 / 총시간 업데이트
                    function showTime(c,t){
                        if( !t ) return;
                        var t_m = addZero(Math.floor(t/60)),
                            t_s = addZero(Math.floor(t%60)),
                            c_m = addZero(Math.floor(c/60)%60),
                            c_s = addZero(Math.floor(c%60));
                        scope.videotime = c_m+":"+c_s+"/"+t_m+":"+t_s;
                        scope.progress = Math.floor(c/t*100)+"%";
                        scope.$apply();
                    }

                    // 컨트롤러 보이기, 숨기기
                    function showController( end ){
                        if(typeof end !="boolean") end = false;
                        // 버튼 활성화
                        scope.vctr = true;
                        try { // 중복실행 방지
                            if(option.itv1) clearTimeout( option.itv1 );
                        } catch(e){}
                        // 재생종료, 재생중이 아닐경우 종료
                        if(end||!scope.state.play) return;
                        // 버튼 비활성
                        option.itv1 = setTimeout(function(){
                            scope.vctr = false;
                        }, option.buttonCloseDelay );
                    }

                    // [기본값] 시간 : 현재/전체
                    scope.videotime = "00:00/00:00";

                    /**
                     * 상태값 관리
                     * @type {{play: boolean, mute: boolean, drag: boolean}}
                     */
                    scope.state = {
                        play : false,
                        mute : false,
                        drag : false,
                        fullscreen : false
                    };
                    // 로딩 활성화
                    scope.waiting = true;

                    /**
                     * 비디오 컨트롤
                     *  @type {{play: function, pause: function, mute: function}}
                     */
                    scope.video = {
                        // 재생
                        play : function(){
                            if( !option.altmsg && !confirm("3G/LTE에서 재생시 데이터 요금이 부과할 수 있으니 유의하세요~") ) return;
                            option.altmsg = true;
                            if (!scope.state.play) option.video.play();
                            else this.pause();
                        },
                        // 일지정지
                        pause: function(){
                            try{ option.video.pause() }
                            catch(e){}
                        },
                        // 음소거
                        mute: function(){
                            option.video.volume = scope.state.mute ? 1 : 0;
                        },
                        // 전체화면
                        fullscreen : function(){
                            var target = el[0], doc = document;
                            if( scope.state.fullscreen ) {
                                if(doc.webkitExitFullscreen) doc.webkitExitFullscreen();
                                else if(doc.mozExitFullscreen) doc.mozExitFullscreen();
                                else if(doc.exitFullscreen) doc.exitFullscreen();
                                scope.state.fullscreen = false;
                            } else {
                                try{
                                    if(getMobileIs()){
                                        option.video.webkitEnterFullscreen();
                                        return;
                                    }
                                } catch(e){}
                                if(target.webkitRequestFullscreen) target.webkitRequestFullscreen();
                                else if(target.mozRequestFullScreen) target.mozRequestFullScreen();
                                else if(target.requestFullscreen) target.requestFullscreen();
                                scope.state.fullscreen = true;
                            }
                        },
                        // 재생시간
                        totalTime:0
                    };
                    // 자동재생일경우 "3g데이터 메시지 노출 안함"
                    if(option.autoPlay) option.altmsg = true;

                    // 비디오 아이디 업데이트 알림
                    hwVideoModel.videoID.update().then(null,null,function(res){
                        if(option.muliPlay) return; // 멀티재생 가능이면 종료
                        // 자신의 아이디가 아니면 재생정지
                        if( res != option.videoID ) scope.video.pause();
                    });

                    /**
                     * #### ATTRIBUTES ####
                     * @type {{playsinline: string, webkit-playsinline: string, webkitEnterFullscreen: string, preload: boolean}}
                     */
                    var video_props = {
                        'playsinline':'playsinline',
                        'webkit-playsinline': 'webkit-playsinline',
                        'webkitEnterFullscreen': 'webkitEnterFullscreen',
                        'preload': true
                    }
                    if(option.autoPlay) {
                        video_props.autoplay = true;
                        video_props.muted = true; // 자동재생시 muted 속성 필수
                    }
                    option.vobj.attr(video_props);


                    option.video.addEventListener('contextmenu',
                        function(e){
                            e.preventDefault();
                            e.stopPropagation();
                        },false);

                    if(option.video.hasAttribute("controls")) option.video.removeAttribute("controls");

                    // 비디오 이벤트 등록
                    for( var i in option.eventListener ) option.video.addEventListener( option.eventListener[i], videoEvent );

                    /**
                     * 비디오 이벤트
                     * @description
                     * - 외부에서 제어
                     * ex : { angular.element('video')[0].play() or pause() }
                     *
                     * @param e:Object
                     */
                    function videoEvent(e) {
                        //console.log(e.type);
                        switch(e.type) {

                            /**
                             * ###############################
                             * ###### 데이터 로드 완료 #######
                             * ###############################
                             */
                            case "loadedmetadata":
                                el.find('video').addClass('init');
                                option.startCallBack = false;
                                // 로딩 비활성
                                if(scope.waiting) scope.waiting = false;
                                // 총 재생 시간
                                showTime(0,option.video.duration);
                                scope.video.totalTime = option.video.duration;
                                // autoPlay : 초기 자동 재생,
                                if( (!option.finishCnt && option.autoPlay) || scope.state.play ) option.video.play();
                                else {
                                    scope.vctr = true;
                                    // 같은 주소로 갱신될때 설정 변경 않되는 문제로 추가
                                    scope.state.play = false;
                                    showController(true);
                                }
                                break;

                            /**
                             * ###############################
                             * ############ 재생 #############
                             * ###############################
                             */
                            case "play":
                                if(!option.altmsg) option.altmsg = true;
                                videoAllSstop(); // 임시
                                // 로딩활성화
                                scope.waiting = true;
                                // 상태값 변경
                                scope.state.play = true;
                                // 자동재생시 컨트롤러 보이지 않도록 ( 최초 재생시에만 )
                                if(!option.autoPlay) showController(false);
                                // 오토플레이 비활성
                                option.autoPlay = false;
                                // 재생티클릭
                                tiClick(option.playTiclick);
                                if(!option.muliPlay) hwVideoModel.videoID.set(option.videoID);

                                try{ // 재생시 실행할 콜백 함수가 있으면 실행
                                    if(attrs.startFunc && !option.startCallBack) {
                                        option.startCallBack = true;
                                        scope[attrs.startFunc]()
                                    }
                                } catch(e){}

                                scope.$apply();
                                break;

                            /**
                             * ###############################
                             * ########## 일시정지 ###########
                             * ###############################
                             */
                            case "pause":
                                // 상태값 변경
                                scope.state.play = false;
                                // 정지티클릭
                                tiClick(option.stopTiclick);
                                // 컨트롤러 보이기
                                showController();

                                scope.$apply();
                                break;

                            // 재생중 ( 정상재생시 )
                            case "playing": break;

                            /**
                             * ###############################
                             * ######### 영상종료시 ##########
                             * ###############################
                             */
                            case "ended":
                                // 재생종료 티클릭
                                tiClick(option.endTiclick);
                                var vurl = option.video.currentSrc,
                                    totalTime = option.video.duration;
                                if(scope.state.play) scope.video.pause();

                                // 재생완료 카운트
                                option.finishCnt++;
                                // 초기화
                                option.video.src = '';

                                // .5초 후 리셋
                                $timeout(function(){
                                    option.video.src = vurl;
                                    showTime(0,totalTime);
                                },500);
                                option.startCallBack = false;

                                // 영상 종료 콜백 함수가 있을경우 실행
                                try{ if(attrs.startFunc) scope[attrs.endFunc]() }
                                catch(e){}
                                break;

                            /**
                             * ###############################
                             * ###### 재생시간 변경시 ########
                             * ###############################
                             */
                            case "timeupdate":
                                // 로딩 비활성
                                if(scope.waiting) scope.waiting = false;
                                showTime( option.video.currentTime, option.video.duration );
                                break;

                            /**
                             * ###############################
                             * ######## 볼륨변경시 ###########
                             * ###############################
                             */
                            case "volumechange":
                                scope.state.mute = !option.video.volume ? true : false;
                                if( option.video.volume ) {
                                    try{ if(option.video.hasAttribute("muted")) option.video.removeAttribute("muted") }
                                    catch(e){}
                                }
                                break;

                            /**
                             * ###############################
                             * ########### 대기 ##############
                             * ###############################
                             */
                            case "waiting":
                                // 로딩 활성화
                                scope.waiting = true;
                                break;

                            /**
                             * ###############################
                             * ########### 에러 ##############
                             * ###############################
                             */
                            case "error":
                                console.log('[error]',e);
                                break;
                        }
                    }

                    /**
                     * Platform
                     * @description
                     * - Mobile 접속 확인용
                     *
                     * @return {boolean}
                     */
                    function getMobileIs(){
                        var filter = "win16|win32|win64|mac", r = false;
                        if(navigator.platform){
                            if(0 > filter.indexOf(navigator.platform.toLowerCase())){
                                r = true;
                            }
                        }
                        return r;
                    }

                    /**
                     * 비디오 재생 위치(시간) 변경
                     * 하위 디렉티브 seeker -> moveSeeker에서 call
                     * @param s : number
                     * @param e : number
                     * @param play : boolean
                     */
                    scope.vseek = function(s,e,play){
                        var currentSeek = Math.abs( s/e*option.video.duration );
                        option.video.currentTime = currentSeek;
                        if(play&&!scope.state.play) scope.video.play();
                    }

                    // 비디오영역 클릭 이벤트 추가
                    option.controller.bind('click.hwvideo',showController);

                    // [좌,우] 화면에서 벗어나면 정지 ( 스와이프, 슬라이더안에서 재생될 경우 )
                    scope.$watch(function(){
                        return el.offset().left
                    },function(n,o){
                        if(n==o) return;
                        var winw = window.innerWidth,
                            vw = el[0].offsetWidth-10;
                        if( scope.state.play && (n <= -vw || n >= winw) ) scope.video.pause();
                    });
                    // [위,아래] 스크롤시 화면에서 들어올때 재생(option.scrollViewPlay), 벗어날때 정지(option.leaveStop)
                    if(option.leaveStop||option.scrollViewPlay) {
                        scope.$watch(function(){
                            return window.scrollY
                        },function(n,o){
                            if (n == o) return;
                            var scrollY = n,
                                top = el.offset().top,
                                screenH = window.innerHeight;
                            // 화면에 들어오면 자동 재생
                            if ((scrollY + screenH) > top && (scrollY - screenH) < top) {
                                if (option.scrollViewPlay && !scope.state.play) scope.video.play();
                            }
                            // 화면에서 벗어나면 정지
                            else {
                                if (option.leaveStop && scope.state.play) scope.video.pause();
                            }
                        });
                    }

                    // 재생중 영상주소 변경될 때
                    scope.$watch(function(){
                        return option.video.currentSrc
                    },function(n,o){
                        if(n==o||!scope.state.play||!n) return;
                        // 일시정지로 변경
                        scope.video.pause();
                        // 이벤트 미 발생시 상태값 변경 않되기 때문에 추가
                        scope.state.play = false;
                    });

                    // 비디오 리사이징 체크
                    scope.$watch(function(){
                        var h = 0;
                        try{ h = Math.ceil( el.find('video')[0].clientHeight) } catch(e) {};
                        return h;
                    },function(n,o){
                        // 여백이 남지 않도록 비디오 사이즈에 마춰 컨테이너 사이즈 조정
                        if(n!=o&&n) el.find(".video_controller").css({height:n+"px"});
                    });

                    // 비디오 재생상태 변경될때
                    scope.$watch( 'state.play', function(n,o){
                        if(n==o) return;
                        hwVideoModel.setState(n);
                    });
                }
            }
        }])

        /**
         * @ngdoc directive
         * @ngname seeker
         * @description
         *  - 비디오 프로그레스 바
         */
        .directive('seeker',[function(){
            return {
                link : function(scope,el){
                    var touchX = 0, // 드래그 위치
                        posX =0, // 바 위치
                        limitX = getLimitX(); // 드래그 최대치

                    function getLimitX(){
                        return el.parent().parent()[0].clientWidth - el[0].clientWidth;
                    }

                    // 드래그 이벤트
                    el.bind('touchstart.hwvideoSeeker touchmove.hwvideoSeeker touchend.hwvideoSeeker', function(e){
                        var touchObj = e.originalEvent.changedTouches[0];
                        switch(e.type){
                            case "touchstart": // 터치시
                                e.stopPropagation();
                                scope.state.drag = true;
                                el.addClass('drag');
                                touchX = touchObj.clientX;
                                break;
                            case "touchmove": // 터치 이동
                                el.addClass('drag');
                                var cx = touchObj.clientX - touchX;
                                moveSeeker( cx );
                                break;
                            case "touchend": // 터치 종료
                                el.removeClass('drag');
                                var cx = touchObj.clientX - touchX;
                                moveSeeker( cx, true );
                                scope.state.drag = false;
                                break;
                        }
                    });

                    // 재생 퍼센트 변경시 마다 드래그바 위치 변경
                    scope.$watch( 'progress', function(n,o){
                        limitX = getLimitX();
                        if(n!=o && !scope.state.drag ) {
                            var p = n.replace('%',''),
                                c = p/100*limitX,
                                x = c/(limitX+el[0].clientWidth)*100;
                            el.css({left:x+"%"});
                            if( isNaN(c) ) return;
                            posX = -c;
                        }
                    });

                    // 재생시간이 있을경우에만 드래그바 표시
                    el.css({display:'none'});
                    scope.$watch( 'video.totalTime', function(n,o){
                        if(n!=o && n > 0 ) el.css({display:''});
                    });

                    // 터치 드래그시 바 위치 변경 및 재생
                    function moveSeeker( pos, end ){
                        var cp = posX-pos;
                        if( cp < -limitX || cp > 0 ) return;
                        el.css({left:-cp+"px"});
                        // 재생중이면 드래그 위치에서 바로 재생
                        if(scope.state.play) scope.vseek( cp, limitX );
                        // 재생중이 아니면 드래그가 끝난 후 해당 위치에서 재생
                        if(end) {
                            posX = cp;
                            if(!scope.state.play) scope.vseek( cp, limitX, true );
                        }
                    }
                }
            }
        }])
        .filter('trustUrl', ['$sce', function($sce) {
            return function (vUrl) {
                return $sce.trustAsResourceUrl(vUrl);
            };
        }]);
})();