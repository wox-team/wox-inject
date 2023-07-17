class NotImplementedError extends Error {
	constructor(featureName?: string) {
		const message = featureName ? `Feature "${featureName}" is not implemented.` : 'Not implemented.';
		super(message);
		this.name = 'NotImplementedError';
	}
}

/**
 * Throws a custom error indicating that the feature is not implemented yet.
 *
 * @param featureName The name of the feature that is not implemented. (Optional)
 * @throws {NotImplementedError} Throws a NotImplementedError with the feature name in the error message.
 */
export function todo(featureName?: string): never {
	const err = new NotImplementedError(featureName);

	// We want to know where it error occurred, and not inside this function.
	Error.captureStackTrace?.(err, todo);

	throw err;
}
