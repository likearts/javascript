


(function(window, angular, undefined) {
    'use strict';

    /**
     * @ngdoc overview
     * @name app.Main
     * @description
     * main_ellotte_phone.js<br/>
     * 엘롯데 메인
     */
    var app = angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteSideMylotte',
        'lotteCommFooter',
        'lotteNgSwipe',
        'lotteSlider',
        'lotteProduct',
        'lotteMainPop',
        'lotteSaleBestList',
        // 201710 백화점 라이브 추가 :: 박해원
        'StoreLive', 
        'storeliveComm' 
    ]);
    
    mainApp = app; // 외부에서 사용될 전역
    
    app.filter('pageRange', [function () {
        return function (items, page, pgsize) {
            var newItem = [];

            for (var i = 0;i < items.length; i++) {
                if (page * pgsize <= i && (page+1) * pgsize > i) {
                    newItem.push(items[i]);
                }
            }
            return newItem;
        }
    }]);

    app.filter('dispRange', [function () {
        return function (items, size) {
            var newItem = [];

            if (items != null && items != undefined) {
                if (items.length) {
                    var line = parseInt(items.length/size);
                    var range = line * size;

                    for (var i =0;i < range;i++) {
                        newItem.push(items[i]);
                    }
                }
            }

            return newItem;
        }
    }]);

    app.filter('limitRange', [function () {
        return function (items, size) {
            var newItem = [];

            if (items != null && items != undefined) {
                if (items.length) {
                    var range = size;

                    if (items.length < range) {
                        range = items.length;
                    }

                    for(var i =0;i < range;i++) {
                        newItem.push(items[i]);
                    }
                }
            }

            return newItem;
        }
    }]);

    app.filter('evenPaging', [function () {
        return function (items) {
            var newItem = items;

            if (items.length%2 != 0) {
                newItem.splice((items.length-1),1);
            }

            return newItem;
        }
    }]);

    // 링크 unsafe 문제 해결을 위해
    app.config(['$compileProvider', function ($compileProvider) {
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|tel):/);
        // Angular before v1.2 uses
        // $compileProvider.urlSanitizationWhitelist(...)
    }]);

    /**
     * @ngdoc object
     * @name app.contorller:MainCtrl
     * @description
     * 엘롯데 메인 컨트롤러
     */
    app.controller('MainCtrl', ['$window', '$rootScope', '$scope', '$http', '$timeout', '$interval', '$location', 'LotteCommon', 'commInitData', 'LotteStorage', 'SaleBestListSvc', 'LotteCookie', 'storeliveService',
        function ($window, $rootScope, $scope, $http, $timeout, $interval, $location, LotteCommon, commInitData, LotteStorage, SaleBestListSvc, LotteCookie, storeliveService) {
            $scope.showWrap = true;
            $scope.contVisible = true;
            $scope.smartNoticeShow = false;
            $scope.productMoreScroll = true;
            $scope.pageLoading = true;
            $scope.reSearchLoading = false;
            $scope.winWidth = angular.element($window).width(); // 윈도우 넓이
            $scope.holidayBnr = false; // 명절 상단 띠배너 표시 여부
            $scope.holidayHotFlag = false; // 명절 hot Flag 노출 설정
            $scope.eventBnrFlag = false; // 황금연휴 3종 쿠폰안내 배너 노출 (1/25 09:00 ~ 2/2 23:59)
            $scope.appLpotIconFlag = true; // 엘팟 아이콘 노출 여부
            $scope.mainTemplateType = "";
            $scope.screenID = "main";
            $scope.unitLoadinginit=false;

			
				

            // home
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5538657
            // 브랜드 [데이터 없음]
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5538658
            // 플러스딜
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5538659&opt=1
            // 5538659 5542202
            // 백화점 라이브
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5581401
            // 테마샵
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5538665
            // 단골지점
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5538661
            // 이벤트
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5538664
            // 맞춤추천
            // http://molocal.ellotte.com/json/main/main_contents.json?dispNo=5538667&viewGoods=163265701,157519003
            // 루트메뉴
            // http://molocal.ellotte.com/json/root_menu.json
            $scope.previewDate = commInitData.query['preview'];
            /**
             * @ngdoc function
             * @name MainCtrl.function:getMenu
             * @description
             * 엘롯데 메인 메뉴 json 데이터 로드 및 메뉴 세팅
             */
            $scope.mainMenu = [];
            $scope.TCLICK_PREFIX = "main-5494835_";

            /**
             * 안드로이드 엘팟 아이콘 노출 여부screenData.brand_plan_list
             * 2017.04.03 김낙운
             * 요건
             - 1.APP초기 진입 시
             - 2.1분 후 숨김처리
             - 3.엘팟 아이콘 스크롤시 비노출
             - 4.엘팟 아이콘 메인 화면 벗어날 경우
             - 5. 검색레이어 오픈시 비노출
             */
            function appLpotIcon() {

                // 1.APP초기 진입 시 : 플래그 체크, 안드로이드 체크, 버젼체크(1.8.6 이상)
                if ($scope.appLpotIconFlag == true && $scope.appObj.isApp && $scope.appObj.isAndroid && $scope.appObj.verNumber >= 186) {
                    try {
                        window.lottebridge.lpot(true);
                    } catch (e) {}
                }

                // 2.1분 후 숨김처리
                $timeout(function () {
                    if ($scope.appLpotIconFlag == true && $scope.appObj.isApp && $scope.appObj.isAndroid && $scope.appObj.verNumber >= 186) {
                        try {
                            window.lottebridge.lpot(false);
                        } catch (e) {}
                    }
                }, 60000);
            }

            function getAddZero(num) { // 날짜 한자리로 나올경우 0을 붙여 두자리수로 만들기 위한 Func
                return num < 10 ? "0" + num : num + "";
            }

            function arrayMatchString(arr, str) { // 배열에서 Str 요소가 있는지 검사
                var i = 0,
                    matchFlag = false;

                for (i = 0; i < arr.length; i++) {
                    if (arr[i] == str) {
                        matchFlag = true;
                        break;
                    }
                }

                return matchFlag;
            }

            function getTime(Year, Month, Day, Hour, Min, Sec) { // Timestemp 구하기
                var date = new Date(Year, Month, Day, Hour, Min, Sec);

                if (Year && Month && Day) {
                    date.setFullYear(Year);
                    date.setMonth(Month - 1);
                    date.setDate(Day);

                    if (Hour) {
                        date.setHours(Hour);
                    }

                    if (Min) {
                        date.setMinutes(Min);
                    }

                    if (Sec) {
                        date.setSeconds(Sec);
                    }
                }

                return date.getTime();
            }

            var todayDateTime = new Date(),
                todayDate = todayDateTime.getFullYear() + getAddZero(todayDateTime.getMonth() + 1) + getAddZero(todayDateTime.getDate()), // getFullYear() : 년, getMonth() : 월, getDate() : 일 - 오늘 날짜
                todayTime = todayDateTime.getTime(); // TimeStemp - 19700101 ~ 오늘날짜까지의 밀리 초 수

            if (commInitData.query["testDate"]) { // 날짜 설정으로 운영되는 요소에 대한 테스트 코드
                var testDateStr = commInitData.query["testDate"];
                todayDate = commInitData.query["testDate"]; // 년월일
                todayTime = getTime(
                    todayDate.substring(0, 4), // 년
                    todayDate.substring(4, 6), // 월
                    todayDate.substring(6, 8), // 일
                    todayDate.substring(8, 10), // 시간
                    todayDate.substring(10, 12), // 분
                    todayDate.substring(12, 14)); // 초
            }
            // 탭 비노출 처리 (테스트중인 탭이 노출되는 항목을 막기 위함)
            $scope.disableTabDispNo = [];
            // ◆명절 - 탭, 페이지 노출 시간 영역
            if ((todayTime < getTime(2018, 1, 11, 15) || todayTime >= getTime(2018, 2, 13, 24))) {  // 2018.1.11 15:00 ~ 2018.2.13 23:59
                $scope.disableTabDispNo.push("5550815"); // 명절탭 20161229  // 20170124 노출날짜 수정
            }
            // ◆명절 - hot Flag 노출 설정(항상 노출)
            if (todayTime > getTime(2018, 1, 11) || todayTime < getTime(2018, 2, 13)) { // 2018.1.11 ~ 2018.2.13
                $scope.holidayHotFlag = false;
            }
            // ◆명절 - 상단 띠배너 표시 여부 (홈탭에서 사용x) 1/8 11:00 ~ 2/4 00:00
            if ((todayTime >= getTime(2016, 1, 8, 13) && todayTime < getTime(2016, 2, 4)) || commInitData.query['holidayBnr'] == "Y") {
                $scope.holidayBnr = true;
            }
            $scope.newVer = false;
            if(todayTime >= getTime(2017, 12, 1)){
                $scope.newVer = true;
            }  
            // top 배너
            $scope.bannerShow = function(sy, sm, sd, ey, em, ed){
                var flag = false;
                if (todayTime >= getTime(sy, sm, sd) && todayTime < getTime(ey, em, ed)) {
                    flag = true;
                }
                return flag;
            }

            // ◆명절 - 황금 연휴 3종 쿠폰 안내 배너 노출 (홈탭에서 사용x) (1/25 09:00 ~ 2/2 23:59)
            if ((todayTime >= getTime(2016, 1, 25, 9) && todayTime < getTime(2016, 2, 3)) || commInitData.query['eventBnr'] == "Y") { // 2016.01.25 09:00 ~ 2016.02.02 23:59
                $scope.eventBnrFlag = true;
            }

            // 반응형을 위한 윈도우 넓이 계산
            angular.element($window).on("resize.main orientationchange.main", function (e) {
                $scope.winWidth = angular.element($window).width();
            });

            console.log( "###### LotteCommon.mainTabsData :: ", LotteCommon.mainTabsData );
            $scope.getMenu = function () {
                $http.get(LotteCommon.mainTabsData)
                    .success(function (data) {
                        var menuArr = [],
                            i = 0;

                        for (i = 0; i < data.root_menu.length; i++) {
                            // 비노출 탭 DipsNo 추가 걸러내기
                            if (!arrayMatchString($scope.disableTabDispNo, data.root_menu[i].disp_no)) {
                                menuArr.push(data.root_menu[i]);
                            }
                        }

                        $scope.mainMenu = menuArr;

                        if ($scope.pageOptions.dispNo != 0) {
                            $scope.findMenuNodeIdx($scope.pageOptions.dispNo);
                        }

                        if ($scope.pageOptions.unitNo != 0 && $scope.pageOptions.dispNo != 0) {
                            $scope.mainTemplateType = $scope.pageOptions.unitNo;
                            $scope.pageOptions.dispNo = $scope.pageOptions.dispNo;
                            $scope.screenID = "main-"+ $scope.pageOptions.dispNo;
                            $scope.sendTclick($scope.tClickBase+'menu_Clk_Lnd_'+$scope.pageOptions.dispNo);
                        } else if ($scope.mainMenu[$scope.pageOptions.nodeIdx]) {
                            $scope.mainTemplateType = $scope.mainMenu[$scope.pageOptions.nodeIdx].tmpl_no;
                            $scope.pageOptions.dispNo = $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                            $scope.screenID = "main-"+ $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                            $scope.sendTclick($scope.tClickBase+'menu_Clk_Lnd_'+$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no);

                            $timeout(function () {
                                $scope.moveMenuSwipeFnc($scope.pageOptions.nodeIdx, true);
                            }, 300);
                        }

                    }).error(function (data) {
                    console.log('Error Data : 데이터 로딩 에러');
                    $scope.pageLoading = false;
                });
            };

            /**
             * @ngdoc function
             * @name MainCtrl.function:findMenuNodeIdx
             * @description
             * 전시 번호로 메뉴 인덱스 찾기
             * @param {Number} disp_no 전시번호
             */
            $scope.findMenuNodeIdx = function (disp_no) {
                for (var i = 0;i < $scope.mainMenu.length; i++) {
                    if ($scope.mainMenu[i].disp_no == disp_no) {
                        $scope.pageOptions.nodeIdx = i;
                        $scope.screenID = "main-"+$scope.mainMenu[i].disp_no;
                        // console.log($scope.pageOptions.nodeIdx);
                        break;
                    }
                }
            };

            /*
             * 메인에서 사용하는 데이터
             * mix_banner : 배너 mix 여부
             * marketing_banner_list : 마케팅 배너
             * planshop_banner_list : 기획전 배너
             * card_banner_list : 카드행사 배너
             * shoppingholic_banner_list : 쇼핑홀릭 배너
             * plusdeal_goods_list : 플러스 딜 상품
             * event_banner_list : 이벤트 배너
             * custom_recomm_prod_list : 맞춤추천 상품
             * brand_planshop_list : 브랜드 기획전 배너
             * shoppingholic_list : 쇼핑홀릭
             * new_brand_list : 신규 브랜드
             * best_brand_list : 베스트 브랜드
             * card_banner_list : 카드행사 배너
             * marketing_banner_list : 마케팅 배너
             * event_banner_list : 이벤트 배너
             * deal_goods_list : 딜 상품
             * smartpick_banner_list : 스마트픽 기획전 배너
             * dept_store : 지점 정보
             * branch_img_banner : 단골지점 이미지
             * dm_coupon_book : 지점 DM 쿠폰북
             * planshop_banner : 기획전 배너
             * dept_live_banner : 백화점 Live 배너
             * best_goods_list : 지점 인기상품 BEST 20
             * receipt_event_banner_list : 영수증 이벤트 배너
             * marketing_banner_list : 마케팅 배너
             * saun_event_list : 이벤트 배너
             * late_view_prod_list : 최근 본 상품
             * today_custom_recomm_prod_list : 오늘의 맞춤 추천 상품
             * realtime_best_prod_list : 실시간 BEST 상품
             * summary_policy_banner_list : 실시간 BEST 안내영역
             *2018 홈탭 리뉴얼 신규 
             * top_cate_list : 탑 카테고리 리스트
             * top_brand : 탑브랜드
             * brand_pick : 브랜드픽
             * shopping_holic : 홈텝 쇼핑 홀릭
             * home_dpts_live : 홈탭 백화점 라이브
             * home_theme_plan : 홈탭 테마 기획전
             * home_theme_plan_list : 테마 기획전 선택 탭 데이터
             * new_prod_list : 레코벨 추천기획전 신규 
             * 롯데닷컴 메인 딜형 구조
             * ban_list : 베너리스트
             * prd_deal_list : 상품유닛 (사용 하는지 체크 필요)
             *
            */
            $scope.eventStatus = {'001':'준비중', '002':'마감임박', '003':'진행중', '004':'결과준비중', '005':'지급준비중', '006':'당첨자결과보기', '007':'지급완료', '008':'마감'}
            /**
             * @ngdoc function
             * @name MainCtrl.function:optionDataReset
             * @description
             * 옵션 데이터 리셋
             */
            $scope.optionDataReset = function () {
                $scope.smartNotice = [];
                $scope.storedData = [];
                $scope.pageOptions = {
                    isLogin: false,
                    nodeIdx: 0,
                    plusDealOrder: 0,
                    dispNo:0,
                    curMenuDispNo: "", // 현재 탭 전시번호
                    unitNo:0,
                    brchDispNo:0,
                    cate1:0,
                    cate2:0,
                    cate3:0,
                    cateGrpNo:0,
                    cate1nm:'전체',
                    cate2nm:'전체',
                    cate3nm:'전체',
                    cateShow:[false,false,false],
                    cateShowDepth: 0,
                    cateDepthTypeCd: '',
                    cateSelected: 0,
                    genderCode: "A",
                    age:0,
                    viptab:0,
                    myDeptSelectShow:false,
                    myDeptNo: 0,
                    showBanner: true,
                    holidayTabIdx: 0, // 명절 선택탭 인덱스
                    ctgDispNo:"5542202",//플러스딜 선택 대카테 전시번호
                    subCtgDispNo:"",//플러스딜 선택 서브카테 전시번호
                    ctgClkCode:"",
                    smpBranchNo:""
                }
            }();

            if ($scope.loginInfo.isLogin) {
                var age = parseInt(parseInt($scope.loginInfo.mbrAge) / 10) * 10;
                $scope.pageOptions.age = age >= 20 ? age:0;
                $scope.pageOptions.genderCode = $scope.loginInfo.genSctCd;
            }

            /**
             * 스마트 알림 구조체
             */
            $scope.smartNoticeStruct = {
                lastAlarm: 0,
                lastAlarmGoodsNo: 0,
                lastAlarmGoodsNm: '',
                lastAlarmGoodsType: ''
            };

            $scope.tapLoopDataChkDispNo = [ // 1 page에서도 keepData를 적용할 DispNo
                "5550815" //명절관
            ];

            $scope.tapLoopDataChkTpmlNo = [ // 1 page에서도 keepData를 적용할 TpmlNo
            ];

            /**
             * 페이징이 있는 템플릿 번호
             */
            $scope.pagingTmplNo = [
                '21317',
                '20412',
                '22211',
                '22212',
                '22213',
                '19411' // 명절탭
            ];

            /**
             * 페이징 유닛의 구조체
             */
            $scope.pagingUnitStruct = {
                '21317':{         // 베스트100
                    loopData: {realtime_best_prod_list:true},
                    list: 'realtime_best_prod_list',
                    total:'total_count'
                },
                '20412':{         // 플러스딜
                    loopData: {plusDealGoodsListItems:true},
                    list: 'plusDealGoodsListItems',
                    total:'total_count',
                    banner:'plusDealBeltBanners',/*키네임 변경됨*/
                    bannerIdx: 'conts_disp_prio_rnk'
                },
                '22211': {        // 테마텝1
                    loopData: {bigdeal_goods_list:true},
                    list: 'bigdeal_goods_list',
                    total:'total_count',
                    banner:'image_list',
                    bannerIdx: 'conts_disp_prio_rnk'
                },
                '22212': {        // 테마텝2
                    loopData: {image_list:true},
                    list: 'image_list',
                    total:'total_count'
                },
                '22213': {        // 테마텝3
                    loopData: {goods_list:true},
                    list: 'goods_list',
                    total:'total_count',
                    banner:'image_text_goods_list',
                    bannerIdx: 'conts_disp_prio_rnk'
                },
                '19411': {        // 명절탭
                    loopData: {el_deal_goods_list:true, event_banner_list:true},
                    list: 'el_deal_goods_list',
                    total:'total_count',
                    banner:'event_banner_list',
                    bannerIdx: 'mrk_rnk'
                }
            };
            
            /**
             * 전시번호에 따른 SctCd 번호
             */
            $scope.SctCdList = {
                '5538661':'68', // 단골지점
                '5542202':'67', // 플러스딜
                '5538657':'81', // 홈
                '5538658':'',   // 브랜드
                '5538664':'',   // 이벤트
                '5538663':'69', // BEST100
                '5538667':'71', // 맞춤추천
                '5548134':'76', // 테마탭1
                '5548137':'76', // 테마탭2
                '5547560':'76'  // 테마탭3
            };

            $scope.mixedBnrDispNo = [ // 배너와 상품을 믹스 해야하는 전시 번호
            ];

            $scope.mixedBnrTpmlNo = [ // 배너와 상품을 믹스 해야하는 템플릿 번호
                '5550815' // 명절관
            ];

            /**
             * @ngdoc function
             * @name MainCtrl.function:screenDataReset
             * @description
             * 스크린 데이터 리셋
             */
            $scope.screenDataReset = function () {
                $scope.productMoreScroll = true;
                $scope.screenData = {
                    page:0,
                    pageSize:15,
                    listTotal:0,
                    pageEnd:false,
                    age_code_list: [],
                    ban_list: [],
                    bestShare: [],
                    best_brand_list: [],
                    best_goods_list: [],
                    bigdeal_goods_list: [],
                    branch_img_banner: [],
                    brand_planshop_list1: [],
                    brand_planshop_list2: [],
                    card_banner_list: [],
                    category_1depth_list: [],
                    category_2depth_list: [],
                    category_3depth_list: [],
                    custom_recomm_prod_list: [],
                    deal_goods_list: [],
					el_deal_goods_list: [], // 명절관 탭 상품유닛(테마기획전 포함)
                    dept_live_banner: [],
                    dept_store: [],
                    dm_coupon_book: [],
                    event_banner_list: [],
                    footer_banner_list: [],
                    gender_code_list: [],
                    goods_list: [],
                    image_list: [],
                    image_text_goods_list: [],
                    late_view_prod_list: [],
                    latelyPrd: [],
                    marketing_banner_list: [],
                    more_category: [],
                    new_brand_list: [],
                    planshop_banner: [],
                    planshop_banner_list: [],
                    plusdeal_goods_list: [],
                    plusDealCtgList:[],
                    prd_deal_list: [],
                    realtime_best_prod_list: [],
                    summary_policy_banner_list: [],
                    receipt_event_banner_list: [],
                    recommendPrd: [],
                    recom_goods_list1: [],
                    recom_goods_list2: [],
                    saun_event_list: [],
                    shoppingholic_banner_list: [],
                    shoppingholic_list: [],
                    smartpic_best_prod_list: [],
                    smartpick_banner_list: [],
                    today_custom_recomm_prod_list: [],
                    relation_prod: [],
                    relationProductShow: [],
                    relationProductShowNo: 0,
                    wish_list: [],
                    mix_banne: false,
                    mixed_pos:0,
                    bannerMixContents:[],
                    top_html: "", // [명절관] 상단 HTML (추석)
                    top_ban_list: [], // [명절관] 배너리스트
					top_cate_navi: "",  // [명절관] 상단 카테고리 네비
					spdp_3rd_list: [],  // [명절관] 3대 기획전
					spdp_list: [],  // [명절관] 테마기획전 세트2

                    // 홈2017
                    top_banner:[],
                    recommnd_prod:[],
                    plus_deal:[],
                    brand_plan_list:[],
                    hot_keyword:[],
                    hot_keyword_index:0,
                    hot_keyword_timer:null,
                    hot_keyword_change:false,
                    hot_keyword_show:true,
                    hot_keyword_updated:"",
                    latest_prod:[],
                    shopping_holic:[],
                    category_best:[],
                    category_best_index:0,
                    category_best_show:true,
                    event_banner:[],
                    event_link:[],
                    recommand_brand:[],
                    recommand_brand_index:0,
                    plusDealGoodsListItems:[],
                    plusDealBeltBanners:[],
                    nplusCateIndex:0,//플러스딜 대카테 인덱스
                    nplusSubCateIndex:0,//플러스딜 서브카테 인덱스
                    selectSubCateList:[],
                    pageProd:0,//스마트픽 리스트 빈값일때 얼럿트체크
                    top_cate_list:[],
                    top_brand:[],
                    brand_pick:[],
                    home_dpts_live:[],
                    home_theme_plan:[],
                    home_theme_plan_list:[],
                    new_prod_list:[],
                    theme_tab_index:0,
                    elstaList: [],  //엘스타그램
                    elsta_tags: [],                    
                    elsta_tags_l: [],
                    elsta_tags_g: [],
                    elsta_data: [],
                    elsta_data1: [],
                    elsta_data2: [],
                    elsta_name: [],
                    elsta_sub_img: [],
                    elsta_tocken: ''
                };
            };

            /**
             * @ngdoc function
             * @name MainCtrl.function:swipeEndCheck
             * @description
             * 스와프 종료 체크
             */
            $scope.swipeEndCheck = function () {
                // $timeout(function () {
                //  if (isSwipeActive) {
                //      $scope.swipeEndCheck();
                //  } else {
                $scope.resetLoading();
                //  }
                // }, 50);
            };

            /*
             * 초기 랜덤 DispNo 세팅
             */
            $scope.resetRandomDispNo = function () {
                var randomDefaultRendingDispNo = "";
                var initRendingDispNoArr = [
                    "5538657", // 홈
                    "5542202" // 플러스딜
                ];

                var mainDefaultRendingDispNo = LotteCookie.getCookie('dispNo');

                if (mainDefaultRendingDispNo && initRendingDispNoArr.indexOf(mainDefaultRendingDispNo) > -1) {
                    $scope.pageOptions.dispNo = mainDefaultRendingDispNo;
                } else {
                    randomDefaultRendingDispNo = initRendingDispNoArr[Math.floor(Math.random() * initRendingDispNoArr.length)];
                    LotteCookie.setCookie("dispNo", randomDefaultRendingDispNo, undefined);
                    $scope.pageOptions.dispNo = randomDefaultRendingDispNo;
                }
            };
            //$scope.resetRandomDispNo(); // 당분간만.. 랜덤적용안함 kimmiok

            // disNo parameter 있으면 관련 탭 노출
            if (commInitData.query['dispNo'] != undefined) {
                $scope.pageOptions.dispNo = commInitData.query['dispNo'];
            }

            if (commInitData.query['unitNo'] != undefined) {
                $scope.pageOptions.unitNo = commInitData.query['unitNo'];
            }

            if (commInitData.query['brchDispNo'] != undefined) {
                $scope.pageOptions.brchDispNo = commInitData.query['brchDispNo'];
            }

            /**
             * @ngdoc function
             * @name MainCtrl.function:getThemaDataUrl
             * @description
             * 테마 데이타 Url 호출
             * @param {Object} params 파라미터 오브젝트
             * @param {Number} params.dispNo 전시번호
             * @param {String} params.opt 플러스딜 옵션
             * @param {Number} params.page 페이지 번호
             * @param {Number} params.brchDispNo 브랜치 디스플레이 번호
             */
            $scope.getThemaDataUrl = function (params) {
                // console.log(params);
                var url = LotteCommon.mainContentData+"?dispNo="+params.dispNo;

                // 스마트픽
                
               
                if(params.smpBranchNo){
                    url+='&smpBranchNo='+params.smpBranchNo;
                }
                

                // 플러스딜
                if ($scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no == '5542202') {
                    /*              $scope.screenData.pageSize= 30;*/
                    url += "&opt="+($scope.pageOptions.plusDealOrder|| '0')+
                        "&ctgDispNo="+($scope.pageOptions.ctgDispNo||"")+
                        "&subCtgDispNo="+($scope.pageOptions.subCtgDispNo||"");
                    /*"&tclick="+($scope.pageOptions.ctgClkCode==""?"m_EL_main_5542202_5542202_Clk_Bigcate":$scope.pageOptions.ctgClkCode); */

                } else {
                    if (params.opt) {
                        url += "&opt="+params.opt;
                    }
                }

                if ($scope.pageOptions.brchDispNo != 0) {
                    url += "&brchDispNo="+$scope.pageOptions.brchDispNo;
                    $scope.pageOptions.brchDispNo = 0;
                } else if (params.brchDispNo) {
                    url += "&brchDispNo="+params.brchDispNo;
                }

                if ($scope.pagingTmplNo.indexOf($scope.mainTemplateType) != -1) {
                    // 페이징 관련 처리
                    url += "&rowsPerPage="+$scope.screenData.pageSize;
                    if(params.page) {
                        url += "&page="+params.page;
                    }
                }

                if ($scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no == '5538667') {
                    var viewGoods = LotteStorage.getLocalStorage('latelyGoods');

                    if (viewGoods) {
                        url += "&viewGoods="+viewGoods;
                    }
                } else if ($scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no == '5538663') {
                    var categoryDepthTypeCd = $scope.pageOptions.cateDepthTypeCd; // 카테고리뎁스(1뎁스:R2, 2뎁스:R3)
                    var categoryNo = $scope.pageOptions.cateSelected; // 선택된 카테고리 번호
                    var categoryGrpNo = $scope.pageOptions.cateGrpNo; // 선택된 카테고리 번호(1뎁스만 있음)
                    var genSctCd = $scope.pageOptions.genderCode; // 선택된 성별
                    var ageSctCd = $scope.pageOptions.age; // 선택된 연령

                    if (0 == categoryNo) {
                        categoryNo = '';
                    }

                    if (0 == categoryGrpNo) {
                        categoryGrpNo = '';
                    }

                    if ('R3' == categoryDepthTypeCd || 0 == ageSctCd) {
                        ageSctCd = '';
                    }

                    if ('R3' == categoryDepthTypeCd || 'A' == genSctCd) {
                        genSctCd = '';
                    }

                    url += "&category_depth_type_cd=" + categoryDepthTypeCd;
                    url += "&category_no=" + categoryNo;
                    url += "&category_grp_no=" + categoryGrpNo;
                    url += "&gen_sct_cd=" + genSctCd;
                    url += "&age_sct_cd=" + ageSctCd;
                }

                if ($scope.mainTemplateType == "19411") { // 명절관 파라메타 추가
                    if (params.opt_dispno == undefined) {
                        params.opt_dispno = $scope.pageOptions.holidayTabIdx;
                    }
                    url += "&opt_dispno=" + params.opt_dispno;
                }

                if (LotteCommon.isTestFlag) { // 로컬 테스트 예외 처리
                    try {
                        console.log("url ::::: " + url); // 로컬테스트용 - 실 데이터 호출 URL 정보 로깅
                    } catch (e) {}

                    url = LotteCommon.mainContentData + "." + params.dispNo; // 로컬 테스트 일 경우 추가 파라메타 제외
                }else{
                    if(commInitData.query.preview != undefined){
                        url += "&preview=" + commInitData.query.preview;
                    }
                }

                return url;
            };

            $scope.resetLoading = function () {
                $scope.pageLoading = false;
                $scope.productListLoading = false;
                $scope.$parent.LotteSuperBlockStatus = false;
                $scope.reSearchLoading = false;

                $scope.pageOptions.curMenuDispNo = $scope.pageOptions.dispNo; // 현재 선택된 Menu DispNo 저장 및 템플릿 변경

                try {
                    $scope.translateX_Reset();
                } catch (e) {
                    console.log("스와이프 리셋 오류:336");
                }


                /**
                 * ######## [ 백화점 라이브 ] ########
                 * 20171010 박해원
                 */
                if( $scope.pageOptions.curMenuDispNo != "5581401" ) {
                    storeliveService.resetObservers();
                }
            };

            /*
             * 메인 데이터 로드
             */
            $scope.loadScreenData = function (params) {
                $scope.curDispNoSctCd = $scope.SctCdList[$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no];
                //console.log("메인 데이터 타입 ::
                // "+typeof($scope.storedData[$scope.pageOptions.nodeIdx]));

                var dispNo = params.dispNo;
                var smpBranchNo = params.smpBranchNo;

                $scope.pageOptions.dispNo = dispNo;
                $scope.pageOptions.smpBranchNo = smpBranchNo;

                if (typeof($scope.storedData[$scope.pageOptions.nodeIdx]) == 'object' && !params.keepData && smpBranchNo == '') {
                    if ($scope.storedData[$scope.pageOptions.nodeIdx] == null) {
                        $scope.storedData[$scope.pageOptions.nodeIdx] = false;
                        params.keepData = false;
                        $scope.loadScreenData(params);
                        return;
                    }
                    $scope.screenDataReset();
                    $scope.screenData = $scope.storedData[$scope.pageOptions.nodeIdx];
                    console.log($scope.screenData+"스크린데이터");
                    $scope.screenID = "main-"+ $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                    $scope.swipeEndCheck();
                    angular.element($window).scrollTop(0);
                   
 					 // ◆명절 - 완판딜 공통 유닛 - 엠블럼 노출 
					switch ($scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no) {
						case "5538657": // 홈 
							$scope.screenData.plus_deal.prod_list.items.isHoliday = true;
							$scope.screenData.plus_deal.prod_list.item2.isHoliday = true;
							$scope.screenData.plus_deal.prod_list.item3.isHoliday = true;
							$scope.screenData.plus_deal.prod_list.items.isLpoint = true;
							$scope.screenData.plus_deal.prod_list.item2.isLpoint = true;
							$scope.screenData.plus_deal.prod_list.item3.isLpoint = true;
							break;
						case "5550815": // 명절 
							$scope.screenData.bannerMixContents.isHoliday = true;
							$scope.screenData.bannerMixContents.isLpoint = true;
							break;
						case "5542202": // 완판딜
							$scope.screenData.bannerMixContents.isHoliday = true;
							$scope.screenData.bannerMixContents.isLpoint = true;
							break;
						case "5548134": // 테마 탭
							$scope.screenData.bannerMixContents.isHoliday = true;
							$scope.screenData.bannerMixContents.isLpoint = true;
							break;
						case "5552329": // 스마트픽(테마) 탭
							$scope.screenData.bannerMixContents.isHoliday = true;
							$scope.screenData.bannerMixContents.isLpoint = true;
							break;
					};
					
                   /* hotKeywordTimerStart();*/ //인기검색어 자동 롤링 삭제
                } else {

                    if (!params.page && !params.keepData) {
                        $scope.screenDataReset();
                    }

                    if ($scope.screenData.pageEnd && params.page) {
                        $scope.productMoreScroll = false;
                        $scope.resetLoading();
                        return true;
                    }

                    $scope.pageOptions.isLogin = $scope.loginInfo.isLogin;
                    $scope.productListLoading = true;
                    $scope.$parent.LotteSuperBlockStatus = true;
                    $http.get($scope.getThemaDataUrl(params))
                        .success(function (data) { // json 데이터 들어옴
                            $scope.resetLoading();

                            var contents = [];

                            if (data['main_contents'] != undefined) {
                                contents = data['main_contents'];
                            } else {
                                // $scope.resetLoading();
                                return false;
                            }

                            if (params.loadContents) {
                                $scope.loopData = angular.copy(params.loadContents);
                            } else {

                                $scope.loopData = angular.copy($scope.screenData);
                            }

                            // 페이징 유닛 관련 처리
                            if ($scope.pagingTmplNo.indexOf($scope.mainTemplateType) != -1)  {
                                var listNm = $scope.pagingUnitStruct[$scope.mainTemplateType].list;
                                if (!params.page) {
                                    $scope.screenData.page = 1;
                                    $scope.productMoreScroll = true;
                                }

                                // 파라메타에 페이지가 지정되어 있을 경우 페이징이 필요한 데이터만 갱신하도록 처리
                                if (params.page > 1 || // 1page 가 아닐 경우
                                    (params.keepData && (arrayMatchString($scope.tapLoopDataChkDispNo, params.dispNo)))) { // 탭으로 부분 데이터만 로드되는 경우
                                    $scope.loopData = $scope.pagingUnitStruct[$scope.mainTemplateType].loopData;
                                }
                            } else {
                                $scope.productMoreScroll = false;
                            }

                       

                            // loopData 기준의 키값에 해당 하는 데이터 담기
                            angular.forEach($scope.loopData, function (val, key) {
                                if (contents[key] != undefined) {
                                    if (contents[key]['items'] != undefined) {
                                        if (params.page > 1) {
											
                                            $scope.screenData[key] = $scope.screenData[key].concat(contents[key]['items']);
                                        } else {
                                            $scope.screenData[key] = contents[key]['items'];
                                        }
                                    } else {
                                        $scope.screenData[key] = contents[key];
                                        if (key == "category_1depth_list") {
                                            var allCat = {disp_nm:"전체",disp_no:0};
                                            $scope.screenData[key].unshift(allCat);
                                        }
                                    }
                                }
                            });

                            //홈탭 데이터 가공
                            if($scope.pageOptions.dispNo == 5538657){
                                processHomeData(contents);
                            }
                            
							// ◆명절 - 완판딜 공통 유닛 - 엠블럼 노출 
							switch ($scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no) {
								case "5538657": // 홈 
									$scope.screenData.plus_deal.prod_list.items.isHoliday = true;
									$scope.screenData.plus_deal.prod_list.item2.isHoliday = true;
									$scope.screenData.plus_deal.prod_list.item3.isHoliday = true;
									$scope.screenData.plus_deal.prod_list.items.isLpoint = true;
									$scope.screenData.plus_deal.prod_list.item2.isLpoint = true;
									$scope.screenData.plus_deal.prod_list.item3.isLpoint = true;
									break;
							};
                            if($scope.pageOptions.dispNo == '5552329' && contents[$scope.pagingUnitStruct[$scope.mainTemplateType].list].items && contents[$scope.pagingUnitStruct[$scope.mainTemplateType].list].items.length == 0 && !params.page){

                                if($scope.screenData.pageProd == 0){
                                    alert('해당 지점 상품이 없습니다.');
                                    $scope.loadScreenData({
                                        dispNo:'5552329'
                                    });

                                    $scope.screenData.pageProd = 1;
                                    prodScope.pageOptions.selectSmartPic = 0;
                                    prodScope.pageOptions.selectSmartPicText = '백화점 전체';
                                    prodScope.pageOptions.smartTclick = 1;
                                }
                            }

                            //엘스타그램 메인데이터
                            if($scope.pageOptions.dispNo == 5597417){
                                if(data.main_contents.insta_banner_list){
                                    $scope.instaBan = data.main_contents.insta_banner_list.items;
                                    $scope.instaBanLength = $scope.instaBan.length;
                                    if($scope.instaBan.length > 0){
                                        $scope.instaBanner = $scope.instaBan[0];
                                    }
                                }

                                if(data.main_contents.insta_sub_img_list){
                                    $scope.screenData.elsta_sub_img = data.main_contents.insta_sub_img_list.items;
                                }

                                if(data.main_contents.insta_token_info || data.main_contents.insta_token_info.total_count > 0){
                                    $scope.screenData.elsta_tocken = data.main_contents.insta_token_info.items[0].text.banner_nm;
                                }

                                $timeout(function(){$scope.instaData()}, 10);
                            }

                            // 페이징 처리의 경우 마지막 페이지 체크
                            if ($scope.pagingTmplNo.indexOf($scope.mainTemplateType) != -1) {
                                if (contents[$scope.pagingUnitStruct[$scope.mainTemplateType].list].items && !contents[$scope.pagingUnitStruct[$scope.mainTemplateType].list].items.length) {
                                    $scope.screenData.pageEnd = true;
                                    $scope.productMoreScroll = false;
                                    // $scope.resetLoading();


                                    // ◆명절 - 상품이 없을경우 빈값 처리
                                    if(params.dispNo = '5550815' && !params.page){
                                        $scope.screenData.bannerMixContents =[];
                                    }
                                    return;
                                }
                            }

                            try{
                                if(!contents.plusDealGoodsListItems){ contents.plusDealGoodsListItems = {};
                                }else{contents.mix_banner=true}

                                var oldDealObject = $scope.screenData.plusDealGoodsListItems, newDealObject = (contents.plusDealGoodsListItems) || [];
                                if( newDealObject&&newDealObject.length ) {
                                    $scope.screenData.plusDealGoodsListItems= oldDealObject.concat( newDealObject );
                                }
                            }catch(e){}
                            
                            //점필터 
                            if($scope.pageOptions.dispNo == 5552329 && angular.element('.prodSmartPic').scope()){                                                            
                                $timeout(function(){
                                    angular.forEach(angular.element('.prodSmartPic'),function( el ){                                       
                                        angular.element(el).scope().prod_display = {prodSmartPicDis:false}
                                    });
                                    /*angular.element('.prodSmartPic').scope().prod_display = {prodSmartPicDis:false}*/
                                },300);
                            }else{                                 
                                try{
                                        if($scope.pageOptions.dispNo != 5552329){
                                            angular.forEach(angular.element('.prodSmartPic'),function( el ){                                   
                                                angular.element(el).scope().prod_display = {prodSmartPicDis:true}
                                            });
                                        }
                                    }catch(e){}                             
                            }

                            if (contents.mix_banner || $scope.isMixedBnrTab(params.dispNo)) {
                                if ($scope.pagingTmplNo.indexOf($scope.mainTemplateType) != -1) {
                                    // 넘어온 데이터가 더이상 없는 경우처리
                                    // 배너를 조합 하여 bannerMixContents 에담기

                                    if (!params.page || params.page == 1) {
                                        $scope.screenData.mixed_pos = 0;
                                        $scope.screenData.bannerMixContents =[];
                                    }

									 // ◆명절 - 완판딜 공통 유닛 - 엠블럼 노출 
									switch ($scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no) {
										case "5550815": // 명절 
											$scope.screenData.bannerMixContents.isHoliday = true;
											$scope.screenData.bannerMixContents.isLpoint = true;
											break;
										case "5542202": // 완판딜
											$scope.screenData.bannerMixContents.isHoliday = true;
											$scope.screenData.bannerMixContents.isLpoint = true;
											break;
										case "5548134": // 테마 탭
											$scope.screenData.bannerMixContents.isHoliday = true;
											$scope.screenData.bannerMixContents.isLpoint = true;
											break;
										case "5552329": // 스마트픽(테마) 탭
											$scope.screenData.bannerMixContents.isHoliday = true;
											$scope.screenData.bannerMixContents.isLpoint = true;
											break;
									};

                                    var sidx = ($scope.screenData.page - 1) * $scope.screenData.pageSize;
                                    var productContent = $scope.screenData[$scope.pagingUnitStruct[$scope.mainTemplateType].list];
                                    var bannerContent = $scope.screenData[$scope.pagingUnitStruct[$scope.mainTemplateType].banner];

                                    var bannerIndexKey = $scope.pagingUnitStruct[$scope.mainTemplateType].bannerIdx;
                                    var eidx = productContent.length;

                                    for (var i = sidx; i < eidx; i++) {
                                        $scope.joinBannerContent(i + 1, bannerContent, bannerIndexKey);
                                        productContent[i].isProduct = true;
                                        $scope.screenData.bannerMixContents.push(productContent[i]);
                                    }


                                }else{
                                    console.log("mix_data #####");
                                }

                                $scope.productListLoading = false;
                            }

                            $scope.storedData[$scope.pageOptions.nodeIdx] = angular.copy($scope.screenData);
                            $scope.swipeEndCheck();

                            if ((!params.page || params.page == 1) &&
                                !(params.keepData && (arrayMatchString($scope.tapLoopDataChkDispNo, params.dispNo)))) {
                                angular.element($window).scrollTop(0);
                            }
                                                        
                                                        //리로드시 배너 깨짐현상 방지
                            $timeout(function(){
                                if($scope.pageOptions.dispNo == 5552329 && angular.element('.swipeBox li').width() > $(document).width()){
                                    $scope.loadScreenData({
                                        dispNo:'5552329',
                                        smpBranchNo:smpBranchNo
                                    });
                                }
                            }, 50);

                        }).error(function (data) {
                        console.log('Error Data : 데이터 로딩 에러');
                        $scope.resetLoading();
                    });
                }

                if ($scope.screenData["summary_policy_banner_list"] && $scope.screenData["summary_policy_banner_list"].length > 0) { // BEST10
                    // 안낸
                    // $scope.screenData["summary_policy_banner_list"][0].html["html"]
                    // =
                    // $scope.screenData["summary_policy_banner_list"][0].html["html"].replace(/[^0-9]/g,
                    // "");
                }

                //홈탭 최근본상품/실시간맞춤추천 로드
                if($scope.pageOptions.dispNo == 5538657){
                    loadLatestRecom();
                }

                //엘스타그램 태그로드
                if($scope.pageOptions.dispNo == 5597417){

                    //테블릿 레이아웃 로드
                    if(angular.element(window).width() > 767){
                        for (var c = 1; c < 21; c++) {
                            eval('$timeout(function(){$scope.elstaTab(); $scope.elstaSize();}, 400*'+c+')');
                        }
                    }

                    for (var d = 1; d < 21; d++) {
                        eval('$timeout(function(){$scope.elstaDataTP();}, 400*'+d+')');
                    }
                }
            };

            /**
             * 최근본상품/실시간맞춤추천 로드
             */
            function loadLatestRecom(){
                var lg = localStorage.getItem("latelyGoods");
                if(lg == undefined || lg == ""){
                    console.log("latelyGoods="+lg);
                 return; 
                }

                // 끝에 | 로 끝날경우 마지막 텍스트 삭제
                var len = lg.length;
                if(lg.substring(len - 1, len) == "|"){
                    lg = lg.substring(0, len - 1);
                }

                var lgs = lg.split("|");

                // 최근본상품 로드
                var opt = {
                    method: "get",
                    url: LotteCommon.mainLatestProdData,
                    params: {latest_prod:lgs.join(",")}
                };
                $http(opt).success(loadLatestGoodsSuccess);


                // 레코벨 추천 로드
                var arr = [];
                var len = lgs.length;
                for(i=0; i<len; i++){
                    if(lgs[i] != ""){
                        arr.unshift(lgs[i]);
                    }
                }
                if(arr.length > 3){ arr.length = 3; }
                var lg3 = arr.join(",");

                if(lg3 != ""){
                    //var url = "http://rb-rec-api-apne1.elasticbeanstalk.com/rec/a002?size=30&cps=false&format=jsonp&cuid=fdd29847-94cd-480d-a0d9-16144485d58b&iids=" + lg3;
                    var url = LotteCommon.salebestlist_new + "&iids=" + lg3;
                   //레코벨 추천 로드
                    $.ajax({
                        type: 'get',
                        async: true,
                        url: url,
                        dataType : "jsonp",
                        success: loadRecoBellSuccess,
                        error: loadRecoBellGoods
                    });
                    //레코벨 최근본상품 추천 로드
                    var url2 = LotteCommon.newprod_list + "&iids="+lg3;
                      $.ajax({
                        type: 'get',
                        async: true,
                        url: url2,
                        dataType : "jsonp",
                        success: loadRecoBellProdListSuccess,
                        error: loadRecoBellProdList
                    });


                }else{
                    loadRecoBellGoods();
                    /*loadRecoBellProdList();*/
                }

            };

            /**
             * 레코벨 추천 로드 완료
             */
            function loadRecoBellSuccess(data){
                var ar = [];
                var gn = "";

                if(data.results != null){
                    $(data.results).each(function(idx, itm){
                        ar.push(itm.itemId);
                    });
                    gn = ar.join(",");
                }

                loadRecoBellGoods(gn);
            };


            /**
             * 레코벨 추천 상품 로드
             */
            function loadRecoBellGoods(gn) {
                var opt = {
                    method: "get",
                    url: LotteCommon.mainRealRecommData
                };

                if(gn != undefined && gn != ""){
                    opt.params = { latest_prod: gn };
                }

                $http(opt).success(loadRecoBellGoodsSuccess);
            }

            /**
             * 레코벨 추천 상품 로드 완료
             */
            $scope.homeRecomProdShow = false;
            function loadRecoBellGoodsSuccess(data){
                if(data.recommnd_prod != undefined && data.recommnd_prod.items != undefined){
                    $scope.screenData.recommnd_prod = data.recommnd_prod.items;                    
                    $timeout(function(){ $scope.homeRecomProdShow = true; 

                    }, 1000);// 스와이프 오동작 방지
                }
            }
            /**
             * 최근본상품 로드 완료
             */
              $scope.homeRecomLatestShow = false;
            function loadLatestGoodsSuccess(data){
                if(data.latest_prod != undefined && data.latest_prod.items != undefined){
                    $scope.screenData.latest_prod = data.latest_prod.items;
                     $timeout(function(){$scope.homeRecomLatestShow = true;

                     },1000);
                    
                }
            };

       /**
        *  2018 홈탭 리뉴얼 
        *  함께 볼만한 기획전 
        *  최근본 상품 기준 추천 기획전 - 기존 레코벨 데이터 처리 방식과 동일 하게
        *  한성희
        *
        */   $scope.recoSwipeFlag= [true,true];  

             function loadRecoBellProdListSuccess(data){
                var ar = [];
                var gn = "";
                if(data.results != null){
                    $(data.results).each(function(idx, itm){
                        ar.push(itm.itemId);
                    });
                    gn = ar.join(",");
                }

                loadRecoBellProdList(gn)

             }

             function loadRecoBellProdList(gn){
                var opt = {
                    method: "get",
                    url: LotteCommon.mainNewRelRecommProdData
                };
                if(gn != undefined && gn != ""){
                    opt.params = {spdp_no_list: gn };
                }
                $http(opt).success(loadRecoBellProdSuccess);
             }


             function loadRecoBellProdSuccess(data){
                if(data.main_spdp_recommend != undefined && data.main_spdp_recommend.items != undefined){
                    $scope.recoSwipeFlag= [true,true];
                    $scope.screenData.new_prod_list =data.main_spdp_recommend ;
                }
             }

             /* 레코벨 관련 스와이프 영역만 오류가 발생하여 추가함
              * (최종데이터를 받는것이 아니라 프론트에서 데이터 추출후 서버로 파라미터를 보내 최종데이터 를 다시 받는 방식) 
              * 레코벨 최종리스트 로드 완료이후 마지막 리스트 repeat 완료 시점 호출 
              * 
              * @param {string} flag - 스와이프 리셋 여부
              * @param {number} index - 레코벨 영역 구분 값을 넘김 (0 : 최근본상품  1: 특별한 당신에게 추천  )
              * 20171123 한성희            
              */
            $scope.recoSwipeReset = function(flag,index){
                if(flag && $scope.recoSwipeFlag[index] ){
                    try{
                            angular.element(this)[0].$parent.reset();
                            $scope.recoSwipeFlag[index] = false;
                            
                    }catch(e){
                        console.log("recoSwipeReset error");
                    }                 
                    /* $scope.recoSwipeFlag[index] 스와이프 리스트 로드 완료이후,
                     * 스크롤 이벤트등에 스와이프가 리셋되지 않도록 false 셋팅 (index :0 은 최근본상품 로드완료 ,index:1은 택별한 당신에게 추천 로드완료)
                     */
                }
                 return true;
            }
        /**
         *  2018 홈탭 리뉴얼 
         *  함께 볼만한 기획전 END
         */  

    /**
     * 홈탭 데이터 가공
     */
            function processHomeData(contents){
                var len, i, item, n;
                /*
                * 2018 홉탭 리뉴얼   
                * 신규 tclick 은 html page 에서  $scope.screenData.home2018_tclick.* 에 정의된 내용과 인덱스의 조합
                * tclick 이 변경되어 모아둠.
                * 한성희
                */
                $scope.screenData.home2018_tclick={
                    top_cate_link:"Clk_Quick_",//탑 카테고리
                    top_brand_ban:"Swp_Ban_TopB_",//탑브랜드
                    brand_pick_ban:"Clk_Ban_Pick_",//브랜드픽 배너
                    brand_pick_prd:"Clk_Prd_Pick_",//브랜드픽 상품 배너
                    shopping_holic_ban:"Clk_holicBan_C",//쇼핑홀릭 배너
                    shopping_holic_prd:"Clk_holic_Prd_C",//쇼핑홀릭 상품 배너
                    Shopping_keyword:"Clk_Kwd_C",//지금많이 찾는 상품
                    renew_event:"Clk_Lnk_",//이벤트 
                    rel_ban:"Clk_Ban_Rel_",//함께 볼만한 기획전
                    them_tab:"Clk_Btn_T0",//테마 기획전 탭
                    them_tab_prd:"Clk_Prd_T0",//테마 기획전 배너,
                    rel_c_ban:"Clk_Ban_C",//기획전 배너,
                    dept_live_ban:"Clk_DeptLive_Lnk_",//백화점 Live 링크
                    dept_live_prd:"Clk_DeptLive_Prd_",//백화점 라이브 상품
                    best_cate:"Clk_Best_Cate"//카테고리별 베스트 상품
                }

                //카테고리new
                try{
                    /* 카테고리 요건 : 
                     * 카테고리 는 코너에서 관리 (이미지, 링크, 타이틀 등 ) 
                     * 전체 버튼만 퍼블에서 추가,
                     * 전체 버튼클릭시 링크 이동이 아닌 좌측 카테고리를 펼침  
                     */
                    // var cate_all 카테고리 전체 버튼 항목 오브젝트 정의
                    //cate_type : cate_all 은 $scope.topCateLink 에서 좌측 카테고리 펼침 유무 구분값으로 사용 하기위해 임의 추가(코너 에서 들어온 데이터엔 cate_type 이 없다.)
                    var cate_all= {
                    "img": {
                        "img_url": "http://image.lotte.com/ellotte/mo2018/icon_category_all.png",
                        "link_url": "showSideCtgHeader()",
                        "alt_cont": "카테고리",
                        "cate_type":"cate_all"
                        }
                    }

                    $scope.screenData.top_cate_list = contents.category_service_list.items;
                    // 코너데이터 마지막, 카테고리 전체 오브젝트 추가
                    $scope.screenData.top_cate_list.push(cate_all);

                }catch(e){
                    console.log("top_cate_list error");
                }


                // 텍스트배너
                try{
                        
                    if(contents.card_banner_list.items){
                        $scope.screenData.card_banner_list = contents.card_banner_list.items;
                        len =  $scope.screenData.card_banner_list.length;
                        for(i=0; i<len; i++){
                            item = $scope.screenData.card_banner_list[i];
                            if(item != undefined && item.bg_color != null &&  item.bg_color!='' ){
                                
                            }else{

                                 (i+1)%2==0 ? item.bg_color = "#e79f87": item.bg_color ="#7ab7e8";
                            }
                        }
                    }
                }catch(e){
                    console.log("card_banner_list error");
                }


                // 플러스딜
                try{
                    // tablet wide
                    $scope.screenData.plus_deal.prod_list.item3 = [].concat($scope.screenData.plus_deal.prod_list.items);
                    len = $scope.screenData.plus_deal.prod_list.item3.length;
                    n = len - (len % 3);
                    if(len > n){
                        $scope.screenData.plus_deal.prod_list.item3.length = n;
                    }

                    // tablet
                    $scope.screenData.plus_deal.prod_list.item2 = [].concat($scope.screenData.plus_deal.prod_list.items);
                    len = $scope.screenData.plus_deal.prod_list.item2.length;
                    n = len - (len % 2);
                    if(len > n){
                        $scope.screenData.plus_deal.prod_list.item2.length = n;
                    }
                    // phone
                    len = $scope.screenData.plus_deal.prod_list.items.length;
                    if(len > 5){
                        $scope.screenData.plus_deal.prod_list.items.length = 3;
                    }


                }catch(e){}


                // 골드존
                try{
                    if($scope.screenData.event_banner_list.length > 3){
                        $scope.screenData.event_banner_list.length = 3;
                    }
                }catch(e){}

                // hot 기획전
                try{
                    len = $scope.screenData.brand_plan_list.plan_list.items.length;
                    if(len > 3){
                        $scope.screenData.brand_plan_list.plan_list.items.length = 3;
                    }
                    for(i=0; i<len; i++){
                        item = $scope.screenData.brand_plan_list.plan_list.items[i];
                        if(item.bg_color == undefined || (item.bg_color).indexOf("#")<0){
                            item.bg_color = "#2f3336";
                        }
                    }
                }catch(e){}

                //탑브랜드new
                try{
                       $scope.screenData.top_brand = contents.top_brand;  
                }catch(e){
                    console.log("top_brand error")
                }

                //쇼핑홀릭
                 try{ 
                    $scope.screenData.shopping_holic = contents.shopping_holic_new;             

                }catch(e){
                    console.log("shopping_holic error")
                }

                //브랜드 픽new
                 try{
                       $scope.screenData.brand_pick = contents.brand_pick;  
                }catch(e){
                    console.log("brand_pick error")
                }

                 //백화점 라이브new
                try{
                    $scope.screenData.home_dpts_live= contents.dpts_live;

                }catch(e){
                    console.log("home_dpts_live error");
                }

                //테마기획전new
                try{
                    $scope.screenData.theme_tab_index=0
                    $scope.screenData.home_theme_plan= contents.theme_plan;
                    $scope.screenData.home_theme_plan_list = $scope.screenData.home_theme_plan.theme_plan_list.items[0];
                }catch(e){
                    console.log("home_theme_plan error");
                }

            

                // 인기 키워드
                if(contents.hot_keyword && contents.hot_keyword.updated){
                    $scope.screenData.hot_keyword_updated = contents.hot_keyword.updated;
                }
               /* hotKeywordTimerStart();*/// 인기 키워드 리뉴얼 자동탭 삭제

                // 추천브랜드
                try{
                    len = $scope.screenData.recommand_brand.recom_list.items.length;
                    for(i=0; i<len; i++){
                        item = $scope.screenData.recommand_brand.recom_list.items[i];
                        if(item.img_list.items.length > 5){
                            item.img_list.items.length = 5;
                        }
                    }
                }catch(e){}

                 
                // 인기 카테고리
                $scope.screenData.category_best_index = Math.floor($scope.screenData.category_best.length * Math.random());
                $timeout(function(){
                    try{
                        var x = -angular.element(".cate_wrapper_v2 li").eq($scope.screenData.category_best_index).position().left;
                        angular.element(".cate_wrapper_v2 .in_tab").scope().lotteSliderMoveXPos(x, 0);
                    }catch(e){}
                }, 100);

                try{
                    $scope.screenData.recommand_brand_index = $scope.screenData.recommand_brand.select_tab;
                }catch(e){

                }
                //$timeout(initInfiniteScroll, 10);//();//홈탭 카테고리 무한 스크롤 초기화

                //2018 인기브랜드 삭제
                // 인기브랜드 - 개발에서 탭 설정
                /*try{
                    $scope.screenData.recommand_brand_index = $scope.screenData.recommand_brand.select_tab;
                }catch(e){}*/
                // 인기브랜드 - 맨즈 설정
                /*if($scope.loginInfo.genSctCd == "M"){
                    $scope.screenData.recommand_brand_index = 1;
                }*/
            }; 
    /**
     * 홈탭 데이터 가공 -END
     */


            /**
             * 탑배너 모두보기
             */
            $scope.showAllTopbanner = function(){
                var tba = angular.element(".tpml_home_2017 .home2017_topbanner_all");
                if(tba.length > 0){
                    angular.element("body > .home2017_topbanner_all").remove();
                    angular.element("body").append(tba);
                }else{
                    tba = angular.element("body > .home2017_topbanner_all");
                }
                tba.show();
                angular.element("#wrapper").height("100%");
                $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + "Swp_Ban_all");
            };
            $scope.hideAllTopbanner = function(){
                angular.element(".home2017_topbanner_all").hide();
                angular.element("#wrapper").height("auto");
            };

            /*
                탑 배너 conts_disp_prio_rnk 기준 동일순위 랜덤 출력 (conts_disp_prio_rnk순으로 정렬되어 옴)20170526 한성희
            */
            $scope.topbannerListInit=function(){
                var len = $scope.screenData.top_banner.length;
                var topbnList= $scope.screenData.top_banner;
                var tempArr=[];
                var resultArr=[];
                tempArr.push(topbnList[0]);

                for(var i=1;i<=len;i++){
                    if(i==len || topbnList[i-1].conts_disp_prio_rnk!=topbnList[i].conts_disp_prio_rnk){
                        resultArr=resultArr.concat(randomList(tempArr));
                        tempArr=[];
                    }
                    tempArr.push(topbnList[i]);
                }
                $scope.screenData.top_banner= resultArr;
            }

            /*
                배열순서 랜덤변경 20170526 한성희
            */
            function randomList(arr){
                /*arr.sort(function(a,b){return Math.random()-0.5});*/
                for(var i=arr.length-1;i>0;i--){
                    var b= Math.floor(Math.random()*(i+1));
                    var a= arr[i]; arr[i]=arr[b];arr[b]=a;
                }
                return arr;
            }



            // 플러스딜 더보기
            $scope.gotoPlusDealTab = function(){
                $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + "Clk_Btn_all");
                $scope.gotoMainTab('5542202');
            };


            /**
             * 추천브랜드 탭 변경
             */
            $scope.recomBrandTabChange = function(idx){
                if($scope.screenData.recommand_brand_index == idx){ return; }
                $scope.screenData.recommand_brand_index = idx;
                $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + "Clk_Btn_B0" + (idx+1));
            };

            /**
             * 최근본상품 더보기
             */
            $scope.gotoLatestGoods = function(){
                var url = LotteCommon.lateProdUrl + "?" + $scope.baseParam;
                url += "&tclick=" + $scope.tClickBase + $scope.TCLICK_PREFIX + "Clk_RctView_all";
                location.href = url;
            };


            /**
             * 홈탭 카테고리 변경
             */
            $scope.changeCategoryBest = function(idx){
                try{
                if(idx == $scope.screenData.category_best_index){ return; }

                $scope.screenData.category_best_index = idx;
                // LotteSlider 리셋 버그로 영역을 재설정
                $scope.screenData.category_best_show = false;
                $timeout(function(){
                    $scope.screenData.category_best_show = true;
                }, 0);

                $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + "Clk_Best_Cate" + (idx+1));
                }catch(e){console.log(" category error")}
            };

            // Best상품 더보기
            $scope.gotoBestCatelTab = function(){
                $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + "Clk_Best_Cate_all");
                $scope.gotoMainTab('5538663');
            };

           


       /**
        *  2018 홉탭 리뉴얼 
        *  한성희
        *  파라미터 공통 
        *  @param {string} tclick - 티클릭
        *  @param {object} item - 선택된 아이템 의 데이터 오브젝트
        *  @param {object} params - 선택된 아이템의 링크 관련 파라미터 
        *  @param {number} index - 인덱스 넘버
        *  (태블릿,모바일 가이드에서 각각의 리스트 수량이 상이 한 경우 html 내 ng-if 로 수량 변경)
        */

            //탑배너 현재 페이지 인덱스 가져오기
            $scope.topbannerGetIndex=function(index){ 
                $scope.topbannerIndex = index;
            }

            //카테고리 바로가기
            $scope.topCateLink = function(tclick,item){
                $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + tclick);
                if(item.img.cate_type){
                     $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + tclick);
                    getScope().showSideCtgHeader();//좌측 카테고리 펼침
                }else{
                     window.location= item.img.link_url +"&"+ $scope.baseParam +"&tclick=" +$scope.tClickBase + $scope.TCLICK_PREFIX + tclick ;
                }                
            }

            // 백화점 라이브 메인 탭 바로가기
            $scope.gotoStoreLive = function(tclick){
                $scope.sendTclick($scope.tClickBase + $scope.TCLICK_PREFIX + tclick);
                $scope.gotoMainTab('5581401');
            };

             // 백화점 라이브 매장가기
            $scope.gotoStoreLiveShop = function(tclick,item){
                window.location= LotteCommon.storeLiveBrandURL +"?"+ $scope.baseParam +"&elliv_shop_sn=" + item.elliv_shop_sn +"&tclick=" +$scope.tClickBase + $scope.TCLICK_PREFIX + tclick ;
            };

            // 백화점 라이브 상세 페이지 가기
            $scope.gotoStoreLiveShopdetail = function(tclick,params){
                var prdURL = LotteCommon.storeLiveSubURL +"?";
                prdURL += $scope.baseParam;
                for( var k in params ) if( k ) prdURL+="&"+k+"="+params[k];         
                window.location= prdURL+"&tclick=" +$scope.tClickBase + $scope.TCLICK_PREFIX + tclick ;
            };
             
            //홈탭 테마 기획전 카테고리 탭 클릭  
            /*  탭메뉴
            *  @param {object} tabdata : 선택된 탭의 하위 데이터 
            */           
            $scope.themeTabClick = function(tabdata,index){
                event.stopPropagation();
                $scope.screenData.home_theme_plan_list = tabdata;
                $scope.screenData.theme_tab_index = index;
                try{
                    angular.forEach(angular.element('.home_2018_theme_plan .in_item_box'),function( el ){
                        console.log("themeTab");
                        angular.element(el).scope().reset();//탭 변경시 스와이프 x 좌표 리셋 시킴
                    });
                }catch(e){}
                $scope.sendTclick($scope.tClickBase +  $scope.TCLICK_PREFIX + $scope.screenData.home2018_tclick.them_tab +(index+ 1) )
            }

             /**
             * 인기키워드 검색결과 더보기
             * @param {string} text : 검색어
             */
            $scope.gotoHotKeywordSearch = function(text,tclick){
                var url = LotteCommon.searchUrl + "?" + $scope.baseParam;
                var keyword = text;
                url += "&keyword=" + encodeURIComponent(keyword);
                url += "&tclick=" + $scope.tClickBase + $scope.TCLICK_PREFIX + tclick;
                location.href = url;
            };


        /**
         * 2018 홉탭 리뉴얼 new function  -END-
         */   


            var infiniteScrollList = [];
            /**
             * 홈탭 카테고리 무한 스크롤 초기화
             */
            /*function initInfiniteScroll(){
                var cateSlide = angular.element(".tpml_home_2017 .category_best .cate_wrapper .swipe_wrap");
                if(cateSlide.length){
                    initInfiniteScrollDelay();
                    cateSlide.unbind("slide").bind("slide", infiniteScrollEvent);
                }
            };*/
            /*function initInfiniteScrollDelay(){
                infiniteScrollList.length = 0;
                var list = angular.element(".tpml_home_2017 .category_best .cate_wrapper .swipe_wrap li");
                var li;
                list.each(function(idx, itm){
                    li = angular.element(itm);
                    infiniteScrollList.push({item:li, target:li.find("a"), width:li.outerWidth(), defX:li.position().left});
                });

                if(list.length > 0){
                    angular.element(".cate_wrapper .swipe_wrap").scope().lotteSliderMoveXPos(-infiniteScrollList[list.filter(".on").index()].defX, 0);
                }
            };*/

            /**
             * 홈탭 카테고리 무한 스크롤 이벤트
             */
            /*function infiniteScrollEvent(e){
                var len = infiniteScrollList.length;
                if(len > 0){
                    var SX = Math.round(e.posX);
                    var CW = e.contWidth;
                    var SN = Math.floor(SX / CW);
                    var RL = e.wrapWidth + 50;
                    var LL = -100;

                    var obj, itm, dx, ox, rm, md, n, tx;
                    for(var i=0; i<len; i++){
                        obj = infiniteScrollList[i];
                        itm = obj.item;

                        dx = obj.defX;
                        ox = SX + dx;
                        rm = ox % CW;
                        md = Math.floor(ox / CW);

                        if(SN >= 0){
                            if(rm > RL){
                                n = SN + 1;
                            }else{
                                n = SN;
                            }
                            if(md > n){
                                n++;
                            }
                        }else{
                            if(rm < LL){
                                n = SN;
                            }else{
                                n = SN + 1;
                            }
                            if(md > n){
                                n++;
                            }
                        }

                        tx = - CW * n;
                        itm.css("transform", "translateX("+tx+"px)");
                    }
                }
            };*/

            // 상품과 배너 믹스 형태 처리
            $scope.joinBannerContent = function (idx, bannerData, rnkKey) {
                try {
                    var i = 0;
                    var bannerTemp = [];
                    for (i = $scope.screenData.mixed_pos; i < bannerData.length; i++) {
                        if (bannerData[i][rnkKey] == idx) {
                            $scope.screenData.mixed_pos = i;
                            bannerTemp.push(bannerData[i]);
                        }
                    }

                    if (bannerTemp.length > 1) {
                        $scope.screenData.bannerMixContents.push({isSwipe:true, items:bannerTemp});
                    } else if (bannerTemp.length > 0) {
                        bannerTemp[0].isBanner = true;
                        $scope.screenData.bannerMixContents.push(bannerTemp[0]);
                    }
                } catch(e) {
                    console.log('Error::checkBanner');
                }
            };

            $scope.isMixedBnrTab = function (dispNo) { // 배너 믹스형 템플릿인지 확인
                var i = 0,
                    mixedTpmlArr = $scope.mixedBnrDispNo.concat($scope.mixedBnrTpmlNo),
                    isMixed = false;

                for (i; i < mixedTpmlArr.length; i++) {
                    if (mixedTpmlArr[i] == dispNo || mixedTpmlArr[i] == $scope.findMenuNodeIdx($scope.pageOptions.dispNo)) {
                        isMixed = true;
                        break;
                    }
                }

                return isMixed;
            };

            $scope.moreScreenData = function () {
                if ($scope.productMoreScroll && !$scope.screenData.pageEnd) {
                    $scope.screenData.page++;
                    $scope.sendTclick($scope.tClickBase+$scope.screenID+'_Scl_Prd_page'+$scope.screenData.page);
                    
                    //스마트픽 스크롤페이징 체크
                    if($scope.pageOptions.smpBranchNo){
                        $scope.loadScreenData({keepData:true,dispNo:$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no, smpBranchNo:$scope.pageOptions.smpBranchNo,page:$scope.screenData.page});
                    }else{
                        $scope.loadScreenData({keepData:true,dispNo:$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no, page:$scope.screenData.page});
                    }
                    
                }
            };

            $scope.getSubCategory = function (upr_disp_no,depth) {
                // http://mapi.lotte.com/json/ellotteCateList.json?upr_disp_no=5494430
                var allCat = {
                    disp_nm: "전체",
                    disp_no: 0
                };

                $http.get(LotteCommon.mainCategoryList+"?upr_disp_no="+upr_disp_no)
                    .success(function (data) {
                        if(depth == 0) {
                            $scope.screenData.category_2depth_list = data.CateList.items;
                            $scope.screenData.category_2depth_list.unshift(allCat);
                        } else {
                            $scope.screenData.category_3depth_list = data.CateList.items;
                            $scope.screenData.category_2depth_list.unshift(allCat);
                        }
                    }).error(function (data) {
                    console.log('Error Data : 데이터 로딩 에러');
                    $scope.pageLoading = false;
                });
            };

            // 이벤트 목록 추출
            $scope.liveEventItem = function (item) {
                return item.evt_status === '002' || item.evt_status === '003';
            };

            // 세션에서 가저올 부분 선언
            var elMainLoc = LotteStorage.getSessionStorage('elMainLoc');
            var elMainDataStr = LotteStorage.getSessionStorage('elMainData');
            var elMainScrollY = LotteStorage.getSessionStorage('elMainScrollY');
            var StorageCurMenuDispNo = LotteStorage.getSessionStorage('StorageCurMenuDispNo');

            if (elMainLoc == window.location.href && elMainDataStr != null && $scope.locationHistoryBack) {
                var elMainData = JSON.parse(elMainDataStr);

                $scope.mainMenu = elMainData.mainMenu;

                if (!$scope.mainMenu.length && !elMainData.storedData) {
                    $scope.getMenu();
                } else {
                    if (elMainData.pageOptions.isLogin != $scope.loginInfo.isLogin) {
                        $scope.getMenu();
                    } else {
                        $scope.storedData = elMainData.storedData;
                        $scope.mainTemplateType = elMainData.mainTemplateType;
                        $scope.pageOptions = elMainData.pageOptions;
                        $scope.smartNotice = elMainData.smartNotice;
                        $scope.screenData = $scope.storedData[$scope.pageOptions.nodeIdx];

                        $scope.resetLoading();
                        $timeout(function () {
                            $scope.screenID = "main-"+$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                            $scope.moveMenuSwipeFnc($scope.pageOptions.nodeIdx, true);
                            angular.element($window).scrollTop(elMainScrollY);
                        }, 800);
                    }
                }
            } else {
                $scope.getMenu();
            }

            if (elMainLoc == $location.absUrl() && elMainDataStr != null && commInitData.query["localtest"] != "true") { // 현재 URL과 session storage에 저장된 경로가 동일 할 경우
                $scope.pageOptions.dispNo = StorageCurMenuDispNo;
            }

            /**
             * unload시 관련 데이터를 sessionStorage에 저장
             */
            angular.element($window).on("unload", function (e) {
                var sess = {};

                if (!$scope.mainMenu.length) {
                    return;
                }

                sess.mainTemplateType = $scope.mainTemplateType;
                sess.storedData = $scope.storedData;
                sess.pageOptions = $scope.pageOptions;
                sess.smartNotice = $scope.smartNotice;
                sess.mainMenu = $scope.mainMenu;
                //sess.prdmixData = $scope.
                if (!commInitData.query.localtest && $scope.leavePageStroage) {
                    LotteStorage.setSessionStorage('elMainLoc', $location.absUrl());
                    LotteStorage.setSessionStorage('elMainData', sess, 'json');
                    LotteStorage.setSessionStorage('elMainScrollY', angular.element($window).scrollTop());
                    LotteStorage.setSessionStorage('StorageCurMenuDispNo', $scope.pageOptions.curMenuDispNo );
                }

                // 4.엘팟 아이콘 메인 화면 벗어날 경우
                if ($scope.appLpotIconFlag == true && $scope.appObj.isApp && $scope.appObj.isAndroid && $scope.appObj.verNumber >= 186) {
                    try {
                        window.lottebridge.lpot(false);
                    } catch (e) {}
                }
            });

            angular.element($window).on("load", function (e) {
                appLpotIcon(); // 엘팟 아이콘 노출
            });

            $rootScope.loadMenuContent = function (e) {
                if (e.moveto == 'left') {
                    if ($scope.pageOptions.nodeIdx+1 > $scope.mainMenu.length-1) {
                        $scope.pageOptions.nodeIdx = 0;
                    } else {
                        $scope.pageOptions.nodeIdx++;
                    }
                } else {
                    if ($scope.pageOptions.nodeIdx-1 < 0) {
                        $scope.pageOptions.nodeIdx = $scope.mainMenu.length-1;
                    } else {
                        $scope.pageOptions.nodeIdx--;
                    }
                }

                // console.log($scope.mainTemplateType);
                // $scope.mainTemplateType = $scope.mainMenu[$scope.pageOptions.nodeIdx].tmpl_no;
                $scope.pageOptions.dispNo = $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;

                $scope.sendTclick($scope.tClickBase+'menu_Swp_Rst_'+$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no);
                $scope.menuClick({disp_no:$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no},$scope.pageOptions.nodeIdx,true);
            }

            $scope.getCatRange = function (range) {
                var rangeList = [];

                for (var i = 0;i < range / 6; i++) {
                    rangeList.push(i);
                }

                return rangeList;
            };

            $scope.resetAgeGender = function () {
                $scope.pageOptions.age = 0;
                $scope.pageOptions.genderCode = "A";
            };

            $scope.resetCategoryData = function () {
                $scope.pageOptions.cateShow = [false,false,false];
                $scope.pageOptions.cateShowDepth=0;
                $scope.pageOptions.cate1 = 0;
                $scope.pageOptions.cate2 = 0;
                $scope.pageOptions.cate3 = 0;
                $scope.pageOptions.cate1nm ='전체';
                $scope.pageOptions.cate2nm ='전체';
                $scope.pageOptions.cate3nm ='전체';
            };

            $scope.relationProductLoad = function (item,idx) {
                if (item.goods_no == $scope.screenData.relationProductShowNo) {
                    $scope.screenData.relationProductShowNo = 0;
                } else {
                    $scope.sendTclick($scope.tClickBase+$scope.screenID+'_Clk_Lyr');
                    if (typeof($scope.screenData.relation_prod[idx]) == 'object') {
                        $scope.screenData.relationProductShowNo = item.goods_no;
                    } else {
                        SaleBestListSvc.func_SaleBestData(item.goods_no,item.disp_no,function(data) {
                            if (data['max'].relation) {
                                $scope.screenData.relation_prod[idx] = data['max'].relation.items;
                                $scope.screenData.relationProductShowNo = item.goods_no;
                            } else {
                                console.log("Error: 연관상품 호출 오류");
                            }
                        },'yes'); 
                    }
                }
            };

            $scope.smartNoticeCheck = function () {
                try {
                    var notice = LotteStorage.getLocalStorage('LotteSmartNotice','json');
                    var openAlarm = false;

                    if (notice) {
                        var nowTime = new Date().getTime();

                        if (parseInt(notice.lastAlarm)+(60*60*24*1000) < nowTime) {
                            LotteStorage.delLocalStorage('LotteSmartNotice');
                            notice = null;
                        }
                    }

                    $http.get(LotteCommon.mainNewAlarmData)
                        .success(function(data) {
                            var alarm = data.alarm_info.items;
                            if (data.alarm_info.items != null) {
                                if (notice) {
                                    if (alarm[0] && notice.lastAlarmGoodsNm != alarm[0].goods_nm && notice.lastAlarmGoodsType != alarm[0].sum_tgt_sct_cd) {
                                        openAlarm = true;
                                    }
                                } else if (alarm.length) {
                                    openAlarm = true;
                                }

                                if (openAlarm && alarm[0]) {
                                    $scope.smartNotice = $scope.smartNoticeStruct;
                                    $scope.smartNotice.lastAlarm = new Date().getTime();
                                    $scope.smartNotice.lastAlarmGoodsNm = alarm[0].goods_nm;
                                    $scope.smartNotice.lastAlarmGoodsType = alarm[0].sum_tgt_sct_cd;
                                    LotteStorage.setLocalStorage('LotteSmartNotice',$scope.smartNotice,'json');
                                    $scope.smartNoticeOpen($scope.smartNotice.lastAlarmGoodsType, $scope.smartNotice.lastAlarmGoodsNm );
                                }
                            }
                            // 멀티 노티스의 경우 데이터의 티커 인덱스가 필요함
                        })
                        .error(function (data) {
                            console.log('Error Data :  알람');
                            $scope.pageLoading = false;
                        });
                } catch(e) {}
            };

            // 명절 탭 랜덤 인덱스 선택
            $scope.pageOptions.holidayTabIdx = Math.floor(Math.random() * 4);

            //$scope.smartNoticeCheck(); // 20160120 스마트 알림 비노출 처리 - UX기획팀 이미준 대리 요청

            /**
             * 리얼클릭 쇼핑 타겟팅 로그
             * 2017.03.07
             */
            $timeout(function(){
                if(window.real_cic== undefined){
                    window.real_cic = "dsp3879";
                    var body = document.getElementsByTagName("body")[0];
                    var scr = document.createElement("script");
                    scr.type = "text/javascript";
                    scr.async = "true";
                    scr.id = "realClickMain";
                    scr.src = "/common3/js/realclick_main.js";
                    body.appendChild(scr);
                }
            },3000);

            /*
                ######## [ 백화점 라이브 ] ########
                @author :  박해원
                @date : 20170904
                discription :
                    content load에 사용하는 dispNo가
                    스테이지, 운영 값이 다름
                ###################################
            */
            function storeLiveInit (){
                for( var i=0;i<$scope.mainMenu.length; ++i ) {
                    if( $scope.mainMenu[i].tmpl_no == '28411' ) {
                        $scope.mainMenu[i].disp_no = storeliveService.dispNo();
                    }
                }
                setTimeout( removeStoreLiveObserverList, 5000 );
            }
            function removeStoreLiveObserverList(){
                try{ storeliveService.storeLiveLocalStorage.clear() }
                catch (e) { console.log( '백화점라이브 캐쉬 삭제 에러'); }
            }

            // [Observers] pageloading 생성
            storeliveService.Observers.add( ['pageloading'] );
            // 상품 유닛
            storeliveService.setStoreLiveTmpl( "storeLivemain" );
            storeliveService.Observers.pageloading.get().then(null,null, function(state){
                console.log( '[pageLoading] 상태변경', state );
                $scope.screenDataReset();
                //$scope.screenID = "main-"+ $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                $scope.swipeEndCheck();
                angular.element($window).scrollTop(0);
                $scope.pageLoading = state;
            })



            /*
             * 스마트픽팝업 2017.11.23 강민수
             */


            var prodScope;
            var tClickEl = 'm_El_main-5552329_Clk_Btn_smp_idx';

            $scope.smartOption = {
                smartPicBox:false,
                dptsRglList:''
            }

            $scope.buildSearchOption = function(item) {
                var url = LotteCommon.brandShopSubSearchData;
                return url;
            }
            
            $scope.getSearchOptionData = function(node, item) {
                prodScope = angular.element('.prodSmartPic').scope();
                var pam = '?cateNo=1&cateDepth=1';

                try {
                    $http.get($scope.buildSearchOption(item) + pam)
                    .success(function(data) {
                        if(node == 1) {
                            prodScope.screenData.DetailDepth1 = data;
                        } else if(node == 2) {
                            prodScope.screenData.DetailDepth2 = data;
                        } else if(node == 3) {
                            prodScope.screenData.DetailDepth3 = data;
                        }
                        $scope.smartOption.dptsRglList = data.dptsRglList;
                        if($scope.smartOption.dptsRglList.length) {
                            prodScope.pageOptions.disableSmartPic = false;
                        } else {
                            prodScope.pageOptions.disableSmartPic = true;
                        }
                    });
                } catch(e) {}
            }

            $scope.selectSmartPicClick = function(item,index) {
                prodScope.pSmart01.prodSmart01 = false;
                prodScope.pSmart02.prodSmart02 = false;

                if(item == null) {
                    prodScope.pageOptions.selectSmartPic = 0;
                    prodScope.pageOptions.selectSmartPicText = '백화점 전체';
                }else{
                    prodScope.pageOptions.selectSmartPic = item.disp_no;
                    prodScope.pageOptions.selectSmartPicText = item.disp_nm;
                }

                if(index == 1){
                    $scope.sendTclick(tClickEl+'01');
                }else if(index+2 < 10){
                    $scope.sendTclick(tClickEl+'0'+(index+2));
                }else{
                    $scope.sendTclick(tClickEl+(index+2));
                }

                prodScope.pageOptions.selectSmartPicText2 = '에서 스마트픽 할 수 있는 상품';
                prodScope.pageOptions.selectSmartPicBtn = '다른지점 찾기';
                prodScope.pageOptions.smartTclick = 1;

                $scope.closeSamrtPicClick();

                $scope.loadScreenData({
                    dispNo:'5552329',
                    smpBranchNo:item==null?null:item.disp_no
                });
            }
            
            $scope.closeSamrtPicClick = function() {
                if( $scope.smartOption.smartPicBox ) {
                    $scope.smartOption.smartPicBox = false;
                    $scope.dimmedClose();
                }
            }


            /*
             *  엘스타그램 2017.12.26 강민수
            */

            $scope.instaBanLength = 0;
            $scope.elGroupNum = 0;
            $scope.elGroup = '';
            $scope.elResult = false,
            $scope.elResultClass01 = 'el_show',
            $scope.elResultClass02 = '',
            //$scope.elstaETag = '엘스타그램테스트';
            $scope.elstaETag = '태그엘'

            //인스타그램 데이터 호출
            $scope.instaData = function(){
                //var tocken = "5789653871.9cdde27.2e2525d312074affb74e6937cde259dd";  
                //var tocken = "123456";      
                var count = "200";
                
                $.ajax({  
                    type: "GET",  
                    dataType: "jsonp",  
                    cache: false, 
                    async: false, 
                    url: "https://api.instagram.com/v1/users/self/media/recent/?access_token=" + $scope.screenData.elsta_tocken + "&count=" + count,  
                    success: function(response) {  
                        if(response.meta.code == 200){
                            if (response.data.length > 0){
                                angular.forEach(response.data, function(key, val){
                                    if(key.tags.length > 0){
                                        if(key.tags.indexOf($scope.elstaETag) != -1){
                                            $scope.screenData.elstaList.push(key);
                                        }
                                    }
                                });

                                $scope.elstaTagList($scope.screenData.elstaList);
                            } 
                        }else{
                            $scope.elResult = true;
                            $scope.elResultClass01 = ''
                            $scope.elResultClass02 = 'el_show';
                        }

                        $scope.elstaSize();
                    }  
                });
            }

            //인스타 연관 제품리스트
            $scope.loadScreenElstaData = function(url, name, num, key) {
                if(key != ''){
                    $http.get(url)
                    .success(function(data) {
                        if(data.insta_goods_list){
                            if(name == 'goods'){ 
                                $scope.screenData.elsta_data1[num] = data.insta_goods_list.goods_list;
                            }else if(name == 'live'){
                                $scope.screenData.elsta_data2[num] = data.insta_goods_list.goods_list;
                            }
                        }
                    });
                }else{
                   if(name == 'goods'){ 
                       $scope.screenData.elsta_data1[num] = '';
                   }else if(name == 'live'){
                       $scope.screenData.elsta_data2[num] = '';
                   }
                }
            }


            //인스타배너
            /*$scope.elstaLoadBanner = function() {
                $scope.loadScreenElstaData('/json/main/main_contents.json.5552329');
                $scope.loadScreenElstaData('/json/main/main_contents.json?dispNo=5597417');
            };*/

            //인스타태그 리스트
            $scope.elstaTagList = function(item){
                var elstaDataG = [], elstaDataL = [];
                for (var i = 0; i < item.length; i++) {
                    for (var j = 0; j < item[i].tags.length; j++) {
                        if(item[i].tags[j].indexOf('goods_') != -1 ){
                            elstaDataG.push(item[i].tags[j].split('_')[1]);
                        }else if(item[i].tags[j].indexOf('live_') != -1){
                            elstaDataL.push(item[i].tags[j].split('_')[1]);
                        }
                    }

                    $scope.screenData.elsta_tags_g.push(elstaDataG);
                    $scope.screenData.elsta_tags_l.push(elstaDataL);
                    elstaDataG = [];
                    elstaDataL = [];
                }

                angular.forEach($scope.screenData.elsta_tags_g, function(key, val){
                    $scope.loadScreenElstaData('/json/main/el_insta_goods_list.json?goods_list='+key+'&type=goods','goods', val, key);
                });

                angular.forEach($scope.screenData.elsta_tags_l, function(key, val){
                    $scope.loadScreenElstaData('/json/main/el_insta_goods_list.json?goods_list='+key+'&type=live','live', val, key);
                });
            }

            //인스타 제품리스트 키워드 클릭
            $scope.elstaTagClk = function(num, kwd, idx){

                $scope.kwdUrl = '/search/m/mobile_search_list.do?c=&udid=&v=&cn=149924&cdn=&schema=&dpml_no=1&type=&dispCnt=30&reqType=N&reqKind=C&tclick=m_EL_insta_feed_Clk_Rel_'+num+'_Kwd_0'+idx+'&keyword='+kwd

                return $scope.kwdUrl;
            }

            //인스타 제품리스트 클릭
            $scope.elstaProdClk = function(item, name){
                if(item){
                    if(name.split('_')[0] == 'goods'){
                        $scope.proUrl = '/product/m/product_view.do?c=&udid=&v=&cn=149924&cdn=&schema=&goods_no='+ item.goods_no +'&curDispNo=5597417&curDispNoSctCd=92&tclick=m_EL_insta_feed_Clk_Rel_' + item.goods_no
                    }else{
                        $scope.proUrl = '/mall/storelive.do?c=&udid=&v=&cn=149924&cdn=&schema=&dpts_liv_goods_no='+ item.dpts_liv_goods_no +'&elliv_shop_sn='+item.elliv_shop_sn+'&cate_no=' + item.cate_no + '&tclick=m_EL_insta_feed_Clk_Rel_' + item.dpts_liv_goods_no
                    }

                    location.href = $scope.proUrl;
                }
            }   

            //인스타 피드 이미지 클릭
            $scope.elstaItemClk = function(idx){

                $scope.sendTclick('m_EL_insta_Btn_' + ((idx+1).toString().length > 1 ? idx + 1 : ('0' + (idx + 1)).slice(-2)));
            }

            //인스타 연관상품 브랜드명 클릭
            $scope.elstaBrandClk = function(item, name ,idx){
                if(item){
                    if(name == 'goods'){
                        $scope.brandUrl = '/product/m/product_view.do?c=&udid=&v=&cn=149924&cdn=&schema=&goods_no='+ item.goods_no +'&curDispNo=5597417&curDispNoSctCd=92&tclick=m_EL_insta_feed_Clk_Rel_' + item.goods_no + '_' + (idx.toString().length > 1 ? idx : ('0' + idx).slice(-2)) + '_' + item.brnd_no
                    }else{
                        $scope.brandUrl = '/mall/storelive.do?c=&udid=&v=&cn=149924&cdn=&schema=&dpts_liv_goods_no='+ item.dpts_liv_goods_no +'&elliv_shop_sn='+item.elliv_shop_sn+'&cate_no=' + item.cate_no + '&tclick=m_EL_insta_feed_Clk_Rel_' + item.dpts_liv_goods_no + '_' + (idx.toString().length > 1 ? idx : ('0' + idx).slice(-2)) + '_' + item.brnd_no
                    }

                    return $scope.brandUrl;
                }
            }

            //인스타 제품리스트 Toggle 효과
            $scope.elstaProdList = function(item, idx) {

                $scope.elShow = angular.element('.el_show');

                $scope.elShow.find('.arrow_box').removeClass('arrow_box_a');
                $scope.elShow.find('.arrow_box').removeClass('arrow_box_b');
                $scope.elShow.find('.arrow_box').removeClass('arrow_box_c');

                if($scope.isElstaProdList(item)) {

                  $scope.elGroup = null;
                  $scope.elGroupNum = 0;
                  $scope.elImgHeight = angular.element('.elsta_title').height() + 12;
                  $scope.elstaTemp = angular.element('.template_elstagram');

                  $scope.elShow.removeClass('show_open');

                  if(item.tags.toString().indexOf('live_') != -1 || item.tags.toString().indexOf('goods_') != -1){
                      $scope.sendTclick('m_EL_insta_feed_Clk_Rel_' + ('0' + (idx + 1)).slice(-2) + '_close');
                  }

                  //테블릿 레이아웃
                  if(angular.element(window).width() > 767){
                      $scope.elShow.css('marginTop','');
                      $scope.elstaTab();
                  }
                  //테블릿 레이아웃 END

                } else {

                  //피드클릭했을시 티클릭
                  if(item.tags.toString().indexOf('live_') != -1 || item.tags.toString().indexOf('goods_') != -1){
                      $scope.elGroup = item;
                      $scope.elstaTag(idx);

                      if($scope.elGroupNum != 0){
                        $scope.sendTclick('m_EL_insta_feed_Clk_Rel_' + ('0' + $scope.elGroupNum).slice(-2) + '_close');
                      }

                      $scope.elGroupNum = idx + 1;

                      $scope.sendTclick('m_EL_insta_feed_Clk_Rel_' + ('0' + (idx + 1)).slice(-2));
                  }

                  //피드 브랜드명 위치가 화면밖으로 넘어갈시 위치정리
                  $timeout(function() {
                      for (var z = 0; z < angular.element('.el_show').eq(idx).find(angular.element('.arrow_box')).length; z++) {
                          if(angular.element('.el_show').eq(idx).find(angular.element('.arrow_box')).eq(z).offset().left > 0){
                              var elChecks = angular.element('.el_show').eq(idx).find(angular.element('.arrow_box')).eq(z);

                              if(elChecks.offset().left + (elChecks.width()-23) > angular.element(window).width()){

                                  if(elChecks.offset().left + 1  > angular.element(window).width()/2){
                                      elChecks.css({'left':'auto','right':'0'});
                                  }

                                  if((elChecks.width()-24) + 1 > angular.element(window).width()/2){
                                       elChecks.css({'width':angular.element(window).width()/2+'px'}); 
                                  }
                              }
                          }
                      }
                  }, 0);

                  //테블릿 레이아웃 (연관제품리스트 활성화시)
                  $scope.elShow.removeClass('show_open');
                  $scope.elShow.eq(idx).addClass('show_open');

                  if(angular.element(window).width() > 767){
                      $scope.elShow.css('marginTop','');
                      $scope.elUlLength = $scope.elShow.eq(idx).find('.elsta_item ul').length;

                      $timeout(function(){
                          $scope.elUlH = $scope.elShow.eq(idx).find('.elsta_item').height();
                         
                          for(var j = idx; j < $scope.elShow.length; j++){
                              if(idx != j){
                                  if(idx % 2 == 0 && j % 2 == 0){
                                    $scope.elShow.eq(j).css('marginTop',$scope.elUlH+'px')
                                  }else if(idx % 2 != 0 && j % 2 != 0){
                                    $scope.elShow.eq(j).css('marginTop',$scope.elUlH+'px')
                                  }
                              }
                          }

                          if($scope.elShow.length%2 == 0){
                             $scope.elstaTemp.css('height', $scope.elstaTab() + $scope.elUlH + $scope.elImgHeight + 'px');
                          }else{
                              if(idx % 2 == 0){
                                $scope.elstaTemp.css('height', $scope.elstaTab() + $scope.elUlH + $scope.elImgHeight + 'px');         
                              }else{
                                if($scope.elstaTab() < ($scope.elShow.eq(idx).height() * Math.floor($scope.elShow.length/2)) + $scope.elUlH + $scope.elImgHeight){
                                    $scope.elstaTemp.css('height', ($scope.elShow.eq(idx).height() * Math.floor(angular.element('.show').length/2)) + $scope.elUlH + $scope.elImgHeight + 'px');
                                }
                              }
                          }
                          
                      }, 20);
                  } 
                  //인스타 테블릿 레이아웃 (연관제품리스트 활성화시) END
                }
            };

            $scope.isElstaProdList = function(item) {
                return $scope.elGroup === item;
            };

            //인스타 테블릿 레이아웃
            $scope.elstaTab = function(){
                $scope.elImgHeight = angular.element('.elsta_title').height() + 12;
                $scope.elImgHeight = angular.element('.elsta_title').height() + 12;
                $scope.elstaTemp = angular.element('.template_elstagram');
                $scope.elShow = angular.element('.el_show');
                $scope.elTop = 0;
                $scope.elLeft = 0;
                $scope.elmgl = '';

                $scope.elstaSize();

                for (var i = 0; i < $scope.elShow.length; i++) {
                    $scope.elShow.eq(i).css({'top':$scope.elTop,'left':$scope.elLeft,'margin-left':$scope.elmgl});

                    if(i%2 == 0){
                        $scope.elLeft += $scope.elShow.eq(i).width();
                        $scope.elmgl = '9%';
                        if($scope.elShow.length == i+1){
                            $scope.elTop += $scope.elShow.eq(i).height();
                        }
                    }else{
                        $scope.elLeft = 0;
                        $scope.elmgl = '';
                        if(i > 0){
                            $scope.elTop += $scope.elShow.eq(i).height();
                        }
                    }
                }

                if(angular.element('.show_open').length > 0){

                    var idx = angular.element('.el_show.show_open').index();

                    $scope.elItem = angular.element('.show_open .elsta_item').height();
                    $scope.elUlHO = $scope.elShow.eq(idx).find('.elsta_item').height();
                         
                    for(var d = idx; d < $scope.elShow.length; d++){
                        if(idx != d){
                            if(idx % 2 == 0 && d % 2 == 0){
                              $scope.elShow.eq(d).css('marginTop',$scope.elUlHO+'px')
                            }else if(idx % 2 != 0 && d % 2 != 0){
                              $scope.elShow.eq(d).css('marginTop',$scope.elUlHO+'px')
                            }
                        }
                    }

                    if($scope.elShow.length%2 == 0){
                        $scope.elstaTemp.css('height',$scope.elTop + $scope.elItem + $scope.elImgHeight + 'px');
                    }else{
                        if(idx%2 == 0){
                            $scope.elstaTemp.css('height',$scope.elTop + $scope.elItem + $scope.elImgHeight  + 'px');
                        }else{
                            if($scope.elTop < ($scope.elShow.eq(idx).height() * Math.floor($scope.elShow.length/2)) + $scope.elItem + $scope.elImgHeight){
                                $scope.elstaTemp.css('height', ($scope.elShow.eq(idx).height() * Math.floor(angular.element('.show').length/2)) + elItem + 110 + 'px');
                            }else{
                                $scope.elstaTemp.css('height', $scope.elTop + $scope.elImgHeight + 'px');
                            }
                        }
                    }
                }else{
                    $scope.elstaTemp.css('height', $scope.elTop + $scope.elImgHeight + 'px');
                }

                return $scope.elTop;
            }

            //인스타 태그 위치 함수 
            $scope.elstaTag = function(index){
                $scope.elBox01 = angular.element('.el_show').eq(index).find('.a_box1');
                $scope.elBox02 = angular.element('.el_show').eq(index).find('.a_box2');

                if((index+1)%4 == 0 || index == 0){
                    $scope.elBox01.addClass('arrow_box_a');
                    $scope.elBox02.addClass('arrow_box_b');
                }else if((index+1)%2 == 0){
                    $scope.elBox01.addClass('arrow_box_b');
                    $scope.elBox02.addClass('arrow_box_c');
                }else{
                    $scope.elBox01.addClass('arrow_box_c');
                    $scope.elBox02.addClass('arrow_box_a');
                }
            }

            $scope.elstaSize = function(){
                if( angular.element(window).width() > 767){
                    angular.element('.elsta_img_sub').css('height',angular.element('.elsta_img_sub').find('img').width() + 'px');
                }else{
                    angular.element('.elsta_img_sub').css('height',(angular.element(window).width()-24) + 'px');
                }
            }

            //인스타 제품리스트/태그
            $scope.elstaDataTP = function(){

                $scope.screenData.elsta_data = [];
                $scope.screenData.elsta_name = [];
                $scope.screenData.elsta_tags = [];

                for (var i = 0; i < $scope.screenData.elsta_data1.length; i++) {
                    var $el01 = $scope.screenData.elsta_data1[i];
                    var $el02 = $scope.screenData.elsta_data2[i];
                    var $elD = [],  $elN = [];

                    if($el01){
                        for (var j = 0; j < $el01.length; j++) {
                            $elD.push($el01[j]);
                            $elN.push('goods');
                        }
                    }

                    if($el02){
                        for (var k = 0; k < $el02.length; k++) {
                            $elD.push($el02[k]);
                            $elN.push('live');
                        }
                    }

                    $scope.screenData.elsta_data.push($elD);
                    $scope.screenData.elsta_name.push($elN);

                    $elD = [], $elN = [];
                }
            }

            angular.element(window).bind('load', function(){
                if($scope.pageOptions.dispNo == 5597417){
                    if(angular.element(window).width() > 767){
                        $scope.elstaTab();
                    }
                }
            });

            angular.element(window).bind('resize', function(){

                var elImgSize = angular.element('.elsta_img_sub').find('img');

                if($scope.pageOptions.dispNo == 5597417){
                    if(angular.element(window).width() > 767){
                        $scope.elstaTab();
                    }else{
                        angular.element('.el_show').css({'top':'','left':'','margin':''});
                        angular.element('.template_elstagram').css('height','');
                        $scope.elstaSize();
                    }
                }
            });

    }]);

    app.directive('lotteSmartMessage', ['$rootScope','$timeout','LotteStorage','LotteCommon', function($rootScope,$timeout,LotteStorage,LotteCommon) {
        return {
            template: '<div class="smart_notice" ng-show="smartNoticeShow"><a ng-click="smartNoticeClick()" ng-bind-html="smartNoticeMessage"></a><button class="close" ng-click="smartNoticeClose()"></button></div>',
            replace: true,
            link: function ($scope, el, attrs) {
                $scope.smartNoticeClose = function () {
                    $scope.smartNoticeShow = false;
                };

                $scope.smartNoticeMessage = "";

                $scope.smartNoticeOpen = function (mtype, goods_nm) {
                    // console.log(mtype+"|"+goods_nm);
                    var newMsg = goods_nm.substring(0,12);

                    if (goods_nm != newMsg) {
                        newMsg += "...";
                    }

                    switch (mtype) {
                        case "CART":     // 장바구니
                            $scope.smartNoticeMessage = "장바구니에 담으신 <span>"+newMsg+"</span> 의 가격이 <span>할인 </span> 되었습니다."
                            break;
                        case "WISH":     // 위시
                            $scope.smartNoticeMessage = "위시리스트에 담으신 <span>"+newMsg+"</span> 의 가격이 <span>할인 </span> 되었습니다."
                            break;
                        case "NTC_CART": // 재입고 장바구니 | 장바구니로 가기
                            $scope.smartNoticeMessage = "장바구니에 담으신 <span>"+newMsg+"</span> 이/가 <span>재입고 </span> 되었습니다."
                            break;
                        case "NTC_ETC":  // 재입고 위시
                            $scope.smartNoticeMessage = "위시리스트에 담으신 <span>"+newMsg+"</span> 이/가 <span>재입고 </span> 되었습니다."
                            break;
                    }

                    $scope.smartNoticeShow = true;
                }

                $scope.smartNoticeClick = function () {
                    switch($scope.smartNotice.lastAlarmGoodsType) {
                        case "CART":     // 장바구니
                            window.location.href = LotteCommon.cateLstUrl+"?"+$scope.baseParam;
                            break;
                        case "WISH":     // 위시
                            window.location.href = LotteCommon.wishLstUrl+"?"+$scope.baseParam;
                            break;
                        case "NTC_CART": // 재입고 장바구니 | 장바구니로 가기
                            window.location.href = LotteCommon.cateLstUrl+"?"+$scope.baseParam;
                            break;
                        case "NTC_ETC":  // 재입고 위시
                            window.location.href = LotteCommon.wishLstUrl+"?"+$scope.baseParam;
                            break;
                    }
                    $scope.smartNoticeClose();
                }
            }
        };
    }]);

    app.directive('lotteHeaderMain', ['$window','$rootScope','$timeout','LotteCommon', '$interval', function($window,$rootScope,$timeout,LotteCommon, $interval) {
        return {
            template: '<section id="gnb"><ul lotte-ng-list-swipe swipe-slide-menu="true" swipe-list-model="mainMenu" swipe-max-ratio="0.3" swipe-min-distance="40" style="height:40px;" swipe-id="MainMenu" ><li class="dispno_{{item.disp_no}}" ng-repeat="item in mainMenu" ng-class="{on:$index==pageOptions.nodeIdx, hot: holidayHotFlag && item.disp_no == 5550815}"><span class="cate_flag" ng-if="item.flag_txt && item.flag_txt != \'점\'">{{item.flag_txt}}</span><img class="cate_dot" ng-if="item.flag_txt && item.flag_txt == \'점\'" src="http://image.lotte.com/ellotte/mo2018/reddot.png" /><a ng-click="menuClick(item,$index)">{{item.disp_nm}}</a></li></ul></section>',
            replace: true,
            link: function ($scope, el, attrs) {
                $scope.menuClick = function (item, idx, tflag) {
                    if (!tflag) {
                        $scope.sendTclick($scope.tClickBase+'menu_Clk_Rst_'+$scope.mainMenu[idx].disp_no);
                    }

                    // 템플릿번호 중복 우회
                    if($scope.pageOptions.dispNo != $scope.mainMenu[idx].disp_no){
                        $scope.mainTemplateType = "";// ignored by watch
                    }
                    $timeout(function(){
                        $scope.mainTemplateType = $scope.mainMenu[idx].tmpl_no;// trigger watch
                    }, 1);

                    $scope.moveMenuSwipe(idx);
                    $scope.pageOptions.dispNo = $scope.mainMenu[idx].disp_no;
                    $scope.pageOptions.nodeIdx = idx;
                    $scope.screenID = "main-"+ $scope.mainMenu[idx].disp_no;
                }

                angular.element($window).on('scroll', function (evt) {
                    if (this.pageYOffset > angular.element('header').height()) {
                        angular.element('body').css("paddingTop",angular.element(el).height()+"px");
                        el[0].style.cssText = 'z-index:90;position:fixed;top:0px;width:100%;';
                    } else {
                        angular.element('body').css("paddingTop","0px");
                        el[0].style.cssText = '';
                    }

                    // 3.엘팟 아이콘 스크롤시 비노출
                    if (this.pageYOffset > 3000) {
                        if ($scope.appLpotIconFlag == true && $scope.appObj.isApp && $scope.appObj.isAndroid && $scope.appObj.verNumber >= 186) {
                            $scope.appLpotIconFlag == false;
                            try {
                                window.lottebridge.lpot(false);
                            } catch (e) {}
                        }
                    }
                });
            }
        };
    }]);

    app.directive('contentContainer', ['$window', 'storeliveService', '$compile', '$http', '$templateCache', '$parse', '$timeout', 'LotteForm', 'LotteCommon',
        function ($window, storeliveService, $compile, $http, $templateCache, $parse, $timeout, LotteForm, LotteCommon) {
            return {
                restrict: 'AEC',
                replace: true,
                link : function ($scope, el, attrs) {
                    function getTemplateFromType(tp) {
                        var url = "";

                        switch (tp) {
                            case "21315":
                                url = "/ellotte/resources_dev/main/template_brand.html";
                                break;
                            case "21312":
                                url = "/ellotte/resources_dev/main/template_custom.html";
                                break;
                            case "21311":
                                url = "/ellotte/resources_dev/main/template_event.html";
                                break;
                            case "21316":
                                url = "/ellotte/resources_dev/main/template_home_2018.html";
                                break;
                            case "0":
                            case "1":
                                url = "/ellotte/resources_dev/main/template_match.html";
                                break;
                            case "21317":
                                url = "/ellotte/resources_dev/main/template_best100.html";
                                break;
                            case "29811":
                                url = "/ellotte/resources_dev/main/template_elstagram.html";
                                break;
                            case "22211":
                                url = "/ellotte/resources_dev/main/template_theme.html";
                                break;
                            case "22212":
                                url = "/ellotte/resources_dev/main/template_theme2.html";
                                break;
                            case "22213":
                                url = "/ellotte/resources_dev/main/template_theme3.html";
                                break;
                            //case "22311": // 테마텝 4
                            //  break;
                            case "20412":
                                url = "/ellotte/resources_dev/main/template_plus.html";
                                break;
                            case "19411": // 명절관
                                url = "/ellotte/resources_dev/main/template_holiday.html";
                                break;
                            case "28411": // 백화점 라이브
                                url = "/ellotte/resources_dev/main/template_store_live.html";
                                break;
                            default:
                                url = "/ellotte/resources_dev/main/template_home_2018.html";
                                break;
                        }
                        //$scope.mainTemplateType = tp;
                        return url;
                    }

                    var prevScope,nowTemplate;

                    function loadTemplate(url) {
                        $http.get(url, { cache: $templateCache })
                            .success(function(templateContent) {
                                // console.log("Main Template
                                // Loading.."+scope.mainTemplateType);
                                //angular.element(el).html($compile(templateContent)($scope));
                                if (nowTemplate == $scope.mainTemplateType) {
                                    return ;
                                }

                                nowTemplate = $scope.mainTemplateType;

                                if (prevScope) {
                                    prevScope.$destroy();
                                    prevScope = null;
                                }

                                el.empty();

                                try {
                                    prevScope = $scope.$new();
                                    angular.element(el).html($compile(templateContent)(prevScope));
                                } catch (e) {}

                            }).error(function (data) {
                            console.log('Error Data : 데이터 로딩 에러');
                            $scope.pageLoading = false;
                        });
                    }

                    //loadTemplate(getTemplateFromType($scope.mainTemplateType));
                    $scope.$watch('mainTemplateType', function (newValue, oldValue) {
                        // console.log("메인 템플릿 변경:"+newValue);
                        //if(newValue === oldValue) {
                        // console.log(newValue,oldValue);
                        //    return;
                        //}
                        // $scope.pageLoading = true;
                        if(newValue == "") {
                            return;
                        }

                        var path = getTemplateFromType(newValue);
                        loadTemplate(path);

                        /*
                            ######## [ 백화점 라이브 ] ########
                             @20170901 박해원
                            백화점 라이브 추가코드 ( 운영:5581401, 스테이지:5562515 )
                        */
                        if( $scope.pageOptions.dispNo == '5581401' || $scope.pageOptions.dispNo == '5562515' ) {
                            // 백화점라이브 전용모듈실행 -> storeliveService -> template_store_live.js
                            $timeout(function(){
                                storeliveService.storeLiveShow();
                            },300);
                        } //백화점 라이브가 아닐경우에만 데이타 로드
                        else {
                            storeliveService.cacheMode = false; // 백화점 라이브가 아니면 전용캐쉬 사용안함
                            $scope.loadScreenData({dispNo:$scope.pageOptions.dispNo});
                        }

                        // 20170321 홈, 플러스딜 코너화 배너 구분 노출
                        if (path == "/ellotte/resources_dev/main/template_plus.html"){
                            homePlusCornnerBnr("plusdeal")
                        } else if(path == "/ellotte/resources_dev/main/template_home_2018.html"){
                            homePlusCornnerBnr("home")
                        };
                    });

                    // 20170321 홈, 플러스딜 코너화 배너 json 경로
                    function homePlusCornnerBnr(bnr){
                        $scope.bannerBox = null;
                        var previewstr = "";
                        if($scope.previewDate != undefined){
                            previewstr = "?preview=" + $scope.previewDate;
                        }
                        // 20170321 로드타이밍
                        $http.get("/json/main/main_belt_banner.json" + previewstr)
                            .success(function (data) {
                                if (data.belt_banner_info == undefined){
                                    return
                                }

                                var belt;
                                if (bnr == "plusdeal" && data.belt_banner_info.deal_belt_banner != undefined){
                                    belt = data.belt_banner_info.deal_belt_banner;
                                } else if(bnr == "home" && data.belt_banner_info.main_belt_banner != undefined){
                                    belt = data.belt_banner_info.main_belt_banner;
                                }

                                if(belt == undefined || belt.items == undefined || belt.items[0] == undefined || belt.items[0].img == undefined){
                                    return;
                                }

                                $scope.bannerBox = belt.items[0].img;
                                if ($scope.bannerBox.conts_desc_cont == undefined || $scope.bannerBox.conts_desc_cont == ""){
                                    $scope.bannerBox.conts_desc_cont = "#635d5f"
                                }

                                /*
                                if (data.belt_banner_info == undefined || data.belt_banner_info.main_belt_banner == undefined || data.belt_banner_info.main_belt_banner.items == undefined || data.belt_banner_info.main_belt_banner.items[0] == undefined || data.belt_banner_info.main_belt_banner.items[0].img == undefined){
                                    return
                                }

                                if (bnr == "plusdeal"){
                                    $scope.bannerBox = data.belt_banner_info.deal_belt_banner.items[0].img;
                                } else if(bnr == "home"){
                                    $scope.bannerBox = data.belt_banner_info.main_belt_banner.items[0].img;
                                }

                                if ($scope.bannerBox.conts_desc_cont == undefined || $scope.bannerBox.conts_desc_cont == ""){
                                    $scope.bannerBox.conts_desc_cont = "#820c58"
                                }
                                */
                            });
                    };

                    $scope.changeImageSize = function(url, from, to) {
                        var newUrl = "";

                        if (url != undefined || url != '') {
                            newUrl = url.replace("_"+from+".jpg","_"+to+".jpg");
                        }

                        return newUrl;
                    };

                    // 이벤트 사은 리스트
                    $scope.goEventSaun = function () {
                        $window.location.href = LotteCommon.eventSaunUrl + "?" + $scope.baseParam+"&tclick="+$scope.tClickBase+$scope.screenID+"_Clk_Btn_1"; // 구매사은상세
                    };

                    $scope.directEventClick = function (idx) {
                        var tclick = $scope.tClickBase+$scope.screenID+'_Clk_Btn_'+idx;
                        switch (idx) {
                            case 2: // 오프라인 이벤트
                                $scope.sendTclick(tclick);

                                if ($scope.appObj.isApp) {
                                    openNativePopup("오프라인 이벤트", "http://store.lotteshopping.com/handler/Event_F-StartProcess");
                                } else {
                                    window.open("http://store.lotteshopping.com/handler/Event_F-StartProcess");
                                }
                                break;
                            case 3: // 참 좋은 해택
                                window.location.href = LotteCommon.gdBenefitUrl + "?" + $scope.baseParam + "&tclick="+tclick;
                                break;
                            case 4: // 이벤트 당첨 확인
                                // 로그인 체크
                                if (!$scope.loginInfo.isLogin) {
                                    var targUrl = "&targetUrl="+encodeURIComponent($window.location.href, 'UTF-8');
                                    window.location.href = LotteCommon.loginUrl+"?"+$scope.baseParam+ targUrl + "&tclick="+tclick;
                                } else {
                                    window.location.href = LotteCommon.eventGumeUrl + "?" + $scope.baseParam + "&tclick="+tclick;
                                }
                                break;
                        }
                    }

                    /*
                     * ===========================================================================
                     * 일반 링크 배너 클릭 동작
                     */
                    $scope.bannerLinkClick = function (item, tclick) {
                        if (item.link_url == '' || item.link_url == '#' || item.link_url == undefined) {
                            console.log("LINK ERROR :: 링크 없음");
                            console.log(item);
                            return false;
                        }

                        var url = item.link_url+((item.link_url.indexOf("?")!=-1)?"&":"?")+$scope.baseParam;

                        if (tclick != '') {
                            url += "&tClick="+tclick;
                        }

                        if ($scope.curDispNoSctCd != '') {
                            url+= '&curDispNoSctCd='+$scope.curDispNoSctCd
                        }

                        window.location.href = url;
                    };

                    // 메인 일반/아웃 링크 처리
                    $scope.linkUrl = function (url, outlinkFlag, tclick, addParams) {
                        if (outlinkFlag) {
                            $scope.sendOutLink(url); // 외부 링크 보내기 (새창)

                            if (tclick) { // tclick이 있다면
                                $scope.sendTclick(tclick); // 외부링크일때 iframe으로 tclick 전송
                            }
                        } else {
                            var url = url+((url.indexOf("?")!=-1)?"&":"?")+$scope.baseParam;

                            if (addParams) { // 추가 파라메타가 있다면
                                angular.forEach(addParams, function (val, key) {
                                    url += "&" + key + "=" + val;
                                });
                            }

                            if (tclick) { // tclick 이 있다면 url 뒤에 parameter를 추가한다.
                                url += "&tclick=" + tclick;
                            }

                            window.location.href = url; // url 이동
                        }
                    };

                    /*
                     * ===========================================================================
                     */
                    /*
                     * 마케팅배너 클릭
                     */
                    $scope.marketingBannerClick = function (item) {
                        $scope.bannerLinkClick(item.img,$scope.tClickBase+$scope.screenID+'_Clk_Ban_A'+(this.$index+1));
                    };

                    $scope.marketingBannerClick2 = function (item) {
                        $scope.bannerLinkClick(item.img,$scope.tClickBase+$scope.screenID+'_Clk_Ban_B'+(this.$index+1));
                    };

                    /*
                     * 기획전배너 클릭
                     */
                    $scope.planshopBannerClick = function (item) {
                        $scope.bannerLinkClick(item.img,$scope.tClickBase+$scope.screenID+'_Swp_Ban_idx'+(this.$index+1));
                    };

                    $scope.planshopBannerClick2 = function (item) {
                        $scope.bannerLinkClick(item.img,$scope.tClickBase+$scope.screenID+'_Clk_Ban_B'+(this.$index+1));
                    };

                    $scope.planshopBannerClick3 = function (item) {
                        $scope.bannerLinkClick(item.img,$scope.tClickBase+$scope.screenID+'_Clk_Ban_A'+(this.$index+1));
                    };

                    /*
                     * PC와 같은 코너를 사용하는경우 설명부분에 링크URL이 들어 온다.
                     */
                    $scope.connerLinkClick = function (item, tclick) {
                        if (item.img.conts_desc_cont != '') {
                            var url = item.img.conts_desc_cont + ((item.img.conts_desc_cont.indexOf('?') != -1) ? "&" : "?") + $scope.baseParam;

                            if ($scope.curDispNoSctCd != '') {
                                url += '&curDispNoSctCd=' + $scope.curDispNoSctCd;
                            }

                            if (tclick != '' || tclick != undefined) {
                                url += '&tclick='+tclick;
                            }

                            window.location.href = url;
                        } else {
                            console.log("ERROR :: 링크 없음");
                            console.log(item);
                        }
                    };

                    $scope.connerProductLinkClick = function (item, item2, tclick) {
                        if (item.img.conts_desc_cont != '') {
                            var url = item.img.conts_desc_cont + ((item.img.conts_desc_cont.indexOf('?') != -1) ? "&" : "?") + $scope.baseParam + "&recent_goods_no=" + item2.goods_no + "&" + $scope.baseParam;

                            if ($scope.curDispNoSctCd != '') {
                                url += '&curDispNoSctCd=' + $scope.curDispNoSctCd;
                            }

                            if (tclick != '' || tclick != undefined) {
                                url += '&tclick=' + tclick;
                            }

                            window.location.href = url;
                        } else {
                            console.log("ERROR :: 링크 없음");
                            console.log(item);
                        }
                    };

                    /**
                     * 홈 탭 링크 이동
                     */
                    $scope.homeLink2017 = function(url, tclick){

                        if(url == undefined){ return; }


                        url = url + ((url.indexOf("?") < 0) ? "?" : "&") + $scope.baseParam;

                        if($scope.curDispNoSctCd != ""){
                            url += '&curDispNoSctCd=' + $scope.curDispNoSctCd;
                        }

                        if( ! (tclick == undefined || tclick == "") ){
                            tclick = $scope.tClickBase + $scope.TCLICK_PREFIX + tclick;
                            url += "&tclick=" + tclick;
                        }
                        //console.warn(tclick); return;
                        window.location.href = url;
                    };

                    /**
                     * 홈 탭 상품 링크 이동
                     */
                    $scope.homeProdLink2017 = function(item, tclick, reco){
                        if(item.limit_age_yn == 'Y' || item.pmg_byr_age_lmt_cd == '19') {
                            if (!$scope.loginInfo.isAdult && $scope.loginInfo.isLogin) { /*19금 상품이고 본인인증 안한 경우*/
                                // alert("이 상품은 본인 인증 후 이용하실 수 있습니다.");
                                $scope.goAdultSci();
                                return false;
                            } else if(!$scope.loginInfo.isLogin) {
                                window.location.href = LotteCommon.loginUrl + '?'+$scope.baseParam + '&adultChk=Y'+"&targetUrl=" + encodeURIComponent(window.location.href, 'UTF-8');
                                return false;
                            } else if (!$scope.loginInfo.isAdult) {
                                alert("이 상품은 법률규정에 의하여 만 19세 이상 성인만 조회 및 구매가 가능합니다.");
                                return false;
                            }
                        }
                        var curDispNo = "";
                        if($scope.curDispNo) {
                            curDispNo = "&curDispNo=" + $scope.curDispNo;
                        } else if (item.curDispNo) {
                            curDispNo = "&curDispNo=" + item.curDispNo;
                        }

                        var curDispNoSctCd = "";
                        if ($scope.curDispNoSctCd) {
                            curDispNoSctCd = "&curDispNoSctCd=" + $scope.curDispNoSctCd;
                        } else if (item.curDispNoSctCd) {
                            curDispNoSctCd = "&curDispNoSctCd=" + item.curDispNoSctCd;
                        }

                        var path = LotteCommon.prdviewUrl + "?" + $scope.baseParam + "&goods_no=" + item.goods_no + curDispNo + curDispNoSctCd;
                        if( ! (tclick == undefined || tclick == "") ){
                            tclick = $scope.tClickBase + $scope.TCLICK_PREFIX + tclick;
                            path += "&tclick=" + tclick;
                        }

                        if(reco){
                            path += "&" + reco;
                        }
                        //console.warn(tclick); return;
                        window.location.href = path;
                    };

                    /**
                     * 메인메뉴 탭으로 이동
                     */
                    $scope.gotoMainTab = function(disp_no){
                        if(disp_no == undefined){ return; }

                        var obj, itm, idx;
                        var len = $scope.mainMenu.length;
                        for(var i=0; i<len; i++){
                            obj = $scope.mainMenu[i];
                            if(obj.disp_no == disp_no){
                                itm = obj;
                                idx = i;
                                break;
                            }
                        }

                        if(itm != undefined){
                            //$scope.sendTclick($scope.tClickBase+'menu_Swp_Rst_'+$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no);
                            $scope.menuClick(itm, idx, true);
                        }
                    };

                    /*
                     * 브랜드 행사 상단 목록
                     */
                    $scope.BrandConnerLinkClick = function (item) {
                        $scope.connerLinkClick(item,$scope.tClickBase + $scope.screenID + '_Clk_Ban_C' + (this.$index + 1));
                    };

                    /*
                     * 브랜드행사 기획전 상품 위의 이미지 클릭
                     */
                    $scope.BrandConnerProductLinkClick = function (item) {
                        $scope.connerLinkClick(item,"");
                    };

                    /*
                     * 브랜드행사 기획전 추천이미지배너 이미지 클릭
                     */
                    $scope.BrandConnerRecomLinkClick = function (item, item2) {
                        $scope.connerProductLinkClick(item, item2,$scope.tClickBase+$scope.screenID+'_Clk_Prd_C'+(this.$parent.$index+1)+'_'+(this.$index+1));
                    };

                    /*
                     * 브랜드행사 기획전 추천이미지배너 이미지 클릭
                     */
                    $scope.BrandConnerRecomLinkClick2 = function (item) {
                        $scope.connerLinkClick(item,$scope.tClickBase+$scope.screenID+'_Clk_Ban_D'+(this.$index+1));
                    };

                    /*
                     * 기획전 상품 의 이미지 클릭
                     */
                    $scope.planBannerImageClick = function (item, tclick) {
                        if (item.img.link_url != '') {
                            window.location.href = item.img.link_url + "&" + $scope.baseParam + "&tclick=" + tclick;
                        } else {
                            console.log("ERROR :: 링크 없음");
                            console.log(item);
                        }
                    };

                    $scope.planBannerImageClick2 = function (item) {
                        $scope.planBannerImageClick(item, $scope.tClickBase + $scope.screenID + '_Clk_Ban_A' + (this.$index + 1));
                    };

                    /*
                     * 테마텝 3 배너 클릭
                     */
                    $scope.themeImageBannerClick = function (item) {
                        $scope.planBannerImageClick(item, $scope.tClickBase + $scope.screenID + '_Clk_Ban_idx' + (this.$index + 1));
                    }

                    $scope.themeTextBannerClick = function (item) {
                        if (item.text.link_url != '') {
                            window.location.href = item.text.link_url + "&" + $scope.baseParam + "&tclick=" + $scope.tClickBase + $scope.screenID + '_Clk_Ban_idx' + (this.$index + 1);
                        } else {
                            console.log("ERROR :: 링크 없음");
                            console.log(item);
                        }
                    };

                    /*
                     * 기획전 상품 클릭
                     */
                    $scope.planProductClick = function (item, item2, tclick) {
                        if (item.img.link_url != '') {
                            var url = item.img.link_url + "&recent_goods_no=" + item2.goods_no + "&" + $scope.baseParam;

                            if (tclick != null && tclick != '') {
                                url += "&tclick="+tclick;
                            }

                            window.location.href = url;
                        } else {
                            console.log("ERROR :: 링크 없음");
                            console.log(item);
                            console.log(item2);
                        }
                    };

                    /*
                     * 브랜드 쇼핑홀릭 기획전 클릭
                     */
                    $scope.brandPlanProductClick = function (item, item2) {
                        $scope.planProductClick(item, item2, $scope.tClickBase + $scope.screenID + '_Clk_Prd_' + (this.$parent.$index + 1) + "_" + (this.$index + 1));
                    };

                    /*
                     * 카드행사배너 클릭
                     */
                    $scope.cardBannerClick = function (item) {
                        $scope.bannerLinkClick(item.text, $scope.tClickBase + $scope.screenID + '_Clk_Lnk_' + (this.$index + 1));
                    };

                    $scope.cardBannerClick2 = function (item) {
                        $scope.bannerLinkClick(item.text, $scope.tClickBase + $scope.screenID + '_Clk_Btn_idx' + (this.$index + 1));
                    };

                    /*
                     * 이벤트 배너 클릭
                     */
                    $scope.eventBannerClick = function (item) {
                        $scope.bannerLinkClick(item.img, $scope.tClickBase + $scope.screenID + '_Clk_Ban_B' + (this.$index + 1));
                    };

                    $scope.eventBannerClick2 = function (item) {
                        $scope.bannerLinkClick(item, $scope.tClickBase + $scope.screenID + '_Clk_Ban_C' + (this.$index + 1));
                    };

                    /*
                     * 신규 브랜드 배너 클릭
                     */
                    $scope.newBrandShopBannerClick = function (item) {
                        $scope.bannerLinkClick(item.img, $scope.tClickBase + $scope.screenID + '_Clk_Ban_C' + (this.$index + 1));
                    };

                    /*
                     * 신규 브랜드 상품 클릭
                     */
                    $scope.newBrandShopClick = function (item, item2) {
                        $scope.planProductClick(item,item2, $scope.tClickBase + $scope.screenID + '_Clk_Prd_C' + (this.$parent.$index + 1) + "_" + (this.$index + 1));
                    };

                    /*
                     * 플러스딜 순서 정렬
                     */
                    $scope.listOrderChange = function (idx) {
                        $scope.sendTclick('m_EL_main_5542202' + '_Clk_Rst_' + (idx + 1));
                        $scope.pageOptions.plusDealOrder = idx;
                        $scope.storedData[$scope.pageOptions.nodeIdx] = false;
                        $scope.loadScreenData({dispNo:$scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no,opt:idx,keepData:true,ctgDispNo:$scope.pageOptions.ctgDispNo,subCtgDispNo:$scope.pageOptions.subCtgDispNo});
                    };

                    /*
                     * 플러스딜 상품 더보기
                     */
                    $scope.morePlusdealList = function () {
                        $scope.bannerLinkClick(item, '');
                    };

                    /*
                     * 배스트 브랜드 클릭
                     */
                    $scope.bestBrandClick = function (item) {
                        $scope.bannerLinkClick(item.brand, $scope.tClickBase + $scope.screenID + '_Clk_Gol_' + (this.$index + 1));
                    };

                    /*
                     * 브랜드 플랜샵 클릭
                     */
                    $scope.brandPlanshopClick = function (item) {
                        $scope.bannerLinkClick(item.img, $scope.tClickBase + $scope.screenID + '_Clk_Ban_B' + (this.$index + 1));
                    };

                    $scope.brandPlanshopBannerClick = function (item) {
                        $scope.bannerLinkClick(item, $scope.tClickBase + $scope.screenID + '_Clk_Ban_B' + (this.$index + 1));
                    };

                    /*
                     * VIP 텝클릭
                     */
                    $scope.vipTabClick = function (idx) {
                        $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_tap_' + (idx + 1));
                        $scope.pageOptions.viptab = idx;
                    };

                    /*
                     * 쇼핑홀릭 클릭
                     */
                    $scope.shoppingholicClick = function (item) {
                        $scope.bannerLinkClick(item, $scope.tClickBase + $scope.screenID + '_Clk_Ban_C' + (this.$index + 1));
                    };

                    /*
                     * 단골지점 선택
                     */
                    $scope.showSelectDepartmentStore = function () {
                        $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_Btn_1');
                        $scope.pageOptions.myDeptNo = $scope.screenData.dept_store.dept_branch_no;
                        $scope.dimmedOpen({target:"selectDept",callback:this.closeSelectDepartmentStore})
                        $scope.pageOptions.myDeptSelectShow = true;
                    };

                    $scope.closeSelectDepartmentStore = function () {
                        if ($scope.pageOptions.myDeptSelectShow) {
                            $scope.pageOptions.myDeptSelectShow = false;
                            $scope.dimmedClose();
                        }
                    };

                    $scope.selectMyDepartmentStore = function (item) {
                        LotteForm.FormSubmitForAjax(LotteCommon.updateMyDept, {ELLT_DISP_NO: item.dept_no})
                            .success(function (data) {
                                if (data.result.response_code == "0000") {
                                    alert(data.result.response_msg);
                                }

                                $scope.storedData[$scope.pageOptions.nodeIdx] = false;
                                $scope.loadScreenData({
                                    dispNo: $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no,
                                    brchDispNo: item.dept_no
                                });
                                $scope.getDepartmentStoreList();
                                $scope.dimmedClose();
                            }).error(function (data) {
                            console.log('Error Data : 데이터 로딩 에러');
                            $scope.pageLoading = false;
                        });
                    };

                    $scope.categorySelectClick = function (idx) {
                        // console.log($scope.screenData.category_1depth_list);
                        if ($scope.pageOptions.cateShow[idx] == true) {
                            $scope.pageOptions.cateShow = [false,false,false];
                        } else {
                            $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_Rst_A' + (idx + 1));

                            var el = angular.element("#cateSwipe" + idx);

                            $timeout(function () {
                                el.css("height",el.find('li:eq(0)').height());
                            });

                            $scope.pageOptions.cateShow = [false, false, false];
                            $scope.pageOptions.cateShow[idx] = true;
                        }
                    };

                    /*
                     * 베스트 카테고리 변경
                     */
                    $scope.categoryChoiceClick = function (node, item) {
                        var loadContents = {realtime_best_prod_list:true};
                        var cateGrpNo = "";

                        switch (node) {
                            case 0:
                                if (item.disp_no == 0) {
                                    $scope.pageOptions.cate1 = 0;
                                    $scope.pageOptions.cate1nm = "전체"
                                    $scope.pageOptions.cateShowDepth=0;
                                    $scope.pageOptions.cateDepthTypeCd = "";
                                    $scope.pageOptions.cateSelected = 0;
                                } else {
                                    $scope.pageOptions.cate1nm = item.disp_nm;
                                    $scope.pageOptions.cate1 = item.disp_no;
                                    $scope.getSubCategory(item.disp_no,0);
                                    $scope.pageOptions.cateGrpNo = item.disp_grp_no;
                                    cateGrpNo = item.disp_grp_no;
                                    $scope.pageOptions.cateShowDepth=1;
                                    $scope.pageOptions.cateDepthTypeCd = "R2";
                                    $scope.pageOptions.cateSelected = item.disp_no;
                                }

                                $scope.pageOptions.cate2nm = "전체";
                                $scope.pageOptions.cate3nm = "전체";
                                $scope.pageOptions.cate2 = 0;
                                $scope.pageOptions.cate3 = 0;
                                break;
                            case 1:
                                if (item.disp_no == 0) {
                                    $scope.pageOptions.cate2 = 0;
                                    $scope.pageOptions.cate2nm = "전체";
                                    $scope.pageOptions.cateShowDepth=1;
                                    $scope.pageOptions.cateDepthTypeCd = "R2";
                                    $scope.pageOptions.cateSelected = $scope.pageOptions.cate1;
                                } else {
                                    $scope.pageOptions.cate2nm = item.disp_nm;
                                    $scope.pageOptions.cate3nm = "전체"
                                    $scope.pageOptions.cate2 = item.disp_no;
                                    $scope.pageOptions.cate3 = 0;
                                    $scope.pageOptions.cateShowDepth=2;
                                    // $scope.getSubCategory(item.disp_no,1);
                                    $scope.pageOptions.cateDepthTypeCd = "R3";
                                    $scope.pageOptions.cateSelected = item.disp_no;
                                    $scope.resetAgeGender();
                                }
                                break;
                            // case 2:
                            //  if (item.disp_no == $scope.pageOptions.cate3) {
                            //      $scope.pageOptions.cate3 = 0;
                            //      $scope.pageOptions.cate3nm = "전체";
                            //      $scope.pageOptions.cateDepthTypeCd = "R2";
                            //      $scope.pageOptions.cateSelected = $scope.pageOptions.cate2;
                            //  } else {
                            //      $scope.pageOptions.cate3nm = item.disp_nm;
                            //      $scope.pageOptions.cate3 = item.disp_no;
                            //      $scope.pageOptions.cateDepthTypeCd = "R3";
                            //      $scope.pageOptions.cateSelected = item.disp_no;
                            //  }
                            //  break;
                        }

                        $scope.pageOptions.cateShow = [false,false,false];
                        $scope.reSearchLoading = true;
                        $scope.productMoreScroll = true;
                        $scope.screenData.pageEnd = false;
                        $scope.loadScreenData({
                            keepData: true,
                            dispNo: $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no,
                            gen_sct_cd: $scope.pageOptions.genderCode,
                            age_sct_cd: $scope.pageOptions.age,
                            category_no: $scope.pageOptions.cateSelected,
                            category_grp_no: cateGrpNo,
                            loadContents:loadContents
                        });
                    };

                    /*
                     * 연령 변경
                     */
                    $scope.changeAgeOption = function () {
                        var loadContents = {realtime_best_prod_list: true};

                        $scope.pageOptions.cate3 = 0;
                        $scope.pageOptions.cate3nm = "전체";

                        var cateNo = false;
                        var cateGrpNo = false;

                        cateNo = $scope.pageOptions.cate1;
                        cateGrpNo = $scope.pageOptions.cateGrpNo;

                        $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_Rst_C' + $scope.pageOptions.age);

                        $scope.reSearchLoading = true;
                        $scope.productMoreScroll = true;
                        $scope.screenData.pageEnd = false;
                        $scope.loadScreenData({
                            keepData: true,
                            dispNo: $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no,
                            gen_sct_cd: $scope.pageOptions.genderCode,
                            age_sct_cd: $scope.pageOptions.age,
                            category_no: cateNo,category_grp_no:cateGrpNo,
                            loadContents:loadContents});
                    }
                    /*
                     * 성별 변경
                     */
                    $scope.changeGenderOption = function (item) {
                        var loadContents = {realtime_best_prod_list: true};

                        $scope.pageOptions.cate3 = 0;
                        $scope.pageOptions.cate3nm = "전체";
                        $scope.pageOptions.gender = item != null ? item.cd : "";

                        if (item != null) {
                            if (item.cd == 'F') {
                                $scope.sendTclick($scope.tClickBase+$scope.screenID+'_Clk_Rst_B2');
                            } else {
                                $scope.sendTclick($scope.tClickBase+$scope.screenID+'_Clk_Rst_B3');
                            }

                            $scope.pageOptions.genderCode = item.cd;
                        } else {
                            $scope.sendTclick($scope.tClickBase+$scope.screenID+'_Clk_Rst_B1');
                            $scope.pageOptions.genderCode = "A";
                        }

                        var cateNo = false;
                        var cateGrpNo = false;

                        cateNo = $scope.pageOptions.cate1;
                        cateGrpNo = $scope.pageOptions.cateGrpNo;

                        $scope.reSearchLoading = true;
                        $scope.productMoreScroll = true;
                        $scope.screenData.pageEnd = false;
                        $scope.loadScreenData({
                            keepData: true,
                            dispNo: $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no,
                            gen_sct_cd: $scope.pageOptions.genderCode,
                            age_sct_cd: $scope.pageOptions.age,
                            category_no: cateNo,
                            category_grp_no: cateGrpNo,
                            loadContents: loadContents
                        });
                    };

                    /*
                     * 브랜드 탭 오픈
                     */
                    $scope.openBrandTab = function () {
                        $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_Btn_1');

                        if($scope.appObj.isApp && !$scope.appObj.isOldApp) {
                            openSideCategoryMenu("brand");
                        } else {
                            $timeout(function () {
                                $scope.$apply(function () {
                                    $scope.showSideCtgHeader(true);
                                    $scope.changeCtgTab(1,true);
                                });
                            })
                        }
                    };

                    /*
                     * 층별 안내
                     */
                    $scope.floorInfoClick = function () {
                        $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_Btn_3');

                        if ($scope.appObj.isApp) {
                            openNativePopup("층별 안내", "http://store.lotteshopping.com/handler/StairGuide_F-BaseInfoSearch?subBrchCd="+$scope.screenData.dept_store.dept_branch_no);
                        } else {
                            window.open("http://store.lotteshopping.com/handler/StairGuide_F-BaseInfoSearch?subBrchCd="+$scope.screenData.dept_store.dept_branch_no);
                        }
                    };

                    /*
                     * 플러스딜 더보기
                     */
                    $scope.morePlusdealClick = function () {
                        $scope.findMenuNodeIdx("5542202");

                        if ($scope.mainMenu[$scope.pageOptions.nodeIdx]) {
                            $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_Btn_1');

                            $scope.mainTemplateType = $scope.mainMenu[$scope.pageOptions.nodeIdx].tmpl_no;
                            $scope.pageOptions.dispNo = $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                            $scope.screenID = "main-" + $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                            angular.element($window).scrollTop(0);

                            $timeout(function () {
                                $scope.moveMenuSwipeFnc($scope.pageOptions.nodeIdx, true);
                            }, 300);
                        }
                    };

                    /*
                     * 추천상품 더보기
                     */
                    $scope.moreMatchProductClick = function () {
                        $scope.findMenuNodeIdx("5538667");

                        if ($scope.mainMenu[$scope.pageOptions.nodeIdx]) {
                            $scope.sendTclick($scope.tClickBase + $scope.screenID + '_Clk_Btn_2');

                            $scope.mainTemplateType = $scope.mainMenu[$scope.pageOptions.nodeIdx].tmpl_no;
                            $scope.pageOptions.dispNo = $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                            $scope.screenID = "main-"+ $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                            angular.element($window).scrollTop(0);

                            $timeout(function () {
                                $scope.moveMenuSwipeFnc($scope.pageOptions.nodeIdx, true);
                            }, 300);
                        }
                    };

                    $scope.mainProductClick = function (item, tclick) {
                        var url = LotteCommon.prdviewUrl + "?" + $scope.baseParam + "&goods_no=" + item.goods_no + "&tclick=" + tclick;

                        if ($scope.curDispNoSctCd != '') {
                            url += "&curDispNoSctCd=" + $scope.curDispNoSctCd;
                        }

                        url += "&curDispNo=" + $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;
                        window.location.href = url;
                    };

                    /*
                     * 맞춤상품 클릭
                     */
                    $scope.matchProductClick = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Clk_Rel_A" + (this.$index + 1) + "&_reco=M_main";

                        $scope.mainProductClick(item,tClickCode);
                    };

                    $scope.matchProductClick2 = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Clk_Prd_idx" + (this.$index + 1) + "&_reco=M_main";

                        $scope.mainProductClick(item,tClickCode);
                    };

                    /*
                     * 연관 배스트 상품 클릭
                     */
                    $scope.relationBestProductClick = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Clk_Prd_" + (this.$index + 1);

                        $scope.mainProductClick(item,tClickCode);
                    };

                    /*
                     * 마지막 본 상품 클릭
                     */
                    $scope.lastViewProductClick = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Clk_Prd_" + (this.$index + 1);

                        $scope.mainProductClick(item,tClickCode);
                    };

                    /*
                     * 연관 상품 클릭
                     */
                    $scope.relateionProductClick = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Swp_Rel_" + (this.$parent.$index + 1) + "_" + (this.$index + 1);

                        $scope.mainProductClick(item,tClickCode);
                    };

                    /*
                     * 단골매장 DM 쿠폰북 클릭
                     */
                    $scope.dmCouponBookClick = function (item) {
                        $scope.sendTclick($scope.tClickBase+$scope.screenID+"_Clk_Nwv_2");

                        if ($scope.appObj.isApp) { // 엡에서의 링크 처리
                            openNativePopup("DM 쿠폰북", item.link_url);
                        } else {
                            window.open(item.link_url,"_blank");
                            return false;
                        }
                    };

                    /*
                     * 단골매장 라이브 배너 클릭
                     */
                    $scope.liveBannerClick = function (item) {
                        $scope.bannerLinkClick(item,$scope.tClickBase + $scope.screenID + '_Clk_Ban_C');
                    };

                    /*
                     * 단골매장 상품 클릭
                     */
                    $scope.customProductClick = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Clk_Prd_A" + (this.$index + 1);

                        $scope.mainProductClick(item,tClickCode);
                    };

                    $scope.customProductClick2 = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Clk_Prd_B" + (this.$index + 1);

                        $scope.mainProductClick(item,tClickCode);
                    };

                    /*
                     * 테마텝2 배너 클릭
                     */
                    $scope.themeTab2Click = function (item) {
                        var tClickCode = $scope.tClickBase + $scope.screenID + "_Clk_Ban_" + (this.$index + 1) + "&curDispNoSctCd=62&curDispNo=" + $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no;

                        window.location.href = item.img.link_url + ((item.img.link_url.indexOf("?") != -1) ? "?" : "&") + $scope.baseParam + "&tclick=" + tClickCode;
                    };

                    /*
                     * 플러스딜 카테고리 클릭(완판딜)
                     */


                    $scope.nPlusCateClick=function(index,item,event){
                        $scope.screenData.nplusCateIndex = index;
                        $scope.screenData.nplusSubCateIndex=0;
                        $scope.screenData.selectSubCateList =  item.sub_cate_list;//선택된 대카테의 서브카테 리스트
                        $scope.pageOptions.ctgDispNo= item.disp_no;//선택된 대카테 전시코드
                        $scope.nPlusSubCateClick(0,$scope.screenData.selectSubCateList!=null?$scope.screenData.selectSubCateList[0]:item);//대카테 전체 는 서브 카테가 없다
                    }

                    /*
                     * 플러스딜 서브 카테고리 클릭(완판딜)
                     */

                    $scope.nPlusSubCateClick= function(index,item,event){
                        nPlusInit();//초기화
                        $scope.screenData.nplusSubCateIndex = index;
                        $scope.pageOptions.subCtgDispNo = item.disp_no!="5542202"? item.disp_no:"";//선택된 소카테 전시코드(대카테 전체는 서브카테 전시코드 보내지 않음)
                        event==undefined?$scope.pageOptions.ctgClkCode +=$scope.pageOptions.ctgDispNo+"_Clk_Bigcate":$scope.pageOptions.ctgClkCode +=item.disp_no+"_Clk_Midcate";
                        $scope.sendTclick($scope.pageOptions.ctgClkCode);//카테 클릭시 티클릭 전송 (대카테, 서브카테 티클릭 코드 다름)
                        $scope.productListLoading = true;
                        $scope.loadScreenData( {
                            dispNo: "5542202", // 플러스딜 전시번호 dispNo 는 고정
                            keepData: true, // 전체 데이터 갱신이 아닐 경우 true
                            page : ++$scope.screenData.page,
                            ctgDispNo:$scope.pageOptions.ctgDispNo,//선택된 대카테 전시코드
                            subCtgDispNo:item.disp_no//선택된 소카테 전시코드
                        });
                    }

                    /*
                     *  플러스딜 초기화(완판딜)
                     */

                    function nPlusInit(){
                        $scope.screenData.plusDealGoodsListItems=[];//상품 리스트
                        $scope.screenData.bannerMixContents=[];//믹스데이터
                        $scope.screenData.plusDealBeltBanners=[];//벨트베너
                        $scope.pageOptions.ctgClkCode="m_EL_main_5542202_";//플러스딜 티클릭 공통앞자리
                        $scope.screenData.page= 0;//페이지 초기화
                        $scope.pageOptions.plusDealOrder=0//정렬순서 초기화
                        $scope.screenData.pageEnd = false;//마지막 페이지 초기화
                        $scope.productMoreScroll = true;
                    }
                }

            };
        }]);


    app.directive('calendarHoliday', [function () {
        return {
            replace: true,
            link: function (scope, el, attrs) {
                scope.getFirstDay = function (year, month) { // 첫째요일
                    return new Date(year, month, 1).getDay();
                };

                scope.getLastDay = function (year, month) { // 마지막날짜
                    return new Date(year, month + 1, 0).getDate();
                };

                scope.addZero = function (n) {
                    return n < 10 ? "0" + n : n;
                };

                scope.date = new Date();
                scope.firstDay = scope.getFirstDay(scope.date.getFullYear() , scope.date.getMonth() );
                scope.lastDay = scope.getLastDay(scope.date.getFullYear() , scope.date.getMonth() );
                scope.dateHead = ['SUN','MON','TUE','WED','THU','FRI','SAT'];

                scope.calendarHoliday = false;

                scope.calendarHolidayClick = function () {
                    scope.sendTclick(scope.tClickBase + scope.screenID + '_Clk_Btn_2');
                    scope.dimmedOpen({
                        target: "calendarHoliday",
                        callback: this.calenderHolidayClose
                    });
                    scope.calendarHoliday = true;
                };

                scope.calenderHolidayClose = function () {
                    if (scope.calendarHoliday) {
                        scope.calendarHoliday = false;
                        scope.dimmedClose();
                    }
                };

                // biz_dd_sct_class_nms : 영업일 구분 클래스명 배열 (달력 표기용) data 받아옴 (7 x
                // 6 = 42)
                // scope.bizDdSctData = [];
                scope.makeDays = function () {
                    scope.day = [];

                    for (var i = 0 ; i < scope.firstDay ; i++) {
                        scope.day.push("");
                    }

                    for (var i = 0 ; i < scope.lastDay ; i++) {
                        scope.day.push((i + 1));
                    }

                };
                scope.makeDays();
            }
        };
    }]);

    app.directive('lotteContainer',['$timeout', function ($timeout) {
        return {
            templateUrl: '/ellotte/resources_dev/main/main_ellotte_phone_container.html',
            replace: true,
            link: function ($scope, el, attrs) {
                var onMainOrientationChange = function () {
                    angular.element(".pageLoading").css("min-height",(window.innerHeight - 95) + "px");
                    if (window.innerWidth > 320) {
                        $scope.pageOptions.showBanner = false;
                    } else {
                        $timeout(function () {
                            $scope.pageOptions.showBanner = true;
                            $scope.$apply();
                        });
                    }
                };

                if (window.innerWidth > 320) {
                    $scope.pageOptions.showBanner = false;
                } else {
                    $scope.pageOptions.showBanner = true;
                }

                angular.element(".pageLoading").css("min-height", (window.innerHeight - 95) + "px");
                angular.element(window).bind('orientationchange resize', onMainOrientationChange);
            }
        }
    }]);
    
    // Holiday Template Directive (명절관 템플릿)
    app.directive('templateHoliday', ['$timeout', 'LotteCommon', function ($timeout, LotteCommon) {
        return {
            link: function ($scope, el, attrs) {

				// [명절관] 티클릭
				var holidayBaseTclick = "m_EL_main-5550815_";

                $scope.opt_dispno = $scope.pageOptions.holidayTabIdx ? $scope.pageOptions.holidayTabIdx : 0; // 명절 탭 랜덤으로 가져오기
                $scope.screenID = "main-"+ $scope.pageOptions.dispNo + "_TAB" + ($scope.opt_dispno + 1); // 티클릭 위해 screenID 가져오기

                $scope.holidayMenu = function(idx) {
                    $scope.screenID = "main-"+ $scope.pageOptions.dispNo + "_TAB" + (idx + 1);
                    $scope.screenData.pageEnd = false;
                    $scope.opt_dispno = idx; // 명절 카테고리 데이터 지정
                    $scope.pageOptions.holidayTabIdx = $scope.opt_dispno; // 클릭한 카테고리 id 세션데이터도 갱신
					$scope.bbi($scope.opt_dispno); // [명절관] 상단 카테고리 탭

                    var params = {
                        dispNo: $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no, // 전시번호 (해당 전시번호에 속한 카테고리 정보를 조회하기 위한 값)
                        keepData: true, // 전체 데이터 갱신이 아닐 경우 true
                        opt_dispno: $scope.opt_dispno, // 명절 카테고리
                        loadContents: {el_deal_goods_list:true, event_banner_list:true}
                    };
                    $scope.loadScreenData(params);
                    $scope.sendTclick(holidayBaseTclick + 'Clk_Prd_B'+ (idx + 1) + '_01'); // 카테고리 메뉴 티클릭
                };
                    
                $scope.getProductData = function () {
                    $scope.loadScreenData({
                        dispNo: $scope.mainMenu[$scope.pageOptions.nodeIdx].disp_no, // 전시번호 (해당 전시번호에 속한 카테고리 정보를 조회하기 위한 값)
                        keepData: true, // 전체 데이터 갱신이 아닐 경우 true
                        opt_dispno: $scope.opt_dispno, // 명절 카테고리
                        page : ++$scope.screenData.page // 페이지
                    });
                };

				// [명절관] 상단 카테고리 네비(html코너) 클릭 바인딩
				$scope.holidayTopNav = function (){
						
						$scope.bbi = function (ldx){
							if (angular.element("section > div.holiday_category_tab ul > li").length>0){
								var $listAll = angular.element("section > div.holiday_category_tab ul > li"),
									list = $listAll.eq(ldx);
								
								var imgSrc01 = list.find("img").attr("src").replace("_off","_on");
								
								list.find("img").attr("src", imgSrc01);
								
								var imgSrc02 = list.find("img").attr("src").replace("_on","_off");
							
								list.siblings().each(function(idx, itm){
									
									var sblist = $(itm).find("img").attr("src");
									//console.log("%o sblist", sblist.indexOf("_on"));
									if (sblist.indexOf("_on") >-1){
										$(itm).find("img").attr("src", sblist.replace("_on","_off"));
									};

								});
							};
						};

						 $scope.bbi($scope.opt_dispno);
						angular.element("section > div.holiday_category_tab ul > li").on("click", function(){
							//console.log(angular.element(this));
							var idx = angular.element(this).index();
							//var list = angular.element(this);
			
							$scope.holidayMenu(idx);

							// 상단 카테고리 클릭시 하단 카테고리영역으로 앵커처리
							$('html,body').animate({scrollTop:$('.holiday_ctg_prod').offset().top-angular.element("#gnb").height()}, 0);

							//console.log($scope.screenData.top_ban_list, "eee", idx);

							$timeout(function(){
								$scope.bbi(idx);
							}, 1000);

						});
						
				};

				// [명절관] 상단 카테고리 네비(html코너) 클릭 바인딩 함수실행
				$timeout(function(){
					$scope.holidayTopNav();
				}, 1500);

				// [명절관] TCLICK 처리
				$scope.holidayTclick = function (url, tclick){

					var url = url+((url.indexOf("?")!=-1)?"&":"?")+$scope.baseParam;

					if (tclick) { // tclick 이 있다면 url 뒤에 parameter를 추가한다.
						url += "&tclick=" + holidayBaseTclick + tclick;
					}

					window.location.href = url; // url 이동

				};

				// [명절관] 테마기획전 스와이프 상품(번호) TCLICK 처리
				 $scope.holidayTclickNum = function(item, tclick){

					var url = LotteCommon.prdviewUrl + "?" + $scope.baseParam + "&goods_no=" + item.img_link;
					if( ! (tclick == undefined || tclick == "") ){
						url += "&tclick=" + holidayBaseTclick + tclick;
					};

					window.location.href = url;
				};

            }
        };
    }]);

})(window, window.angular);
