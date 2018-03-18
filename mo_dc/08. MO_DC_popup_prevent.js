/**
 * @Autor 박해원
 * @Date 20171121
 *
 * @ngdoc Module
 * @name PreventPop (extends lotteComm)
 * @description
 * - 고객이탈방지 팝업제어
 * - 메인, 기획전 : 5초 이상 사용자 무 반응일때
 * - 상세페이지 : 10초 이상 사용자 무 반응일때
 * - 동영상 재생중일때는 카운트 하지 않음
 */
(function(){
    angular.module('PreventPop',[])

    /**
     * @ngdoc run
     * @description
     * - 이탈방지 팝업 오픈 타이머
     */
    .run(['popupOpenTimer','LotteCookie','commInitData',function(popupOpenTimer,LotteCookie,commInitData){
        //console.log("%cLOTTE.COM", "background: white; color: #719cff; font-size: 70px; font-weight: bold; letter-spacing:-30px");

        // 등록된 쿠기가 있는지 확인
        var leavePop_cookie = LotteCookie.getCookie("blockingLeavePopup");
        
        // 체널 코드 우선사용 없을경우 쿠키 'CHLNO' 사용
        if( !leavePop_cookie && ( commInitData.query.cn || LotteCookie.getCookie('CHLNO') ) ) {
           window.onload = function () {
               var s = '<style> #keep_popup { -webkit-animation:showKeeppop cubic-bezier(1, 0, 0, 1) .8s both; animation:showKeeppop cubic-bezier(1, 0, 0, 1) .8s both } @-webkit-keyframes showKeeppop{ 0% { -webkit-transform:scale(1.5); opacity:0 } 100% { -webkit-transform:scale(1); opacity:1} @keyframes showKeeppop{ 0% { transform:scale(1.5); opacity:0 } 100% { transform:scale(1); opacity:1} </style>';
               angular.element('head').append(s);
               popupOpenTimer.init();
           }
        } else {
           // console.log( '쿠기 : '+leavePop_cookie, '체널코드 : '+(commInitData.query.cn || LotteCookie.getCookie('CHLNO')) );
        }
    }])
    
    /**
     * @ngdoc service
     * @ngname videoStateModel
     * @description
     * - 비디오 재생 상태 이벤트 모델
     *
     * app_interface.js, lotte_video.js, hwvideo.js에 적용됨
     */
    .service('videoStateModel', ['$q',function($q){
        var self = this;

        this.vdefers = $q.defer();
        this.play_state = false;

        this.setPlay = function(state,vid) {
            self.play_state = state;
            self.vdefers.notify(state);
            // hwvideo.js 비디오 아이디 갱신, hwvideo로 생성된 비디오가 재생중이면 정지
            try{ if(vid&&state) window.hwVideoModel.viodeID.set(vid) } catch(e) {}
        }

        this.getState = function(){
            return self.vdefers.promise;
        }

        /**
         * 비 Angular(app_interface)에서 사용을 위한 추가
         */
        window.videoStateModel = this;
    }])

    /**
     * @ngdoc drective
     * @name videoButtonEvent
     * @description
     * -버튼 그룹에 Directive로 줄경우
     */
    .directive('videoButtonEvent',['videoStateModel',function(videoStateModel){
        return function(scope) {
            scope.videoState = function(type){
                videoStateModel.setPlay( type=="play"?true:false );
            }
        }
    }])

    /**
     * @ngdoc service
     * @name MainPopModel
     * @description
     * - 팝업관리 ( 메인, 기획전, 상세 )
     * - 메인, 기획전 : 5초동안 사용자 반응 없을때 오픈
     * - 상세 : 10초동안 사용자 반응 없을때 오픈
     */
    .factory('popupOpenTimer', ['LotteCommon','commInitData','$http','videoStateModel', 'LotteCookie','LotteStorage',
        function(LotteCommon,commInitData,$http,videoStateModel,LotteCookie,LotteStorage){

        var config = {
            _timer : 0, // 타입아웃 인터벌
            _ready : false, // 팝업 띄울 준비가 되었는지
            _close : false, // 팝업 종료

            _pg_cd : 0, // 유입 코드
            _pop_type : 0, // 팝업 타입
            _types : ["product","planshop"], // ["product","planshop","banner"] 3번 미사용으로 변경

            // 시간설정 유입코드에 따라 팝업 띄우는 시간
            _delay : {
                "10":5000, //메인
                "20":10000,//상세
                "30":5000 //기획전
            },

            // 티클릭 관리
            _tclick : {
                open : function(n){ // 오픈시 티클릭만 신규
                    return "m_DC_PausePop"+n+"_pv";
                }
            },

            /**
             * 타이머 시작
             * @param state
             */
            ready : function( state ){
                if(config._timer) clearTimeout(config._timer);
                if(!state || !config._pg_cd || config._close || videoStateModel.play_state ) return;

                config._timer = setTimeout(function(){
                    config.eventCall({
                        eventTime:new Date().getTime(),
                        type:config._types[config._pop_type],
                        cn:commInitData.query.cn || LotteCookie.getCookie('CHLNO')
                    });
                }, config._delay[config._pg_cd] );
            },

            setCookie : function(name,val,exprire) {
                LotteCookie.setCookie(name, val, exprire );
            },

            /**
             * 터치 이벤트 및 팝업 타이머 시작
             * @param item
             */
            event : function(item) {
                var use_cd = false;

                // 유효(10:메인,20:상세,30:기획전) pg_cd인지 확인
                for( i in config._delay ) if( i == item.pg_cd ) use_cd = true;

                if(use_cd) {
                    config._pg_cd = item.pg_cd;
                    // 팝업 타이머 시작
                    config.ready(true);
                    // 스크린 터치 이벤트
                    config.response(true);
                } else {
                    console.log('[유입코드 오류] 유효코드:10(메인),20(상세),30(기획전)',item);
                }
            },

            /**
             * 타임 초기화
             * @description
             * - 사용자 반응시 오픈타임 초기화
             * - 체크 이벤트
             *    click,
             *    mouseenter,
             *    touchstart,
             *    touchmove,
             *    touch,
             *    touchend,
             *    scroll
             *   
             * @param state : boolean
             */
            response : function(state){
                if( state ) {
                    angular.element(window).bind('click.prevent mouseenter.prevent touchstart.prevent touchmove.prevent.prevent touch.prevent touchend.prevent scroll.prevent', function(e){
                        if(!config._close) config.ready(true)
                    });
                    // 이벤트 삭제는 scroll만 빼고 ( scroll이벤트는 삭제시 다른곳에 영향을 줄 수 있음 )
                } else angular.element(window).unbind('click.prevent mouseenter.prevent touchstart.prevent touchmove.prevent.prevent touch.prevent touchend.prevent');
            },
            clear : function(){
                config.response(false);
                config.ready(false);
                config._close = true;
            },
            
            /**
             * 대상 페이지 확인
             * @return {*}
             */
            readPage : function(){
                var pathName = location.pathname,
                    openPath = [
                        [LotteCommon.mainUrl,10], //메인
                        [LotteCommon.prdviewUrl,20], //상세
                        [LotteCommon.productviewUrl,20], //상세
                        [LotteCommon.searchUrl,20], //통합 검색 페이지 :: 18.01.30일 배포 
                        [LotteCommon.prdlstUrl,30] //기획전
                    ],
                    openFlag=false, popNo=0, ch=0;

                for(var i =0; i<openPath.length;++i) {
                    if( !openFlag && openPath[i][0].indexOf(pathName) != -1 ) {
                        ch = openPath[i][1];
                        openFlag = true;
                    }
                }

                return {ch:ch,popNo:popNo};
            },

            /**
             * 팝업 타입 및 오픈 여부 데이터
             * @param data
             */
            eventCall : function( data ){

                var callData = function( type ){
                    // getScope().isOpenPop = false; // main_popup.js 팝업 닫기
                    // 1일 1회 ( 닫기 버튼 클릭시 3일동안 미노출 )
                    config.setCookie("blockingLeavePopup",1,1);
                    // 오픈 티클릭
                    getScope().sendTclick(config._tclick.open(type));
                    // 팝업오픈
                    openKeepPop(type);
                }

                // 테스트 모드일경우
                try {
                    if (location.hash.indexOf("popTest") != -1) {
                        console.log('## [이탈방지] TESTMODE ##');
                        callData();
                        return;
                    }
                }catch(e){}

                $http({
                    url:LotteCommon.keepPopDataCall,
                    params:data,
                    method:'GET'
                }).success(function(res){
                    config.clear();
                    try{
                        // 오픈여부값이 'Y'이고 팝업 타입이 1~3 까지일경우 팝업 오픈
                        if( res.keep_stay.open == "Y" ) {
                           //callData( res.keep_stay.type );
                            callData( config._pop_type ); // 개발수정 전까지 2번 고정
                        }
                    } catch(e){}
                });
            },
            
            /**
             * 초기실행
             */
            init: function(){
                console.log('[이탈방지팝업]');
                var chcode = config.readPage();
                if( !chcode ) return;
                	
                // 팝업유형 랜덤 types
                var popNo = Math.floor(Math.random()*config._types.length) +1;
                console.log('#01 popNo v3',popNo);
                // 최근본 상품이 없으면 무조건 2번 팝업
                if( !LotteStorage.getLocalStorage('latelyGoods') ) popNo = 2;
                console.log('#02 popNo v3',popNo);
                // 팝업 타입
                config._pop_type = popNo;
                config.event({pg_cd:chcode.ch});

                // 페이지에 비디오가 있으면 재생중일때 타이머 정지
                videoStateModel.getState().then(null,null,function(res){
                    console.log( '비디오 상태', res, typeof res );
                    if(typeof res != 'boolean') return;
                    // 팝업이 뜨고 비디오가 플레이 중이면 팝업종료
                    if(res) getScope().keepPopClose(true);
                    // 타임아웃 리셋
                    config.ready(!res);
                });
            }
        }
        return config;
    }])
})();