class Signal {
	constructor(private value: any) {
		// Empty
	}

	public get() {
		return this.value;
	}
}

export function signal(value: any) {
	return new Signal(value);
}
