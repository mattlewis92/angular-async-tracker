import { TestBed, async } from '@angular/core/testing';
import { expect } from 'chai';
import { Subject } from 'rxjs/Subject';
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

});
