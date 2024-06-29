<div align="center">
  <img width="100%" src="https://github.com/wox-team/wox-inject/assets/8842821/5323b472-15c9-4d2a-90b4-81e7663ebba1" />
</div>

<h3 align="center">
  An open source Dependency Injection library.
</h3>

<div align="center">
  <a aria-label="contributors graph" href="https://github.com/wox-team/wox-inject/graphs/contributors">
    <img alt="" src="https://img.shields.io/github/contributors/wox-team/wox-inject.svg" />
  </a>
  <a aria-label="last commit" href="https://github.com/wox-team/wox-inject/commits/canary">
    <img alt="" src=
  "https://img.shields.io/github/last-commit/wox-team/wox-inject.svg" />
  </a>
  <a aria-label="license" href="https://github.com/wox-team/wox-inject/blob/canary/LICENSE">
    <img alt="" src="https://img.shields.io/github/license/wox-team/wox-inject.svg" />
  </a>
</div>

<br />
<br />

Wox Inject empowers React apps with a versatile dependency injection library, promoting an alternative paradigm to handle complexity.

```tsx
import { Injectable } from '@wox-team/wox-inject';

@Injectable()
class GreeterService {
  greet(val: string) {
    console.log(val);
  }
}

function App() {
  const greeterService = useResolve(GreeterService);

  return (
    <button type="button" onClick={() => greeterService.greet('hello!')}>click me</button>
  );
}
```

## Getting Started

Visit [wox.so](https://wox.so) to get started with Wox Inject.

<br />

## What about SSR?

Right now the focus is to provide stability for SPA usage. SSR will be on the roadmap.

<br />

## Contributing

Want to contribute to wox inject? Our [contributing guide](https://github.com/wox-team/wox-inject/blob/canary/.github/CONTRIBUTING.md) has you covered.

<br />
<br />
<br />
<br />
