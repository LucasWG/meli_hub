// ==UserScript==
// @name         MELI HUB - Gerenciador de Scripts
// @namespace    https://github.com/LucasRepML/meli_hub
// @version      3.0.0
// @description  Hub profissional para plugins do repositório meli_hub (Suporte SPA e CSP Bypass)
// @author       LucasWG
// @match        https://envios.adminml.com/*
// @match        https://shipping-bo.adminml.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @connect      github.com
// @sandbox      JavaScript
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';

	// ===== CONFIGURAÇÕES =====
	const REPO_RAW = 'https://raw.githubusercontent.com/LucasRepML/meli_hub/main/scripts/';
	const MANIFEST_URL = REPO_RAW + 'manifest.json';
	const CACHE_PREFIX = 'plugin_cache_';
	const META_PREFIX = 'plugin_meta_';

	// ===== ESTILOS GLOBAIS (UI v3.0.0) =====
	GM_addStyle(`
        /* ========== BOTÃO FLUTUANTE ========== */
        #meli-hub-btn {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 999999;
            background: rgba(30,30,46,0.85);
            color: #cdd6f4;
            border: none;
            border-radius: 14px;
            width: 48px;
            height: 48px;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 0 1px rgba(205,214,244,0.1);
            transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
        }
        #meli-hub-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.5), 0 0 0 2px #89b4fa;
            background: rgba(49,50,68,0.95);
        }
        #meli-hub-btn:active {
            transform: scale(0.95);
        }
        #meli-hub-btn .badge {
            position: absolute;
            top: -6px;
            right: -6px;
            background: #a6e3a1;
            color: #1e1e2e;
            font-size: 11px;
            font-weight: bold;
            min-width: 18px;
            height: 18px;
            border-radius: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            border: 2px solid #1e1e2e;
        }

        /* ========== TOASTS ========== */
        #meli-toast-container {
            position: fixed;
            bottom: 90px;
            right: 28px;
            z-index: 1000001;
            display: flex;
            flex-direction: column-reverse;
            gap: 12px;
            pointer-events: none;
        }
        .meli-toast {
            background: rgba(49,50,68,0.92);
            color: #cdd6f4;
            border-left: 4px solid #89b4fa;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            font-size: 13px;
            min-width: 240px;
            display: flex;
            align-items: center;
            gap: 10px;
            backdrop-filter: blur(12px);
            animation: meli-slideIn 0.3s ease-out;
        }
        .meli-toast.success { border-left-color: #a6e3a1; }
        .meli-toast.error   { border-left-color: #f38ba8; }
        .meli-toast.info    { border-left-color: #89dceb; }
        .meli-toast-icon { font-size: 16px; flex-shrink: 0; }
        @keyframes meli-slideIn {
            from { opacity: 0; transform: translateX(40px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes meli-slideOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(40px); }
        }

        /* ========== MODAL ========== */
        #meli-hub-modal {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.65);
            backdrop-filter: blur(6px);
            z-index: 1000000;
            justify-content: center;
            align-items: center;
            animation: meli-fadeIn 0.2s ease;
        }
        #meli-hub-modal.open { display: flex; }
        @keyframes meli-fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .meli-hub-content {
            background: #1e1e2e;
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            width: 92%;
            max-width: 520px;
            max-height: 80vh;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(205,214,244,0.08);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #cdd6f4;
            position: relative;
        }

        /* Modal Header */
        .meli-hub-header {
            padding: 20px 24px;
            border-bottom: 1px solid #313244;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .meli-hub-header h2 {
            margin: 0; font-size: 20px; font-weight: 600;
            display: flex; align-items: center; gap: 8px; color: #cdd6f4;
        }
        .meli-hub-version {
            font-size: 11px; background: #313244; color: #a6adc8;
            padding: 2px 6px; border-radius: 4px; margin-left: 8px; font-weight: 600;
        }
        .close-btn {
            background: none; border: none; color: #6c7086; font-size: 18px;
            cursor: pointer; transition: color 0.2s; padding: 4px;
        }
        .close-btn:hover { color: #cdd6f4; }

        /* Modal Body */
        .meli-hub-body {
            padding: 20px 24px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #45475a #1e1e2e;
        }
        .meli-hub-subtitle {
            font-size: 12px; color: #a6adc8; margin-bottom: 16px;
        }
        .plugin-item {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px; border-radius: 8px; border: 1px solid transparent;
            transition: background 0.2s, border-color 0.2s; margin-bottom: 6px;
        }
        .plugin-item:hover { background: #181825; border-color: #313244; }
        .plugin-info { flex: 1; min-width: 0; }
        .plugin-name {
            font-weight: 600; font-size: 14px; color: #cdd6f4;
            display: flex; align-items: center; gap: 8px;
        }
        .plugin-desc { font-size: 12px; color: #a6adc8; margin-top: 4px; line-height: 1.4; }
        .plugin-meta {
            display: flex; gap: 12px; margin-top: 6px; font-size: 10px; color: #6c7086;
        }
        .plugin-meta span { display: flex; align-items: center; gap: 4px; }

        /* Status Dot */
        .plugin-status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .status-new { background: #89b4fa; }
        .status-updated { background: #a6e3a1; }
        .status-pending { background: #f9e2af; }

        /* Toggle Switch */
        .toggle-switch { position: relative; width: 44px; height: 24px; flex-shrink: 0; margin-left: 16px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #45475a; transition: .3s; border-radius: 24px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: #cdd6f4; transition: .3s; border-radius: 50%; }
        input:checked + .slider { background-color: #89b4fa; }
        input:checked + .slider:before { transform: translateX(20px); background-color: #1e1e2e; }

        /* Modal Footer */
        .meli-hub-footer {
            padding: 16px 24px; border-top: 1px solid #313244;
            display: flex; flex-direction: column; gap: 12px;
        }
        .progress-container {
            height: 4px; background: #313244; border-radius: 4px; overflow: hidden;
            display: none;
        }
        .progress-bar {
            height: 100%; width: 0%; background: linear-gradient(90deg, #89b4fa, #a6e3a1);
            transition: width 0.3s ease;
        }
        .footer-btns { display: flex; gap: 10px; }
        .footer-btns button {
            flex: 1; padding: 10px; border: none; border-radius: 8px;
            background: #313244; color: #cdd6f4; font-weight: 500; font-size: 13px;
            cursor: pointer; transition: background 0.2s, transform 0.1s;
        }
        .footer-btns button:hover { background: #45475a; }
        .footer-btns button:active { transform: scale(0.97); }
        .footer-btns button.primary { background: #89b4fa; color: #1e1e2e; font-weight: 600; }
        .footer-btns button.primary:hover { background: #b4d0fb; }
    `);

	// ===== ESTADO GLOBAL =====
	let manifest = [];
	let enabledPlugins = GM_getValue('enabledPlugins', {});
	let pluginsMeta = GM_getValue('pluginsMeta', {});

	// ===== UTILITÁRIOS =====
	function showToast(message, type = 'info', duration = 3000) {
		const container = document.getElementById('meli-toast-container');
		if (!container) return;

		const icons = { success: '✅', error: '❌', info: 'ℹ️' };
		const toast = document.createElement('div');
		toast.className = `meli-toast ${type}`;
		toast.innerHTML = `<span class="meli-toast-icon">${icons[type] || '🔔'}</span><span>${message}</span>`;
		container.appendChild(toast);

		setTimeout(() => {
			if (toast.parentNode) {
				toast.style.animation = 'meli-slideOut 0.25s forwards';
				setTimeout(() => toast.remove(), 250);
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

	// Requisições bypass CSP (Substitui o fetch nativo)
	function gmFetch(url) {
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url: url,
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
		// Injeta no contexto da página para monitorar mudanças de rota em SPAs React (como envios.adminml.com)
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

		// Sandbox escutando evento da página e redirecionando
		window.addEventListener('__meli_hub_nav', (e) => {
			const url = e.detail.url;
			unsafeWindow.dispatchEvent(new CustomEvent('meli-hub:route-change', { detail: { url } }));
		});
	}

	// ===== CORE & EXECUÇÃO TRIPLE FALLBACK =====
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

	function getMeta(pluginId) {
		return GM_getValue(getMetaKey(pluginId), null);
	}

	async function fetchAndCachePlugin(plugin) {
		const url = REPO_RAW + plugin.file;
		const code = await gmFetch(url);
		GM_setValue(getCacheKey(plugin.id), JSON.stringify({ code: code, version: plugin.version }));
		saveMeta(plugin.id, plugin.version);
		return code;
	}

	function executePlugin(code, pluginId) {
		try {
			// Método 1: Bypassa CSP e roda direto no escopo MAIN_WORLD da página
			GM_addElement('script', { textContent: code });
		} catch (e1) {
			try {
				// Método 2: Tenta eval no unsafeWindow
				unsafeWindow.eval(code);
			} catch (e2) {
				try {
					// Método 3: Tenta Function no escopo de Sandbox
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
		if (!manifest.length) return;
		let loadedCount = 0;
		for (const plugin of manifest) {
			if (enabledPlugins[plugin.id]) {
				try {
					await ensurePluginReady(plugin);
					const cached = getCachedPlugin(plugin.id);
					if (cached && cached.code) {
						executePlugin(cached.code, plugin.id);
						loadedCount++;
					}
				} catch (err) {
					console.error(`[MELI-HUB] Falha ao carregar ${plugin.id}:`, err);
					showToast(`Erro ao carregar ${plugin.name}`, 'error');
				}
			}
		}
		if (loadedCount > 0) {
			showToast(`${loadedCount} plugin(s) carregados`, 'success', 2500);
		}
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
		const activeCount = Object.values(enabledPlugins).filter(Boolean).length;
		listContainer.innerHTML = '';

		manifest.forEach(plugin => {
			const enabled = !!enabledPlugins[plugin.id];
			const status = getPluginStatus(plugin);
			const meta = getMeta(plugin.id);

			let statusText = status === 'updated' ? 'Em dia' : (status === 'new' ? 'Novo' : 'Atualização pendente');
			let statusDotClass = `status-${status}`;

			const item = document.createElement('div');
			item.className = 'plugin-item';
			item.innerHTML = `
                <div class="plugin-info">
                    <div class="plugin-name">
                        ${plugin.name}
                        <span class="plugin-status-dot ${statusDotClass}" title="${statusText}"></span>
                    </div>
                    <div class="plugin-desc">${plugin.description}</div>
                    <div class="plugin-meta">
                        <span>📦 v${plugin.version}</span>
                        <span>💾 ${meta ? 'v' + meta.version : 'Nunca baixado'}</span>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" ${enabled ? 'checked' : ''} data-plugin-id="${plugin.id}">
                    <span class="slider"></span>
                </label>
            `;
			const checkbox = item.querySelector('input[type=checkbox]');
			checkbox.addEventListener('change', async function () {
				const pluginId = this.dataset.pluginId;
				enabledPlugins[pluginId] = this.checked;
				GM_setValue('enabledPlugins', enabledPlugins);
				updateBadge();

				if (this.checked) {
					const pluginData = manifest.find(p => p.id === pluginId);
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
					showToast(`${plugin.name} desativado (F5 para remover da tela)`, 'info');
				}
				renderModal();
			});
			listContainer.appendChild(item);
		});

		const subtitle = modal.querySelector('.meli-hub-subtitle');
		if (subtitle) { subtitle.textContent = `${activeCount} de ${manifest.length} plugins ativos`; }
	}

	function updateBadge() {
		const btn = document.getElementById('meli-hub-btn');
		if (!btn) return;
		let badge = btn.querySelector('.badge');
		const activeCount = Object.values(enabledPlugins).filter(Boolean).length;
		if (activeCount > 0) {
			if (!badge) {
				badge = document.createElement('span');
				badge.className = 'badge';
				btn.appendChild(badge);
			}
			badge.textContent = activeCount;
		} else {
			if (badge) badge.remove();
		}
	}

	function openModal() {
		const modal = document.getElementById('meli-hub-modal');
		if (modal) {
			modal.classList.add('open');
			renderModal();
		}
	}

	function closeModal() {
		const modal = document.getElementById('meli-hub-modal');
		if (modal) modal.classList.remove('open');
	}

	function buildUI() {
		createToastContainer();

		const btn = document.createElement('button');
		btn.id = 'meli-hub-btn';
		btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
		btn.title = 'MELI HUB';
		btn.addEventListener('click', openModal);
		document.body.appendChild(btn);

		updateBadge();

		const modal = document.createElement('div');
		modal.id = 'meli-hub-modal';
		modal.innerHTML = `
            <div class="meli-hub-content">
                <div class="meli-hub-header">
                    <h2>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                        MELI HUB <span class="meli-hub-version">v3.0.0</span>
                    </h2>
                    <button class="close-btn" id="meli-hub-close">✕</button>
                </div>
                <div class="meli-hub-body">
                    <div class="meli-hub-subtitle">Carregando...</div>
                    <div class="plugin-list"></div>
                </div>
                <div class="meli-hub-footer">
                    <div class="progress-container" id="update-progress-container">
                        <div class="progress-bar" id="update-progress-bar"></div>
                    </div>
                    <div class="footer-btns">
                        <button id="meli-hub-update-all" class="primary">🔄 Atualizar todos</button>
                        <button id="meli-hub-refresh">🔃 Atualizar lista</button>
                    </div>
                </div>
            </div>
        `;
		document.body.appendChild(modal);

		const closeModalHandler = () => closeModal();
		modal.querySelector('#meli-hub-close').addEventListener('click', closeModalHandler);
		modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });

		// Atalho de fechar via ESC
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
		});

		// Eventos
		modal.querySelector('#meli-hub-update-all').addEventListener('click', async function () {
			const progressContainer = document.getElementById('update-progress-container');
			const progressBar = document.getElementById('update-progress-bar');
			progressContainer.style.display = 'block';

			let updatedCount = 0;
			const pluginsToUpdate = manifest.filter(p => enabledPlugins[p.id]);
			const total = pluginsToUpdate.length;

			if (total === 0) {
				showToast('Nenhum plugin ativo para atualizar.', 'info');
				progressContainer.style.display = 'none';
				return;
			}

			for (const plugin of pluginsToUpdate) {
				try {
					await fetchAndCachePlugin(plugin);
					updatedCount++;
					progressBar.style.width = Math.round((updatedCount / total) * 100) + '%';
				} catch (e) {
					console.error(`[MELI-HUB] Erro ao atualizar ${plugin.id}:`, e);
				}
			}
			showToast(`${updatedCount} plugins atualizados com sucesso!`, 'success');

			setTimeout(() => {
				progressContainer.style.display = 'none';
				progressBar.style.width = '0%';
			}, 1500);
			renderModal();
		});

		modal.querySelector('#meli-hub-refresh').addEventListener('click', async function () {
			try {
				manifest = await fetchManifest();
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
			return JSON.parse(responseText);
		} catch (err) {
			console.error('[MELI-HUB] Erro ao buscar manifest:', err);
			showToast('Não foi possível conectar ao repositório', 'error');
			return [];
		}
	}

	// ===== INIT =====
	async function init() {
		manifest = await fetchManifest();

		whenBody(() => {
			injectRouteInterceptor();
			buildUI();
			loadEnabledPlugins();
		});
	}

	init();

})();
