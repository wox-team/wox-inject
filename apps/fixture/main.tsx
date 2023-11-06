import { Injectable, useDependency } from '@wox-team/wox-inject';
import { createRoot } from 'react-dom/client';

@Injectable()
class FooService {
	greet(msg: string) {
		console.log(`hello ${msg}!`);
	}
}
Injectable.naughtyReflection(FooService, []);

function App() {
	const fooService = useDependency(FooService);

	return (
		<button
			onClick={() => {
				fooService.greet('there!');
			}}
		>
			click me
		</button>
	);
}

const rootElement = document.getElementById('root') as HTMLElement;
const root = createRoot(rootElement);
root.render(<App />);
