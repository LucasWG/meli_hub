(function () {
	'use strict';

	if (window.MeliToolsStealthInit) return;
	window.MeliToolsStealthInit = true;

	const Stealth = {
		isActive: false,

		init: function () {
			this.isActive = localStorage.getItem('mt_stealth_mode') === 'true';
			if (this.isActive) document.body.classList.add('mt-stealth-active');

			document.addEventListener('keydown', e => {
				if (e.altKey && e.key.toLowerCase() === 'f') {
					e.preventDefault();
					this.toggle();
				}
			});
		},

		toggle: function () {
			this.isActive = !this.isActive;
			localStorage.setItem('mt_stealth_mode', this.isActive);

			if (this.isActive) {
				document.body.classList.add('mt-stealth-active');
				this.showTempToast('Modo Furtivo: ATIVADO', '#10b981');
			} else {
				document.body.classList.remove('mt-stealth-active');
				this.showTempToast('Modo Furtivo: DESATIVADO', '#6b7280');
			}
		},

		showTempToast: function (msg, color) {
			const toast = document.createElement('div');
			Object.assign(toast.style, {
				position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
				background: '#111827', color: color, padding: '10px 20px', borderRadius: '20px',
				fontFamily: 'sans-serif', fontSize: '13px', fontWeight: '600', zIndex: '9999999',
				boxShadow: '0 4px 12px rgba(0,0,0,0.15)', opacity: '0', transition: '0.3s'
			});
			toast.textContent = msg;
			document.body.appendChild(toast);

			requestAnimationFrame(() => toast.style.opacity = '1');
			setTimeout(() => {
				toast.style.opacity = '0';
				setTimeout(() => toast.remove(), 300);
			}, 2000);
		}
	};

	Stealth.init();

})();
