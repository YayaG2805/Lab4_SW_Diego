import express from "express";
import crypto from "crypto";

const app = express();
const PORT = 3000;

app.use(express.json());

let videojuegos = [
  {
    id: crypto.randomUUID(),
    titulo: "The Legend of Zelda: Breath of the Wild",
    genero: "aventura",
    plataforma: "Nintendo Switch",
    precio: 59.99,
    stock: 8,
    clasificacion: "E10+"
  },
  {
    id: crypto.randomUUID(),
    titulo: "God of War Ragnarok",
    genero: "accion",
    plataforma: "PlayStation 5",
    precio: 69.99,
    stock: 5,
    clasificacion: "M"
  },
  {
    id: crypto.randomUUID(),
    titulo: "Minecraft",
    genero: "sandbox",
    plataforma: "Multiplataforma",
    precio: 29.99,
    stock: 15,
    clasificacion: "E10+"
  },
  {
    id: crypto.randomUUID(),
    titulo: "Forza Horizon 5",
    genero: "carreras",
    plataforma: "Xbox Series X",
    precio: 49.99,
    stock: 6,
    clasificacion: "E"
  }
];

const camposObligatorios = [
  "titulo",
  "genero",
  "plataforma",
  "precio",
  "stock",
  "clasificacion"
];

function validarVideojuego(body) {
  const faltantes = camposObligatorios.filter((campo) => body[campo] === undefined || body[campo] === "");

  if (faltantes.length > 0) {
    return `Faltan campos obligatorios: ${faltantes.join(", ")}`;
  }

  if (typeof body.precio !== "number" || body.precio < 0) {
    return "El precio debe ser un número mayor o igual a 0";
  }

  if (typeof body.stock !== "number" || body.stock < 0) {
    return "El stock debe ser un número mayor o igual a 0";
  }

  return null;
}

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "API REST de videojuegos activa",
    endpoints: {
      listar: "GET /api/videojuegos",
      detalle: "GET /api/videojuegos/:id",
      crear: "POST /api/videojuegos",
      reemplazar: "PUT /api/videojuegos/:id",
      actualizar: "PATCH /api/videojuegos/:id",
      eliminar: "DELETE /api/videojuegos/:id",
      filtro: "GET /api/videojuegos?genero=aventura"
    }
  });
});

app.get("/api/videojuegos", (req, res) => {
  const { genero, plataforma, clasificacion } = req.query;

  let resultado = [...videojuegos];

  if (genero) {
    resultado = resultado.filter(
      (juego) => juego.genero.toLowerCase() === genero.toLowerCase()
    );
  }

  if (plataforma) {
    resultado = resultado.filter(
      (juego) => juego.plataforma.toLowerCase().includes(plataforma.toLowerCase())
    );
  }

  if (clasificacion) {
    resultado = resultado.filter(
      (juego) => juego.clasificacion.toLowerCase() === clasificacion.toLowerCase()
    );
  }

  res.status(200).json({
    ok: true,
    total: resultado.length,
    data: resultado
  });
});

app.get("/api/videojuegos/:id", (req, res) => {
  const { id } = req.params;
  const juego = videojuegos.find((item) => item.id === id);

  if (!juego) {
    return res.status(404).json({
      ok: false,
      error: "Videojuego no encontrado"
    });
  }

  res.status(200).json({
    ok: true,
    data: juego
  });
});

app.post("/api/videojuegos", (req, res) => {
  const error = validarVideojuego(req.body);

  if (error) {
    return res.status(400).json({
      ok: false,
      error
    });
  }

  const nuevoJuego = {
    id: crypto.randomUUID(),
    ...req.body
  };

  videojuegos.push(nuevoJuego);

  res.status(201).json({
    ok: true,
    mensaje: "Videojuego creado correctamente",
    data: nuevoJuego
  });
});

app.put("/api/videojuegos/:id", (req, res) => {
  const { id } = req.params;
  const index = videojuegos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      error: "Videojuego no encontrado"
    });
  }

  const error = validarVideojuego(req.body);

  if (error) {
    return res.status(400).json({
      ok: false,
      error
    });
  }

  const juegoActualizado = {
    id,
    ...req.body
  };

  videojuegos[index] = juegoActualizado;

  res.status(200).json({
    ok: true,
    mensaje: "Videojuego reemplazado correctamente",
    data: juegoActualizado
  });
});

app.patch("/api/videojuegos/:id", (req, res) => {
  const { id } = req.params;
  const index = videojuegos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      error: "Videojuego no encontrado"
    });
  }

  if (req.body.precio !== undefined && (typeof req.body.precio !== "number" || req.body.precio < 0)) {
    return res.status(400).json({
      ok: false,
      error: "El precio debe ser un número mayor o igual a 0"
    });
  }

  if (req.body.stock !== undefined && (typeof req.body.stock !== "number" || req.body.stock < 0)) {
    return res.status(400).json({
      ok: false,
      error: "El stock debe ser un número mayor o igual a 0"
    });
  }

  const juegoActualizado = {
    ...videojuegos[index],
    ...req.body,
    id
  };

  videojuegos[index] = juegoActualizado;

  res.status(200).json({
    ok: true,
    mensaje: "Videojuego actualizado parcialmente",
    data: juegoActualizado
  });
});

app.delete("/api/videojuegos/:id", (req, res) => {
  const { id } = req.params;
  const index = videojuegos.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      error: "Videojuego no encontrado"
    });
  }

  const eliminado = videojuegos.splice(index, 1);

  res.status(200).json({
    ok: true,
    mensaje: "Videojuego eliminado correctamente",
    data: eliminado[0]
  });
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: "Ruta no encontrada",
    ruta: req.originalUrl,
    metodo: req.method,
    sugerencia: "Visita / para ver los endpoints disponibles"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});