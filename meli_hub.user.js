// ==UserScript==
// @name         MELI HUB - Gerenciador de Scripts
// @namespace    https://github.com/LucasRepML/meli_hub
// @version      2.0.0
// @description  Hub profissional para plugins do repositório meli_hub
// @author       Você
// @match        *://*/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';

	// ===== CONFIGURAÇÕES =====
	const REPO_RAW = 'https://raw.githubusercontent.com/LucasRepML/meli_hub/main/scripts/';
	const MANIFEST_URL = REPO_RAW + 'manifest.json';
	const CACHE_PREFIX = 'plugin_cache_';
	const META_PREFIX = 'plugin_meta_';

	// ===== ESTILOS GLOBAIS (UI COMPLETA) =====
	GM_addStyle(`
        /* ========== BOTÃO FLUTUANTE ========== */
        #meli-hub-btn {
            position: fixed;
            bottom: 28px;
            right: 28px;
            z-index: 999999;
            background: #1e1e2e;
            color: #cdd6f4;
            border: none;
            border-radius: 50%;
            width: 56px;
            height: 56px;
            font-size: 22px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4), 0 0 0 1px rgba(205,214,244,0.1);
            transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            background: rgba(30,30,46,0.85);
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
            background: #f38ba8;
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
            line-height: 1;
        }
        /* ========== TOASTS ========== */
        #meli-toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 1000001;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }
        .meli-toast {
            background: #313244;
            color: #cdd6f4;
            border-left: 4px solid #89b4fa;
            padding: 14px 20px;
            border-radius: 10px;
            box-shadow: 0 8px 20px rgba(0,0,0,0.4);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            font-size: 14px;
            min-width: 260px;
            max-width: 360px;
            display: flex;
            align-items: center;
            gap: 10px;
            backdrop-filter: blur(12px);
            background: rgba(49,50,68,0.92);
            animation: meli-slideIn 0.3s ease-out;
            pointer-events: auto;
            transition: opacity 0.25s, transform 0.25s;
        }
        .meli-toast.success { border-left-color: #a6e3a1; }
        .meli-toast.error   { border-left-color: #f38ba8; }
        .meli-toast.info    { border-left-color: #89dceb; }
        .meli-toast-icon {
            font-size: 20px;
            flex-shrink: 0;
        }
        .meli-toast-close {
            margin-left: auto;
            background: none;
            border: none;
            color: #bac2de;
            cursor: pointer;
            font-size: 18px;
            padding: 0 4px;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        .meli-toast-close:hover { opacity: 1; }
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
        #meli-hub-modal.open {
            display: flex;
        }
        @keyframes meli-fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .meli-hub-content {
            background: #1e1e2e;
            border-radius: 18px;
            padding: 28px;
            width: 92%;
            max-width: 540px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(205,214,244,0.08);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #cdd6f4;
            position: relative;
            scrollbar-width: thin;
            scrollbar-color: #45475a #1e1e2e;
        }
        .meli-hub-content::-webkit-scrollbar {
            width: 6px;
        }
        .meli-hub-content::-webkit-scrollbar-track {
            background: #1e1e2e;
            border-radius: 3px;
        }
        .meli-hub-content::-webkit-scrollbar-thumb {
            background: #45475a;
            border-radius: 3px;
        }
        .meli-hub-content h2 {
            margin: 0 0 8px 0;
            font-size: 22px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            color: #cdd6f4;
            letter-spacing: -0.3px;
        }
        .meli-hub-subtitle {
            font-size: 13px;
            color: #a6adc8;
            margin-bottom: 24px;
            border-bottom: 1px solid #313244;
            padding-bottom: 16px;
        }
        .close-btn {
            position: absolute;
            top: 22px;
            right: 22px;
            background: none;
            border: none;
            color: #6c7086;
            font-size: 22px;
            cursor: pointer;
            transition: color 0.2s, transform 0.2s;
            padding: 4px;
            border-radius: 8px;
        }
        .close-btn:hover {
            color: #cdd6f4;
            transform: rotate(90deg);
        }
        /* Plugin item */
        .plugin-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 0;
            border-bottom: 1px solid #313244;
            transition: background 0.2s;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 4px;
        }
        .plugin-item:hover {
            background: #181825;
        }
        .plugin-info {
            flex: 1;
            min-width: 0;
        }
        .plugin-name {
            font-weight: 600;
            font-size: 15px;
            color: #cdd6f4;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .plugin-desc {
            font-size: 12px;
            color: #a6adc8;
            margin-top: 4px;
            line-height: 1.4;
        }
        .plugin-meta {
            display: flex;
            gap: 12px;
            margin-top: 6px;
            font-size: 11px;
            color: #6c7086;
        }
        .plugin-meta span {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .plugin-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
        }
        .status-updated { background: #a6e3a1; }
        .status-pending { background: #f9e2af; }
        .status-error { background: #f38ba8; }
        /* Toggle switch refinado */
        .toggle-switch {
            position: relative;
            width: 48px;
            height: 26px;
            flex-shrink: 0;
            margin-left: 16px;
        }
        .toggle-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0; left: 0; right: 0; bottom: 0;
            background-color: #45475a;
            transition: .3s;
            border-radius: 26px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 20px;
            width: 20px;
            left: 3px;
            bottom: 3px;
            background-color: #cdd6f4;
            transition: .3s;
            border-radius: 50%;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        input:checked + .slider {
            background-color: #89b4fa;
        }
        input:checked + .slider:before {
            transform: translateX(22px);
            background-color: #1e1e2e;
        }
        /* Barra de progresso */
        .progress-container {
            margin: 16px 0 8px;
            height: 8px;
            background: #313244;
            border-radius: 8px;
            overflow: hidden;
        }
        .progress-bar {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #89b4fa, #a6e3a1);
            transition: width 0.3s ease;
            border-radius: 8px;
        }
        .progress-text {
            font-size: 12px;
            color: #a6adc8;
            margin-bottom: 8px;
            text-align: center;
        }
        /* Botões inferiores */
        .footer-btns {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
            gap: 10px;
        }
        .footer-btns button {
            flex: 1;
            padding: 10px 18px;
            border: none;
            border-radius: 10px;
            background: #313244;
            color: #cdd6f4;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }
        .footer-btns button:hover {
            background: #45475a;
        }
        .footer-btns button:active {
            transform: scale(0.97);
        }
        .footer-btns button.primary {
            background: #89b4fa;
            color: #1e1e2e;
            font-weight: 600;
        }
        .footer-btns button.primary:hover {
            background: #b4d0fb;
        }
        /* Responsividade pequena */
        @media (max-width: 480px) {
            .meli-hub-content {
                padding: 20px;
                border-radius: 14px;
            }
            .plugin-meta {
                flex-direction: column;
                gap: 4px;
            }
        }
    `);

	// ===== ESTADO GLOBAL =====
	let manifest = [];
	let enabledPlugins = GM_getValue('enabledPlugins', {});
	// Metadados: { [pluginId]: { lastUpdated: timestamp, version: string } }
	let pluginsMeta = GM_getValue('pluginsMeta', {});

	// ===== TOAST SYSTEM =====
	function showToast(message, type = 'info', duration = 4000) {
		const container = document.getElementById('meli-toast-container');
		if (!container) return;

		const icons = {
			success: '✅',
			error: '❌',
			info: 'ℹ️',
		};
		const toast = document.createElement('div');
		toast.className = `meli-toast ${type}`;
		toast.innerHTML = `
            <span class="meli-toast-icon">${icons[type] || '🔔'}</span>
            <span>${message}</span>
            <button class="meli-toast-close">×</button>
        `;
		const closeBtn = toast.querySelector('.meli-toast-close');
		closeBtn.addEventListener('click', () => {
			toast.style.animation = 'meli-slideOut 0.25s forwards';
			setTimeout(() => toast.remove(), 250);
		});
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

	// ===== CACHE E META =====
	function getCacheKey(pluginId) { return CACHE_PREFIX + pluginId; }
	function getMetaKey(pluginId) { return META_PREFIX + pluginId; }

	function getCachedPlugin(pluginId) {
		const raw = GM_getValue(getCacheKey(pluginId), null);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch (e) { return null; }
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

	function fetchAndCachePlugin(plugin) {
		const url = REPO_RAW + plugin.file;
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url: url,
				onload: function (response) {
					if (response.status === 200) {
						const code = response.responseText;
						GM_setValue(getCacheKey(plugin.id), JSON.stringify({
							code: code,
							version: plugin.version
						}));
						saveMeta(plugin.id, plugin.version);
						resolve(code);
					} else {
						reject(new Error(`Status ${response.status}`));
					}
				},
				onerror: function (err) {
					reject(err);
				}
			});
		});
	}

	function executePlugin(code, pluginId) {
		try {
			eval(code);
		} catch (e) {
			console.error(`[MELI-HUB] Erro ao executar plugin ${pluginId}:`, e);
			showToast(`Erro ao executar ${pluginId}`, 'error');
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
					showToast(`Falha ao carregar plugin ${plugin.name}`, 'error');
				}
			}
		}
		if (loadedCount > 0) {
			showToast(`${loadedCount} plugin(s) carregados com sucesso`, 'success', 3000);
		}
	}

	// ===== UI BUILDING =====
	function getPluginStatus(plugin) {
		const meta = getMeta(plugin.id);
		if (!meta) return 'pending'; // nunca baixado
		if (meta.version === plugin.version) return 'updated';
		return 'pending'; // versão diferente
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
			let statusText = '';
			let statusDotClass = '';
			if (status === 'updated') {
				statusText = 'Atualizado';
				statusDotClass = 'status-updated';
			} else if (status === 'pending') {
				statusText = 'Atualização pendente';
				statusDotClass = 'status-pending';
			}

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
                        <span>📦 v${plugin.version} (disponível)</span>
                        <span>💾 ${meta ? 'v' + meta.version + ' em cache' : 'nunca baixado'}</span>
                        <span>🕒 ${meta ? new Date(meta.lastUpdated).toLocaleString() : '-'}</span>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" ${enabled ? 'checked' : ''} data-plugin-id="${plugin.id}">
                    <span class="slider"></span>
                </label>
            `;
			const checkbox = item.querySelector('input[type=checkbox]');
			checkbox.addEventListener('change', async function (e) {
				const pluginId = this.dataset.pluginId;
				enabledPlugins[pluginId] = this.checked;
				GM_setValue('enabledPlugins', enabledPlugins);
				updateBadge();

				if (this.checked) {
					const plugin = manifest.find(p => p.id === pluginId);
					if (plugin) {
						try {
							await ensurePluginReady(plugin);
							const cached = getCachedPlugin(pluginId);
							if (cached && cached.code) {
								executePlugin(cached.code, pluginId);
								showToast(`Plugin ${plugin.name} ativado`, 'success');
							}
						} catch (err) {
							showToast(`Erro ao ativar ${plugin.name}`, 'error');
						}
					}
				} else {
					showToast(`Plugin ${plugin.name} desativado (recarregue para remover)`, 'info');
				}
				renderModal(); // atualiza status e badge
			});
			listContainer.appendChild(item);
		});

		// Atualizar subtítulo
		const subtitle = modal.querySelector('.meli-hub-subtitle');
		if (subtitle) {
			subtitle.textContent = `${activeCount} de ${manifest.length} plugins ativos`;
		}
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
		// Toast container
		createToastContainer();

		// Botão flutuante com ícone SVG (engrenagem moderna)
		const btn = document.createElement('button');
		btn.id = 'meli-hub-btn';
		btn.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`;
		btn.title = 'MELI HUB - Gerenciador de Plugins';
		btn.addEventListener('click', openModal);
		document.body.appendChild(btn);

		// Badge inicial
		updateBadge();

		// Modal
		const modal = document.createElement('div');
		modal.id = 'meli-hub-modal';
		modal.innerHTML = `
            <div class="meli-hub-content">
                <button class="close-btn" id="meli-hub-close">✕</button>
                <h2>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                    MELI HUB
                </h2>
                <div class="meli-hub-subtitle">Carregando...</div>
                <div class="plugin-list"></div>
                <div class="progress-container" id="update-progress-container" style="display: none;">
                    <div class="progress-text" id="update-progress-text">0%</div>
                    <div class="progress-bar" id="update-progress-bar" style="width:0%"></div>
                </div>
                <div class="footer-btns">
                    <button id="meli-hub-update-all" class="primary">🔄 Atualizar todos</button>
                    <button id="meli-hub-refresh">🔃 Atualizar lista</button>
                    <button id="meli-hub-close-bottom">Fechar</button>
                </div>
            </div>
        `;
		document.body.appendChild(modal);

		// Eventos de fechar
		const closeModalHandler = () => closeModal();
		modal.querySelector('#meli-hub-close').addEventListener('click', closeModalHandler);
		modal.querySelector('#meli-hub-close-bottom').addEventListener('click', closeModalHandler);
		modal.addEventListener('click', function (e) {
			if (e.target === modal) closeModal();
		});

		// Atualizar todos com progresso
		modal.querySelector('#meli-hub-update-all').addEventListener('click', async function () {
			const progressContainer = document.getElementById('update-progress-container');
			const progressBar = document.getElementById('update-progress-bar');
			const progressText = document.getElementById('update-progress-text');
			progressContainer.style.display = 'block';
			let updatedCount = 0;
			const pluginsToUpdate = manifest.filter(p => enabledPlugins[p.id]);
			const total = pluginsToUpdate.length;

			for (const plugin of pluginsToUpdate) {
				try {
					await fetchAndCachePlugin(plugin); // força redownload
					updatedCount++;
					const percentage = Math.round((updatedCount / total) * 100);
					progressBar.style.width = percentage + '%';
					progressText.textContent = `${percentage}% (${updatedCount}/${total})`;
				} catch (e) {
					console.error(`[MELI-HUB] Erro ao atualizar ${plugin.id}:`, e);
					showToast(`Erro ao atualizar ${plugin.name}`, 'error');
				}
			}
			showToast(`${updatedCount} plugins atualizados com sucesso!`, 'success');
			// Esconde progresso depois de um tempo
			setTimeout(() => {
				progressContainer.style.display = 'none';
				progressBar.style.width = '0%';
				progressText.textContent = '0%';
			}, 2000);
			renderModal(); // atualiza status
		});

		// Atualizar lista (refetch manifest)
		modal.querySelector('#meli-hub-refresh').addEventListener('click', async function () {
			try {
				manifest = await fetchManifest();
				renderModal();
				showToast('Lista de plugins atualizada', 'success');
			} catch (e) {
				showToast('Erro ao atualizar lista', 'error');
			}
		});
	}

	// ===== MANIFEST =====
	async function fetchManifest() {
		try {
			const response = await fetch(MANIFEST_URL);
			if (!response.ok) throw new Error('Status ' + response.status);
			return await response.json();
		} catch (err) {
			console.error('[MELI-HUB] Erro ao buscar manifest:', err);
			showToast('Não foi possível conectar ao repositório', 'error', 5000);
			return [];
		}
	}

	// ===== INIT =====
	async function init() {
		manifest = await fetchManifest();
		await loadEnabledPlugins();

		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', buildUI);
		} else {
			buildUI();
		}
	}

	init();

})();
