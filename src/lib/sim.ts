/**
 * Infraestrutura comum das simulações: liga os controles de um <SimFrame>
 * (sliders, toggles, botões da barra) ao código da simulação, lê/grava
 * parâmetros na URL e cuida da tela cheia.
 */

export type Valor = number | boolean;

export interface Sim {
  root: HTMLElement;
  /** Elemento onde a simulação deve desenhar (canvas do p5 etc.). */
  palco: HTMLElement;
  params: Record<string, Valor>;
  readonly rodando: boolean;
  setRodando(rodando: boolean): void;
  /** Chamado sempre que um parâmetro muda (nome do parâmetro). */
  onParam(cb: (nome: string) => void): void;
  /** Chamado ao clicar num botão `data-acao` (play, reset ou extras). */
  onAcao(acao: string, cb: () => void): void;
  /** Atualiza um campo `data-leitura` com o texto dado. */
  leitura(nome: string, texto: string): void;
}

const numero = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

/** Formata um número no padrão brasileiro, com casas decimais fixas opcionais. */
export function fmt(valor: number, casas?: number): string {
  if (casas === undefined) return numero.format(valor);
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
}

function lerInput(input: HTMLInputElement): Valor {
  return input.type === 'checkbox' ? input.checked : Number(input.value);
}

function escreverInput(input: HTMLInputElement, bruto: string) {
  if (input.type === 'checkbox') input.checked = bruto === '1' || bruto === 'true';
  else input.value = bruto;
}

function atualizarSaida(input: HTMLInputElement) {
  const saida = input.closest('.controle')?.querySelector<HTMLOutputElement>('output');
  if (saida) saida.textContent = fmt(Number(input.value));
}

export function iniciarSim(root: HTMLElement): Sim {
  const palco = root.querySelector<HTMLElement>('[data-palco]')!;
  const inputs = [...root.querySelectorAll<HTMLInputElement>('input[data-param]')];
  const btnPlay = root.querySelector<HTMLButtonElement>('[data-acao="play"]');
  const params: Record<string, Valor> = {};
  const ouvintesParam: ((nome: string) => void)[] = [];
  const ouvintesAcao = new Map<string, (() => void)[]>();
  let rodando = false;

  // Parâmetros vindos da URL (?v0=20&angulo=30) têm prioridade sobre os padrões.
  const url = new URLSearchParams(location.search);
  for (const input of inputs) {
    const nome = input.dataset.param!;
    const daUrl = url.get(nome);
    if (daUrl !== null) escreverInput(input, daUrl);
    params[nome] = lerInput(input);
    atualizarSaida(input);

    input.addEventListener('input', () => {
      params[nome] = lerInput(input);
      atualizarSaida(input);
      ouvintesParam.forEach((cb) => cb(nome));
    });
  }

  // Botões de atalho que definem o valor de um slider (ex.: g da Terra, da Lua).
  root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = root.querySelector<HTMLInputElement>(`input[data-param="${btn.dataset.preset}"]`);
      if (!input) return;
      input.value = btn.dataset.valor!;
      input.dispatchEvent(new Event('input'));
    });
  });

  const disparar = (acao: string) => ouvintesAcao.get(acao)?.forEach((cb) => cb());

  const sim: Sim = {
    root,
    palco,
    params,
    get rodando() {
      return rodando;
    },
    setRodando(valor) {
      rodando = valor;
      if (btnPlay) {
        btnPlay.textContent = valor ? '❚❚ Pausar' : '▶ Iniciar';
        btnPlay.setAttribute('aria-pressed', String(valor));
      }
    },
    onParam: (cb) => ouvintesParam.push(cb),
    onAcao(acao, cb) {
      if (!ouvintesAcao.has(acao)) ouvintesAcao.set(acao, []);
      ouvintesAcao.get(acao)!.push(cb);
    },
    leitura(nome, texto) {
      const el = root.querySelector(`[data-leitura="${nome}"]`);
      if (el) el.textContent = texto;
    },
  };

  root.querySelectorAll<HTMLButtonElement>('[data-acao]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const acao = btn.dataset.acao!;
      if (acao === 'tela-cheia') return alternarTelaCheia(root);
      if (acao === 'compartilhar') return compartilhar(btn, inputs);
      disparar(acao);
    });
  });

  // Atalhos de teclado: espaço inicia/pausa, R reinicia, F tela cheia.
  document.addEventListener('keydown', (e) => {
    const alvo = e.target as HTMLElement;
    if (alvo.matches('input[type="text"], textarea, [contenteditable]') || e.metaKey || e.ctrlKey) return;
    if (e.key === ' ' && !alvo.matches('button')) {
      e.preventDefault();
      disparar('play');
    } else if (e.key === 'r' || e.key === 'R') disparar('reset');
    else if (e.key === 'f' || e.key === 'F') alternarTelaCheia(root);
  });

  return sim;
}

function alternarTelaCheia(root: HTMLElement) {
  if (document.fullscreenElement) document.exitFullscreen();
  else root.requestFullscreen?.();
}

async function compartilhar(btn: HTMLButtonElement, inputs: HTMLInputElement[]) {
  const url = new URL(location.href);
  url.search = '';
  for (const input of inputs) {
    const valor = input.type === 'checkbox' ? (input.checked ? '1' : '0') : input.value;
    url.searchParams.set(input.dataset.param!, valor);
  }
  history.replaceState(null, '', url);
  const original = btn.textContent;
  try {
    await navigator.clipboard.writeText(url.toString());
    btn.textContent = '✓ Link copiado';
  } catch {
    btn.textContent = '✓ Link na barra de endereço';
  }
  setTimeout(() => (btn.textContent = original), 2000);
}
