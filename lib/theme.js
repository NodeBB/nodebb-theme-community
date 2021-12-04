'use strict';

const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const Theme = module.exports;

Theme.renderHeader = async (data) => {
	const { templateValues, req } = data;

	try {
		const body = await (await fetch('https://nodebb.org')).text();
		const dom = new JSDOM(body);

		// Remove "Sign in" and "Start Free Trial"
		const buttons = dom.window.document.querySelectorAll('.elementor-widget-button');
		for(let x=0;x<2;x++) {
			buttons[x].remove();
		}

		// Fix contact button href
		const contactEls = dom.window.document.querySelectorAll('[href="/contact/"]');
		contactEls.forEach((el) => {
			el.href = 'https://nodebb.org/contact';
		});

		const elementorFrontendCSS = dom.window.document.querySelector('#elementor-frontend-css').outerHTML;
		const elementorProCSS = dom.window.document.querySelector('#elementor-pro-css').outerHTML;
		const inlineCSS = dom.window.document.querySelector('#elementor-frontend-inline-css').outerHTML;
		const html = dom.window.document.querySelector(".elementor-location-header").outerHTML;

		templateValues.globalNav = `${elementorFrontendCSS}\n${elementorProCSS}\n${inlineCSS}\n${html}`;
	} catch (e) {
		// ...
	}

	return data;
}

Theme.defineWidgetAreas = async function (areas) {
	areas = areas.concat([
		{
			name: 'MOTD',
			template: 'home.tpl',
			location: 'motd',
		},
		{
			name: 'Homepage Footer',
			template: 'home.tpl',
			location: 'footer',
		},
		{
			name: 'Category Sidebar',
			template: 'category.tpl',
			location: 'sidebar',
		},
		{
			name: 'Topic Footer',
			template: 'topic.tpl',
			location: 'footer',
		},
	]);
	return areas;
};
