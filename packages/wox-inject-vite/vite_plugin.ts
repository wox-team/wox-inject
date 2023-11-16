import type { PluginOption } from 'vite';
import oxc from 'oxc-parser';

const fileRegex = /\.(tsx)$/;

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
			console.log(node);
			clsNode = node.declaration;
		}

		if (clsNode.type === 'ClassDeclaration') {
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

	// Exit the file if there is no import from wox-inject
	if (findWoxImport(ast.body) == null) {
		return src;
	}

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

	return src + srcAddition;
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
