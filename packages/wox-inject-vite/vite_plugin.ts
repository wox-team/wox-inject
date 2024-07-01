import type { PluginOption } from 'vite';
import oxc from 'oxc-parser';

const fileRegex = /\.(tsx|ts)$/;

export function transform(src: string): string {
	const result = oxc.parseSync(src, {
		// Since we're already passing the source code, we just need to let oxc know the filename.
		// So it can derive typescript parsing instead of defaulting to JS.
		sourceFilename: '_.tsx',
	});

	if (result.errors.length > 0) {
		console.error(result.errors);

		return src;
	}

	const ast = JSON.parse(result.program) as any;

	interface BruteForcedReflection {
		name: string;
		ctrTypeParams: string[];
	}

	const ctrInjectedSymbols: BruteForcedReflection[] = [];

	const classes = findClassDeclarations(ast.body);
	for (const cls of classes) {
		const ctrInjectedSymbol: BruteForcedReflection = {
			name: cls.id.name,
			ctrTypeParams: [],
		};

		const ctr = cls.body.body.find((x: any) => x.type === 'MethodDefinition' && x.kind === 'constructor');
		ctr?.value?.params?.items.forEach((x: any) => {
			ctrInjectedSymbol.ctrTypeParams.push(x.pattern.typeAnnotation.typeAnnotation.typeName.name);
		});

		ctrInjectedSymbols.push(ctrInjectedSymbol);
	}

	let srcAddition = '';
	if (ctrInjectedSymbols.length > 0) {
		for (const symbol of ctrInjectedSymbols) {
			srcAddition += `Injectable.naughtyReflection(${symbol.name}, [${symbol.ctrTypeParams.map((x) => x).join(', ')}]);\n`;
		}
	}

	const mutatedSrc = hackyAFVisitorTransform(ast.body, src, ctrInjectedSymbols.length > 0);

	return (mutatedSrc ?? src) + srcAddition;
}

interface VistorData {
	node: any;
	transform: (node: any, state: any) => void;
}

// Okey... Hear me out...
function hackyAFVisitorTransform(
	nodes: any[],
	src: string,
	hasInjectSymbols: boolean /* This lil guy is not good but eyy works */,
): string | null {
	let importDeclaration = null;
	let visitors: any[] = [];

	for (const node of nodes) {
		if (node.type === 'ImportDeclaration') {
			if (node.source.value === '@wox-team/wox-inject') {
				if (importDeclaration == null) importDeclaration = node;
			}
		}

		const result = findRelevantFunction(node);
		if (result != null) visitors.push(result);

		if (node.type === 'ExportNamedDeclaration') {
			const result = findRelevantFunction(node.declaration);
			if (result != null) visitors.push(result);
		}
	}

	if (importDeclaration == null) {
		visitors.unshift(
			new HackyVisitor({
				node: null,
				transform: (n: any, state: any) => {
					let change = '';
					const hasFunctionDeclaration = visitors.find((x) => x?.node?.type === 'FunctionDeclaration');
					if (hasFunctionDeclaration) {
						change = `import { ${[hasInjectSymbols ? 'Injectable' : null, 'withNewContainer']
							.filter(Boolean)
							.join(', ')} } from '@wox-team/wox-inject';\n`;
					} else if (hasInjectSymbols) {
						change = `import { Injectable } from '@wox-team/wox-inject';\n`;
					}

					state.i += change.length;
					state.src = change + state.src;
				},
			}),
		);
	} else if (visitors.find((x) => x?.node?.type === 'FunctionDeclaration')) {
		visitors.unshift(
			new HackyVisitor({
				node: importDeclaration,
				transform: (n: any, state: any) => {
					const lastSpecifier = n.specifiers[n.specifiers.length - 1];

					const endIndex = lastSpecifier.end + state.i;

					const before = state.src.slice(0, endIndex);
					const change = ', withNewContainer';
					const end = state.src.slice(endIndex);

					state.i += change.length;
					state.src = before + change + end;
				},
			}),
		);
	}

	const state = {
		i: 0,
		src: src,
	};
	for (const visitor of visitors) {
		visitor.visit(state);
	}

	return state.src;
}

export function dependencyInjection(): PluginOption {
	return {
		name: 'vite:dependency-injection',
		enforce: 'pre',
		transform(src, fileName) {
			// Skip if file extension is not matching.
			if (!fileRegex.test(fileName)) return;

			return {
				code: transform(src),
				map: null,
			};
		},
	};
}

function findWoxImport(nodes: any[]) {
	for (const node of nodes) {
		if (node.type === 'ImportDeclaration') {
			if (node.source.value === '@wox-team/wox-inject') {
				return node;
			}
		}
	}

	return null;
}

function findClassDeclarations(nodes: any[]): any[] {
	const result: any[] = [];

	for (const node of nodes) {
		let clsNode: any = node;

		if (node.type === 'ExportNamedDeclaration') {
			clsNode = node.declaration;
		}

		if (node.type === 'ExportDefaultDeclaration') {
			clsNode = node.declaration;
		}

		if (clsNode?.type === 'ClassDeclaration') {
			if (clsNode.decorators == null) {
				continue;
			}

			const decorator = clsNode.decorators[0];
			if (decorator?.expression.callee.name !== 'Injectable') {
				continue;
			}

			result.push(clsNode);
		}
	}

	return result;
}

function findRelevantFunction(node: any): HackyVisitor | null {
	if (node?.type === 'FunctionDeclaration') {
		const hasDirective = node.body.directives.some((x: any) => x.directive === 'use container');
		if (hasDirective) {
			return new HackyVisitor({
				node,
				transform: (n: any, state: any) => {
					const name = n.id.name;

					const startIndex = n.start + state.i;
					const endIndex = n.end + state.i;

					const before = state.src.slice(0, startIndex);
					const change1 = `const ${name} = withNewContainer(`;
					const start = state.src.slice(startIndex, endIndex);
					const change2 = ');';
					const end = state.src.slice(endIndex);

					state.i += change1.length + change2.length;
					state.src = before + change1 + start + change2 + end;
				},
			});
		}
	}

	return null;
}

class HackyVisitor {
	public node: any;
	private transform: (node: any, state: any) => void;

	constructor(something: VistorData) {
		this.node = something.node;
		this.transform = something.transform;
	}

	visit(state: any) {
		return this.transform(this.node, state);
	}
}
