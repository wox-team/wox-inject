import { useRef } from 'react';

/**
 * Represents a factory function that creates a value of type T.
 *
 * @template T - The type of the value created by the factory function.
 */
type FactoryFn<T> = () => T;

/**
 * Custom React hook that returns a constant value.
 * The value is created using the provided factory function and
 * remains the same across re-renders of the component.
 *
 * @template T - The type of the value created by the factory function.
 * @param {FactoryFn<T>} factory - The factory function that creates the value.
 * @returns {T} - The constant value.
 */
export function useConstant<T>(factory: FactoryFn<T>) {
	/**
	 * Reference to store the created value.
	 * The value persists across re-renders of the component.
	 *
	 * @type {React.MutableRefObject<T | undefined>}
	 */
	const historyRef = useRef<T>();

	// Check if the current value of `historyRef` is `null` or `undefined`.
	// If it is, it means that the factory function hasn't been called yet.
	if (historyRef.current == null) {
		// Call the factory function to create the value of type T.
		// Store the created value in the `current` property of `historyRef`.
		historyRef.current = factory();
	}

	// Return the value stored in the `current` property of `historyRef`.
	// The value will persist across re-renders of the component using this hook.
	return historyRef.current;
}
