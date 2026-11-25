import { test, expect, emailUnico, unico } from './support/fixtures'

test.describe('J03 — Edição de usuário', () => {
  test('J03.1 altera o nome do usuário e mantém a alteração após recarregar', async ({ page, dados }) => {
    const nomeAntigo = unico('J03 usuario antigo')
    const nomeNovo = unico('J03 usuario editado')
    const email = emailUnico('j03')
    await dados.criarUsuario({ name: nomeAntigo, email })

    await page.goto('/users')
    const linha = page.getByRole('row').filter({ hasText: email })
    await linha.getByRole('button', { name: 'Editar' }).click()
    await page.getByLabel('Nome:').fill(nomeNovo)
    await page.getByRole('button', { name: 'Atualizar' }).click()

    await expect(page.getByRole('row').filter({ hasText: email })).toContainText(nomeNovo)
    await expect(page.getByRole('row').filter({ hasText: email })).not.toContainText(nomeAntigo)
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: email })).toContainText(nomeNovo)
    await expect(page.getByRole('row').filter({ hasText: email })).not.toContainText(nomeAntigo)
  })
})
