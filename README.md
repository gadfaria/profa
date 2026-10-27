# Profa. Larissa — Simulações

Site de simulações interativas de física e matemática para usar em aula.
Publicado em **https://profa.larissarslima.com**.

Stack: [Astro](https://astro.build) (site estático) + MDX (texto) + KaTeX (fórmulas) + [p5.js](https://p5js.org) (simulações). Hospedado na Vercel.

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # gera o site em dist/
npx astro check    # checagem de tipos
```

## Estrutura

```
src/
  content/simulacoes/*.mdx       ← uma página por simulação (texto, fórmulas, perguntas)
  components/sims/*.astro        ← o código de cada simulação (p5.js)
  components/SimFrame.astro      ← moldura padrão: palco, leituras, botões
  components/Slider.astro        ← controle deslizante (com atalhos opcionais)
  components/Toggle.astro        ← liga/desliga
  lib/sim.ts                     ← liga controles ↔ simulação, URL, tela cheia
```

## Adicionando uma simulação nova

1. Crie `src/components/sims/MinhaSim.astro`, usando `LancamentoObliquo.astro` como modelo:
   - `<SimFrame id="minha-sim">` com `<Slider>`/`<Toggle>` dentro (cada um com um `param`).
   - Leituras ao vivo no slot `leituras` com `data-leitura="nome"`.
   - No `<script>`: `iniciarSim(root)` devolve `sim.params`, `sim.onParam`, `sim.onAcao('play' | 'reset' | ...)`, `sim.leitura(nome, texto)` e `sim.palco` (onde o p5 desenha).
2. Crie `src/content/simulacoes/minha-sim.mdx`:

   ```mdx
   ---
   titulo: Minha simulação
   descricao: Uma frase sobre o que ela mostra.
   disciplina: fisica        # ou matematica
   serie: 1º ano EM          # opcional
   rascunho: true            # opcional: só aparece no `npm run dev`
   ---

   import MinhaSim from '../../components/sims/MinhaSim.astro';

   <MinhaSim />

   Texto com fórmulas: $F = m a$ ou em bloco $$E = mc^2$$
   ```

A página aparece sozinha na home, na seção da disciplina.

## Recursos de sala de aula (em toda simulação)

- **Espaço** inicia/pausa · **R** reinicia · **F** tela cheia.
- **Copiar link** gera uma URL com os valores atuais (ex.: `?v0=25&angulo=30`), boa para deixar cenários prontos para cada aula.

## Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório. A Vercel detecta o Astro sozinha (build `npm run build`, saída `dist`), então não precisa mudar nada.
3. Depois disso, cada `git push` na `main` publica automaticamente. Pull requests ganham um link de preview.

### Domínio `profa.larissarslima.com`

1. Na Vercel: **Project → Settings → Domains → Add** → `profa.larissarslima.com`.
2. No painel onde o domínio `larissarslima.com` foi comprado (DNS), crie o registro:

   | Tipo  | Nome    | Valor                  |
   |-------|---------|------------------------|
   | CNAME | `profa` | `cname.vercel-dns.com` |

   (Se a Vercel mostrar um valor de CNAME diferente na tela de Domains, use o que ela mostrar.)
3. Aguarde a propagação (minutos, às vezes algumas horas). A Vercel emite o HTTPS sozinha.
