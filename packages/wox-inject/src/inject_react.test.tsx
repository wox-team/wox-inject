import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ControllerProtocol, ResolutionProvider, useController, useDependency } from './inject_react';
import { Injectable, clearRegistry, ServiceLifetimes } from './inject';
import { setupScopedResolution, setupSingletonResolution } from '../tests/setup_dependencies';
import { useState } from 'react';
import { createTestBed } from './testing';

beforeEach(() => {
	clearRegistry();
});

test('useDependency, when used in a React component, should return expected class instance', () => {
	const deps = setupScopedResolution();

	function Comp() {
		const dep = useDependency(deps[4]);

		return <span>{dep.value.description}</span>;
	}

	render(<Comp />);

	expect(screen.getByText('4')).toBeInTheDocument();
});

test('ResolutionProvider, when rendered, should create a new resolution for intermediate children', () => {
	const deps = setupScopedResolution();

	function Comp_1() {
		const dep = useDependency(deps[4]);

		dep.value = Symbol('mutated from comp 1');

		return (
			<>
				<span>{dep.value.description}</span>

				<ResolutionProvider>
					<Comp_2 />
				</ResolutionProvider>
			</>
		);
	}

	function Comp_2() {
		const dep = useDependency(deps[4]);

		return <span>{dep.value.description}</span>;
	}

	render(<Comp_1 />);

	expect(screen.getByText('4')).toBeInTheDocument();
});

test('ResolutionProvider, when rendered, should be able to derive same singleton instances between resolutions', () => {
	const deps = setupSingletonResolution();

	function Comp_1() {
		const dep = useDependency(deps[4]);

		dep.value = Symbol('mutated from comp 1');

		return (
			<>
				<span>{dep.value.description}</span>

				<ResolutionProvider>
					<Comp_2 />
				</ResolutionProvider>
			</>
		);
	}

	function Comp_2() {
		const dep = useDependency(deps[4]);

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
		const fooService = useDependency(FooService);
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

test('useController, when used in a React component, should return expected class instance', () => {
	const whenMount = vi.fn<[_arg_one: string]>();
	const whenUpdate = vi.fn<[_arg_one: string]>();
	const whenDemount = vi.fn<[_arg_one: string]>();

	@Injectable()
	class C implements ControllerProtocol {
		whenMount = whenMount;
		whenUpdate = whenUpdate;
		whenDemount = whenDemount;
	}

	function Comp({ arg_one }: { arg_one?: string }) {
		useController(C, arg_one ?? 'A');

		return null;
	}

	const result = render(<Comp />);
	result.rerender(<Comp arg_one='B' />);
	result.rerender(<Comp arg_one='C' />);
	result.unmount();

	expect(whenMount).toHaveBeenCalledOnce();
	expect(whenMount).toHaveBeenCalledWith('A');
	expect(whenUpdate).toHaveBeenCalledTimes(2);
	expect(whenUpdate).toHaveBeenNthCalledWith(1, 'B');
	expect(whenUpdate).toHaveBeenNthCalledWith(2, 'C');
	expect(whenDemount).toHaveBeenCalledOnce();
	expect(whenDemount).toHaveBeenCalledWith('C');
});

test('ResolutionProvider, when passed a parent InjectContainer, should be able to derive instances from it', () => {
	const testBed = createTestBed();

	class A {
		value = 'abc';
	}
	testBed.mockRegister(A, A, ServiceLifetimes.Transient);

	function Comp(): JSX.Element {
		const dep = useDependency(A);

		return <span>{dep.value}</span>;
	}

	render(
		<ResolutionProvider parentContainer={testBed.injectionContainer}>
			<Comp />
		</ResolutionProvider>,
	);

	expect(screen.getByText('abc')).toBeInTheDocument();
});
