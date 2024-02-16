import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Lifecycle, NewContainer, useResolveLifecycle, useResolve } from './inject_react';
import { Injectable, clearRegistry, Scopes } from './inject';
import { setupScopedResolution, setupSingletonResolution } from '../tests/setup_dependencies';
import { PropsWithChildren, useState } from 'react';
import { createTestBed } from './testing';

beforeEach(() => {
	clearRegistry();
});

test('useDependency, when used in a React component, should return expected class instance', () => {
	const deps = setupScopedResolution();

	function Comp() {
		const dep = useResolve(deps[4]);

		return <span>{dep.value.description}</span>;
	}

	render(<Comp />);

	expect(screen.getByText('4')).toBeInTheDocument();
});

test('NewContainer, when rendered with shouldInheritScopes -> false, should create a new instances for scoped dependencies', () => {
	const deps = setupScopedResolution();

	function Comp_1() {
		const dep = useResolve(deps[4]);

		dep.value = Symbol('mutated from comp 1');

		return (
			<>
				<span>{dep.value.description}</span>

				<NewContainer shouldInheritScopes={false}>
					<Comp_2 />
				</NewContainer>
			</>
		);
	}

	function Comp_2() {
		const dep = useResolve(deps[4]);

		return <span>{dep.value.description}</span>;
	}

	render(<Comp_1 />);

	expect(screen.getByText('4')).toBeInTheDocument();
});

test('(Legacy) NewContainer, when rendered with useInheritanceLink -> false, should create a new instances for scoped dependencies', () => {
	const deps = setupScopedResolution();

	function Comp_1() {
		const dep = useResolve(deps[4]);

		dep.value = Symbol('mutated from comp 1');

		return (
			<>
				<span>{dep.value.description}</span>

				<NewContainer useInheritanceLink={false}>
					<Comp_2 />
				</NewContainer>
			</>
		);
	}

	function Comp_2() {
		const dep = useResolve(deps[4]);

		return <span>{dep.value.description}</span>;
	}

	render(<Comp_1 />);

	expect(screen.getByText('4')).toBeInTheDocument();
});

test('NewContainer, when rendered, should inherit scoped instances from parent', () => {
	const deps = setupScopedResolution();

	function Comp_1() {
		const dep = useResolve(deps[4]);

		dep.value = Symbol('mutated from comp 1');

		return (
			<>
				<span>{dep.value.description}</span>

				<NewContainer>
					<Comp_2 />
				</NewContainer>
			</>
		);
	}

	function Comp_2() {
		const dep = useResolve(deps[4]);

		return <span>{dep.value.description}</span>;
	}

	render(<Comp_1 />);

	expect(screen.getAllByText('mutated from comp 1')).toHaveLength(2);
});

test('NewContainer, when rendered, should be able to derive same singleton instances between resolutions', () => {
	const deps = setupSingletonResolution();

	function Comp_1() {
		const dep = useResolve(deps[4]);

		dep.value = Symbol('mutated from comp 1');

		return (
			<>
				<span>{dep.value.description}</span>

				<NewContainer>
					<Comp_2 />
				</NewContainer>
			</>
		);
	}

	function Comp_2() {
		const dep = useResolve(deps[4]);

		return <span>{dep.value.description}</span>;
	}

	render(<Comp_1 />);

	expect(screen.getAllByText('mutated from comp 1').length).toBe(2);
});

test('experience for new library user, when copying example from the readme, should work without error', async () => {
	@Injectable()
	class FooService {
		greet(msg: string) {
			return `hello ${msg}!`;
		}
	}

	function App() {
		const fooService = useResolve(FooService);
		const [msg, setMsg] = useState<string | null>(null);

		return (
			<>
				<span>{msg}</span>
				<button
					onClick={() => {
						setMsg(fooService.greet('there'));
					}}
				>
					click me
				</button>
			</>
		);
	}

	render(<App />);

	await userEvent.click(screen.getByText('click me'));

	expect(screen.getByText('hello there!')).toBeInTheDocument();
});

test('useResolveLifecycle, when used in a React component, should invoke expected lifecycle methods', () => {
	const whenMount = vi.fn<[_arg_one: string]>();
	const whenUpdate = vi.fn<[_arg_one: string]>();
	const whenDemount = vi.fn<[_arg_one: string]>();
	const whenRepeatedlyMount = vi.fn<[_arg_one: string]>();

	@Injectable()
	class C implements Lifecycle {
		whenRepeatedlyMount = whenRepeatedlyMount;
		whenMount = whenMount;
		whenUpdate = whenUpdate;
		whenDemount = whenDemount;
	}

	function Comp(props: PropsWithChildren<{ arg_one?: string }>) {
		useResolveLifecycle(C, props.arg_one ?? 'A');

		return <>{props.children}</>;
	}

	const Parent = Comp;
	const Child = Comp;

	const result = render(
		<Parent>
			<Child />
		</Parent>,
	);
	result.rerender(
		<Parent arg_one='B'>
			<Child arg_one='C' />
		</Parent>,
	);
	result.rerender(
		<Parent arg_one='D'>
			<Child arg_one='E' />
		</Parent>,
	);
	result.unmount();

	expect(whenMount).toHaveBeenCalledOnce();
	expect(whenMount).toHaveBeenCalledWith('A');

	expect(whenRepeatedlyMount).toHaveBeenCalledOnce();

	expect(whenUpdate).toHaveBeenCalledTimes(4);
	expect(whenUpdate).toHaveBeenNthCalledWith(1, 'C');
	expect(whenUpdate).toHaveBeenNthCalledWith(2, 'B');
	expect(whenUpdate).toHaveBeenNthCalledWith(3, 'E');
	expect(whenUpdate).toHaveBeenNthCalledWith(4, 'D');

	expect(whenDemount).toHaveBeenCalledTimes(2);
	expect(whenDemount).toHaveBeenNthCalledWith(1, 'D');
	expect(whenDemount).toHaveBeenNthCalledWith(2, 'E');
});

test('NewContainer, when passed a Container, should inherit instances from it', () => {
	const testBed = createTestBed();

	class A {
		value = 'abc';
	}
	testBed.mockRegister(A, A, Scopes.Transient);

	function Comp() {
		const dep = useResolve(A);

		return <span>{dep.value}</span>;
	}

	render(
		<NewContainer inheritFrom={testBed.container}>
			<Comp />
		</NewContainer>,
	);

	expect(screen.getByText('abc')).toBeInTheDocument();
});

test('(legacy) NewContainer, when passed a Resolution, should inherit instances from it', () => {
	const testBed = createTestBed();

	class A {
		value = 'abc';
	}
	testBed.mockRegister(A, A, Scopes.Transient);

	function Comp() {
		const dep = useResolve(A);

		return <span>{dep.value}</span>;
	}

	render(
		<NewContainer parentContainer={testBed.resolution}>
			<Comp />
		</NewContainer>,
	);

	expect(screen.getByText('abc')).toBeInTheDocument();
});

test("NewContainer, when nestled, should be able to derive instance wherever it's resolved", () => {
	@Injectable()
	class I {}
	Injectable.naughtyReflection(I, []);

	let i1: I | symbol = Symbol();
	let i2: I | symbol = Symbol();
	let i3: I | symbol = Symbol();

	function Comp1({ children }: PropsWithChildren) {
		const d = useResolve(I);

		i1 = d;

		return <NewContainer>{children}</NewContainer>;
	}

	function Comp2({ children }: PropsWithChildren) {
		const d = useResolve(I);

		i2 = d;

		return <NewContainer>{children}</NewContainer>;
	}

	function Comp3({ children }: PropsWithChildren) {
		const d = useResolve(I);

		i3 = d;

		return <NewContainer>{children}</NewContainer>;
	}

	render(
		<Comp1>
			<Comp2>
				<Comp3 />
			</Comp2>
		</Comp1>,
	);

	expect(i1).toBe(i2);
	expect(i2).toBe(i3);
	expect(i3).toBe(i1);
	expect(i3).toBe(i2);
});
