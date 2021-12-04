'use strict';

const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const Theme = module.exports;

Theme._cache = {};

Theme.renderHeader = async (data) => {
	const { templateValues } = data;

	const dom = await getDOM();
	if (dom) {
		const elementorFrontendCSS = dom.window.document.querySelector('#elementor-frontend-css').outerHTML;
		const elementorProCSS = dom.window.document.querySelector('#elementor-pro-css').outerHTML;
		const inlineCSS = dom.window.document.querySelector('#elementor-frontend-inline-css').outerHTML;
		const html = dom.window.document.querySelector(".elementor-location-header").outerHTML;

		templateValues.globalNav = `${elementorFrontendCSS}\n${elementorProCSS}\n${inlineCSS}\n${html}`;
	}

	return data;
}

Theme.renderFooter = async (data) => {
	const { templateValues } = data;

	const dom = await getDOM();
	if (dom) {
		const footerEl = dom.window.document.querySelector('.elementor-location-footer').outerHTML;
		templateValues.globalFooter = footerEl;
	}

	return data;
}

async function getDOM() {
	if (Theme._cache.DOM) {
		console.log('cache hit');
		return Theme._cache.DOM;
	}

	console.log('cache miss');
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

		// Make active page the "Community" link
		dom.window.document.querySelector('.menu-item-46 a').classList.remove('elementor-item-active');
		dom.window.document.querySelector('.menu-item-975 a').classList.add('elementor-item-active');

		Theme._cache.DOM = dom;
		return dom;
	} catch (e) {
		return null;
	}
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
