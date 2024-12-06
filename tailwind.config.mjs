/** @type {import('tailwindcss').Config} */

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}', "./node_modules/flowbite/**/*.js"],
	theme: {
		extend: {
			screens: {
				'phone': '400px',
				'tablet': '640px',
				'laptop': '1024px',
				'desktop': '1280px',
			},
		},
	},
	plugins: [
		require('flowbite/plugin')
	]
}