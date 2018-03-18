var menuSlide = null; /*슬라이드 Plug-in*/
    
(function(window, angular, undefined) {
	'use strict';

	var app = angular.module('app', [
		'ngRoute',
		'lotteComm',
		'lotteSrh',
		'lotteSideCtg',
		// 'lotteSideMylotte',
		'lotteCommFooter',
		'lotteProduct',
		//'lotteUnit',
		'specMallCate',
		'lotteNgSwipe',
		'lotteSlider',
		'lotteSns',
		'hwslider'
	]);
	
	app.controller('SpecMallCtrl', ['$http', '$scope', 'LotteCommon', 'commInitData', 'LotteUtil', '$location','$window','$timeout', function($http, $scope, LotteCommon, commInitData, LotteUtil, $location,$window, $timeout) {
		$scope.showWrap = true;
		$scope.contVisible = true;
		$scope.subTitle = ""; // 서브헤더 타이틀
			
		$scope.isShowThisSns = true; //공유하기
        $scope.tClickBase = "m_DC_";
        $scope.screenID = "spec_mall";
        $scope.curDispNoSctCd = ""; // 상세 유입코드

		/*UI Scope*/
		$scope.kShopUI = {
			dispNo : commInitData.query.dispNo,  // 매장번호, KShop : 5535841,  빅사이즈 : 5550543
			curDispNo : "", /*서브 페이지일 경우 curDispNo*/
			prdFilterCurDispNo : "", /*상품 카테고리 필터 (전체일경우 빈값)*/
			sCtgLayerOpen : false,
			curCtgIdx : -1,
			curCtgName : "",
			curCtgNo : "",
			curSCtgIdx : -1,
			curSCtgName : "",
			curSCtgNo : "",
			curSCtgNewflag : "", //0207  newflag 추가
			curSSCtgIdx : -1,
			curSSCtgName : "",
			curSSCtgNo : "",
			curSSCtgNewflag : "", //0207  newflag 추가
			sCtgBnrShowFlag : false,
			ssCtgLayerOpenFlag : false,
			ssCtgList : [],
			showAllCategory: false,
			stgCheck : false // stg테스트를 위해 분기 추가
		};
        $scope.curDispNo = $scope.kShopUI.dispNo; // lotte_product 링크 params
		$scope.curDispNoSctCd = ""; // 상세 유입코드

		// stg테스트를 위해 분기 추가
		if ( window.location.href.indexOf("mo.lotte.com") > -1 ) {
			$scope.kShopUI.stgCheck = true;
		}
		$scope.subRowsPerPage = 20; // 서브페이지 페이지당 상품 리스트 개수
		$scope.subPageNo = 1; // 서브페이지 페이지 번호
		$scope.subPrdLstTotal = []; // 서브페이지 총 상품 리스트
		$scope.pageEndFlag = false; // 상품 로드 완료 여부 Flag
		$scope.pageLoadFlag = false; // 상품더보기 로딩중 여부
		$scope.subData = {
			topHtml: "",
			prdList: {
				items: [],
				totalCnt: 0
			}
		};

		$scope.subPageInit = function () {
			$scope.subPageNo = 1;
			$scope.pageEndFlag = false;
			$scope.pageLoadFlag = false;
			$scope.subData = {
				topHtml: "",
				prdList: {
					items: [],
					totalCnt: 0
				}
			};
		};
		$scope.kShopUI.showSubAllCategory = true;
		$scope.addCls = "spec"+$scope.kShopUI.dispNo; //서브헤더 타이틀 유동적 처리

		$scope.mainCtgNameData = ["Edge look", "Awesome beauty", "Creative living", "Novel devices", "Authentic food"]; //K샵 메인 코너명

		if ($scope.kShopUI.dispNo == "5550543") { //빅사이즈
			$scope.mainCtgNameData = ["Women", "Men", "Underwear", "Sportswear", "Shoes"];
		}

        $scope.linkLotteGroup = function(code, index1, index2){
            var tclick = index1*3 + index2 + 1;
            if(tclick < 10){
                tclick = "0" + tclick;
            }
            tclick = "m_LOTTEG_Store_" + tclick;
            window.location.href = "/product/m/product_list.do?"+ $scope.baseParam +"&curDispNo="+code+"&tclick=" + tclick;
        }	

        $scope.linkInstagramList = function(url){
            var tclick = 'm_DC_SpeDisp2_Clk_Ban_Dearpetgra',
            	linkUrl = url;
            window.location.href = linkUrl + "?"+ $scope.baseParam + "&tclick=" + tclick;
        }		

		// KShop 메인 데이터 로드
		$scope.loadMainData = function () {
			if ($scope.mainData == undefined) {
				// LotteCommon.specMallMainData / LotteCommon.specMall2017Main
				console.log('LotteCommon.specMall2017Main', LotteCommon.specMall2017Main );
				$http.get(LotteCommon.specMall2017Main, {
					withCredentials:false,
					params: {dispNo: $scope.kShopUI.dispNo}
				})
				.success(function(json){
					if(json == undefined || json.kShop == undefined){ return; }
					
					// data remapping
					var kshop = json.kShop;
					var data = {
						topHtml : kshop.topHtml
					};
					if(kshop.lotteStore != undefined && kshop.lotteStore.items != undefined){
						data.lotteStore = kshop.lotteStore.items;
					}
					if(kshop.banners != undefined && kshop.banners.items != undefined){
						data.banners = kshop.banners.items;
					}
					if(kshop.prdList != undefined && kshop.prdList.items != undefined){
						var itm;
						var items = kshop.prdList.items;
						var len = items.length;
						for(var i=0; i<len; i++){
							itm = items[i];
							//itm.items = itm.product;
							//itm.prodList = {items:itm.product, tcnt:itm.product.length};
						}
						data.prdList = kshop.prdList.items;

                        /**
						 * 20171027 전물몰 개선 ( 기:이선미, 개:박은영, 퍼:박해원  )
						 * 유닛 변경 및 상품 영역 추가
						 * 신규 여역 최대 6개 짝수 출력 ( 홀수 비노출 )
                         */
                        var prd2;
						try{
							prd2 = kshop.prdList2.items || [];
                            for( var i=0; i<prd2.length;++i) {
								var prd_In_arr = prd2[i].product;
								// 최대 6개
								if( prd_In_arr.length > 10 ) prd_In_arr.splice(10);
								// 홀수일경우 마지막 삭제
								if( prd_In_arr.length%2 == 1 ) prd_In_arr.pop();
							}
                        }catch(e){}
                        if( prd2 ) data.prdList2 = kshop.prdList2.items;
                        else data.prdList2 = [];
					}

                    /* 20171211 */
                    if(kshop.event != undefined ) data.event = kshop.event;
                    if(kshop.logo != undefined ) {
                        data.logo = kshop.logo;
                        if(data.logo.imgUrl) document.styleSheets[0].addRule( '#head_sub h2 span span', 'width:180px !important; height:25px !important; color:transparent !important; background:url('+data.logo.imgUrl+') center center no-repeat !important; background-size:auto 100% !important' );
                        else document.styleSheets[0].addRule( '#head_sub h2 span span', 'width:180px !important; height:25px !important; color:#000 !important; ' );
                	} else {
                        document.styleSheets[0].addRule( '#head_sub h2 span span', 'width:180px !important; height:25px !important; color:#000 !important;' );
					}

                    if(kshop.best != undefined && kshop.best.items != undefined){
                        data.best = kshop.best.items;
                    }
                    if(kshop.newArrivals != undefined && kshop.newArrivals.items != undefined){
                        data.newArrivals = kshop.newArrivals.items;
                    }
                    if(kshop.pinterest != undefined && kshop.pinterest.items != undefined){
                        data.pinterest = kshop.pinterest;
                        data.pinterest.unitType = "pinterest";
                        // 최대 4개
                        if(data.pinterest.items.length>4){
                        	var npintr = [];
                        	for( var i=0; i<4;++i) npintr.push( data.pinterest.items[i] );
                            data.pinterest.items = npintr;
						}
						// 핀터레스트는 prdList2 배열에 2번째에 나와야 되기 때문에 배열 합침
                        if(data.pinterest.items.length==4){
                            var nProd2 = data.prdList2.length ? [] : [data.pinterest];
                            for(var i=0;i<data.prdList2.length;++i){
                                nProd2.push( data.prdList2[i] );
                                if( i==0) {
                                	nProd2.push( data.pinterest );
                                	delete data.pinterest;
                                }
                            }
                            data.prdList2 = nProd2;
                        }
                    }
                    /* [20171211] end */

					$scope.mainData = data;

					if (data.banners) {
						$scope.swipeBanner = data.banners;
					}

                    //lotteStore 카테고리 데이타 재구성(롯데 그룹관)
                    if(($scope.kShopUI.dispNo == "5553048" || $scope.kShopUI.dispNo == "5571254") && $scope.mainData.lotteStore != undefined){
                        $scope.lotteStore = [];
                        var arrIndex = 0;
                        for(var i=0; i< $scope.mainData.lotteStore.length; i+=3){                            
                            $scope.lotteStore.push([]);
                            $scope.lotteStore[arrIndex].push($scope.mainData.lotteStore[i]);
                            if(i+1 < $scope.mainData.lotteStore.length){
                                $scope.lotteStore[arrIndex].push($scope.mainData.lotteStore[i+1]);    
                            }else{
                                $scope.lotteStore[arrIndex].push({imgUrl:null});
                            }
                            if(i+2 < $scope.mainData.lotteStore.length){
                                $scope.lotteStore[arrIndex].push($scope.mainData.lotteStore[i+2]);                            
                            }else{
                                $scope.lotteStore[arrIndex].push({imgUrl:null});                            
                            }
                            arrIndex += 1;
                        }   
                    }
					// 2016.11.07 상품 리스트 노출기준 수정
					var $win =  angular.element($window);
					angular.element($window).on("resize.sbnr", function() {
						var prdLnum = $scope.mainData.prdList.length;
						if($scope.screenType > 1 && prdLnum%2 != 0){
							$scope.prdListC = prdLnum - 1;	
						}						
					}).trigger('resize.sbnr');													
				})
				.error(function () {
					console.log('Data Error : kshop 메인페이지 데이터');
				});
			}
		};

		// KShop 서브페이지 (소카,세카) 데이터 로드
		$scope.loadSubData = function (dispNo) {
			// 서브페이지로 포워딩
			var path = LotteCommon.specialSubUrl;
			var param = {
				dispNo:$scope.kShopUI.dispNo,
				curDispNo:dispNo
			};
			path += "?" + $.param(param) + "&" + $scope.baseParam;
			location.href = path;
		};
		
		/*인입 curDispNo로 해당 카테고리 Depth 및 index 찾기*/
		$scope.findCurDispNoDepth = function (curDispNo) {
			if (curDispNo &&curDispNo != "" && $scope.ctgData && $scope.ctgData.ctgs && $scope.ctgData.ctgs.length > 0) {
				var ctgIdx = 0,
					sCtgIdx = 0,
					ssCtgIdx = 0;

				for (ctgIdx= 0; ctgIdx < $scope.ctgData.ctgs.length; ctgIdx++) {
					if ($scope.ctgData.ctgs[ctgIdx].sctgs && $scope.ctgData.ctgs[ctgIdx].sctgs.length > 0) {
						for (sCtgIdx = 0; sCtgIdx < $scope.ctgData.ctgs[ctgIdx].sctgs.length; sCtgIdx++) {
							if ($scope.ctgData.ctgs[ctgIdx].sctgs[sCtgIdx].ssctgs && $scope.ctgData.ctgs[ctgIdx].sctgs[sCtgIdx].ssctgs.length > 0) {
								for (ssCtgIdx = 0; ssCtgIdx < $scope.ctgData.ctgs[ctgIdx].sctgs[sCtgIdx].ssctgs.length; ssCtgIdx++) {
									if ($scope.ctgData.ctgs[ctgIdx].sctgs[sCtgIdx].ssctgs[ssCtgIdx].ctg_no == curDispNo) {
										$scope.selectCurDispCtg(ctgIdx, sCtgIdx, ssCtgIdx); /*세카에서 맵핑될경우*/

										if (ssCtgIdx == 0) {
											$scope.kShopUI.sCtgBnrShowFlag = true;
										} else {
											$scope.kShopUI.sCtgBnrShowFlag = false;
										}
										return false;
									}
								}
							}
							/*세카가 없을 경우에만 소카에서 맵핑 확인*/
							else if (!$scope.ctgData.ctgs[ctgIdx].sctgs[sCtgIdx].ssctgs && $scope.ctgData.ctgs[ctgIdx].sctgs[sCtgIdx].ctg_no == curDispNo) {
								$scope.selectCurDispCtg(ctgIdx, sCtgIdx); /*소카에서 맵핑될경우*/
								$scope.kShopUI.sCtgBnrShowFlag = true;
								return false;
							}
						}
					}
				}

				$location.path("/"); /*매칭되는 카테고리가 없을 경우 메인으로 튕기도록*/
			}
		};

		/*카테고리 선택 활성화, Label 세팅*/
		$scope.selectCurDispCtg = function (curCtgIdx, curSCtgIdx, curSSCtgIdx) {
			$scope.kShopUI.curCtgName = "";
			$scope.kShopUI.curSCtgName = "";
			$scope.kShopUI.curSSCtgName = "";

			$scope.kShopUI.curCtgIdx = curCtgIdx;
			$scope.kShopUI.curCtgName = $scope.ctgData.ctgs[curCtgIdx].name;
			$scope.kShopUI.curCtgNo = $scope.ctgData.ctgs[curCtgIdx].ctg_no;

			$scope.kShopUI.curSCtgIdx = curSCtgIdx;
			$scope.kShopUI.curSCtgName = $scope.ctgData.ctgs[curCtgIdx].sctgs[curSCtgIdx].name;
			$scope.kShopUI.curSCtgNo = $scope.ctgData.ctgs[curCtgIdx].sctgs[curSCtgIdx].ctg_no;
			$scope.kShopUI.curSCtgNewflag = $scope.ctgData.ctgs[curCtgIdx].sctgs[curSCtgIdx].new_flag; //0207  newflag 추가
			if (curSSCtgIdx != null) {
				$scope.kShopUI.curSSCtgIdx = curSSCtgIdx;
				$scope.kShopUI.curSSCtgName = $scope.ctgData.ctgs[curCtgIdx].sctgs[curSCtgIdx].ssctgs[curSSCtgIdx].name;
				$scope.kShopUI.curSSCtgNo = $scope.ctgData.ctgs[curCtgIdx].sctgs[curSCtgIdx].ssctgs[curSSCtgIdx].ctg_no;
				$scope.kShopUI.curSSCtgNewflag = $scope.ctgData.ctgs[curCtgIdx].sctgs[curSCtgIdx].ssctgs[curSSCtgIdx].new_flag;
				$scope.kShopUI.ssCtgList = $scope.ctgData.ctgs[curCtgIdx].sctgs[curSCtgIdx].ssctgs;
			} else {
				$scope.kShopUI.curSSCtgIdx = -1;
				$scope.kShopUI.ssCtgList  = [];
			}
			/*카테고리 선택 활성화 후 처리*/
			/*해당 카테고리가 속한 소카 번호로 카테고리 데이터 요청*/
			if ($scope.kShopUI.curSCtgNo && $scope.kShopUI.curSCtgNo != "") {
				/*$scope.loadSubData($scope.kShopUI.curSCtgNo);*/
				$scope.loadSubData($scope.kShopUI.curDispNo); // 서브 페이지 데이터 조회
			}
		};

		/*소카 클릭*/
		$scope.kshopSctgClick = function (curDispNo) {
			$location.path("/" + curDispNo);
		};

		/*세카 (셀렉트박스형) 버튼 클릭*/
		$scope.kshopSsctgClick = function () {
			$scope.kShopUI.ssCtgLayerOpenFlag = true;
			angular.element("#wrapper").addClass("overflowy_hidden");
		};

		$scope.mainPdtTclickIdx = function (ctgIdx, itemIdx) {
			var rtnTclick = ctgIdx * 2 + (itemIdx + 1);

			rtnTclick = (rtnTclick < 10) ? "0" + rtnTclick : rtnTclick;
			var tclickID =  "M_K_PRD_" + rtnTclick;
            
            //20160223 롯데그룹관 티클릭 추가
            if($scope.kShopUI.dispNo == '5553048'){
                tclickID = "m_LOTTEG_PRD_" + rtnTclick;
            }            
            
            return tclickID;   
		};

		function kshopBnrChangeURL(url) {
			var rtnUrl = "",
				baseUrl = "",
				params = "",
				paramsArr = [],
				paramsObj = {},
				mallHash = "",
				baseParam = $scope.baseParam;

			if (!url) {
				return rtnUrl;
			}

			url += "";

			if (url.indexOf("#/") > -1) { // Angular Route Page
				if (url.indexOf("?") > -1) {
					baseUrl = url.substring(0, url.indexOf("?"));
					params = url.substring(url.indexOf("?") + 1, url.indexOf("#/"));
					mallHash = url.substring(url.indexOf("#/") + 2, url.length);

					if (params != "") {
						paramsArr = params.split("&");
					}

					var paramsTemp = [];

					for (var i = 0; i < paramsArr.length; i++) {
						paramsTemp = paramsArr[i].split("=");
						paramsObj[paramsTemp[0]] = paramsTemp[1];
					}

					var baseParamArr = baseParam.split("&"),
						baseParamsObj = {},
						baseParamsTemp = [];

					for (var i = 0; i < baseParamArr.length; i++) {
						baseParamsTemp = baseParamArr[i].split("=");
						baseParamsObj[baseParamsTemp[0]] = baseParamsTemp[1];
					}

					var mergeParams = angular.extend(paramsObj, baseParamsObj);

					paramsArr = [];

					for (var key in mergeParams) {
						paramsArr.push(key + "=" + mergeParams[key]);
					}

					params = paramsArr.join("&");

					url = baseUrl + "?" + params + "#/" + mallHash;
				} else {
					baseUrl = url.substring(0, url.indexOf("#/"));
					mallHash = url.substring(url.indexOf("#/") + 2, url.length);
					url = baseUrl + "#/" + mallHash;
				}
			} else { // 일반 링크
				if (url.indexOf("?") > -1) {
					baseUrl = url.substring(0, url.indexOf("?"));
					params = url.substring(url.indexOf("?") + 1, url.length);

					if (params != "") {
						paramsArr = params.split("&");
					}

					var paramsTemp = [];

					for (var i = 0; i < paramsArr.length; i++) {
						paramsTemp = paramsArr[i].split("=");
						paramsObj[paramsTemp[0]] = paramsTemp[1];
					}

					var baseParamArr = baseParam.split("&"),
						baseParamsObj = {},
						baseParamsTemp = [];

					for (var i = 0; i < baseParamArr.length; i++) {
						baseParamsTemp = baseParamArr[i].split("=");
						baseParamsObj[baseParamsTemp[0]] = baseParamsTemp[1];
					}

					var mergeParams = angular.extend(paramsObj, baseParamsObj);

					paramsArr = [];

					for (var key in mergeParams) {
						paramsArr.push(key + "=" + mergeParams[key]);
					}

					params = paramsArr.join("&");

					url = baseUrl + "?" + params;
				} else {
					url += baseParam;
				}
			}
			return url;
		}

        // 20160223 index 추가
		$scope.goSwipeBnrLink = function (url, index) {
            //롯데그룹관 티클릭 추가
            if($scope.kShopUI.dispNo == '5553048'){
                var tclickStr = "m_LOTTEG_THEME_0" + index;
                url += "&tclick=" + tclickStr;
            }
			window.location.href = kshopBnrChangeURL(url);
		}

        /**
         * 20171027 전물몰 개선 ( 기:이선미, 개:박은영, 퍼:박해원  )
         * 서브헤더 링크
         */
		$scope.goKshopMain = function(){
            if(!$scope.kShopUI.dispNo) return;
            var url = LotteCommon.specialMallUrl+"?"+baseParam+"&dispNo="+$scope.kShopUI.dispNo;
            location.href = url;
		}
        var titleWatch = $scope.$watch( 'subTitle', function(res){
            if(!res) return;
            titleWatch();
            $timeout(function(){
                var subheadLink = angular.element("#head_sub h2 span.title");
                subheadLink.attr('onclick','angular.element(this).scope().goKshopMain()');
            },400);
        })

        /**
		 * 핀터레스트 상세로 이동
         * @param ptrNo
         */
		$scope.ptrDetail = function(ptrNo){
			var URL = LotteCommon.specMallDetail + "?"+baseParam;
            URL+="&dispNo="+$scope.kShopUI.dispNo+"&ptrNo="+ptrNo;
            location.href=URL;
		}

	}]);

	// Route용 Controller
	app.controller('KshopPage', ['$scope', '$http', '$location', '$routeParams', '$window', 'LotteCommon', 'LotteUtil', function($scope, $http, $location, $routeParams, $window, LotteCommon, LotteUtil) {
		angular.element($window).off("scroll.prdLstMore"); // 서브페이지 스크롤 이벤트 초기화

		if ($routeParams.curDispNo == undefined) { // 메인
			$scope.kShopUI.curDispNo = "";
			//$scope.loadCtgData();
			$scope.loadMainData();
		} else { // 서브 페이지
			$scope.loadSubData($routeParams.curDispNo);
		}

		angular.element($window).scrollTop(0);
	}]);

	app.config(['$routeProvider', function($routeProvider) {
		$routeProvider
		.when('/', {
			templateUrl : '/lotte/resources_dev/mall/spec_mall_main.html',
			controller: 'KshopPage',
			reloadOnSearch : false
		})
		.when('/info', {
			templateUrl : '/lotte/resources_dev/mall/spec_mall_kshop_info.html',
			controller: 'KshopPage',
			reloadOnSearch : false
		})
		.when('/:curDispNo', {
			templateUrl : '/lotte/resources_dev/mall/spec_mall_sub.html',
			controller: 'KshopPage',
			reloadOnSearch : false
		})
		.otherwise({
			redirectTo:'/'
		});
	}]);

	app.directive('lotteContainer', function() {
		return {
			templateUrl : '/lotte/resources_dev/mall/spec_mall_container.html',
			replace : true,
			link : function($scope, el, attrs) {
			}
		};
	});
	app.filter('htmlRemove', [function() {
    	return function(text) {
            return text.substr(0,17);
    	}
    }]);

	app.filter('dealFlagName',[function(){
		return function(text){
            var b;
            switch(text){
                case"dept":b="롯데백화점";break;
                case"himart":b="하이마트";break;
                case"tvhome":b="롯데홈쇼핑";break;
                case"freeDlv":b="무료배송";break;
                case"present":b="선물포장";break;
                case"smartpick":b="스마트픽"
            }
            return b
		}
	}])

	app.filter('rateTypeTxt',[function(){
		return function(a,b){
			var c;
            switch(a){
                case"n":c="NEW";break;
                case"c":c="-";break;
                case"u":case"d":c=Math.abs(b)
            }
            return c;
		}
	}])

})(window, window.angular);