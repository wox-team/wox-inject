import { beforeEach, test } from 'vitest';
import { InjectionContainer, DependencyScope, clearRegistry } from './inject';
import { setupScopedResolution, setupSingletonResolution, setupTransientResolution } from '../tests/setup_dependencies';

beforeEach(() => {
	clearRegistry();
});

test('resolve, when obtaining the required scoped dependencies, should complete the dependency resolution', () => {
	const deps = setupScopedResolution();

	const scope = new DependencyScope();
	const container = new InjectionContainer(scope);
	const dep = container.resolve(deps[2]);

	expect(dep._1.value).toBeTruthy();
});

test('resolve, when obtaining the required singleton dependencies, should complete the dependency resolution', () => {
	const deps = setupSingletonResolution();

	const scope = new DependencyScope();
	const container = new InjectionContainer(scope);
	const dep = container.resolve(deps[2]);

	expect(dep._1.value).toBeTruthy();
});

test.skip('resolve, when obtaining the required transient dependencies, should complete the dependency resolution', () => {
	const deps = setupTransientResolution();

	const scope = new DependencyScope();
	const container = new InjectionContainer(scope);
	const dep = container.resolve(deps[2]);

	expect(dep._1.value).toBeTruthy();
});

test('resolve, when procedural resolutions occurs between different containers, singletons instances should remain the same', () => {
	const deps = setupSingletonResolution();

	const scope_1 = new DependencyScope();
	const container_1 = new InjectionContainer(scope_1);
	const scope_2 = new DependencyScope(scope_1);
	const container_2 = new InjectionContainer(scope_2);

	container_1.resolve(deps[4]);
	container_2.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);
	const _c2_d4 = container_2.resolve(deps[4]);

	expect(_c2_d4._2._1).toBe(_c1_d4._2._1);
});

test('resolve, when procedural resolutions occurs between different containers, scoped instances should be unique per scope', () => {
	const deps = setupScopedResolution();

	const scope_1 = new DependencyScope();
	const container_1 = new InjectionContainer(scope_1);
	const scope_2 = new DependencyScope(scope_1);
	const container_2 = new InjectionContainer(scope_2);

	container_1.resolve(deps[4]);
	container_2.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);
	const _c2_d4 = container_2.resolve(deps[4]);

	expect(_c2_d4._2._1).not.toBe(_c1_d4._2._1);
});

test('resolve, when graphing identical nodes, should keep the same singleton instance until resolution complete', () => {
	const deps = setupSingletonResolution();

	const scope_1 = new DependencyScope();
	const container_1 = new InjectionContainer(scope_1);

	container_1.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);

	expect(_c1_d4._2._1).toBe(_c1_d4._3._1);
});

test('resolve, when graphing identical nodes, should keep the same scoped instance until resolution complete', () => {
	const deps = setupScopedResolution();

	const scope_1 = new DependencyScope();
	const container_1 = new InjectionContainer(scope_1);

	container_1.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);

	expect(_c1_d4._2._1).toBe(_c1_d4._3._1);
});

test.skip('resolve, when graphing identical nodes, should not keep the same transient instance until resolution complete', () => {
	const deps = setupTransientResolution();

	const scope_1 = new DependencyScope();
	const container_1 = new InjectionContainer(scope_1);

	container_1.resolve(deps[4]);

	const _c1_d4 = container_1.resolve(deps[4]);

	expect(_c1_d4._2._1).not.toBe(_c1_d4._3._1);
});
