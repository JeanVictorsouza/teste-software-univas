import { test, expect, unico } from './support/fixtures'

test.describe('J05 — Cadastro, edição e exclusão de categoria', () => {
  test('J05.1 cria categoria com nome e descrição persistentes', async ({ page, dados }) => {
    const nome = unico('J05 categoria criada')
    const descricao = unico('Descricao J05')
    await page.goto('/categories')
    await page.getByRole('button', { name: 'Adicionar Categoria' }).click()
    await page.getByRole('textbox').first().fill(nome)
    await page.getByRole('textbox').last().fill(descricao)
    await page.getByRole('button', { name: 'Criar' }).click()
    await dados.registrarCategoriaPorNome(nome)
    await expect(page.getByRole('row').filter({ hasText: nome })).toContainText(descricao)

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: nome })).toContainText(descricao)
  })

  test('J05.2 edita categoria e persiste nome e descrição atualizados', async ({ page, dados }) => {
    const nomeAntigo = unico('J05 categoria antiga')
    const nomeNovo = unico('J05 categoria nova')
    const descricaoNova = unico('Descricao nova J05')
    await dados.criarCategoria({ name: nomeAntigo, description: unico('Descricao antiga J05') })

    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: nomeAntigo })
    await linha.getByRole('button', { name: 'Editar' }).click()
    await page.getByRole('textbox').first().fill(nomeNovo)
    await page.getByRole('textbox').last().fill(descricaoNova)
    await page.getByRole('button', { name: 'Atualizar' }).click()
    await expect(page.getByRole('row').filter({ hasText: nomeNovo })).toContainText(descricaoNova)
    await expect(page.getByRole('row').filter({ hasText: nomeAntigo })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: nomeNovo })).toContainText(descricaoNova)
    await expect(page.getByRole('row').filter({ hasText: nomeAntigo })).toHaveCount(0)
  })

  test('J05.3 confirma exclusão de categoria e ela continua ausente após recarregar', async ({ page, dados }) => {
    const nome = unico('J05 categoria excluir')
    await dados.criarCategoria({ name: nome, description: unico('Descricao excluir') })

    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: nome })
    page.once('dialog', dialog => dialog.accept())
    await linha.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByRole('row').filter({ hasText: nome })).toHaveCount(0)

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: nome })).toHaveCount(0)
  })

  test('J05.4 cancela exclusão e categoria permanece após recarregar', async ({ page, dados }) => {
    const nome = unico('J05 categoria manter')
    await dados.criarCategoria({ name: nome, description: unico('Descricao manter') })

    await page.goto('/categories')
    const linha = page.getByRole('row').filter({ hasText: nome })
    page.once('dialog', dialog => dialog.dismiss())
    await linha.getByRole('button', { name: 'Excluir' }).click()
    await expect(page.getByRole('row').filter({ hasText: nome })).toBeVisible()

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: nome })).toBeVisible()
  })

  test('J05.5 impede cadastro sem Nome e mantém categoria ausente após recarregar', async ({ page }) => {
    const descricao = unico('Descricao sem nome J05')
    await page.goto('/categories')
    await page.getByRole('button', { name: 'Adicionar Categoria' }).click()
    await page.getByRole('textbox').last().fill(descricao)
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.getByRole('button', { name: 'Criar' })).toBeVisible()
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: descricao })).toHaveCount(0)
  })
})
