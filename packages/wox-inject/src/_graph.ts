class Node<T, K> {
	public readonly incoming = new Map<K, Node<T, K>>();
	public readonly outgoing = new Map<K, Node<T, K>>();

	constructor(public readonly data: T) {
		// Empty
	}
}

export class Graph<T, K = unknown> {
	private readonly nodes = new Map<K, Node<T, K>>();

	constructor(private readonly lookupFn: (dependency: T) => K) {
		// Empty
	}

	public insertEdge(from: T, to: T): void {
		const fromNode = this.lookupOrInsertNode(from);
		const toNode = this.lookupOrInsertNode(to);

		fromNode.outgoing.set(this.lookupFn(to), toNode);
		toNode.incoming.set(this.lookupFn(from), fromNode);
	}

	public lookup(key: K): Node<T, K> | null {
		return this.nodes.get(key) ?? null;
	}

	public lookupOrInsertNode(data: T): Node<T, K> {
		const key = this.lookupFn(data);
		let node = this.nodes.get(key);

		if (!node) {
			node = new Node(data);
			this.nodes.set(key, node);
		}

		return node;
	}

	public removeNode(key: K): void {
		this.nodes.delete(key);

		for (const node of this.nodes.values()) {
			node.outgoing.delete(key);
			node.incoming.delete(key);
		}
	}

	public edges(): Node<T, K>[] {
		const nodes: Node<T, K>[] = [];
		for (const node of this.nodes.values()) {
			if (node.outgoing.size === 0) {
				nodes.push(node);
			}
		}

		return nodes;
	}

	public isEmpty(): boolean {
		return this.nodes.size === 0;
	}
}
