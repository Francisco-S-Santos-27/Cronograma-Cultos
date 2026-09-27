document.addEventListener('DOMContentLoaded', () => {
  const AUTH_EMAIL = 'ministerioyeshua@gmail.com';
  const AUTH_PASS = 'admin';
  const DRAFT_STORAGE_KEY = 'cronogramaCultoDraft';
  const PEOPLE_STORAGE_KEY = 'cronogramaCultoPeople';

  const loginSection = document.getElementById('loginSection');
  const appSection = document.getElementById('appSection');
  const authForm = document.getElementById('authForm');
  const userEmail = document.getElementById('userEmail');
  const userPassword = document.getElementById('userPassword');
  const togglePassword = document.getElementById('togglePassword');
  const errorMsg = document.getElementById('errorMsg');
  const btnLogout = document.getElementById('btnLogout');

  togglePassword.addEventListener('click', () => {
    const isPassword = userPassword.getAttribute('type') === 'password';
    userPassword.setAttribute('type', isPassword ? 'text' : 'password');
    togglePassword.classList.toggle('fa-eye', !isPassword);
    togglePassword.classList.toggle('fa-eye-slash', isPassword);
  });

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const inputEmail = userEmail.value.trim().toLowerCase();
    const inputPass = userPassword.value.trim();

    if (inputEmail === AUTH_EMAIL && inputPass === AUTH_PASS) {
      errorMsg.style.display = 'none';
      loginSection.style.display = 'none';
      appSection.style.display = 'block';
      return;
    }

    errorMsg.textContent = 'Credenciais incorretas! E-mail ou senha inválidos.';
    errorMsg.style.display = 'block';
  });

  btnLogout.addEventListener('click', () => {
    appSection.style.display = 'none';
    loginSection.style.display = 'flex';
  });

  const form = document.getElementById('cronogramaForm');
  const oportunidadesContainer = document.getElementById('oportunidadesContainer');
  const btnAddOportunidade = document.getElementById('btnAddOportunidade');
  const preview = document.getElementById('preview');
  const palettePreset = document.getElementById('palettePreset');
  const previewColorInputs = [
    document.getElementById('previewColorOne'),
    document.getElementById('previewColorTwo'),
    document.getElementById('previewColorThree'),
    document.getElementById('previewTextColor')
  ];
  const btnCopiar = document.getElementById('btnCopiar');
  const btnBaixarImagem = document.getElementById('btnBaixarImagem');
  const btnLimpar = document.getElementById('btnLimpar');
  const dataCulto = document.getElementById('dataCulto');
  const diaSemana = document.getElementById('diaSemana');
  const modeloCulto = document.getElementById('modeloCulto');
  const btnAplicarModelo = document.getElementById('btnAplicarModelo');
  const saveStatus = document.getElementById('saveStatus');
  const personName = document.getElementById('personName');
  const personTeam = document.getElementById('personTeam');
  const btnAddPerson = document.getElementById('btnAddPerson');
  const peopleList = document.getElementById('peopleList');
  const peopleCount = document.getElementById('peopleCount');
  const peopleOptions = document.getElementById('peopleOptions');
  const teamOptions = document.getElementById('teamOptions');
  const btnCompartilhar = document.getElementById('btnCompartilhar');
  const toast = document.getElementById('toast');
  const installButtons = document.querySelectorAll('.btn-install');
  const PALETTE_STORAGE_KEY = 'cronogramaCultoPalette';

  const paletas = {
    celebracao: ['#173f38', '#d7654a', '#278779', '#ffffff'],
    oceano: ['#064e68', '#00a6a6', '#f2b84b', '#ffffff'],
    alegria: ['#6a1b4d', '#ed6a5a', '#f2c14e', '#ffffff'],
    amanhecer: ['#702c55', '#d95763', '#f1a34a', '#ffffff']
  };

  const modelos = {
    celebracao: {
      tipo: 'Culto de Celebração',
      oportunidades: ['Louvor congregacional', 'Testemunho']
    },
    familia: {
      tipo: 'Culto da Família',
      oportunidades: ['Oração pelas famílias', 'Participação das famílias']
    },
    jovens: {
      tipo: 'Culto de Jovens',
      oportunidades: ['Louvor dos jovens', 'Testemunho', 'Avisos dos jovens']
    },
    ensino: {
      tipo: 'Culto de Ensino',
      oportunidades: ['Leitura bíblica', 'Ministração de ensino']
    },
    oracao: {
      tipo: 'Culto de Oração',
      oportunidades: ['Pedidos de oração', 'Oração em grupo']
    },
    ceia: {
      tipo: 'Culto de Santa Ceia',
      oportunidades: ['Preparação da mesa da Ceia', 'Ministração da Ceia']
    }
  };

  let pessoas = carregarPessoas();
  let pessoaSelecionada = '';
  let temporizadorToast;

  function mostrarAviso(mensagem, tom = 'success') {
    toast.textContent = mensagem;
    toast.dataset.tone = tom;
    toast.classList.add('is-visible');
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => toast.classList.remove('is-visible'), 2800);
  }

  function aplicarCoresPreview(cores) {
    const variaveis = ['--preview-color-one', '--preview-color-two', '--preview-color-three', '--preview-text-color'];
    cores.forEach((cor, indice) => {
      preview.style.setProperty(variaveis[indice], cor);
      previewColorInputs[indice].value = cor;
    });
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify(cores));
    } catch {
      mostrarAviso('As cores foram aplicadas, mas não salvas neste navegador.', 'error');
    }
  }

  function restaurarCoresPreview() {
    try {
      const salvas = JSON.parse(localStorage.getItem(PALETTE_STORAGE_KEY) || 'null');
      if (Array.isArray(salvas) && salvas.length === previewColorInputs.length && salvas.every((cor) => /^#[0-9a-f]{6}$/i.test(cor))) {
        aplicarCoresPreview(salvas);
        palettePreset.value = 'personalizada';
        return;
      }
    } catch {
      // Usa a paleta padrão se o armazenamento estiver indisponível.
    }
    aplicarCoresPreview(paletas.celebracao);
  }

  palettePreset.addEventListener('change', () => {
    const cores = paletas[palettePreset.value];
    if (cores) aplicarCoresPreview(cores);
  });

  previewColorInputs.forEach((input) => {
    input.addEventListener('input', () => {
      palettePreset.value = 'personalizada';
      aplicarCoresPreview(previewColorInputs.map((colorInput) => colorInput.value));
    });
  });

  let deferredInstallPrompt = null;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
  });

  async function instalarAplicativo() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const escolha = await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      if (escolha.outcome === 'accepted') mostrarAviso('Aplicativo instalado.');
      return;
    }

    if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) {
      mostrarAviso('O aplicativo já está instalado.');
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
      mostrarAviso('No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início.');
    } else if (!window.isSecureContext) {
      mostrarAviso('A instalação exige que o site seja aberto por HTTPS ou localhost.', 'error');
    } else {
      mostrarAviso('Abra o menu do navegador e escolha Instalar aplicativo ou Adicionar à tela inicial.');
    }
  }

  installButtons.forEach((button) => button.addEventListener('click', instalarAplicativo));

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }

  function carregarPessoas() {
    try {
      const salvas = JSON.parse(localStorage.getItem(PEOPLE_STORAGE_KEY) || '[]');
      return Array.isArray(salvas)
        ? salvas.filter((pessoa) => pessoa && pessoa.id && typeof pessoa.nome === 'string' && typeof pessoa.equipe === 'string')
        : [];
    } catch {
      return [];
    }
  }

  function salvarPessoas() {
    try {
      localStorage.setItem(PEOPLE_STORAGE_KEY, JSON.stringify(pessoas));
      return true;
    } catch {
      return false;
    }
  }

  function renderizarPessoas() {
    peopleList.replaceChildren();
    peopleOptions.replaceChildren();
    peopleCount.textContent = String(pessoas.length);

    const equipesPadrao = ['Louvor', 'Recepção', 'Oração', 'Ensino', 'Jovens', 'Mídia', 'Outro'];
    const equipesExtras = pessoas.map((pessoa) => pessoa.equipe).filter(Boolean);
    const equipes = [...new Set([...equipesPadrao, ...equipesExtras])]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    teamOptions.replaceChildren();
    equipes.forEach((equipe) => {
      const option = document.createElement('option');
      option.value = equipe;
      teamOptions.appendChild(option);
    });

    [...pessoas]
      .sort((a, b) => a.equipe.localeCompare(b.equipe, 'pt-BR') || a.nome.localeCompare(b.nome, 'pt-BR'))
      .forEach((pessoa) => {
        const sugestao = document.createElement('option');
        sugestao.value = pessoa.nome;
        sugestao.label = pessoa.equipe;
        peopleOptions.appendChild(sugestao);

        const item = document.createElement('li');
        item.className = 'person-row';
        item.draggable = true;
        item.tabIndex = 0;
        item.dataset.personName = pessoa.nome;
        item.setAttribute('aria-label', `${pessoa.nome}, equipe ${pessoa.equipe}. Arraste até um campo da escala ou selecione.`);

        const nome = document.createElement('span');
        nome.className = 'person-name';
        nome.textContent = pessoa.nome;

        const equipe = document.createElement('span');
        equipe.className = 'person-team';
        equipe.textContent = pessoa.equipe;

        const remover = document.createElement('button');
        remover.type = 'button';
        remover.className = 'person-remove';
        remover.setAttribute('aria-label', `Remover ${pessoa.nome} da lista`);
        remover.title = `Remover ${pessoa.nome}`;
        remover.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
        remover.addEventListener('click', () => {
          pessoas = pessoas.filter((cadastrada) => cadastrada.id !== pessoa.id);
          if (pessoaSelecionada === pessoa.nome) pessoaSelecionada = '';
          const salvo = salvarPessoas();
          renderizarPessoas();
          mostrarAviso(salvo ? 'Pessoa removida da lista.' : 'Alteração não salva neste navegador.', salvo ? 'success' : 'error');
        });

        item.addEventListener('dragstart', (event) => {
          event.dataTransfer.setData('text/plain', pessoa.nome);
          event.dataTransfer.effectAllowed = 'copy';
          item.classList.add('is-dragging');
        });
        item.addEventListener('dragend', () => item.classList.remove('is-dragging'));

        item.append(nome, equipe, remover);
        peopleList.appendChild(item);
      });
  }

  function selecionarPessoa(nome) {
    pessoaSelecionada = nome;
    peopleList.querySelectorAll('.person-row').forEach((item) => {
      item.classList.toggle('is-selected', item.dataset.personName === nome);
    });
    mostrarAviso(`${nome} selecionado. Escolha um campo da escala.`);
  }

  function atribuirPessoa(campo, nome) {
    if (!campo || !nome) return;
    campo.value = nome;
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    campo.classList.add('drop-assigned');
    setTimeout(() => campo.classList.remove('drop-assigned'), 650);
    pessoaSelecionada = '';
    peopleList.querySelectorAll('.person-row').forEach((item) => item.classList.remove('is-selected'));
    mostrarAviso(`${nome} foi colocado na escala.`);
  }

  function adicionarPessoa() {
    const nome = personName.value.trim();
    const equipe = personTeam.value.trim();
    if (!nome || !equipe) {
      mostrarAviso('Informe o nome e a equipe.', 'error');
      (!nome ? personName : personTeam).focus();
      return;
    }

    const duplicada = pessoas.some((pessoa) => {
      return pessoa.nome.toLocaleLowerCase() === nome.toLocaleLowerCase()
        && pessoa.equipe.toLocaleLowerCase() === equipe.toLocaleLowerCase();
    });
    if (duplicada) {
      mostrarAviso('Essa pessoa já está cadastrada nessa equipe.', 'error');
      return;
    }

    pessoas.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, nome, equipe });
    const salvo = salvarPessoas();
    renderizarPessoas();
    personName.value = '';
    personTeam.value = '';
    personName.focus();
    mostrarAviso(salvo ? 'Pessoa adicionada à equipe.' : 'Pessoa adicionada, mas não salva neste navegador.', salvo ? 'success' : 'error');
  }

  function formatarDataLocal(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  if (!dataCulto.value) {
    dataCulto.value = formatarDataLocal(new Date());
  }

  function obterDiaSemana(valorData) {
    if (!valorData) return '';
    const [ano, mes, dia] = valorData.split('-').map(Number);
    return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR', { weekday: 'long' });
  }

  function atualizarDiaSemana() {
    const nomeDia = obterDiaSemana(dataCulto.value);
    diaSemana.textContent = nomeDia ? `Dia da semana: ${nomeDia}` : '';
  }

  function coletarRascunho() {
    const campos = {};
    form.querySelectorAll('input[id], select[id]').forEach((campo) => {
      campos[campo.id] = campo.value;
    });
    const oportunidades = Array.from(
      oportunidadesContainer.querySelectorAll('.oportunidade-input'),
      (input) => input.value
    );
    return { campos, oportunidades };
  }

  function salvarRascunho() {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(coletarRascunho()));
      const horario = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      saveStatus.textContent = `Salvo automaticamente às ${horario}`;
    } catch {
      saveStatus.textContent = 'Não foi possível salvar neste navegador.';
    }
  }

  function restaurarRascunho() {
    try {
      const rascunho = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || 'null');
      if (!rascunho) return;

      Object.entries(rascunho.campos || {}).forEach(([id, valor]) => {
        const campo = document.getElementById(id);
        if (campo) campo.value = valor;
      });

      oportunidadesContainer.innerHTML = '';
      (rascunho.oportunidades || []).forEach((valor) => adicionarCampoOportunidade(valor));
      saveStatus.textContent = 'Rascunho restaurado deste navegador.';
    } catch {
      saveStatus.textContent = 'Não foi possível restaurar o rascunho salvo.';
    }
  }

  function aplicarModelo() {
    const modelo = modelos[modeloCulto.value];
    if (!modelo) return;

    const temDados = Array.from(form.querySelectorAll('input, select')).some((campo) => {
      return !['dataCulto', 'modeloCulto'].includes(campo.id) && campo.value.trim() !== '';
    });

    if (temDados && !confirm('Aplicar este modelo vai substituir os dados atuais. Deseja continuar?')) {
      modeloCulto.value = '';
      return;
    }

    const dataSelecionada = dataCulto.value;
    form.reset();
    dataCulto.value = dataSelecionada;
    document.getElementById('tipoCulto').value = modelo.tipo;
    oportunidadesContainer.innerHTML = '';
    modelo.oportunidades.forEach((oportunidade) => adicionarCampoOportunidade(oportunidade));
    modeloCulto.value = '';
    atualizarPreview();
    salvarRascunho();
  }

  function atualizarPreview() {
    const tipoCulto = document.getElementById('tipoCulto').value;
    const portaria = document.getElementById('portaria').value;
    const oracaoInicial = document.getElementById('oracaoInicial').value;
    const louvor = document.getElementById('louvor').value;
    const palavraIntroducao = document.getElementById('palavraIntroducao').value;
    const palavraGenerosidade = document.getElementById('palavraGenerosidade').value;
    const oracaoPreletor = document.getElementById('oracaoPreletor').value;
    const palavraOficial = document.getElementById('palavraOficial').value;
    const encerramento = document.getElementById('encerramento').value;

    const oportunidadesInputs = document.querySelectorAll('.oportunidade-input');
    let oportunidadesTexto = '';
    oportunidadesInputs.forEach((input, index) => {
      if (input.value.trim() !== '') {
        oportunidadesTexto += `   ${index + 1}. ${input.value.trim()}\n`;
      }
    });

    const diaNome = obterDiaSemana(dataCulto.value);
    const dataFormatada = dataCulto.value
      ? new Date(`${dataCulto.value}T00:00:00`).toLocaleDateString('pt-BR')
      : 'Data não informada';

    let texto = `📅 *PROGRAMAÇÃO DO CULTO*\n`;
    texto += `📌 *Data:* ${dataFormatada}${diaNome ? ` (${diaNome})` : ''}${tipoCulto ? ` - ${tipoCulto}` : ''}\n`;
    if (portaria) texto += `🚪 *Portaria/Recepção:* ${portaria}\n`;
    texto += `-----------------------------------\n`;
    texto += `📋 *CRONOGRAMA DO CULTO*\n\n`;
    if (oracaoInicial) texto += `🙏 *Oração Inicial:* ${oracaoInicial}\n`;
    if (louvor) texto += `🎵 *Louvor:* ${louvor}\n`;
    if (palavraIntroducao) texto += `📖 *Palavra de Introdução:* ${palavraIntroducao}\n\n`;

    texto += `🤝 *OPORTUNIDADES:*\n${oportunidadesTexto || '   (Sem oportunidades cadastradas)\n'}\n`;

    if (palavraGenerosidade) texto += `💰 *Palavra da Generosidade:* ${palavraGenerosidade}\n`;
    if (oracaoPreletor) texto += `🙌 *Oração para o Preletor(a):* ${oracaoPreletor}\n`;
    if (palavraOficial) texto += `🔥 *Palavra Oficial:* ${palavraOficial}\n`;
    if (encerramento) texto += `✨ *Encerramento:* ${encerramento}`;

    preview.textContent = texto;
  }

  function adicionarCampoOportunidade(valor = '') {
    const div = document.createElement('div');
    div.className = 'oportunidade-item';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'oportunidade-input';
    input.placeholder = 'Nome / Grupo / Louvor';
    input.setAttribute('list', 'peopleOptions');
    input.value = valor;

    const btnRemover = document.createElement('button');
    btnRemover.type = 'button';
    btnRemover.className = 'btn btn-danger';
    btnRemover.setAttribute('aria-label', 'Remover oportunidade');
    btnRemover.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    btnRemover.addEventListener('click', () => {
      div.remove();
      agendarSalvamento();
    });

    div.append(input, btnRemover);
    oportunidadesContainer.appendChild(div);
    atualizarPreview();
  }

  btnBaixarImagem.addEventListener('click', () => {
    const nomeArquivo = dataCulto.value || 'culto';
    if (typeof html2canvas !== 'function') {
      mostrarAviso('Biblioteca de imagem indisponível. Verifique sua conexão.', 'error');
      return;
    }

    html2canvas(preview, { scale: 2, useCORS: true })
      .then((canvas) => {
        const link = document.createElement('a');
        link.download = `cronograma_${nomeArquivo}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        mostrarAviso('Imagem do cronograma baixada.');
      })
      .catch(() => {
        mostrarAviso('Não foi possível gerar a imagem. Verifique sua conexão.', 'error');
      });
  });

  let temporizadorSalvamento;
  function agendarSalvamento() {
    atualizarPreview();
    atualizarDiaSemana();
    saveStatus.textContent = 'Salvando...';
    clearTimeout(temporizadorSalvamento);
    temporizadorSalvamento = setTimeout(salvarRascunho, 300);
  }

  form.addEventListener('input', agendarSalvamento);
  form.addEventListener('change', agendarSalvamento);
  form.addEventListener('dragover', (event) => {
    const campo = event.target.closest('input[list="peopleOptions"]');
    if (!campo) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    campo.classList.add('drop-ready');
  });
  form.addEventListener('dragleave', (event) => {
    const campo = event.target.closest('input[list="peopleOptions"]');
    if (campo) campo.classList.remove('drop-ready');
  });
  form.addEventListener('drop', (event) => {
    const campo = event.target.closest('input[list="peopleOptions"]');
    if (!campo) return;
    event.preventDefault();
    campo.classList.remove('drop-ready');
    const nome = event.dataTransfer.getData('text/plain') || pessoaSelecionada;
    atribuirPessoa(campo, nome);
  });
  form.addEventListener('click', (event) => {
    const campo = event.target.closest('input[list="peopleOptions"]');
    if (campo && pessoaSelecionada) atribuirPessoa(campo, pessoaSelecionada);
  });
  peopleList.addEventListener('click', (event) => {
    if (event.target.closest('.person-remove')) return;
    const item = event.target.closest('.person-row');
    if (item) selecionarPessoa(item.dataset.personName);
  });
  peopleList.addEventListener('keydown', (event) => {
    if (event.target.closest('button')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const item = event.target.closest('.person-row');
    if (!item) return;
    event.preventDefault();
    selecionarPessoa(item.dataset.personName);
  });
  btnAplicarModelo.addEventListener('click', aplicarModelo);
  btnAddOportunidade.addEventListener('click', () => {
    adicionarCampoOportunidade();
    agendarSalvamento();
  });

  btnCopiar.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(preview.textContent);
      } else {
        const campoTemporario = document.createElement('textarea');
        campoTemporario.value = preview.textContent;
        campoTemporario.setAttribute('readonly', '');
        campoTemporario.style.position = 'fixed';
        campoTemporario.style.opacity = '0';
        document.body.appendChild(campoTemporario);
        campoTemporario.select();
        const copiado = document.execCommand('copy');
        campoTemporario.remove();
        if (!copiado) throw new Error('Cópia não autorizada');
      }
      mostrarAviso('Cronograma copiado.');
    } catch {
      mostrarAviso('Não foi possível copiar o cronograma.', 'error');
    }
  });

  btnCompartilhar.addEventListener('click', async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cronograma do culto', text: preview.textContent });
        mostrarAviso('Cronograma compartilhado.');
        return;
      } catch (erro) {
        if (erro.name === 'AbortError') return;
      }
    }

    const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(preview.textContent)}`;
    window.open(urlWhatsApp, '_blank', 'noopener,noreferrer');
    mostrarAviso('Abrindo o compartilhamento pelo WhatsApp.');
  });

  btnAddPerson.addEventListener('click', adicionarPessoa);
  personName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      personTeam.focus();
    }
  });
  personTeam.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      adicionarPessoa();
    }
  });

  btnLimpar.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todos os campos?')) {
      form.reset();
      dataCulto.value = formatarDataLocal(new Date());
      oportunidadesContainer.innerHTML = '';
      adicionarCampoOportunidade();
      atualizarDiaSemana();
      atualizarPreview();
      salvarRascunho();
    }
  });

  restaurarRascunho();
  restaurarCoresPreview();
  renderizarPessoas();
  atualizarDiaSemana();
  atualizarPreview();
  adicionarCampoOportunidade();
});