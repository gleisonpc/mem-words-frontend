import { useCallback, useState } from 'react'
import ApiError from '../api/ApiError'

/**
 * Estado comum às telas de entrada e de cadastro: valores, erro por campo,
 * erro geral e envio em curso.
 *
 * Fica em um lugar porque a tradução de uma recusa do backend em erro de
 * formulário é a mesma nas duas telas — e será a mesma na próxima.
 */

/** Mensagem de último recurso, quando nem um `ApiError` chegou. */
const UNKNOWN = 'Não foi possível concluir a operação. Tente novamente.'

function defaultDescribeError(error) {
  if (error instanceof ApiError) {
    return { variant: 'danger', message: error.message }
  }

  return { variant: 'danger', message: UNKNOWN }
}

export default function useAuthForm({ initialValues, validate, submit, describeError }) {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [generalError, setGeneralError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  /**
   * O erro do campo sai ao primeiro toque: manter "e-mail inválido" abaixo de
   * um campo que a pessoa está corrigindo é ruído.
   */
  const change = useCallback(
    (field) => (event) => {
      const { value } = event.target

      setValues((current) => ({ ...current, [field]: value }))
      setFieldErrors((current) => (field in current ? { ...current, [field]: null } : current))
    },
    [],
  )

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      // Reentrada bloqueada: evita cadastro duplicado e entradas concorrentes,
      // que abririam sessões extras no backend.
      if (submitting) {
        return
      }

      setGeneralError(null)

      const localErrors = validate(values)

      if (Object.keys(localErrors).length > 0) {
        // Recusa local não gera requisição alguma.
        setFieldErrors(localErrors)
        return
      }

      setFieldErrors({})
      setSubmitting(true)

      try {
        await submit(values)
      } catch (error) {
        // O backend aponta quais campos falharam; cada motivo vai para o seu
        // campo, e só o que não pertence a nenhum vira erro geral.
        const byField = error instanceof ApiError ? error.fieldErrors : {}

        if (Object.keys(byField).length > 0) {
          setFieldErrors(byField)
        } else {
          setGeneralError((describeError ?? defaultDescribeError)(error))
        }
      } finally {
        // Uma falha devolve o formulário para nova tentativa.
        setSubmitting(false)
      }
    },
    [describeError, submit, submitting, validate, values],
  )

  return { values, change, fieldErrors, generalError, submitting, handleSubmit }
}
