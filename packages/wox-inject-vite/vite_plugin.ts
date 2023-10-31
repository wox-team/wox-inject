import type { Plugin, PluginOption } from 'vite';

enum StateMode {
	NONE,
	READ_UNTIL_END,
}

enum OccurrenceActionResult {
	PEEK_NEXT,
	READ_NEXT,
	CREATE_SAVE_POINT,
	FLIP_DIRECTION,
	GO_TO_NEXT_OCCURRENCE,
}

class OccurrenceState {
	public static extract_READ = ['READ', Symbol('read')] as const;
	public static extract_READ_END = ['READ_END', Symbol('read end')] as const;
	private counter = 0;
	private lookFor: (string | symbol)[];
	private mode = StateMode.NONE;

	constructor(pattern: string) {
		const extractReadStartIndex = pattern.indexOf(OccurrenceState.extract_READ[0]);
		if (extractReadStartIndex !== -1) {
			pattern = pattern.replace(OccurrenceState.extract_READ[0], ' ');
		}

		const extractReadEndStartIndex = pattern.indexOf(OccurrenceState.extract_READ_END[0]);
		if (extractReadEndStartIndex !== -1) {
			pattern = pattern.replace(OccurrenceState.extract_READ_END[0], ' ');
		}

		this.lookFor = pattern.split('');

		if (extractReadStartIndex !== -1) {
			this.lookFor[extractReadStartIndex] = OccurrenceState.extract_READ[1];
		}

		if (extractReadEndStartIndex !== -1) {
			this.lookFor[extractReadEndStartIndex] = OccurrenceState.extract_READ_END[1];
		}
	}

	public nextAction(char: string): OccurrenceActionResult {
		this.check(char);

		if (this.mode === StateMode.READ_UNTIL_END) {
			return OccurrenceActionResult.READ_NEXT;
		}

		if (this.isFullMatch()) {
			return OccurrenceActionResult.GO_TO_NEXT_OCCURRENCE;
		}

		return OccurrenceActionResult.PEEK_NEXT;
	}

	private check(char: string): void {
		const indexed = this.lookFor[this.counter];
		if (indexed === char) {
			this.counter++;
			this.mode = StateMode.NONE;

			return;
		}

		if (this.mode === StateMode.READ_UNTIL_END) {
			return;
		}

		if (indexed === OccurrenceState.extract_READ[1]) {
			this.mode = StateMode.READ_UNTIL_END;
			this.counter++;

			return;
		}

		this.counter = 0;
	}

	public isFullMatch(): boolean {
		if (this.counter + 1 === this.lookFor.length) {
			this.counter = 0;
			this.lookFor = [];

			return true;
		}

		return false;
	}
}

class Haystack {
	private readonly maxLength: number;
	private position = 0;

	constructor(private readonly srcRef: string) {
		this.maxLength = this.srcRef.length;
	}

	public peekChar(): string {
		const char = this.srcRef[this.position];

		return char;
	}

	public index(): number {
		return this.position;
	}

	public goToCharNext(): void {
		this.position += 1;
	}

	public isNotAtBorder(): boolean {
		return this.position !== this.maxLength;
	}

	public retrieveSrc(): Readonly<string> {
		return this.srcRef;
	}
}

class DumbBruteForceSourceCodeTransformer {
	// prettier-ignore
	private readonly LOOK_FOR_AND_ACTION_TABLE = [
		'@Injectable(',
	] as const;

	private readonly haystack: Haystack;

	private readonly depthResults = new Map<number, string>();

	private searchDepth = -1;

	constructor(srcRef: string) {
		this.haystack = new Haystack(srcRef);
	}

	/**
	 * Goes through the entire source file, and in the process snaps up any wanted occurrence.
	 */
	public lex(): string {
		// eslint-disable-next-line no-constant-condition
		// while (true) {
		// 	const nextOccurrences = this.getNextOccurrencesToLookFor();
		// 	if (nextOccurrences == null) break;

		// 	const occurrenceWasFound = this.findOccurrence(nextOccurrences);
		// 	if (occurrenceWasFound) {
		// 		continue;
		// 	}

		// 	break;
		// }

		// if (this.searchDepth < this.LOOK_FOR_AND_ACTION_TABLE.length - 1) {
		// 	return this.haystack.retrieveSrc();
		// }

		class Occurrence {
			state = 0;

			constructor(public readonly find: string) {
				// Empty
			}

			public check(char: string): boolean {
				const indexed = this.find[this.state];
				if (indexed === char) {
					this.state++;

					if (this.state + 1 === this.find.length) {
						console.log('found', this.find);

						return true;
					}

					return false;
				}

				this.state = 0;

				return false;
			}
		}

		class ThingsToFind {
			state = 0;
			things = [new Occurrence('@Injectable'), new Occurrence('class('), new Occurrence(')')] as const;

			public currentOccurrence() {
				return this.things[this.state];
			}

			public check(char: string) {
				if (this.currentOccurrence()?.check(char)) {
					this.state++;
				}
			}
		}

		const thingsChecker = 0;
		const things = [new ThingsToFind()];

		let charsRead = 0;
		while (this.haystack.isNotAtBorder()) {
			const char = this.haystack.peekChar();

			things[thingsChecker].check(char);

			this.haystack.goToCharNext();
			charsRead++;
		}

		console.log(charsRead);

		return this.mutateSrc();
	}

	private findOccurrence(occurrences: OccurrenceState[]): boolean {
		let readData = '';

		while (this.haystack.isNotAtBorder()) {
			const char = this.haystack.peekChar();

			let nextActionToTake = OccurrenceActionResult.PEEK_NEXT;
			for (const occurrence of occurrences) {
				const quest = occurrence.nextAction(char);
				if (quest !== OccurrenceActionResult.PEEK_NEXT) {
					nextActionToTake = quest;
					break;
				}
			}

			switch (nextActionToTake) {
				case OccurrenceActionResult.PEEK_NEXT: {
					this.haystack.goToCharNext();
					break;
				}
				case OccurrenceActionResult.READ_NEXT: {
					readData += this.haystack.peekChar();

					this.haystack.goToCharNext();
					break;
				}
				case OccurrenceActionResult.GO_TO_NEXT_OCCURRENCE: {
					this.depthResults.set(this.searchDepth, readData);

					return true;
				}
				default: {
					return false;
				}
			}
		}

		return false;
	}

	private mutateSrc(): string {
		// function parseSymbols(input: string): string {
		// 	const regex = /:(.*)/g;
		// 	const matches: string[] = [];
		// 	let match;
		// 	while ((match = regex.exec(input)) != null) {
		// 		matches.push(match[1]);
		// 	}

		// 	return matches.map((match) => match.replace(',', '').trim()).join(', ');
		// }

		// const ctorName = this.depthResults.get(1) ?? '';
		// const injectedSymbols = parseSymbols(this.depthResults.get(2) ?? '');

		return this.haystack.retrieveSrc() + '\n// hello!';
	}

	private getNextOccurrencesToLookFor(): OccurrenceState[] | null {
		this.searchDepth++;
		if (this.searchDepth >= this.LOOK_FOR_AND_ACTION_TABLE.length) return null;

		const occurrenceRef = this.LOOK_FOR_AND_ACTION_TABLE[this.searchDepth];
		const occurrences = Array.isArray(occurrenceRef) ? occurrenceRef : [occurrenceRef];

		const occurrenceStates: OccurrenceState[] = [];
		for (const occurrence of occurrences) {
			occurrenceStates.push(new OccurrenceState(occurrence));
		}

		return occurrenceStates;
	}
}

function transform(input: string): string {
	try {
		const result = new DumbBruteForceSourceCodeTransformer(input).lex();

		return result;
	} catch (error: unknown) {
		console.error(error);

		return input;
	}
}

export function dependencyInjection(): PluginOption {
	return {
		name: 'vite:dependency-injection',
		enforce: 'pre',
		transform(src, fileName) {
			console.log('hehe');
			// Skip if file extension is not matching.
			if (!/\.(mjs|[tj]sx?)$/.test(fileName)) return;

			return {
				code: transform(src),
				map: null,
			};
		},
	};
}
