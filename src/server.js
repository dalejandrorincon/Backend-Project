import express from 'express'
const { Router } = express

import {
    productosDao as productosApi,
    carritosDao as carritosApi
} from './daos/index.js'

const app = express()

/* ---------------------------- ROUTER PRODUCTOS ---------------------------- */
const productosRouter = new Router()

productosRouter.get('/', async (req, res) => {
    const productos = await productosApi.listarAll()
    res.json(productos)
});

productosRouter.get('/:id', async (req, res) => {
    res.json(await productosApi.listar(req.params.id))
});

productosRouter.post('/', soloAdmins, async (req, res) => {
    res.json(await productosApi.guardar(req.body))
});

productosRouter.put('/:id', soloAdmins, async (req, res) => {
    res.json(await productosApi.actualizar(req.body))
});

productosRouter.delete('/:id', soloAdmins, async (req, res) => {
    res.json(await productosApi.borrar(req.params.id))
});

/* ----------------------------- ROUTER CARRITOS ---------------------------- */

const carritosRouter = new Router()

carritosRouter.get('/', async (req, res) => {
    res.json((await carritosApi.listarAll()).map(c => c.id))
})

carritosRouter.post('/', async (req, res) => {
    res.json(await carritosApi.guardar())
})

carritosRouter.delete('/:id', async (req, res) => {
    res.json(await carritosApi.borrar(req.params.id))
})

/* ----------------------- ROUTER PRODUCTOS EN CARRITO ---------------------- */

carritosRouter.get('/:id/productos', async (req, res) => {
    const carrito = await carritosApi.listar(req.params.id)
    res.json(carrito.productos)
})

carritosRouter.post('/:id/productos', async (req, res) => {
    const carrito = await carritosApi.listar(req.params.id)
    const producto = await productosApi.listar(req.body.id)
    carrito.productos.push(producto)
    await carritosApi.actualizar(carrito)
    res.end()
})

carritosRouter.delete('/:id/productos/:idProd', async (req, res) => {
    const carrito = await carritosApi.listar(req.params.id)
    const index = carrito.productos.findIndex(p => p.id == req.params.idProd)
    if (index != -1) {
        carrito.productos.splice(index, 1)
        await carritosApi.actualizar(carrito)
    }
    res.end()
})

/* ----------------------- CONFIGURACIÓN DEL SERVIDOR ----------------------- */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use('/api/productos', productosRouter)
app.use('/api/carritos', carritosRouter)

export default app