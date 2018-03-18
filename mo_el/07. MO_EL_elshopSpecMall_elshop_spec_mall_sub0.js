var menuSlide = null; /*슬라이드 Plug-in*/

(function(window, angular, undefined) {
    'use strict';

    var app = angular.module('app', [
        'lotteComm',
        'lotteSrh',
        'lotteSideCtg',
        'lotteCommFooter',
        'lotteUnit',
        'lotteNgSwipe',
        'lotteProduct'
    ]);

    app.controller('ElshopSpecMallSubCtrl', ['$http', '$rootScope', '$scope', 'LotteStorage', 'LotteCommon', 'commInitData', 'LotteUtil', '$location','$window','$timeout', function($http, $rootScope, $scope, LotteStorage, LotteCommon, commInitData, LotteUtil, $location,$window, $timeout) {
        $scope.showWrap = true;
        $scope.contVisible = true;
        $scope.productMoreScroll = true;
        $scope.screenID = "main_SpeDisp";
        $scope.tClickBase = "m_EL_";
        $scope.templateType = "list";
		    $scope.pageLoading = true; // 페이지 첫 로딩
        $scope.LotteSuperBlockStatus = true;
        $scope.tclickCode;
        $scope.lineMapCheckis = false;

        $scope.elShop = {
            curDispNo : commInitData.query.curDispNo,
            upCurDispNo : commInitData.query.upCurDispNo,
            cateDepth: commInitData.query.cateDepth,
            stgCheck:false,
            bestItem:null,
            goodsList:null
        };

        $scope.pageOptions = {
          initPageParam:false,
          sort: [
  					{sortText:'최근등록순',sortcode:10},
            {sortText:'판매BEST',sortcode:11},
            {sortText:'상품평순',sortcode:14},
            {sortText:'MD추천순',sortcode:19},
            {sortText:'높은가격순',sortcode:13},
            {sortText:'낮은가격순',sortcode:12}
				 ],
         sortIndex:0,
         sortPopup:false,
         useScroll : 0
       };

        $scope.screenData = {
          page: 0,
  				pageSize: 20,
  				pageEnd: false,
  				goodsTotal: 0,
  				goodsList: [],
          resetData : function(){
            $scope.screenData.page = 0;
            $scope.screenData.pageSize = 20;
            $scope.screenData.pageEnd = false;
            $scope.screenData.goodsTotal = 0;
            $scope.screenData.goodsList = [];
          }
        };

        // 로컬 테스트
        if( window.location.href.indexOf(".ellotte.com") > -1 ) {
          $scope.elShop.stgCheck = true;
        } else {
          $scope.elShop.stgCheck = false;
        };

        // 로컬이 아니면 로그 출력 않하도록
        if($scope.elShop.stgCheck)  {
          console.log = function(){};
        }

        $scope.sortPopupState = function(){
          $scope.pageOptions.sortPopup = !$scope.pageOptions.sortPopup;
        }

        $scope.sortSelect = function( index ) {
          if( $scope.pageOptions == index ) return;
          $scope.pageOptions.sortIndex = index;
          $scope.pageOptions.sortPopup = false;
          $scope.pageOptions.useScroll = 432;//angular.element(window).scrollTop();
          $scope.screenData.resetData();
        }

        // 필터
        $scope.getProductURL= function(params) {
            var url = LotteCommon.specMallSubData + "?" + $scope.baseParam  +"&upCurDispNo=" + commInitData.query.upCurDispNo + "&curDispNo=" + commInitData.query.curDispNo;
            if( $scope.screenData.page ) {
              url += "&page=" + $scope.screenData.page + "&sort=" + $scope.pageOptions.sort[ $scope.pageOptions.sortIndex ].sortcode;
            }
            return url;
        };

        $scope.getProductData = function(params){
          if($scope.screenData.pageEnd) return;
          $scope.screenData.page++;
    			if($scope.screenData.page > 1) {
    				$scope.sendTclick($scope.tClickBase+$scope.screenID+'_Scl_Prd_page'+$scope.screenData.page);
    				$scope.productListLoading = true;
    			} else {
    				$scope.pageLoading = true;
    			}
          $scope.$parent.LotteSuperBlockStatus = true;
          try {
    				$http.get($scope.getProductURL(params))
    				.success(function(data) {
    					if($scope.screenData.page <= 1 && !$scope.pageOptions.initPageParam) {
    						$scope.pageOptions.initPageParam = true;
    					}

              // 카테고리
              if(!$scope.catData) {
                $scope.ctgData = data;
                $scope.elShop.bestItem = data.elshopSub.bestGoodListitems;
                $scope.catData = nCatArr.setCatData( data.elshopSub.cate_list.items );
                $scope.dataLoadInit();
                $scope.lineMapInit();
              }

              // 티클릭 페이지 코드
              if(!$scope.tclickCode) {
                $scope.tclickCode = $scope.curDispNo = data.elshopSub.disp_lrg_no;
              }

              $scope.screenData.goodsTotal = data.elshopSub.categoryGoodsCount;
              $scope.pageLoading = false;

    					if($scope.screenData.page > 1) {
                var newDataArray = $scope.screenData.goodsList.concat( data.elshopSub.categoryGoodsListItems.items );
                $scope.screenData.goodsList = newDataArray;
    					} else {
    						 $scope.screenData.goodsList = data.elshopSub.categoryGoodsListItems.items;
    					}
              //console.log( $scope.screenData.goodsList );

    					if($scope.screenData.goodsTotal < $scope.screenData.page*$scope.screenData.pageSize) {
    						$scope.screenData.pageEnd = true;
    						$scope.productMoreScroll = false;
    					}

    					$scope.productListLoading = false;
    					$scope.$parent.LotteSuperBlockStatus = false;
    					$scope.pageLoading = false;

              // 스크롤..
              /*
              if($scope.pageOptions.useScroll ) {
                $timeout(function() {
                  var listY = 523,
                    headerH = angular.element("#head_sub").height(),
                    cateH = angular.element("#kshopSubHead").height();
                  angular.element(window).scrollTop( 523 - ( headerH + cateH ) );
                },500);
              }*/

    				})
    				.error(function() {
    					$scope.productListLoading = false;
    					$scope.$parent.LotteSuperBlockStatus = false;
    					$scope.pageLoading = false;
    				});
    			} catch(e) {}
        }

        /*
        // 세션에서 가저올 부분 선언
    		var StoredLoc = LotteStorage.getSessionStorage($scope.screenID+'Loc');
    		var StoredDataStr = LotteStorage.getSessionStorage($scope.screenID+'Data');
    		var StoredScrollY = LotteStorage.getSessionStorage($scope.screenID+'ScrollY');

    		if(StoredLoc == window.location.href && $scope.locationHistoryBack) {
    			var StoredData = JSON.parse(StoredDataStr);
    			$scope.pageLoading = false;

    			$scope.templateType = StoredData.templateType;
    			$scope.pageOptions = StoredData.pageOptions;
    			$scope.screenData = StoredData.screenData;
    			$scope.subTitle = $scope.screenData.ParentCateInfo.disp_nm;
    			if(StoredScrollY) {
            $timeout(function() {
    				    angular.element($window).scrollTop(StoredScrollY);
    			   },800);
          }
    		} else {

    		}
        */
        $scope.getProductData();

        /**
    		 * unload시 관련 데이터를 sessionStorage에 저장
    		 */
    		angular.element($window).on("unload", function(e) {
    			var sess = {};
    			sess.templateType = $scope.templateType;
    			sess.pageOptions = $scope.pageOptions;
    			sess.screenData = $scope.screenData;
    			if (!commInitData.query.localtest && $scope.leavePageStroage) {
    				LotteStorage.setSessionStorage($scope.screenID+'Loc', $location.absUrl());
    				LotteStorage.setSessionStorage($scope.screenID+'Data', sess, 'json');
    				LotteStorage.setSessionStorage($scope.screenID+'ScrollY', angular.element($window).scrollTop());
    			}
    		});

        /* 카테고리 1/2 그룹 만들기 */
        var nCatArr = {
            getSubList : function(arr)  {
                var n = [],  max = Math.ceil( arr.length/2 ),  v = 2;
                for(var i=0;i<max;++i){
                    var sliceArr=[];
                    for(var s=0;s<v;++s) {
                        var c = i*v+s;
                        if( arr[c] ) {
                            arr[c].depthIndex = c;
                            arr[c].groupIndex = i;
                            arr[c].subIndex = s;
                            sliceArr.push( arr[c] );
                        }
                    }
                    if(sliceArr.length) n.push({s:sliceArr});
                }
                return n;
            },
            setCatData : function( data ) {
                var n = JSON.parse(JSON.stringify(data));
                for( var i=0; i<data.length; ++i ) {
                    if( data[i].sub_cate_list&&data[i].sub_cate_list.length ) {
                        n[i].depthIndex=i;
                        n[i].sub_cate_list = nCatArr.getSubList( data[i].sub_cate_list );
                    }
                }
                return n;
            }
        };

    }]);

    app.directive('elshopSubContainer', ['$window', '$timeout', '$location', 'LotteCommon', function($window, $timeout, $location, LotteCommon) {
        return {
            templateUrl: '/ellotte/resources_dev/mall/elshopSpecMall/elshop_spec_mall_sub_container.html',
            replace:true,
            link: function (scope,  el, attrs)
            {
                function getMoreData() {

                }

                function initHead(){
                  try{
                    var headData = scope.ctgData.elshopSub.subTitleImgBanner;
                    if( headData.img_url ) {
                      scope.subTitle = "<img src='"+headData.img_url+"' alt='"+headData.alt_cont+"'/>";
                    } else {
                      scope.subTitle = headData.banner_nm;
                    }
                  } catch(e){};
                  if(scope.ctgData.elshopSub.subTitleImgBanner.conts_desc_cont) {
                      $timeout( function(){
                        angular.element("#kshopSubHead").css({background:scope.ctgData.elshopSub.subTitleImgBanner.conts_desc_cont});
                      }, 300 );
                  }
                }
                scope.dataLoadInit = function() {
                    initHead();
                    // best Item
                    scope.alias.bestItem.data = scope.ctgData.elshopSub.bestGoodsListItems.items;
                }

                scope.bestItemLink = function(item, cnt) {
                  var tClickCode = "m_EL_SpeDisp"+scope.tclickCode+"_Sub_best_" + scope.catedepthsNo[0] + "_" +  scope.catedepthsNo[1] + "_Clk_Prd_" + cnt,
                      baseURL = LotteCommon.prdviewUrl + "?" + scope.baseParam + "&goods_no=" + item.goods_no+ "&tclick=" + tClickCode + "&curDispNo=" + scope.tclickCode;
                      window.location.href=baseURL;
                }

                var dataObjectList = ["bestItem"], alias = {};
                function dataObjectController ( name ) {
                    alias[name] = {
                        swipeIndex : 0,
                        swipeControl : null,
                        data : null,
                        setControl : function(ctrl){
                            scope.alias[name].swipeControl = ctrl;
                        },
                        endFunc : function(e){
                            scope.alias[name].swipeIndex = e;
                        }
                    }
                }
                for( var i in dataObjectList ) { dataObjectController( dataObjectList[i] ); }
                scope.alias = alias;
            }
        };
    }]);

    app.directive('lineMap', ['commInitData',function(commInitData){
      return {
        link : function( scope, el, attrs ) {
          scope.lineMapData = [];
          scope.useSubCate = {};
          scope.catedepthsNo = [];

          function getCurrentData( code ) {
              var curData, data = scope.ctgData.elshopSub.cate_list.items || [];
              angular.forEach( data, function( v, k, i ){
                  if(curData) return;
                  if( v.disp_no == code )  { curData = [ v, scope.zero(k) ]  }
                    angular.forEach( v.sub_cate_list, function( v, k, i ){
                      if( v.disp_no == code ) { curData = [ v, scope.zero(k) ]  }
                      angular.forEach( v.sub_cate_list, function( v, k, i ){
                        if( v.disp_no == code ) { curData = [ v, scope.zero(k) ]  }
                      });
                    });
              });
              return curData;
          };

          scope.lineMapInit = function(){
              var lineMapData  = [];
              if( commInitData.query.upCurDispNo ) {
                var curDepthNo = getCurrentData( commInitData.query.firstDispNo || commInitData.query.upCurDispNo );
                scope.catedepthsNo.push( curDepthNo[1] );
                lineMapData.push( curDepthNo[0] );
              }
              if( commInitData.query.curDispNo ) {
                var curDepthNo = getCurrentData( commInitData.query.firstDispNo ? commInitData.query.upCurDispNo : commInitData.query.curDispNo );
                scope.catedepthsNo.push( curDepthNo[1] );
                lineMapData.push(curDepthNo[0] );
              }
              scope.lineMapData = lineMapData;
              // 라인맵에서 현재 메뉴 펼쳐진 상태로 보이기
              if(scope.lineMapCheckis){
                scope.useSubCate.depth1 = lineMapData.length-1;
              }
              scope.lastDispNo = commInitData.query.curDispNo;
          }

          scope.subCatOenState = function( obj ){
            for( var i in obj  ){
              scope.useSubCate[i] = scope.useSubCate[i] == obj[i] ? null : obj[i];
              if( i.indexOf("depth") != -1 ) scope.useSubCate[ String(i.substr(0,i.length-1)) +String( Number(i.substr(i.length-1))+1) ] = null;
            }
          }
        }
      }
    }]);

    app.filter('htmlRemove', [function() {
        return function(text) {
            return text.substr(0,17);
        }
    }]);

    /* 전문몰 타이틀, 카테고리 */
    app.directive('newSpecMallCtg', ['LotteCommon','commInitData', function(LotteCommon,commInitData) {
        return {
            templateUrl: '/ellotte/resources_dev/mall/elshopSpecMall/category/new_spec_mall_ctg_container.html',
            replace:true,
            link:function( $scope, el, attrs, $timeout )
            {
                $scope.elshopCate = {
                    useCatinfo:{},
                    topBanner:{},
                    showAllCategory:false
                };
                $scope.headerHeight = "46"; /* 헤더 픽스 사이즈 */

                $scope.zero = function( n ) {
                  console.log(n);
                  return n<10?'0'+n:n;
                }
                 /* 카테고리 클릭 */
                $scope.openCatList = function( catIs, depth )
                {
                    $scope.elshopCate.showAllCategory = false;
                    var catItem = angular.copy(catIs);
                    if( !catItem ) {
                        $scope.elshopCate.useCatinfo = {};
                        return;
                    }
                    // depth2 열기 닫기
                    for( var key in catItem ) {
                        if( catItem[key]!=null &&
                            catItem[key] == $scope.elshopCate.useCatinfo[key] &&
                            key.substr( key.length-1 ) == depth &&
                            key.indexOf("depth") != -1 ) {
                             catItem[key] = null;
                            try{ catItem["depth"+String( Number(key.substr( key.length-1 ))+1 )] = null }
                            catch(e){}
                        }
                    }
                    // 2depth 열림
                    if( catItem.depth1 != null && catItem.depth2 != null ) {
                      $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_CateList_Clk_"+$scope.zero(catItem.depth1)+"_"+$scope.zero(catItem.depth2));
                    }
                    $scope.elshopCate.useCatinfo = catItem || {};
                }
                $scope.closeCatList = function() {
                    $scope.elshopCate.useCatinfo = {};
                }
                $scope.showAllCategoryClick = function(){
                  $scope.elshopCate.useCatinfo = {};
                  $scope.elshopCate.showAllCategory = !$scope.elshopCate.showAllCategory;
                  if($scope.elshopCate.showAllCategory) {
                    $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_header_cate");
                  }
                }
                $scope.subCtgClick = function( i ){
                    $scope.showAllCategoryClick();
                    setTimeout( function() { angular.element("#kshopSubHead li:eq("+i+")").triggerHandler("click");  }, 100 );
                }

                /* 페이지연결 */
               $scope.randingURL = function( url, tclick, customParams ) {
                 if(!url) { console.log('링크없음'); return; }
                 url = getUseLocalHost(url);
                  var params;
                  if( url.indexOf("?") != -1 ) {
                    params = "&tclick="+(tclick||"")+"&"+ getBaseParams();
                  } else {
                    params = "?tclick="+(tclick||"")+"&"+ getBaseParams();
                  }
                  //try{ if( commInitData.query.sort ) params = params + "&sort=" +commInitData.query.sort;  } catch(e) {}
                  //try{ if( commInitData.query.page ) params = params + "&page=" +commInitData.query.page;  } catch(e) {}
                  if( customParams ) {
                    for( var i in customParams ) {
                      if( customParams[i] ) params += "&"+i+"="+customParams[i];
                    }
                  }
                  //console.log(url + params);
                  location.href = url + params;
               }

              function getUseLocalHost( url ) {
                 var host = location.href;
                 if( host.indexOf("mo.ellotte.com") !=-1 || host.indexOf("m.ellotte.com") != -1 ) {
                   return url;
                 }  else {  /* 로컬용 */
                   var replaceURL = url.substr(  url.indexOf("?") );
                   return LotteCommon.specMallSubURL + replaceURL;
                 }
               }
            }
        };
    }]);

    /*Directive :: KShop 카테고리 슬라이드 */
    app.directive('kshopCtg', ['$window', '$timeout', '$location', function($window, $timeout, $location) {
        return {
            link:function($scope, el, attrs) {
                function kshopSlide(selectIdx) {
                    var $kshopSubHead = angular.element("#kshopSubHead"), /*헤더 Wrapper*/
                        $ksMenu = $kshopSubHead.find("#ksAmenu"),
                        $menuList = $ksMenu.find(">li"), /*상위 카테고리 리스트*/
                        $sideBar = $kshopSubHead.find(".sideBar > img"), /*더보기 그림자*/
                        $subMenu = $kshopSubHead.find(".ksCB"),
                        //menuSlide = null, /*슬라이드 Plug-in*/
                        winWidth = angular.element($window).width(), /*윈도우 넓이*/
                        menuWidth = $ksMenu.outerWidth(); /*메뉴 넓이*/

                    /*메뉴 사이드에 그림자 표시*/
                    function setMenuSide() {
                        if (menuWidth < winWidth) {
                            $sideBar.removeClass("on");
                        } else if (menuSlide._x() == 0) {
                            $sideBar.filter(".left").removeClass("on");
                            $sideBar.filter(".right").addClass("on");
                        } else if (menuSlide._x() == (winWidth - menuWidth)) {
                            $sideBar.filter(".left").addClass("on");
                            $sideBar.filter(".right").removeClass("on");
                        } else {
                            $sideBar.addClass("on");
                        }
                    }

                    /*대카 클릭시 메뉴 중앙 위치*/
                    function menuClick(index) {
                        //console.log("----- 1");
                        /*가운데 위치 찾기*/
                        var $cell = $menuList.eq(index),
                            targetX = winWidth / 2 - parseInt($cell.position().left + ($cell.outerWidth()) / 2),
                            mmax = winWidth - menuWidth;

                        if (targetX > 0 || mmax > 0) {
                            menuSlide.setMoveX(0, 300, setMenuSide);
                        } else if (targetX < mmax) {
                            menuSlide.setMoveX(mmax, 300, setMenuSide);
                        } else {
                            menuSlide.setMoveX(targetX, 300, setMenuSide);
                        }
                    }

                    /*초기화*/
                    function init() {
                        /*메뉴 스와이핑 설정*/
                        menuSlide = $ksMenu.simpleDrag(function() { /*- EGSlider.js 에선언*/
                            menuSlide.setMoveX(menuSlide.getFlickDist2(0, winWidth - menuWidth, 2.5, 40), 300, setMenuSide);
                        });

                        setMenuSide(); /*메뉴 사이드에 그림자 표시 확인*/
                        addEvent(); /*이벤트 바인딩*/
                    }

                    function addEvent() {
                        /*rotate 이벤트 등록  - EGSlider.js 에선언*/
                        rotateWindow(function () {
                            winWidth = $(window).width();
                            menuSlide.setX(0);
                            setMenuSide();
                        });

                        $menuList.on("click", function () {
                            menuClick(angular.element(this).index());
                        });
                    }

                    init(); /*최초 실행*/
                };
                $timeout(kshopSlide); /*생성완료 후 실행*/
            }
        };
    }]);


})(window, window.angular);
