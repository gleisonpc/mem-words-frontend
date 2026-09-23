## 1. Token de breakpoint

- [x] 1.1 Em `src/styles/tokens.css`, adicionar um comentário-constante
      documentando o breakpoint mobile (`480px`) e a ressalva de que
      `var()` não funciona dentro de `@media`, orientando a repetir o
      literal `480px` em qualquer novo `@media` de layout responsivo do
      projeto. Verificar lendo o arquivo: o comentário existe perto dos
      demais blocos de `@media` já existentes (tema escuro, movimento
      reduzido).

## 2. Grade de notas da revisão (`.review-session__grades`)

- [x] 2.1 Em `src/pages/ReviewSessionPage.css`, adicionar
      `@media (max-width: 480px)` que muda
      `.review-session__grades` de `repeat(4, 1fr)` para
      `repeat(2, 1fr)`. Verificar rodando `npm run dev`, abrindo a tela de
      revisão de um baralho com cards prontos, revelando um card e usando
      as ferramentas de dispositivo do navegador em 360px, 390px, 430px e
      480px: os quatro botões formam um 2×2, rótulo e prévia legíveis, sem
      texto cortado.
- [x] 2.2 Confirmar, nas mesmas ferramentas de dispositivo, em 481px e em
      uma largura de desktop (ex. 1280px): a grade permanece em 4 colunas,
      igual a antes da mudança.

## 3. Grade do formulário de card (`.add-card-form__grid`)

- [x] 3.1 Em `src/pages/AddCardPage.css`, adicionar
      `@media (max-width: 480px)` que muda `.add-card-form__grid` de
      `1fr 1fr` para `1fr`. Verificar abrindo a tela de criação de card em
      360px, 390px, 430px e 480px: os campos Palavra e Tradução aparecem
      empilhados, um por linha, com rótulo e valor legíveis.
- [x] 3.2 Confirmar em 481px e em uma largura de desktop: Palavra e
      Tradução continuam lado a lado, igual a antes da mudança.
- [x] 3.3 Confirmar que `.ms-field--full` (classe collada por
      `partOfSpeech`, `exampleSentence`, `exampleTranslation`,
      `personalNote`) continua ocupando a linha inteira em ambas as
      larguras — a mudança só afeta o par Palavra/Tradução.

## 4. Verificação final

- [x] 4.1 Rodar `npm run lint` e confirmar que passa sem erros novos.
- [x] 4.2 Repetir a checagem visual dos itens 2.1 e 3.1 no tema claro e no
      tema escuro (alternando a preferência do sistema ou o seletor de
      tema em Perfil), confirmando que nenhuma mudança de layout depende
      do tema.
