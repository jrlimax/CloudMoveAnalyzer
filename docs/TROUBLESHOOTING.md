# Troubleshooting — Erros encontrados e correções aplicadas

> Registro de problemas diagnosticados na sessão de manutenção de **07/11/2026**, com causa-raiz,
> correção aplicada e referências. Serve como base de conhecimento para bugs recorrentes.

---

## 1. CSV do Portal em pt-BR: Grupo de Recursos e Região não apareciam

**Sintoma:** ao subir um CSV exportado do Portal Azure em português, as colunas
*Resource Group* e *Location* ficavam vazias ("—") no resultado.

**Causa-raiz (dupla):**
1. O cabeçalho `GRUPO DE RECURSOS` do export pt-BR contém um **espaço não separável
   (NBSP, U+00A0)** entre "GRUPO" e "DE" — visualmente idêntico a um espaço comum,
   mas diferente na comparação de strings. A detecção de coluna nunca casava.
2. O Portal pt-BR chama a região de **`LOCAL`**, e a lista de sinônimos só conhecia
   `location`, `localização`, `região` etc.

**Correção** (`js/app.js`, commit `7a6287a`):
- Nova função `normalizeHeader()` que normaliza **qualquer espaço Unicode**
  (`replace(/\s+/gu, ' ')`) antes de comparar cabeçalhos.
- `'local'` adicionado à lista de `findLocCol`.
- Testes de regressão em `tests/unit/column-detect.test.js` cobrindo o formato
  pt-BR com NBSP, EN, Resource Graph e Cost Management.

**Lição:** nunca comparar cabeçalhos de planilha sem normalizar espaços Unicode.
Exports da Microsoft usam NBSP com frequência em locales não-ingleses.

---

## 2. Tabela de resultados mostrando só "Resource Name"

**Sintoma:** em telas médias, a tabela parecia ter uma coluna só — RG, Location,
Status etc. existiam mas ficavam fora da viewport, **sem nenhuma pista visual**
de que havia rolagem horizontal.

**Causa-raiz:** 10 colunas com `white-space: nowrap` geram overflow horizontal;
não havia affordance (sombra, fade, barra visível) indicando conteúdo cortado.

**Correção** (`css/style.css` + `js/app.js`, commit `adc43b7`):
- Primeira coluna (nome) com `position: sticky; left: 0` — fica fixa durante a rolagem.
- **Fade na borda direita** (`.table-wrapper.more-cols::after`) enquanto houver
  colunas ocultas; sombra na coluna fixa após iniciar a rolagem (`.scrolled-x`).
- `.table-scroll` com `max-height: 70vh` — ativa o sticky do `thead` e mantém a
  barra de rolagem horizontal sempre visível.
- Nomes longos truncam com ellipsis + nome completo no `title` (hover).

---

## 3. Contraste reprovado (WCAG AA) no tema claro

**Sintoma:** badges de status, números dos stat cards e botões de export quase
ilegíveis no tema claro.

**Causa-raiz:** cores da paleta *dark* hardcoded (`#F59E0B`, `#EF4444`, rgba fixos)
reutilizadas no tema claro. Ratios medidos: badge "Partial" **1.91:1**, stat card
Partial **2.15:1**, botão CSV **2.28:1** (mínimo AA: 4.5:1).

**Correção** (`css/style.css`, commit `adc43b7`):
- Tokens semânticos por tema: `--success`, `--warning`, `--danger`, `--neutral`
  (+ variantes `-bg`), com tons escuros no claro e vivos no escuro.
- `--primary-text` para texto roxo pequeno (th, type-tag): `#A78BFA` no dark
  (o `#8B5CF6` dava 3.94:1 sobre o fundo do thead).
- Gradientes dos botões de export escurecidos.

**Lição:** cor de status nunca pode ser literal no CSS — sempre token por tema.

---

## 4. PDF: faixa roxa em gradiente no cabeçalho

**Sintoma:** banda roxa preenchida no topo do relatório — pesada, ruim em
impressão P&B e reprovada pelo usuário ("ficou feio").

**Correção** (`js/app.js`, bloco do PDF): cabeçalho limpo — fundo branco, título
escuro, logo, e um **filete de 3px** como único elemento de marca. Regra adotada:
**roxo é acento pontual, nunca preenchimento dominante.**

---

## 5. PDF: cabeçalho da tabela com "RECUR-SOS" quebrado em 4 linhas (pt-BR)

**Sintoma:** em português, o thead roxo sólido + `text-transform: uppercase` +
`hyphens: auto` transformava "Mover Grupo de Recursos" em "MOVER GRUPO DE
RECUR-SOS" em 4 linhas hifenizadas.

**Causa-raiz:** estilo desenhado com cabeçalhos EN (curtos); pt-BR/FR são ~30%
mais longos. Uppercase alarga o texto e `hyphens: auto` (herdado da regra geral
de células) quebrava no meio da palavra.

**Correção** (`js/app.js`):
- Thead claro (lavanda suave + texto roxo-escuro + borda inferior roxa de 2px).
- **Sem** `text-transform: uppercase`; **`hyphens: none`** no `th` (quebra por
  palavra, nunca no meio).
- Pesos de largura das colunas "Mover *" aumentados (5-6 → 7).

**Lição:** o layout deve ser validado no idioma mais longo, não no inglês.

---

## 6. PDF: rodapé de 2 linhas grande demais

**Sintoma:** rodapé com fonte dos dados em linha separada ocupava altura demais
em todas as páginas.

**Correção** (`js/app.js`): rodapé em **1 linha de 8px** com separadores `·`
(ferramenta · data ISO · fonte), `white-space: nowrap` + ellipsis; espaço
reservado reduzido (`@page` margem inferior 20mm → 12mm; padding do body
28mm → 14mm). Mais área útil por página.

---

## 7. PDF: recursos cortados ao meio na quebra de página ⚠️ RECORRENTE

**Sintoma:** linha da tabela aparece "cortada" na transição de página — já tinha
acontecido antes e foi mitigado reduzindo itens por página (10/página).

**Causa-raiz — são DOIS mecanismos diferentes que produzem o mesmo sintoma:**

1. **Quebra de página do navegador no meio da linha** — por padrão o Chromium
   pode fracionar um `<tr>` entre páginas.
2. **Rodapé fixo sobrepondo o conteúdo** — `position: fixed` repete o rodapé em
   cada página impressa, mas o conteúdo só "desvia" dele se o `padding-bottom`
   do `body` reservar espaço ≥ altura real do rodapé. Quando o rodapé cresceu
   para 2 linhas (item 6), o espaço reservado ficou insuficiente e a última
   linha de cada página era **encoberta** (não cortada pela quebra!).

**Correção final (após iteração):**
- **Paginação natural**: uma tabela contínua por seção; o navegador enche cada
  página e o **`break-inside: avoid` em todo `<tr>`** empurra a linha que não
  coube inteira para a próxima página. `thead { display: table-header-group }`
  repete o cabeçalho em cada página automaticamente.
- **`<tfoot>` espaçador em cada tabela** — a descoberta decisiva: o
  `padding-bottom` do `body` só protege a **última** página do documento; nas
  páginas intermediárias o rodapé `position: fixed` sobrepõe a última linha.
  Um `tfoot` vazio com `height: 9mm` repete no rodapé de **cada** página
  impressa (`display: table-footer-group`) e reserva exatamente o espaço do
  rodapé fixo.
- **Rodapé encolhido para 1 linha** (menos área a reservar).
- Seções separadas por `page-break` explícito (resumo / grupos / atenção /
  inventário).

**Por que NÃO usar chunking fixo (N linhas por página):** foi testado (10 e 12
linhas/página) e rejeitado — com linhas baixas sobra **meia página em branco** e
linhas órfãs sozinhas na página seguinte ("contou 12 e pulou"). A paginação
natural produziu páginas cheias: 15 páginas contra 22 do chunking no mesmo
dataset, **validado com PDF real gerado pelo motor do Chromium/Edge headless**
e inspeção visual das fronteiras de página.

### Existe outra solução? (análise de alternativas)

| Alternativa | Como funciona | Prós | Contras |
|---|---|---|---|
| **`break-inside: avoid` + fluxo natural (ATUAL)** | Uma tabela só; o browser empurra a linha inteira que não coube | Páginas sempre cheias, zero corte no Chromium moderno; validado com PDF real | Exige rodapé fixo com espaço reservado correto; retestar após mudanças de layout |
| **Chunking fixo (testado e rejeitado)** | N linhas por `<table>` + quebra forçada | Previsível, imune a bugs de quebra do engine | **Desperdiça meia página** com linhas baixas; linhas órfãs; N precisa caber no pior caso |
| **Altura de linha limitada** | `line-clamp` nas observações (ex.: máx. 3 linhas) + célula de altura previsível | Torna o chunking matemático perfeito; relatório mais uniforme | Trunca conteúdo (precisa de "ver documentação" como escape) |
| **Rodapé no fluxo via `@page` margin boxes** | `@page { @bottom-center { content: ... } }` | Rodapé "de verdade" por página, sem sobreposição possível | **Chromium não suporta** margin boxes (só Firefox parcial/paged.js) |
| **Paged.js (polyfill Paged Media)** | Biblioteca que fragmenta o HTML em páginas reais no DOM | Controle total: rodapé, numeração de página, viúvas/órfãs | +100KB de dependência; conflita com a filosofia zero-dependência do projeto |
| **Geração programática (jsPDF/pdfmake)** | Monta o PDF via API JS, sem print do navegador | Paginação determinística, numeração, TOC | ~300KB+; perde print CSS/i18n fácil; dobra a manutenção |

**Recomendação:** paginação natural (`break-inside: avoid`) + rodapé de 1 linha
com reserva correta — é a solução em produção, validada com PDF real. Se o corte
reaparecer em algum engine, o próximo passo com melhor custo-benefício é
**limitar a altura das observações com `line-clamp`** e só depois considerar
Paged.js.

---

## 8. PDF: logo carregado do site de produção

**Sintoma:** o relatório buscava `https://cloudmoveanalyzer.com/assets/logo.png` —
quebrava em ambiente local/offline e criava dependência da produção.

**Correção** (`js/app.js`): URL resolvida localmente via
`new URL('assets/logo.png', document.baseURI)`.

---

## 9. PDF: emojis como veículo de informação

**Sintoma:** ✅/❌/🟢/📋/⚠️ renderizam de forma inconsistente entre viewers de
PDF e impressoras (alguns imprimem em P&B, outros caixas vazias).

**Correção** (`js/app.js`): símbolos tipográficos com cor + texto
(✓ `&#10003;` / ✗ `&#10007;` / ▲ `&#9650;` / ● `&#9679;`) — degradam bem em P&B.

---

## 10. Parse trava se o usuário trocar de aba durante o "Processing..." (conhecido, NÃO corrigido)

**Sintoma:** o parse da planilha é adiado com `requestAnimationFrame` (para o
spinner pintar antes). Se a aba ficar **oculta/ocluída** nesse instante, o rAF
não dispara e o processamento fica pendurado até a aba voltar a ficar visível.

**Impacto real:** baixo (upload + troca de aba imediata). Detectado durante
testes automatizados com navegador em segundo plano.

**Correção sugerida (futura):** fallback com corrida entre rAF e `setTimeout`:

```js
const defer = cb => {
  let done = false;
  const run = () => { if (!done) { done = true; cb(); } };
  requestAnimationFrame(run);
  setTimeout(run, 120); // garante execução mesmo com aba oculta
};
```

---

## Melhorias de conteúdo do relatório (não eram bugs)

Aplicadas pelo agente "Especialista em Relatórios Executivos" na mesma sessão:

- **KPIs com %** e hint explicativo (RG + Assinatura / Apenas RG...).
- **Barra de distribuição** com legenda — leitura de relance da prontidão.
- **Tabela por Grupo de Recursos** (ondas de migração, pior RG primeiro).
- **"Atenção Especial" com contagem por tipo** e inclusão dos bloqueados sem nota.
- **Apêndice ordenado para decisão**: bloqueados → parciais → não encontrados →
  movíveis (ordenação manual do usuário tem precedência).
- **Estrutura de páginas**: 1ª = resumo executivo; 2ª = grupos + atenção;
  3ª+ = inventário (12/página).
- Nome de arquivo sugerido com data ISO: `Cloud-Move-Analyzer-Report-AAAA-MM-DD`.
