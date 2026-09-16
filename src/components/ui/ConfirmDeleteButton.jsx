import { useState } from 'react'
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
export default function ConfirmDeleteButton({
  onConfirm,
  pending = false,
  size = 'sm',
  children = 'Excluir',
}) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <Button variant="danger" size={size} onClick={() => setConfirming(true)}>
        {children}
      </Button>
    )
  }

  return (
    <span className="ms-confirm-delete">
      <span className="ms-confirm-delete__label">Confirmar exclusão?</span>
      <Button
        variant="danger"
        size={size}
        loading={pending}
        onClick={async () => {
          await onConfirm()
          setConfirming(false)
        }}
      >
        Confirmar
      </Button>
      <Button variant="ghost" size={size} disabled={pending} onClick={() => setConfirming(false)}>
        Cancelar
      </Button>
    </span>
  )
}
