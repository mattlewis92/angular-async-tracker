# angular async tracker
[![Build Status](https://travis-ci.org/mattlewis92/angular-async-tracker.svg?branch=master)](https://travis-ci.org/mattlewis92/angular-async-tracker)
[![codecov](https://codecov.io/gh/mattlewis92/angular-async-tracker/branch/master/graph/badge.svg)](https://codecov.io/gh/mattlewis92/angular-async-tracker)
[![npm version](https://badge.fury.io/js/angular-async-tracker.svg)](http://badge.fury.io/js/angular-async-tracker)
[![devDependency Status](https://david-dm.org/mattlewis92/angular-async-tracker/dev-status.svg)](https://david-dm.org/mattlewis92/angular-async-tracker?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/mattlewis92/angular-async-tracker.svg)](https://github.com/mattlewis92/angular-async-tracker/issues)
[![GitHub stars](https://img.shields.io/github/stars/mattlewis92/angular-async-tracker.svg)](https://github.com/mattlewis92/angular-async-tracker/stargazers)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/mattlewis92/angular-async-tracker/master/LICENSE)

## Table of contents

- [About](#about)
- [Installation](#installation)
- [Documentation](#documentation)
- [Development](#development)
- [License](#license)

## About

A port of [angular-promise-tracker](https://github.com/ajoslin/angular-promise-tracker) to angular 2+ that also supports observables

## Installation

Install through npm:
```
npm install --save angular-async-tracker
```

Then include in your apps module:

```typescript
import { Component, NgModule } from '@angular/core';
import { AsyncTrackerModule } from 'angular-async-tracker';

@NgModule({
  imports: [
    AsyncTrackerModule.forRoot()
  ]
})
export class MyModule {}
```

Finally use in one of your apps components:
```typescript
import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Subscription } from 'rxjs/Subscription';
import { AsyncTrackerFactory, AsyncTracker } from 'angular-async-tracker';

@Component({
  template: `
    <div *ngIf="asyncTracker.active">Loading...</div>
    <button *ngIf="!asyncTracker.active" (click)="save()">Save</button>
  `
})
export class MyComponent {

  asyncTracker: AsyncTracker;

  constructor(
    private http: Http,
    asyncTrackerFactory: AsyncTrackerFactory
  ) {
    this.asyncTracker = asyncTrackerFactory.create();
  }

  save() {
    const saved: Subscription = this.http.post('/foo', {bar: 'bam'})
      .take(1)
      .subscribe((result) => {
        console.log(result);
      });
    this.asyncTracker.add(saved);
  }

}
```

### Usage without a module bundler
```
<script src="node_modules/angular-async-tracker/bundles/angular-async-tracker.umd.js"></script>
<script>
    // everything is exported angularAsyncTracker namespace
</script>
```

## Documentation
All documentation is auto-generated from the source via [compodoc](https://compodoc.github.io/compodoc/) and can be viewed here:
https://mattlewis92.github.io/angular-async-tracker/docs/

## Development

### Prepare your environment
* Install [Node.js](http://nodejs.org/) and [yarn](https://yarnpkg.com/en/docs/install)
* Install local dev dependencies: `yarn` while current directory is this repo

### Development server
Run `yarn start` to start a development server on port 8000 with auto reload + tests.

### Testing
Run `yarn test` to run tests once or `yarn run test:watch` to continually run tests.

### Release
```bash
yarn run release
```

## License

MIT
