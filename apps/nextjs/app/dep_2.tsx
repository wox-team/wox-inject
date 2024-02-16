import { Injectable } from '@wox-team/wox-inject';

@Injectable()
export class Dep2 {
	count = 0;

	increment() {
		this.count++;

		queueMicrotask(() => {
			console.log('Dep count:', this.count);
		});
	}

	decrement() {
		this.count--;
	}
}
// This should be added through a plugin.
Injectable.naughtyReflection(Dep2, []);
