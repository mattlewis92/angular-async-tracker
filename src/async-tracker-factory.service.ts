import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

const isActive: symbol = Symbol('isActive');
const tracking: symbol = Symbol('tracking');
const options: symbol = Symbol('options');
const activationDelayTimeout: symbol = Symbol('activationDelayTimeout');

function isPromise(value: any): boolean {
  return typeof value.then === 'function' && typeof value.catch === 'function';
}

function isSubscription(value: any): boolean {
  return value instanceof Subscription;
}

function removeFromTracking(tracker: AsyncTracker, promiseOrSubscription: PromiseOrSubscription): void {
  tracker[tracking] = tracker[tracking].filter(item => item !== promiseOrSubscription);
  if (tracker[tracking].length === 0 && tracker[activationDelayTimeout]) {
    tracker[activationDelayTimeout].cancel();
    delete tracker[activationDelayTimeout];
  }
  updateIsActive(tracker);
}

function updateIsActive(tracker: AsyncTracker): void {
  if (!tracker[activationDelayTimeout]) {
    const oldValue: boolean = tracker[isActive];
    tracker[isActive] = tracker[tracking].length > 0;
    if (oldValue !== tracker[isActive]) {
      tracker.active$.next(tracker[isActive]);
    }
  }
}

function timeoutPromise(duration: number): {promise: Promise<any>, cancel: Function} {
  let cancel: Function;
  const promise: Promise<any> = new Promise((resolve) => {
    const timerId: any = setTimeout(() => resolve(), duration);
    cancel = () => {
      clearTimeout(timerId);
      resolve();
    };
  });
  return {cancel, promise};
}

export type PromiseOrSubscription = Promise<any> | Subscription;

export interface AsyncTrackerOptions {
  activationDelay?: number;
}

export class AsyncTracker {

  /**
   * An observable that emits true or false as the value for `active` changes
   */
  active$: Subject<boolean> = new Subject();

  /**
   * @param trackerOptions.activationDelay - number of milliseconds that an added promise needs to be pending before this tracker is active
   */
  constructor(trackerOptions: AsyncTrackerOptions = {}) {
    this[tracking] = [];
    this[options] = trackerOptions;
    updateIsActive(this);
  }

  /**
   * Returns whether this tracker is currently active. That is, whether any of the promises added to/created by this tracker
   * are still pending. Note: if the `activationDelay` has not elapsed yet, this will return false.
   */
  get active(): boolean {
    return this[isActive];
  }

  /**
   * The count of promises or subscriptions currently being tracked.
   */
  get trackingCount(): number {
    return this[tracking].length;
  }

  /**
   * Returns whether this tracker is currently tracking a request.
   * That is, whether any of the promises / subscriptions added to/created by this tracker are still pending.
   * This method has no regard for `activationDelay`.
   */
  get tracking(): PromiseOrSubscription[] {
    return [...this[tracking]];
  }

  /**
   * Add any arbitrary promise or observable subscription to the tracker.
   * `tracker.active` will be true until a promise is resolved or rejected or a subscription emits the first value.
   */
  add(promiseOrSubscription: PromiseOrSubscription | PromiseOrSubscription[]): void {
    if (Array.isArray(promiseOrSubscription)) {
      promiseOrSubscription.forEach(arrayItem => this.add(arrayItem));
    } else {
      this[tracking].push(promiseOrSubscription);
      if (this[tracking].length === 1 && this[options].activationDelay) {
        this[activationDelayTimeout] = timeoutPromise(this[options].activationDelay);
        this[activationDelayTimeout].promise.then(() => {
          delete this[activationDelayTimeout];
          updateIsActive(this);
        });
      }
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

  /**
   * Causes a tracker to immediately become inactive and stop tracking all current promises and subscriptions.
   */
  clear(): void {
    if (this[activationDelayTimeout]) {
      this[activationDelayTimeout].cancel();
      delete this[activationDelayTimeout];
    }
    this[tracking] = [];
    updateIsActive(this);
  }

}

@Injectable()
export class AsyncTrackerFactory {

  create(trackerOptions?: AsyncTrackerOptions): AsyncTracker {
    return new AsyncTracker(trackerOptions);
  }

}