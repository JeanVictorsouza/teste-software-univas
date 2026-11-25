import { test, expect, emailUnico, unico } from './support/fixtures'

test.describe('J06 — Categoria em uso', () => {
  test('J06.1 bloqueia exclusão da categoria associada a uma tarefa', async ({ page, dados }) => {
    const usuario = await dados.criarUsuario({ name: unico('J06 usuario'), email: emailUnico('j06') })
    const categoriaNome = unico('J06 categoria em uso')
    const categoria = await dados.criarCategoria({ name: categoriaNome, description: unico('Descricao J06') })
    await dados.criarTarefa({ title: unico('J06 tarefa'), userId: usuario.id, categoryId: categoria.id })

    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: categoriaNome })
    page.once('dialog', dialog => dialog.accept())
    await linha.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByText(/erro/i)).toBeVisible()
    await expect(page.getByRole('row').filter({ hasText: categoriaNome })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: categoriaNome })).toBeVisible()
  })
})
