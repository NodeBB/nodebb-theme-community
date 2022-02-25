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
		return Theme._cache.DOM;
	}

	try {
		let body = await (await fetch('https://nodebb.org')).text();

		// Fix relative paths in CSS
		body = body.replace(/url\('\/wp-content\//g, 'url(//nodebb.org/wp-content/');

		const virtualConsole = new jsdom.VirtualConsole();
		const dom = new JSDOM(body, { virtualConsole });

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
	const locations = ['header', 'sidebar', 'footer'];
	const templates = [
		'categories.tpl', 'category.tpl', 'topic.tpl', 'users.tpl',
		'unread.tpl', 'recent.tpl', 'popular.tpl', 'top.tpl', 'tags.tpl', 'tag.tpl',
		'login.tpl', 'register.tpl',
	];
	function capitalizeFirst(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
	templates.forEach((template) => {
		locations.forEach((location) => {
			areas.push({
				name: `${capitalizeFirst(template.split('.')[0])} ${capitalizeFirst(location)}`,
				template: template,
				location: location,
			});
		});
	});

	areas = areas.concat([
		{
			name: 'Account Header',
			template: 'account/profile.tpl',
			location: 'header',
		},
	]);
	return areas;
};
