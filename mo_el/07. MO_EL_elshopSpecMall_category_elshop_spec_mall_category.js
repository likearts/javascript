(function(){
  'use strict';

  var app = angular.module('elshopSpecMallCategory', []);

  /*
    전문몰 타이틀, 카테고리
  */
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
              $scope.headerHeight = "45"; /* 헤더 픽스 사이즈 */

              /* 카테고리 n/2 그룹 만들기 */
              $scope.nCatArr =
              {
                  getSubList : function(arr)
                  {
                      var n = [],
                          max = Math.ceil( arr.length/2 ),
                          v = 2;
                      for(var i=0;i<max;++i){
                          var sliceArr=[];
                          for(var s=0;s<v;++s) {
                              var c = i*v+s;
                              if( arr[c] ) {
                                  arr[c].depthIndex = c; // sequnce
                                  arr[c].groupIndex = i; // 1/2 group sequnce
                                  arr[c].subIndex = s;
                                  sliceArr.push( arr[c] );
                              }
                          }
                          if(sliceArr.length) { n.push({s:sliceArr}); }
                      }
                      return n;
                  },
                  setCatData : function( data )
                  {
                      var n = angular.copy(data);
                      for( var i=0; i<data.length; ++i ) {
                          if( data[i].sub_cate_list&&data[i].sub_cate_list.length ) {
                              n[i].depthIndex=i;
                              n[i].sub_cate_list = $scope.nCatArr.getSubList( data[i].sub_cate_list );
                          }
                      }
                      return n;
                  }
              }

              $scope.zero = function( n ) {
                return n<10?'0'+n:n;
              }
               /* 카테고리 클릭 */
              $scope.openCatList = function( catIs, depth )
              {
                console.log( catIs, depth );
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
                  if( catItem.depth1 != null && depth == 1 ) {
                    $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_CateList_Clk_"+$scope.zero(catItem.depth1+1));
                  }
                  // 3depth 열림
                  if( catItem.depth1 != null && catItem.depth2 != null ) {
                    $scope.sendTclick("m_EL_SpeDisp-"+$scope.tclickCode+"_CateList_Clk_"+$scope.zero(catItem.depth1+1)+"_"+$scope.zero(catItem.depth2+1));
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
                  setTimeout( function() { angular.element("#elshopSubHead li:eq("+i+")").triggerHandler("click");  }, 100 );
              }

              /* 페이지연결 */
             $scope.randingURL = function( url, tclick, customParams ) {
               if(!url) { console.log('링크없음'); return; }
               //url = getUseLocalHost(url);
                var params;
                if( url.indexOf("?") != -1 ) {
                  params = "&tclick="+(tclick||"")+"&"+ getBaseParams();
                } else {
                  params = "?tclick="+(tclick||"")+"&"+ getBaseParams();
                }
                if( customParams ) {
                  for( var i in customParams ) {
                    if( customParams[i] ) params += "&"+i+"="+customParams[i];
                  }
                }
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

  /*
    카테고리 슬라이드
  */
  app.directive('elshopCtg', ['$window', '$timeout', '$location', function($window, $timeout, $location) {
      return {
          link:function($scope, el, attrs) {
            function elshopSlide(selectIdx) {
                var $elshopSubHead = angular.element("#elshopSubHead"), /*헤더 Wrapper*/
                    $elsMenu = $elshopSubHead.find("#elsAmenu"),
                    $menuList = $elsMenu.find(">li"), /*상위 카테고리 리스트*/
                    $sideBar = $elshopSubHead.find(".sideBar > img"), /*더보기 그림자*/
                    $subMenu = $elshopSubHead.find(".ksCB"),
                    winWidth = angular.element($window).width(), /*윈도우 넓이*/
                    menuWidth = $elsMenu.outerWidth(); /*메뉴 넓이*/

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
                    menuSlide = $elsMenu.simpleDrag(function() { /*- EGSlider.js 에선언*/
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
            $timeout(elshopSlide); /*생성완료 후 실행*/
          }
      };
  }]);
})();
