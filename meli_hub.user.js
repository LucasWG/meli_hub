// ==UserScript==
// @name         MELI HUB - Gerenciador de Scripts
// @namespace    https://github.com/LucasRepML/meli_hub
// @version      3.2.4
// @description  Hub profissional para plugins do repositório meli_hub (Estilo ML, Suporte SPA, CSP Bypass e Anti-Cache)
// @author       LucasWG
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        unsafeWindow
// @grant        GM_openInTab
// @connect      raw.githubusercontent.com
// @connect      github.com
// @sandbox      JavaScript
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';

	// ===== CONFIGURAÇÕES =====
	const HUB_VERSION = '3.2.4';
	const REPO_RAW = 'https://raw.githubusercontent.com/LucasRepML/meli_hub/main/';
	const MANIFEST_URL = REPO_RAW + 'manifest.json';
	const HUB_SCRIPT_URL = REPO_RAW + 'meli_hub.user.js';
	const CACHE_PREFIX = 'plugin_cache_';
	const META_PREFIX = 'plugin_meta_';
	const MAX_TOASTS = 3;

	// ===== GREETINGS =====
	const GREETINGS_PREFIXES = [
		'Olá', 'Oi', 'Bem-vindo(a) de volta', 'Que bom te ver', 'Saudações',
		'Tudo pronto por aqui', 'Vamos nessa', 'Preparado(a)', 'Excelente dia', 'Firme e forte',
		'E aí', 'Muito bom te ver', 'Prontos para mais', 'Tudo em ordem', 'Sempre em frente'
	];
	const GREETINGS_SUFFIXES = [
		'! Pronto para arrasar?', '! Vamos fazer acontecer?', '. Espero que seu dia seja ótimo!',
		'! Mais um dia de sucesso!', '. Estamos juntos nessa!', '! Que seu dia seja produtivo.',
		'. Bora pra cima!', '. Conte com o Hub!', '! Tudo otimizado para você.', '. Vamos automatizar!',
		'! O dever nos chama.', '. Missão dada é missão cumprida!', '! Facilidade e agilidade garantidas.',
		'. Vamos com tudo!', '! Hub 100% carregado e pronto.'
	];

	function getRandomGreeting(name) {
		const time = new Date().getHours();
		let period = "Bom dia";
		if (time >= 12 && time < 18) period = "Boa tarde";
		else if (time >= 18) period = "Boa noite";

		const usePeriod = Math.random() > 0.5;
		const prefix = usePeriod ? period : GREETINGS_PREFIXES[Math.floor(Math.random() * GREETINGS_PREFIXES.length)];
		const suffix = GREETINGS_SUFFIXES[Math.floor(Math.random() * GREETINGS_SUFFIXES.length)];
		return `${prefix}, ${name}${suffix}`;
	}

	function getUserName() {
		// Procura no DOM principal
		const mainSpan = document.querySelector('.kraken-user-menu__trigger span');
		if (mainSpan && mainSpan.textContent.trim()) {
			const n = mainSpan.textContent.trim();
			GM_setValue('cachedUserName', n);
			return n;
		}

		// Procura dentro de Shadow DOMs (kraken menu usa declarative shadow DOM)
		const allElements = document.querySelectorAll('*');
		for (let i = 0; i < allElements.length; i++) {
			if (allElements[i].shadowRoot) {
				const span = allElements[i].shadowRoot.querySelector('.kraken-user-menu__trigger span');
				if (span && span.textContent.trim()) {
					const n = span.textContent.trim();
					GM_setValue('cachedUserName', n);
					return n;
				}
			}
		}

		return null;
	}

	function getAsyncUserName(maxWaitMs = 6000) {
		const start = Date.now();
		return new Promise(resolve => {
			const check = () => {
				const name = getUserName();
				if (name) return resolve(name);
				if (Date.now() - start > maxWaitMs) return resolve('Usuário');
				setTimeout(check, 300);
			};
			check();
		});
	}

	// ===== ESTILOS GLOBAIS (UI v3.3.0 - Tema Profissional Mercado Livre) =====
	GM_addStyle(`
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
				max-width: 800px;
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
			.plugin-icon {
				width: 54px; height: 54px; background: rgba(52,131,250,0.1); color: var(--ml-blue);
				border-radius: 12px; display: flex; align-items: center; justify-content: center;
				font-size: 24px; font-weight: bold; flex-shrink: 0; align-self: flex-start;
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
			.progress-container {
				height: 6px; background: var(--ml-bg); border-radius: 6px; overflow: hidden;
				display: none;
			}
			.progress-bar {
				height: 100%; width: 0%; background: var(--ml-blue);
				transition: width 0.3s ease;
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
		`);

	// ===== ESTADO GLOBAL =====
	let manifestData = { hub_version: HUB_VERSION, plugins: [] };
	let enabledPlugins = GM_getValue('enabledPlugins', {});
	let pluginsMeta = GM_getValue('pluginsMeta', {});
	let activeToasts = [];
	let currentGreeting = '';
	let isHubOutdated = false;

	// ===== UTILITÁRIOS =====
	function showToast(message, type = 'info', duration = 3500) {
		const container = document.getElementById('meli-toast-container');
		if (!container) return;

		const icons = { success: '✅', error: '❌', info: 'ℹ️' };
		const toast = document.createElement('div');
		toast.className = `meli-toast ${type}`;
		toast.innerHTML = `<span class="meli-toast-icon">${icons[type] || '🔔'}</span><span>${message}</span>`;

		container.appendChild(toast);
		activeToasts.push(toast);

		// Limita a quantidade de toasts na tela
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

	function createToastContainer() {
		if (!document.getElementById('meli-toast-container')) {
			const container = document.createElement('div');
			container.id = 'meli-toast-container';
			document.body.appendChild(container);
		}
	}

	function whenBody(cb) {
		if (document.body) { cb(); }
		else {
			const mo = new MutationObserver((_, obs) => {
				if (document.body) { obs.disconnect(); cb(); }
			});
			mo.observe(document.documentElement, { childList: true });
		}
	}

	// ===== ANTI-CACHE FETCH =====
	function gmFetch(url) {
		const cacheBusterUrl = url + (url.includes('?') ? '&' : '?') + 't=' + new Date().getTime();
		console.log('DEBUG - gmFetch', cacheBusterUrl);
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url: cacheBusterUrl,
				nocache: true,
				headers: {
					'Cache-Control': 'no-cache, no-store, must-revalidate',
					'Pragma': 'no-cache',
					'Expires': '0'
				},
				onload: (res) => {
					if (res.status >= 200 && res.status < 300) resolve(res.responseText);
					else reject(new Error(`HTTP ${res.status}`));
				},
				onerror: reject,
				ontimeout: reject
			});
		});
	}

	// ===== SPA ROUTE INTERCEPTOR =====
	function injectRouteInterceptor() {
		const interceptorCode = `
				(function(){
					let lastUrl = location.href;
					function notify(newUrl) {
						window.dispatchEvent(new CustomEvent('__meli_hub_nav', { detail: { url: newUrl } }));
					}
					const origPush = history.pushState;
					history.pushState = function(...args) {
						const r = origPush.apply(this, args);
						if (location.href !== lastUrl) { lastUrl = location.href; notify(lastUrl); }
						return r;
					};
					const origReplace = history.replaceState;
					history.replaceState = function(...args) {
						const r = origReplace.apply(this, args);
						if (location.href !== lastUrl) { lastUrl = location.href; notify(lastUrl); }
						return r;
					};
					window.addEventListener('popstate', () => {
						if (location.href !== lastUrl) { lastUrl = location.href; notify(lastUrl); }
					});
				})();
			`;
		GM_addElement('script', { textContent: interceptorCode });
		window.addEventListener('__meli_hub_nav', (e) => {
			unsafeWindow.dispatchEvent(new CustomEvent('meli-hub:route-change', { detail: { url: e.detail.url } }));
		});
	}

	// ===== CORE & EXECUÇÃO =====
	function getCacheKey(pluginId) { return CACHE_PREFIX + pluginId; }
	function getMetaKey(pluginId) { return META_PREFIX + pluginId; }

	function getCachedPlugin(pluginId) {
		const raw = GM_getValue(getCacheKey(pluginId), null);
		if (!raw) return null;
		try { return JSON.parse(raw); } catch (e) { return null; }
	}

	function saveMeta(pluginId, version) {
		const meta = GM_getValue(getMetaKey(pluginId), {});
		meta.lastUpdated = Date.now();
		meta.version = version;
		GM_setValue(getMetaKey(pluginId), meta);
		pluginsMeta[pluginId] = meta;
	}

	function getMeta(pluginId) { return GM_getValue(getMetaKey(pluginId), null); }

	async function fetchAndCachePlugin(plugin) {
		const url = REPO_RAW + plugin.file;
		const code = await gmFetch(url);
		GM_setValue(getCacheKey(plugin.id), JSON.stringify({ code: code, version: plugin.version }));
		saveMeta(plugin.id, plugin.version);
		return code;
	}

	function executePlugin(code, pluginId) {
		try {
			GM_addElement('script', { textContent: code });
		} catch (e1) {
			try {
				unsafeWindow.eval(code);
			} catch (e2) {
				try {
					new Function(code)();
				} catch (e3) {
					console.error(`[MELI-HUB] Erro fatal ao executar plugin ${pluginId}:`, e3);
					showToast(`Falha grave no plugin ${pluginId}`, 'error');
				}
			}
		}
	}

	async function ensurePluginReady(plugin) {
		const cached = getCachedPlugin(plugin.id);
		if (!cached || cached.version !== plugin.version) {
			await fetchAndCachePlugin(plugin);
		}
	}

	async function loadEnabledPlugins() {
		if (!manifestData.plugins || !manifestData.plugins.length) return;
		for (const plugin of manifestData.plugins) {
			if (plugin.required || enabledPlugins[plugin.id]) {
				try {
					await ensurePluginReady(plugin);
					const cached = getCachedPlugin(plugin.id);
					if (cached && cached.code) {
						executePlugin(cached.code, plugin.id);
					}
				} catch (err) {
					console.error(`[MELI-HUB] Falha ao carregar ${plugin.id}:`, err);
				}
			}
		}
	}

	// ===== UPDATE CHECKER =====
	function compareVersions(v1, v2) {
		const p1 = v1.split('.').map(Number);
		const p2 = v2.split('.').map(Number);
		for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
			const n1 = p1[i] || 0;
			const n2 = p2[i] || 0;
			if (n1 > n2) return 1;
			if (n1 < n2) return -1;
		}
		return 0;
	}

	async function updateAllEnabledPlugins(showToasts = true) {
		const pluginsToUpdate = manifestData.plugins.filter(p => p.required || enabledPlugins[p.id]);
		let updatedCount = 0;
		for (const plugin of pluginsToUpdate) {
			const meta = getMeta(plugin.id);
			if (!meta || meta.version !== plugin.version) {
				try {
					await fetchAndCachePlugin(plugin);
					updatedCount++;
				} catch (e) {
					console.error(`[MELI-HUB] Erro ao atualizar ${plugin.id}:`, e);
				}
			}
		}
		if (showToasts && updatedCount > 0) {
			showToast(`${updatedCount} plugin(s) atualizado(s) com sucesso!`, 'success');
		}
		return updatedCount;
	}

	// ===== UI BUILDING =====
	function getPluginStatus(plugin) {
		const meta = getMeta(plugin.id);
		if (!meta) return 'new';
		if (meta.version === plugin.version) return 'updated';
		return 'pending';
	}

	function renderModal() {
		const modal = document.getElementById('meli-hub-modal');
		if (!modal) return;
		const listContainer = modal.querySelector('.plugin-list');

		const optionalPlugins = manifestData.plugins.filter(p => !p.required);
		const activeCount = optionalPlugins.filter(p => enabledPlugins[p.id]).length;

		listContainer.innerHTML = '';

		optionalPlugins.forEach(plugin => {
			const enabled = !!enabledPlugins[plugin.id];
			const status = getPluginStatus(plugin);
			const meta = getMeta(plugin.id);
			const statusText = status === 'updated' ? 'Em dia' : (status === 'new' ? 'Novo' : 'Atualizar');
			const lastUpdated = meta && meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleString('pt-BR') : 'Nunca';
			const initial = plugin.name.charAt(0).toUpperCase();

			const item = document.createElement('div');
			item.className = 'plugin-item' + (isHubOutdated ? ' disabled' : '');
			item.innerHTML = `
					<div class="plugin-icon">${initial}</div>
					<div class="plugin-info">
						<div class="plugin-name">
							${plugin.name}
							<span class="status-badge status-${status}">${statusText}</span>
						</div>
						<div class="plugin-desc">${plugin.description}</div>
						<div class="plugin-details">
							<div class="detail-item"><span>📦 Nuvem:</span> v${plugin.version}</div>
							<div class="detail-item"><span>💾 Local:</span> ${meta ? 'v' + meta.version : '--'}</div>
							<div class="detail-item"><span>🔄 Sincronizado:</span> ${lastUpdated}</div>
							<div class="detail-item"><span>🔗 ID:</span> ${plugin.id}</div>
						</div>
					</div>
					<div class="plugin-action">
						<label class="toggle-switch">
							<input type="checkbox" ${enabled ? 'checked' : ''} data-plugin-id="${plugin.id}">
							<span class="slider"></span>
						</label>
					</div>
				`;

			const checkbox = item.querySelector('input[type=checkbox]');
			checkbox.addEventListener('change', async function () {
				const pluginId = this.dataset.pluginId;
				enabledPlugins[pluginId] = this.checked;
				GM_setValue('enabledPlugins', enabledPlugins);

				if (this.checked) {
					const pluginData = manifestData.plugins.find(p => p.id === pluginId);
					if (pluginData) {
						try {
							await ensurePluginReady(pluginData);
							const cached = getCachedPlugin(pluginId);
							if (cached && cached.code) {
								executePlugin(cached.code, pluginId);
								showToast(`${pluginData.name} ativado`, 'success');
							}
						} catch (err) {
							showToast(`Erro ao ativar ${pluginData.name}`, 'error');
						}
					}
				} else {
					showToast(`Plugin desativado (F5 para limpar da tela)`, 'info');
				}
				renderModal();
			});
			listContainer.appendChild(item);
		});

		const subtitle = modal.querySelector('.meli-hub-subtitle');
		if (subtitle) {
			const displayGreeting = currentGreeting || getRandomGreeting(getUserName());
			subtitle.innerHTML = `
					<span>${displayGreeting}</span>
					<strong>${activeCount} ativos</strong>
				`;
		}

		// Atualiza botões do footer se houver atualização pendente para o Hub
		const updateBtn = modal.querySelector('#meli-hub-update-hub');
		const refreshBtn = modal.querySelector('#meli-hub-refresh');
		const syncBtn = modal.querySelector('#meli-hub-update-all');

		if (updateBtn) {
			const hasHubUpdate = compareVersions(manifestData.hub_version || HUB_VERSION, HUB_VERSION) > 0;
			updateBtn.style.display = hasHubUpdate ? 'flex' : 'none';
			if (refreshBtn) refreshBtn.style.display = hasHubUpdate ? 'none' : 'flex';
			if (syncBtn) syncBtn.style.display = hasHubUpdate ? 'none' : 'flex';
		}
	}

	function openModal() {
		const modal = document.getElementById('meli-hub-modal');
		if (modal) {
			const savedName = GM_getValue('cachedUserName', 'Usuário');
			const immediateName = getUserName();
			currentGreeting = getRandomGreeting(immediateName || savedName);

			modal.classList.add('open');
			renderModal();

			// Se não pegou síncrono, tenta atualizar assincronamente (em background)
			if (!immediateName) {
				getAsyncUserName(2500).then(asyncName => {
					if (asyncName && asyncName !== 'Usuário' && asyncName !== savedName) {
						currentGreeting = getRandomGreeting(asyncName);
						renderModal();
					}
				});
			}

			// Auto check for plugin updates when modal opens
			updateAllEnabledPlugins(true).then(count => {
				if (count > 0) renderModal();
			});
		}
	}

	function closeModal() {
		const modal = document.getElementById('meli-hub-modal');
		if (modal) modal.classList.remove('open');
	}

	function buildUI() {
		createToastContainer();

		const hasHubUpdate = compareVersions(manifestData.hub_version || HUB_VERSION, HUB_VERSION) > 0;
		const versionHtml = hasHubUpdate
			? `<span class="meli-hub-version old-version">v${HUB_VERSION}</span>
			   <span class="meli-hub-version new-version">v${manifestData.hub_version}</span>`
			: `<span class="meli-hub-version">v${HUB_VERSION}</span>`;

		const modal = document.createElement('div');
		modal.id = 'meli-hub-modal';
		modal.innerHTML = `
				<div class="meli-hub-content">
					<div class="meli-hub-header">
						<h2>
							<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 12l10 5 10-5"></path><path d="M2 17l10 5 10-5"></path></svg>
							MELI HUB ${versionHtml}
						</h2>
						<button class="close-btn" id="meli-hub-close" title="Fechar (ESC)">✕</button>
					</div>
					<div class="meli-hub-body">
						<div class="meli-hub-subtitle">Carregando plugins...</div>
						<div class="plugin-list"></div>
					</div>
					<div class="meli-hub-footer">
						<div class="progress-container" id="update-progress-container">
							<div class="progress-bar" id="update-progress-bar"></div>
						</div>
						<div class="footer-btns">
							<button id="meli-hub-update-hub" class="action" style="display:none;">🚀 Atualizar Hub</button>
							<button id="meli-hub-refresh" class="secondary">↻ Atualizar Lista</button>
							<button id="meli-hub-update-all" class="primary">⬇️ Sincronizar Plugins</button>
						</div>
					</div>
				</div>
			`;
		document.body.appendChild(modal);

		const closeModalHandler = () => closeModal();
		modal.querySelector('#meli-hub-close').addEventListener('click', closeModalHandler);
		modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

		// ===== ATALHOS DE TECLADO (ALT+H e ESC) =====
		document.addEventListener('keydown', (e) => {
			if (e.altKey && e.key.toLowerCase() === 'h') {
				e.preventDefault();
				modal.classList.contains('open') ? closeModal() : openModal();
			}
			if (e.key === 'Escape' && modal.classList.contains('open')) {
				closeModal();
			}
		});

		// Eventos dos botões do footer
		modal.querySelector('#meli-hub-update-hub').addEventListener('click', function () {
			showToast('Baixando nova versão do MELI HUB...', 'info');
			GM_openInTab(HUB_SCRIPT_URL, { active: true });
		});

		modal.querySelector('#meli-hub-update-all').addEventListener('click', async function () {
			const progressContainer = document.getElementById('update-progress-container');
			const progressBar = document.getElementById('update-progress-bar');
			progressContainer.style.display = 'block';

			const count = await updateAllEnabledPlugins(false);

			if (count === 0) {
				showToast('Todos os plugins já estão na versão mais recente.', 'info');
			} else {
				showToast(`${count} plugin(s) sincronizados com sucesso!`, 'success');
			}

			progressBar.style.width = '100%';
			setTimeout(() => {
				progressContainer.style.display = 'none';
				progressBar.style.width = '0%';
			}, 1500);
			renderModal();
		});

		modal.querySelector('#meli-hub-refresh').addEventListener('click', async function () {
			try {
				manifestData = await fetchManifest();
				renderModal();
				showToast('Lista de plugins atualizada', 'success');
			} catch (e) {
				// Erro já tratado no fetchManifest
			}
		});
	}

	// ===== MANIFEST =====
	async function fetchManifest() {
		try {
			const responseText = await gmFetch(MANIFEST_URL);
			const data = JSON.parse(responseText);
			// Compatibilidade com manifest antigo (array) para novo (objeto)
			if (Array.isArray(data)) {
				return { hub_version: HUB_VERSION, plugins: data };
			}
			return data;
		} catch (err) {
			console.error('[MELI-HUB] Erro ao buscar manifest:', err);
			return { hub_version: HUB_VERSION, plugins: [] };
		}
	}

	// ===== INIT =====
	async function init() {
		manifestData = await fetchManifest();

		whenBody(() => {
			injectRouteInterceptor();
			buildUI();

			const isFirstRun = !GM_getValue('firstRunDone', false);

			if (isFirstRun) {
				// Lógica da primeira vez
				setTimeout(async () => {
					const userName = await getAsyncUserName();
					openModal();
					showToast(getRandomGreeting(userName), 'success', 6000);
					updateAllEnabledPlugins(false).then(() => {
						renderModal();
					});
					GM_setValue('firstRunDone', true);
				}, 500);
			} else {
				// Checa atualizações silenciosamente
				const hasHubUpdate = compareVersions(manifestData.hub_version || HUB_VERSION, HUB_VERSION) > 0;
				if (hasHubUpdate) {
					isHubOutdated = true;
					showToast('Atualização obrigatória do MELI HUB disponível!', 'info');
					openModal();
				}

				// Checa atualizações de plugins habilitados
				const pluginsToUpdate = manifestData.plugins.filter(p => p.required || enabledPlugins[p.id]);
				let hasPluginUpdate = false;
				for (const plugin of pluginsToUpdate) {
					const meta = getMeta(plugin.id);
					if (!meta || meta.version !== plugin.version) {
						hasPluginUpdate = true;
						break;
					}
				}

				if (hasPluginUpdate && !hasHubUpdate) {
					// Abre modal automaticamente para atualizar
					openModal();
				}
			}

			if (!isHubOutdated) {
				loadEnabledPlugins();
			} else {
				showToast('Plugins bloqueados até a atualização do Hub.', 'error', 5000);
			}
		});
	}

	init();

})();
