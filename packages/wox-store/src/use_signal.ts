import { useSyncExternalStore } from 'react';
import { Signal } from './signal';

export function useSignal<T>(signal: Signal<T>): T {
	return useSyncExternalStore(signal.sub, signal);
}
