/**
 * @Autor 박해원
 * @date 20171208
 *
 * @nddoc module
 * @name hwslider
 * @description
 * - 슬라이드 모듈
 */
(function(){
    angular.module('hwslider2',[])
	
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
				case "customBack":
					return "cubic-bezier(.16,1,.19,1.19)";
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
				default: return "cubic-bezier(0.1, 0.57, 0.1, 1)";
			}
		}
	}])

	/**
	 * @nddoc directive
	 * @name hwSlider
	 * @description
	 * - 슬라이더
	 *
	 * @Attributes
	 * - easing : transition 효과
	 * - auto-center : 클릭 & 선택된 아이템 센터 여부
	 * - duration : 드래그 종료시 슬라이드 최종 위치까지의 이동 시간
	 * - margin-right : 스크롤 우측 끝 여백
	 *
	 * @Example
	 * <ul hw-slider
	 * 		easing='easingOutQuart'
	 * 		auto-center='true'
	 * 		margin-right='3'
	 * 		ducation='400' (default 300)>
	 * 		<li ng-repeat='... in items'> .... </li>
	 * 	</ul>
	 */
	.directive('hwSlider2', ['$timeout','cubicbezier','$rootScope',function($timeout,cubicbezier,$rootScope) {
		return function (scope, el, attrs) {
			var config,
				drag = false,
				dragEventListener = false,
				itemsWidth = 0,
				windowInitW = window.innerWidth;

			/**
			 * @ngdoc function
			 * @name init
			 * @description
			 * - 초기 설정
			 */
			function init(){
				config = {
					x : 0,
					y : 0,
					move:'',
					hold:0,
					transition:false,
					dragX:0,
					duration: attrs.duration || 400,
					upDuration : 0,
					easing : attrs.easing,
					touchtime : 0,
					autoCenter : attrs.autoCenter == 'true' ? true : false,
					marginRight: attrs.marginRight || 0,
					bounce : attrs.bounce == 'true' ? true : false,
					transX : 0,
					applyInterval : 0
				}

                itemsWidth = getListWidth();
                if( itemsWidth <= el.parent()[0].offsetWidth ) return;

                el.children().css({
                    '-moz-box-sizing':'border-box',
                    'box-sizing':'border-box',
                    'will-change': 'transform',
                    'pointer-events': 'auto',
                    '-webkit-user-drag' : 'none',
                    'touch-action' : 'pan-y',
                    'user-select' : 'none',
                    'will-change' : 'transform',
                    '-webkit-font-smoothing': 'antialiased'
                });
				drag = true;
				if(!dragEventListener) bindEvent(true);
			}

			function getListWidth(){
				var scrollWidth = el[0].scrollWidth;
				if( scrollWidth > getContainerWidth() ) scrollWidth += Number(config.marginRight);
				return scrollWidth;
			}

			function bindEvent(bind){
				if(!bind){
                    dragEventListener = false;
					el.unbind('touchstart.hwslider touchmove.hwslider touchend.hwslider');
					el.children().unbind('click.hwslider');
				} else {
                    dragEventListener = true;
					el.bind('touchstart.hwslider touchmove.hwslider touchend.hwslider',dragEvent);
					el.children().children().bind('click.hwslider',clickEvent);
				}
			}

			/**
			 * @ngdoc function
			 * @name getEasing
			 * @description
			 * - transition 적용
			 *
			 * @param easing
			 * @param posx
			 * @return {*}
			 */
			function getEasing( easing, posx ) {
				return easing ? {
					'-webkit-transition': '-webkit-transform '+(config.speed||config.duration)+'ms '+cubicbezier( config.easing ),
					'-moz-transition': '-moz-transform '+(config.speed||config.duration)+'ms '+cubicbezier( config.easing ),
					'-o-transition': '-o-transform '+(config.speed||config.duration)+'ms '+cubicbezier( config.easing ),
					'transition': 'transform '+(config.speed||config.duration)+'ms '+cubicbezier( config.easing ),
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
			 * @ngdoc function
			 * @name resizeEvent
			 * @description
			 * - 리사이즈시 선택된('active')가 있으면 화면중앙으로 이동 처리
			 *
			 * @param e
			 */
			function resizeEvent(e){
				if(!el.children().children().length || parseInt(windowInitW) == parseInt(window.innerWidth) ) return;
				windowInitW = window.innerWidth;
                drag = false;

				if( getListWidth() <= el.parent()[0].offsetWidth ) {
					setPox(0);
					return;
                } else init();

				var find = false;
				for( var i=0;i<el.children().children().length;++i) {
					if(!find && angular.element(el.children().children()[i]).hasClass('active')){
						clickEvent({
							type : 'click',
							currentTarget:angular.element(el.children().children()[i])[0]
						})
					}
				}
				if(!find||!config.autoCenter) {
                    config.transition = false;
					draging(-10);
                }
			}

			/**
			 * @ngdoc function
			 * @name clickEvent
			 * @description
			 * - 선택된 아이템 화면 중앙으로 이동 처리
			 *
			 * @param e
			 */
			function clickEvent(e){
				if( e.type != 'click' || !config.autoCenter ) return;
				el.children().children().removeClass('active');

				var w = getContainerWidth(),
					t = e.currentTarget,
					x = t.offsetLeft,
					itemW = t.clientWidth,
					newX = -x + w/2 - itemW/2,
					ew = itemsWidth;

				if( ew < w ) return;
				if( newX > 0 ) newX = 0;
				if( newX < -(ew-w) ) newX = -(ew-w);

				angular.element(t).addClass('active');
				setPox( newX );
			}

			function setPox( x ) {
                clearInterval(config.applyInterval);
				config.speed = 0;
				el.children().css( getEasing(true,x) );
				config.hold = x;
			}

			function dragEvent(e) {
				var touchProps;
				try{ touchProps = e.originalEvent.changedTouches[0] }
				catch(er) { touchProps = e.changedTouches[0] }
				var touchX = touchProps.clientX, dy = touchProps.clientY;

				if(!drag) return;

				switch(e.type){
					case "touchstart":
						e.stopPropagation();
						config.x = touchX;
						config.y = dy;
						touchtime = new Date().getTime();
						break;
					case "touchmove":
						var cpos = config.x-touchX, cy = config.y-dy;
						if( Math.abs(cy) > 10 && config.move != 'X' ) config.move = 'Y'; //위,아래 이동
						if( Math.abs(cpos) > 20 && config.move != 'Y' ) config.move = 'X'; //좌,우 이동
						if( config.move != 'Y' ) {
							e.preventDefault();
							draging( cpos );
						}
						break;
					case "touchend":
						var maxtime = 500,
							endtime = Math.abs(new Date().getTime()-touchtime),
							uptime = endtime-maxtime,
							uppos = 0,
							acpos = 0;

						config.speed = 1500 - endtime;

						if( uptime > 0 ) uptime = 0;
						uppos = ( Math.abs(uptime)/maxtime*5);

						if(config.speed<config.duration) config.speed = config.duration;
						if(Math.floor(uppos)>0) acpos = uppos * (config.x-touchX);
						else acpos = (config.x-touchX);

						if(config.move!='Y') draging( acpos, true );
						else setPox( config.hold );

						config.x = config.y = 0;
						config.move = '';

						break;
				}
			}

			function draging( x, e ) {
				if( !Math.abs(x) || config.transition ) return;
				var cposx = config.hold-x, limit = getContainerWidth();
				clearInterval(config.applyInterval);

				if(!e) {
					var overX = 0;
					if( cposx > 0 ) {
						overX = Math.abs(cposx)/(limit)*(limit-50);
						cposx = cposx-overX;
					}
					if( cposx < -(itemsWidth-limit) ) {
						overX = Math.abs(cposx+(itemsWidth-limit))/(limit)*(limit-50);
						cposx = cposx+overX;
					}
					el.children().css( getEasing(e,cposx) );
					config.dragX = cposx;
				}
				else {
					var ease = "easeOutBack",
						endEasing = config.easing,
						afterX = 0,
						xx = cposx,
						over = "",
                        contWidth = getListWidth(),
						maxinum = contWidth-limit;

                    config.speed = 100;
                    config.applyInterval = setInterval( function(){
                        config.hold = Math.round(getTranslateX());
                        config.hold -= ( config.hold-cposx )/12;
                        if( Math.round(config.hold) > 0 && over!= "right" ) {
                            cposx = -Math.round(cposx);
                            over = "right";
                        }
                        if( Math.round(config.hold) < -maxinum && over != "left" ) {
                            cposx = -( maxinum - (Math.abs(cposx)-Math.abs(maxinum)));
                            if( cposx < -maxinum ) cposx = Math.abs(cposx+maxinum);
                            xx = cposx;
                            over = "left";
                        }
                        if( Math.round(config.hold) == Math.round(cposx) )  {
                            clearInterval(config.applyInterval);
                            over = "";
                            config.speed = 0;
                        }
                        el.children().css( getEasing(false, Math.round(config.hold) ) );
					},10);
				}
			}

			function getContainerWidth() {
				var limit = window.innerWidth;
				try { limit = el.parent()[0].offsetWidth } catch(e){}
				return limit;
			}
			
			function getTranslateX(){
                var style = window.getComputedStyle( el.children()[0] );
                var matrix = new WebKitCSSMatrix(style.webkitTransform);
                //console.log('translateX: ', matrix.m41);
                return matrix.m41;
			}

			angular.element(window).bind('resize.hwslider',resizeEvent);
			$timeout(function(){ init() }, 1000 );
		}
	}])
})();