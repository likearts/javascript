(function(){
	'use strict';

	var app = angular.module('hwISwipe',[]);

	app.controller( 'hwISwipeCtrl', [ function(){

	}]);

	app.directive( 'hwISwipe', [ function(){
		return {
			scope : { swipeIndex:"=?", swipeTotal:"=?", swipeControl : "=?" },
			link : function( scope, el, attrs ) {

				var config = {
					pwrap : angular.element(el).parent(),
					wrap : angular.element(el),
					index : 0,
					page : 0,
					total : 0,
					view : 1,
					slicew : 0,
					touchPos: 0,
					touchPosY: 0,
					pos : 0,
					easing : attrs.easing,
					slide : false
				}, useScrollPos, duration = 300;

				function getSize () {	
					return {
						width : window.innerWidth,
						height : window.innerHeight,
						p : {
							width : config.pwrap.innerWidth(),
							height : config.pwrap.innerHeight()
						},
						w : {
							width : config.wrap.innerWidth(),
							height : config.wrap.innerHeight()
						}
					}
				}

				function reset () {

				}

				function count (i,s) {
					var d = s == 'n'  ? i+1 : i-1;
					if( d < 0 ) d = config.total-1;
					if( d > config.total-1 ) d = 0;
					return d;
				}

				function align( i ) {
					var n = count(i,'n'), p = count(i), h = config.wrap.children()[0].clientHeight;
					config.pwrap.css({width:'100%', overflow:'hidden', height:h});
					angular.forEach( config.wrap.children(), function( e, c ) {
						var pos = -500;
						if( c == i ) pos = 0;
						if( c == n ) pos = 100;
						if( c == p ) pos = -100;
						angular.element(e).css({  
							transform : 'translate( '+pos+'%,0px)'
						});
					});
				}

				function getCubicBezier( type ){
					switch( type ) {
						case "easeOutExpo":
						return "cubic-bezier(0.190, 1.000, 0.220, 1.000)";
					break;
					case "easeOutCubic":
						return "cubic-bezier(0.215, 0.610, 0.355, 1.000)";
					break;
					case "easeOutQuart":
						return "cubic-bezier(0.165, 0.840, 0.440, 1.000)";
					break;
					case "easeOutQuint":
						return "cubic-bezier(0.230, 1.000, 0.320, 1.000)";
					break;
					case "easeOutCirc":
						return "cubic-bezier(0.785, 0.135, 0.150, 0.860)";
					break;
						default: return "";
		                    }
		               }

				function getEasing( easing ) {
					return easing ? {
						'-webkit-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing ),
						'-moz-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing ),
						'-o-transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing ),
						'transition': '-webkit-transform '+duration+'ms '+getCubicBezier( config.easing )
					} : {
						'-webkit-transition': '-webkit-transform 0ms',
						'-moz-transition': '-webkit-transform 0ms',
						'-o-transition': '-webkit-transform 0ms',
						'transition': '-webkit-transform 0ms'
		                    }
		               }

		               function slide ( c, p ) {
		               	c['-webkit-transform'] = p;
					c['-moz-transform'] = p;
					c['-o-transform'] = p;
					c['-ms-transform'] = p; 
					c['transform'] = p;
					return c;
		               }

				function draging( p, e ) {
					if(config.slide) return;

					var np = config.pos - p;
					config.wrap.css( slide( getEasing(e), 'translate('+np+'px,0px)' ) );
					if( e )  {
						config.slide = true;
						var s =  p>0?'n':'p';
						config.wrap.css( slide( getEasing(e), 'translate('+(s=='n'?-100:100)+'%,0px)' ) );
						setTimeout(function(){
							config.index = count( config.index, s );
							config.wrap.css( slide( getEasing(), 'translate(0px,0px)' ) );
							align( config.index );
							config.slide = false;
						}, duration );
						apply();
					}
				}

				function drag () {
					angular.element(document.body).attr("ondragstart","return false");
                    			angular.element(document.body).attr("onselectstart","return false");

                    			config.pwrap.bind( 'touchstart touchmove touchend', function(e){
                    				
                        			var touchProps;
			                      try{   touchProps = e.originalEvent.changedTouches[0]  } 
			                      catch(er) {  touchProps = e.changedTouches[0] }
			                      var touchX = touchProps.clientX, touchY = touchProps.clientY;
			                      
						switch( e.type ){
							case "touchstart":
								config.touchPos = touchX;
								config.touchPosY = touchY;
							break;
							case "touchmove":
								var cpos = config.touchPos-touchX, cy = config.touchPosY-touchY;
								if( Math.abs(cy) > 10 && useScrollPos != 'X' ) useScrollPos = 'Y'; 
								if( Math.abs(cpos) > 20 && useScrollPos != 'Y' ) useScrollPos = 'X';
								if( useScrollPos != 'Y' ) draging( cpos );
							break;
							case "touchend":
								draging( config.touchPos-touchX, true );
								config.touchPos = config.touchPosY = 0;
								useScrollPos = null;
								break;
						}

					});
				}	
				
				function apply(){
					scope.swipeIndex = config.index;	
					scope.swipeTotal = config.page;
					try{  scope.$apply() } catch(e) { };
				}
				
				function initialize () {
					var size = getSize();
					config.total = config.wrap.children().length,
					config.page =  config.total/config.view;
					config.slicew = size.width/config.view;
					angular.forEach( config.wrap.children(), function( e, i ) {
						angular.element(e).css({  
							width:config.slicew, 
							left:0,  
							position:'absolute',
							transform : 'translate( '+(100*i)+'%,0px)'
						});
					});
					
					align(0);
					drag();
					
					apply();
				}

				scope.goTo = function( i ) {
					align( i );
				}

				scope.swiepeControl = function( str ) {
					console.log( str );
					switch( str ) {
						case "prev" : align( count( config.index, 'p' ) ); break;
						case "next" : align( count( config.index, 'n' ) ); break;
						default: 
							if( typeof str != 'number' ) return;
							scope.goTo(str);
					}
				}
				
				setTimeout(function(){ initialize() }, 300 );
			}
		}
	}]);

	app.filter('hwIswpRange', function(){
	        return function(n) {
	          var res = [];
	          for (var i = 0; i < n; i++) {
	            res.push(i);
	          }
	          return res;
	        };
	});
})();