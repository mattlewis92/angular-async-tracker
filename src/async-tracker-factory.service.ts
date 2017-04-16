import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

const isActive: symbol = Symbol('isActive');
const tracking: symbol = Symbol('tracking');
const options: symbol = Symbol('options');

type PromiseOrSubscription = Promise<any> | Subscription;

function isPromise(value: any): boolean {
  return typeof value.then === 'function' && typeof value.catch === 'function';
}

function isSubscription(value: any): boolean {
  return value instanceof Subscription;
}

interface AsyncTrackerOptions {}

export class AsyncTracker {

  active$: Subject<boolean> = new Subject();

  constructor(trackerOptions?: AsyncTrackerOptions) {
    this[tracking] = [];
    this[options] = trackerOptions;
    this.updateIsActive();
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
    const oldValue: boolean = this[isActive];
    this[isActive] = this[tracking].length > 0;
    if (oldValue !== this[isActive]) {
      this.active$.next(this[isActive]);
    }
  }

}

export class AsyncTrackerFactory {

  create(trackerOptions?: AsyncTrackerOptions): AsyncTracker {
    return new AsyncTracker(trackerOptions);
  }

}