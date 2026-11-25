import { test, expect, emailUnico, unico } from './support/fixtures'

test.describe('J04 — Exclusão de usuário', () => {
  test('J04.1 confirma a exclusão e o usuário continua ausente após recarregar', async ({ page, dados }) => {
    const email = emailUnico('j04-confirmar')
    await dados.criarUsuario({ name: unico('J04 excluir'), email })

    await page.goto('/users')
    const linha = page.getByRole('row').filter({ hasText: email })
    page.once('dialog', dialog => dialog.accept())
    await linha.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByRole('row').filter({ hasText: email })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: email })).toHaveCount(0)
  })

  test('J04.2 cancela a exclusão e o usuário continua visível após recarregar', async ({ page, dados }) => {
    const email = emailUnico('j04-cancelar')
    const nome = unico('J04 manter')
    await dados.criarUsuario({ name: nome, email })

    await page.goto('/users')
    const linha = page.getByRole('row').filter({ hasText: email })
    page.once('dialog', dialog => dialog.dismiss())
    await linha.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByRole('row').filter({ hasText: email })).toContainText(nome)

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: email })).toContainText(nome)
  })
})
