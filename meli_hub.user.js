// ==UserScript==
// @name         MELI HUB - Gerenciador de Scripts
// @namespace    https://github.com/LucasRepML/meli_hub
// @version      0.0.1
// @description  Hub para carregar scripts (plugins) do repositório meli_hub
// @author       LucasWG
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

	// ===== ESTILOS DO MODAL =====
	GM_addStyle(`
        #meli-hub-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 99999;
            background: #444;
            color: #fff;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        #meli-hub-modal {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 100000;
            justify-content: center;
            align-items: center;
        }
        #meli-hub-modal.open {
            display: flex;
        }
        .meli-hub-content {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        }
        .meli-hub-content h2 {
            margin-top: 0;
            font-size: 20px;
            border-bottom: 2px solid #eee;
            padding-bottom: 8px;
        }
        .plugin-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        .plugin-info {
            flex: 1;
        }
        .plugin-name {
            font-weight: bold;
            color: #333;
        }
        .plugin-desc {
            font-size: 12px;
            color: #777;
            margin-top: 2px;
        }
        .plugin-version {
            font-size: 11px;
            color: #aaa;
        }
        .toggle-switch {
            position: relative;
            width: 44px;
            height: 24px;
            margin-left: 12px;
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
            background-color: #ccc;
            transition: .3s;
            border-radius: 24px;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
        }
        input:checked + .slider {
            background-color: #2196F3;
        }
        input:checked + .slider:before {
            transform: translateX(20px);
        }
        .close-btn {
            float: right;
            background: none;
            border: none;
            font-size: 20px;
            cursor: pointer;
            color: #999;
        }
        .footer-btns {
            margin-top: 16px;
            text-align: right;
        }
        .footer-btns button {
            margin-left: 8px;
            padding: 6px 14px;
            border: none;
            border-radius: 4px;
            background: #2196F3;
            color: #fff;
            cursor: pointer;
        }
    `);

	// ===== ESTADO LOCAL =====
	let manifest = [];
	let enabledPlugins = GM_getValue('enabledPlugins', {});

	// ===== FUNÇÕES DE CACHE E EXECUÇÃO =====
	function getCacheKey(pluginId) {
		return CACHE_PREFIX + pluginId;
	}

	async function fetchAndCachePlugin(plugin) {
		const url = REPO_RAW + plugin.file;
		return new Promise((resolve, reject) => {
			GM_xmlhttpRequest({
				method: 'GET',
				url: url,
				onload: function (response) {
					if (response.status === 200) {
						const code = response.responseText;
						// Salva código e versão no cache
						GM_setValue(getCacheKey(plugin.id), JSON.stringify({
							code: code,
							version: plugin.version
						}));
						resolve(code);
					} else {
						reject(new Error(`Erro ao baixar ${plugin.id}: status ${response.status}`));
					}
				},
				onerror: function (err) {
					reject(err);
				}
			});
		});
	}

	function getCachedPlugin(pluginId) {
		const raw = GM_getValue(getCacheKey(pluginId), null);
		if (!raw) return null;
		try {
			return JSON.parse(raw);
		} catch (e) {
			return null;
		}
	}

	function executePlugin(code, pluginId) {
		try {
			// Executa no escopo da sandbox do Tampermonkey (acesso a GM_*)
			eval(code);
		} catch (e) {
			console.error(`[MELI-HUB] Erro ao executar plugin ${pluginId}:`, e);
		}
	}

	async function ensurePluginReady(plugin) {
		const cached = getCachedPlugin(plugin.id);
		// Se não tiver cache ou versão diferente, baixa de novo
		if (!cached || cached.version !== plugin.version) {
			console.log(`[MELI-HUB] Atualizando plugin: ${plugin.name} (${plugin.version})`);
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
	}

	// ===== BUSCA DO MANIFEST =====
	async function fetchManifest() {
		try {
			const response = await fetch(MANIFEST_URL);
			if (!response.ok) throw new Error('Status ' + response.status);
			const data = await response.json();
			return data;
		} catch (err) {
			console.error('[MELI-HUB] Erro ao buscar manifest:', err);
			return [];
		}
	}

	// ===== UI DO MODAL =====
	function renderModal() {
		const modal = document.getElementById('meli-hub-modal');
		if (!modal) return;
		const listContainer = modal.querySelector('.plugin-list');
		listContainer.innerHTML = '';

		manifest.forEach(plugin => {
			const enabled = !!enabledPlugins[plugin.id];
			const item = document.createElement('div');
			item.className = 'plugin-item';
			item.innerHTML = `
                <div class="plugin-info">
                    <div class="plugin-name">${plugin.name}</div>
                    <div class="plugin-desc">${plugin.description}</div>
                    <div class="plugin-version">v${plugin.version}</div>
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
				if (this.checked) {
					// Ao ativar, já garante o cache e executa imediatamente?
					// Como a página já carregou, podemos executar de novo (cuidado com duplicatas)
					const plugin = manifest.find(p => p.id === pluginId);
					if (plugin) {
						try {
							await ensurePluginReady(plugin);
							const cached = getCachedPlugin(pluginId);
							if (cached && cached.code) {
								executePlugin(cached.code, pluginId);
							}
						} catch (err) {
							console.error(`[MELI-HUB] Erro ao ativar ${pluginId}:`, err);
						}
					}
				} else {
					// Desativar não remove código já injetado (limitação). Para simplicidade, o plugin para de ser executado apenas na próxima recarga.
				}
			});
			listContainer.appendChild(item);
		});
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
		// Botão flutuante
		const btn = document.createElement('button');
		btn.id = 'meli-hub-btn';
		btn.innerHTML = '⚙';
		btn.title = 'MELI HUB';
		btn.addEventListener('click', openModal);
		document.body.appendChild(btn);

		// Modal
		const modal = document.createElement('div');
		modal.id = 'meli-hub-modal';
		modal.innerHTML = `
            <div class="meli-hub-content">
                <button class="close-btn" id="meli-hub-close">&times;</button>
                <h2>🔌 MELI HUB - Plugins</h2>
                <div class="plugin-list"></div>
                <div class="footer-btns">
                    <button id="meli-hub-update-all">Atualizar todos</button>
                    <button id="meli-hub-close-bottom">Fechar</button>
                </div>
            </div>
        `;
		document.body.appendChild(modal);

		// Eventos de fechar
		modal.querySelector('#meli-hub-close').addEventListener('click', closeModal);
		modal.querySelector('#meli-hub-close-bottom').addEventListener('click', closeModal);
		modal.addEventListener('click', function (e) {
			if (e.target === modal) closeModal();
		});

		// Atualizar todos
		modal.querySelector('#meli-hub-update-all').addEventListener('click', async function () {
			for (const plugin of manifest) {
				if (enabledPlugins[plugin.id]) {
					try {
						await fetchAndCachePlugin(plugin); // força redownload
					} catch (e) {
						console.error(`[MELI-HUB] Erro ao atualizar ${plugin.id}:`, e);
					}
				}
			}
			alert('Plugins atualizados com sucesso!');
		});

		return modal;
	}

	// ===== INICIALIZAÇÃO =====
	async function init() {
		// Primeiro, busca o manifesto
		manifest = await fetchManifest();
		// Carrega e executa plugins habilitados
		await loadEnabledPlugins();

		// Aguarda o DOM para construir a UI
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', buildUI);
		} else {
			buildUI();
		}
	}

	init();

})();
