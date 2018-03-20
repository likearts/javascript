/**
 * @author 박해원
 * @date 20170907
 * @description
 *  - hw swipe
 */
import { EventEmitter } from '@angular/core';

export class EventManager {
  message : string;
  eventId : number;
}

export class CostomEventEmitter {
  public onChange: EventEmitter<EventManager> = new EventEmitter<EventManager>();

  public doSomething(message: string) {
    // do something, then...
    this.onChange.emit({message: message, eventId: 42});
  }
}

export class CostomEvent {
  private _serviceSubscription;

  constructor(private service: CostomEventEmitter) {
    this._serviceSubscription = this.service.onChange.subscribe({
      next: (event: EventManager) => {
        console.log(`Received message #${event.eventId}: ${event.message}`);
      }
    })
  }

  public consume() {
    // do some stuff, then later...
    this.cleanup();
  }

  private cleanup() {
    this._serviceSubscription.unsubscribe();
  }
}
