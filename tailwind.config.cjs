/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{html,jsx,tsx}"],
	theme: {
		extend: {
			boxShadow: {
				"indent": "2px -2px 20px -2px rgba(0,0,0,0.5) inset"
			}
		}
	},
	plugins: [],
};

