## ADDED Requirements

### Requirement: Caminho de volta sempre alcançável

A tela de sessão de revisão SHALL oferecer uma ação para voltar ao detalhe
do baralho, alcançável em qualquer estado da tela — carregando a fila,
revisando um card, fila vazia, sessão concluída ou erro.

#### Scenario: Ação visível durante a revisão

- **WHEN** a tela está exibindo um card para revisão
- **THEN** uma ação para voltar ao detalhe do baralho está visível e
  alcançável, sem precisar terminar ou interromper a sessão
