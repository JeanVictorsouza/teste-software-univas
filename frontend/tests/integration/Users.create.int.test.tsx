import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import Users from '../../src/components/Users'
import { server } from '../msw/server'

const lista = () => http.get('*/api/users', () => HttpResponse.json({ success: true, count: 0, data: [] }))

describe('Users + API — criação (RF08 e RF09)', () => {
  it('RF08 envia os dados, fecha formulário e mostra usuário após recarregar a lista', async () => {
    const user = userEvent.setup()
    let recebido: unknown
    let chamadasLista = 0
    server.use(
      http.get('*/api/users', () => {
        chamadasLista += 1
        return HttpResponse.json({ success: true, count: chamadasLista > 1 ? 1 : 0, data: chamadasLista > 1 ? [{ id: 'u2', name: 'Bia Lima', email: 'bia@email.com', createdAt: '2026-11-01T10:00:00.000Z', tasks: [] }] : [] })
      }),
      http.post('*/api/users', async ({ request }) => {
        recebido = await request.json()
        return HttpResponse.json({ success: true, data: { id: 'u2', name: 'Bia Lima', email: 'bia@email.com' } }, { status: 201 })
      })
    )
    render(<Users />)
    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))
    await user.type(screen.getByLabelText('Nome:'), 'Bia Lima')
    await user.type(screen.getByLabelText('Email:'), 'bia@email.com')
    await user.click(screen.getByRole('button', { name: 'Criar' }))
    expect(await screen.findByText('Bia Lima')).toBeInTheDocument()
    expect(recebido).toEqual({ name: 'Bia Lima', email: 'bia@email.com' })
    await waitFor(() => expect(screen.queryByLabelText('Nome:')).not.toBeInTheDocument())
  })

  it.fails('RF09 mostra mensagem de conflito e mantém formulário com os dados digitados', async () => {
    const user = userEvent.setup()
    let recebido: unknown
    server.use(
      lista(),
      http.post('*/api/users', async ({ request }) => {
        recebido = await request.json()
        return HttpResponse.json({ success: false, error: 'Email already exists' }, { status: 409 })
      })
    )
    render(<Users />)
    await user.click(await screen.findByRole('button', { name: 'Adicionar Usuário' }))
    await user.type(screen.getByLabelText('Nome:'), 'Bia Lima')
    await user.type(screen.getByLabelText('Email:'), 'bia@email.com')
    await user.click(screen.getByRole('button', { name: 'Criar' }))
    expect(recebido).toEqual({ name: 'Bia Lima', email: 'bia@email.com' })
    expect(await screen.findByText('Email já cadastrado')).toBeInTheDocument()
    expect(screen.getByLabelText('Nome:')).toHaveValue('Bia Lima')
    expect(screen.getByLabelText('Email:')).toHaveValue('bia@email.com')
  })
})
