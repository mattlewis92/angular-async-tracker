import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { AsyncTrackerModule, AsyncTrackerFactory, AsyncTracker } from '../src';

function createPromise(): {promise: Promise<any>, resolve: Function, reject: Function} {
  let resolve: Function, reject: Function;
  let promise: Promise<any> = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return {promise, resolve, reject};
}

describe('async-tracker-factory service', () => {

  let trackerFactory: AsyncTrackerFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AsyncTrackerModule.forRoot()
      ]
    });
    trackerFactory = TestBed.get(AsyncTrackerFactory);
  });

  it('should create an instance of the async tracker', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    expect(tracker instanceof AsyncTracker).to.be.true;
  });

  it('should track promises that resolve', async(() => {
    const tracker: AsyncTracker = trackerFactory.create();
    const {promise, resolve} = createPromise();
    expect(tracker.active).to.be.false;
    tracker.add(promise);
    expect(tracker.active).to.be.true;
    resolve();
    setTimeout(() => {
      expect(tracker.active).to.be.false;
    });
  }));

  it('should track promises that reject', async(() => {
    const tracker: AsyncTracker = trackerFactory.create();
    const {promise, reject} = createPromise();
    expect(tracker.active).to.be.false;
    tracker.add(promise);
    expect(tracker.active).to.be.true;
    reject();
    setTimeout(() => {
      expect(tracker.active).to.be.false;
    });
  }));

  it('should handle observables', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    const subject: Subject<any> = new Subject();
    expect(tracker.active).to.be.false;
    tracker.add(subject.take(1).subscribe());
    expect(tracker.active).to.be.true;
    subject.next();
    expect(tracker.active).to.be.false;
  });

  it('should throw when passing non promises or subscrptions', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    const arg: Promise<any> = {} as Promise<any>; // hack to make typescript happy
    expect(() => tracker.add(arg)).to.throw();
  });

  it('should accept an array of items to add', async(() => {
    const tracker: AsyncTracker = trackerFactory.create();
    const {promise, resolve} = createPromise();
    const subject: Subject<any> = new Subject();
    expect(tracker.active).to.be.false;
    tracker.add([
      subject.take(1).subscribe(),
      promise
    ]);
    expect(tracker.active).to.be.true;
    resolve();
    setTimeout(() => {
      expect(tracker.active).to.be.true;
      subject.next();
      expect(tracker.active).to.be.false;
    });
  }));

  it('should expose the count of currently tracked items', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    const subject1: Subject<any> = new Subject();
    const subject2: Subject<any> = new Subject();
    expect(tracker.trackingCount).to.equal(0);
    tracker.add([
      subject1.take(1).subscribe(),
      subject2.take(1).subscribe()
    ]);
    expect(tracker.trackingCount).to.equal(2);
    subject1.next();
    expect(tracker.trackingCount).to.equal(1);
    subject2.next();
    expect(tracker.trackingCount).to.equal(0);
  });

  it('should expose an observable that changes when isActive changes', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    const activeChanged: sinon.SinonSpy = sinon.spy();
    const subscription: Subscription = tracker.active$.subscribe(activeChanged);
    const subject1: Subject<any> = new Subject();
    const subject2: Subject<any> = new Subject();
    tracker.add([
      subject1.take(1).subscribe(),
      subject2.take(1).subscribe()
    ]);
    expect(activeChanged).to.have.been.calledOnce;
    expect(activeChanged).to.have.been.calledWith(true);
    subject1.next();
    expect(activeChanged).to.have.been.calledOnce;
    subject2.next();
    expect(activeChanged).to.have.been.calledTwice;
    expect(activeChanged).to.have.been.calledWith(false);
    subscription.unsubscribe();
  });

  it('should destroy the tracker', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    const subject: Subject<any> = new Subject();
    expect(tracker.active).to.be.false;
    expect(tracker.trackingCount).to.equal(0);
    tracker.add(subject.take(1).subscribe());
    expect(tracker.trackingCount).to.equal(1);
    expect(tracker.active).to.be.true;
    tracker.destroy();
    expect(tracker.trackingCount).to.equal(0);
    expect(tracker.active).to.be.false;
    subject.next();
    expect(tracker.trackingCount).to.equal(0);
    expect(tracker.active).to.be.false;
  });

  it('should expose all tracking items', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    const subject: Subject<any> = new Subject();
    const subscription: Subscription = subject.take(1).subscribe();
    expect(tracker.tracking).to.deep.equal([]);
    tracker.add(subscription);
    expect(tracker.tracking).to.deep.equal([subscription]);
    expect(tracker.tracking).not.to.equal(tracker.tracking);
  });

  it('should expose a clone of the tracking array', () => {
    const tracker: AsyncTracker = trackerFactory.create();
    expect(tracker.tracking).to.deep.equal(tracker.tracking);
    expect(tracker.tracking).not.to.equal(tracker.tracking);
  });

  describe('activationDelay', () => {

    it('should take 500ms to activate the tracker', fakeAsync(() => {
      const tracker: AsyncTracker = trackerFactory.create({activationDelay: 500});
      const subject: Subject<any> = new Subject();
      expect(tracker.active).to.be.false;
      tracker.add(subject.take(1).subscribe());
      expect(tracker.active).to.be.false;
      tick(499);
      expect(tracker.active).to.be.false;
      tick(1);
      expect(tracker.active).to.be.true;
      subject.next();
      expect(tracker.active).to.be.false;
    }));

    it('should never activate the tracker', fakeAsync(() => {
      const tracker: AsyncTracker = trackerFactory.create({activationDelay: 500});
      const subject: Subject<any> = new Subject();
      expect(tracker.active).to.be.false;
      tracker.add(subject.take(1).subscribe());
      expect(tracker.active).to.be.false;
      tick(499);
      subject.next();
      expect(tracker.active).to.be.false;
      tick(1);
      expect(tracker.active).to.be.false;
    }));

    it('should destroy the tracker', fakeAsync(() => {
      const tracker: AsyncTracker = trackerFactory.create({activationDelay: 500});
      const subject: Subject<any> = new Subject();
      expect(tracker.active).to.be.false;
      tracker.add(subject.take(1).subscribe());
      expect(tracker.active).to.be.false;
      tick(499);
      expect(tracker.active).to.be.false;
      tracker.destroy();
      tick(1);
      expect(tracker.active).to.be.false;
      subject.next();
      expect(tracker.active).to.be.false;
    }));

  });

});
