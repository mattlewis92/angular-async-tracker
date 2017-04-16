import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

const isActive: symbol = Symbol('isActive');
const tracking: symbol = Symbol('tracking');
const options: symbol = Symbol('options');

function isPromise(value: any): boolean {
  return typeof value.then === 'function' && typeof value.catch === 'function';
}

function isSubscription(value: any): boolean {
  return value instanceof Subscription;
}

function removeFromTracking(tracker: AsyncTracker, promiseOrSubscription: PromiseOrSubscription): void {
  tracker[tracking] = tracker[tracking].filter(item => item !== promiseOrSubscription);
  updateIsActive(tracker);
}

function updateIsActive(tracker: AsyncTracker): void {
  const oldValue: boolean = tracker[isActive];
  tracker[isActive] = tracker[tracking].length > 0;
  if (oldValue !== tracker[isActive]) {
    tracker.active$.next(tracker[isActive]);
  }
}

export type PromiseOrSubscription = Promise<any> | Subscription;

export interface AsyncTrackerOptions {}

export class AsyncTracker {

  active$: Subject<boolean> = new Subject();

  constructor(trackerOptions?: AsyncTrackerOptions) {
    this[tracking] = [];
    this[options] = trackerOptions;
    updateIsActive(this);
  }

  get active(): boolean {
    return this[isActive];
  }

  get activeCount(): number {
    return this[tracking].length;
  }

  add(promiseOrSubscription: PromiseOrSubscription | PromiseOrSubscription[]): void {
    if (Array.isArray(promiseOrSubscription)) {
      promiseOrSubscription.forEach(arrayItem => this.add(arrayItem));
    } else {
      this[tracking].push(promiseOrSubscription);
      updateIsActive(this);
      if (isPromise(promiseOrSubscription)) {
        const promise: Promise<any> = promiseOrSubscription as Promise<any>;
        promise.then(() => {
          removeFromTracking(this, promiseOrSubscription);
        }, () => {
          removeFromTracking(this, promiseOrSubscription);
        });
      } else if (isSubscription(promiseOrSubscription)) {
        const subscription: Subscription = promiseOrSubscription as Subscription;
        subscription.add(() => {
          removeFromTracking(this, promiseOrSubscription);
        });
      } else {
        throw new Error('asyncTracker.add expects either a promise or an observable subscription.');
      }
    }
  }

}

export class AsyncTrackerFactory {

  create(trackerOptions?: AsyncTrackerOptions): AsyncTracker {
    return new AsyncTracker(trackerOptions);
  }

}