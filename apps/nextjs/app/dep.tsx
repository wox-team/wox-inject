import { Injectable } from '@wox-team/wox-inject';
import { Dep2 } from './dep_2';

@Injectable()
export class Dep {
	constructor(public dep2: Dep2) {}
}
// This should be added through a plugin.
Injectable.naughtyReflection(Dep, [Dep2]);
