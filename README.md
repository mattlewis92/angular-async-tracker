# angular async tracker

[![Build Status](https://travis-ci.org/mattlewis92/angular-async-tracker.svg?branch=master)](https://travis-ci.org/mattlewis92/angular-async-tracker)
[![codecov](https://codecov.io/gh/mattlewis92/angular-async-tracker/branch/master/graph/badge.svg)](https://codecov.io/gh/mattlewis92/angular-async-tracker)
[![npm version](https://badge.fury.io/js/angular-async-tracker.svg)](http://badge.fury.io/js/angular-async-tracker)
[![devDependency Status](https://david-dm.org/mattlewis92/angular-async-tracker/dev-status.svg)](https://david-dm.org/mattlewis92/angular-async-tracker?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/mattlewis92/angular-async-tracker.svg)](https://github.com/mattlewis92/angular-async-tracker/issues)
[![GitHub stars](https://img.shields.io/github/stars/mattlewis92/angular-async-tracker.svg)](https://github.com/mattlewis92/angular-async-tracker/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mattlewis92/angular-async-tracker/master/LICENSE)

## Table of contents

* [About](#about)
* [Installation](#installation)
* [Documentation](#documentation)
* [Development](#development)
* [License](#license)

## About

A port of [angular-promise-tracker](https://github.com/ajoslin/angular-promise-tracker) to angular 6+ that also supports observables

## Installation

Install through npm:

```
npm install --save angular-async-tracker
```

Finally use in one of your apps components:

```typescript
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AsyncTrackerFactory, AsyncTracker } from 'angular-async-tracker';

@Component({
  template: `
    <span *ngIf="asyncTracker.active">Loading...</span>
    <button *ngIf="!asyncTracker.active" (click)="save()">Save</button>
  `
})
export class MyComponent {
  asyncTracker: AsyncTracker;

  constructor(
    private http: HttpClient,
    asyncTrackerFactory: AsyncTrackerFactory
  ) {
    this.asyncTracker = asyncTrackerFactory.create();
  }

  save() {
    const saved: Subscription = this.http
      .post('/foo', { bar: 'bam' })
      .pipe(take(1))
      .subscribe(result => {
        console.log(result);
      });
    // `asyncTracker.add` accepts promises or observable subscriptions
    this.asyncTracker.add(saved);
  }
}
```

## Documentation

All documentation is auto-generated from the source via [compodoc](https://compodoc.github.io/compodoc/) and can be viewed here:
https://mattlewis92.github.io/angular-async-tracker/docs/

## Development

### Prepare your environment

* Install [Node.js](http://nodejs.org/) and NPM (should come with)
* Install local dev dependencies: `npm` while current directory is this repo

### Development server

Run `npm start` to start a development server on port 8000 with auto reload + tests.

### Testing

Run `npm test` to run tests once or `npm run test:watch` to continually run tests.

### Release

```bash
npm run release
```

## License

MIT
