import { expect, test } from 'vitest';
import { Graph } from './_graph';

interface Data {
	id: symbol;
}

test('asserts that an edge can be added', () => {
	const graph = new Graph<Data>((x) => x.id);

	graph.lookupOrInsertNode({
		id: Symbol(),
	});

	expect(graph.edges().length).toEqual(1);
});

test('asserts that an edge can be removed', () => {
	const graph = new Graph<Data>((x) => x.id);
	const id = Symbol();

	graph.lookupOrInsertNode({
		id,
	});
	graph.removeNode(id);

	expect(graph.edges().length).toEqual(0);
});

test('asserts that insertEdge is inserting incoming / outgoing', () => {
	const graph = new Graph<Data>((x) => x.id);
	const id = Symbol();
	const id1 = Symbol();
	const id2 = Symbol();

	graph.insertEdge(
		{
			id,
		},
		{
			id: id1,
		},
	);

	graph.insertEdge(
		{
			id: id1,
		},
		{
			id: id2,
		},
	);

	let iteration = 0;
	while (!graph.isEmpty()) {
		iteration++;
		const edges = graph.edges();

		for (const { data } of edges) {
			graph.removeNode(data.id);
		}
	}

	expect(iteration).toEqual(3);
});

test('asserts that a node can be looked up in a deep tree', () => {
	const graph = new Graph<Data>((x) => x.id);
	const id = Symbol();
	const id1 = Symbol();
	const id2 = Symbol();

	graph.insertEdge(
		{
			id,
		},
		{
			id: id1,
		},
	);

	graph.insertEdge(
		{
			id: id1,
		},
		{
			id: id2,
		},
	);

	const lookedUp = graph.lookup(id2);
	expect(lookedUp?.incoming.get(id1)).toBeTruthy();
	expect(lookedUp?.outgoing.size).toBe(0);
});
