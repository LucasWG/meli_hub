// ==UserScript==
// @name         MELI HUB - Gerenciador de Scripts
// @namespace    https://github.com/LucasRepML/meli_hub
// @version      3.3.14
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
// @grant        GM_addValueChangeListener
// @connect      raw.githubusercontent.com
// @connect      github.com
// @connect      127.0.0.1
// @sandbox      JavaScript
// @run-at       document-start
// ==/UserScript==

(function () {
	'use strict';

	// ===== CONFIGURAÇÕES =====
	const HUB_VERSION = '3.3.14';
	const REPO_RAW = 'https://raw.githubusercontent.com/LucasRepML/meli_hub/main/';
	// const REPO_RAW = 'http://127.0.0.1:5500/';
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

	function gmGetJson(key, def) {
		const raw = GM_getValue(key, null);
		if (!raw) return def;
		if (typeof raw === 'object') return raw;
		try { return JSON.parse(raw); } catch (e) { return def; }
	}
	function gmSetJson(key, val) {
		GM_setValue(key, JSON.stringify(val));
	}

	// ===== ESTADO GLOBAL =====
	let manifestData = { hub_version: HUB_VERSION, plugins: [] };
	let enabledPlugins = gmGetJson('enabledPlugins', {});
	let pluginsMeta = gmGetJson('pluginsMeta', {});
	let activeToasts = [];
	let currentGreeting = '';
	let isHubOutdated = false;
	let fetchSeed = Date.now();

	// ===== UTILITÁRIOS =====
	function showToast(message, type = 'info', duration = 3500) {
		const container = document.getElementById('meli-toast-container');
		if (!container) return;

		const icons = {
			success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
			error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
			info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
		};

		const toast = document.createElement('div');
		toast.className = `meli-toast ${type}`;
		toast.innerHTML = `
			<div class="meli-toast-content">
				<div class="meli-toast-icon">${icons[type] || icons.info}</div>
				<div class="meli-toast-message">${message}</div>
				<button class="meli-toast-close" title="Fechar">✕</button>
			</div>
			<div class="meli-toast-progress">
				<div class="meli-toast-progress-bar" style="animation-duration: ${duration}ms;"></div>
			</div>
		`;

		const hideToast = () => {
			if (!toast.classList.contains('hiding')) {
				toast.classList.add('hiding');
				setTimeout(() => {
					if (toast.parentNode) toast.remove();
					const index = activeToasts.indexOf(toast);
					if (index > -1) activeToasts.splice(index, 1);
				}, 300);
			}
		};

		const closeBtn = toast.querySelector('.meli-toast-close');
		if (closeBtn) closeBtn.addEventListener('click', hideToast);

		container.appendChild(toast);
		activeToasts.push(toast);

		if (activeToasts.length > MAX_TOASTS) {
			const oldestToast = activeToasts.shift();
			oldestToast.classList.add('hiding');
			setTimeout(() => { if (oldestToast.parentNode) oldestToast.remove(); }, 300);
		}

		setTimeout(hideToast, duration);
	}

	unsafeWindow.MeliHub = unsafeWindow.MeliHub || {};
	unsafeWindow.MeliHub.showToast = showToast;

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
	function gmFetch(url, onProgress) {
		const cacheBusterUrl = url + (url.includes('?') ? '&' : '?') + 't=' + fetchSeed;

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
				onprogress: (e) => {
					if (onProgress && e.lengthComputable && e.total > 0) {
						onProgress((e.loaded / e.total) * 100);
					}
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

	// ===== EVENT BRIDGE =====
	window.addEventListener('meli-hub:add-style', (e) => {
		if (e.detail && e.detail.css) {
			GM_addStyle(e.detail.css);
		}
	});

	// ===== CORE & EXECUÇÃO =====
	function getCacheKey(pluginId) { return CACHE_PREFIX + pluginId; }
	function getMetaKey(pluginId) { return META_PREFIX + pluginId; }

	function getCachedPlugin(pluginId) {
		const raw = GM_getValue(getCacheKey(pluginId), null);
		if (!raw) return null;
		try { return JSON.parse(raw); } catch (e) { return null; }
	}

	function saveMeta(pluginId, version) {
		const meta = gmGetJson(getMetaKey(pluginId), {});
		meta.lastUpdated = Date.now();
		meta.version = version;
		gmSetJson(getMetaKey(pluginId), meta);
		pluginsMeta[pluginId] = meta;
	}

	function getMeta(pluginId) { return gmGetJson(getMetaKey(pluginId), null); }

	async function fetchAndCachePlugin(plugin, onProgress) {
		const path = plugin.file.includes('/') ? plugin.file : 'scripts/' + plugin.file;
		const url = REPO_RAW + path;
		const code = await gmFetch(url, onProgress);
		GM_setValue(getCacheKey(plugin.id), JSON.stringify({ code: code, version: plugin.version }));
		saveMeta(plugin.id, plugin.version);
		return code;
	}

	function executePlugin(code, pluginId) {
		try {
			GM_addElement('script', { id: 'meli-plugin-' + pluginId, textContent: code });
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

	async function loadEnabledPlugins(outdated = false) {
		if (!manifestData.plugins || !manifestData.plugins.length) return;
		for (const plugin of manifestData.plugins) {
			if (outdated && !plugin.run_when_outdated) continue;
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

	async function autoUpdateOutdatedPlugins() {
		// Atualiza todos os plugins que estão com versão diferente do manifest (novos ou desatualizados)
		const pluginsToUpdate = manifestData.plugins.filter(p => {
			const meta = getMeta(p.id);
			return !meta || meta.version !== p.version;
		});

		let updatedCount = 0;
		let reloadedNeeded = false;

		const updatePromises = pluginsToUpdate.map(async (plugin) => {
			const itemEl = document.getElementById(`plugin-item-${plugin.id}`);
			const ringEl = itemEl ? itemEl.querySelector('.plugin-progress-ring') : null;

			if (itemEl) itemEl.classList.add('updating');

			try {
				await fetchAndCachePlugin(plugin, (pct) => {
					if (ringEl) ringEl.style.setProperty('--progress', pct + '%');
				});
				updatedCount++;
				if (enabledPlugins[plugin.id] || plugin.required) {
					reloadedNeeded = true;
				}
			} catch (e) {
				console.error(`[MELI-HUB] Erro ao auto-atualizar ${plugin.id}:`, e);
			} finally {
				if (itemEl) {
					itemEl.classList.remove('updating');
					// Atualiza visualmente o status para "Em dia"
					const statusBadge = itemEl.querySelector('.status-badge');
					if (statusBadge) {
						statusBadge.className = 'status-badge status-updated';
						statusBadge.textContent = 'Em dia';
					}
					// Atualiza a data no DOM
					const meta = getMeta(plugin.id);
					const dateStr = meta && meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleString('pt-BR') : 'Nunca';
					const detailItems = itemEl.querySelectorAll('.detail-item');
					detailItems.forEach(el => {
						if (el.textContent.includes('Atualizado:')) {
							el.innerHTML = `Atualizado: <span>${dateStr}</span>`;
						}
					});

					reorderListWithAnimation();
				}
			}
		});

		await Promise.all(updatePromises);

		if (updatedCount > 0) {
			showToast(`${updatedCount} plugin(s) atualizado(s) em background!`, 'success');
			if (reloadedNeeded) {
				showToast(`Recarregando abas para aplicar atualizações...`, 'info');
				GM_setValue('meliHubForceReload', Date.now());
				setTimeout(() => window.location.reload(), 1500);
			}
		}
	}

	// ===== UI BUILDING =====
	function getPluginStatus(plugin) {
		const meta = getMeta(plugin.id);
		if (!meta) return 'new';
		if (meta.version === plugin.version) return 'updated';
		return 'pending';
	}

	function reorderListWithAnimation() {
		const listContainer = document.querySelector('.plugin-list');
		if (!listContainer) return;

		const items = Array.from(listContainer.children);
		if (items.length <= 1) return;

		// 1. First
		const firstPositions = new Map();
		items.forEach(item => {
			firstPositions.set(item.id, item.getBoundingClientRect().top);
		});

		// 2. Reorder in DOM
		items.sort((a, b) => {
			const idA = a.id.replace('plugin-item-', '');
			const idB = b.id.replace('plugin-item-', '');
			const metaA = getMeta(idA);
			const metaB = getMeta(idB);
			const timeA = metaA && metaA.lastUpdated ? metaA.lastUpdated : 0;
			const timeB = metaB && metaB.lastUpdated ? metaB.lastUpdated : 0;
			if (timeB !== timeA) return timeB - timeA;
			const enabledA = !!enabledPlugins[idA];
			const enabledB = !!enabledPlugins[idB];
			return (enabledB === enabledA) ? 0 : (enabledA ? -1 : 1);
		});

		items.forEach(item => listContainer.appendChild(item));

		// 3. Last & Invert
		items.forEach(item => {
			const firstTop = firstPositions.get(item.id);
			const lastTop = item.getBoundingClientRect().top;
			const deltaY = firstTop - lastTop;

			if (deltaY !== 0) {
				item.style.transition = 'none';
				item.style.transform = `translateY(${deltaY}px)`;
			}
		});

		// 4. Play
		requestAnimationFrame(() => {
			listContainer.offsetHeight; // force reflow
			items.forEach(item => {
				item.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
				item.style.transform = '';
			});
			setTimeout(() => {
				items.forEach(item => {
					if (item.style.transform === '') item.style.transition = '';
				});
			}, 400);
		});
	}

	function renderModal() {
		const modal = document.getElementById('meli-hub-modal');
		if (!modal) return;
		const listContainer = modal.querySelector('.plugin-list');

		const optionalPlugins = manifestData.plugins.filter(p => !p.required);
		optionalPlugins.sort((a, b) => {
			const metaA = getMeta(a.id);
			const metaB = getMeta(b.id);
			const timeA = metaA && metaA.lastUpdated ? metaA.lastUpdated : 0;
			const timeB = metaB && metaB.lastUpdated ? metaB.lastUpdated : 0;
			if (timeB !== timeA) return timeB - timeA;
			const enabledA = !!enabledPlugins[a.id];
			const enabledB = !!enabledPlugins[b.id];
			return (enabledB === enabledA) ? 0 : (enabledA ? -1 : 1);
		});

		const activeCount = optionalPlugins.filter(p => enabledPlugins[p.id]).length;

		listContainer.innerHTML = '';

		optionalPlugins.forEach(plugin => {
			const enabled = !!enabledPlugins[plugin.id];
			const status = getPluginStatus(plugin);
			const meta = getMeta(plugin.id);
			const statusText = status === 'updated' ? 'Em dia' : (status === 'new' ? 'Novo' : 'Atualizar');
			const lastUpdated = meta && meta.lastUpdated ? new Date(meta.lastUpdated).toLocaleString('pt-BR') : 'Nunca';
			const initial = plugin.icon || plugin.name.charAt(0).toUpperCase();

			const item = document.createElement('div');
			item.className = 'plugin-item' + ((isHubOutdated && !plugin.run_when_outdated) ? ' disabled' : '');
			item.id = `plugin-item-${plugin.id}`;
			item.innerHTML = `
					<div class="plugin-icon-container">
						<div class="plugin-progress-ring"></div>
						<div class="plugin-icon">${initial}</div>
					</div>
					<div class="plugin-info">
						<div class="plugin-name">
							${plugin.name}
							<span class="status-badge status-${status}">${statusText}</span>
						</div>
						<div class="plugin-desc">${plugin.description}</div>
						<div class="plugin-details">
							<div class="detail-item">Versão: <span>v${plugin.version}</span></div>
							<div class="detail-item">Atualizado: <span>${lastUpdated}</span></div>
						</div>
					</div>
					<div class="plugin-action">
						<label class="toggle-switch" title="${enabled ? 'Desativar' : 'Ativar'} Plugin">
							<input type="checkbox" class="plugin-toggle" data-plugin-id="${plugin.id}" ${enabled ? 'checked' : ''}>
							<span class="slider"></span>
						</label>
					</div>
				`;

			const checkbox = item.querySelector('input[type=checkbox]');
			checkbox.addEventListener('change', async function (e) {
				if (isHubOutdated && !plugin.run_when_outdated) {
					e.preventDefault();
					this.checked = !this.checked;
					showToast('Plugin bloqueado até a atualização do Hub.', 'error');
					return;
				}
				const pluginId = this.dataset.pluginId;
				enabledPlugins[pluginId] = this.checked;
				gmSetJson('enabledPlugins', enabledPlugins);

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
					const scriptEl = document.getElementById('meli-plugin-' + pluginId);
					if (scriptEl) scriptEl.remove();
					window.dispatchEvent(new CustomEvent('meli-hub:plugin-disabled', { detail: { pluginId: pluginId } }));
					showToast(`Plugin desativado`, 'info');
				}
				renderModal();
			});
			listContainer.appendChild(item);
		});

		const subtitle = modal.querySelector('.meli-hub-subtitle');
		if (subtitle) {
			const displayGreeting = currentGreeting || getRandomGreeting(getUserName());

			const savedState = gmGetJson('savedEnabledPlugins', null);
			const btnState = isHubOutdated ? 'disabled style="opacity: 0.5; cursor: not-allowed; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--ml-border); background: var(--ml-white); font-size: 13px; color: var(--ml-text-main);"' : 'style="padding: 4px 10px; border-radius: 4px; border: 1px solid var(--ml-border); background: var(--ml-white); cursor: pointer; font-size: 13px; color: var(--ml-text-main); transition: all 0.2s;"';
			const btnStateRestore = isHubOutdated ? 'disabled style="opacity: 0.5; cursor: not-allowed; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--ml-blue); background: rgba(52,131,250,0.1); font-size: 13px; color: var(--ml-blue); font-weight: 600;"' : 'style="padding: 4px 10px; border-radius: 4px; border: 1px solid var(--ml-blue); background: rgba(52,131,250,0.1); cursor: pointer; font-size: 13px; color: var(--ml-blue); font-weight: 600; transition: all 0.2s;"';

			let toggleBtnHtml = '';
			if (activeCount > 0) {
				toggleBtnHtml = `<button id="meli-hub-toggle-all" class="action-btn" ${btnState}>Desativar Todos</button>`;
			} else if (savedState && Object.keys(savedState).length > 0) {
				toggleBtnHtml = `<button id="meli-hub-toggle-all" class="action-btn" ${btnStateRestore}>Restaurar Ativos</button>`;
			}

			subtitle.innerHTML = `
					<span>${displayGreeting}</span>
					<div style="display: flex; gap: 12px; align-items: center;">
						${toggleBtnHtml}
						<strong>${activeCount} ativos</strong>
					</div>
				`;

			const toggleBtn = subtitle.querySelector('#meli-hub-toggle-all');
			if (toggleBtn) {
				toggleBtn.addEventListener('click', async () => {
					if (isHubOutdated) return;

					if (activeCount > 0) {
						gmSetJson('savedEnabledPlugins', enabledPlugins);
						optionalPlugins.forEach(p => {
							if (enabledPlugins[p.id]) {
								enabledPlugins[p.id] = false;
								const scriptEl = document.getElementById('meli-plugin-' + p.id);
								if (scriptEl) scriptEl.remove();
								window.dispatchEvent(new CustomEvent('meli-hub:plugin-disabled', { detail: { pluginId: p.id } }));
							}
						});
						gmSetJson('enabledPlugins', enabledPlugins);
						showToast('Todos os plugins foram desativados', 'info');
					} else {
						const stateToRestore = gmGetJson('savedEnabledPlugins', {});
						for (const p of optionalPlugins) {
							if (stateToRestore[p.id]) {
								enabledPlugins[p.id] = true;
								try {
									await ensurePluginReady(p);
									const cached = getCachedPlugin(p.id);
									if (cached && cached.code) executePlugin(cached.code, p.id);
								} catch (err) { }
							}
						}
						gmSetJson('enabledPlugins', enabledPlugins);
						gmSetJson('savedEnabledPlugins', null);
						showToast('Plugins restaurados com sucesso', 'success');
					}
					renderModal();
				});
			}
		}

		// Atualiza botões do footer se houver atualização pendente para o Hub
		const updateBtn = modal.querySelector('#meli-hub-update-hub');
		const footer = modal.querySelector('#meli-hub-footer');
		const headerTitle = modal.querySelector('.meli-hub-header h2');

		if (updateBtn && footer && headerTitle) {
			const hasHubUpdate = compareVersions(manifestData.hub_version || HUB_VERSION, HUB_VERSION) > 0;
			footer.style.display = hasHubUpdate ? 'flex' : 'none';

			const versionHtml = hasHubUpdate
				? `<span class="meli-hub-version old-version">v${HUB_VERSION}</span>
				   <span class="meli-hub-version new-version">v${manifestData.hub_version}</span>`
				: `<span class="meli-hub-version">v${HUB_VERSION}</span>`;
			headerTitle.innerHTML = `
				<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 12l10 5 10-5"></path><path d="M2 17l10 5 10-5"></path></svg>
				MELI HUB ${versionHtml}
			`;
		}
	}

	function openModal() {
		fetchSeed = Date.now();
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
			fetchManifest().then(data => {
				manifestData = data;

				const hasHubUpdate = compareVersions(manifestData.hub_version || HUB_VERSION, HUB_VERSION) > 0;
				if (hasHubUpdate && !isHubOutdated) {
					isHubOutdated = true;
					showToast('Atualização obrigatória do MELI HUB disponível!', 'info');
				}

				renderModal();
				autoUpdateOutdatedPlugins();
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
					<div class="meli-hub-footer" id="meli-hub-footer" style="display:none;">
						<div class="footer-btns">
							<button id="meli-hub-update-hub" class="action">🚀 Atualizar Hub</button>
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
			showToast('Instale a atualização na nova aba e recarregue a página.', 'info', 6000);
			GM_openInTab(HUB_SCRIPT_URL + '?t=' + Date.now(), { active: true });
		});
	}

	async function fetchManifest() {
		try {
			const responseText = await gmFetch(MANIFEST_URL);
			const data = JSON.parse(responseText);

			let finalData = data;
			// Compatibilidade com manifest antigo (array) para novo (objeto)
			if (Array.isArray(data)) {
				finalData = { hub_version: HUB_VERSION, plugins: data };
			}
			gmSetJson('cached_manifest', finalData);
			return finalData;
		} catch (err) {
			console.error('[MELI-HUB] Erro ao buscar manifest:', err);
			const cached = gmGetJson('cached_manifest', null);
			if (cached && cached.plugins) {
				console.warn('[MELI-HUB] Usando backup do manifest local.');
				return cached;
			}
			return { hub_version: HUB_VERSION, plugins: [] };
		}
	}

	// ===== INIT =====
	async function init() {
		manifestData = await fetchManifest();

		whenBody(() => {
			GM_addValueChangeListener('meliHubForceReload', (key, oldValue, newValue, remote) => {
				if (remote) window.location.reload();
			});
			GM_addValueChangeListener('installed_hub_version', (key, oldValue, newValue, remote) => {
				if (remote) {
					try {
						const parsed = JSON.parse(newValue);
						if (parsed && parsed !== HUB_VERSION) window.location.reload();
					} catch (e) { }
				}
			});
			gmSetJson('installed_hub_version', HUB_VERSION);

			injectRouteInterceptor();
			buildUI();

			const isFirstRun = !GM_getValue('firstRunDone', false);

			if (isFirstRun) {
				// Lógica da primeira vez
				setTimeout(async () => {
					const userName = await getAsyncUserName();
					openModal();
					showToast(getRandomGreeting(userName), 'success', 6000);
					// updateAllEnabledPlugins(false).then(() => {
					// 	renderModal();
					// });
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


			}

			if (isHubOutdated) {
				showToast('Plugins bloqueados até a atualização do Hub.', 'error', 5000);
			}
			loadEnabledPlugins(isHubOutdated);
		});
	}

	init();

})();
