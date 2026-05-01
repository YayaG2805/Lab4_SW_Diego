import express from "express"
import { randomUUID } from "crypto"

const app = express()
const PORT = 3000

app.use(express.json())

// ---------- DATOS INICIALES ----------
let videojuegos = [
  {
    id: randomUUID(),
    titulo: "The Legend of Zelda: Breath of the Wild",
    genero: "aventura",
    plataforma: "Nintendo Switch",
    precio: 59.99,
    stock: 12,
    clasificacion: "E10+"
  },
  {
    id: randomUUID(),
    titulo: "God of War Ragnarok",
    genero: "accion",
    plataforma: "PlayStation 5",
    precio: 69.99,
    stock: 8,
    clasificacion: "M"
  },
  {
    id: randomUUID(),
    titulo: "Hades",
    genero: "roguelike",
    plataforma: "PC",
    precio: 24.99,
    stock: 25,
    clasificacion: "T"
  },
  {
    id: randomUUID(),
    titulo: "Stardew Valley",
    genero: "simulacion",
    plataforma: "PC",
    precio: 14.99,
    stock: 40,
    clasificacion: "E"
  },
  {
    id: randomUUID(),
    titulo: "Elden Ring",
    genero: "aventura",
    plataforma: "PC",
    precio: 59.99,
    stock: 15,
    clasificacion: "M"
  }
]

// ---------- HELPERS ----------
const CAMPOS_REQUERIDOS = ["titulo", "genero", "plataforma", "precio", "stock", "clasificacion"]

function validarCamposCompletos(body) {
  const faltantes = CAMPOS_REQUERIDOS.filter(c => body[c] === undefined || body[c] === null || body[c] === "")
  if (faltantes.length > 0) {
    return `Faltan campos obligatorios: ${faltantes.join(", ")}`
  }
  if (typeof body.precio !== "number" || body.precio < 0) {
    return "El campo 'precio' debe ser un numero mayor o igual a 0"
  }
  if (typeof body.stock !== "number" || !Number.isInteger(body.stock) || body.stock < 0) {
    return "El campo 'stock' debe ser un entero mayor o igual a 0"
  }
  return null
}

// ---------- ENDPOINTS ----------

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    data: {
      mensaje: "API REST de Videojuegos",
      autor: "Diego Guevara",
      carnet: "24128",
      rutaBase: "/api/videojuegos"
    }
  })
})

app.get("/api/videojuegos", (req, res) => {
  const { genero, plataforma, clasificacion } = req.query
  let resultado = [...videojuegos]

  if (genero) {
    resultado = resultado.filter(v => v.genero.toLowerCase() === genero.toLowerCase())
  }
  if (plataforma) {
    resultado = resultado.filter(v => v.plataforma.toLowerCase() === plataforma.toLowerCase())
  }
  if (clasificacion) {
    resultado = resultado.filter(v => v.clasificacion.toLowerCase() === clasificacion.toLowerCase())
  }

  res.status(200).json({ ok: true, data: resultado })
})

app.get("/api/videojuegos/:id", (req, res) => {
  const vj = videojuegos.find(v => v.id === req.params.id)
  if (!vj) {
    return res.status(404).json({ ok: false, error: "Videojuego no encontrado" })
  }
  res.status(200).json({ ok: true, data: vj })
})

app.post("/api/videojuegos", (req, res) => {
  const error = validarCamposCompletos(req.body)
  if (error) {
    return res.status(400).json({ ok: false, error })
  }

  const nuevo = {
    id: randomUUID(),
    titulo: req.body.titulo,
    genero: req.body.genero,
    plataforma: req.body.plataforma,
    precio: req.body.precio,
    stock: req.body.stock,
    clasificacion: req.body.clasificacion
  }
  videojuegos.push(nuevo)
  res.status(201).json({ ok: true, data: nuevo })
})

app.put("/api/videojuegos/:id", (req, res) => {
  const idx = videojuegos.findIndex(v => v.id === req.params.id)
  if (idx === -1) {
    return res.status(404).json({ ok: false, error: "Videojuego no encontrado" })
  }

  const error = validarCamposCompletos(req.body)
  if (error) {
    return res.status(400).json({ ok: false, error: `PUT requiere todos los campos. ${error}` })
  }

  videojuegos[idx] = {
    id: req.params.id,
    titulo: req.body.titulo,
    genero: req.body.genero,
    plataforma: req.body.plataforma,
    precio: req.body.precio,
    stock: req.body.stock,
    clasificacion: req.body.clasificacion
  }
  res.status(200).json({ ok: true, data: videojuegos[idx] })
})

app.patch("/api/videojuegos/:id", (req, res) => {
  const idx = videojuegos.findIndex(v => v.id === req.params.id)
  if (idx === -1) {
    return res.status(404).json({ ok: false, error: "Videojuego no encontrado" })
  }

  const cambios = {}
  for (const campo of CAMPOS_REQUERIDOS) {
    if (req.body[campo] !== undefined) {
      cambios[campo] = req.body[campo]
    }
  }

  if (Object.keys(cambios).length === 0) {
    return res.status(400).json({
      ok: false,
      error: "Debe enviar al menos un campo valido para actualizar"
    })
  }

  if (cambios.precio !== undefined && (typeof cambios.precio !== "number" || cambios.precio < 0)) {
    return res.status(400).json({ ok: false, error: "El campo 'precio' debe ser un numero >= 0" })
  }
  if (cambios.stock !== undefined && (typeof cambios.stock !== "number" || !Number.isInteger(cambios.stock) || cambios.stock < 0)) {
    return res.status(400).json({ ok: false, error: "El campo 'stock' debe ser un entero >= 0" })
  }

  videojuegos[idx] = { ...videojuegos[idx], ...cambios }
  res.status(200).json({ ok: true, data: videojuegos[idx] })
})

app.delete("/api/videojuegos/:id", (req, res) => {
  const idx = videojuegos.findIndex(v => v.id === req.params.id)
  if (idx === -1) {
    return res.status(404).json({ ok: false, error: "Videojuego no encontrado" })
  }
  const eliminado = videojuegos.splice(idx, 1)[0]
  res.status(200).json({ ok: true, data: eliminado })
})

// ---------- 404 GLOBAL ----------
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Ruta no encontrada" })
})

// ---------- MANEJADOR DE ERRORES ----------
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ ok: false, error: "Error interno del servidor" })
})

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`)
})