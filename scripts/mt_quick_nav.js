(function () {
	'use strict';

	if (window.MeliToolsQuickNavInit) return;
	window.MeliToolsQuickNavInit = true;

	const QuickNav = {
		typedId: '',
		timeout: null,
		display: null,

		init: function () {
			this.injectCSS();
			this.createDisplay();
			document.addEventListener('keydown', this.handleKey.bind(this));
			document.addEventListener('paste', this.handlePaste.bind(this));
		},

		injectCSS: function () {
			const style = document.createElement('style');
			style.textContent = `
                #mt-qn-display { position: fixed; top: 80px; right: 24px; z-index: 999999; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); font-family: sans-serif; display: flex; flex-direction: column; gap: 8px; width: 240px; }
                .mt-qn-title { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
                .mt-qn-id { font-size: 22px; font-family: monospace; font-weight: bold; color: #111827; letter-spacing: 2px; }
                .mt-qn-cursor { animation: blink 1s infinite; color: #2563eb; }
                @keyframes blink { 50% { opacity: 0; } }
                .mt-stealth-active #mt-qn-display { display: none !important; }
            `;
			document.head.appendChild(style);
		},

		createDisplay: function () {
			this.display = document.createElement('div');
			this.display.id = 'mt-qn-display';
			this.display.style.display = 'none';
			document.body.appendChild(this.display);
		},

		isInputFocused: function () {
			const el = document.activeElement;
			if (!el) return false;
			return ['input', 'textarea', 'select'].includes(el.tagName.toLowerCase()) || el.isContentEditable;
		},

		handlePaste: function (e) {
			if (this.isInputFocused()) return;
			const text = (e.clipboardData || window.clipboardData)?.getData('text')?.trim();
			if (!text) return;

			const ids = text.match(/\b\d{11}\b/g) || [];
			if (ids.length === 1) {
				e.preventDefault();
				this.display.style.display = 'flex';
				this.display.innerHTML = `<div class="mt-qn-title">Navegação Rápida</div><div class="mt-qn-id">${ids[0]}</div><div style="font-size:12px; color:#10b981; font-weight:600;">Redirecionando... ✓</div>`;
				setTimeout(() => window.location.href = `https://envios.adminml.com/logistics/package-management/package/${ids[0]}`, 300);
			}
		},

		handleKey: function (e) {
			if (this.isInputFocused()) return;

			if (!/^\d$/.test(e.key)) {
				if (e.key === 'Escape') { this.typedId = ''; this.display.style.display = 'none'; }
				return;
			}

			clearTimeout(this.timeout);
			this.typedId += e.key;
			this.display.style.display = 'flex';

			const remaining = 11 - this.typedId.length;
			this.display.innerHTML = `
                <div class="mt-qn-title">Navegação Rápida</div>
                <div class="mt-qn-id">${this.typedId}<span class="mt-qn-cursor">|</span></div>
                <div style="font-size:12px; color:#6b7280;">Aguardando ${remaining} dígito${remaining !== 1 ? 's' : ''}...</div>
            `;

			this.timeout = setTimeout(() => { this.typedId = ''; this.display.style.display = 'none'; }, 4000);

			if (this.typedId.length === 11) {
				const navId = this.typedId;
				this.typedId = '';
				this.display.innerHTML = `<div class="mt-qn-title">Navegação Rápida</div><div class="mt-qn-id">${navId}</div><div style="font-size:12px; color:#10b981; font-weight:600;">Redirecionando... ✓</div>`;
				setTimeout(() => window.location.href = `https://envios.adminml.com/logistics/package-management/package/${navId}`, 200);
			}
		}
	};

	QuickNav.init();

})();
