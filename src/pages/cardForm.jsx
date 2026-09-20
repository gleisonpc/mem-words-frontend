import { collect } from '../auth/validation'
import ApiError from '../api/ApiError'
import { Input } from '../components/ui'

/**
 * Campos, validação e utilitários de card — compartilhados entre a tela de
 * criação de card (`AddCardPage`) e a edição de card na tela de detalhe do
 * baralho (`DeckDetailPage`), que aplicam a mesma regra (espelha o backend)
 * sobre os mesmos campos.
 */

export function requiredText(value, label) {
  return value.trim() === '' ? `Informe ${label}.` : null
}

/** Converte um campo opcional de texto: vazio vira "sem valor" (omitido no envio). */
export function optionalText(value) {
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export function synonymsToText(synonyms) {
  return (synonyms ?? []).join(', ')
}

/** Sinônimos aceitam array vazio explícito — diferente dos demais opcionais, que
 * o backend não permite limpar de volta (ver design.md). */
export function textToSynonyms(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '')
}

export function describeApiError(fallback) {
  return (error) => ({
    variant: 'danger',
    message: error instanceof ApiError ? error.message : fallback,
  })
}

export function cardValidate(values) {
  return collect({
    word: requiredText(values.word, 'a palavra'),
    translation: requiredText(values.translation, 'a tradução'),
  })
}

export function cardInputFromValues(values) {
  return {
    word: values.word.trim(),
    translation: values.translation.trim(),
    partOfSpeech: optionalText(values.partOfSpeech),
    synonyms: textToSynonyms(values.synonyms),
    exampleSentence: optionalText(values.exampleSentence),
    exampleTranslation: optionalText(values.exampleTranslation),
    personalNote: optionalText(values.personalNote),
  }
}

export const EMPTY_CARD_VALUES = {
  word: '',
  translation: '',
  partOfSpeech: '',
  synonyms: '',
  exampleSentence: '',
  exampleTranslation: '',
  personalNote: '',
}

/**
 * Campos de um card. `wordSearch` é opcional — só a tela de criação passa
 * algo (o botão e o status da busca de sugestão de dicionário, que entram
 * logo abaixo do par Palavra/Tradução, em largura cheia); a edição não
 * tenta sugerir nada para uma palavra que já existe.
 *
 * `extraField` entra entre Sinônimos e Classe gramatical: é onde a tela de
 * criação encaixa o campo Baralho, para que os dois formem um par visual
 * entre si — os demais campos, sem par definido no mockup, ficam em largura
 * cheia via `ms-field--full` (efeito só dentro de um container em grid; em
 * `.deck-form`, que é flex-column, a classe não muda nada).
 */
export function CardFields({ values, change, fieldErrors, disabled, wordSearch, extraField }) {
  return (
    <>
      <Input
        label="Palavra"
        name="word"
        value={values.word}
        onChange={change('word')}
        error={fieldErrors.word}
        disabled={disabled}
      />
      <Input
        label="Tradução"
        name="translation"
        value={values.translation}
        onChange={change('translation')}
        error={fieldErrors.translation}
        disabled={disabled}
      />
      {wordSearch}
      <Input
        label="Sinônimos"
        name="synonyms"
        placeholder="separados por vírgula"
        value={values.synonyms}
        onChange={change('synonyms')}
        error={fieldErrors.synonyms}
        disabled={disabled}
      />
      {extraField}
      <Input
        label="Classe gramatical"
        name="partOfSpeech"
        placeholder="ex.: substantivo"
        value={values.partOfSpeech}
        onChange={change('partOfSpeech')}
        error={fieldErrors.partOfSpeech}
        disabled={disabled}
        className="ms-field--full"
      />
      <Input
        label="Frase de exemplo"
        name="exampleSentence"
        value={values.exampleSentence}
        onChange={change('exampleSentence')}
        error={fieldErrors.exampleSentence}
        disabled={disabled}
        className="ms-field--full"
      />
      <Input
        label="Tradução da frase"
        name="exampleTranslation"
        value={values.exampleTranslation}
        onChange={change('exampleTranslation')}
        error={fieldErrors.exampleTranslation}
        disabled={disabled}
        className="ms-field--full"
      />
      <Input
        label="Anotação pessoal"
        name="personalNote"
        value={values.personalNote}
        onChange={change('personalNote')}
        error={fieldErrors.personalNote}
        disabled={disabled}
        className="ms-field--full"
      />
    </>
  )
}
