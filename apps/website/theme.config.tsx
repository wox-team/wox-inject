import React from 'react';
import { DocsThemeConfig, useConfig } from 'nextra-theme-docs';
import { useRouter } from 'next/router';

const config: DocsThemeConfig = {
	logo: <span>wox</span>,
	useNextSeoProps() {
		const { asPath } = useRouter();
		if (asPath !== '/') {
			return {
				titleTemplate: '%s - wox',
			};
		}
	},
	head: function useHead() {
		const { title } = useConfig();
		const { route } = useRouter();
		const socialCard = route === '/' || !title ? 'https://wox.so/og.jpeg' : `https://wox.so/api/og?title=${title}`;

		return (
			<>
				<meta name='msapplication-TileColor' content='#fff' />
				<meta name='theme-color' content='#fff' />
				<meta name='viewport' content='width=device-width, initial-scale=1.0' />
				<meta httpEquiv='Content-Language' content='en' />
				<meta name='description' content='React Dependency Injection Containers Library' />
				<meta name='og:description' content='React Dependency Injection Containers Library' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:image' content={socialCard} />
				<meta name='twitter:site:domain' content='wox.so' />
				<meta name='twitter:url' content='https://wox.so' />
				<meta name='og:title' content={title ? title + ' – wox' : 'wox'} />
				<meta name='og:image' content={socialCard} />
				<meta name='apple-mobile-web-app-title' content='wox' />
				<link rel='icon' href='/favicon.svg' type='image/svg+xml' />
				<link rel='icon' href='/favicon.png' type='image/png' />
				<link rel='icon' href='/favicon-dark.svg' type='image/svg+xml' media='(prefers-color-scheme: dark)' />
				<link rel='icon' href='/favicon-dark.png' type='image/png' media='(prefers-color-scheme: dark)' />
			</>
		);
	},
	editLink: {
		text: 'Edit this page on GitHub →',
	},
	project: {
		link: 'https://github.com/wox-team/wox-inject',
	},
	docsRepositoryBase: 'https://github.com/wox-team/wox-inject',
	footer: {
		text: 'Built with Nextra Docs Template',
	},
};

export default config;
