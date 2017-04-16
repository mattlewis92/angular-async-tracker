import { Subscription } from 'rxjs/Subscription';

const isActive: symbol = Symbol('isActive');
const tracking: symbol = Symbol('tracking');

type PromiseOrSubscription = Promise<any> | Subscription;

function isPromise(value: any): boolean {
  return typeof value.then === 'function' && typeof value.catch === 'function';
}

function isSubscription(value: any): boolean {
  return value instanceof Subscription;
}

export class AsyncTracker {

  constructor() {
    this[isActive] = false;
    this[tracking] = [];
  }

  get active(): boolean {
    return this[isActive];
  }

  get count(): number {
    return this[tracking].length;
  }

  add(promiseOrSubscription: PromiseOrSubscription | PromiseOrSubscription[]): void {
    if (Array.isArray(promiseOrSubscription)) {
      promiseOrSubscription.forEach(arrayItem => this.add(arrayItem));
    } else {
      this[tracking].push(promiseOrSubscription);
      this.updateIsActive();
      if (isPromise(promiseOrSubscription)) {
        const promise: Promise<any> = promiseOrSubscription as Promise<any>;
        promise.then(() => {
          this.removeFromTracking(promiseOrSubscription);
        }, () => {
          this.removeFromTracking(promiseOrSubscription);
        });
      } else if (isSubscription(promiseOrSubscription)) {
        const subscription: Subscription = promiseOrSubscription as Subscription;
        subscription.add(() => {
          this.removeFromTracking(promiseOrSubscription);
        });
      } else {
        throw new Error('asyncTracker.add expects either a promise or an observable subscription.');
      }
    }
  }

  private removeFromTracking(promiseOrSubscription: PromiseOrSubscription): void {
    this[tracking] = this[tracking].filter(item => item !== promiseOrSubscription);
    this.updateIsActive();
  }

  private updateIsActive(): void {
    this[isActive] = this[tracking].length > 0;
  }

}

export class AsyncTrackerFactory {

  create(): AsyncTracker {
    return new AsyncTracker();
  }

}