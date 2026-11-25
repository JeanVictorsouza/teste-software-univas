import { test, expect, emailUnico, unico } from './support/fixtures'

test.describe('J07 — Email já cadastrado', () => {
  test('J07.1 informa conflito ao cadastrar email existente e preserva o usuário após recarregar', async ({ page, dados }) => {
    // A especificação exige mensagem específica; o comportamento observado usa erro genérico.
    test.fail(true, 'Defeito: o conflito não exibe “Email já cadastrado” conforme RF09.')
    const email = emailUnico('j07')
    const nomeExistente = unico('J07 usuario existente')
    await dados.criarUsuario({ name: nomeExistente, email })

    await page.goto('/users')
    await page.getByRole('button', { name: 'Adicionar Usuário' }).click()
    await page.getByLabel('Nome:').fill(unico('J07 duplicado'))
    await page.getByLabel('Email:').fill(email)
    await page.getByRole('button', { name: 'Criar' }).click()
    await expect(page.getByRole('button', { name: 'Criar' })).toBeVisible()
    await expect(page.getByLabel('Email:')).toHaveValue(email)
    const mensagemDuplicidadeVisivel = await page.getByText('Email já cadastrado').isVisible()

    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: email })).toContainText(nomeExistente)
    expect(mensagemDuplicidadeVisivel).toBe(true)
  })
})
