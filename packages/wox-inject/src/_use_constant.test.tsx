import { expect, test } from 'vitest';
import { useConstant } from './_use_constant';
import { render, screen } from '@testing-library/react';

test('useConst hook, when called multiple times, should retrieve the same value', () => {
	let i = 0;
	function ConstComponent() {
		const value = useConstant(() => ++i);

		return <>{value}</>;
	}

	const { rerender } = render(<ConstComponent />);
	rerender(<ConstComponent />);
	rerender(<ConstComponent />);

	expect(screen.getByText(/1/i)).toBeInTheDocument();
});

test('useConst hook, when unmounted and remounted, should retrieve an updated value', () => {
	let i = 0;
	function ConstComponent() {
		const value = useConstant(() => ++i);

		return <>{value}</>;
	}

	const { rerender } = render(<ConstComponent key={1} />);
	rerender(<ConstComponent key={2} />);
	rerender(<ConstComponent key={3} />);

	expect(screen.getByText(/3/i)).toBeInTheDocument();
});
