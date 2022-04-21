import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import path from 'path';

const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		postcss: true
	}),

	kit: {
		adapter: adapter(),

		// Override http methods in the Todo forms
		methodOverride: {
			allowed: ['PATCH', 'DELETE']
		},
		vite: {
			resolve: {
				alias: {
          // these are the aliases and paths to them
					'$lib': path.resolve('./src/lib'),
					'$components': path.resolve('./src/lib/components'),
					'$stores': path.resolve('./src/stores'),
					'$types': path.resolve('./src/types')
				}
			}
		}
	}
};

export default config;
