(function () {
	// ===== [MeGaMente] MONITOR LAST MILE — MULTI ESTAÇÕES =====
	// Criado por: Geraldo | Compartilhado por: Carlinhos (Mega Mente)
	// Versão: v1.4.4 (base: v11.19)
	// Guard clause: remove se já existir
	if (document.getElementById('mlmp_multi')) {
		document.getElementById('mlmp_multi').remove();
		return;
	}

	const ALLOWED_ROUTES = [
		'*'
	];

	let isRouteActive = false;

	function matchRoute(url, pattern) {
		if (pattern === '*') return true;
		const regex = new RegExp('^' + pattern.replace(/[.+?^${}()|[\\]\\\\]/g, '\\\\$&').replace(/\*/g, '.*') + '$', 'i');
		return regex.test(url) || url.includes(pattern.replace(/\*/g, ''));
	}

	function checkRoute(url) {
		isRouteActive = ALLOWED_ROUTES.some(p => matchRoute(url, p));
		if (isRouteActive) {
			console.log(`[MLM Multi] Ativo (Rota Permitida).`);
		}
	}

	checkRoute(location.href);
	window.addEventListener('meli-hub:route-change', function (e) {
		checkRoute(e.detail.url);
	});

	document.addEventListener('keydown', function(e) {
		if (e.altKey && e.key.toLowerCase() === 'm') {
			e.preventDefault();
			var panel = document.getElementById('mlmp_multi');
			if (panel) {
				var isHidden = panel.style.display === 'none';
				panel.style.display = isHidden ? 'flex' : 'none';
				localStorage.setItem('mlm_multi_modal_visible', isHidden ? 'true' : 'false');
			}
		}
	});

	// ===== CORES E FONTES GLOBAIS =====
	var S = {
		bg: 'var(--ml-bg)',
		sf: 'var(--ml-white)',
		sf2: 'var(--ml-bg)',
		bd: 'var(--ml-border)',
		ac: 'var(--ml-blue)',
		ac2: 'var(--ml-yellow)',
		ok: 'var(--ml-green)',
		wn: '#ffab40', // warning color specific to this plugin if needed, or use yellow
		er: 'var(--ml-red)',
		tx: 'var(--ml-text-main)',
		mt: 'var(--ml-text-muted)',
		pu: 'var(--ml-blue-hover)'
	};
	var mn = "var(--ml-font)";

	// ===== CASCA EXTERNA: PAINEL MULTI-ESTAÇÃO =====
	var outerPanel = document.createElement('div');
	outerPanel.id = 'mlmp_multi';
	
	var savedVisibility = localStorage.getItem('mlm_multi_modal_visible');
	var initialDisplay = savedVisibility === 'true' ? 'flex' : 'none';
	
	outerPanel.style.cssText = 'position:fixed;top:16px;right:16px;width:1080px;max-height:92vh;background:' + S.bg + ';border:1px solid ' + S.bd + ';border-radius:12px;z-index:999999;box-shadow:0 24px 80px rgba(0,0,0,.9);display:' + initialDisplay + ';flex-direction:column;font-size:13px;color:' + S.tx + ';overflow:hidden;font-family:sans-serif';

	// --- HEADER GLOBAL ---
	var outerHdr = document.createElement('div');
	outerHdr.style.cssText = 'background:' + S.sf + ';border-bottom:1px solid ' + S.bd + ';padding:9px 14px;display:flex;align-items:center;justify-content:space-between;cursor:move;user-select:none;flex-shrink:0';
	outerHdr.innerHTML = '<div style="display:flex;align-items:center;gap:10px"><div style="width:9px;height:9px;border-radius:50%;background:' + S.ac + ';box-shadow:0 0 8px ' + S.ac + '"></div><div><div style="font-weight:600;font-size:13px;letter-spacing:.5px">[MeGaMente] MONITOR LAST MILE <span style="color:' + S.ac + ';font-size:11px">MULTI ESTAÇÕES</span></div><div style="font-size:10px;color:' + S.mt + ';font-family:' + mn + '">Criado por Geraldo, compartilhado por Carlinhos (Mega Mente)</div></div></div><div style="display:flex;align-items:center;gap:4px"><span id="mlmm_ts" style="font-family:' + mn + ';font-size:10px;color:' + S.mt + ';margin-right:6px">--</span><button id="mlmm_min" title="Minimizar" style="background:transparent;border:1px solid ' + S.bd + ';color:#ffab40;width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:13px;line-height:1">&#8212;</button><button id="mlmm_max" title="Maximizar" style="background:transparent;border:1px solid ' + S.bd + ';color:#00d4ff;width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:13px;line-height:1">&#9643;</button><button id="mlmm_close" style="background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:14px;line-height:1">&#10005;</button></div>';

	// --- TOOLBAR GLOBAL ---
	var outerCtrl = document.createElement('div');
	outerCtrl.style.cssText = 'padding:8px 14px;background:' + S.sf + ';border-bottom:1px solid ' + S.bd + ';display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex-shrink:0';

	var sideToggleBtn = document.createElement('button');
	sideToggleBtn.title = 'Mostrar/ocultar lista de estações';
	sideToggleBtn.style.cssText = 'background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:14px;line-height:1;flex-shrink:0';
	sideToggleBtn.innerHTML = '&#9776;';

	var stationsLbl = document.createElement('span');
	stationsLbl.style.cssText = 'font-family:' + mn + ';font-size:10px;color:' + S.mt;
	stationsLbl.textContent = 'Estações:';

	var stationsInput = document.createElement('input');
	stationsInput.placeholder = 'SSP22, GRSB1, ...';
	stationsInput.title = 'Códigos de estação separados por vírgula';
	stationsInput.style.cssText = 'background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.tx + ';padding:4px 10px;border-radius:4px;font-family:' + mn + ';font-size:11px;width:200px';

	var btnBuscarTudo = document.createElement('button');
	btnBuscarTudo.style.cssText = 'background:' + S.ac + ';color:#000;border:none;padding:5px 16px;border-radius:4px;font-family:' + mn + ';font-size:11px;font-weight:600;cursor:pointer';
	btnBuscarTudo.innerHTML = '&#9654; BUSCAR TUDO';

	var outerStatusEl = document.createElement('span');
	outerStatusEl.style.cssText = 'font-family:' + mn + ';font-size:10px;color:' + S.mt + ';margin-left:auto';
	outerStatusEl.id = 'mlmm_status';
	outerStatusEl.textContent = 'Aguardando';

	[sideToggleBtn, stationsLbl, stationsInput, btnBuscarTudo, outerStatusEl].forEach(function (e) {
		outerCtrl.appendChild(e);
	});

	// --- CORPO: SIDEBAR + ÁREA PRINCIPAL ---
	var outerBody = document.createElement('div');
	outerBody.style.cssText = 'display:flex;flex:1;overflow:hidden;min-height:0';

	// SIDEBAR
	var sidebar = document.createElement('div');
	sidebar.id = 'mlmm_sidebar';
	sidebar.style.cssText = 'width:120px;min-width:120px;background:' + S.sf + ';border-right:1px solid ' + S.bd + ';display:flex;flex-direction:column;flex-shrink:0;overflow:hidden;transition:width .15s,min-width .15s';

	var sideHdr = document.createElement('div');
	sideHdr.style.cssText = 'padding:6px 10px;font-family:' + mn + ';font-size:9px;font-weight:600;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid ' + S.bd + ';flex-shrink:0';
	sideHdr.textContent = 'Estações';

	var sideList = document.createElement('div');
	sideList.id = 'mlmm_sidelist';
	sideList.style.cssText = 'flex:1;overflow-y:auto';

	var sideFoot = document.createElement('div');
	sideFoot.id = 'mlmm_sidefoot';
	sideFoot.style.cssText = 'padding:7px 10px;border-top:1px solid ' + S.bd + ';font-family:' + mn + ';font-size:10px;color:' + S.mt + ';flex-shrink:0;display:none';

	[sideHdr, sideList, sideFoot].forEach(function (e) {
		sidebar.appendChild(e);
	});

	// ÁREA PRINCIPAL (onde cada estação renderiza)
	var mainArea = document.createElement('div');
	mainArea.id = 'mlmm_main';
	mainArea.style.cssText = 'flex:1;overflow:hidden;display:flex;flex-direction:column;min-width:0';
	mainArea.innerHTML = '<div style="padding:48px;text-align:center;color:' + S.mt + ';font-family:' + mn + ';font-size:12px">Digite os códigos das estações e clique em BUSCAR TUDO</div>';

	outerBody.appendChild(sidebar);
	outerBody.appendChild(mainArea);

	[outerHdr, outerCtrl, outerBody].forEach(function (e) {
		outerPanel.appendChild(e);
	});
	document.body.appendChild(outerPanel);

	// ===== DRAG =====
	var drag = false,
		ox = 0,
		oy = 0;
	outerHdr.addEventListener('mousedown', function (e) {
		if (e.target.id === 'mlmm_close' || e.target.id === 'mlmm_min' || e.target.id === 'mlmm_max') return;
		drag = true;
		ox = e.clientX - outerPanel.offsetLeft;
		oy = e.clientY - outerPanel.offsetTop;
	});
	document.addEventListener('mousemove', function (e) {
		if (drag) {
			outerPanel.style.left = (e.clientX - ox) + 'px';
			outerPanel.style.top = (e.clientY - oy) + 'px';
			outerPanel.style.right = 'auto';
		}
	});
	document.addEventListener('mouseup', function () {
		drag = false;
	});

	// ===== FECHAR =====
	document.getElementById('mlmm_close').onclick = function () {
		outerPanel.style.display = 'none';
		localStorage.setItem('mlm_multi_modal_visible', 'false');
	};

	// ===== EASTER EGG — KANGU =====
	(function () {
		var _eeSecret = 'KANGU',
			_eeTyped = '',
			_eeActive = false;
		var _eeOverlay = document.createElement('div');
		_eeOverlay.style.cssText = 'position:fixed;inset:0;background:#060e1a;z-index:9999999;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.4s;overflow:hidden;font-family:sans-serif';
		_eeOverlay.innerHTML = (function () {
			var s = '';
			// Estrelas
			s += '<div id="mlmee_stars" style="position:absolute;inset:0;overflow:hidden"></div>';
			// Headline
			s += '<div id="mlmee_title" style="font-size:22px;font-weight:700;color:#e2e8f0;text-align:center;line-height:1.5;z-index:2;opacity:0;transform:translateY(-20px);transition:all 0.6s cubic-bezier(.34,1.56,.64,1) 0.2s">';
			s += '<span style="color:#ffab40">Kangu</span> &amp; <span style="color:#ffe600">Mercado Livre</span><br>o melhor está chegando!</div>';
			// Cena da estrada
			s += '<div style="position:relative;width:100%;height:140px;margin:12px 0;z-index:2;overflow:hidden">';
			// Céu
			s += '<div style="position:absolute;top:0;left:0;right:0;height:80px;background:#0a1628">';
			s += '<div class="mlmee_cloud" style="position:absolute;top:12px;background:rgba(255,255,255,0.05);border-radius:20px;width:56px;height:16px;animation:mlmeeCloud 9s linear infinite"></div>';
			s += '<div class="mlmee_cloud" style="position:absolute;top:28px;background:rgba(255,255,255,0.05);border-radius:20px;width:38px;height:12px;animation:mlmeeCloud 13s linear infinite -5s"></div>';
			s += '</div>';
			// VUC
			s += '<div id="mlmee_vuc" style="position:absolute;bottom:42px;left:-340px;z-index:5">';
			s += '<div style="position:absolute;bottom:10px;left:-8px"><div class="mlmee_smoke"></div><div class="mlmee_smoke" style="animation-delay:0.23s"></div><div class="mlmee_smoke" style="animation-delay:0.46s"></div></div>';
			s += '<svg width="190" height="88" viewBox="0 0 190 88" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="10" width="130" height="55" rx="4" fill="#ffe600"/><rect x="134" y="26" width="48" height="39" rx="3" fill="#ffe600"/><rect x="138" y="30" width="28" height="18" rx="2" fill="#b3d4f5"/><rect x="138" y="30" width="28" height="18" rx="2" fill="none" stroke="#1a6abf" stroke-width="1"/><rect x="12" y="18" width="114" height="36" rx="3" fill="#1a6abf"/><text x="69" y="44" font-family="sans-serif" font-size="16" font-weight="800" fill="#ffe600" text-anchor="middle">Kangu</text><rect x="4" y="61" width="178" height="4" fill="#f0b800"/><circle cx="34" cy="77" r="12" fill="#1e293b"/><circle cx="34" cy="77" r="7" fill="#334155"/><circle cx="34" cy="77" r="3" fill="#94a3b8"/><circle cx="100" cy="77" r="12" fill="#1e293b"/><circle cx="100" cy="77" r="7" fill="#334155"/><circle cx="100" cy="77" r="3" fill="#94a3b8"/><circle cx="122" cy="77" r="10" fill="#1e293b"/><circle cx="122" cy="77" r="6" fill="#334155"/><circle cx="122" cy="77" r="2.5" fill="#94a3b8"/><circle cx="166" cy="77" r="11" fill="#1e293b"/><circle cx="166" cy="77" r="6.5" fill="#334155"/><circle cx="166" cy="77" r="2.5" fill="#94a3b8"/><ellipse cx="182" cy="46" rx="5" ry="4" fill="#fff9c4"/><rect x="181" y="32" width="6" height="9" rx="1" fill="#f0b800"/></svg>';
			s += '</div>';
			// VAN
			s += '<div id="mlmee_van" style="position:absolute;bottom:42px;left:-220px;z-index:5">';
			s += '<div style="position:absolute;bottom:10px;left:-8px"><div class="mlmee_smoke"></div><div class="mlmee_smoke" style="animation-delay:0.23s"></div><div class="mlmee_smoke" style="animation-delay:0.46s"></div></div>';
			s += '<svg width="145" height="80" viewBox="0 0 145 80" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="16" width="96" height="46" rx="4" fill="#ffe600"/><rect x="100" y="26" width="38" height="36" rx="3" fill="#ffe600"/><rect x="104" y="30" width="24" height="16" rx="2" fill="#b3d4f5"/><rect x="104" y="30" width="24" height="16" rx="2" fill="none" stroke="#1a6abf" stroke-width="1"/><rect x="10" y="23" width="84" height="30" rx="3" fill="#1a6abf"/><text x="52" y="43" font-family="sans-serif" font-size="13" font-weight="800" fill="#ffe600" text-anchor="middle">Kangu</text><rect x="4" y="58" width="134" height="3.5" fill="#f0b800"/><circle cx="30" cy="70" r="10" fill="#1e293b"/><circle cx="30" cy="70" r="6" fill="#334155"/><circle cx="30" cy="70" r="2.5" fill="#94a3b8"/><circle cx="88" cy="70" r="10" fill="#1e293b"/><circle cx="88" cy="70" r="6" fill="#334155"/><circle cx="88" cy="70" r="2.5" fill="#94a3b8"/><circle cx="126" cy="70" r="9" fill="#1e293b"/><circle cx="126" cy="70" r="5.5" fill="#334155"/><circle cx="126" cy="70" r="2.2" fill="#94a3b8"/><ellipse cx="138" cy="44" rx="4" ry="3.5" fill="#fff9c4"/><rect x="137" y="31" width="5" height="8" rx="1" fill="#f0b800"/></svg>';
			s += '</div>';
			// UTILITÁRIO
			s += '<div id="mlmee_util" style="position:absolute;bottom:42px;left:-120px;z-index:5">';
			s += '<div style="position:absolute;bottom:10px;left:-8px"><div class="mlmee_smoke"></div><div class="mlmee_smoke" style="animation-delay:0.23s"></div></div>';
			s += '<svg width="105" height="72" viewBox="0 0 105 72" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="4" y="22" width="60" height="36" rx="3" fill="#ffe600"/><rect x="64" y="18" width="34" height="40" rx="6" fill="#ffe600"/><rect x="68" y="22" width="22" height="18" rx="3" fill="#b3d4f5"/><rect x="68" y="22" width="22" height="18" rx="3" fill="none" stroke="#1a6abf" stroke-width="1"/><rect x="8" y="27" width="54" height="24" rx="2" fill="#1a6abf"/><text x="35" y="43" font-family="sans-serif" font-size="9" font-weight="800" fill="#ffe600" text-anchor="middle">Kangu</text><rect x="4" y="55" width="94" height="3" fill="#f0b800"/><circle cx="24" cy="63" r="9" fill="#1e293b"/><circle cx="24" cy="63" r="5.5" fill="#334155"/><circle cx="24" cy="63" r="2.2" fill="#94a3b8"/><circle cx="78" cy="63" r="9" fill="#1e293b"/><circle cx="78" cy="63" r="5.5" fill="#334155"/><circle cx="78" cy="63" r="2.2" fill="#94a3b8"/><ellipse cx="98" cy="36" rx="4" ry="3" fill="#fff9c4"/><rect x="97" y="23" width="4" height="7" rx="1" fill="#f0b800"/></svg>';
			s += '</div>';
			// Estrada
			s += '<div style="position:absolute;bottom:0;left:0;right:0;height:42px;background:#1a2540;border-top:2px solid #243050">';
			s += '<div class="mlmee_rdline"></div><div class="mlmee_rdline" style="left:80px;animation-delay:-0.22s"></div><div class="mlmee_rdline" style="left:240px;animation-delay:-0.43s"></div><div class="mlmee_rdline" style="left:400px;animation-delay:-0.65s"></div><div class="mlmee_rdline" style="left:560px;animation-delay:-0.87s"></div>';
			s += '</div>';
			s += '<div style="position:absolute;bottom:0;left:0;right:0;height:8px;background:#0a2010"></div>';
			s += '</div>'; // road-wrap
			// Créditos
			s += '<div id="mlmee_credits" style="font-family:monospace;font-size:10px;color:#475569;text-align:right;position:absolute;bottom:14px;right:16px;z-index:10;opacity:0;transition:opacity 0.8s 2.4s;line-height:1.6">';
			s += '<span style="color:#64748b;font-weight:600">Monitor Last Mile · Multi Estações · v1.10</span><br>';
			s += 'criado por Alessandro · Kangu LM / Mercado Livre<br>';
			s += 'em parceria com Claude · Anthropic · 2025</div>';
			// Botão fechar
			s += '<div id="mlmee_close" style="position:absolute;top:12px;right:14px;background:transparent;border:1px solid #1e2d45;color:#475569;font-size:10px;padding:3px 10px;border-radius:4px;cursor:pointer;z-index:30;font-family:monospace">✕ fechar</div>';
			return s;
		})();
		// Injetar estilos das animações
		var _eeStyle = document.createElement('style');
		_eeStyle.textContent = [
			'@keyframes mlmeeCloud{from{left:110%}to{left:-20%}}',
			'@keyframes mlmeeSmoke{0%{transform:translate(0,0) scale(0.5);opacity:0.6}100%{transform:translate(-16px,-14px) scale(1.6);opacity:0}}',
			'@keyframes mlmeeRdLine{from{transform:translateX(0)}to{transform:translateX(-160px)}}',
			'@keyframes mlmeeVuc{0%{left:-340px}65%{left:calc(5% - 120px)}78%{left:calc(5% - 110px)}88%{left:calc(5% - 120px)}100%{left:calc(5% - 120px)}}',
			'@keyframes mlmeeVan{0%{left:-220px}65%{left:calc(32% - 70px)}78%{left:calc(32% - 60px)}88%{left:calc(32% - 70px)}100%{left:calc(32% - 70px)}}',
			'@keyframes mlmeeUtil{0%{left:-120px}65%{left:calc(62%)}78%{left:calc(62% + 10px)}88%{left:calc(62%)}100%{left:calc(62%)}}',
			'@keyframes mlmeeTwinkle{0%,100%{opacity:0}50%{opacity:var(--op,0.6)}}',
			'.mlmee_smoke{position:absolute;width:8px;height:8px;background:rgba(148,163,184,0.35);border-radius:50%;animation:mlmeeSmoke 0.7s ease-out infinite}',
			'.mlmee_rdline{position:absolute;bottom:18px;left:-80px;height:4px;width:48px;background:#ffab40;border-radius:2px;animation:mlmeeRdLine 0.65s linear infinite}'
		].join('');
		document.head.appendChild(_eeStyle);
		document.body.appendChild(_eeOverlay);

		function _eeCreateStars() {
			var sc = document.getElementById('mlmee_stars');
			if (!sc) return;
			sc.innerHTML = '';
			for (var i = 0; i < 40; i++) {
				var st = document.createElement('div');
				st.style.cssText = 'position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;opacity:0;animation:mlmeeTwinkle ' + (1.5 + Math.random() * 2.5).toFixed(1) + 's infinite ' + (Math.random() * 2).toFixed(1) + 's';
				st.style.left = (Math.random() * 100).toFixed(1) + '%';
				st.style.top = (Math.random() * 65).toFixed(1) + '%';
				st.style.setProperty('--op', (0.3 + Math.random() * 0.7).toFixed(2));
				sc.appendChild(st);
			}
		}

		function _eeResetVehicles() {
			['mlmee_vuc', 'mlmee_van', 'mlmee_util'].forEach(function (id, i) {
				var el = document.getElementById(id);
				if (!el) return;
				el.style.animation = 'none';
				el.offsetHeight;
				var anims = ['mlmeeVuc', 'mlmeeVan', 'mlmeeUtil'];
				el.style.animation = anims[i] + ' 2.6s cubic-bezier(.25,.46,.45,.94) forwards 0.2s';
			});
		}

		function _eeShow() {
			_eeActive = true;
			_eeCreateStars();
			_eeResetVehicles();
			_eeOverlay.style.opacity = '1';
			_eeOverlay.style.pointerEvents = 'all';
			var t = document.getElementById('mlmee_title');
			if (t) {
				t.style.opacity = '1';
				t.style.transform = 'translateY(0)';
			}
			var c = document.getElementById('mlmee_credits');
			if (c) {
				c.style.opacity = '1';
			}
		}

		function _eeHide() {
			_eeActive = false;
			_eeTyped = '';
			_eeOverlay.style.opacity = '0';
			_eeOverlay.style.pointerEvents = 'none';
			var t = document.getElementById('mlmee_title');
			if (t) {
				t.style.opacity = '0';
				t.style.transform = 'translateY(-20px)';
			}
			var c = document.getElementById('mlmee_credits');
			if (c) {
				c.style.opacity = '0';
			}
		}
		document.getElementById('mlmee_close').addEventListener('click', function (e) {
			e.stopPropagation();
			_eeHide();
		});
		document.addEventListener('keydown', function (e) {
			if (_eeActive) {
				if (e.key === 'Escape') _eeHide();
				return;
			}
			var ch = e.key.toUpperCase();
			if (ch.length === 1 && ch >= 'A' && ch <= 'Z') {
				_eeTyped += ch;
				if (_eeTyped.length > _eeSecret.length) _eeTyped = _eeTyped.slice(-_eeSecret.length);
				if (_eeTyped === _eeSecret) _eeShow();
			}
		});
	})();
	// ===== FIM EASTER EGG =====

	// ===== MINIMIZAR / MAXIMIZAR =====
	// _state: 'normal' | 'min' | 'max'
	var _state = 'normal',
		_prevNormalCss = '';

	function _saveNormalCss() {
		_prevNormalCss = outerPanel.style.cssText;
	}

	function _restoreNormal() {
		var s = outerPanel.style;
		var tmp = document.createElement('div');
		tmp.style.cssText = _prevNormalCss;
		s.position = tmp.style.position || 'fixed';
		s.top = tmp.style.top;
		s.left = tmp.style.left;
		s.right = tmp.style.right;
		s.bottom = tmp.style.bottom || '';
		s.width = tmp.style.width;
		s.height = tmp.style.height || '';
		s.maxHeight = tmp.style.maxHeight;
		s.borderRadius = tmp.style.borderRadius;
	}
	document.getElementById('mlmm_min').onclick = function () {
		if (_state === 'min') {
			_state = 'normal';
			_restoreNormal();
			outerBody.style.display = 'flex';
			outerCtrl.style.display = 'flex';
		} else {
			if (_state === 'max') {
				_restoreNormal();
				outerBody.style.display = 'flex';
				outerCtrl.style.display = 'flex';
			}
			_state = 'min';
			outerBody.style.display = 'none';
			outerCtrl.style.display = 'none';
			outerPanel.style.width = 'auto';
			outerPanel.style.minWidth = '320px';
			outerPanel.style.maxHeight = 'none';
			outerPanel.style.height = 'auto';
			outerPanel.style.bottom = '';
		}
	};
	document.getElementById('mlmm_max').onclick = function () {
		if (_state === 'max') {
			_state = 'normal';
			_restoreNormal();
		} else {
			if (_state === 'normal') _saveNormalCss();
			_state = 'max';
			var s = outerPanel.style;
			s.top = '0';
			s.left = '0';
			s.right = '0';
			s.bottom = '0';
			s.width = '100%';
			s.height = '100%';
			s.maxHeight = '100%';
			s.borderRadius = '0';
		}
	};

	// ===== TOGGLE SIDEBAR =====
	var _sideVisible = true;
	sideToggleBtn.onclick = function () {
		_sideVisible = !_sideVisible;
		sidebar.style.width = _sideVisible ? '120px' : '0';
		sidebar.style.minWidth = _sideVisible ? '120px' : '0';
	};

	// ===== GERENCIAMENTO DE ESTAÇÕES =====
	var _stations = {}; // { sscCode: { status, container, sscCode } }
	var _activeStation = null;

	function updateSidebarStatus() {
		var codes = Object.keys(_stations);
		if (codes.length === 0) {
			sideFoot.style.display = 'none';
			return;
		}
		var pronta = codes.filter(function (c) {
			return _stations[c].status === 'done';
		}).length;
		var carregando = codes.filter(function (c) {
			return _stations[c].status === 'loading';
		}).length;
		var aguard = codes.filter(function (c) {
			return _stations[c].status === 'waiting';
		}).length;
		sideFoot.style.display = '';
		sideFoot.innerHTML = '<div style="color:' + S.tx + ';font-size:11px;font-weight:600;margin-bottom:3px">' + codes.length + ' estação' + (codes.length > 1 ? 's' : '') + '</div>' + (pronta ? '<div style="color:' + S.ok + '">' + pronta + ' pronta' + (pronta > 1 ? 's' : '') + '</div>' : '') + (carregando ? '<div style="color:' + S.wn + '">' + carregando + ' carregando</div>' : '') + (aguard ? '<div style="color:' + S.mt + '">' + aguard + ' aguardando</div>' : '');
		// Atualizar status global na toolbar quando sidebar oculta
		var dots = codes.map(function (c) {
			var st = _stations[c].status;
			var col = st === 'done' ? S.ok : st === 'loading' ? S.wn : S.mt;
			return '<span style="color:' + col + '">&#9679;</span> ' + c;
		}).join(' &middot; ');
		outerStatusEl.innerHTML = dots;
	}

	function activateStation(sscCode) {
		if (!_stations[sscCode]) return;

		// Pausar refresh da estação anterior (preserva intervalo configurado)
		if (_activeStation && _activeStation !== sscCode) {
			var prev = _stations[_activeStation];
			if (prev && prev.inst && prev.inst.pauseRefresh) prev.inst.pauseRefresh();
		}

		_activeStation = sscCode;

		// Trocar área principal
		mainArea.innerHTML = '';
		mainArea.appendChild(_stations[sscCode].container);

		// Retomar refresh da estação ativa (se estava configurado)
		var cur = _stations[sscCode];
		if (cur && cur.inst && cur.inst.resumeRefresh) cur.inst.resumeRefresh();

		// Atualizar highlight na sidebar
		document.querySelectorAll('[data-mlmm-sitem]').forEach(function (el) {
			var isActive = el.dataset.mlmmSitem === sscCode;
			el.style.background = isActive ? S.sf2 : 'transparent';
			el.style.borderLeft = isActive ? '2px solid ' + S.ac : '2px solid transparent';
		});
	}

	function addStationToSidebar(sscCode, status) {
		var item = document.createElement('div');
		item.dataset.mlmmSitem = sscCode;
		item.style.cssText = 'padding:8px 10px;cursor:pointer;border-bottom:1px solid ' + S.bd + ';border-left:2px solid transparent;display:flex;flex-direction:column;gap:3px';
		item.innerHTML = '<div style="font-family:' + mn + ';font-size:11px;font-weight:600;color:' + S.tx + '">' + sscCode + '</div><div id="mlmm_st_' + sscCode + '" style="font-family:' + mn + ';font-size:9px;color:' + S.mt + '">aguardando</div>';
		item.onclick = function () {
			activateStation(sscCode);
		};
		item.onmouseover = function () {
			if (_activeStation !== sscCode) item.style.background = S.sf2;
		};
		item.onmouseout = function () {
			if (_activeStation !== sscCode) item.style.background = 'transparent';
		};
		sideList.appendChild(item);
	}

	function updateStationBadge(sscCode, status, text) {
		if (!_stations[sscCode]) return;
		_stations[sscCode].status = status;
		var el = document.getElementById('mlmm_st_' + sscCode);
		if (!el) return;
		var col = status === 'done' ? S.ok : status === 'loading' ? S.wn : S.mt;
		el.style.color = col;
		el.textContent = text || status;
		updateSidebarStatus();
	}

	// ===== CRIAR INSTÂNCIA DE ESTAÇÃO =====
	function createStation(sscCode) {
		// Container que hospedará o painel interno desta estação
		var container = document.createElement('div');
		container.style.cssText = 'display:flex;flex-direction:column;flex:1;overflow:hidden;min-height:0;width:100%';
		container.id = 'mlmm_ct_' + sscCode;

		// Busca elementos dentro do container desta instância (evita conflitos de ID entre estações)
		function $id(id) {
			return container.querySelector('#' + id) || {
				textContent: '',
				style: {},
				parentNode: null,
				remove: function () { },
				appendChild: function () { },
				insertBefore: function () { }
			};
		}

		var S = {
			bg: '#0a0e1a',
			sf: '#111827',
			sf2: '#1a2235',
			bd: '#1e2d45',
			ac: '#00d4ff',
			ac2: '#ff6b35',
			ok: '#00e676',
			wn: '#ffab40',
			er: '#ff5252',
			tx: '#e2e8f0',
			mt: '#64748b',
			pu: '#a78bfa'
		};
		var mn = "'IBM Plex Mono',monospace";
		var SITE = sscCode || 'SSP22';
		// ===== AGENDA DE MOTORISTAS =====
		var _agenda = {}; // { nome_normalizado: {tel, hub, nome} }
		function _normName(n) {
			return n.toUpperCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
		}

		function _loadAgenda() {
			try {
				var raw = localStorage.getItem('mlm_agenda_v1');
				if (raw) {
					_agenda = JSON.parse(raw);
				}
			} catch (e) {
				_agenda = {};
			}
		}

		function _saveAgenda(data) {
			try {
				localStorage.setItem('mlm_agenda_v1', JSON.stringify(data));
				_agenda = data;
			} catch (e) {
				alert('Erro ao salvar agenda: ' + e.message);
			}
		}

		function _getPhone(driverName) {
			if (!driverName || !_agenda) return null;
			var norm = _normName(driverName);
			var found = _agenda[norm];
			if (!found) return null;
			var tel = found.tel.replace(/\D/g, '');
			if (!tel.startsWith('55') && tel.length >= 10) tel = '55' + tel;
			return tel;
		}
		_loadAgenda();

		// ===== HELPERS =====
		function mk(tag, css, html) {
			var e = document.createElement(tag);
			if (css) e.style.cssText = css;
			if (html != null) e.innerHTML = html;
			return e;
		}

		function th(t) {
			return '<th style="padding:6px 8px;text-align:left;font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;white-space:nowrap">' + t + '</th>';
		}

		function td(css, html) {
			return '<td style="padding:7px 8px;' + css + '">' + html + '</td>';
		}

		function badge(closed) {
			return closed ? '<span style="background:rgba(0,230,118,.15);color:' + S.ok + ';padding:2px 7px;border-radius:3px;font-size:10px;font-weight:600">ENCERRADA</span>' : '<span style="background:rgba(255,171,64,.15);color:' + S.wn + ';padding:2px 7px;border-radius:3px;font-size:10px;font-weight:600">ABERTA</span>';
		}

		function progBar(prog) {
			var pc = prog >= 100 ? S.ok : prog >= 90 ? S.wn : S.er;
			return '<div style="display:flex;align-items:center;gap:6px;min-width:120px"><div style="flex:1;height:7px;border-radius:4px;background:' + S.sf2 + ';overflow:hidden"><div style="height:100%;background:' + pc + ';width:' + Math.min(100, prog).toFixed(0) + '%"></div></div><span style="font-family:' + mn + ';font-size:10px;color:' + pc + ';font-weight:600;white-space:nowrap">' + prog.toFixed(0) + '%</span></div>';
		}

		function isClosed(r) {
			return r.status === 'close' || r.status === 'finished';
		}

		function getProg(r) {
			return r.plannedRoute && r.plannedRoute.progressPercent != null ? parseFloat(r.plannedRoute.progressPercent) : 0;
		}

		function getInsuc(r) {
			return (r._m && r._m.ins) || 0;
		}

		function getPend(r) {
			return (r._m && r._m.pend) || 0;
		}

		function getDel(r) {
			return (r._m && r._m.del) || 0;
		}

		function getPNR(r) {
			return (r._m && r._m.pnr) || 0;
		}

		function getMotivos(r) {
			return (r._m && r._m.motivos) || {};
		}

		function getCom(r) {
			return (r._m && r._m.com) || 0;
		}

		function getComPend(r) {
			return (r._m && r._m.comPend) || 0;
		}

		function getInsColeta(r) {
			return (r._m && r._m.insColeta) || 0;
		}

		function getRes(r) {
			return (r._m && r._m.res) || 0;
		}

		function getAgStops(r) {
			return (r._m && r._m.agStops) || [];
		}

		function getAgDel(r) {
			return (r._m && r._m.agDel) || 0;
		}

		function getAgDesp(r) {
			return (r._m && r._m.agDesp) || 0;
		}

		function getRevDesp(r) {
			return (r._m && r._m.revDesp) || 0;
		}

		function getRevDel(r) {
			return (r._m && r._m.revDel) || 0;
		}

		function getRevPkgs(r) {
			return (r._m && r._m.revPkgs) || [];
		}

		function isComplete(r) {
			return getProg(r) >= 100 && isClosed(r);
		}

		var MOTIVO_LABELS = {
			absent: 'Ausente',
			refused: 'Recusou',
			wrong_address: 'End. errado',
			not_found: 'Não localiz.',
			damaged: 'Avariado',
			returned: 'Devolvido',
			other: 'Outros',
			security: 'Segurança',
			access: 'Sem acesso',
			business_closed: 'Emp. fechada',
			weather: 'Clima',
			vehicle: 'Veículo',
			no_time: 'Sem tempo',
			stolen: 'Extraviado'
		};

		function lm(k) {
			return MOTIVO_LABELS[k] || k;
		}

		// ===== PAINEL =====
		var panel = mk('div', 'flex:1;display:flex;flex-direction:column;font-size:13px;color:' + S.tx + ';overflow:hidden;font-family:sans-serif;min-height:0;min-width:0');
		panel.id = 'mlmp_' + sscCode;

		// Timestamp (sem header separado — integrado na ctrl)
		var tsSpan = mk('span', 'font-family:' + mn + ';font-size:10px;color:' + S.mt + ';white-space:nowrap');
		tsSpan.id = 'mlm_ts_' + sscCode;
		tsSpan.textContent = '--';

		// CONTROLS
		var ctrl = mk('div', 'padding:6px 12px;background:' + S.sf + ';border-bottom:1px solid ' + S.bd + ';display:flex;gap:6px;align-items:center;flex-wrap:nowrap;flex-shrink:0;overflow-x:auto;min-height:40px');
		var sscDl = document.createElement('datalist');
		sscDl.id = 'mlm_dl_' + sscCode;
		[['SSP4'], ['SSP22'], ['SSP26']].forEach(function (o) {
			var op = document.createElement('option');
			op.value = o[0];
			sscDl.appendChild(op);
		});
		document.body.appendChild(sscDl);
		var sSsc = mk('input', 'background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.tx + ';padding:4px 8px;border-radius:4px;font-family:' + mn + ';font-size:11px;width:80px');
		sSsc.setAttribute('list', 'mlm_dl_' + sscCode);
		sSsc.placeholder = 'Estação';
		sSsc.value = sscCode;
		var btnF = mk('button', 'background:' + S.ac + ';color:#000;border:none;padding:5px 16px;border-radius:4px;font-family:' + mn + ';font-size:11px;font-weight:600;cursor:pointer', '&#9654; BUSCAR TUDO');
		var btnC = mk('button', 'background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:5px 12px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer', '&#11015; CSV');
		var btnFech = mk('button', 'background:transparent;border:1px solid ' + S.pu + ';color:' + S.pu + ';padding:5px 12px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;display:none', '&#128203; Fechamento');
		var inputAtendente = mk('input', 'background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.tx + ';padding:4px 8px;border-radius:4px;font-family:' + mn + ';font-size:11px;width:120px;display:none');
		inputAtendente.placeholder = 'Seu nome';
		inputAtendente.title = 'Nome do atendente (para mensagens PNR)';
		inputAtendente.id = 'mlm_atendente';
		var btnReport = mk('button', 'background:transparent;border:1px solid #34d399;color:#34d399;padding:5px 12px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;display:none', '&#128200; Report');
		var baseFontSize = 11;
		var _mlmScale = (function () {
			try {
				return parseFloat(localStorage.getItem('mlm_scale')) || 1;
			} catch (e) {
				return 1;
			}
		})();

		function applyScale() {
			panel.style.fontSize = Math.round(13 * _mlmScale) + 'px';
			try {
				localStorage.setItem('mlm_scale', _mlmScale);
			} catch (e) { }
		}
		btnC.disabled = true;
		var btnPause = mk('button', 'background:transparent;border:1px solid ' + S.bd + ';color:' + S.wn + ';padding:5px 10px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;display:none', '⏸');
		var btnZoomIn = mk('button', 'background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:5px 9px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;font-weight:600', 'A+');
		var btnZoomOut = mk('button', 'background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:5px 9px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;font-weight:600', 'A-');
		btnPause.id = 'mlm_pause_btn';
		// ===== REFRESH CONTROLS =====
		var refreshWrap = mk('div', 'display:flex;align-items:center;gap:6px;margin-left:4px');
		var refreshInput = mk('input', 'width:45px;background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.tx + ';padding:4px 6px;border-radius:4px;font-family:' + mn + ';font-size:11px;text-align:center');
		refreshInput.type = 'number';
		refreshInput.min = '1';
		refreshInput.placeholder = 'min';
		refreshInput.title = 'Intervalo de refresh (minutos)';
		var refreshBtn = mk('button', 'background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:5px 10px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer', '🔄');
		refreshBtn.title = 'Ativar/desativar refresh automático';
		var refreshLabel = mk('span', 'font-size:10px;color:' + S.mt + ';white-space:nowrap', 'auto');
		refreshLabel.id = 'mlm_refresh_label';
		[mk('span', 'font-size:10px;color:' + S.mt, '↻'), refreshInput, refreshBtn, refreshLabel].forEach(function (el) {
			refreshWrap.appendChild(el);
		});
		// Atalhos rápidos
		var shortcuts = mk('div', 'display:flex;gap:3px');
		[5, 10, 15, 30].forEach(function (v) {
			var b = mk('button', 'background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:3px 7px;border-radius:3px;font-family:' + mn + ';font-size:10px;cursor:pointer', v + 'm');
			b.onclick = function () {
				refreshInput.value = v;
				startRefresh();
			};
			shortcuts.appendChild(b);
		});
		refreshWrap.appendChild(shortcuts);
		var progressWrap = mk('div', 'flex:1;display:none;align-items:center;gap:8px');
		progressWrap.id = 'mlm_prog_wrap';
		var progressBar = mk('div', 'flex:1;height:4px;background:' + S.sf2 + ';border-radius:2px;overflow:hidden');
		var progressFill = mk('div', 'height:100%;background:' + S.ac + ';width:0%;transition:width .3s;border-radius:2px');
		progressFill.id = 'mlm_prog_fill';
		progressBar.appendChild(progressFill);
		var progressLbl = mk('span', 'font-family:' + mn + ';font-size:10px;color:' + S.ac + ';white-space:nowrap', '');
		progressLbl.id = 'mlm_prog_lbl';
		progressWrap.appendChild(progressBar);
		progressWrap.appendChild(progressLbl);
		var stEl = mk('span', 'font-family:' + mn + ';font-size:10px;color:' + S.mt + ';margin-left:auto', 'Pronto');
		var btnAgenda = mk('button', 'background:transparent;border:1px solid ' + S.mt + ';color:' + S.mt + ';padding:5px 10px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer', '👥');
		btnAgenda.title = 'Agenda de Motoristas';
		[sSsc, btnF, btnC, btnFech, btnReport, inputAtendente, btnPause, btnZoomIn, btnZoomOut, progressWrap, refreshWrap, btnAgenda, stEl].forEach(function (e) {
			ctrl.appendChild(e);
		});

		// FILTROS multi-select
		var fRow = mk('div', 'padding:8px 16px;background:#0d1420;border-bottom:1px solid ' + S.bd + ';display:flex;gap:8px;align-items:center;flex-wrap:wrap;flex-shrink:0;position:relative');
		fRow.innerHTML = '<span style="font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;margin-right:2px">FILTROS</span>';

		var fSel = {
			modal: new Set(),
			carrier: new Set(),
			driver: new Set(),
			ciclo: new Set(),
			placa: new Set(),
			data: new Set()
		};

		function mkMulti(key, label, minw) {
			var wrap = mk('div', 'position:relative;display:inline-block');
			var btn = mk('button', 'background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:4px 10px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;min-width:' + (minw || 110) + 'px;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:6px');
			var btnLbl = mk('span', 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', label);
			btn.appendChild(btnLbl);
			btn.appendChild(mk('span', 'font-size:9px;opacity:.5', '▾'));
			var dd = mk('div', 'position:fixed;background:#0d1420;border:1px solid ' + S.bd + ';border-radius:6px;z-index:2147483647;min-width:' + (minw || 110) + 'px;max-height:280px;overflow-y:auto;display:none;box-shadow:0 8px 24px rgba(0,0,0,.9)');
			dd.id = 'mlm_dd_' + key;
			btn.onclick = function (e) {
				e.stopPropagation();
				e.preventDefault();
				document.querySelectorAll('[id^=mlm_dd_]').forEach(function (d) {
					if (d !== dd) d.style.display = 'none';
				});
				if (dd.style.display === 'none' || !dd.style.display) {
					var r = btn.getBoundingClientRect();
					dd.style.display = 'block';
					dd.style.top = (r.bottom + 6) + 'px';
					dd.style.left = Math.min(r.left, window.innerWidth - parseInt(minw || 110) - 8) + 'px';
				} else dd.style.display = 'none';
			};
			document.addEventListener('click', function () {
				dd.style.display = 'none';
			});
			dd.addEventListener('click', function (e) {
				e.stopPropagation();
			});
			wrap._btn = btn;
			wrap._lbl = btnLbl;
			wrap._dd = dd;
			wrap._key = key;
			wrap._label = label;
			wrap._minw = minw;
			wrap.populate = function (items) {
				dd.innerHTML = '';
				var allRow = mk('div', 'padding:6px 12px;cursor:pointer;font-family:' + mn + ';font-size:11px;color:' + S.mt + ';border-bottom:1px solid ' + S.bd + ';display:flex;align-items:center;gap:8px');
				allRow.innerHTML = '<span>☐</span><span>Todos</span>';
				allRow.onclick = function () {
					fSel[key].clear();
					updateChk(dd, key);
					updateLbl(wrap);
					applyFilters();
				};
				dd.appendChild(allRow);
				items.sort().forEach(function (item) {
					var row = mk('div', 'padding:6px 12px;cursor:pointer;font-family:' + mn + ';font-size:11px;color:' + S.tx + ';display:flex;align-items:center;gap:8px');
					row.dataset.val = item;
					var chk = mk('span', 'font-size:12px;flex-shrink:0', fSel[key].has(item) ? '☑' : '☐');
					row.appendChild(chk);
					row.appendChild(mk('span', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap', item));
					row.onmouseover = function () {
						this.style.background = S.sf2;
					};
					row.onmouseout = function () {
						this.style.background = 'transparent';
					};
					row.onclick = function () {
						if (fSel[key].size === 0) {
							// Todos selecionados — popular com todos exceto o clicado
							dd.querySelectorAll('[data-val]').forEach(function (r) {
								if (r.dataset.val !== item) fSel[key].add(r.dataset.val);
							});
							chk.textContent = '☐';
						} else if (fSel[key].has(item)) {
							fSel[key].delete(item);
							chk.textContent = '☐';
							// Se ficou vazio = todos selecionados novamente
							if (fSel[key].size === 0) {
								updateChk(dd, key);
							}
						} else {
							fSel[key].add(item);
							chk.textContent = '☑';
						}
						updateLbl(wrap);
						applyFilters();
					};
					dd.appendChild(row);
				});
			};
			wrap.clear = function () {
				fSel[key].clear();
				updateLbl(wrap);
			};
			wrap.appendChild(btn);
			document.body.appendChild(dd);
			return wrap;
		}

		function updateChk(dd, key) {
			dd.querySelectorAll('[data-val]').forEach(function (row) {
				var chk = row.querySelector('span');
				if (chk) chk.textContent = fSel[key].has(row.dataset.val) ? '☑' : '☐';
			});
		}

		function updateLbl(wrap) {
			var sel = Array.from(fSel[wrap._key]);
			wrap._lbl.textContent = sel.length === 0 ? wrap._label : sel.length === 1 ? sel[0] : sel.length + ' selecionados';
			wrap._btn.style.borderColor = sel.length > 0 ? S.ac : S.bd;
			wrap._btn.style.color = sel.length > 0 ? S.tx : S.mt;
		}

		var fStatus = mk('select', 'background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:4px 8px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;min-width:90px');
		[['', 'Status'], ['open', 'Abertas'], ['closed', 'Encerradas']].forEach(function (o) {
			var op = document.createElement('option');
			op.value = o[0];
			op.textContent = o[1];
			fStatus.appendChild(op);
		});
		var fTipo = mk('select', 'background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:4px 8px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;min-width:115px');
		[['', 'Tipo de rota'], ['delivery', 'Entrega'], ['mixed', 'Mista'], ['pickup', 'Coleta']].forEach(function (o) {
			var op = document.createElement('option');
			op.value = o[0];
			op.textContent = o[1];
			fTipo.appendChild(op);
		});
		var fModal = mkMulti('modal', 'Modal', 110);
		var fCarrier = mkMulti('carrier', 'Transportadora', 150);
		var fDriver = mkMulti('driver', 'Motorista', 140);
		var fCiclo = mkMulti('ciclo', 'Ciclo', 90);
		var fPlaca = mkMulti('placa', 'Placa', 110);
		var fData = mkMulti('data', 'Data', 110);
		var sortSel = mk('select', 'background:' + S.sf2 + ';border:1px solid rgba(0,212,255,.3);color:' + S.ac + ';padding:4px 8px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer;min-width:165px');
		[['perf', 'Padrão'], ['insuc_desc', '↓ Mais insucessos'], ['insuc_asc', '↑ Menos insucessos'], ['pend_desc', '↓ Mais pendentes'], ['pend_asc', '↑ Menos pendentes'], ['prog_desc', '↓ Maior progresso'], ['prog_asc', '↑ Menor progresso'], ['carrier_asc', 'Transportadora A-Z'], ['compend_desc', '↓ Mais comerciais']].forEach(function (o) {
			var op = document.createElement('option');
			op.value = o[0];
			op.textContent = o[1];
			sortSel.appendChild(op);
		});
		var btnClearF = mk('button', 'background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:4px 10px;border-radius:4px;font-family:' + mn + ';font-size:10px;cursor:pointer', '✕ Limpar');
		var cntEl = mk('span', 'font-family:' + mn + ';font-size:10px;color:' + S.ac + ';margin-left:auto', '');
		[fStatus, fTipo, fModal, fCarrier, fDriver, fCiclo, sortSel, btnClearF, cntEl].forEach(function (e) {
			fRow.appendChild(e instanceof HTMLElement ? e : e);
		});
		fRow.removeChild(fModal);
		fRow.removeChild(fCarrier);
		fRow.removeChild(fDriver);
		fRow.removeChild(fCiclo);
		fRow.insertBefore(fModal, sortSel);
		fRow.insertBefore(fCarrier, sortSel);
		fRow.insertBefore(fDriver, sortSel);
		fRow.insertBefore(fCiclo, sortSel);
		fRow.insertBefore(fPlaca, sortSel);
		fRow.insertBefore(fData, sortSel);

		// KPIs
		var kpiG = mk('div', 'display:grid;grid-template-columns:repeat(10,1fr);gap:1px;background:' + S.bd + ';border-bottom:1px solid ' + S.bd + ';flex-shrink:0');
		[['mlm_k1', S.tx, 'ROTAS'], ['mlm_k2', S.wn, 'ABERTAS'], ['mlm_k3', S.ok, 'ENCERRADAS'], ['mlm_kpkg', S.tx, 'PACOTES'], ['mlm_k4', S.ac2, 'PENDENTES'], ['mlm_k5', S.er, 'INSUCESSOS'], ['mlm_k8', '#34d399', 'SACAS'], ['mlm_k9', '#fb923c', 'SACAS PEND'], ['mlm_k6', '#f87171', 'PNR'], ['mlm_k7', S.pu, 'DS%']].forEach(function (d) {
			var c = mk('div', 'background:' + S.sf + ';padding:8px 12px;text-align:center');
			var v = mk('div', 'font-family:' + mn + ';font-size:18px;font-weight:600;color:' + d[1], '—');
			v.id = d[0];
			c.appendChild(v);
			c.appendChild(mk('div', 'font-size:10px;color:' + S.mt + ';margin-top:3px', d[2]));
			kpiG.appendChild(c);
		});

		// TABS
		var tabBar = mk('div', 'display:flex;border-bottom:1px solid ' + S.bd + ';background:' + S.sf + ';padding:0 16px;gap:2px;flex-shrink:0');
		var curTab = 'ROTAS';
		var tabEls = {};
		['ROTAS', 'OFENSORAS', 'INSUCESSOS', 'MOTORISTAS', 'PNR', 'AGÊNCIAS', 'DEVOLUÇÕES'].forEach(function (t, i) {
			var tab = mk('div', 'padding:7px 14px;font-size:11px;font-family:' + mn + ';color:' + (i === 0 ? S.ac : S.mt) + ';cursor:pointer;border-bottom:2px solid ' + (i === 0 ? S.ac : 'transparent'), t);
			tab.onclick = function () {
				curTab = t;
				Object.keys(tabEls).forEach(function (k) {
					tabEls[k].style.color = S.mt;
					tabEls[k].style.borderBottomColor = 'transparent';
				});
				tab.style.color = S.ac;
				tab.style.borderBottomColor = S.ac;
				applyFilters();
			};
			tabEls[t] = tab;
			tabBar.appendChild(tab);
		});

		var body = mk('div', 'overflow:auto;flex:1', '<div style="padding:40px;text-align:center;color:' + S.mt + ';font-family:' + mn + ';font-size:12px">Clique em BUSCAR TUDO para carregar as rotas</div>');
		body.addEventListener('click', function (e) {
			var el = e.target.closest('[data-routeid],[data-caseid],[data-copyrep],[data-copymsg]') || e.target;
			if (el.dataset && el.dataset.routeid) {
				window.open('https://envios.adminml.com/logistics/monitoring-distribution/detail/' + el.dataset.routeid + '?site=MLB', '_blank');
			}
			if (el.dataset && el.dataset.caseid) {
				window.open('https://envios.adminml.com/logistics/case-center/cases/' + el.dataset.caseid, '_blank');
			}
			if (el.dataset && el.dataset.copyrep) {
				e.stopPropagation();
				var msg = decodeURIComponent(el.dataset.copyrep);
				navigator.clipboard.writeText(msg).catch(function () {
					var ta = document.createElement('textarea');
					ta.value = msg;
					document.body.appendChild(ta);
					ta.select();
					document.execCommand('copy');
					document.body.removeChild(ta);
				});
				var orig = el.textContent;
				el.textContent = '✅ Copiado!';
				setTimeout(function () {
					el.textContent = orig;
				}, 2000);
			}
			if (el.dataset && el.dataset.copymsg) {
				e.stopPropagation();
				var msg = decodeURIComponent(el.dataset.copymsg);
				navigator.clipboard.writeText(msg).catch(function () {
					var ta = document.createElement('textarea');
					ta.value = msg;
					document.body.appendChild(ta);
					ta.select();
					document.execCommand('copy');
					document.body.removeChild(ta);
				});
				var orig = el.textContent;
				el.textContent = '✅ Copiado!';
				setTimeout(function () {
					el.textContent = orig;
				}, 2000);
			}
		});
		// Adicionar timestamp na barra de controles (antes do stEl)
		ctrl.insertBefore(tsSpan, stEl);
		[ctrl, fRow, kpiG, tabBar, body].forEach(function (e) {
			panel.appendChild(e);
		});
		container.appendChild(panel);
		applyScale();

		// DRAG desabilitado — gerenciado pela casca externa
		// Botão fechar interno desabilitado — gerenciado pela casca externa

		var allRoutes = [];
		var enrichDone = 0;
		var enrichTotal = 0;
		var paused = false;
		var refreshTimer = null;
		var refreshInterval = 0;
		var isRefreshing = false;
		var _stationOnDone = null;

		// ===== POPULATE FILTERS =====
		function populateFilters(routes) {
			var mo = {},
				ca = {},
				dr = {},
				ci = {},
				pl = {};
			routes.forEach(function (r) {
				var m = (r.vehicle && r.vehicle.description) || '';
				if (m) mo[m] = 1;
				var cv = r.carrier || '';
				if (cv) ca[cv] = 1;
				var d = (r.driver && r.driver.driverName) || '';
				if (d) dr[d] = 1;
				var cl = r.cluster || '';
				var pts = cl.split('_');
				if (pts.length > 1) ci[pts[pts.length - 1]] = 1;
				var p = (r.vehicle && r.vehicle.license) || '';
				if (p && p !== '—') pl[p] = 1;
			});
			fModal.populate(Object.keys(mo));
			fCarrier.populate(Object.keys(ca));
			fDriver.populate(Object.keys(dr));
			fCiclo.populate(Object.keys(ci));
			fPlaca.populate(Object.keys(pl).sort());
			var dts = {};
			routes.forEach(function (r) {
				var d = r.initDate || 0;
				if (d > 0) {
					var dt = new Date(d * 1000);
					var lb = dt.toLocaleDateString('pt-BR');
					dts[lb] = {
						ts: d,
						lb: lb
					};
				}
			});
			fData.populate(Object.values(dts).sort(function (a, b) {
				return b.ts - a.ts;
			}).map(function (d) {
				return d.lb;
			}));
		}

		// ===== FILTER + SORT =====
		function filterRoutes() {
			var st = fStatus.value,
				tp = fTipo.value;
			return allRoutes.filter(function (r) {
				if (st === 'open' && isClosed(r)) return false;
				if (st === 'closed' && !isClosed(r)) return false;
				if (tp === 'delivery' && (r.isDeliveryPickupRoute || r.isPickupRoute)) return false;
				if (tp === 'mixed' && !r.isDeliveryPickupRoute) return false;
				if (tp === 'pickup' && !r.isPickupRoute) return false;
				if (fSel.modal.size > 0 && !fSel.modal.has((r.vehicle && r.vehicle.description) || '')) return false;
				if (fSel.carrier.size > 0 && !fSel.carrier.has(r.carrier || '')) return false;
				if (fSel.placa.size > 0 && !fSel.placa.has((r.vehicle && r.vehicle.license) || '')) return false;
				if (fSel.data.size > 0) {
					var rd = r.initDate || 0;
					var rl = rd > 0 ? new Date(rd * 1000).toLocaleDateString('pt-BR') : '';
					if (!fSel.data.has(rl)) return false;
				}
				if (fSel.driver.size > 0 && !fSel.driver.has((r.driver && r.driver.driverName) || '')) return false;
				if (fSel.ciclo.size > 0) {
					var pts = (r.cluster || '').split('_');
					if (!fSel.ciclo.has(pts[pts.length - 1])) return false;
				}
				return true;
			});
		}

		function sortRoutes(arr) {
			var s = sortSel.value,
				a = arr.slice();
			if (s === 'insuc_desc') a.sort(function (x, y) {
				return getInsuc(y) - getInsuc(x);
			});
			else if (s === 'insuc_asc') a.sort(function (x, y) {
				return getInsuc(x) - getInsuc(y);
			});
			else if (s === 'pend_desc') a.sort(function (x, y) {
				return getPend(y) - getPend(x);
			});
			else if (s === 'pend_asc') a.sort(function (x, y) {
				return getPend(x) - getPend(y);
			});
			else if (s === 'prog_desc') a.sort(function (x, y) {
				return getProg(y) - getProg(x);
			});
			else if (s === 'prog_asc') a.sort(function (x, y) {
				return getProg(x) - getProg(y);
			});
			else if (s === 'carrier_asc') a.sort(function (x, y) {
				return (x.carrier || '').localeCompare(y.carrier || '');
			});
			else if (s === 'compend_desc') a.sort(function (x, y) {
				return getComPend(y) - getComPend(x);
			});
			return a;
		}

		function applyFilters() {
			var f = sortRoutes(filterRoutes());
			cntEl.textContent = f.length + ' de ' + allRoutes.length + ' rotas';
			calcKpis(f);
			requestAnimationFrame(function () {
				render(f);
			});
		}
		fStatus.onchange = applyFilters;
		fTipo.onchange = applyFilters;
		sortSel.onchange = applyFilters;
		btnClearF.onclick = function () {
			fStatus.value = '';
			fTipo.value = '';
			[fModal, fCarrier, fDriver, fCiclo, fPlaca, fData].forEach(function (w) {
				w.clear();
			});
			sortSel.value = 'perf';
			applyFilters();
		};

		// ===== KPIs =====
		function calcKpis(routes) {
			var ab = 0,
				en = 0,
				pend = 0,
				ins = 0,
				del = 0,
				pnr = 0,
				sacas = 0,
				sacasPend = 0;
			var totIC = 0;
			routes.forEach(function (r) {
				if (isClosed(r)) en++;
				else ab++;
				pend += getPend(r);
				ins += getInsuc(r);
				del += getDel(r);
				pnr += getPNR(r);
				sacas += parseInt((r.counters && r.counters.totalBags) || 0);
				sacasPend += parseInt((r.counters && r.counters.pendingBags) || 0);
				totIC += getInsColeta(r);
			});
			var tot = del + ins;
			var ds = tot > 0 ? ((del / tot) * 100).toFixed(1) + '%' : '—';
			var dsReal = (del + ins - totIC) > 0 ? ((del / (del + ins - totIC)) * 100).toFixed(1) + '%' : '—';
			var totPkg = del + ins + pend;
			$id('mlm_k1').textContent = routes.length;
			$id('mlm_k2').textContent = ab;
			$id('mlm_k3').textContent = en;
			$id('mlm_kpkg').textContent = totPkg || '—';
			$id('mlm_k4').textContent = pend || '—';
			$id('mlm_k5').textContent = ins || '—';
			$id('mlm_k6').textContent = pnr || '—';
			$id('mlm_k7').textContent = dsReal;
			$id('mlm_k8').textContent = sacas || '—';
			$id('mlm_k9').textContent = sacasPend || '—';
		}

		// ===== FETCH PAGE (escopo da instância — usado por doFetch e doRefresh) =====
		function fetchPage(page, acc, ssc) {
			return fetch('https://envios.adminml.com/logistics/api/monitoring/get-routes-list', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					serviceCenterId: ssc,
					siteId: 'MLB',
					page: page,
					pageSize: 100,
					order_by: 'performance'
				})
			}).then(function (r) {
				if (!r.ok) throw new Error('HTTP ' + r.status);
				return r.json();
			})
				.then(function (data) {
					var routes = data.routes || data || [];
					var pg = data.pagination || {};
					if (pg.totalDocuments && !window._mlm_total) window._mlm_total = pg.totalDocuments;
					var combined = acc.concat(routes);
					stEl.style.color = S.ac;
					stEl.textContent = 'Lista: ' + combined.length + (window._mlm_total ? ' de ' + window._mlm_total : '') + ' rotas...';
					if (pg.hasNext === true) return fetchPage(page + 1, combined, ssc);
					return combined;
				});
		}

		// ===== FETCH =====
		function doFetch() {
			var ssc = sSsc.value;
			SITE = ssc;
			btnF.disabled = true;
			btnF.textContent = '...';
			stEl.style.color = S.ac;
			stEl.textContent = 'Buscando lista...';
			allRoutes = [];
			enrichDone = 0;
			enrichTotal = 0;
			paused = false;
			window._mlm_total = 0;

			fetchPage(1, [], ssc).then(function (routes) {
				// Manter todas as rotas (igual ao ML), sem deduplicar
				allRoutes = routes;
				window._mlmDebug = routes;

				populateFilters(allRoutes);
				applyFilters();
				container.querySelector('#mlm_ts_' + sscCode).textContent = new Date().toLocaleTimeString('pt-BR');
				stEl.style.color = S.wn;
				stEl.textContent = allRoutes.length + ' rotas — carregando detalhes...';
				btnC.disabled = false;
				btnFech.style.display = '';
				btnReport.style.display = '';
				inputAtendente.style.display = '';
				btnF.disabled = false;
				btnF.innerHTML = '&#9654; BUSCAR TUDO';

				// Enriquecer apenas rotas que precisam de detalhe
				// Enriquecer apenas primeira ocorrência de cada ID
				var seenIds = {};
				var toEnrich = allRoutes.filter(function (r) {
					if (seenIds[r.id]) return false; // duplicata — vai herdar os dados
					seenIds[r.id] = true;
					return true; // busca detail de todas as rotas para insucessos corretos
				});
				// Marca rotas 100% com badge
				allRoutes.forEach(function (r) {
					if (isClosed(r) && getProg(r) >= 100) r._complete = true;
				});

				enrichTotal = allRoutes.length;
				// Contar rotas já prontas (100% + duplicatas)
				enrichDone = allRoutes.filter(function (r) {
					return (isClosed(r) && getProg(r) >= 100) || seenIds[r.id] === 2;
				}).length;
				enrichDone = allRoutes.length - toEnrich.length;
				var pw2 = $id('mlm_prog_wrap');
				if (pw2) pw2.style.display = 'flex';
				var pb2 = $id('mlm_pause_btn');
				if (pb2) pb2.style.display = '';
				updateProgress();
				enrichRoutes(toEnrich, ssc);
			}).catch(function (e) {
				stEl.style.color = S.er;
				stEl.textContent = 'Erro: ' + e.message;
				btnF.disabled = false;
				btnF.innerHTML = '&#9654; BUSCAR TUDO';
			});
		}

		function updateProgress() {
			var pct = enrichTotal > 0 ? Math.round((enrichDone / enrichTotal) * 100) : 0;
			var pf = $id('mlm_prog_fill');
			if (pf) pf.style.width = pct + '%';
			var pl = $id('mlm_prog_lbl');
			if (pl) pl.textContent = enrichDone + '/' + enrichTotal + ' detalhes';
			if (enrichDone >= enrichTotal) {
				var pw = $id('mlm_prog_wrap');
				if (pw) pw.style.display = 'none';
				var pb = $id('mlm_pause_btn');
				if (pb) pb.style.display = 'none';
				var failed = allRoutes.filter(function (r) {
					return r._failed;
				});
				if (failed.length > 0) {
					stEl.style.color = S.wn;
					stEl.textContent = allRoutes.length + ' rotas (' + failed.length + ' falharam)';
					var btnRetry = $id('mlm_retry_btn');
					if (!btnRetry) {
						btnRetry = mk('button', 'background:transparent;border:1px solid ' + S.wn + ';color:' + S.wn + ';padding:4px 10px;border-radius:4px;font-family:' + mn + ';font-size:10px;cursor:pointer;margin-left:4px', '↻ Retentar ' + failed.length);
						btnRetry.id = 'mlm_retry_btn';
						btnRetry.onclick = function () {
							btnRetry.remove();
							failed.forEach(function (r) {
								delete r._failed;
								delete r._m;
							});
							enrichDone = allRoutes.length - failed.length;
							enrichTotal = allRoutes.length;
							$id('mlm_prog_wrap').style.display = 'flex';
							$id('mlm_pause_btn').style.display = '';
							$id('mlm_pause_btn').textContent = '⏸';
							paused = false;
							enrichRoutes(failed, sSsc.value);
						};
						stEl.parentNode.insertBefore(btnRetry, stEl);
					}
				} else {
					stEl.style.color = S.ok;
					stEl.textContent = allRoutes.length + ' rotas ✓ (100% detalhadas)';
					applyFilters();
					// Notificar casca externa que esta estação concluiu
					if (typeof _stationOnDone === 'function') {
						_stationOnDone();
						_stationOnDone = null;
					}
					// Segunda busca silenciosa — captura rotas que chegaram tarde na API
					(function () {
						var ssc2 = sSsc.value;
						setTimeout(function () {
							fetchPage(1, [], ssc2).then(function (newRoutes) {
								var existingIds = {};
								allRoutes.forEach(function (r) {
									existingIds[r.id] = true;
								});
								var novas = newRoutes.filter(function (r) {
									return !existingIds[r.id];
								});
								if (novas.length > 0) {
									allRoutes = allRoutes.concat(novas);
									window._mlmDebug = allRoutes;
									populateFilters(allRoutes);
									applyFilters();
									stEl.style.color = S.ok;
									stEl.textContent = allRoutes.length + ' rotas ✓ (100% detalhadas)';
								}
							}).catch(function () { });
						}, 3000);
					})();
				}
			}
		}

		// ===== REFRESH AUTOMÁTICO =====
		function stopRefresh() {
			if (refreshTimer) {
				clearTimeout(refreshTimer);
				refreshTimer = null;
			}
			refreshInterval = 0;
			refreshBtn.style.borderColor = S.bd;
			refreshBtn.style.color = S.mt;
			$id('mlm_refresh_label').textContent = 'auto';
		}
		// Pausa temporária sem perder o intervalo configurado (usado ao trocar de estação ativa)
		function pauseRefresh() {
			if (refreshTimer) {
				clearTimeout(refreshTimer);
				refreshTimer = null;
			}
		}
		// Retoma o refresh se havia intervalo configurado (usado ao voltar para a estação)
		function resumeRefresh() {
			if (refreshInterval > 0) scheduleRefresh();
		}

		function startRefresh() {
			var mins = parseInt(refreshInput.value);
			if (!mins || mins < 1) {
				stopRefresh();
				return;
			}
			refreshInterval = mins * 60 * 1000;
			refreshBtn.style.borderColor = S.ok;
			refreshBtn.style.color = S.ok;
			$id('mlm_refresh_label').textContent = 'a cada ' + mins + 'min';
			scheduleRefresh();
		}

		function scheduleRefresh() {
			if (refreshTimer) clearTimeout(refreshTimer);
			if (!refreshInterval) return;
			refreshTimer = setTimeout(function () {
				doRefresh();
			}, refreshInterval);
		}
		refreshBtn.onclick = function () {
			if (refreshInterval > 0) {
				stopRefresh();
			} else {
				var mins = parseInt(refreshInput.value);
				if (mins && mins > 0) startRefresh();
			}
		};

		function doRefresh() {
			if (isRefreshing || paused) return scheduleRefresh();
			if (allRoutes.length === 0) return scheduleRefresh();
			isRefreshing = true;
			var ssc = sSsc.value;
			var labelEl = $id('mlm_refresh_label');
			labelEl.textContent = '🔄 atualizando...';
			// Rebuscar lista completa
			fetchPage(1, [], ssc).then(function (newRoutes) {
				// Identificar rotas novas
				var existingIds = {};
				allRoutes.forEach(function (r) {
					existingIds[r.id] = r;
				});
				var added = [];
				newRoutes.forEach(function (r) {
					if (!existingIds[r.id]) {
						allRoutes.push(r);
						added.push(r);
					}
				});
				// Rotas abertas para atualizar detail
				var toUpdate = allRoutes.filter(function (r) {
					return !isClosed(r);
				});
				// Adicionar rotas novas também
				added.forEach(function (r) {
					if (isClosed(r) && toUpdate.indexOf(r) === -1) toUpdate.push(r);
				});
				if (toUpdate.length === 0) {
					isRefreshing = false;
					applyFilters();
					var mins = Math.round(refreshInterval / 60000);
					labelEl.textContent = '✓ ' + new Date().toLocaleTimeString('pt-BR', {
						hour: '2-digit',
						minute: '2-digit'
					}) + ' · a cada ' + mins + 'min';
					scheduleRefresh();
					return;
				}
				// Atualizar route-detail das rotas abertas + novas
				var done = 0;
				var total = toUpdate.length;
				var BATCH = 2,
					DELAY = 2500,
					bidx = 0;

				function runRefreshBatch() {
					if (bidx >= toUpdate.length) {
						isRefreshing = false;
						applyFilters();
						var mins = Math.round(refreshInterval / 60000);
						labelEl.textContent = '✓ ' + new Date().toLocaleTimeString('pt-BR', {
							hour: '2-digit',
							minute: '2-digit'
						}) + ' · a cada ' + mins + 'min';
						scheduleRefresh();
						return;
					}
					var batch = toUpdate.slice(bidx, bidx + BATCH);
					bidx += BATCH;
					Promise.all(batch.map(function (r) {
						return fetch('https://envios.adminml.com/logistics/api/monitoring-route/route-detail?routeId=' + r.id + '&siteId=MLB', {
							credentials: 'include'
						})
							.then(function (res) {
								return res.json();
							})
							.then(function (detail) {
								var stops = detail.stops || [];
								var del = 0,
									ins = 0,
									pend = 0,
									pnr = 0,
									motivos = {},
									com = 0,
									res2 = 0;
								stops.forEach(function (st) {
									(st.orders || []).forEach(function (o) {
										(o.transportUnits || []).forEach(function (tu) {
											var re2 = tu.relatedEntity || {};
											if (re2.tocCaseId && re2.claimsAmount) {
												pnr++;
												pnrIds.push(re2.tocCaseId);
											}
										});
									});
									(st.packages || []).forEach(function (pk) {
										var fs = pk.frontStatus;
										if (fs === 'delivered' || fs === 'picked_up') {
											del++;
										} else if (fs === 'not_delivered') {
											ins++;
											var d = pk.incidentDescription || 'Outro';
											motivos[d] = (motivos[d] || 0) + 1;
										} else {
											pend++;
										}
									});
								});
								r._m = {
									del: del,
									ins: ins,
									pend: pend,
									pnr: pnr,
									motivos: motivos,
									com: com,
									res: res2,
									comPend: 0,
									vehicleType: (detail.vehicleType || '').toLowerCase(),
									bizStops: []
								};
								done++;
								var pct = Math.round(done / total * 100);
								labelEl.textContent = '🔄 ' + pct + '%';
							}).catch(function () {
								done++;
							});
					})).then(function () {
						setTimeout(runRefreshBatch, DELAY);
					});
				}
				runRefreshBatch();
			}).catch(function () {
				isRefreshing = false;
				scheduleRefresh();
			});
		}

		// ===== ENRIQUECIMENTO =====
		function enrichRoutes(routes, ssc) {
			var BATCH = 2,
				DELAY = 2500,
				idx = 0;
			paused = false;

			window._mlm_pause = function () {
				paused = true;
				stEl.style.color = S.wn;
				stEl.textContent = '⏸ Pausado';
			};
			window._mlm_resume = function () {
				paused = false;
				stEl.style.color = S.ac;
				runBatch();
			};
			btnPause.textContent = '⏸';
			btnPause.onclick = function () {
				if (paused) {
					window._mlm_resume();
					btnPause.textContent = '⏸';
				} else {
					window._mlm_pause();
					btnPause.textContent = '▶';
				}
			};

			function fetchOne(r, attempt) {
				attempt = attempt || 1;
				return fetch('https://envios.adminml.com/logistics/api/monitoring-route/route-detail?routeId=' + r.id + '&siteId=MLB', {
					credentials: 'include'
				})
					.then(function (res) {
						if (res.status === 429) {
							var wait = 5000 * attempt;
							stEl.style.color = S.wn;
							stEl.textContent = '⚠ Rate limit — aguardando ' + Math.round(wait / 1000) + 's...';
							if (attempt >= 5) {
								r._failed = true;
								return {};
							}
							var waitTime = [0, 8000, 15000, 25000, 40000][attempt] || 40000;
							stEl.style.color = S.wn;
							stEl.textContent = '⚠ Rate limit — aguardando ' + (waitTime / 1000) + 's...';
							return new Promise(function (resolve) {
								setTimeout(resolve, waitTime);
							}).then(function () {
								return fetchOne(r, attempt + 1);
							});
						}
						return res.ok ? res.json() : {};
					});
			}

			function processDetail(r, detail) {
				// Compartilhar dados com outras rotas de mesmo ID (duplicatas)
				var sameId = allRoutes.filter(function (x) {
					return x.id === r.id && x !== r;
				});

				var del = 0,
					ins = 0,
					pend = 0,
					pnr = 0,
					motivos = {},
					com = 0,
					res = 0,
					comPend = 0,
					pnrIds = [],
					insColeta = 0,
					insDetails = [],
					pnrDetails = [];
				(detail.stops || []).forEach(function (st) {
					if (st.claimsAmount) {
						(st.orders || []).forEach(function (o) {
							(o.transportUnits || []).forEach(function (tu) {
								var re3 = tu.relatedEntity || {};
								if (re3.tocCaseId && re3.claimsAmount > 0) {
									pnr++;
									pnrIds.push(re3.tocCaseId);
									// Salvar detalhes para aba PNR (todos os status)
									var st3 = re3.tocCaseStatus || '';
									if (st3) {
										var ri3 = re3.receiverInfo || {};
										pnrDetails.push({
											tocCaseId: re3.tocCaseId,
											shipId: re3.id || '',
											status: st3,
											nome: ri3.receiver_name || '',
											fone: (ri3.pone || ri3.phone || '').replace(/\D/g, ''),
											endereco: (ri3.street_name || '') + ' ' + (ri3.street_number || '') + ', ' + (ri3.city || ''),
											ts: re3.timestamp || 0
										});
									}
								}
							});
						});
					}
					(st.orders || []).forEach(function (o) {
						(o.transportUnits || []).forEach(function (tu) {
							var rel = tu.relatedEntity || {};
							var front = rel.frontStatus || '';
							var isBiz = rel.addressType === 'business' || st.addressTypeBusiness;
							if (front === 'delivered') {
								del++;
							} else if (front === 'not_delivered') {
								var desc = tu.incidentDescription || '';
								var motivo = desc.trim() || 'Não entregue';
								if (motivo.toLowerCase() === 'transferido') {
									// ignorar — pacote já está em outra rota
								} else if (motivo.toLowerCase() === 'não estão na agência' || motivo.toLowerCase() === 'nao estao na agencia') {
									insColeta++;
									motivos[motivo] = (motivos[motivo] || 0) + 1;
								} else {
									ins++;
									if (isBiz) com++;
									else res++;
									motivos[motivo] = (motivos[motivo] || 0) + 1;
									// Salvar detalhes para aba Insucessos
									var ri = rel.receiverInfo || {};
									insDetails.push({
										shipId: rel.id || tu.id || '',
										motivo: motivo,
										nome: ri.receiver_name || '',
										fone: (ri.pone || ri.phone || '').replace(/\D/g, ''),
										ts: rel.timestamp || 0,
										seq: st.sequence || ''
									});
								}
							} else if (front === 'picked_up') {
								del++;
							} else {
								pend++;
								if (isBiz) comPend++;
							}
						});
					});
				});
				// Coletar paradas comerciais para o botão Rota
				var bizStops = [];
				(detail.stops || []).forEach(function (st) {
					var stOrders = st.orders || [];
					var stPackages = [];
					stOrders.forEach(function (o) {
						var hours = o.locationHours || null;
						(o.transportUnits || []).forEach(function (tu) {
							var re4 = tu.relatedEntity || {};
							var isBiz4 = re4.addressType === 'business' || st.addressTypeBusiness;
							if (!isBiz4) return;
							var fs4 = re4.frontStatus || tu.status || '';
							var ri4 = re4.receiverInfo || {};
							stPackages.push({
								shipId: re4.id || tu.id || '',
								nome: ri4.receiver_name || '',
								fone: (ri4.pone || ri4.phone || '').replace(/\D/g, ''),
								hours: hours,
								status: fs4
							});
						});
					});
					if (stPackages.length > 0) {
						bizStops.push({
							seq: st.sequence || 0,
							addr: st.stopAddress || '',
							packages: stPackages
						});
					}
				});
				// Coletar paradas de agência (placeId preenchido)
				var agStops = [];
				var agDel = 0;
				var agDesp = 0;
				(detail.stops || []).forEach(function (st) {
					var hasAg = false;
					var agPkgs = 0;
					var agDelSt = 0;
					var agPkgList = [];
					(st.orders || []).forEach(function (o) {
						if (!o.placeId) return;
						hasAg = true;
						(o.transportUnits || []).forEach(function (tu) {
							agPkgs++;
							agDesp++;
							var re5 = tu.relatedEntity || {};
							var fs = re5.frontStatus || tu.status || '';
							var isDel = (fs === 'delivered' || fs === 'picked_up');
							if (isDel) {
								agDel++;
								agDelSt++;
							}
							agPkgList.push({
								shipId: re5.id || tu.id || '',
								status: fs,
								label: tu.printedLabel || ''
							});
						});
					});
					if (hasAg) {
						agStops.push({
							seq: st.sequence || 0,
							addr: st.stopAddress || '',
							total: agPkgs,
							del: agDelSt,
							placeId: (st.orders.find(function (o) {
								return o.placeId;
							}) || {}).placeId || '',
							pkgs: agPkgList
						});
					}
				});
				// Coletar pacotes de devolução (subtype === 'reverse')
				var revDesp = 0;
				var revDel = 0;
				var revPkgs = [];
				(detail.stops || []).forEach(function (st) {
					(st.orders || []).forEach(function (o) {
						if (o.subtype !== 'reverse') return;
						(o.transportUnits || []).forEach(function (tu) {
							revDesp++;
							var re5 = tu.relatedEntity || {};
							var fs = re5.frontStatus || tu.status || '';
							var isDel = (fs === 'delivered' || fs === 'picked_up');
							var isIns = (fs === 'not_delivered' || fs === 'failed');
							if (isDel) revDel++;
							revPkgs.push({
								shipId: re5.id || tu.id || '',
								status: fs,
								label: tu.printedLabel || ''
							});
						});
					});
				});
				r._m = {
					del: del,
					ins: ins,
					pend: pend,
					pnr: pnr,
					motivos: motivos,
					com: com,
					res: res,
					comPend: comPend,
					pnrIds: pnrIds,
					insColeta: insColeta,
					insDetails: insDetails,
					pnrDetails: pnrDetails,
					bizStops: bizStops,
					agStops: agStops,
					agDel: agDel,
					agDesp: agDesp,
					revDesp: revDesp,
					revDel: revDel,
					revPkgs: revPkgs
				};
				// Compartilhar com duplicatas
				sameId.forEach(function (dup) {
					dup._m = r._m;
				});
			}

			function runBatch() {
				if (paused || idx >= routes.length) return;
				var batch = routes.slice(idx, idx + BATCH);
				idx += BATCH;
				Promise.all(batch.map(function (r) {
					return fetchOne(r).then(function (detail) {
						if (!r._failed) processDetail(r, detail);
					}).finally(function () {
						enrichDone++;
						updateProgress();
						requestAnimationFrame(function () {
							applyFilters();
						});
					});
				})).then(function () {
					if (!paused && idx < routes.length) setTimeout(runBatch, DELAY);
				});
			}
			runBatch();
		}

		// ===== TAGS MOTIVO =====
		function motivoTags(r) {
			var mx = getMotivos(r);
			return Object.keys(mx).filter(function (k) {
				return mx[k] > 0;
			}).map(function (k) {
				return '<span style="background:rgba(255,82,82,.13);color:' + S.er + ';padding:1px 5px;border-radius:3px;font-size:9px;margin-right:2px;white-space:nowrap">' + k + ' (' + mx[k] + ')</span>';
			}).join('');
		}

		// ===== RENDER =====
		function render(routes) {
			if (!routes || !routes.length) {
				body.innerHTML = '<div style="padding:40px;text-align:center;color:' + S.mt + ';font-family:' + mn + '">Nenhuma rota com os filtros selecionados.</div>';
				return;
			}

			// ABA ROTAS
			if (curTab === 'ROTAS') {
				var tbl = '<table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:' + S.sf + ';border-bottom:1px solid ' + S.bd + ';position:sticky;top:0;z-index:1">' +
					['ID', 'TIPO', 'MODAL', 'PLACA', 'TRANSPORTADORA', 'MOTORISTA', 'STATUS', 'ENTREGUES', 'PENDENTES', 'COMERCIAL', 'PNR', 'INSUCESSOS / MOTIVOS', 'PROGRESSO'].map(th).join('') +
					'</tr></thead><tbody>';
				routes.forEach(function (r) {
					var closed = isClosed(r);
					var drv = (r.driver && r.driver.driverName) || '—';
					var car = r.carrier || '—';
					var modal = (r.vehicle && r.vehicle.description) || '—';
					var placa = (r.vehicle && r.vehicle.license) || '—';
					var prog = getProg(r);
					var ins = getInsuc(r);
					var pend = getPend(r);
					var del = getDel(r);
					var pnr = getPNR(r);
					var ic = ins > 5 ? S.er : ins > 0 ? S.wn : S.mt;
					var tipoBadge = r.isDeliveryPickupRoute ? '<span style="background:rgba(167,139,250,.15);color:' + S.pu + ';padding:1px 5px;border-radius:3px;font-size:9px">MISTA</span>' : r.isPickupRoute ? '<span style="background:rgba(0,212,255,.15);color:' + S.ac + ';padding:1px 5px;border-radius:3px;font-size:9px">COLETA</span>' : '<span style="background:rgba(0,230,118,.1);color:' + S.ok + ';padding:1px 5px;border-radius:3px;font-size:9px">ENTREGA</span>';
					// Rota 100% completa — badge especial
					// Botão Rota — aparece sempre que r._m existe
					var comBtn = '';
					if (r._m) {
						var bizS = r._m.bizStops || [];
						var bizMap = {};
						bizS.forEach(function (bs) {
							var key = bs.seq + '|' + bs.addr;
							if (!bizMap[key]) bizMap[key] = {
								seq: bs.seq,
								addr: bs.addr,
								packages: bs.packages.slice()
							};
							else bizMap[key].packages = bizMap[key].packages.concat(bs.packages);
						});
						var bizList = Object.values(bizMap).sort(function (a, b) {
							return a.seq - b.seq;
						});
						var totalBiz = bizList.reduce(function (a, b) {
							return a + b.packages.length;
						}, 0);
						var totalPend = getPend(r);
						var totalRes = Math.max(0, totalPend - totalBiz);
						var drv2 = (r.driver && r.driver.driverName) || '—';
						var nomeM = drv2.split(' ')[0];
						var hoje = new Date().toLocaleDateString('pt-BR');
						var msgR = '📋 *REPORTE DE ROTA — ' + drv2 + '*\n📅 *' + hoje + '*\n\n';
						msgR += nomeM + ', você tem *' + totalPend + ' pacotes pendentes* na sua rota hoje:\n\n';
						msgR += '🏠 *Residenciais: ' + totalRes + ' pacotes*\n';
						msgR += '🏢 *Comerciais: ' + totalBiz + ' pacotes*\n';
						if (bizList.length > 0) {
							msgR += '\n*Detalhe das paradas comerciais:*\n\n';
							bizList.forEach(function (biz) {
								msgR += '*Parada ' + biz.seq + '* — ' + biz.addr + '\n';
								var h = biz.packages[0] && biz.packages[0].hours;
								if (h) {
									if (h.isClosed) msgR += '⚠️ Estabelecimento fechado\n';
									else if (h.isOpenAllTime) msgR += '🕒 Funciona 24h\n';
									else if (h.openHoursRanges && h.openHoursRanges.from && h.openHoursRanges.to) msgR += '🕒 ' + h.openHoursRanges.from + ' às ' + h.openHoursRanges.to + '\n';
								}
								var cliMap = {};
								biz.packages.forEach(function (p) {
									var ck = p.fone + '|' + p.nome;
									if (!cliMap[ck]) cliMap[ck] = {
										nome: p.nome,
										fone: p.fone,
										ids: [],
										status: p.status || ''
									};
									cliMap[ck].ids.push(p.shipId);
								});
								Object.values(cliMap).forEach(function (cl) {
									var fDisp = cl.fone ? cl.fone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '';
									var stIcon = cl.status === 'delivered' || cl.status === 'picked_up' ? '✅' : '⏳';
									msgR += stIcon + ' #' + cl.ids.join(', #') + '\n';
									msgR += '👤 ' + cl.nome + '\n';
									if (fDisp) msgR += '📞 ' + fDisp + '\n';
								});
								msgR += '\n';
							});
						}
						var _telRota = (drv2 && drv2 !== '—' && drv2.length > 2) ? _getPhone(drv2) : null;
						var _btnRota = '<span data-copyrep="' + encodeURIComponent(msgR) + '" style="background:' + S.pu + ';color:#fff;font-size:9px;padding:2px 7px;border-radius:3px;cursor:pointer;font-family:' + mn + ';font-weight:600">📋 Rota</span>';
						if (_telRota) _btnRota += '<a href="whatsapp://send?phone=' + _telRota + '&text=' + encodeURIComponent(msgR) + '" style="background:#25D366;color:#fff;font-size:9px;padding:2px 7px;border-radius:3px;text-decoration:none;font-family:' + mn + ';font-weight:600;margin-left:3px">📲</a>';
						comBtn = '<div style="display:flex;gap:2px;justify-content:center">' + _btnRota + '</div>';
					}
					var delCell, pendCell, insCell, pnrCell, progCell, comPendCell;
					var cp = getComPend(r);
					if (r._complete) {
						var checkBadge = '<span style="color:' + S.ok + ';font-size:14px">✅</span>';
						delCell = checkBadge;
						pendCell = checkBadge;
						insCell = checkBadge;
						pnrCell = checkBadge;
						comPendCell = '<div style="display:flex;align-items:center;gap:4px"><span style="font-family:' + mn + ';color:' + S.mt + '">' + cp + '</span>' + comBtn + '</div>';
						progCell = progBar(100);
					} else if (!r._m) {
						var dots = '<span style="color:' + S.mt + ';font-size:10px">...</span>';
						delCell = dots;
						pendCell = dots;
						insCell = dots;
						pnrCell = dots;
						comPendCell = dots;
						progCell = progBar(prog);
					} else {
						delCell = '<span style="font-family:' + mn + ';color:' + S.ok + '">' + del + '</span>';
						pendCell = '<span style="font-family:' + mn + ';color:' + (pend > 0 ? S.ac2 : S.mt) + '">' + pend + '</span>';
						comPendCell = '<div style="display:flex;align-items:center;gap:4px"><span style="font-family:' + mn + ';color:' + (cp > 0 ? S.wn : S.mt) + '">' + cp + '</span>' + comBtn + '</div>';
						var pids = (r._m && r._m.pnrIds) || [];
						if (pnr > 0 && pids.length > 0) {
							pnrCell = pids.map(function (cid) {
								return '<span data-caseid="' + cid + '" style="cursor:pointer;color:#f87171;font-family:' + mn + ';margin-right:4px;text-decoration:underline" title="Abrir caso PNR">' + cid + '</span>';
							}).join(' ');
						} else {
							pnrCell = '<span style="font-family:' + mn + ';color:' + (pnr > 0 ? '#f87171' : S.mt) + '">' + pnr + '</span>';
						}
						insCell = '<div style="display:flex;align-items:center;flex-wrap:wrap;gap:2px"><span style="font-family:' + mn + ';font-weight:700;color:' + ic + ';font-size:13px;margin-right:3px">' + ins + '</span>' + motivoTags(r) + '</div>';
						progCell = progBar(prog);
					}
					tbl += '<tr style="border-bottom:1px solid ' + S.bd + '" onmouseover="this.style.background=\'#1a2235\'" onmouseout="this.style.background=\'transparent\'">' +
						td('font-family:' + mn + ';color:' + S.ac, r.id + '<span data-routeid="' + r.id + '" style="cursor:pointer;color:' + S.mt + ';margin-left:5px;font-size:11px;opacity:.8;user-select:none" title="Abrir rota">↗</span>') +
						td('', tipoBadge) +
						td('font-family:' + mn + ';color:' + S.mt, modal) +
						td('font-family:' + mn, placa) +
						td('font-family:' + mn + ';max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', '<span title="' + car + '">' + car + '</span>') +
						td('font-family:' + mn + ';max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', '<span title="' + drv + '">' + drv + '</span>') +
						td('', badge(closed)) +
						td('', delCell) +
						td('', pendCell) +
						td('text-align:center', comPendCell) +
						td('', pnrCell) +
						td('max-width:230px', insCell) +
						td('', progCell) +
						'</tr>';
				});
				body.innerHTML = tbl + '</tbody></table>';
			}

			// ABA OFENSORAS
			else if (curTab === 'OFENSORAS') {
				var byIns = routes.slice().sort(function (a, b) {
					return getInsuc(b) - getInsuc(a);
				}).slice(0, 10);
				var byPend = routes.slice().sort(function (a, b) {
					return getPend(b) - getPend(a);
				}).slice(0, 10);
				var byProg = routes.filter(function (r) {
					return !isClosed(r);
				}).sort(function (a, b) {
					return getProg(a) - getProg(b);
				}).slice(0, 10);

				function mkRepCell(r, drv) {
					var dets = (r._m && r._m.insDetails) || [];
					if (!dets.length) return td('', '—');
					var grouped = {};
					dets.forEach(function (d) {
						var k = d.fone + '|' + d.nome;
						if (!grouped[k]) grouped[k] = {
							nome: d.nome,
							fone: d.fone,
							ids: [],
							motivos: []
						};
						grouped[k].ids.push(d.shipId);
						grouped[k].motivos.push(d.motivo);
					});
					var lines = Object.values(grouped).map(function (g) {
						var fDisp = g.fone ? g.fone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '—';
						return '📦 ' + g.ids.map(function (id) {
							return '#' + id;
						}).join(', ') + '\n❌ ' + [...new Set(g.motivos)].join(', ') + '\n👤 ' + g.nome + '\n📞 ' + fDisp;
					}).join('\n\n');
					var nomeMotorista = drv.split(' ')[0];
					var hoje = new Date().toLocaleDateString('pt-BR');
					var repTxt = '📋 *REPORTE INSUCESSOS — ' + drv + '*\n📍 *Rota: #' + r.id + '*\n📅 *' + hoje + '*\n\n' +
						nomeMotorista + ', vejo que tem ' + dets.length + ' pacote(s) com insucesso em sua rota, por favor busque a reversão desses casos:\n\n' +
						lines;
					var _telOf = _getPhone(drv);
					var _ofBtns = '<span data-copyrep="' + encodeURIComponent(repTxt) + '" style="background:' + S.pu + ';color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;font-family:' + mn + ';font-weight:600;white-space:nowrap">📋 Reporte</span>';
					if (_telOf) _ofBtns += '<a href="whatsapp://send?phone=' + _telOf + '&text=' + encodeURIComponent(repTxt) + '" style="background:#25D366;color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;text-decoration:none;font-family:' + mn + ';font-weight:600;white-space:nowrap;margin-left:4px">📲</a>';
					return td('', _ofBtns);
				}

				function rankTable(title, color, list, getVal, valLabel, showMotivos) {
					if (!list.length) return '';
					var maxV = Math.max(getVal(list[0]), 1);
					var html = '<div style="background:' + S.sf + ';border:1px solid ' + S.bd + ';border-radius:8px;overflow:hidden;margin-bottom:16px">' +
						'<div style="padding:10px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid ' + S.bd + '">' +
						'<div style="width:8px;height:8px;border-radius:50%;background:' + color + '"></div>' +
						'<span style="font-family:' + mn + ';font-size:11px;font-weight:600;color:' + color + ';text-transform:uppercase;letter-spacing:.5px">' + title + '</span>' +
						'</div><table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:' + S.sf2 + '">' +
						'<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + ';width:28px">#</th>' +
						'<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">ROTA / CLUSTER</th>' +
						'<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">TRANSPORTADORA</th>' +
						'<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">MOTORISTA</th>' +
						'<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">STATUS</th>' +
						(showMotivos ? '<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">COM/RES/PNR</th>' : '') +
						(showMotivos ? '<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">MOTIVOS</th>' : '') +
						(showMotivos ? '<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">REPORTE</th>' : '') +
						'<th style="padding:6px 10px;font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-align:right;min-width:160px">' + valLabel + '</th>' +
						'</tr></thead><tbody>';
					list.forEach(function (r, i) {
						var val = getVal(r);
						var pct = (val / maxV) * 100;
						var drv = (r.driver && r.driver.driverName) || '—';
						var car = r.carrier || '—';
						var rankC = i === 0 ? S.er : i === 1 ? S.ac2 : i === 2 ? S.wn : S.mt;
						var valCell = '<div style="display:flex;align-items:center;gap:8px;justify-content:flex-end">' +
							'<div style="width:80px;height:6px;border-radius:3px;background:' + S.sf2 + ';overflow:hidden"><div style="height:100%;background:' + color + ';width:' + pct.toFixed(0) + '%"></div></div>' +
							'<span style="font-family:' + mn + ';font-weight:700;color:' + color + ';min-width:30px;text-align:right">' + val + '</span></div>';
						var comResCell = showMotivos ? td('font-family:' + mn + ';font-size:10px;white-space:nowrap', '🏢' + getCom(r) + ' 🏠' + getRes(r) + (getPNR(r) > 0 ? ' 🔴PNR:' + getPNR(r) : '')) : '';
						var motivCell = showMotivos ? td('max-width:200px', motivoTags(r)) : '';
						html += '<tr style="border-bottom:1px solid ' + S.bd + '" onmouseover="this.style.background=\'#1a2235\'" onmouseout="this.style.background=\'transparent\'">' +
							'<td style="padding:8px 10px;font-family:' + mn + ';color:' + rankC + ';font-weight:700;font-size:14px">' + (i + 1) + '</td>' +
							'<td style="padding:8px 10px"><div style="font-family:' + mn + ';color:' + S.ac + '">' + r.id + '</div><div style="font-size:10px;color:' + S.mt + '">' + (r.cluster || '—') + '</div></td>' +
							'<td style="padding:8px 10px;font-family:' + mn + ';font-size:11px;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + car + '">' + car + '</td>' +
							'<td style="padding:8px 10px;font-family:' + mn + ';font-size:11px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="' + drv + '">' + drv + '</td>' +
							'<td style="padding:8px 10px">' + badge(isClosed(r)) + '</td>' +
							comResCell + motivCell +
							(showMotivos ? mkRepCell(r, drv) : '') +
							'<td style="padding:8px 10px">' + valCell + '</td></tr>';
					});
					return html + '</tbody></table></div>';
				}
				body.innerHTML = '<div style="padding:16px">' +
					rankTable('🔴 Top 10 — Mais Insucessos', S.er, byIns, getInsuc, 'INSUCESSOS', true) +
					rankTable('🟠 Top 10 — Mais Pendentes', S.ac2, byPend, getPend, 'PENDENTES', false) +
					rankTable('⚠️ Top 10 — Menor Progresso (abertas)', S.wn, byProg, getProg, 'PROGRESSO %', false) +
					'</div>';
				body.querySelectorAll('[data-copyrep]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						var msg = decodeURIComponent(el.dataset.copyrep);
						navigator.clipboard.writeText(msg).catch(function () {
							var ta = document.createElement('textarea');
							ta.value = msg;
							document.body.appendChild(ta);
							ta.select();
							document.execCommand('copy');
							document.body.removeChild(ta);
						});
						var orig = el.textContent;
						el.textContent = '✅ Copiado!';
						setTimeout(function () {
							el.textContent = orig;
						}, 2000);
					});
				});
			}

			// ABA INSUCESSOS
			else if (curTab === 'INSUCESSOS') {
				var totDel = 0,
					totIns = 0,
					totPend = 0,
					totPNR = 0,
					totCom = 0,
					totRes = 0;
				var allMot = {},
					allMotCom = {},
					allMotRes = {};
				routes.forEach(function (r) {
					totDel += getDel(r);
					totIns += getInsuc(r);
					totPend += getPend(r);
					totPNR += getPNR(r);
					totCom += getCom(r);
					totRes += getRes(r);
					var mx = getMotivos(r);
					Object.keys(mx).forEach(function (k) {
						if (mx[k] > 0) {
							allMot[k] = (allMot[k] || 0) + mx[k];
						}
					});
				});
				var totPkg = totDel + totIns + totPend;
				var dPct = totPkg > 0 ? ((totDel / totPkg) * 100).toFixed(1) : 0;
				var iPct = totPkg > 0 ? ((totIns / totPkg) * 100).toFixed(1) : 0;
				var pPct = totPkg > 0 ? ((totPend / totPkg) * 100).toFixed(1) : 0;
				var dt = totDel + totIns;
				var ds = dt > 0 ? ((totDel / dt) * 100).toFixed(1) + '%' : '—';
				var sortedMot = Object.keys(allMot).map(function (k) {
					return [k, allMot[k]];
				}).sort(function (a, b) {
					return b[1] - a[1];
				});

				var g = '<div style="padding:16px">' +
					'<div style="margin-bottom:14px;background:' + S.sf + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:14px">' +
					'<div style="font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">STATUS — ' + routes.length + ' ROTAS FILTRADAS</div>' +
					'<div style="display:flex;height:22px;border-radius:6px;overflow:hidden;margin-bottom:10px">' +
					'<div style="background:' + S.ok + ';width:' + dPct + '%;display:flex;align-items:center;justify-content:center"><span style="font-size:9px;color:#000;font-weight:600;font-family:' + mn + '">' + (parseFloat(dPct) > 8 ? dPct + '%' : '') + '</span></div>' +
					'<div style="background:' + S.er + ';width:' + iPct + '%;display:flex;align-items:center;justify-content:center"><span style="font-size:9px;color:#fff;font-weight:600;font-family:' + mn + '">' + (parseFloat(iPct) > 4 ? iPct + '%' : '') + '</span></div>' +
					'<div style="background:' + S.ac2 + ';width:' + pPct + '%;display:flex;align-items:center;justify-content:center"><span style="font-size:9px;color:#000;font-weight:600;font-family:' + mn + '">' + (parseFloat(pPct) > 8 ? pPct + '%' : '') + '</span></div>' +
					'</div>' +
					'<div style="display:flex;gap:16px">' +
					'<span style="font-size:11px;color:' + S.ok + '">&#9632; Entregues ' + dPct + '%</span>' +
					'<span style="font-size:11px;color:' + S.er + '">&#9632; Insucessos ' + iPct + '%</span>' +
					'<span style="font-size:11px;color:' + S.ac2 + '">&#9632; Pendentes ' + pPct + '%</span>' +
					'</div></div>' +
					'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px">' +
					[[S.er, 'INSUCESSOS', totIns],
					[S.ok, 'ENTREGUES', totDel],
					[S.ac2, 'PENDENTES', totPend],
					['#f87171', 'PNR', totPNR],
					[S.pu, 'DS%', ds],
					['#fb923c', 'COMERCIAIS', totCom],
					['#60a5fa', 'RESIDENCIAIS', totRes],
					[S.tx, 'C/ INSUCESSO', routes.filter(function (r) {
						return getInsuc(r) > 0;
					}).length]
					].map(function (c) {
						return '<div style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:12px"><div style="font-size:10px;color:' + S.mt + ';text-transform:uppercase;margin-bottom:4px;letter-spacing:.5px">' + c[1] + '</div><div style="font-family:' + mn + ';font-size:22px;color:' + c[0] + ';font-weight:600">' + c[2] + '</div></div>';
					}).join('') + '</div>';

				if (sortedMot.length) {
					var totM = sortedMot.reduce(function (s, m) {
						return s + m[1];
					}, 0);
					g += '<div style="background:' + S.sf + ';border:1px solid ' + S.bd + ';border-radius:8px;overflow:hidden">' +
						'<div style="padding:10px 14px;font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid ' + S.bd + '">INSUCESSOS POR MOTIVO</div>' +
						'<table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:' + S.sf2 + '">' +
						'<th style="padding:6px 12px;text-align:left;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">MOTIVO</th>' +
						'<th style="padding:6px 12px;text-align:right;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">QTD</th>' +
						'<th style="padding:6px 12px;font-family:' + mn + ';font-size:10px;color:' + S.mt + '">PARTICIPAÇÃO</th>' +
						'</tr></thead><tbody>';
					sortedMot.forEach(function (kv) {
						var pct = totM > 0 ? ((kv[1] / totM) * 100).toFixed(1) : 0;
						g += '<tr style="border-bottom:1px solid ' + S.bd + '">' +
							'<td style="padding:7px 12px;font-family:' + mn + '">' + kv[0] + '</td>' +
							'<td style="padding:7px 12px;font-family:' + mn + ';color:' + S.er + ';font-weight:600;text-align:right">' + kv[1] + '</td>' +
							'<td style="padding:7px 12px"><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:3px;background:' + S.sf2 + ';overflow:hidden"><div style="height:100%;background:' + S.er + ';width:' + pct + '%"></div></div><span style="font-family:' + mn + ';font-size:10px;color:' + S.mt + ';min-width:36px">' + pct + '%</span></div></td></tr>';
					});
					g += '</tbody></table></div>';
				}
				// Seção de rotas com insucessos — expansível
				var rotasIns = routes.filter(function (r) {
					return getInsuc(r) > 0;
				}).sort(function (a, b) {
					return getInsuc(b) - getInsuc(a);
				});
				if (rotasIns.length > 0) {
					g += '<div style="background:' + S.sf + ';border:1px solid ' + S.bd + ';border-radius:8px;overflow:hidden;margin-top:14px">';
					g += '<div style="padding:10px 14px;font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid ' + S.bd + '">INSUCESSOS POR ROTA</div>';
					// Função renderizar rota na aba insucessos
					function renderInsRota(r) {
						var drv = (r.driver && r.driver.driverName) || '—';
						var ni = getInsuc(r);
						var rid = 'ins_' + r.id;
						var details = (r._m && r._m.insDetails) || [];
						var pend = getPend(r);
						var sacPend = parseInt((r.counters && r.counters.pendingBags) || 0);
						var groupedIns = {};
						details.forEach(function (d) {
							var k = d.fone + '|' + d.nome;
							if (!groupedIns[k]) groupedIns[k] = {
								nome: d.nome,
								fone: d.fone,
								ids: [],
								motivos: [],
								seq: d.seq || ''
							};
							groupedIns[k].ids.push(d.shipId);
							groupedIns[k].motivos.push(d.motivo);
						});
						var repLinesIns = Object.values(groupedIns).map(function (g2) {
							var fDisp2 = g2.fone ? g2.fone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '—';
							var seqStr = g2.seq ? (' - Parada ' + g2.seq) : '';
							return '📦 #' + g2.ids.join(', #') + seqStr + '\n❌ ' + [...new Set(g2.motivos)].join(', ') + '\n👤 ' + g2.nome + '\n📞 ' + fDisp2;
						}).join('\n\n');
						var nomeMotIns = drv.split(' ')[0];
						var hojeIns = new Date().toLocaleDateString('pt-BR');
						var allInsIds = details.map(function (d) {
							return '#' + d.shipId;
						}).join(', ');
						var repCompleto = '📋 *REPORTE DE ROTA — ' + drv + '*\n📍 *Rota: #' + r.id + '*\n📅 *' + hojeIns + '*\n\n';
						repCompleto += '📦 *PENDENTES: ' + pend + ' pacotes' + (sacPend > 0 ? ' | ' + sacPend + ' sacas' : '') + '*\n\n';
						repCompleto += '❌ *INSUCESSOS: ' + ni + ' pacote(s)*\n\n' + repLinesIns;
						var repTxtIns = '📋 *REPORTE INSUCESSOS — ' + drv + '*\n📍 *Rota: #' + r.id + '*\n📅 *' + hojeIns + '*\n\n' +
							nomeMotIns + ', vejo que tem ' + ni + ' pacote(s) com insucesso em sua rota, por favor busque a reversão desses casos:\n\n' +
							repLinesIns;
						var _telIns = _getPhone(drv);
						var gh = '';
						gh += '<div style="border-bottom:1px solid ' + S.bd + '">';
						gh += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px" onmouseover="this.style.background=\'' + S.sf2 + '\'" onmouseout="this.style.background=\'transparent\'">';
						gh += '<div data-insid="' + rid + '" style="cursor:pointer;display:flex;align-items:center;gap:10px;flex:1">';
						gh += '<span style="font-family:' + mn + ';font-size:10px;color:' + S.ac + '">▶</span>';
						gh += '<span style="font-family:' + mn + ';font-size:12px;color:' + S.tx + ';font-weight:600">' + r.id + '</span>';
						gh += '<span style="font-size:11px;color:' + S.mt + '">' + drv + '</span>';
						gh += '<span style="font-family:' + mn + ';font-size:12px;color:' + S.er + ';font-weight:600">' + ni + ' insucessos</span>';
						if (_telIns) {
							gh += '<a href="whatsapp://send?phone=' + _telIns + '&text=' + encodeURIComponent(repTxtIns) + '" style="background:#25D366;color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;text-decoration:none;font-family:' + mn + ';font-weight:600">📲 WhatsApp</a>';
						}
						gh += '</div>';
						gh += '<div style="display:flex;align-items:center;gap:8px">';
						gh += '<span data-copyrep="' + encodeURIComponent(repTxtIns) + '" style="background:' + S.pu + ';color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;font-family:' + mn + ';font-weight:600">📋 Reporte</span>';
						if (_telIns) {
							gh += '<a href="whatsapp://send?phone=' + _telIns + '&text=' + encodeURIComponent(repTxtIns) + '" style="background:#25D366;color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;text-decoration:none;font-family:' + mn + ';font-weight:600">📲</a>';
						}
						gh += '</div>';
						gh += '</div>';
						gh += '</div>';
						// Detalhes expansíveis dos pacotes
						gh += '<div id="' + rid + '" style="display:none;padding:0 14px 10px 14px">';
						if (details.length > 0) {
							var clientMap = {};
							details.forEach(function (d) {
								var key = (d.fone || d.nome || 'sem_cliente') + '|' + (d.nome || '');
								if (!clientMap[key]) clientMap[key] = {
									nome: d.nome,
									fone: d.fone,
									motivos: {},
									shipIds: [],
									ts: d.ts,
									seq: d.seq || ''
								};
								clientMap[key].shipIds.push(d.shipId);
								clientMap[key].motivos[d.motivo] = (clientMap[key].motivos[d.motivo] || 0) + 1;
							});
							Object.values(clientMap).forEach(function (cl) {
								var fone = cl.fone || '';
								var foneDisplay = fone ? fone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : fone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
								var dataEntrega = cl.ts > 0 ? new Date(cl.ts * 1000).toLocaleDateString('pt-BR') : '';
								var motList = Object.keys(cl.motivos).join(', ');
								var idsStr = cl.shipIds.map(function (id) {
									return '#' + id;
								}).join(', ');
								var seqInfo = cl.seq ? (' - Parada: ' + cl.seq) : '';
								var pedidos = cl.shipIds.length > 1 ? 'dos seus pedidos *#' + cl.shipIds.join('*, *#') + '*' : 'do seu pedido *#' + cl.shipIds[0] + '*' + seqInfo;
								var msgWpp = encodeURIComponent('Olá, *' + cl.nome + '*! 👋\n\nSou da equipe de entregas do *Mercado Livre*.\n\nHoje tentamos realizar a entrega ' + pedidos + ', mas infelizmente não conseguimos concluí-la.\n\nPara reagendarmos a entrega, precisamos que você confirme:\n✅ Disponibilidade de horário\n✅ Endereço de entrega correto\n\nPor favor, responda esta mensagem para que possamos garantir a entrega do seu pedido! 📦\n\nAguardamos seu retorno. 😊');
								var wppUrl = fone ? 'whatsapp://send?phone=55' + fone + '&text=' + msgWpp : '';
								var msgRaw = 'Olá, *' + cl.nome + '*! 👋\n\nSou da equipe de entregas do *Mercado Livre*.\n\nHoje tentamos realizar a entrega ' + pedidos + ', mas infelizmente não conseguimos concluí-la.\n\nPara reagendarmos a entrega, precisamos que você confirme:\n✅ Disponibilidade de horário\n✅ Endereço de entrega correto\n\nPor favor, responda esta mensagem para que possamos garantir a entrega do seu pedido! 📦\n\nAguardamos seu retorno. 😊';
								gh += '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid ' + S.bd + ';flex-wrap:wrap">';
								gh += '<span style="font-family:' + mn + ';font-size:10px;color:' + S.ac + '">📦 ' + idsStr + '</span>';
								gh += '<span style="font-size:10px;color:' + S.er + '">' + motList + '</span>';
								gh += '<span style="font-size:10px;color:' + S.tx + '">' + cl.nome + '</span>';
								if (foneDisplay) gh += '<span style="font-size:10px;color:' + S.mt + '">📞 ' + foneDisplay + '</span>';
								if (dataEntrega) gh += '<span style="font-size:10px;color:' + S.mt + '">' + dataEntrega + '</span>';
								if (fone) {
									gh += '<a data-wppurl="' + wppUrl + '" style="background:#25D366;color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;text-decoration:none;font-family:' + mn + ';font-weight:600">WhatsApp ↗</a>';
									gh += '<span data-copymsg="' + encodeURIComponent(msgRaw) + '" style="background:' + S.sf2 + ';color:' + S.ac + ';font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;border:1px solid ' + S.bd + ';font-family:' + mn + ';font-weight:600">📋 Copiar</span>';
								}
								gh += '</div>';
							});
						} else {
							gh += '<div style="font-size:11px;color:' + S.mt + ';padding:6px 0">Carregando detalhes...</div>';
						}
						gh += '</div></div>';
						return gh;
					}
					// Separar rotas: abertas = started/ready; finalizadas = todo o resto
					var rotasInsAb = rotasIns.filter(function (r) {
						var s = r.status || '';
						return s === 'started' || s === 'ready' || s === 'active';
					});
					var rotasInsFech = rotasIns.filter(function (r) {
						var s = r.status || '';
						return s !== 'started' && s !== 'ready' && s !== 'active';
					});
					if (rotasInsAb.length > 0) {
						g += '<div style="padding:6px 14px;font-size:10px;font-family:' + mn + ';color:' + S.wn + ';background:rgba(255,171,64,.08);border-bottom:1px solid ' + S.bd + '">🟡 EM ANDAMENTO (' + rotasInsAb.length + ')</div>';
						rotasInsAb.forEach(function (r) {
							g += renderInsRota(r);
						});
					}
					if (rotasInsFech.length > 0) {
						g += '<div style="padding:6px 14px;font-size:10px;font-family:' + mn + ';color:' + S.mt + ';background:rgba(100,116,139,.08);border-bottom:1px solid ' + S.bd + '">✅ FINALIZADAS (' + rotasInsFech.length + ')</div>';
						rotasInsFech.forEach(function (r) {
							g += renderInsRota(r);
						});
					}

					g += '</div>';
				}
				body.innerHTML = g + '</div>';
				// Event listeners para expansão e WhatsApp
				body.querySelectorAll('[data-insid]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						if (e.target.closest('[data-copyrep]')) return;
						var target = document.getElementById(el.dataset.insid);
						if (!target) return;
						var open = target.style.display === 'block';
						target.style.display = open ? 'none' : 'block';
						var arrow = el.querySelector('span');
						if (arrow) arrow.textContent = open ? '▶' : '▼';
					});
				});
				body.querySelectorAll('[data-wppurl]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						window.open(el.dataset.wppurl, 'whatsapp_mlm');
					});
				});
				body.querySelectorAll('[data-copymsg]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						var msg = decodeURIComponent(el.dataset.copymsg);
						navigator.clipboard.writeText(msg).then(function () {
							var orig = el.textContent;
							el.textContent = '✅ Copiado!';
							setTimeout(function () {
								el.textContent = orig;
							}, 2000);
						}).catch(function () {
							var ta = document.createElement('textarea');
							ta.value = msg;
							document.body.appendChild(ta);
							ta.select();
							document.execCommand('copy');
							document.body.removeChild(ta);
							var orig = el.textContent;
							el.textContent = '✅ Copiado!';
							setTimeout(function () {
								el.textContent = orig;
							}, 2000);
						});
					});
				});
			}

			// ABA MOTORISTAS
			else if (curTab === 'MOTORISTAS') {
				var drivers = {};
				routes.forEach(function (r) {
					var name = (r.driver && r.driver.driverName) || 'Sem nome';
					var modal = (r.vehicle && r.vehicle.description) || '—';
					var car = r.carrier || '—';
					var closed = isClosed(r);
					var prog = getProg(r);
					if (!drivers[name]) drivers[name] = {
						rotas: 0,
						modal: modal,
						carrier: car,
						prog: [],
						ab: 0,
						en: 0,
						ins: 0,
						pend: 0,
						del: 0,
						pnr: 0
					};
					var d = drivers[name];
					d.rotas++;
					d.prog.push(prog);
					d.ins += getInsuc(r);
					d.pend += getPend(r);
					d.del += getDel(r);
					d.pnr += getPNR(r);
					if (closed) d.en++;
					else d.ab++;

				});
				var sv = sortSel.value;
				var sorted = Object.keys(drivers).map(function (k) {
					return [k, drivers[k]];
				});
				if (sv === 'insuc_desc') sorted.sort(function (a, b) {
					return b[1].ins - a[1].ins;
				});
				else if (sv === 'insuc_asc') sorted.sort(function (a, b) {
					return a[1].ins - b[1].ins;
				});
				else if (sv === 'pend_desc') sorted.sort(function (a, b) {
					return b[1].pend - a[1].pend;
				});
				else if (sv === 'pend_asc') sorted.sort(function (a, b) {
					return a[1].pend - b[1].pend;
				});
				else sorted.sort(function (a, b) {
					return b[1].rotas - a[1].rotas;
				});

				var tbl2 = '<table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:' + S.sf + ';border-bottom:1px solid ' + S.bd + '">' +
					['MOTORISTA', 'MODAL', 'TRANSPORTADORA', 'ROTAS', 'AB.', 'ENCERR.', 'ENTREGUES', 'PENDENTES', 'PNR', 'INSUCESSOS', 'DS%', 'PROG. MÉDIO'].map(th).join('') +
					'</tr></thead><tbody>';
				sorted.forEach(function (kv) {
					var d = kv[1];
					var avg = d.prog.length ? d.prog.reduce(function (a, b) {
						return a + b;
					}, 0) / d.prog.length : 0;
					var avgS = avg.toFixed(0) + '%';
					var pc = avg >= 90 ? S.ok : avg >= 60 ? S.wn : S.er;
					var ic = d.ins > 5 ? S.er : d.ins > 0 ? S.wn : S.mt;
					var dt2 = d.del + d.ins;
					var ds2 = dt2 > 0 ? ((d.del / dt2) * 100).toFixed(1) + '%' : '—';
					var dsc = dt2 > 0 ? parseFloat(ds2) >= 98.5 ? S.ok : parseFloat(ds2) >= 90 ? S.wn : S.er : S.mt;
					tbl2 += '<tr style="border-bottom:1px solid ' + S.bd + '" onmouseover="this.style.background=\'#1a2235\'" onmouseout="this.style.background=\'transparent\'">' +
						td('font-family:' + mn, kv[0]) +
						td('font-family:' + mn + ';color:' + S.mt, d.modal) +
						td('font-family:' + mn + ';max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap', '<span title="' + d.carrier + '">' + d.carrier + '</span>') +
						td('font-family:' + mn, d.rotas) +
						td('font-family:' + mn + ';color:' + S.wn, d.ab) +
						td('font-family:' + mn + ';color:' + S.ok, d.en) +
						td('font-family:' + mn + ';color:' + S.ok, d.del || '—') +
						td('font-family:' + mn + ';color:' + S.ac2, d.pend || '—') +
						td('font-family:' + mn + ';color:' + (d.pnr > 0 ? '#f87171' : S.mt), d.pnr || '—') +
						td('font-family:' + mn + ';color:' + ic + ';font-weight:600', d.ins) +
						td('font-family:' + mn + ';font-weight:600;color:' + dsc, ds2) +
						'<td style="padding:7px 8px;min-width:130px"><div style="display:flex;align-items:center;gap:6px"><div style="flex:1;height:8px;border-radius:4px;background:' + S.sf2 + ';overflow:hidden"><div style="height:100%;background:' + pc + ';width:' + avg.toFixed(0) + '%"></div></div><span style="font-family:' + mn + ';font-size:10px;color:' + pc + ';font-weight:600;min-width:32px">' + avgS + '</span></div></td>'

						+
						'</tr>';
				});
				body.innerHTML = tbl2 + '</tbody></table>';
			}

			// ABA PNR
			else if (curTab === 'PNR') {
				var atendente = $id('mlm_atendente');
				var nomeAtendente = atendente ? atendente.value.trim() : '';
				// Coletar rotas com PNR — separar por status
				var activePNRFilter = window._mlmPNRFilter2 || 'tratativa';
				var activePNRModal = window._mlmPNRModal || 'all';
				var allRotasPNR = routes.filter(function (r) {
					if (!r._m || !r._m.pnrDetails || !r._m.pnrDetails.length) return false;
					if (activePNRModal !== 'all' && (r._m.vehicleType || '') !== activePNRModal) return false;
					return true;
				});
				// Separar casos por grupo
				var rotasTratativa = [],
					rotasHistorico = [];
				allRotasPNR.forEach(function (r) {
					var trat = r._m.pnrDetails.filter(function (p) {
						var s = p.status || '';
						return s === 'NEW' || s === 'OPENED' || s === 'new' || s === 'opened';
					});
					var hist = r._m.pnrDetails.filter(function (p) {
						var s = p.status || '';
						return s === 'CLOSED' || s === 'CANCELLED' || s === 'CLOSED_RESOLVED' || s === 'CLOSED_UNRESOLVED';
					});
					if (trat.length > 0) rotasTratativa.push({
						r: r,
						cases: trat
					});
					if (hist.length > 0) rotasHistorico.push({
						r: r,
						cases: hist
					});
				});
				var rotasPNR = activePNRFilter === 'tratativa' ? rotasTratativa : rotasHistorico;
				var totalTrat = rotasTratativa.reduce(function (a, x) {
					return a + x.cases.length;
				}, 0);
				var totalHist = rotasHistorico.reduce(function (a, x) {
					return a + x.cases.length;
				}, 0);
				var totalPNR = activePNRFilter === 'tratativa' ? totalTrat : totalHist;
				var g2 = '<div style="padding:16px">';
				// KPI total
				g2 += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">';
				g2 += '<div style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:12px"><div style="font-size:10px;color:' + S.mt + ';text-transform:uppercase;margin-bottom:4px">CASOS EM ABERTO</div><div style="font-family:' + mn + ';font-size:22px;color:#f87171;font-weight:600">' + totalTrat + '</div></div>';
				g2 += '<div style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:12px"><div style="font-size:10px;color:' + S.mt + ';text-transform:uppercase;margin-bottom:4px">HISTÓRICO</div><div style="font-family:' + mn + ';font-size:22px;color:' + S.mt + ';font-weight:600">' + totalHist + '</div></div>';
				g2 += '<div style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:12px"><div style="font-size:10px;color:' + S.mt + ';text-transform:uppercase;margin-bottom:4px">ATENDENTE</div><div style="font-size:11px;color:' + (nomeAtendente ? S.ok : S.mt) + ';margin-top:4px">' + (nomeAtendente || '⚠️ Informe seu nome na toolbar') + '</div></div>';
				g2 += '</div>';
				// Toggle EM TRATATIVA / HISTÓRICO
				// Coletar modais disponíveis nas rotas PNR
				var pnrModais = {
					'all': 'Todos'
				};
				allRotasPNR.forEach(function (r) {
					var vt = r._m.vehicleType || '';
					if (vt) pnrModais[vt] = vt.charAt(0).toUpperCase() + vt.slice(1);
				});
				// Botão Bandeja
				var bandUrl = 'https://envios.adminml.com/logistics/case-center/cases';
				g2 += '<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center;flex-wrap:wrap">';
				g2 += '<a href="' + bandUrl + '" target="_blank" style="background:transparent;border:1px solid ' + S.ac + ';color:' + S.ac + ';padding:5px 12px;border-radius:4px;font-size:10px;font-family:' + mn + ';font-weight:600;text-decoration:none">🔗 Bandeja PNR</a>';
				g2 += '<select id="mlm_pnr_modal" style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.tx + ';padding:4px 8px;border-radius:4px;font-size:10px;font-family:' + mn + '">';
				Object.keys(pnrModais).forEach(function (k) {
					g2 += '<option value="' + k + '"' + (activePNRModal === k ? ' selected' : '') + '>' + pnrModais[k] + '</option>';
				});
				g2 += '</select>';
				g2 += '</div>';
				g2 += '<div style="display:flex;gap:8px;margin-bottom:14px">';
				g2 += '<span data-pnrfilter2="tratativa" style="padding:6px 16px;border-radius:20px;font-size:11px;font-family:' + mn + ';cursor:pointer;font-weight:600;background:' + (activePNRFilter === 'tratativa' ? S.er : 'transparent') + ';color:' + (activePNRFilter === 'tratativa' ? '#fff' : S.mt) + ';border:1px solid ' + (activePNRFilter === 'tratativa' ? S.er : S.bd) + '">EM TRATATIVA (' + totalTrat + ')</span>';
				g2 += '<span data-pnrfilter2="historico" style="padding:6px 16px;border-radius:20px;font-size:11px;font-family:' + mn + ';cursor:pointer;font-weight:600;background:' + (activePNRFilter === 'historico' ? S.mt : 'transparent') + ';color:' + (activePNRFilter === 'historico' ? '#fff' : S.mt) + ';border:1px solid ' + (activePNRFilter === 'historico' ? S.mt : S.bd) + '">HISTÓRICO (' + totalHist + ')</span>';
				g2 += '</div>';
				if (rotasPNR.length === 0) {
					g2 += '<div style="text-align:center;padding:40px;color:' + S.mt + ';font-size:13px">Nenhuma PNR em aberto</div>';
				} else {
					g2 += '<div style="background:' + S.sf + ';border:1px solid ' + S.bd + ';border-radius:8px;overflow:hidden">';
					g2 += '<div style="padding:10px 14px;font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid ' + S.bd + '">PNR POR ROTA</div>';
					rotasPNR.forEach(function (x) {
						var r = x.r;
						var drv = (r.driver && r.driver.driverName) || '—';
						var pnrList = x.cases;
						var rid2 = 'pnr_' + r.id;
						g2 += '<div style="border-bottom:1px solid ' + S.bd + '">';
						g2 += '<div data-pnrid="' + rid2 + '" style="padding:10px 14px;cursor:pointer;display:flex;align-items:center;justify-content:space-between" onmouseover="this.style.background=\'' + S.sf2 + '\'" onmouseout="this.style.background=\'transparent\'">';
						g2 += '<div style="display:flex;align-items:center;gap:10px">';
						g2 += '<span style="font-family:' + mn + ';font-size:10px;color:' + S.ac + '">▶</span>';
						g2 += '<span style="font-family:' + mn + ';font-size:12px;color:' + S.tx + ';font-weight:600">' + r.id + '</span>';
						g2 += '<span style="font-size:11px;color:' + S.mt + '">' + drv + '</span>';
						g2 += '</div>';
						g2 += '<div style="display:flex;align-items:center;gap:8px">';
						g2 += '<span style="font-family:' + mn + ';font-size:12px;color:#f87171;font-weight:600">' + pnrList.length + ' caso(s)</span>';
						// Botão reporte motorista
						var repMotLines = pnrList.map(function (p) {
							var dt = p.ts > 0 ? new Date(p.ts * 1000).toLocaleDateString('pt-BR') : '';
							return '🔴 Caso #' + p.tocCaseId + ' — EM ABERTO\n📦 Envio: #' + p.shipId + '\n👤 Cliente: ' + p.nome + '\n📞 Telefone: ' + (p.fone ? p.fone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '-') + '\n📍 Endereço: ' + p.endereco + '\n📅 Data: ' + dt;
						}).join('\n\n');
						var repMot = '📋 *REPORTE PNR — ' + drv + '*\n📍 *Rota: ' + r.id + '*\n\n' + repMotLines;
						var _telPnr = _getPhone(drv);
						g2 += '<span data-copyrep="' + encodeURIComponent(repMot) + '" style="background:' + S.pu + ';color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;font-family:' + mn + ';font-weight:600">📋 Reporte Motorista</span>';
						if (_telPnr) g2 += '<a href="whatsapp://send?phone=' + _telPnr + '&text=' + encodeURIComponent(repMot) + '" style="background:#25D366;color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;text-decoration:none;font-family:' + mn + ';font-weight:600;margin-left:4px">📲</a>';
						g2 += '</div></div>';
						// Detalhes dos casos
						g2 += '<div id="' + rid2 + '" style="display:none;padding:0 14px 10px 14px">';
						pnrList.forEach(function (p) {
							var fone = p.fone || '';
							var foneDisplay = fone ? fone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : '';
							var dataEntrega = p.ts > 0 ? new Date(p.ts * 1000).toLocaleDateString('pt-BR') : '';
							var horaEntrega = p.ts > 0 ? new Date(p.ts * 1000).toLocaleTimeString('pt-BR', {
								hour: '2-digit',
								minute: '2-digit'
							}) : '';
							// Dados para montar mensagem no clique (pega atendente atualizado)
							var pnrData = encodeURIComponent(JSON.stringify({
								nome: p.nome,
								shipId: p.shipId,
								fone: fone,
								data: dataEntrega,
								hora: horaEntrega
							}));
							var wppPNR = fone ? 'whatsapp://send?phone=55' + fone + '&pnrdata=placeholder' : '';
							g2 += '<div style="padding:8px 0;border-bottom:1px solid ' + S.bd + '">';
							g2 += '<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:4px">';
							g2 += '<a href="https://envios.adminml.com/logistics/case-center/cases/' + p.tocCaseId + '" target="_blank" style="font-family:' + mn + ';font-size:10px;color:#f87171;text-decoration:none;font-weight:600">🔗 Caso #' + p.tocCaseId + ' ↗</a>';
							g2 += '<span style="font-family:' + mn + ';font-size:10px;color:' + S.ac + '">📦 #' + p.shipId + '</span>';
							g2 += '<span style="font-size:10px;color:' + S.tx + '">' + p.nome + '</span>';
							if (foneDisplay) g2 += '<span style="font-size:10px;color:' + S.mt + '">📞 ' + foneDisplay + '</span>';
							if (dataEntrega) g2 += '<span style="font-size:10px;color:' + S.mt + '">📅 ' + dataEntrega + ' ' + horaEntrega + '</span>';
							if (p.endereco) g2 += '<span style="font-size:10px;color:' + S.mt + '">📍 ' + p.endereco + '</span>';
							g2 += '</div>';
							// Montar mensagem padrão PNR
							var nomeAtd = $id('mlm_atendente') ? ($id('mlm_atendente').value || '').trim() : '';
							var msgPNR = 'Olá, *' + p.nome + '*\n' +
								'Aqui é ' + (nomeAtd || '___') + ' do Mercado Livre, sobre a reclamação do pacote ID: ' + p.shipId + '\n' +
								'Produto: [PRODUTO].\n' +
								(dataEntrega ? 'Foi entregue no dia ' + dataEntrega + ' às ' + horaEntrega + '\n' : '') + '\n' +
								'Para que eu possa entender melhor o ocorrido e agilizar a solução para você, por favor, me diga qual das situações abaixo descreve o seu problema:\n' +
								'1. Eu NÃO recebi o pacote.\n' +
								'2. Eu recebi o pacote, mas ele estava com problemas. (Ex: danificado, frasco quebrado, veio o produto errado, etc.)\n' +
								'3. Outro motivo. (Por favor, descreva brevemente qual foi o problema)\n' +
								'4. Eu recebi o produto em perfeitas condições!\n\n' +
								'Desde já agradeço a sua atenção e fico à disposição!';
							g2 += '<div style="display:flex;gap:6px">';
							if (fone) g2 += '<a data-pnrwpp="' + pnrData + '" data-fone="' + fone + '" style="background:#25D366;color:#fff;font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;font-family:' + mn + ';font-weight:600">WhatsApp ↗</a>';
							g2 += '<span data-pnrcopy="' + pnrData + '" style="background:' + S.sf2 + ';color:' + S.ac + ';font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;border:1px solid ' + S.bd + ';font-family:' + mn + ';font-weight:600">📋 Copiar msg</span>';
							g2 += '<span data-copymsg="' + encodeURIComponent(msgPNR) + '" style="background:' + S.sf2 + ';color:' + S.pu + ';font-size:9px;padding:3px 8px;border-radius:4px;cursor:pointer;border:1px solid ' + S.bd + ';font-family:' + mn + ';font-weight:600">📋 Msg Cliente</span>';
							g2 += '</div>';
							g2 += '</div>';
						});
						g2 += '</div></div>';
					});
					g2 += '</div>';
				}
				body.innerHTML = g2 + '</div>';
				// Event listeners aba PNR
				body.querySelectorAll('[data-pnrfilter2]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						window._mlmPNRFilter2 = el.dataset.pnrfilter2;
						applyFilters();
					});
				});
				var pnrModalSel = $id('mlm_pnr_modal');
				if (pnrModalSel) pnrModalSel.addEventListener('change', function () {
					window._mlmPNRModal = this.value;
					applyFilters();
				});
				body.querySelectorAll('[data-pnrid]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						if (e.target.dataset.copyrep || e.target.dataset.wppurl || e.target.dataset.copymsg) return;
						var target = document.getElementById(el.dataset.pnrid);
						if (!target) return;
						var open = target.style.display === 'block';
						target.style.display = open ? 'none' : 'block';
						var arrow = el.querySelector('span');
						if (arrow) arrow.textContent = open ? '▶' : '▼';
					});
				});
				body.querySelectorAll('[data-copyrep]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						var msg = decodeURIComponent(el.dataset.copyrep);
						navigator.clipboard.writeText(msg).catch(function () {
							var ta = document.createElement('textarea');
							ta.value = msg;
							document.body.appendChild(ta);
							ta.select();
							document.execCommand('copy');
							document.body.removeChild(ta);
						});
						var orig = el.textContent;
						el.textContent = '✅ Copiado!';
						setTimeout(function () {
							el.textContent = orig;
						}, 2000);
					});
				});

				function buildMsgPNR(d) {
					var at = $id('mlm_atendente');
					var nome = at ? at.value.trim() || '___' : '___';
					return 'Olá, *' + d.nome + '*\nAqui é ' + nome + ' do Mercado Livre, sobre a reclamação do pacote ID: ' + d.shipId + '\nProduto: ________.\nFoi entregue no dia ' + d.data + ' às ' + d.hora + '\nPara que eu possa entender melhor o ocorrido e agilizar a solução para você, por favor, me diga qual das situações abaixo descreve o seu problema:\n1. Eu NÃO recebi o pacote.\n2. Eu recebi o pacote, mas ele estava com problemas. (Ex: danificado, frasco quebrado, veio o produto errado, etc.)\n3. Outro motivo. (Por favor, descreva brevemente qual foi o problema)\n4. Eu recebi o produto em perfeitas condições!\nDesde já agradeço a sua atenção e fico à disposição!';
				}
				body.querySelectorAll('[data-pnrwpp]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						var d = JSON.parse(decodeURIComponent(el.dataset.pnrwpp));
						var msg = buildMsgPNR(d);
						window.open('whatsapp://send?phone=55' + el.dataset.fone + '&text=' + encodeURIComponent(msg), 'whatsapp_mlm');
					});
				});
				body.querySelectorAll('[data-pnrcopy]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						var d = JSON.parse(decodeURIComponent(el.dataset.pnrcopy));
						var msg = buildMsgPNR(d);
						navigator.clipboard.writeText(msg).catch(function () {
							var ta = document.createElement('textarea');
							ta.value = msg;
							document.body.appendChild(ta);
							ta.select();
							document.execCommand('copy');
							document.body.removeChild(ta);
						});
						var orig = el.textContent;
						el.textContent = '✅ Copiado!';
						setTimeout(function () {
							el.textContent = orig;
						}, 2000);
					});
				});
			}

			// ABA AGÊNCIAS
			else if (curTab === 'AGÊNCIAS') {
				var rotasAg = routes.filter(function (r) {
					return r._m && r._m.agStops && r._m.agStops.length > 0;
				});
				var totAgDesp = 0,
					totAgDel = 0,
					totAgRotas = rotasAg.length;
				rotasAg.forEach(function (r) {
					totAgDesp += getAgDesp(r);
					totAgDel += getAgDel(r);
				});
				var dsAg = totAgDesp > 0 ? ((totAgDel / totAgDesp) * 100).toFixed(1) + '%' : '—';

				var totOpPkgs = routes.reduce(function (a, r) {
					return a + (r._m ? (r._m.del + r._m.ins + r._m.pend) : 0);
				}, 0);
				var totAgNaoDel = totAgDesp - totAgDel;
				var impactoAg = totOpPkgs > 0 ? ((totAgNaoDel / totOpPkgs) * 100).toFixed(1) + '%' : '—';

				function pctColorAg(pct) {
					return pct >= 98.5 ? S.ok : pct >= 90 ? S.wn : S.er;
				}

				var ga = '<div style="padding:16px">';
				// KPIs
				ga += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px">';
				[[S.pu, 'Rotas c/ agência', totAgRotas],
				[S.tx, 'Total despachado', totAgDesp],
				[S.ok, 'Total entregue', totAgDel],
				[S.ac, 'DS% agências', dsAg],
				[S.er, 'Impacto no geral', impactoAg]
				].forEach(function (c) {
					ga += '<div style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:10px;text-align:center">';
					ga += '<div style="font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + c[1] + '</div>';
					ga += '<div style="font-family:' + mn + ';font-size:20px;font-weight:600;color:' + c[0] + '">' + c[2] + '</div>';
					ga += '</div>';
				});
				ga += '</div>';

				// Botões PDF + Excel
				ga += '<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px">';
				ga += '<span id="mlm_ag_xls" style="background:transparent;border:1px solid #16a34a;color:#16a34a;padding:5px 14px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer">⬇ Excel</span>';
				ga += '<span id="mlm_ag_pdf" style="background:transparent;border:1px solid ' + S.pu + ';color:' + S.pu + ';padding:5px 14px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer">⬇ PDF</span>';
				ga += '</div>';

				if (rotasAg.length === 0) {
					ga += '<div style="text-align:center;padding:40px;color:' + S.mt + ';font-family:' + mn + ';font-size:12px">Nenhuma rota com parada em agência encontrada.</div>';
				} else {
					// Filtro dropdown agências
					ga += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
					ga += '<select id="mlm_ag_sort" style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.ac + ';padding:4px 10px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer">';
					ga += '<option value="0">Todas</option>';
					ga += '<option value="1">Com insucesso</option>';
					ga += '<option value="2">Sem insucesso</option>';
					ga += '<option value="3">Mais pacotes</option>';
					ga += '<option value="4">Menos pacotes</option>';
					ga += '</select>';
					ga += '</div>';
					// Lista de rotas com barra de progresso
					ga += '<div style="font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Despachado vs entregue — por rota</div>';
					ga += '<div id="mlm_ag_list">';
					rotasAg.forEach(function (r) {
						var agDesp = getAgDesp(r);
						var agDel = getAgDel(r);
						var pct = agDesp > 0 ? Math.round((agDel / agDesp) * 100) : 0;
						var col = pctColorAg(pct);
						var pctRota = r._m && (r._m.del + r._m.ins + r._m.pend + agDesp) > 0 ? Math.round((agDesp / (r._m.del + r._m.ins + r._m.pend)) * 100) : 0;
						var drv = (r.driver && r.driver.driverName) || '—';
						var car = r.carrier || '—';
						var modal = (r.vehicle && r.vehicle.description) || '—';
						var pts = (r.cluster || '').split('_');
						var ciclo = pts.length > 1 ? pts[pts.length - 1] : '—';
						var inicio = r.initDate && r.initDate > 0 ? new Date(r.initDate * 1000).toLocaleString('pt-BR', {
							day: '2-digit',
							month: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						}) : '—';
						var closed = isClosed(r);
						var prog = getProg(r);
						var agAddrs = r._m.agStops.map(function (s) {
							return s.addr;
						}).filter(function (a, i, arr) {
							return arr.indexOf(a) === i;
						}).join(' / ');

						var agIns = r._m.agStops.reduce(function (acc, s) {
							return acc + (s.pkgs || []).filter(function (p) {
								var f = p.status || '';
								return f === 'not_delivered' || f === 'failed';
							}).length;
						}, 0);
						ga += '<div data-agrid="' + r.id + '" data-aghasins="' + (agIns > 0 ? '1' : '0') + '" data-agdesp="' + agDesp + '" style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:10px 14px;margin-bottom:6px">';
						// Header
						ga += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">';
						ga += '<span style="font-family:' + mn + ';font-size:11px;color:' + S.ac + '">' + r.id + '</span>';
						ga += '<span style="font-size:11px;color:' + S.tx + ';flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + drv + '</span>';
						ga += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:' + S.sf + ';color:' + S.mt + '">' + modal + '</span>';
						ga += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:' + S.sf + ';color:' + S.ac + '">' + ciclo + '</span>';
						ga += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:' + (closed ? 'rgba(0,230,118,.15)' : 'rgba(255,171,64,.15)') + ';color:' + (closed ? S.ok : S.wn) + '">' + (closed ? 'Encerrada' : 'Aberta') + '</span>';
						ga += '<span style="font-family:' + mn + ';font-size:10px;color:' + S.mt + '">' + inicio + '</span>';
						ga += '<span style="font-size:10px;color:' + S.mt + '">' + car + '</span>';
						ga += '</div>';
						// Barra de progresso
						ga += '<div style="display:flex;align-items:center;gap:10px">';
						ga += '<div style="flex:1">';
						ga += '<div style="font-size:10px;color:' + S.mt + ';margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + agAddrs + '</div>';
						ga += '<div style="height:14px;background:' + S.sf + ';border-radius:3px;overflow:hidden;border:1px solid ' + S.bd + '">';
						ga += '<div style="height:100%;width:' + pct + '%;background:' + col + ';border-radius:3px"></div>';
						ga += '</div>';
						ga += '</div>';
						ga += '<span style="font-family:' + mn + ';font-size:11px;color:' + S.mt + ';white-space:nowrap;min-width:60px;text-align:right">' + agDel + ' / ' + agDesp + '</span>';
						ga += '<span style="font-family:' + mn + ';font-size:12px;font-weight:600;color:' + col + ';min-width:38px;text-align:right">' + pct + '%</span>';
						ga += '</div>';
						// % da rota
						ga += '<div style="font-size:9px;color:' + S.mt + ';margin-top:5px;font-family:' + mn + '">Progresso geral da rota: ' + prog.toFixed(0) + '%</div>';
						// Toggle IDs
						var allPkgs = [];
						r._m.agStops.forEach(function (s) {
							allPkgs = allPkgs.concat(s.pkgs || []);
						});
						if (allPkgs.length > 0) {
							var togId = 'ag_ids_' + r.id;
							ga += '<div style="margin-top:6px">';
							ga += '<span data-agtog="' + togId + '" style="font-size:9px;color:' + S.ac + ';font-family:' + mn + ';cursor:pointer;user-select:none">▼ ver ' + allPkgs.length + ' pacotes</span>';
							ga += '<div id="' + togId + '" style="display:block;margin-top:6px;padding:8px;background:' + S.sf + ';border-radius:4px;border:1px solid ' + S.bd + '">';
							ga += '<div style="font-size:9px;color:' + S.mt + ';font-family:' + mn + ';margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">Ship IDs</div>';
							ga += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
							allPkgs.forEach(function (p) {
								var isDel = (p.status === 'delivered' || p.status === 'picked_up');
								var isPend = (!p.status || p.status === 'pending' || p.status === 'on_route');
								var pkgCol = isDel ? S.ok : isPend ? S.mt : S.er;
								ga += '<span style="font-family:' + mn + ';font-size:9px;padding:2px 6px;border-radius:3px;background:' + S.sf2 + ';color:' + pkgCol + ';border:1px solid ' + S.bd + '">' + p.shipId + '</span>';
							});
							ga += '</div>';
							ga += '<div style="margin-top:5px;font-size:9px;color:' + S.mt + ';font-family:' + mn + '">Verde = entregue · Cinza = pendente · Vermelho = insucesso</div>';
							ga += '</div>';
							ga += '</div>';
						}
						ga += '</div>';
					});
					ga += '</div>'; // fecha mlm_ag_list
				}
				ga += '</div>';
				body.innerHTML = ga;

				// Filtro dropdown agências
				var _agFilAtual = 0;
				var _agFilLabels = ['Todas', 'Com insucesso', 'Sem insucesso', 'Mais pacotes', 'Menos pacotes'];
				var agSort = body.querySelector('#mlm_ag_sort');
				if (agSort) {
					agSort.addEventListener('change', function () {
						_agFilAtual = parseInt(agSort.value);
						var cards = Array.from(body.querySelectorAll('[data-agrid]'));
						// Filtro visibilidade
						cards.forEach(function (card) {
							var hasIns = card.dataset.aghasins === '1';
							if (_agFilAtual === 0 || _agFilAtual === 3 || _agFilAtual === 4) card.style.display = '';
							else if (_agFilAtual === 1) card.style.display = hasIns ? '' : 'none';
							else card.style.display = hasIns ? 'none' : '';
						});
						// Ordenação
						if (_agFilAtual === 3 || _agFilAtual === 4) {
							var list = body.querySelector('#mlm_ag_list');
							if (list) {
								var visible = cards.filter(function (c) {
									return c.style.display !== 'none';
								});
								visible.sort(function (a, b) {
									var da = parseInt(a.dataset.agdesp || 0);
									var db = parseInt(b.dataset.agdesp || 0);
									return _agFilAtual === 3 ? db - da : da - db;
								});
								visible.forEach(function (c) {
									list.appendChild(c);
								});
							}
						}
					});
				}

				// Toggle IDs expansível
				body.querySelectorAll('[data-agtog]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						var target = document.getElementById(el.dataset.agtog);
						if (!target) return;
						var open = target.style.display === 'block';
						target.style.display = open ? 'none' : 'block';
						var count = el.textContent.replace(/[▶▼] /, '');
						el.textContent = (open ? '▶ ' : '▼ ') + count;
					});
				});

				// PDF
				var pdfBtn = body.querySelector('#mlm_ag_pdf');
				if (pdfBtn) {
					pdfBtn.onclick = function () {
						var rotasAgFilt = rotasAg.filter(function (r) {
							var agIns = r._m.agStops.reduce(function (acc, s) {
								return acc + (s.pkgs || []).filter(function (p) {
									var f = p.status || '';
									return f === 'not_delivered' || f === 'failed';
								}).length;
							}, 0);
							if (_agFilAtual === 1) return agIns > 0;
							if (_agFilAtual === 2) return agIns === 0;
							return true;
						});
						var filAtivo = _agFilLabels[_agFilAtual];
						var now = new Date();
						var dataStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {
							hour: '2-digit',
							minute: '2-digit'
						});
						var sscName = sSsc.value;
						var w = window.open('', '_blank', 'width=900,height=700');
						var rows = rotasAgFilt.map(function (r) {
							var agDesp = getAgDesp(r);
							var agDel = getAgDel(r);
							var pct = agDesp > 0 ? Math.round((agDel / agDesp) * 100) : 0;
							var drv = (r.driver && r.driver.driverName) || '—';
							var car = r.carrier || '—';
							var modal = (r.vehicle && r.vehicle.description) || '—';
							var pts = (r.cluster || '').split('_');
							var ciclo = pts.length > 1 ? pts[pts.length - 1] : '—';
							var inicio = r.initDate && r.initDate > 0 ? new Date(r.initDate * 1000).toLocaleString('pt-BR', {
								day: '2-digit',
								month: '2-digit',
								hour: '2-digit',
								minute: '2-digit'
							}) : '—';
							var closed = isClosed(r);
							var prog = getProg(r);
							var agAddrs = r._m.agStops.map(function (s) {
								return s.addr;
							}).filter(function (a, i, arr) {
								return arr.indexOf(a) === i;
							}).join(' / ');
							var pctCol = pct >= 90 ? '#00a854' : pct >= 70 ? '#b45309' : '#991b1b';
							var allPkgsPdf = [];
							r._m.agStops.forEach(function (s) {
								allPkgsPdf = allPkgsPdf.concat(s.pkgs || []);
							});
							var pkgChips = allPkgsPdf.map(function (p) {
								var isDel = (p.status === 'delivered' || p.status === 'picked_up');
								var isIns = (p.status === 'not_delivered' || p.status === 'failed');
								var bg = isDel ? '#f0fdf4' : isIns ? '#fff0f0' : '#fff8f0';
								var bc = isDel ? '#bbf7d0' : isIns ? '#fecaca' : '#fed7aa';
								var fc = isDel ? '#166534' : isIns ? '#991b1b' : '#b45309';
								return '<span style="font-family:monospace;font-size:10px;padding:3px 8px;border-radius:3px;border:1px solid ' + bc + ';background:' + bg + ';color:' + fc + '">' + p.shipId + '</span>';
							}).join(' ');
							return '<div style="margin-bottom:18px;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;break-inside:avoid">' +
								'<div style="background:#1a1a2e;color:#fff;padding:10px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
								'<span style="font-family:monospace;font-size:13px;font-weight:bold;color:#60a5fa">' + r.id + '</span>' +
								'<span style="font-size:12px;color:#e2e8f0;flex:1">' + drv + '</span>' +
								'<span style="font-size:9px;padding:2px 7px;border-radius:3px;background:rgba(96,165,250,.2);color:#60a5fa">' + ciclo + '</span>' +
								'<span style="font-size:9px;padding:2px 7px;border-radius:3px;background:' + (closed ? 'rgba(0,168,84,.2)' : 'rgba(255,171,64,.2)') + ';color:' + (closed ? '#00a854' : '#b45309') + '">' + (closed ? 'Encerrada' : 'Aberta') + '</span>' +
								'<span style="font-size:10px;color:#94a3b8;font-family:monospace">' + car + ' · ' + modal + ' · ' + inicio + '</span>' +
								'</div>' +
								'<div style="background:#f8f8f8;padding:7px 14px;display:flex;gap:18px;flex-wrap:wrap;border-bottom:1px solid #e8e8e8;font-size:11px;color:#555">' +
								'<span>Progresso geral: <b>' + prog.toFixed(0) + '%</b></span>' +
								'<span>Despachado: <b>' + agDesp + '</b></span>' +
								'<span>Entregue: <b style="color:#00a854">' + agDel + '</b></span>' +
								'<span>DS% agência: <b style="color:' + pctCol + '">' + pct + '%</b></span>' +
								'<span style="font-style:italic;color:#888">' + agAddrs + '</span>' +
								'</div>' +
								'<div style="padding:10px 14px">' +
								'<div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px">Ship IDs — ' + allPkgsPdf.length + ' pacote' + (allPkgsPdf.length !== 1 ? 's' : '') + '</div>' +
								'<div style="display:flex;flex-wrap:wrap;gap:4px">' + pkgChips + '</div>' +
								'<div style="display:flex;gap:12px;margin-top:8px">' +
								'<span style="font-size:9px;color:#888;display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#bbf7d0;display:inline-block"></span>Entregue</span>' +
								'<span style="font-size:9px;color:#888;display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#fed7aa;display:inline-block"></span>Pendente</span>' +
								'<span style="font-size:9px;color:#888;display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#fecaca;display:inline-block"></span>Insucesso</span>' +
								'</div>' +
								'</div>' +
								'</div>';
						}).join('');
						var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
							'<title>Relatório Agências — ' + sscName + '</title>' +
							'<style>' +
							'*{box-sizing:border-box;margin:0;padding:0}' +
							'body{font-family:Arial,sans-serif;font-size:12px;color:#222;padding:28px 32px;max-width:820px;margin:0 auto}' +
							'.doc-title{font-size:20px;font-weight:bold;margin-bottom:2px}' +
							'.doc-sub{font-size:12px;color:#666;margin-bottom:18px}' +
							'.kpis{display:flex;gap:12px;margin-bottom:22px}' +
							'.kpi{background:#f5f5f5;border-radius:5px;padding:10px 16px;flex:1}' +
							'.kpi-lbl{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}' +
							'.kpi-val{font-size:20px;font-weight:bold}' +
							'hr{border:none;border-top:1px solid #e0e0e0;margin:0 0 18px 0}' +
							'.footer{margin-top:24px;text-align:center;font-size:9px;color:#aaa;border-top:1px solid #eee;padding-top:12px}' +
							'@media print{button{display:none}}' +
							'</style></head><body>' +
							'<div class="doc-title">Relatório de Agências — ' + sscName + '</div>' +
							'<div class="doc-sub">Gerado em ' + dataStr + ' · Filtro: ' + filAtivo + '</div>' +
							'<div class="kpis">' +
							'<div class="kpi"><div class="kpi-lbl">Rotas c/ agência</div><div class="kpi-val">' + rotasAgFilt.length + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">Total despachado</div><div class="kpi-val">' + rotasAgFilt.reduce(function (a, r) {
								return a + getAgDesp(r);
							}, 0) + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">Total entregue</div><div class="kpi-val" style="color:#00a854">' + rotasAgFilt.reduce(function (a, r) {
								return a + getAgDel(r);
							}, 0) + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">DS% agências</div><div class="kpi-val" style="color:#5b21b6">' + (function () {
								var d = rotasAgFilt.reduce(function (a, r) {
									return a + getAgDesp(r);
								}, 0);
								var e = rotasAgFilt.reduce(function (a, r) {
									return a + getAgDel(r);
								}, 0);
								return d > 0 ? ((e / d) * 100).toFixed(1) + '%' : '—';
							})() + '</div></div>' +
							'</div>' +
							'<hr>' +
							rows +
							'<div class="footer">Monitor Last Mile — Kangu LM · Mercado Livre</div>' +
							'<br><button id="btnPrint" style="padding:8px 20px;background:#1a1a2e;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">Imprimir / Salvar PDF</button>' +
							'</body></html>';
						w.document.write(html);
						w.document.close();
						w.focus();
						w.onload = function () {
							w.document.getElementById('btnPrint').onclick = function () {
								w.print();
							};
						};
					};
				}

				// Excel agências
				var agXlsBtn = body.querySelector('#mlm_ag_xls');
				if (agXlsBtn) {
					agXlsBtn.onclick = function () {
						var fil = _agFilAtual;
						var agFilt = rotasAg.filter(function (r) {
							var ins = r._m.agStops.reduce(function (a, s) {
								return a + (s.pkgs || []).filter(function (p) {
									var f = p.status || '';
									return f === 'not_delivered' || f === 'failed';
								}).length;
							}, 0);
							return fil === 1 ? ins > 0 : fil === 2 ? ins === 0 : true;
						});
						var revAll = routes.filter(function (r) {
							return r._m && r._m.revDesp && r._m.revDesp > 0;
						});
						var now = new Date();
						_xlsxExport([{
							name: 'Agencias',
							data: _buildAgRows(agFilt)
						}, {
							name: 'Devolucoes',
							data: _buildRevRows(revAll)
						}],
							'relatorio_' + sSsc.value + '_' + now.toISOString().slice(0, 10) + '.xls');
					};
				}
			} else if (curTab === 'DEVOLUÇÕES') {
				var rotasRev = routes.filter(function (r) {
					return r._m && r._m.revDesp && r._m.revDesp > 0;
				});
				var totRevDesp = 0,
					totRevDel = 0,
					totRevRotas = rotasRev.length;
				rotasRev.forEach(function (r) {
					totRevDesp += getRevDesp(r);
					totRevDel += getRevDel(r);
				});
				var dsRev = totRevDesp > 0 ? ((totRevDel / totRevDesp) * 100).toFixed(1) + '%' : '—';
				var totOpPkgsRev = routes.reduce(function (a, r) {
					return a + (r._m ? (r._m.del + r._m.ins + r._m.pend) : 0);
				}, 0);
				var totRevNaoDel = totRevDesp - totRevDel;
				var impactoRev = totOpPkgsRev > 0 ? ((totRevNaoDel / totOpPkgsRev) * 100).toFixed(1) + '%' : '—';

				function pctColorRev(pct) {
					return pct >= 98.5 ? S.ok : pct >= 90 ? S.wn : S.er;
				}

				function impColorRev(pct) {
					return pct < 20 ? S.ok : pct < 50 ? S.wn : S.er;
				}

				var gv = '<div style="padding:16px">';
				// KPIs
				gv += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:16px">';
				[[S.wn, 'Rotas c/ devolução', totRevRotas],
				[S.tx, 'Total despachado', totRevDesp],
				[S.ok, 'Entregues', totRevDel],
				[S.er, 'Não entregues', totRevNaoDel],
				[S.er, 'Impacto no geral', impactoRev]
				].forEach(function (c) {
					gv += '<div style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:10px;text-align:center">';
					gv += '<div style="font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + c[1] + '</div>';
					gv += '<div style="font-family:' + mn + ';font-size:20px;font-weight:600;color:' + c[0] + '">' + c[2] + '</div>';
					gv += '</div>';
				});
				gv += '</div>';

				// Botões PDF + Excel
				gv += '<div style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px">';
				gv += '<span id="mlm_rev_xls" style="background:transparent;border:1px solid #16a34a;color:#16a34a;padding:5px 14px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer">⬇ Excel</span>';
				gv += '<span id="mlm_rev_pdf" style="background:transparent;border:1px solid ' + S.wn + ';color:' + S.wn + ';padding:5px 14px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer">⬇ PDF</span>';
				gv += '</div>';

				if (rotasRev.length === 0) {
					gv += '<div style="text-align:center;padding:40px;color:' + S.mt + ';font-family:' + mn + ';font-size:12px">Nenhuma rota com pacote de devolução encontrada.</div>';
				} else {
					// Filtro dropdown devoluções
					gv += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">';
					gv += '<select id="mlm_rev_sort" style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';color:' + S.wn + ';padding:4px 10px;border-radius:4px;font-family:' + mn + ';font-size:11px;cursor:pointer">';
					gv += '<option value="0">Todas</option>';
					gv += '<option value="1">Com insucesso</option>';
					gv += '<option value="2">Sem insucesso</option>';
					gv += '<option value="3">Mais pacotes</option>';
					gv += '<option value="4">Menos pacotes</option>';
					gv += '</select>';
					gv += '</div>';
					gv += '<div style="font-family:' + mn + ';font-size:10px;color:' + S.mt + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px">Devoluções por rota — despachado vs entregue</div>';
					gv += '<div id="mlm_rev_list">';
					rotasRev.forEach(function (r) {
						var revDesp = getRevDesp(r);
						var revDel = getRevDel(r);
						var pct = revDesp > 0 ? Math.round((revDel / revDesp) * 100) : 0;
						var col = pctColorRev(pct);
						var totPkgsRota = r._m ? (r._m.del + r._m.ins + r._m.pend) : 0;
						var pctRota = totPkgsRota > 0 ? Math.round((revDesp / totPkgsRota) * 100) : 0;
						var impCol = impColorRev(pctRota);
						var revIns = getRevPkgs(r).filter(function (p) {
							var f = p.status || '';
							return f === 'not_delivered' || f === 'failed';
						}).length;
						var drv = (r.driver && r.driver.driverName) || '—';
						var car = r.carrier || '—';
						var modal = (r.vehicle && r.vehicle.description) || '—';
						var pts = (r.cluster || '').split('_');
						var ciclo = pts.length > 1 ? pts[pts.length - 1] : '—';
						var inicio = r.initDate && r.initDate > 0 ? new Date(r.initDate * 1000).toLocaleString('pt-BR', {
							day: '2-digit',
							month: '2-digit',
							hour: '2-digit',
							minute: '2-digit'
						}) : '—';
						var closed = isClosed(r);
						var prog = getProg(r);
						var allPkgs = getRevPkgs(r);

						gv += '<div data-revrid="' + r.id + '" data-revhasins="' + (revIns > 0 ? '1' : '0') + '" data-revdesp="' + revDesp + '" style="background:' + S.sf2 + ';border:1px solid ' + S.bd + ';border-radius:8px;padding:10px 14px;margin-bottom:6px">';
						// Header
						gv += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px">';
						gv += '<span style="font-family:' + mn + ';font-size:11px;color:' + S.ac + '">' + r.id + '</span>';
						gv += '<span style="font-size:11px;color:' + S.tx + ';flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + drv + '</span>';
						gv += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:' + S.sf + ';color:' + S.mt + '">' + modal + '</span>';
						gv += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:' + S.sf + ';color:' + S.ac + '">' + ciclo + '</span>';
						gv += '<span style="font-size:9px;padding:1px 6px;border-radius:3px;background:' + (closed ? 'rgba(0,230,118,.15)' : 'rgba(255,171,64,.15)') + ';color:' + (closed ? S.ok : S.wn) + '">' + (closed ? 'Encerrada' : 'Aberta') + '</span>';
						gv += '<span style="font-family:' + mn + ';font-size:10px;color:' + S.mt + '">' + inicio + '</span>';
						gv += '<span style="font-size:10px;color:' + S.mt + '">' + car + '</span>';
						gv += '</div>';
						// Barra progresso
						gv += '<div style="display:flex;align-items:center;gap:10px">';
						gv += '<div style="flex:1">';
						gv += '<div style="height:14px;background:' + S.sf + ';border-radius:3px;overflow:hidden;border:1px solid ' + S.bd + '">';
						gv += '<div style="height:100%;width:' + pct + '%;background:' + col + ';border-radius:3px"></div>';
						gv += '</div>';
						gv += '</div>';
						gv += '<span style="font-family:' + mn + ';font-size:11px;color:' + S.mt + ';white-space:nowrap;min-width:60px;text-align:right">' + revDel + ' / ' + revDesp + '</span>';
						gv += '<span style="font-family:' + mn + ';font-size:12px;font-weight:600;color:' + col + ';min-width:38px;text-align:right">' + pct + '%</span>';
						gv += '</div>';
						// Impacto na rota + progresso geral
						gv += '<div style="display:flex;gap:16px;margin-top:5px">';
						gv += '<span style="font-size:9px;color:' + S.mt + ';font-family:' + mn + '">Progresso geral: ' + prog.toFixed(0) + '%</span>';
						gv += '<span style="font-size:9px;font-family:' + mn + ';color:' + impCol + '">↪ ' + pctRota + '% da rota são devoluções</span>';
						gv += '</div>';
						// Ship IDs
						if (allPkgs.length > 0) {
							var togId = 'rev_ids_' + r.id;
							gv += '<div style="margin-top:6px">';
							gv += '<span data-revtog="' + togId + '" style="font-size:9px;color:' + S.ac + ';font-family:' + mn + ';cursor:pointer;user-select:none">▼ ver ' + allPkgs.length + ' pacotes</span>';
							gv += '<div id="' + togId + '" style="display:block;margin-top:6px;padding:8px;background:' + S.sf + ';border-radius:4px;border:1px solid ' + S.bd + '">';
							gv += '<div style="font-size:9px;color:' + S.mt + ';font-family:' + mn + ';margin-bottom:5px;text-transform:uppercase;letter-spacing:.5px">Ship IDs</div>';
							gv += '<div style="display:flex;flex-wrap:wrap;gap:4px">';
							allPkgs.forEach(function (p) {
								var isDel = (p.status === 'delivered' || p.status === 'picked_up');
								var isIns = (p.status === 'not_delivered' || p.status === 'failed');
								var pkgCol = isDel ? S.ok : isIns ? S.er : S.mt;
								gv += '<span style="font-family:' + mn + ';font-size:9px;padding:2px 6px;border-radius:3px;background:' + S.sf2 + ';color:' + pkgCol + ';border:1px solid ' + S.bd + '">' + p.shipId + '</span>';
							});
							gv += '</div>';
							gv += '<div style="margin-top:5px;font-size:9px;color:' + S.mt + ';font-family:' + mn + '">Verde = entregue · Cinza = pendente · Vermelho = não entregue</div>';
							gv += '</div>';
							gv += '</div>';
						}
						gv += '</div>';
					});
					gv += '</div>'; // fecha mlm_rev_list
				}
				gv += '</div>';
				body.innerHTML = gv;

				// Toggle IDs
				body.querySelectorAll('[data-revtog]').forEach(function (el) {
					el.addEventListener('click', function (e) {
						e.stopPropagation();
						var target = document.getElementById(el.dataset.revtog);
						if (!target) return;
						var open = target.style.display === 'block';
						target.style.display = open ? 'none' : 'block';
						el.textContent = (open ? '▶ ' : '▼ ') + el.textContent.replace(/[▶▼] /, '');
					});
				});

				// Filtro dropdown devoluções
				var _revFilAtual = 0;
				var _revFilLabels = ['Todas', 'Com insucesso', 'Sem insucesso', 'Mais pacotes', 'Menos pacotes'];
				var revSort = body.querySelector('#mlm_rev_sort');
				if (revSort) {
					revSort.addEventListener('change', function () {
						_revFilAtual = parseInt(revSort.value);
						var cards = Array.from(body.querySelectorAll('[data-revrid]'));
						cards.forEach(function (card) {
							var hasIns = card.dataset.revhasins === '1';
							if (_revFilAtual === 0 || _revFilAtual === 3 || _revFilAtual === 4) card.style.display = '';
							else if (_revFilAtual === 1) card.style.display = hasIns ? '' : 'none';
							else card.style.display = hasIns ? 'none' : '';
						});
						if (_revFilAtual === 3 || _revFilAtual === 4) {
							var list = body.querySelector('#mlm_rev_list');
							if (list) {
								var visible = cards.filter(function (c) {
									return c.style.display !== 'none';
								});
								visible.sort(function (a, b) {
									var da = parseInt(a.dataset.revdesp || 0);
									var db = parseInt(b.dataset.revdesp || 0);
									return _revFilAtual === 3 ? db - da : da - db;
								});
								visible.forEach(function (c) {
									list.appendChild(c);
								});
							}
						}
					});
				}

				// PDF
				var revPdfBtn = body.querySelector('#mlm_rev_pdf');
				if (revPdfBtn) {
					revPdfBtn.onclick = function () {
						var rotasRevFilt = rotasRev.filter(function (r) {
							var rIns = getRevPkgs(r).filter(function (p) {
								var f = p.status || '';
								return f === 'not_delivered' || f === 'failed';
							}).length;
							if (_revFilAtual === 1) return rIns > 0;
							if (_revFilAtual === 2) return rIns === 0;
							return true;
						});
						var filAtivo = _revFilLabels[_revFilAtual];
						var now = new Date();
						var dataStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', {
							hour: '2-digit',
							minute: '2-digit'
						});
						var sscName = sSsc.value;
						var w = window.open('', '_blank', 'width=900,height=700');
						var dTotDesp = rotasRevFilt.reduce(function (a, r) {
							return a + getRevDesp(r);
						}, 0);
						var dTotDel = rotasRevFilt.reduce(function (a, r) {
							return a + getRevDel(r);
						}, 0);
						var dTotNaoDel = dTotDesp - dTotDel;
						var dDs = dTotDesp > 0 ? ((dTotDel / dTotDesp) * 100).toFixed(1) + '%' : '—';
						var dImp = totOpPkgsRev > 0 ? ((dTotNaoDel / totOpPkgsRev) * 100).toFixed(1) + '%' : '—';
						var rows = rotasRevFilt.map(function (r) {
							var rDesp = getRevDesp(r);
							var rDel = getRevDel(r);
							var pct = rDesp > 0 ? Math.round((rDel / rDesp) * 100) : 0;
							var drv = (r.driver && r.driver.driverName) || '—';
							var car = r.carrier || '—';
							var modal = (r.vehicle && r.vehicle.description) || '—';
							var pts = (r.cluster || '').split('_');
							var ciclo = pts.length > 1 ? pts[pts.length - 1] : '—';
							var inicio = r.initDate && r.initDate > 0 ? new Date(r.initDate * 1000).toLocaleString('pt-BR', {
								day: '2-digit',
								month: '2-digit',
								hour: '2-digit',
								minute: '2-digit'
							}) : '—';
							var closed = isClosed(r);
							var prog = getProg(r);
							var totPkgsRota = r._m ? (r._m.del + r._m.ins + r._m.pend) : 0;
							var pctRota = totPkgsRota > 0 ? Math.round((rDesp / totPkgsRota) * 100) : 0;
							var pctCol = pct >= 90 ? '#00a854' : pct >= 70 ? '#b45309' : '#991b1b';
							var impCol = pctRota < 20 ? '#00a854' : pctRota < 50 ? '#b45309' : '#991b1b';
							var allPkgsPdf = getRevPkgs(r);
							var pkgChips = allPkgsPdf.map(function (p) {
								var isDel = (p.status === 'delivered' || p.status === 'picked_up');
								var isIns = (p.status === 'not_delivered' || p.status === 'failed');
								var bg = isDel ? '#f0fdf4' : isIns ? '#fff0f0' : '#fff8f0';
								var bc = isDel ? '#bbf7d0' : isIns ? '#fecaca' : '#fed7aa';
								var fc = isDel ? '#166534' : isIns ? '#991b1b' : '#b45309';
								return '<span style="font-family:monospace;font-size:10px;padding:3px 8px;border-radius:3px;border:1px solid ' + bc + ';background:' + bg + ';color:' + fc + '">' + p.shipId + '</span>';
							}).join(' ');
							return '<div style="margin-bottom:18px;border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;break-inside:avoid">' +
								'<div style="background:#1a1a2e;color:#fff;padding:10px 14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
								'<span style="font-family:monospace;font-size:13px;font-weight:bold;color:#fb923c">' + r.id + '</span>' +
								'<span style="font-size:12px;color:#e2e8f0;flex:1">' + drv + '</span>' +
								'<span style="font-size:9px;padding:2px 7px;border-radius:3px;background:rgba(251,146,60,.2);color:#fb923c">' + ciclo + '</span>' +
								'<span style="font-size:9px;padding:2px 7px;border-radius:3px;background:' + (closed ? 'rgba(0,168,84,.2)' : 'rgba(255,171,64,.2)') + ';color:' + (closed ? '#00a854' : '#b45309') + '">' + (closed ? 'Encerrada' : 'Aberta') + '</span>' +
								'<span style="font-size:10px;color:#94a3b8;font-family:monospace">' + car + ' · ' + modal + ' · ' + inicio + '</span>' +
								'</div>' +
								'<div style="background:#f8f8f8;padding:7px 14px;display:flex;gap:18px;flex-wrap:wrap;border-bottom:1px solid #e8e8e8;font-size:11px;color:#555">' +
								'<span>Progresso geral: <b>' + prog.toFixed(0) + '%</b></span>' +
								'<span>Despachado: <b>' + rDesp + '</b></span>' +
								'<span>Entregue: <b style="color:#00a854">' + rDel + '</b></span>' +
								'<span>DS% devoluções: <b style="color:' + pctCol + '">' + pct + '%</b></span>' +
								'<span>↪ Impacto na rota: <b style="color:' + impCol + '">' + pctRota + '%</b></span>' +
								'</div>' +
								'<div style="padding:10px 14px">' +
								'<div style="font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:7px">Ship IDs — ' + allPkgsPdf.length + ' pacote' + (allPkgsPdf.length !== 1 ? 's' : '') + '</div>' +
								'<div style="display:flex;flex-wrap:wrap;gap:4px">' + pkgChips + '</div>' +
								'<div style="display:flex;gap:12px;margin-top:8px">' +
								'<span style="font-size:9px;color:#888;display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#bbf7d0;display:inline-block"></span>Entregue</span>' +
								'<span style="font-size:9px;color:#888;display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#fed7aa;display:inline-block"></span>Pendente</span>' +
								'<span style="font-size:9px;color:#888;display:flex;align-items:center;gap:3px"><span style="width:8px;height:8px;border-radius:2px;background:#fecaca;display:inline-block"></span>Não entregue</span>' +
								'</div>' +
								'</div>' +
								'</div>';
						}).join('');
						var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">' +
							'<title>Relatório Devoluções — ' + sscName + '</title>' +
							'<style>' +
							'*{box-sizing:border-box;margin:0;padding:0}' +
							'body{font-family:Arial,sans-serif;font-size:12px;color:#222;padding:28px 32px;max-width:820px;margin:0 auto}' +
							'.doc-title{font-size:20px;font-weight:bold;margin-bottom:2px}' +
							'.doc-sub{font-size:12px;color:#666;margin-bottom:18px}' +
							'.kpis{display:flex;gap:12px;margin-bottom:22px;flex-wrap:wrap}' +
							'.kpi{background:#f5f5f5;border-radius:5px;padding:10px 16px;flex:1;min-width:100px}' +
							'.kpi-lbl{font-size:9px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:2px}' +
							'.kpi-val{font-size:20px;font-weight:bold}' +
							'hr{border:none;border-top:1px solid #e0e0e0;margin:0 0 18px 0}' +
							'.footer{margin-top:24px;text-align:center;font-size:9px;color:#aaa;border-top:1px solid #eee;padding-top:12px}' +
							'@media print{button{display:none}}' +
							'</style></head><body>' +
							'<div class="doc-title">Relatório de Devoluções — ' + sscName + '</div>' +
							'<div class="doc-sub">Gerado em ' + dataStr + ' · Filtro: ' + filAtivo + '</div>' +
							'<div class="kpis">' +
							'<div class="kpi"><div class="kpi-lbl">Rotas c/ devolução</div><div class="kpi-val">' + rotasRevFilt.length + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">Total despachado</div><div class="kpi-val">' + dTotDesp + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">Entregues</div><div class="kpi-val" style="color:#00a854">' + dTotDel + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">Não entregues</div><div class="kpi-val" style="color:#991b1b">' + dTotNaoDel + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">DS% devoluções</div><div class="kpi-val" style="color:#5b21b6">' + dDs + '</div></div>' +
							'<div class="kpi"><div class="kpi-lbl">Impacto no geral</div><div class="kpi-val" style="color:#991b1b">' + dImp + '</div></div>' +
							'</div>' +
							'<hr>' +
							rows +
							'<div class="footer">Monitor Last Mile — Kangu LM · Mercado Livre</div>' +
							'<br><button id="btnPrint" style="padding:8px 20px;background:#1a1a2e;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px">Imprimir / Salvar PDF</button>' +
							'</body></html>';
						w.document.write(html);
						w.document.close();
						w.focus();
						w.onload = function () {
							w.document.getElementById('btnPrint').onclick = function () {
								w.print();
							};
						};
					};
				}

				// Excel devoluções
				var revXlsBtn = body.querySelector('#mlm_rev_xls');
				if (revXlsBtn) {
					revXlsBtn.onclick = function () {
						var fil = _revFilAtual;
						var revFilt = rotasRev.filter(function (r) {
							var ins = getRevPkgs(r).filter(function (p) {
								var f = p.status || '';
								return f === 'not_delivered' || f === 'failed';
							}).length;
							return fil === 1 ? ins > 0 : fil === 2 ? ins === 0 : true;
						});
						var agAll = routes.filter(function (r) {
							return r._m && r._m.agStops && r._m.agStops.length > 0;
						});
						var now = new Date();
						_xlsxExport([{
							name: 'Agencias',
							data: _buildAgRows(agAll)
						}, {
							name: 'Devolucoes',
							data: _buildRevRows(revFilt)
						}],
							'relatorio_' + sSsc.value + '_' + now.toISOString().slice(0, 10) + '.xls');
					};
				}
			}
		}

		// ===== FUNÇÕES EXCEL =====
		function _buildAgRows(lista) {
			var hdr = ['ID Rota', 'Motorista', 'Transportadora', 'Modal', 'Ciclo', 'Inicio', 'Status', 'Progresso (%)', 'Agencia', 'Despachado', 'Entregue', 'DS%', 'Ship ID', 'Status Pacote'];
			var rows = [hdr];
			lista.forEach(function (r) {
				var agDesp = getAgDesp(r);
				var agDel = getAgDel(r);
				var pct = agDesp > 0 ? Math.round((agDel / agDesp) * 100) : 0;
				var drv = (r.driver && r.driver.driverName) || '';
				var car = r.carrier || '';
				var modal = (r.vehicle && r.vehicle.description) || '';
				var pts = (r.cluster || '').split('_');
				var ciclo = pts.length > 1 ? pts[pts.length - 1] : '';
				var inicio = r.initDate && r.initDate > 0 ? new Date(r.initDate * 1000).toLocaleString('pt-BR', {
					day: '2-digit',
					month: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				}) : '';
				var closed = isClosed(r);
				var prog = getProg(r);
				var agAddrs = r._m.agStops.map(function (s) {
					return s.addr;
				}).filter(function (a, i, arr) {
					return arr.indexOf(a) === i;
				}).join(' / ');
				var allPkgs = [];
				r._m.agStops.forEach(function (s) {
					allPkgs = allPkgs.concat(s.pkgs || []);
				});
				allPkgs.forEach(function (p) {
					var isDel = (p.status === 'delivered' || p.status === 'picked_up');
					var isIns = (p.status === 'not_delivered' || p.status === 'failed');
					var stLabel = isDel ? 'Entregue' : isIns ? 'Nao entregue' : 'Pendente';
					rows.push([r.id, drv, car, modal, ciclo, inicio, closed ? 'Encerrada' : 'Aberta', prog.toFixed(0), agAddrs, agDesp, agDel, pct + '%', p.shipId, stLabel]);
				});
			});
			return rows;
		}

		function _buildRevRows(lista) {
			var hdr = ['ID Rota', 'Motorista', 'Transportadora', 'Modal', 'Ciclo', 'Inicio', 'Status', 'Progresso (%)', 'Despachado', 'Entregue', 'DS%', 'Impacto na rota (%)', 'Ship ID', 'Status Pacote'];
			var rows = [hdr];
			lista.forEach(function (r) {
				var rDesp = getRevDesp(r);
				var rDel = getRevDel(r);
				var pct = rDesp > 0 ? Math.round((rDel / rDesp) * 100) : 0;
				var drv = (r.driver && r.driver.driverName) || '';
				var car = r.carrier || '';
				var modal = (r.vehicle && r.vehicle.description) || '';
				var pts = (r.cluster || '').split('_');
				var ciclo = pts.length > 1 ? pts[pts.length - 1] : '';
				var inicio = r.initDate && r.initDate > 0 ? new Date(r.initDate * 1000).toLocaleString('pt-BR', {
					day: '2-digit',
					month: '2-digit',
					hour: '2-digit',
					minute: '2-digit'
				}) : '';
				var closed = isClosed(r);
				var prog = getProg(r);
				var totPkgsRota = r._m ? (r._m.del + r._m.ins + r._m.pend) : 0;
				var pctRota = totPkgsRota > 0 ? Math.round((rDesp / totPkgsRota) * 100) : 0;
				var pkgs = getRevPkgs(r);
				pkgs.forEach(function (p) {
					var isDel = (p.status === 'delivered' || p.status === 'picked_up');
					var isIns = (p.status === 'not_delivered' || p.status === 'failed');
					var stLabel = isDel ? 'Entregue' : isIns ? 'Nao entregue' : 'Pendente';
					rows.push([r.id, drv, car, modal, ciclo, inicio, closed ? 'Encerrada' : 'Aberta', prog.toFixed(0), rDesp, rDel, pct + '%', pctRota + '%', p.shipId, stLabel]);
				});
			});
			return rows;
		}

		function _xlsxExport(sheets, filename) {
			function toCsv(rows) {
				return rows.map(function (row) {
					return row.map(function (cell) {
						var s = cell === null || cell === undefined ? '' : String(cell);
						if (s.indexOf(',') > -1 || s.indexOf('"') > -1 || s.indexOf('\n') > -1) {
							s = '"' + s.replace(/"/g, '""') + '"';
						}
						return s;
					}).join(',');
				}).join('\r\n');
			}

			function download(content, fname) {
				var blob = new Blob(['\ufeff' + content], {
					type: 'text/csv;charset=utf-8'
				});
				var url = URL.createObjectURL(blob);
				var a = document.createElement('a');
				a.href = url;
				a.download = fname;
				document.body.appendChild(a);
				a.click();
				setTimeout(function () {
					URL.revokeObjectURL(url);
					document.body.removeChild(a);
				}, 500);
			}
			var base = filename.replace('.xls', '').replace('.xlsx', '');
			sheets.forEach(function (sh, i) {
				setTimeout(function () {
					download(toCsv(sh.data), base + '_' + sh.name + '.csv');
				}, i * 600);
			});
		}

		function applyZoom() {
			applyScale();
		}
		btnZoomIn.onclick = function () {
			if (_mlmScale < 1.5) {
				_mlmScale = Math.round((_mlmScale + 0.1) * 10) / 10;
				applyScale();
			}
		}
		btnZoomOut.onclick = function () {
			if (_mlmScale > 0.6) {
				_mlmScale = Math.round((_mlmScale - 0.1) * 10) / 10;
				applyScale();
			}
		}

		// ===== JANELA =====
		// Minimizar/maximizar internos desabilitados — gerenciados pela casca externa
		var btnMin = $id('mlm_min_' + sscCode);
		var btnMax = $id('mlm_max_' + sscCode);
		// (botões não existem no DOM interno — sem efeito)

		// ===== REPORT HORA A HORA =====
		btnReport.onclick = function () {
			var f = sortRoutes(filterRoutes());
			var totDel = 0,
				totIns = 0,
				totPend = 0,
				totPNR = 0,
				totSacas = 0,
				totSacasPend = 0;
			var allMot = {};
			f.forEach(function (r) {
				totDel += getDel(r);
				totIns += getInsuc(r);
				totPend += getPend(r);
				totPNR += getPNR(r);
				totSacas += parseInt((r.counters && r.counters.totalBags) || 0);
				totSacasPend += parseInt((r.counters && r.counters.pendingBags) || 0);
				var mx = getMotivos(r);
				Object.keys(mx).forEach(function (k) {
					if (mx[k] > 0) allMot[k] = (allMot[k] || 0) + mx[k];
				});
			});
			var totPkg = totDel + totIns + totPend;
			var dt = totDel + totIns;
			var ds = dt > 0 ? ((totDel / dt) * 100).toFixed(1) + '%' : '—';
			var now = new Date();
			var hora = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
			var data = now.getDate().toString().padStart(2, '0') + '/' + (now.getMonth() + 1).toString().padStart(2, '0') + '/' + now.getFullYear();
			var sscName = sSsc.value;
			// Filtros ativos
			var filtros = [];
			if (fSel.carrier.size > 0) filtros.push([...fSel.carrier].join(', '));
			if (fSel.ciclo.size > 0) filtros.push('Ciclo: ' + [...fSel.ciclo].join(', '));
			if (fStatus.value) filtros.push(fStatus.value === 'open' ? 'Abertas' : 'Encerradas');
			var filtroStr = filtros.length > 0 ? '\n🔍 Filtro: ' + filtros.join(' | ') : '';
			// Motivos ordenados
			var motLines = Object.keys(allMot).map(function (k) {
				return [k, allMot[k]];
			}).sort(function (a, b) {
				return b[1] - a[1];
			})
				.map(function (m) {
					return '• ' + m[0] + ': ' + m[1];
				}).join('\n');
			var texto = '📊 *REPORT HORA A HORA - ' + sscName + '*\n' +
				'🕒 *' + hora + ' - ' + data + '*' +
				filtroStr + '\n\n' +
				'🔢 *ROTAS:* ' + f.length + '\n' +
				'🟡 *ABERTAS:* ' + f.filter(function (r) {
					return !isClosed(r);
				}).length + '\n' +
				'✅ *ENCERRADAS:* ' + f.filter(function (r) {
					return isClosed(r);
				}).length + '\n' +
				'📦 *TOTAL PACOTES:* ' + totPkg + '\n' +
				'✅ *ENTREGUES:* ' + totDel + '\n' +
				'⏳ *PENDENTES:* ' + totPend + '\n' +
				'❌ *INSUCESSOS:* ' + totIns + '\n' +
				'🎒 *SACAS:* ' + totSacas + '\n' +
				'📌 *PNR:* ' + totPNR + '\n' +
				'📈 *DS%:* ' + ds + '\n';
			if (motLines) texto += '\n❌ *INSUCESSOS POR MOTIVO:*\n' + motLines;
			// Modal
			var modal = mk('div', 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:9999999;display:flex;align-items:center;justify-content:center');
			var box = mk('div', 'background:#0a0e1a;border:1px solid #1e2d45;border-radius:12px;width:500px;max-height:80vh;overflow-y:auto;padding:24px;font-family:sans-serif');
			var title = mk('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px');
			title.innerHTML = '<div style="font-weight:600;font-size:15px;color:#34d399">📊 Report Hora a Hora</div>';
			var btnClose = mk('button', 'background:transparent;border:1px solid #1e2d45;color:#64748b;width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:16px', '✕');
			btnClose.onclick = function () {
				modal.remove();
			};
			title.appendChild(btnClose);
			var ta = mk('textarea', 'width:100%;height:320px;background:#111827;border:1px solid #1e2d45;color:#e2e8f0;padding:10px;border-radius:6px;font-family:monospace;font-size:12px;resize:vertical;box-sizing:border-box');
			ta.value = texto;
			var btnCopy = mk('button', 'background:#34d399;color:#000;border:none;padding:8px 20px;border-radius:4px;font-family:' + mn + ';font-size:11px;font-weight:600;cursor:pointer;margin-top:8px;width:100%', '📋 COPIAR PARA WHATSAPP');
			btnCopy.onclick = function () {
				ta.select();
				document.execCommand('copy');
				btnCopy.textContent = '✅ COPIADO!';
				setTimeout(function () {
					btnCopy.textContent = '📋 COPIAR PARA WHATSAPP';
				}, 2000);
			};
			box.appendChild(title);
			box.appendChild(ta);
			box.appendChild(btnCopy);
			modal.appendChild(box);
			modal.onclick = function (e) {
				if (e.target === modal) modal.remove();
			};
			document.body.appendChild(modal);
		};

		btnFech.onclick = function () {
			var f = sortRoutes(filterRoutes());
			// Calcular totais
			var totPkg = 0,
				totIns = 0,
				totDel = 0,
				totPend = 0,
				totPNR = 0,
				totCom = 0,
				totRes = 0,
				totFin = 0,
				totInsColeta = 0;
			var allMot = {},
				motCom = {},
				motRes = {};
			var naoVisitado = 0;
			f.forEach(function (r) {
				totDel += getDel(r);
				totIns += getInsuc(r);
				totPend += getPend(r);
				totPNR += getPNR(r);
				totCom += getCom(r);
				totRes += getRes(r);
				totInsColeta += getInsColeta(r);
				if (isClosed(r)) totFin++;
				var mx = getMotivos(r);
				Object.keys(mx).forEach(function (k) {
					if (mx[k] > 0) {
						allMot[k] = (allMot[k] || 0) + mx[k];
						if (k.toLowerCase().includes('visit') || k.toLowerCase().includes('não visit')) naoVisitado += mx[k];
					}
				});
			});
			totPkg = totDel + totIns + totPend;
			var dt = totDel + totIns;
			var ds = dt > 0 ? ((totDel / dt) * 100).toFixed(1) + '%' : '—';

			// Top 5 ofensoras
			var top5 = f.filter(function (r) {
				return getInsuc(r) > 0;
			}).sort(function (a, b) {
				return getInsuc(b) - getInsuc(a);
			}).slice(0, 5);

			// Motivos por tipo
			var sortedMot = Object.keys(allMot).map(function (k) {
				return [k, allMot[k]];
			}).sort(function (a, b) {
				return b[1] - a[1];
			});

			// Data
			var now = new Date();
			var dateStr = now.getDate().toString().padStart(2, '0') + '/' + (now.getMonth() + 1).toString().padStart(2, '0');
			var sscName = sSsc.value;

			// Modal do fechamento
			var modal = mk('div', 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:9999999;display:flex;align-items:center;justify-content:center');
			var box = mk('div', 'background:#0a0e1a;border:1px solid #1e2d45;border-radius:12px;width:680px;max-height:85vh;overflow-y:auto;padding:24px;font-family:sans-serif');

			var title = mk('div', 'display:flex;align-items:center;justify-content:space-between;margin-bottom:20px');
			title.innerHTML = '<div style="font-weight:600;font-size:15px;color:#a78bfa">📋 Gerar Fechamento</div>';
			var btnClose = mk('button', 'background:transparent;border:1px solid #1e2d45;color:#64748b;width:28px;height:28px;border-radius:4px;cursor:pointer;font-size:16px', '✕');
			btnClose.onclick = function () {
				modal.remove();
			};
			title.appendChild(btnClose);
			box.appendChild(title);

			// Campos manuais
			function field(label, val, id) {
				var wrap = mk('div', 'margin-bottom:10px');
				wrap.innerHTML = '<div style="font-size:11px;color:#64748b;font-family:' + mn + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + label + '</div>';
				var inp = mk('input', 'background:#1a2235;border:1px solid #1e2d45;color:#e2e8f0;padding:6px 10px;border-radius:4px;font-family:' + mn + ';font-size:12px;width:100%;box-sizing:border-box');
				inp.value = val || '';
				inp.id = 'fech_' + id;
				wrap.appendChild(inp);
				return wrap;
			}

			// Campos automáticos (somente leitura)
			function autoField(label, val) {
				var wrap = mk('div', 'margin-bottom:10px');
				wrap.innerHTML = '<div style="font-size:11px;color:#64748b;font-family:' + mn + ';text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">' + label + '</div>' +
					'<div style="background:#111827;border:1px solid #1e2d45;color:#00e676;padding:6px 10px;border-radius:4px;font-family:' + mn + ';font-size:12px">' + val + '</div>';
				return wrap;
			}

			var grid = mk('div', 'display:grid;grid-template-columns:1fr 1fr;gap:0 16px');

			// Automáticos
			grid.appendChild(autoField('📦 Pacotes', totPkg));
			grid.appendChild(autoField('🎯 DS%', ds));
			grid.appendChild(autoField('🔴 Insucessos', totIns));
			grid.appendChild(autoField('🔴 Não visitado', naoVisitado));
			grid.appendChild(autoField('🟡 PNR', totPNR));
			grid.appendChild(autoField('🟢 Rotas finalizadas', totFin));

			// Manuais
			grid.appendChild(field('⚠ Ocorrência SHE', '', 'she'));
			grid.appendChild(field('↪ Sacas', '', 'sacas'));
			grid.appendChild(field('🚚 SDD Meta', '', 'sdd_meta'));
			grid.appendChild(field('🚚 SDD Real', '', 'sdd_real'));
			grid.appendChild(field('🚫 Carros cortados', '', 'carros'));
			grid.appendChild(field('🚑 Ambulância', '', 'amb'));
			grid.appendChild(field('📣 Ofertados D+1', '', 'd1'));
			box.appendChild(grid);

			// Ofensoras com campo de contexto
			var ofTitle = mk('div', 'margin:16px 0 10px;font-size:11px;color:#64748b;font-family:' + mn + ';text-transform:uppercase;letter-spacing:.5px', 'CONTEXTO DAS ROTAS OFENSORAS');
			box.appendChild(ofTitle);
			top5.forEach(function (r, i) {
				var mx = getMotivos(r);
				var wrap = mk('div', 'margin-bottom:10px;background:#111827;border:1px solid #1e2d45;border-radius:6px;padding:10px');
				var motStr = Object.keys(mx).filter(function (k) {
					return mx[k] > 0;
				}).map(function (k) {
					return k + ' (' + mx[k] + ')';
				}).join(' / ');
				wrap.innerHTML = '<div style="font-family:' + mn + ';font-size:11px;color:#00d4ff;margin-bottom:4px">' + (r.cluster || '') + '· #' + r.id + '</div>' +
					'<div style="font-size:10px;color:#ff5252;margin-bottom:6px">' + motStr + '</div>';
				var inp = mk('input', 'background:#1a2235;border:1px solid #1e2d45;color:#e2e8f0;padding:5px 10px;border-radius:4px;font-family:sans-serif;font-size:12px;width:100%;box-sizing:border-box');
				inp.placeholder = 'Contexto (ex: motorista novato, comercial fechado...)';
				inp.id = 'fech_of_' + i;
				wrap.appendChild(inp);
				box.appendChild(wrap);
			});

			// Botão gerar
			var btnGerar = mk('button', 'background:#a78bfa;color:#000;border:none;padding:10px 24px;border-radius:6px;font-family:' + mn + ';font-size:12px;font-weight:600;cursor:pointer;width:100%;margin-top:8px', '📋 GERAR TEXTO');
			btnGerar.onclick = function () {
				var she = document.getElementById('fech_she').value || '0';
				var sacas = document.getElementById('fech_sacas').value || '___';
				var sddMeta = document.getElementById('fech_sdd_meta').value || '___';
				var sddReal = document.getElementById('fech_sdd_real').value || '___';
				var carros = document.getElementById('fech_carros').value || '___';
				var amb = document.getElementById('fech_amb').value || '0';
				var d1 = document.getElementById('fech_d1').value || '___';

				// Montar motivos comerciais e residenciais
				var motLines = sortedMot.map(function (kv) {
					return '❌ ' + kv[0] + ': ' + kv[1];
				}).join('\n');

				// Montar ofensoras
				var ofLines = top5.map(function (r, i) {
					var mx = getMotivos(r);
					var ctx = document.getElementById('fech_of_' + i).value || '___';
					var motivos = Object.keys(mx).filter(function (k) {
						return mx[k] > 0;
					}).map(function (k) {
						return '❌ ' + k + ' (' + mx[k] + ')';
					}).join('\n');
					return (r.cluster || '') + '· #' + r.id + '\n' +
						'📦 ' + getInsuc(r) + ' insucessos\n' +
						'🏢 ' + getCom(r) + ' comerciais\n' +
						'🏠 ' + getRes(r) + ' residenciais\n' +
						motivos + '\n' +
						'📝 ' + ctx;
				}).join('\n\n');

				var texto = '*' + sscName + ' - ' + dateStr + '*\n\n' +
					'⚠ Ocorrência SHE: ' + she + '\n' +
					'📦 ' + totPkg + ' Pacotes\n' +
					'↪ ' + sacas + ' Sacas\n' +
					'🎯 DS: ' + ds + '\n' +
					'🔴 Insucessos: ' + totIns + '\n' +
					'🔴 Não visitado: ' + naoVisitado + '\n' +
					'🟡 PNR/Pacotes perdidos: ' + totPNR + '\n' +
					'🟢 Rotas finalizadas: ' + totFin + '\n' +
					'🚚 SDD: Meta ' + sddMeta + ' / Real: ' + sddReal + '\n' +
					'🚫 Carros cortados: ' + carros + '\n' +
					'🚑 Ambulância: ' + amb + '\n' +
					'📣 Ofertados D+1: ' + d1 + '\n\n' +
					totCom + ' Comerciais sem reversões\n' +
					(totInsColeta > 0 ? '\n🏭 Insucessos de coleta: ' + totInsColeta + '\n' : '') +
					motLines.split('\n').filter(function (l) {
						return l;
					}).join('\n') + '\n\n' +
					totRes + ' Residenciais sem reversões\n\n' +
					'Insucessos são negócios fechados e clientes ausentes.\n\n' +
					'Rotas ofensoras:\n\n' +
					ofLines;

				// Área de texto para copiar
				var taWrap = mk('div', 'margin-top:12px');
				var ta = mk('textarea', 'width:100%;height:280px;background:#111827;border:1px solid #1e2d45;color:#e2e8f0;padding:10px;border-radius:6px;font-family:monospace;font-size:11px;resize:vertical;box-sizing:border-box');
				ta.value = texto;
				var btnCopy = mk('button', 'background:#00d4ff;color:#000;border:none;padding:8px 20px;border-radius:4px;font-family:' + mn + ';font-size:11px;font-weight:600;cursor:pointer;margin-top:8px;width:100%', '📋 COPIAR PARA WHATSAPP');
				btnCopy.onclick = function () {
					ta.select();
					document.execCommand('copy');
					btnCopy.textContent = '✅ COPIADO!';
					setTimeout(function () {
						btnCopy.textContent = '📋 COPIAR PARA WHATSAPP';
					}, 2000);
				};
				taWrap.appendChild(ta);
				taWrap.appendChild(btnCopy);
				box.appendChild(taWrap);
				btnGerar.style.display = 'none';
			};
			box.appendChild(btnGerar);
			modal.appendChild(box);
			document.body.appendChild(modal);
			modal.onclick = function (e) {
				if (e.target === modal) modal.remove();
			};
		};

		// ===== AGENDA =====
		btnAgenda.onclick = function () {
			var count = Object.keys(_agenda).length;
			var modal = document.createElement('div');
			modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center';
			var box = document.createElement('div');
			box.style.cssText = 'background:' + S.sf + ';border:1px solid ' + S.bd + ';border-radius:12px;padding:24px;width:420px;max-width:90vw;font-family:' + mn + ';color:' + S.tx + '';
			var lastImport = localStorage.getItem('mlm_agenda_date') || 'Nunca';
			box.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:16px">👥 Agenda de Motoristas</div>' +
				'<div style="font-size:11px;color:' + S.mt + ';margin-bottom:6px">Motoristas carregados: <span style="color:' + S.ok + ';font-weight:600">' + count + '</span></div>' +
				'<div style="font-size:11px;color:' + S.mt + ';margin-bottom:16px">Última importação: <span style="color:' + S.tx + '">' + lastImport + '</span></div>' +
				'<div style="font-size:11px;color:' + S.mt + ';margin-bottom:8px">Selecione o arquivo CSV da planilha Pool de Veículos (aba Unificado):</div>' +
				'<input type="file" id="mlm_csv_ag" accept=".csv" style="display:none">' +
				'<div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">' +
				'<label for="mlm_csv_ag" style="background:' + S.ac + ';color:#000;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600">📁 Selecionar CSV</label>' +
				'<span id="mlm_ag_fname" style="font-size:10px;color:' + S.mt + '">Nenhum arquivo selecionado</span>' +
				'</div>' +
				'<div id="mlm_ag_preview" style="font-size:10px;color:' + S.mt + ';margin-bottom:12px;min-height:16px"></div>' +
				'<div style="display:flex;gap:8px;justify-content:flex-end">' +
				'<button id="mlm_ag_import" style="background:' + S.ok + ';color:#000;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:600;border:none;display:none">✅ Importar</button>' +
				'<button id="mlm_ag_clear" style="background:transparent;border:1px solid ' + S.er + ';color:' + S.er + ';padding:8px 16px;border-radius:6px;cursor:pointer;font-size:11px;border-width:1px">🗑 Limpar</button>' +
				'<button id="mlm_ag_close" style="background:transparent;border:1px solid ' + S.bd + ';color:' + S.mt + ';padding:8px 16px;border-radius:6px;cursor:pointer;font-size:11px;border-width:1px">Fechar</button>' +
				'</div>';
			modal.appendChild(box);
			document.body.appendChild(modal);
			var parsedAg = null;
			$id('mlm_csv_ag').addEventListener('change', function (e) {
				var file = e.target.files[0];
				if (!file) return;
				$id('mlm_ag_fname').textContent = file.name;
				var fr = new FileReader();
				fr.onload = function (ev) {
					var text = ev.target.result;
					var lines = text.split(/\r?\n/);
					var header = lines[0].split(',');
					var iNome = header.findIndex(function (h) {
						return h.trim() === 'Nome do Motorista';
					});
					var iTel = header.findIndex(function (h) {
						return h.trim() === 'Telefone';
					});
					var iHub = header.findIndex(function (h) {
						return h.trim() === 'HUB_Motorista';
					});
					if (iNome === -1 || iTel === -1) {
						$id('mlm_ag_preview').innerHTML = '<span style="color:' + S.er + '">❌ Arquivo inválido. Verifique se é o CSV correto da planilha Pool de Veículos.</span>';
						return;
					}
					parsedAg = {};
					var comTel = 0,
						semTel = 0;
					for (var i = 1; i < lines.length; i++) {
						var cols = lines[i].split(',');
						if (cols.length < Math.max(iNome, iTel) + 1) continue;
						var nome = (cols[iNome] || '').trim().replace(/^"|"$/g, '');
						var tel = (cols[iTel] || '').trim().replace(/^"|"$/g, '');
						var hub = iHub >= 0 ? (cols[iHub] || '').trim().replace(/^"|"$/g, '') : '';
						if (!nome) continue;
						if (!tel) {
							semTel++;
							continue;
						}
						tel = tel.replace(/\D/g, '');
						if (!tel) continue;
						var norm = _normName(nome);
						parsedAg[norm] = {
							tel: tel,
							hub: hub,
							nome: nome
						};
						comTel++;
					}
					$id('mlm_ag_preview').innerHTML =
						'<span style="color:' + S.ok + '">✅ ' + comTel + ' motoristas com telefone encontrados</span> ' +
						'<span style="color:' + S.mt + '">(' + semTel + ' sem telefone ignorados)</span>';
					$id('mlm_ag_import').style.display = 'inline-block';
				};
				fr.readAsText(file, 'UTF-8');
			});
			$id('mlm_ag_import').addEventListener('click', function () {
				if (!parsedAg) return;
				_saveAgenda(parsedAg);
				var now = new Date().toLocaleString('pt-BR');
				localStorage.setItem('mlm_agenda_date', now);
				var c = Object.keys(parsedAg).length;
				$id('mlm_ag_preview').innerHTML = '<span style="color:' + S.ok + '">✅ ' + c + ' motoristas importados com sucesso!</span>';
				$id('mlm_ag_import').style.display = 'none';
				btnAgenda.style.borderColor = S.ok;
				btnAgenda.style.color = S.ok;
				btnAgenda.title = 'Agenda: ' + c + ' motoristas';
			});
			$id('mlm_ag_clear').addEventListener('click', function () {
				if (!confirm('Limpar a agenda de motoristas?')) return;
				localStorage.removeItem('mlm_agenda_v1');
				localStorage.removeItem('mlm_agenda_date');
				_agenda = {};
				parsedAg = null;
				$id('mlm_ag_preview').innerHTML = '<span style="color:' + S.wn + '">Agenda limpa.</span>';
				$id('mlm_ag_import').style.display = 'none';
				$id('mlm_ag_fname').textContent = 'Nenhum arquivo selecionado';
				btnAgenda.style.borderColor = S.mt;
				btnAgenda.style.color = S.mt;
				btnAgenda.title = 'Agenda de Motoristas';
			});
			$id('mlm_ag_close').addEventListener('click', function () {
				modal.remove();
			});
			modal.addEventListener('click', function (e) {
				if (e.target === modal) modal.remove();
			});
		};
		// Atualizar visual btnAgenda se já tem dados
		(function () {
			var c = Object.keys(_agenda).length;
			if (c > 0) {
				btnAgenda.style.borderColor = S.ok;
				btnAgenda.style.color = S.ok;
				btnAgenda.title = 'Agenda: ' + c + ' motoristas';
			}
		})();

		// ===== CSV =====
		btnC.onclick = function () {
			var f = sortRoutes(filterRoutes());
			if (!f.length) return;
			var hd = 'ID,Cluster,Tipo,Modal,Placa,Transportadora,Motorista,Status,Entregues,Pendentes,PNR,Insucessos,DS%,Progresso%,Motivos\n';
			var rows = f.map(function (r) {
				var tipo = r.isDeliveryPickupRoute ? 'Mista' : r.isPickupRoute ? 'Coleta' : 'Entrega';
				var del = getDel(r);
				var ins = getInsuc(r);
				var dt = del + ins;
				var ds = dt > 0 ? ((del / dt) * 100).toFixed(1) + '%' : '—';
				var mx = getMotivos(r);
				var motStr = Object.keys(mx).filter(function (k) {
					return mx[k] > 0;
				}).map(function (k) {
					return k + ':' + mx[k];
				}).join('|');
				return [r.id, r.cluster || '', tipo, (r.vehicle && r.vehicle.description) || '', (r.vehicle && r.vehicle.license) || '', (r.carrier || '').replace(/,/g, ' '), ((r.driver && r.driver.driverName) || '').replace(/,/g, ' '), isClosed(r) ? 'ENCERRADA' : 'ABERTA', del, getPend(r), getPNR(r), ins, ds, getProg(r).toFixed(0), motStr].join(',');
			}).join('\n');
			var blob = new Blob(['\ufeff' + hd + rows], {
				type: 'text/csv;charset=utf-8'
			});
			var url = URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.href = url;
			a.download = 'rotas_' + sSsc.value + '_' + new Date().toISOString().slice(0, 10) + '.csv';
			a.click();
			URL.revokeObjectURL(url);
		};

		btnF.onclick = doFetch;


		// Ajustar campo de estação ao sscCode desta instância
		if (typeof sSsc !== 'undefined') {
			sSsc.value = sscCode;
		}

		// Expor interface para controle externo
		return {
			container: container,
			doFetch: typeof doFetch !== 'undefined' ? doFetch : null,
			stopRefresh: typeof stopRefresh !== 'undefined' ? stopRefresh : null,
			pauseRefresh: typeof pauseRefresh !== 'undefined' ? pauseRefresh : null,
			resumeRefresh: typeof resumeRefresh !== 'undefined' ? resumeRefresh : null,
			setOnDone: function (cb) {
				_stationOnDone = cb;
			}
		};
	}

	// ===== BUSCAR TUDO =====
	var _fetchQueue = [];

	function runQueue() {
		if (_fetchQueue.length === 0) return;
		var sscCode = _fetchQueue.shift();
		if (!_stations[sscCode]) return runQueue();
		updateStationBadge(sscCode, 'loading', 'carregando...');
		// Ativar esta estação para mostrar progresso ao usuário
		activateStation(sscCode);
		var inst = _stations[sscCode].inst;
		if (inst && inst.doFetch) {
			// Registrar callback de conclusão ANTES de iniciar o fetch
			inst.setOnDone(function () {
				updateStationBadge(sscCode, 'done', 'pronta ✓');
				// Só navega automaticamente se não houve escolha manual do usuário
				if (_activeStation === sscCode) {
					var first = Object.keys(_stations)[0];
					if (first && first !== sscCode) activateStation(first);
				}
				runQueue();
			});
			// Só muda para a estação sendo carregada se o usuário não escolheu outra
			if (_activeStation === sscCode || _activeStation === null) activateStation(sscCode);
			inst.doFetch();
		}
	}

	btnBuscarTudo.onclick = function () {
		var raw = stationsInput.value.trim();
		if (!raw) {
			alert('Digite pelo menos um código de estação.');
			return;
		}
		var codes = raw.split(',').map(function (s) {
			return s.trim().toUpperCase();
		}).filter(function (s) {
			return s.length > 0;
		});
		if (codes.length === 0) return;

		// Limpar estado anterior
		_stations = {};
		_activeStation = null;
		_fetchQueue = [];
		sideList.innerHTML = '';
		mainArea.innerHTML = '<div style="padding:48px;text-align:center;color:' + S.mt + ';font-family:' + mn + ';font-size:12px">Inicializando estações...</div>';

		// Criar instâncias e fila
		codes.forEach(function (code) {
			var inst = createStation(code);
			_stations[code] = {
				status: 'waiting',
				container: inst.container,
				inst: inst,
				sscCode: code
			};
			addStationToSidebar(code, 'waiting');
			_fetchQueue.push(code);
		});

		updateSidebarStatus();
		// Ativar primeira estação na sidebar visualmente
		activateStation(codes[0]);
		// Iniciar fila sequencial
		runQueue();
	};

	window.addEventListener('meli-hub:plugin-disabled', function (e) {
		if (e.detail && e.detail.pluginId === 'mlm_multi') {
			var panel = document.getElementById('mlmp_multi');
			if (panel) panel.remove();
		}
	});

})();
