> **Warning**
> This library is not production ready yet.
> 
<br />
<br />

<div align="center">
  <img width="100px" src="https://github.com/wox-team/wox-inject/assets/8842821/d994610c-d755-437f-9ab8-6e705f50d4b2" />
</div>

<h1 align="center">wox inject</h1>
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

wox inject primary empowers React apps with a versatile dependency injection library, promoting an alternative paradigm to handle complexity.

```tsx
@Injectable()
class FooService {
  greet(msg: string) {
    console.log(`hello ${msg}!`);
  }
}

function App() {
  const fooService = useResolve(FooService);

  return (
    <button onClick={() => {
      fooService.greet('there!');
    }}>
      click me
    </button>
  );
}
```

## Installation

Install `@wox-team/wox-inject` in your project with your package manager of choice:
```bash
npm install @wox-team/wox-inject
```

```bash
yarn add @wox-team/wox-inject
```

```bash
pnpm add @wox-team/wox-inject
```

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
