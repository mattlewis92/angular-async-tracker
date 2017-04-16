const isActive: symbol = Symbol('isActive');
const tracking: symbol = Symbol('tracking');

export class AsyncTracker {

  constructor() {
    this[isActive] = false;
    this[tracking] = [];
  }

  get active(): boolean {
    return this[isActive];
  }

  add(promise: Promise<any>): void {
    this[tracking].push(promise);
    this.updateIsActive();
    promise.then(() => {
      this.removeFromTracking(promise);
    }, () => {
      this.removeFromTracking(promise);
    });
  }

  private removeFromTracking(promise: Promise<any>): void {
    this[tracking] = this[tracking].filter(iPromise => iPromise !== promise);
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