import { useState } from 'react'
import useTranslations from '../../i18n/useTranslations'
import Button from './Button'
import './ConfirmDeleteButton.css'

/**
 * Botão de exclusão com confirmação em dois passos, sem modal.
 *
 * O primeiro clique troca o próprio botão por "Confirmar"/"Cancelar" — a
 * confirmação não pode ser perdida de vista nem sobreviver a menos que a
 * pessoa decida ativamente. Usado para excluir baralhos e cards, as duas
 * ações do app que destroem dado sem chance de desfazer.
 */
export default function ConfirmDeleteButton({ onConfirm, pending = false, size = 'sm', children }) {
  const t = useTranslations()
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <Button variant="danger" size={size} onClick={() => setConfirming(true)}>
        {children ?? t.common.deleteAction}
      </Button>
    )
  }

  return (
    <span className="ms-confirm-delete">
      <span className="ms-confirm-delete__label">{t.common.confirmDeleteQuestion}</span>
      <Button
        variant="danger"
        size={size}
        loading={pending}
        onClick={async () => {
          await onConfirm()
          setConfirming(false)
        }}
      >
        {t.common.confirm}
      </Button>
      <Button variant="ghost" size={size} disabled={pending} onClick={() => setConfirming(false)}>
        {t.common.cancel}
      </Button>
    </span>
  )
}
