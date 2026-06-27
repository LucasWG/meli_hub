(function () {
	// Versão: v1.2.1
	'use strict';

	if (window.MeliToolsBatchInit) return;
	window.MeliToolsBatchInit = true;

	const Batch = {
		STATUS_OPTIONS: [
			'Aguardando boletim de ocorrência', 'Aguardando documentação fiscal',
			'Aguardando documentação obrigatória por parte do seller', 'Buffered',
			'Confiscado', 'Entregue', 'Entrou em uma estação errada', 'Faltante',
			'Multiguía', 'No regulamento de sinistros por roubo', 'Para despachar',
			'Para devolver', 'Para solução de problemas', 'Perdido',
			'Pertence a outra área', 'Roubado'
		],
		STORAGE_KEY: 'mt_batch_queue',
		isRouteActive: false,
		currentPackageId: '',

		init: function () {
			this.injectCSS();
			
			this._keyHandler = (e) => {
				if (e.altKey && e.key.toLowerCase() === 'q') {
					e.preventDefault();
					this.toggleModal();
				}
			};
			document.addEventListener('keydown', this._keyHandler);
			
			this.checkRoute(location.href);

			this.processQueue();
			
			this._routeHandler = (e) => {
				this.checkRoute(e.detail.url);
				setTimeout(() => this.processQueue(), 1000);
			};
			window.addEventListener('meli-hub:route-change', this._routeHandler);

			window.addEventListener('meli-hub:plugin-disabled', (e) => {
				if (e.detail && e.detail.pluginId === 'mt_batch_processor') {
					this.destroy();
				}
			});
		},

		destroy: function () {
			const modal = document.getElementById('mt-batch-modal');
			if (modal) modal.remove();
			const hud = document.getElementById('mt-progress-hud');
			if (hud) hud.remove();
			
			document.removeEventListener('keydown', this._keyHandler);
			window.removeEventListener('meli-hub:route-change', this._routeHandler);
			window.MeliToolsBatchInit = false;
		},

		allowedRoutes: [
			'*/logistics/package-management/package/*'
		],

		matchRoute: function (url, pattern) {
			if (pattern === '*') return true;
			const regex = new RegExp('^' + pattern.replace(/[.+?^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\*/g, '.*') + '$', 'i');
			return regex.test(url) || url.includes(pattern.replace(/\*/g, ''));
		},

		checkRoute: function (url) {
			if (this.allowedRoutes.some(p => this.matchRoute(url, p))) {
				this.isRouteActive = true;
				try {
					const urlObj = new URL(url);
					this.currentPackageId = urlObj.pathname.includes('/package/') ? urlObj.pathname.split('/').pop() : '';
				} catch (e) {
					this.currentPackageId = url.includes('/package/') ? url.split('/').pop() : '';
				}
				console.log(`[Batch Processor] Ativo (Rota Permitida). Package ID: ${this.currentPackageId || 'N/A'}`);
			} else {
				this.isRouteActive = false;
				this.currentPackageId = '';
			}
		},

		injectCSS: function () {
			const style = document.createElement('style');
			style.textContent = `
                .mt-modal-overlay { position: fixed; inset: 0; background: rgba(17,24,39,0.6); backdrop-filter: blur(4px); z-index: 9999999; display: flex; align-items: center; justify-content: center; font-family: var(--ml-font); }
                .mt-modal-box { background: var(--ml-white); width: 90%; max-width: 600px; border-radius: 16px; box-shadow: var(--ml-shadow-lg); border: 1px solid var(--ml-border); overflow: hidden; }
                .mt-modal-header { padding: 20px 24px; background: var(--ml-bg); border-bottom: 1px solid var(--ml-border); display: flex; justify-content: space-between; align-items: center; }
                .mt-modal-header h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--ml-text-main); }
                .mt-modal-close { background: none; border: none; font-size: 28px; cursor: pointer; color: var(--ml-text-light); line-height: 1; }
                .mt-modal-close:hover { color: var(--ml-text-main); }
                .mt-modal-body { padding: 24px; display: flex; flex-direction: column; gap: 20px; }
                .mt-textarea { width: 100%; height: 160px; padding: 12px; border: 2px solid var(--ml-border); border-radius: 8px; font-family: monospace; resize: vertical; box-sizing: border-box; font-size: 14px; }
                .mt-textarea:focus { border-color: var(--ml-blue); outline: none; }
                .mt-select { width: 100%; padding: 14px; border: 2px solid var(--ml-border); border-radius: 8px; font-size: 15px; background: var(--ml-white); }
                .mt-btn-submit { width: 100%; padding: 16px; border: none; border-radius: 8px; background: var(--ml-blue); color: var(--ml-white); font-size: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; }
                .mt-btn-submit:hover { background: var(--ml-blue-hover); }
                .mt-progress-hud { position: fixed; bottom: 24px; right: 24px; background: var(--ml-white); padding: 20px; border-radius: 12px; box-shadow: var(--ml-shadow-lg); z-index: 9999999; width: 320px; font-family: var(--ml-font); border: 1px solid var(--ml-border); }
                .mt-stealth-active .mt-modal-overlay, .mt-stealth-active .mt-progress-hud { display: none !important; }
            `;
			document.head.appendChild(style);
		},

		toggleModal: function () {
			const existing = document.getElementById('mt-batch-modal');
			if (existing) existing.remove();
			else this.createModal();
		},

		createModal: function () {
			const overlay = document.createElement('div');
			overlay.id = 'mt-batch-modal';
			overlay.className = 'mt-modal-overlay';

			overlay.innerHTML = `
                <div class="mt-modal-box">
                    <div class="mt-modal-header">
                        <h2>📦 Processamento em Lote</h2>
                        <button class="mt-modal-close">&times;</button>
                    </div>
                    <div class="mt-modal-body">
                        <div>
                            <label style="display:block; font-weight:600; color:var(--ml-text-muted); margin-bottom:8px;">IDs dos Pacotes (um por linha)</label>
                            <textarea id="mt-batch-ids" class="mt-textarea" placeholder="Ex:&#10;46728965867&#10;46728965868"></textarea>
                        </div>
                        <div>
                            <label style="display:block; font-weight:600; color:var(--ml-text-muted); margin-bottom:8px;">Ação Desejada</label>
                            <select id="mt-batch-status" class="mt-select">
                                <option value="VERIFY">🔍 APENAS VERIFICAR STATUS (Rápido/Background)</option>
                                <optgroup label="Forçar Alteração de Status:">
                                    ${this.STATUS_OPTIONS.map(s => `<option value="${s}">${s}</option>`).join('')}
                                </optgroup>
                            </select>
                        </div>
                        <button id="mt-batch-start" class="mt-btn-submit">🚀 Iniciar Processamento</button>
                    </div>
                </div>
            `;
			document.body.appendChild(overlay);

			overlay.querySelector('.mt-modal-close').onclick = () => overlay.remove();
			overlay.querySelector('#mt-batch-start').onclick = () => {
				const idsText = overlay.querySelector('#mt-batch-ids').value;
				const ids = (idsText.match(/\b\d{11}\b/g) || []).filter((v, i, a) => a.indexOf(v) === i);
				const status = overlay.querySelector('#mt-batch-status').value;

				if (ids.length === 0) return alert('Nenhum ID válido (11 dígitos) encontrado.');

				if (status === 'VERIFY') {
					overlay.remove();
					this.runVerificationOnly(ids);
				} else {
					sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify({ ids, targetStatus: status, currentIndex: 0, logs: [] }));
					overlay.remove();
					this.processQueue();
				}
			};
		},

		runVerificationOnly: async function (ids) {
			this.showProgress(0, ids.length, 'Iniciando verificação...');
			let logs = [];

			for (let i = 0; i < ids.length; i++) {
				const id = ids[i];
				this.showProgress(i, ids.length, `Verificando: ${id}`);

				try {
					const res = await fetch(`https://envios.adminml.com/logistics/package-management/package/${id}`);
					const html = await res.text();
					const doc = new DOMParser().parseFromString(html, 'text/html');

					let status = 'Desconhecido';
					const input = doc.querySelector('.package-status-input--status input');
					if (input && input.value) status = input.value;
					else {
						const display = doc.querySelector('.package-status-input--status .andes-dropdown__display-values, .package-status-input--status button');
						if (display) status = display.textContent.trim();
					}
					logs.push({ id, status });
				} catch (e) {
					logs.push({ id, status: 'Erro de conexão' });
				}
				await new Promise(r => setTimeout(r, 400));
			}

			this.hideProgress();
			this.showReport(logs, '🔍 Relatório de Verificação');
		},

		processQueue: async function () {
			const dataStr = sessionStorage.getItem(this.STORAGE_KEY);
			if (!dataStr) return;
			const data = JSON.parse(dataStr);

			if (data.currentIndex >= data.ids.length) {
				sessionStorage.removeItem(this.STORAGE_KEY);
				this.hideProgress();
				this.showReport(data.logs, '📊 Relatório de Alteração');
				return;
			}

			const currentId = data.ids[data.currentIndex];
			this.showProgress(data.currentIndex, data.ids.length, `Alterando: ${currentId}`);

			const currentUrl = window.location.href;
			if (!currentUrl.includes(currentId)) {
				window.location.href = `https://envios.adminml.com/logistics/package-management/package/${currentId}`;
				return;
			}

			await new Promise(r => setTimeout(r, 2500)); // Espera React renderizar

			try {
				const trigger = document.querySelector('.package-status-input--status .andes-dropdown__trigger, .package-status-input--status button');
				if (!trigger) throw new Error("Dropdown não encontrado na página.");
				trigger.click();

				await new Promise(r => setTimeout(r, 800));
				const options = Array.from(document.querySelectorAll('[role="option"]'));
				const targetOpt = options.find(o => o.textContent.trim().includes(data.targetStatus));

				if (!targetOpt) throw new Error(`Status '${data.targetStatus}' bloqueado/indisponível.`);
				targetOpt.click();

				await new Promise(r => setTimeout(r, 800));
				const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Salvar' && !b.disabled);

				if (!saveBtn) throw new Error("Botão 'Salvar' não ficou habilitado.");
				saveBtn.click();

				await new Promise(r => setTimeout(r, 1500));
				data.logs.push({ id: currentId, status: `Alterado para ${data.targetStatus}` });
			} catch (e) {
				data.logs.push({ id: currentId, status: `Falha: ${e.message}` });
			}

			data.currentIndex++;
			sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
			window.location.reload(); // Força recarregar para ir pro próximo com DOM limpo
		},

		showProgress: function (current, total, text) {
			let prog = document.getElementById('mt-batch-progress');
			if (!prog) {
				prog = document.createElement('div');
				prog.id = 'mt-batch-progress';
				prog.className = 'mt-progress-hud';
				document.body.appendChild(prog);
			}
			const pct = total === 0 ? 0 : Math.round((current / total) * 100);
			prog.innerHTML = `
                <div style="font-weight:600; color:#111827; margin-bottom:8px;">Processamento em Lote</div>
                <div style="font-size:13px; color:#6b7280; margin-bottom:12px;">${text} (${current}/${total})</div>
                <div style="height:6px; background:#f3f4f6; border-radius:3px; overflow:hidden;">
                    <div style="height:100%; width:${pct}%; background:#2563eb; transition:0.3s;"></div>
                </div>
                <button id="mt-batch-cancel" style="margin-top:16px; width:100%; padding:8px; border:1px solid #fecaca; background:#fef2f2; color:#dc2626; border-radius:6px; cursor:pointer; font-weight:600;">Cancelar Fila</button>
            `;
			prog.querySelector('#mt-batch-cancel').onclick = () => {
				sessionStorage.removeItem(this.STORAGE_KEY);
				prog.remove();
				alert('Processamento cancelado pelo usuário.');
			};
		},

		hideProgress: function () {
			const prog = document.getElementById('mt-batch-progress');
			if (prog) prog.remove();
		},

		showReport: function (logs, title) {
			const overlay = document.createElement('div');
			overlay.className = 'mt-modal-overlay';

			const logHtml = logs.map(l => `
                <div style="padding:8px; border-bottom:1px solid #e5e7eb; font-size:13px; display:flex; justify-content:space-between;">
                    <span style="font-family:monospace; font-weight:600;">${l.id}</span>
                    <span style="color:${l.status.includes('Falha') || l.status.includes('Erro') ? '#dc2626' : '#059669'};">${l.status}</span>
                </div>
            `).join('');

			overlay.innerHTML = `
                <div class="mt-modal-box">
                    <div class="mt-modal-header"><h2>${title}</h2><button class="mt-modal-close">&times;</button></div>
                    <div class="mt-modal-body">
                        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px;">
                            ${logHtml}
                        </div>
                        <button id="mt-report-close" class="mt-btn-submit">Fechar Relatório</button>
                    </div>
                </div>
            `;
			document.body.appendChild(overlay);
			overlay.querySelector('.mt-modal-close').onclick = () => overlay.remove();
			overlay.querySelector('#mt-report-close').onclick = () => overlay.remove();
		}
	};

	Batch.init();

})();
