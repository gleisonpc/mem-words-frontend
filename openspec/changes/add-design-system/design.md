## Context

Ver `proposal.md` — Why para a motivação.

Restrições que moldam a abordagem:

- CSS puro com custom properties; sem Tailwind, CSS-in-JS ou biblioteca de
  componentes (convenção já estabelecida no projeto).
- React 19 com JavaScript, sem TypeScript — o contrato de props não é
  verificável pelo compilador.
- Sem sistema de rotas instalado. A galeria precisa ser alcançável sem
  introduzir uma dependência de roteamento.
- O estado atual é um punhado de variáveis ad-hoc em `src/index.css`
  (`--ok`, `--error`, `--pending`) e estilos de componente misturados em
  `src/App.css`.

## Goals / Non-Goals

**Goals:**

- Um único ponto de edição para a identidade visual.
- Componentes que não sabem em qual tema estão.
- Acessibilidade verificada por medição, não por intenção.

**Non-Goals:**

- Publicar o design system como pacote separado. Ele vive dentro do app até
  existir um segundo consumidor.
- Suporte a temas além de claro e escuro, ou troca manual de tema. A
  preferência do sistema operacional basta por ora; a estrutura de tokens não
  impede acrescentar um alternador depois.
- Documentação escrita dos componentes além da galeria.

## Decisions

### Tokens em duas camadas: primitivos e semânticos

Os valores brutos de cor ficam em tokens primitivos (`--indigo-600`,
`--gray-50`). Os tokens semânticos (`--color-surface`, `--color-primary`)
apontam para eles. Componentes referenciam **apenas** os semânticos.

O tema escuro reaponta os semânticos para outros primitivos; nenhum primitivo
é redefinido. Isso evita a armadilha comum de um token chamado "cinza claro"
que, no tema escuro, carrega um valor escuro.

*Alternativa considerada:* uma única camada semântica com valores literais.
Menos arquivos, mas duplica cada cor entre os dois temas e torna difícil
enxergar que dois tokens compartilham o mesmo valor de origem.

### Paleta: índigo como cor primária

Valores propostos, com contraste já medido (ver "Verificação de contraste"):

| Papel | Claro | Escuro |
| :--- | :--- | :--- |
| `bg` (fundo da página) | `#f7f8fa` | `#101316` |
| `surface` | `#ffffff` | `#1a1e22` |
| `surface-muted` | `#f1f3f6` | `#23282d` |
| `border` (divisória sutil) | `#dfe3e8` | `#2f353b` |
| `border-strong` (campo, foco) | `#767e89` | `#7b8590` |
| `text` | `#16191d` | `#eceef1` |
| `text-muted` | `#5b6672` | `#a0aab5` |
| `primary` | `#4f46e5` | `#a5b4fc` |
| `primary-hover` | `#4338ca` | `#c7d2fe` |
| `on-primary` | `#ffffff` | `#10131c` |
| `success` / `success-bg` | `#0f7a3d` / `#e6f6ec` | `#5fd08a` / `#10301e` |
| `warning` / `warning-bg` | `#8a6100` / `#fdf3d7` | `#e3c169` / `#2e2611` |
| `danger` / `danger-bg` | `#b3241c` / `#fdecea` | `#ff9d95` / `#3a1a18` |
| `info` / `info-bg` | `#0b5fa5` / `#e6f1fb` | `#8fc4f5` / `#11263a` |

Índigo é distinto do azul genérico de interface, o que dá identidade ao
produto sem recorrer a uma cor de alta saturação que cansa em uso prolongado —
e memorização de vocabulário é, por definição, uso prolongado. No tema escuro
o primário clareia (`#a5b4fc`) porque um índigo saturado sobre fundo escuro
não alcança contraste suficiente para texto.

*Esta é a decisão mais subjetiva da mudança.* Trocar a direção é editar os
primitivos de cor: nenhum componente referencia cor literal.

### Verificação de contraste

Os pares de cor foram medidos pela fórmula de contraste da WCAG 2.1, não
estimados. A medição reprovou a primeira escolha de `border-strong`
(`#b9c2cc` no claro, `1.80:1` contra a superfície, bem abaixo do mínimo de
3:1); os valores da tabela acima são os corrigidos.

Pares verificados: texto sobre fundo e sobre superfície em cada tema, texto
suave, texto sobre botão primário, cada cor de estado sobre seu fundo de
estado, borda de campo e anel de foco.

*Trade-off aceito:* essa verificação é um roteiro executado durante a
implementação, não um teste automatizado no CI. Um teste travaria qualquer
ajuste de paleta até alguém atualizar os valores esperados, o que é caro
demais para o estágio do projeto. A tarefa de implementação registra o roteiro
para que seja repetível.

### Escalas

- **Espaçamento:** base de 4px, degraus `4 8 12 16 24 32 48 64`. Progressão
  regular, sem valores intermediários arbitrários.
- **Tipografia:** `12 14 16 20 24 32`px, com 16px como corpo de texto. Pesos
  400, 500 e 600 — três pesos cobrem hierarquia sem virar decisão a cada uso.
- **Raio:** `4 8 12`px mais `999px` para elementos em pílula.
- **Sombra:** três níveis (sutil, média, elevada).
- **Transição:** `120ms` para retorno de interação, `240ms` para mudança de
  layout.

### Um arquivo CSS por componente, importado pelo próprio componente

`Button.jsx` importa `Button.css`. O Vite agrega tudo no build.

*Alternativa considerada:* CSS Modules, que dariam escopo real de classe.
Rejeitada por ora: exigiria renomear convenções em todo o projeto para ganhar
proteção contra um conflito de nomes que, com prefixo por componente
(`.ms-button`), é improvável nesta escala. Migrar depois é mecânico.

### Galeria por parâmetro de URL, não por rota

A galeria é exibida quando a URL tem `?galeria`; caso contrário, o app renderiza
normalmente.

*Alternativa considerada:* instalar `react-router`. Rejeitada porque
adicionaria uma dependência e uma decisão de arquitetura de navegação para
servir a uma página de referência interna. Quando o app ganhar rotas de
verdade, a galeria migra para uma delas.

### Composição por `children` e repasse de props

Os componentes aceitam `children` e repassam props não reconhecidas ao
elemento DOM subjacente (`...rest`). Sem TypeScript, o contrato de props não é
verificável em tempo de compilação; repassar o resto evita que o componente
vire um gargalo que precisa ser editado toda vez que alguém precisa de um
`aria-*` ou um `onBlur`.

## Risks / Trade-offs

- **A paleta pode não agradar** → Tokens primitivos isolam a troca; nenhum
  componente referencia cor literal. Trocar a direção visual é editar um bloco
  de valores.
- **Sem verificação automática de contraste, uma edição futura de paleta pode
  quebrar a acessibilidade silenciosamente** → O roteiro de medição fica
  registrado nas tarefas e é repetível. Aceito conscientemente em troca de não
  travar ajustes visuais.
- **Sem TypeScript, props erradas falham em tempo de execução** → A galeria
  exercita cada componente em todas as variantes e estados, o que transforma
  erro de contrato em falha visível durante o desenvolvimento.
- **Refatorar `HealthStatus` pode alterar comportamento sem querer** → A spec
  de componentes fixa o comportamento observável da tela como requisito. A
  verificação compara os estados antes e depois.
- **`?galeria` é uma solução provisória** → Deliberada e registrada acima;
  migra para rota quando houver roteamento.

## Migration Plan

Mudança puramente aditiva do ponto de vista do usuário: nenhuma URL, API ou
dado muda. Os tokens antigos são removidos no mesmo passo em que seus últimos
consumidores passam a usar os novos, de modo que o app nunca fica em estado
intermediário quebrado.

Reversão: `git revert` do commit. Não há migração de dados nem estado
persistido envolvido.
