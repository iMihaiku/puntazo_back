/* eslint-disable @typescript-eslint/no-misused-promises */
import { expect, describe, it } from 'vitest'
import request from 'supertest'
import app from '../index'

describe('User test group', () => {
  it('Login correcto', async () => {
    const testUser = { username: 'Mihaiku6', password: '12345' }
    const response = await request(app).post('/users/login').send(testUser)

    expect(response.status).toBe(200)
    expect(response.body.id).toEqual('3teTW-Gfho')
  })

  it('Login incorrecto', async () => {
    const testUser = { username: 'Mihaiku6', password: '54321' }
    const response = await request(app).post('/users/login').send(testUser)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({})
  })

  it('Registro correcto', async () => {
    const testUser = {
      username: 'MihaikuPruebas',
      password: '12345',
      email: 'maildepruebas@test.es'
    }
    const response = await request(app).post('/users/register').send(testUser)
    expect(response.status).toBe(200)
    expect(response.body.message).toEqual('Register function: User created')
  })

  it('Registro incorrecto - Datos mal formateados', async () => {
    const testUser = {
      userPASS: 'Mihaiku6',
      passNAME: '54321',
      email: 'maildepruebas2@test.es'
    }
    const response = await request(app).post('/users/register').send(testUser)
    expect(response.status).toBe(401)
    expect(response.body.message).toEqual('Register function: Error creating user')
    expect(response.body.data).toEqual('Missing parameters or incorrect parameters')
  })

  it('Registro incorrecto - Usuario duplicado', async () => {
    const testUser = {
      username: 'MihaikuPruebas',
      password: '54321',
      email: 'maildepruebas@test.es'
    }
    const response = await request(app).post('/users/register').send(testUser)
    expect(response.status).toBe(400)
    expect(response.body.message).toEqual('Register function: Error creating user')
    expect(response.body.data).toEqual('Username already exists')
  })

  it('Borrado de usuario Correcto', async () => {
    const username = 'MihaikuPruebas'
    const response = await request(app).delete(`/users?userName=${username}`)
    expect(response.status).toBe(200)
    expect(response.body.message).toEqual('Delete function: User deleted')
  })

  it('Borrado de usuario incorrecto - userName no encontrado', async () => {
    const username = 'MihaikuPruebas'
    const response = await request(app).delete(`/users?userName=${username}`)
    expect(response.status).toBe(400)
    expect(response.body.message).toEqual('Delete function: Error deleting user')
    expect(response.body.data).toEqual('User not found')
  })

  it('Borrado de usuario incorrecto - userName no suministrado', async () => {
    const response = await request(app).delete('/users')
    expect(response.status).toBe(401)
    expect(response.body.message).toEqual('Delete function: Error deleting user')
    expect(response.body.data).toEqual('Username must be provided')
  })
})
