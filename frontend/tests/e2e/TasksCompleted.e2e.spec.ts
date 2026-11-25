import { test, expect, emailUnico, unico } from './support/fixtures'

test.describe('J08 — Tarefa concluída', () => {
  test('J08.1 recusa COMPLETED para PENDING e mantém COMPLETED após recarregar', async ({ page, dados }) => {
    // A API atual aceita a transição proibida; manter a expectativa da especificação como falha esperada.
    test.fail(true, 'Defeito: a transição COMPLETED → PENDING deve ser recusada pela RN01.')
    const usuario = await dados.criarUsuario({ name: unico('J08 usuario'), email: emailUnico('j08') })
    const categoria = await dados.criarCategoria({ name: unico('J08 categoria') })
    const titulo = unico('J08 tarefa concluida')
    await dados.criarTarefa({ title: titulo, userId: usuario.id, categoryId: categoria.id, status: 'COMPLETED' })

    await page.goto('/tasks')
    const linha = page.getByRole('row').filter({ hasText: titulo })
    await expect(linha).toContainText('COMPLETED')
    await linha.getByRole('button', { name: 'Editar' }).click()
    await page.getByRole('combobox').first().selectOption('PENDING')
    await page.getByRole('button', { name: 'Atualizar' }).click()
    const statusAntesDeRecarregar = await page.getByRole('row').filter({ hasText: titulo }).innerText()
    await page.reload()
    expect(statusAntesDeRecarregar).toContain('COMPLETED')
    await expect(page.getByRole('row').filter({ hasText: titulo })).toContainText('COMPLETED')
  })
})
