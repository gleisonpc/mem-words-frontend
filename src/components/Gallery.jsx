import { useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDeleteButton,
  Input,
  Pagination,
  ProgressBar,
  Spinner,
} from './ui'
import './Gallery.css'

/** Tokens semânticos exibidos na paleta, na ordem em que fazem sentido lidos. */
const SWATCHES = [
  ['--color-bg', 'fundo da página'],
  ['--color-surface', 'superfície'],
  ['--color-surface-muted', 'superfície suave'],
  ['--color-border', 'divisória'],
  ['--color-border-strong', 'borda de campo'],
  ['--color-text', 'texto'],
  ['--color-text-muted', 'texto suave'],
  ['--color-primary', 'ação primária'],
  ['--color-primary-hover', 'ação primária (hover)'],
  ['--color-on-primary', 'sobre ação primária'],
  ['--color-success', 'sucesso'],
  ['--color-success-bg', 'fundo de sucesso'],
  ['--color-warning', 'atenção'],
  ['--color-warning-bg', 'fundo de atenção'],
  ['--color-danger', 'perigo'],
  ['--color-danger-bg', 'fundo de perigo'],
  ['--color-info', 'informação'],
  ['--color-info-bg', 'fundo de informação'],
]

const VARIANTS = ['primary', 'secondary', 'ghost', 'danger']
const STATES = ['neutral', 'success', 'warning', 'danger', 'info']

function Section({ id, title, description, children }) {
  return (
    <section className="gal-section" aria-labelledby={id}>
      <h2 className="gal-section__title" id={id}>
        {title}
      </h2>
      {description && <p className="gal-section__description">{description}</p>}
      <div className="gal-section__body">{children}</div>
    </section>
  )
}

export default function Gallery() {
  const [cliques, setCliques] = useState(0)
  const [progresso, setProgresso] = useState(40)
  const [pagina, setPagina] = useState(1)

  return (
    <main className="gal">
      <header className="gal-header">
        <h1>Design system</h1>
        <p>
          Referência viva dos tokens e componentes do mem-words. Um componente que
          não aparece aqui é considerado incompleto.
        </p>
      </header>

      <Section
        id="paleta"
        title="Paleta"
        description="Tokens semânticos. Os valores mudam entre os temas claro e escuro; os nomes, não."
      >
        <ul className="gal-swatches">
          {SWATCHES.map(([token, papel]) => (
            <li className="gal-swatch" key={token}>
              <span className="gal-swatch__chip" style={{ background: `var(${token})` }} />
              <span className="gal-swatch__text">
                <code>{token}</code>
                <span className="gal-swatch__role">{papel}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="botoes"
        title="Botão"
        description="Quatro variantes em dois tamanhos. A variante de perigo carrega um ícone de alerta, para não depender só da cor."
      >
        <div className="gal-row">
          {VARIANTS.map((v) => (
            <Button key={v} variant={v}>
              {v}
            </Button>
          ))}
        </div>
        <div className="gal-row">
          {VARIANTS.map((v) => (
            <Button key={v} variant={v} size="sm">
              {v} pequeno
            </Button>
          ))}
        </div>
        <div className="gal-row">
          <Button disabled>desabilitado</Button>
          <Button variant="secondary" disabled>
            desabilitado
          </Button>
          <Button loading>carregando</Button>
          <Button variant="secondary" loading>
            carregando
          </Button>
        </div>
      </Section>

      <Section
        id="botao-carregando"
        title="Botão carregando não dispara"
        description="Os dois botões usam o mesmo manipulador. Só o que não está carregando incrementa a contagem."
      >
        <div className="gal-row">
          <Button onClick={() => setCliques((n) => n + 1)}>Contar clique</Button>
          <Button loading onClick={() => setCliques((n) => n + 1)}>
            Contar clique (carregando)
          </Button>
          <output className="gal-output">
            cliques contados: <strong>{cliques}</strong>
          </output>
        </div>
      </Section>

      <Section id="campos" title="Campo de entrada">
        <div className="gal-grid">
          <Input label="Palavra" placeholder="ex.: serendipity" />
          <Input
            label="Tradução"
            placeholder="ex.: serendipidade"
            help="Use a tradução que fizer mais sentido para você."
          />
          <Input
            label="Palavra"
            defaultValue=""
            error="Informe a palavra que deseja memorizar."
          />
          <Input label="Idioma" value="inglês" disabled readOnly />
        </div>
      </Section>

      <Section id="cartoes" title="Cartão">
        <Card title="Título do cartão">
          <p className="gal-text">
            Cartões agrupam conteúdo relacionado sobre uma superfície distinta do
            fundo da página.
          </p>
        </Card>
        <Card
          title="Com ações"
          actions={
            <Button size="sm" variant="ghost">
              Ação
            </Button>
          }
        >
          <p className="gal-text">O cabeçalho aceita ações à direita do título.</p>
        </Card>
      </Section>

      <Section id="selos" title="Selo de estado">
        <div className="gal-row">
          {STATES.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </div>
      </Section>

      <Section id="alertas" title="Alerta">
        <Alert variant="success" title="Salvo">
          Sua lista de palavras foi salva.
        </Alert>
        <Alert variant="info">Revise 12 palavras hoje para manter o ritmo.</Alert>
        <Alert variant="warning" title="Sessão longa">
          Você está estudando há 45 minutos. Uma pausa ajuda a fixar.
        </Alert>
        <Alert variant="danger" title="Falha ao salvar">
          Não foi possível salvar a lista. Tente novamente.
        </Alert>
      </Section>

      <Section id="carregamento" title="Indicador de carregamento">
        <div className="gal-row gal-row--center">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
          <span className="gal-text">
            O rótulo é texto real, escondido visualmente — o estado não depende de
            ver a animação.
          </span>
        </div>
      </Section>

      <Section
        id="progresso"
        title="Barra de progresso"
        description="Valores fora do intervalo são limitados: a barra nunca transborda."
      >
        <ProgressBar label="Progresso da sessão" value={progresso} showValue />
        <div className="gal-row">
          <Button size="sm" variant="secondary" onClick={() => setProgresso((p) => p - 30)}>
            −30
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setProgresso((p) => p + 30)}>
            +30
          </Button>
          <output className="gal-output">
            valor bruto: <strong>{progresso}</strong>
          </output>
        </div>
        <ProgressBar label="Valor abaixo do mínimo (−50)" value={-50} showValue />
        <ProgressBar label="Valor acima do máximo (150)" value={150} showValue />
      </Section>

      <Section
        id="paginacao"
        title="Paginação"
        description="Só anterior/próxima — os botões desabilitam nas pontas."
      >
        <Pagination page={pagina} pageSize={10} total={42} onChange={setPagina} />
      </Section>

      <Section
        id="excluir"
        title="Confirmação de exclusão"
        description="Sem modal: o primeiro clique troca o botão por confirmar/cancelar."
      >
        <ConfirmDeleteButton onConfirm={() => {}}>Excluir baralho</ConfirmDeleteButton>
      </Section>
    </main>
  )
}
