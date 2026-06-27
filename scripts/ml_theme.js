(function () {
	// Versão: v1.0.0
	'use strict';

	if (window.MeliThemeInit) return;
	window.MeliThemeInit = true;

	const CSS = `
		/* ========== TIPOGRAFIA E VARIAVEIS ========== */
		:root {
			--ml-yellow: #FFE600;
			--ml-blue: #3483FA;
			--ml-blue-hover: #2968c8;
			--ml-green: #00A650;
			--ml-red: #F23D4F;
			--ml-bg: #EDEDED;
			--ml-white: #FFFFFF;
			--ml-text-main: #333333;
			--ml-text-muted: #666666;
			--ml-text-light: #999999;
			--ml-border: #E6E6E6;
			--ml-font: 'Proxima Nova', -apple-system, 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
			--ml-shadow-sm: 0 1px 2px 0 rgba(0,0,0,.12);
			--ml-shadow-md: 0 4px 8px 0 rgba(0,0,0,.1);
			--ml-shadow-lg: 0 15px 30px 0 rgba(0,0,0,.15);
		}

		/* ========== TOASTS INTELIGENTES ========== */
		#meli-toast-container {
			position: fixed;
			top: 24px;
			left: 50%;
			transform: translateX(-50%);
			z-index: 1000001;
			display: flex;
			flex-direction: column;
			gap: 12px;
			pointer-events: none;
			align-items: center;
		}
		.meli-toast {
			background: var(--ml-white);
			color: var(--ml-text-main);
			border-left: 5px solid var(--ml-blue);
			padding: 16px 24px;
			border-radius: 12px;
			box-shadow: var(--ml-shadow-lg);
			font-family: var(--ml-font);
			font-size: 15px;
			font-weight: 500;
			min-width: 300px;
			max-width: 450px;
			display: flex;
			align-items: center;
			gap: 14px;
			animation: meli-slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
			transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
			pointer-events: auto;
		}
		.meli-toast.success { border-left-color: var(--ml-green); }
		.meli-toast.error   { border-left-color: var(--ml-red); }
		.meli-toast.info    { border-left-color: var(--ml-blue); }
		.meli-toast-icon { font-size: 22px; flex-shrink: 0; }

		.meli-toast.hiding {
			animation: meli-slideOutUp 0.3s ease forwards;
		}

		@keyframes meli-slideDown {
			from { opacity: 0; transform: translateY(-40px) scale(0.9); }
			to { opacity: 1; transform: translateY(0) scale(1); }
		}
		@keyframes meli-slideOutUp {
			from { opacity: 1; transform: translateY(0) scale(1); }
			to { opacity: 0; transform: translateY(-40px) scale(0.9); }
		}

		/* ========== MODAL PROFISSIONAL ========== */
		#meli-hub-modal {
			display: none;
			position: fixed;
			top: 0; left: 0; width: 100%; height: 100%;
			background: rgba(0,0,0,0.6);
			backdrop-filter: blur(4px);
			z-index: 1000000;
			justify-content: center;
			align-items: center;
			animation: meli-fadeIn 0.3s ease;
		}
		#meli-hub-modal.open { display: flex; }
		@keyframes meli-fadeIn { from { opacity: 0; } to { opacity: 1; } }

		.meli-hub-content {
			background: var(--ml-bg);
			border-radius: 12px;
			display: flex;
			flex-direction: column;
			width: 95%;
			max-width: 1100px;
			max-height: 85vh;
			box-shadow: var(--ml-shadow-lg);
			font-family: var(--ml-font);
			color: var(--ml-text-main);
			overflow: hidden;
			transform: translateY(20px);
			animation: meli-slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
		}
		@keyframes meli-slideUp {
			to { transform: translateY(0); }
		}

		/* Modal Header */
		.meli-hub-header {
			background: var(--ml-yellow);
			padding: 20px 28px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			border-bottom: 1px solid rgba(0,0,0,0.05);
		}
		.meli-hub-header h2 {
			margin: 0; font-size: 22px; font-weight: 600;
			display: flex; align-items: center; gap: 10px; color: var(--ml-text-main);
		}
		.meli-hub-version {
			font-size: 13px; background: rgba(0,0,0,0.1); color: var(--ml-text-main);
			padding: 3px 10px; border-radius: 14px; margin-left: 8px; font-weight: 700;
		}
		.meli-hub-version.old-version {
			text-decoration: line-through;
			color: var(--ml-red);
			background: rgba(242, 61, 79, 0.1);
		}
		.meli-hub-version.new-version {
			color: var(--ml-green);
			background: rgba(0, 166, 80, 0.1);
		}
		.close-btn {
			background: rgba(0,0,0,0.05); border: none; color: var(--ml-text-main); font-size: 20px;
			cursor: pointer; transition: all 0.2s; width: 36px; height: 36px; border-radius: 50%;
			display: flex; align-items: center; justify-content: center; font-weight: bold;
		}
		.close-btn:hover { background: rgba(0,0,0,0.15); transform: scale(1.05); }

		/* Modal Body */
		.meli-hub-body {
			padding: 28px;
			overflow-y: auto;
			background: var(--ml-bg);
			scrollbar-width: thin;
			scrollbar-color: #cccccc transparent;
		}
		.meli-hub-body::-webkit-scrollbar { width: 6px; }
		.meli-hub-body::-webkit-scrollbar-thumb { background: #cccccc; border-radius: 4px; }

		.meli-hub-subtitle {
			font-size: 15px; color: var(--ml-text-muted); margin-bottom: 20px; font-weight: 600;
			display: flex; justify-content: space-between; align-items: center;
		}

		/* Plugin List */
		.plugin-list {
			display: flex; flex-direction: column; gap: 16px;
		}
		.plugin-item {
			background: var(--ml-white);
			border: 1px solid var(--ml-border);
			border-radius: 10px;
			padding: 20px;
			display: flex; align-items: stretch; gap: 20px;
			box-shadow: var(--ml-shadow-sm);
			transition: all 0.25s ease;
		}
		.plugin-item.disabled {
			opacity: 0.5;
			pointer-events: none;
			filter: grayscale(100%);
		}
		.plugin-item:hover {
			box-shadow: var(--ml-shadow-md);
			transform: translateY(-2px);
			border-color: rgba(52, 131, 250, 0.3);
		}
		.plugin-icon-container { position: relative; flex-shrink: 0; align-self: flex-start; display: flex; align-items: center; justify-content: center; }
		.plugin-progress-ring {
			position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px;
			border-radius: 50%;
			background: conic-gradient(var(--ml-green) var(--progress, 0%), transparent 0);
			opacity: 0; pointer-events: none; transition: opacity 0.3s;
			-webkit-mask: radial-gradient(closest-side, transparent 80%, black 82%);
			mask: radial-gradient(closest-side, transparent 80%, black 82%);
		}
		.plugin-item.updating .plugin-progress-ring { opacity: 1; }
		.plugin-icon {
			width: 54px; height: 54px; background: rgba(52,131,250,0.1); color: var(--ml-blue);
			border-radius: 50%; display: flex; align-items: center; justify-content: center;
			font-size: 24px; font-weight: bold;
		}
		.plugin-info { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
		.plugin-name {
			font-weight: 700; font-size: 18px; color: var(--ml-text-main);
			display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
		}
		.plugin-desc { font-size: 14px; color: var(--ml-text-muted); line-height: 1.5; margin-bottom: 14px; }

		.plugin-details {
			display: flex; flex-wrap: wrap; gap: 12px 24px; font-size: 13px; color: var(--ml-text-light);
			background: rgba(0,0,0,0.02); padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.04);
		}
		.plugin-details .detail-item { display: flex; align-items: center; gap: 6px; font-weight: 500; }
		.plugin-details .detail-item span { color: var(--ml-text-muted); font-weight: 600; }

		.plugin-action {
			display: flex; align-items: center; justify-content: center;
			padding-left: 20px; border-left: 1px solid var(--ml-border);
		}

		/* Badges de Status */
		.status-badge {
			font-size: 11px; padding: 3px 10px; border-radius: 12px; font-weight: 700; text-transform: uppercase;
			letter-spacing: 0.5px;
		}
		.status-new { background: #E1F0FF; color: var(--ml-blue); }
		.status-updated { background: #E6F7ED; color: var(--ml-green); }
		.status-pending { background: #FFF0E6; color: #E86000; }

		/* Toggle Switch (Meli Style) */
		.toggle-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
		.toggle-switch input { opacity: 0; width: 0; height: 0; }
		.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cccccc; transition: .3s; border-radius: 24px; }
		.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
		input:checked + .slider { background-color: var(--ml-blue); }
		input:checked + .slider:before { transform: translateX(20px); }
		input:focus + .slider { box-shadow: 0 0 1px var(--ml-blue); }

		/* Modal Footer */
		.meli-hub-footer {
			background: var(--ml-white);
			padding: 20px 28px; border-top: 1px solid var(--ml-border);
			display: flex; flex-direction: column; gap: 16px;
		}

		.footer-btns { display: flex; gap: 16px; }
		.footer-btns button {
			flex: 1; padding: 14px; border: none; border-radius: 6px;
			font-family: var(--ml-font); font-weight: 600; font-size: 15px;
			cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
		}
		.footer-btns button.secondary {
			background: rgba(65,137,230,.1); color: var(--ml-blue);
		}
		.footer-btns button.secondary:hover { background: rgba(65,137,230,.2); }

		.footer-btns button.primary { background: var(--ml-blue); color: var(--ml-white); box-shadow: 0 2px 4px rgba(52,131,250,0.4); }
		.footer-btns button.primary:hover { background: var(--ml-blue-hover); box-shadow: 0 4px 8px rgba(52,131,250,0.5); transform: translateY(-1px); }

		.footer-btns button.action { background: var(--ml-green); color: var(--ml-white); box-shadow: 0 2px 4px rgba(0,166,80,0.4); }
		.footer-btns button.action:hover { background: #008f45; box-shadow: 0 4px 8px rgba(0,166,80,0.5); transform: translateY(-1px); }
	`;

	const styleEl = document.createElement('style');
	styleEl.id = 'ml-theme-style';
	styleEl.textContent = CSS;
	
	if (document.head) {
		document.head.appendChild(styleEl);
	} else {
		document.addEventListener('DOMContentLoaded', () => document.head.appendChild(styleEl));
	}

	const MAX_TOASTS = 3;
	let activeToasts = [];

	function createToastContainer() {
		if (!document.getElementById('meli-toast-container')) {
			const container = document.createElement('div');
			container.id = 'meli-toast-container';
			if (document.body) document.body.appendChild(container);
			else document.addEventListener('DOMContentLoaded', () => document.body.appendChild(container));
		}
	}

	function showToast(message, type = 'info', duration = 3500) {
		createToastContainer();
		const container = document.getElementById('meli-toast-container');
		if (!container) return;

		const icons = { success: '✅', error: '❌', info: 'ℹ️' };
		const toast = document.createElement('div');
		toast.className = `meli-toast ${type}`;
		toast.innerHTML = `<span class="meli-toast-icon">${icons[type] || '🔔'}</span><span>${message}</span>`;

		container.appendChild(toast);
		activeToasts.push(toast);

		if (activeToasts.length > MAX_TOASTS) {
			const oldestToast = activeToasts.shift();
			oldestToast.classList.add('hiding');
			setTimeout(() => { if (oldestToast.parentNode) oldestToast.remove(); }, 300);
		}

		setTimeout(() => {
			if (toast.parentNode && !toast.classList.contains('hiding')) {
				toast.classList.add('hiding');
				setTimeout(() => {
					if (toast.parentNode) toast.remove();
					const index = activeToasts.indexOf(toast);
					if (index > -1) activeToasts.splice(index, 1);
				}, 300);
			}
		}, duration);
	}

	window.meliTheme = {
		showToast
	};
})();
