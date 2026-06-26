// ==UserScript==
// @name         MELI HUB - Gerenciador de Scripts
// @namespace    https://github.com/LucasRepML/meli_hub
// @version      3.1.0
// @description  Hub profissional para plugins do repositório meli_hub (Estilo ML, Suporte SPA e CSP Bypass)
// @author       Você
// @match        *://*/*
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

	// ===== ESTILOS GLOBAIS (UI v3.1.0 - Tema Mercado Livre) =====
	GM_addStyle(`
        /* ========== TIPOGRAFIA E VARIAVEIS ========== */
        :root {
            --ml-yellow: #FFE600;
            --ml-blue: #3483FA;
            --ml-blue-hover: #2968c8;
            --ml-green: #00A650;
            --ml-red: #F23D4F;
            --ml-bg: #EBEBEB;
            --ml-white: #FFFFFF;
            --ml-text-main: #333333;
            --ml-text-muted: #666666;
            --ml-text-light: #999999;
            --ml-border: #E6E6E6;
            --ml-font: 'Proxima Nova', -apple-system, 'Helvetica Neue', Helvetica, Roboto, Arial, sans-serif;
        }

        /* ========== TOASTS ========== */
        #meli-toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 1000001;
            display: flex;
            flex-direction: column-reverse;
            gap: 12px;
            pointer-events: none;
        }
        .meli-toast {
            background: var(--ml-white);
            color: var(--ml-text-main);
            border-left: 4px solid var(--ml-blue);
            padding: 14px 18px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: var(--ml-font);
            font-size: 14px;
            min-width: 260px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: meli-slideIn 0.3s ease-out;
            border-top: 1px solid var(--ml-border);
            border-right: 1px solid var(--ml-border);
            border-bottom: 1px solid var(--ml-border);
        }
        .meli-toast.success { border-left-color: var(--ml-green); }
        .meli-toast.error   { border-left-color: var(--ml-red); }
        .meli-toast.info    { border-left-color: var(--ml-blue); }
        .meli-toast-icon { font-size: 18px; flex-shrink: 0; }
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
            background: rgba(0,0,0,0.5);
            z-index: 1000000;
            justify-content: center;
            align-items: center;
            animation: meli-fadeIn 0.2s ease;
        }
        #meli-hub-modal.open { display: flex; }
        @keyframes meli-fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .meli-hub-content {
            background: var(--ml-bg);
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            width: 92%;
            max-width: 600px;
            max-height: 85vh;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            font-family: var(--ml-font);
            color: var(--ml-text-main);
            overflow: hidden;
        }

        /* Modal Header */
        .meli-hub-header {
            background: var(--ml-yellow);
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .meli-hub-header h2 {
            margin: 0; font-size: 20px; font-weight: 600;
            display: flex; align-items: center; gap: 8px; color: var(--ml-text-main);
        }
        .meli-hub-version {
            font-size: 12px; background: rgba(0,0,0,0.08); color: var(--ml-text-main);
            padding: 2px 8px; border-radius: 12px; margin-left: 8px; font-weight: 600;
        }
        .close-btn {
            background: none; border: none; color: var(--ml-text-main); font-size: 24px;
            cursor: pointer; transition: opacity 0.2s; padding: 0; line-height: 1; opacity: 0.6;
        }
        .close-btn:hover { opacity: 1; }

        /* Modal Body */
        .meli-hub-body {
            padding: 24px;
            overflow-y: auto;
            background: var(--ml-bg);
            scrollbar-width: thin;
            scrollbar-color: #cccccc transparent;
        }
        .meli-hub-body::-webkit-scrollbar { width: 6px; }
        .meli-hub-body::-webkit-scrollbar-thumb { background: #cccccc; border-radius: 4px; }

        .meli-hub-subtitle {
            font-size: 14px; color: var(--ml-text-muted); margin-bottom: 16px; font-weight: 400;
            display: flex; justify-content: space-between; align-items: center;
        }

        /* Plugin List */
        .plugin-list {
            display: flex; flex-direction: column; gap: 12px;
        }
        .plugin-item {
            background: var(--ml-white);
            border: 1px solid var(--ml-border);
            border-radius: 6px;
            padding: 16px;
            display: flex; align-items: center; justify-content: space-between;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            transition: box-shadow 0.2s;
        }
        .plugin-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
        }
        .plugin-info { flex: 1; min-width: 0; }
        .plugin-name {
            font-weight: 600; font-size: 16px; color: var(--ml-text-main);
            display: flex; align-items: center; gap: 10px; margin-bottom: 4px;
        }
        .plugin-desc { font-size: 13px; color: var(--ml-text-muted); line-height: 1.5; }
        .plugin-meta {
            display: flex; gap: 16px; margin-top: 10px; font-size: 12px; color: var(--ml-text-light);
        }
        .plugin-meta span { display: flex; align-items: center; gap: 4px; }

        /* Badges de Status */
        .status-badge {
            font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 600; text-transform: uppercase;
        }
        .status-new { background: #E1F0FF; color: var(--ml-blue); }
        .status-updated { background: #E6F7ED; color: var(--ml-green); }
        .status-pending { background: #FFF0E6; color: #E86000; }

        /* Toggle Switch (Meli Style) */
        .toggle-switch { position: relative; width: 40px; height: 20px; flex-shrink: 0; margin-left: 16px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cccccc; transition: .3s; border-radius: 20px; }
        .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }
        input:checked + .slider { background-color: var(--ml-blue); }
        input:checked + .slider:before { transform: translateX(20px); }

        /* Modal Footer */
        .meli-hub-footer {
            background: var(--ml-white);
            padding: 16px 24px; border-top: 1px solid var(--ml-border);
            display: flex; flex-direction: column; gap: 12px;
        }
        .progress-container {
            height: 4px; background: var(--ml-bg); border-radius: 4px; overflow: hidden;
            display: none;
        }
        .progress-bar {
            height: 100%; width: 0%; background: var(--ml-blue);
            transition: width 0.3s ease;
        }
        .footer-btns { display: flex; gap: 12px; }
        .footer-btns button {
            flex: 1; padding: 12px; border: none; border-radius: 6px;
            font-family: var(--ml-font); font-weight: 600; font-size: 14px;
            cursor: pointer; transition: background 0.2s, color 0.2s;
        }
        .footer-btns button.secondary {
            background: rgba(65,137,230,.15); color: var(--ml-blue);
        }
        .footer-btns button.secondary:hover { background: rgba(65,137,230,.2); }

        .footer-btns button.primary { background: var(--ml-blue); color: var(--ml-white); }
        .footer-btns button.primary:hover { background: var(--ml-blue-hover); }
    `);

	// ===== ESTADO GLOBAL =====
	let manifest = [];
	let enabledPlugins = GM_getValue('enabledPlugins', {});
	let pluginsMeta = GM_getValue('pluginsMeta', {});

	// ===== UTILITÁRIOS =====
	function showToast(message, type = 'info', duration = 3500) {
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
		if (!manifest.length) return;
		for (const plugin of manifest) {
			if (enabledPlugins[plugin.id]) {
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
		// Nota: Removido o toast automático no carregamento inicial da página
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

			let statusText = status === 'updated' ? 'Em dia' : (status === 'new' ? 'Novo' : 'Atualizar');

			const item = document.createElement('div');
			item.className = 'plugin-item';
			item.innerHTML = `
                <div class="plugin-info">
                    <div class="plugin-name">
                        ${plugin.name}
                        <span class="status-badge status-${status}">${statusText}</span>
                    </div>
                    <div class="plugin-desc">${plugin.description}</div>
                    <div class="plugin-meta">
                        <span title="Versão disponível no repositório">📦 v${plugin.version}</span>
                        <span title="Versão salva localmente">💾 ${meta ? 'v' + meta.version : '--'}</span>
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
					showToast(`Plugin desativado (F5 para limpar da tela)`, 'info');
				}
				renderModal();
			});
			listContainer.appendChild(item);
		});

		const subtitle = modal.querySelector('.meli-hub-subtitle');
		if (subtitle) {
			subtitle.innerHTML = `
                <span>Seus plugins e ferramentas</span>
                <strong>${activeCount} ativos</strong>
            `;
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

		const modal = document.createElement('div');
		modal.id = 'meli-hub-modal';
		modal.innerHTML = `
            <div class="meli-hub-content">
                <div class="meli-hub-header">
                    <h2>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        MELI HUB <span class="meli-hub-version">v3.1.0</span>
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
                        <button id="meli-hub-refresh" class="secondary">Atualizar Lista</button>
                        <button id="meli-hub-update-all" class="primary">Sincronizar Plugins</button>
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
			// ALT + H para abrir/fechar
			if (e.altKey && e.key.toLowerCase() === 'h') {
				e.preventDefault(); // Evita comportamentos nativos do browser
				modal.classList.contains('open') ? closeModal() : openModal();
			}
			// ESC para fechar
			if (e.key === 'Escape' && modal.classList.contains('open')) {
				closeModal();
			}
		});

		// Eventos dos botões do footer
		modal.querySelector('#meli-hub-update-all').addEventListener('click', async function () {
			const progressContainer = document.getElementById('update-progress-container');
			const progressBar = document.getElementById('update-progress-bar');
			progressContainer.style.display = 'block';

			let updatedCount = 0;
			const pluginsToUpdate = manifest.filter(p => enabledPlugins[p.id]);
			const total = pluginsToUpdate.length;

			if (total === 0) {
				showToast('Nenhum plugin ativo para sincronizar.', 'info');
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
			showToast(`${updatedCount} plugin(s) sincronizados com sucesso!`, 'success');

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
			showToast('Falha ao conectar ao repositório', 'error');
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
