(function () {
  'use strict';

  const API = '../api/';
  const DATA = '../data/site.json';

  // Estrutura do painel. Cada seção aponta para uma parte do site.json.
  // path = caminho do objeto ('' = raiz). fields = campos daquela parte.
  // t = tipo: text (padrão), textarea, number, bool, select, image, strings (lista de textos), list (lista de objetos).
  const SECTIONS = [
    { title: 'Site e navegador', path: 'site', fields: [
      { k: 'title', label: 'Título da aba do navegador' },
      { k: 'description', label: 'Descrição (aparece em buscadores)', t: 'textarea' },
      { k: 'themeColor', label: 'Cor do navegador (hex, ex: #0d0b14)' },
      { k: 'favicon', label: 'Ícone da aba do navegador', t: 'image' },
    ]},
    { title: 'Marca (logo do topo)', path: 'brand', fields: [
      { k: 'name', label: 'Nome da marca' },
      { k: 'logo', label: 'Logo', t: 'image' },
    ]},
    { title: 'Perfil', path: 'profile', fields: [
      { k: 'name', label: 'Nome' },
      { k: 'nick', label: 'Nome estilizado / apelido' },
      { k: 'handle', label: 'Usuário (ex: @seuusuario)' },
      { k: 'avatar', label: 'Foto de perfil', t: 'image' },
      { k: 'role', label: 'Função' },
      { k: 'focus', label: 'Foco (ex: Web · Back-end)' },
      { k: 'status', label: 'Status (ex: Disponível para projetos)' },
    ]},
    { title: 'Início (topo da página)', path: 'hero', fields: [
      { k: 'eyebrow', label: 'Texto pequeno acima do título' },
      { k: 'titleBefore', label: 'Título — primeira parte' },
      { k: 'titleAccent', label: 'Título — parte em destaque (colorida)' },
      { k: 'desc', label: 'Descrição', t: 'textarea' },
      { k: 'image', label: 'Imagem principal (personagem/ilustração)', t: 'image' },
    ]},
    { title: 'Faixa de tecnologias', path: '', fields: [
      { k: 'tape', label: 'Itens da faixa', t: 'strings' },
    ]},
    { title: 'Números', path: '', fields: [
      { k: 'stats', label: 'Números', t: 'list', addLabel: 'número', item: [
        { k: 'value', label: 'Valor', t: 'number' },
        { k: 'prefix', label: 'Prefixo (ex: +)' },
        { k: 'suffix', label: 'Sufixo (ex: %)' },
        { k: 'label', label: 'Legenda' },
      ]},
    ]},
    { title: 'Sobre', path: 'about', fields: [
      { k: 'title', label: 'Título' },
      { k: 'paragraphs', label: 'Parágrafos', t: 'strings' },
      { k: 'chips', label: 'Tags de habilidades', t: 'strings' },
    ]},
    { title: 'Barras de habilidade', path: '', fields: [
      { k: 'skills', label: 'Habilidades', t: 'list', addLabel: 'habilidade', item: [
        { k: 'name', label: 'Nome' },
        { k: 'level', label: 'Nível (0 a 100)', t: 'number' },
      ]},
    ]},
    { title: 'Projetos e servidores', path: 'servers', fields: [
      { k: 'title', label: 'Título da seção' },
      { k: 'desc', label: 'Descrição da seção', t: 'textarea' },
      { k: 'background', label: 'Imagem de fundo da seção (opcional)', t: 'image' },
      { k: 'items', label: 'Servidores / projetos principais', t: 'list', addLabel: 'servidor', item: [
        { k: 'name', label: 'Nome' },
        { k: 'sub', label: 'Subtítulo' },
        { k: 'image', label: 'Logo / imagem', t: 'image' },
        { k: 'modalTitle', label: 'Título ao abrir' },
        { k: 'modalSub', label: 'Subtítulo ao abrir' },
        { k: 'projects', label: 'Projetos deste servidor', t: 'list', addLabel: 'projeto', item: [
          { k: 'name', label: 'Nome do projeto' },
          { k: 'image', label: 'Imagem', t: 'image' },
          { k: 'soon', label: 'Marcar como "Em breve" (sem detalhes)', t: 'bool' },
          { k: 'title', label: 'Título dentro do projeto' },
          { k: 'video', label: 'Link de vídeo do YouTube (opcional)' },
          { k: 'paragraphs', label: 'Descrição (cada item é um parágrafo)', t: 'strings' },
          { k: 'items', label: 'Itens / níveis (ex: raridades de baús)', t: 'list', addLabel: 'item', item: [
            { k: 'name', label: 'Nome' },
            { k: 'info', label: 'Informação' },
            { k: 'tier', label: 'Cor', t: 'select', opts: ['normal', 'raro', 'epico', 'lendario'] },
          ]},
          { k: 'note', label: 'Observação final', t: 'textarea' },
        ]},
      ]},
    ]},
    { title: 'Contato', path: 'contact', fields: [
      { k: 'label', label: 'Texto pequeno (ex: Próximo passo)' },
      { k: 'title', label: 'Título' },
      { k: 'text', label: 'Texto', t: 'textarea' },
      { k: 'button', label: 'Texto do botão principal' },
      { k: 'email', label: 'E-mail' },
      { k: 'discord', label: 'Discord (usuário, copiado ao clicar)' },
      { k: 'github', label: 'Link do GitHub (https://…)' },
      { k: 'githubHandle', label: 'Texto do GitHub (ex: /seuusuario)' },
    ]},
    { title: 'Rodapé', path: 'footer', fields: [
      { k: 'text', label: 'Texto', t: 'textarea' },
      { k: 'madeBy', label: 'Assinatura' },
    ]},
  ];

  let cfg = null;
  let dirty = false;

  const $ = s => document.querySelector(s);

  function el(tag, props = {}, kids = []) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (k === 'class') n.className = v;
      else if (k === 'open') n.open = !!v;
      else if (k.startsWith('on')) n[k] = v;
      else n.setAttribute(k, v);
    }
    [].concat(kids).forEach(c => n.append(c instanceof Node ? c : document.createTextNode(c)));
    return n;
  }

  function toast(msg, kind) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast show ' + (kind === 'bad' ? 'bad' : kind === 'good' ? 'good' : '');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.className = 'toast'), 3200);
  }

  function markDirty() { dirty = true; }

  function blank(fields) {
    const o = {};
    fields.forEach(f => {
      switch (f.t) {
        case 'number': o[f.k] = 0; break;
        case 'bool': o[f.k] = false; break;
        case 'select': o[f.k] = (f.opts || [''])[0]; break;
        case 'strings': case 'list': o[f.k] = []; break;
        default: o[f.k] = '';
      }
    });
    return o;
  }

  function fieldEl(f, obj) {
    const t = f.t || 'text';
    const wrap = el('div', { class: 'field' });
    if (t !== 'bool') wrap.append(el('label', {}, f.label || f.k));

    if (t === 'textarea' || t === 'text' || t === 'number') {
      const input = el(t === 'textarea' ? 'textarea' : 'input', t === 'number' ? { type: 'number' } : {});
      if (t !== 'textarea') input.type = t === 'number' ? 'number' : 'text';
      input.value = obj[f.k] ?? '';
      input.oninput = () => { obj[f.k] = t === 'number' ? Number(input.value) || 0 : input.value; markDirty(); };
      wrap.append(input);
    }

    else if (t === 'select') {
      const sel = el('select');
      (f.opts || []).forEach(o => sel.append(el('option', { value: o, ...(o === obj[f.k] ? { selected: '' } : {}) }, o)));
      sel.value = obj[f.k];
      sel.onchange = () => { obj[f.k] = sel.value; markDirty(); };
      wrap.append(sel);
    }

    else if (t === 'bool') {
      const cb = el('input', { type: 'checkbox' });
      cb.checked = !!obj[f.k];
      cb.onchange = () => { obj[f.k] = cb.checked; markDirty(); };
      wrap.append(el('label', { class: 'bool' }, [cb, f.label || f.k]));
    }

    else if (t === 'image') {
      const thumb = el('img', { class: 'thumb', alt: '' });
      const setThumb = v => { if (v && !/^https?:/.test(v)) { thumb.src = '../' + v; thumb.style.visibility = 'visible'; } else { thumb.removeAttribute('src'); thumb.style.visibility = 'hidden'; } };
      const input = el('input', { type: 'text', placeholder: 'caminho ou link da imagem' });
      input.value = obj[f.k] ?? '';
      setThumb(input.value);
      input.oninput = () => { obj[f.k] = input.value; setThumb(input.value); markDirty(); };

      const file = el('input', { type: 'file', accept: 'image/png,image/jpeg,image/webp,image/gif' });
      file.onchange = async () => {
        if (!file.files[0]) return;
        const fd = new FormData();
        fd.append('file', file.files[0]);
        toast('Enviando imagem…');
        try {
          const r = await fetch(API + 'upload.php', { method: 'POST', body: fd, credentials: 'same-origin' });
          const j = await r.json();
          if (!r.ok) throw new Error(j.error || 'Falha no envio');
          obj[f.k] = j.path; input.value = j.path; setThumb(j.path); markDirty();
          toast('Imagem enviada. Não esqueça de salvar.', 'good');
        } catch (e) { toast(e.message, 'bad'); }
        file.value = '';
      };

      wrap.append(el('div', { class: 'img-field' }, [thumb, el('div', { class: 'controls' }, [input, file])]));
    }

    else if (t === 'strings') {
      const arr = Array.isArray(obj[f.k]) ? obj[f.k] : (obj[f.k] = []);
      const box = el('div');
      const draw = () => {
        box.innerHTML = '';
        arr.forEach((v, i) => {
          const ta = el('textarea', { rows: 2 });
          ta.value = v;
          ta.oninput = () => { arr[i] = ta.value; markDirty(); };
          box.append(el('div', { class: 'row' }, [ta, el('button', { class: 'danger', type: 'button', onclick: () => { arr.splice(i, 1); markDirty(); draw(); } }, 'Remover')]));
        });
        box.append(el('button', { class: 'add', type: 'button', onclick: () => { arr.push(''); markDirty(); draw(); } }, '+ Adicionar linha'));
      };
      draw();
      wrap.append(box);
    }

    else if (t === 'list') {
      const arr = Array.isArray(obj[f.k]) ? obj[f.k] : (obj[f.k] = []);
      const box = el('div', { class: 'list' });
      const draw = () => {
        box.innerHTML = '';
        arr.forEach((item, i) => {
          const card = el('div', { class: 'item' });
          card.append(el('div', { class: 'item__head' }, [
            `#${i + 1} ${item.name || item.title || ''}`,
            el('button', { class: 'danger', type: 'button', onclick: () => { if (confirm('Remover este item?')) { arr.splice(i, 1); markDirty(); draw(); } } }, 'Remover'),
          ]));
          f.item.forEach(sub => card.append(fieldEl(sub, item)));
          box.append(card);
        });
        box.append(el('button', { class: 'add', type: 'button', onclick: () => { arr.push(blank(f.item)); markDirty(); draw(); } }, '+ Adicionar ' + (f.addLabel || 'item')));
      };
      draw();
      wrap.append(box);
    }

    else wrap.append(el('input', { type: 'text' }));
    return wrap;
  }

  function renderEditor() {
    const host = $('#editor');
    host.innerHTML = '';
    SECTIONS.forEach((sec, idx) => {
      const obj = sec.path ? cfg[sec.path] : cfg;
      const body = el('div', { class: 'secbody' });
      sec.fields.forEach(f => body.append(fieldEl(f, obj)));
      host.append(el('details', { class: 'sec', open: idx === 0 }, [el('summary', {}, sec.title), body]));
    });
  }

  async function save() {
    const btn = $('#saveBtn');
    btn.disabled = true;
    try {
      const r = await fetch(API + 'save.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
        credentials: 'same-origin',
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 401) return showLogin('Sua sessão expirou. Entre novamente.');
      if (!r.ok) throw new Error(j.error || 'Erro ao salvar');
      dirty = false;
      toast('Alterações salvas! Atualize o site para ver.', 'good');
    } catch (e) {
      toast(e.message, 'bad');
    } finally {
      btn.disabled = false;
    }
  }

  async function loadConfig() {
    const r = await fetch(DATA, { cache: 'no-store' });
    if (!r.ok) throw new Error('Não foi possível ler data/site.json');
    cfg = await r.json();
    renderEditor();
    $('#appView').classList.remove('hidden');
    $('#loginView').classList.add('hidden');
  }

  function showLogin(msg) {
    $('#appView').classList.add('hidden');
    $('#loginView').classList.remove('hidden');
    $('#loginErr').textContent = msg || '';
    $('#pass').focus();
  }

  async function start() {
    const s = await fetch(API + 'session.php', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json()).catch(() => ({ ok: false }));
    if (s.ok) await loadConfig(); else showLogin();
  }

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = $('#loginBtn');
    btn.disabled = true;
    $('#loginErr').textContent = '';
    try {
      const r = await fetch(API + 'login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: $('#pass').value }),
        credentials: 'same-origin',
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Falha no login');
      $('#pass').value = '';
      await loadConfig();
    } catch (err) {
      $('#loginErr').textContent = err.message;
    } finally {
      btn.disabled = false;
    }
  });

  $('#saveBtn').addEventListener('click', save);

  $('#logoutBtn').addEventListener('click', async () => {
    await fetch(API + 'logout.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', credentials: 'same-origin' });
    dirty = false;
    showLogin('Você saiu do painel.');
  });

  window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } });

  start();
})();
