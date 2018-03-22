import { trigger, state, animate, transition, style } from '@angular/animations';

export const slideInOutAnimation =
  trigger( 'slideInOutAnimation', [
    // '*' host
    state( '*', style({
      position:'fixed',
      top:'100px',
      left:0,
      right:0,
      bottom:0,
     //color:'#fff',
      padding:'20px',
      //backgroundColor: 'rgba(0,0,0,1)',
      transform: 'translateX(0)'
    })),

    // route 'enter'
    transition(':enter', [
      style({
        transform: 'translateX(100%)',
        //backgroundColor:'rgba(0,0,0,.5)'
      }),
      animate( '.4s ease-in-out', style({
        transform: 'translateX(0%)',
        //backgroundColor:'rgba(0,0,0,1)'
      }))
    ]),

    // route 'leave'
    transition(':leave',[
      animate('.4s ease-in-out', style({
        transform: 'translateX(-100%)',
        //backgroundColor:'rgba(0,0,0,.5)'
      }))
    ])
  ]);
