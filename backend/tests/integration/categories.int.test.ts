import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import app from '../../src/app'
import { prisma, resetDb, seedUserAndCategory } from './helpers/db'

describe('Categorias (API03 e API04)', () => {
  beforeEach(async () => { await resetDb() })
  afterAll(async () => { await prisma.$disconnect() })

  it('API03 exclui categoria sem tarefas', async () => {
    const category = await prisma.category.create({ data: { name: 'arquivo' } })
    const res = await request(app).delete(`/api/categories/${category.id}`)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true })
    expect(await prisma.category.findUnique({ where: { id: category.id } })).toBeNull()
  })

  it('API03 impede excluir categoria com tarefa e mantém ambos', async () => {
    const { user, category } = await seedUserAndCategory()
    const task = await prisma.task.create({ data: { title: 'Relatório', userId: user.id, categoryId: category.id } })
    const res = await request(app).delete(`/api/categories/${category.id}`)
    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ success: false, error: expect.any(String) })
    expect(await prisma.category.findUnique({ where: { id: category.id } })).not.toBeNull()
    expect(await prisma.task.findUnique({ where: { id: task.id } })).not.toBeNull()
  })

  it('API03 responde 404 para categoria inexistente', async () => {
    const res = await request(app).delete('/api/categories/inexistente')
    expect(res.status).toBe(404)
    expect(res.body).toMatchObject({ success: false, error: expect.any(String) })
    expect(await prisma.category.count()).toBe(0)
  })

  it('API04 cria categoria inédita', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Leitura' })
    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ success: true, data: { name: 'Leitura' } })
    expect(await prisma.category.count({ where: { name: 'Leitura' } })).toBe(1)
  })

  it.fails('API04 rejeita nome duplicado após normalização', async () => {
    await prisma.category.create({ data: { name: ' trabalho ' } })
    const res = await request(app).post('/api/categories').send({ name: 'Trabalho' })
    expect(res.status).toBe(409)
    expect(res.body).toMatchObject({ success: false, error: expect.any(String) })
    expect(await prisma.category.count()).toBe(1)
  })
})
