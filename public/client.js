'use strict';

require(['hooks'], (hooks) => {
	hooks.on('action:app.load', () => {
		try {
			const mobileToggleEl = document.querySelector('.elementor-element-940fadf .elementor-menu-toggle');
			const dropdownEl = mobileToggleEl.parentNode.querySelector('.elementor-nav-menu--dropdown');
			const dropdownRect = dropdownEl.getBoundingClientRect();
			mobileToggleEl.addEventListener('click', function () {
				this.classList.toggle('elementor-active');
				dropdownEl.style.left = `-${dropdownRect.x}px`;
				dropdownEl.style.top = `${dropdownRect.y + 10}px`;
				dropdownEl.style.width = '100vw';
			});

			// Remap main logo to go to `/`
			const logoEl = document.querySelector('[data-id="0c93321"] a');
			if (logoEl) {
				logoEl.href = config.relative_path + '/';
			}
		} catch (e) {
			console.log('[theme/community] Unable to find mobile menu toggle/dropdown');
		}
	})
});