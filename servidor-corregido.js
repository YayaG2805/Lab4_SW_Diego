import http from "http"
import fs from "fs/promises"
import path from "path"

const PORT = 3000

const server = http.createServer(async (req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" })
    res.end("Servidor de videojuegos activo")
    return
  }

  if (req.url === "/info") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      mensaje: "Informacion del servidor",
      autor: "Diego Guevara",
      carnet: "24128"
    }))
    return
  }

  if (req.url === "/api/videojuegos") {
    try {
      const filePath = path.join(process.cwd(), "datos.json")
      const texto = await fs.readFile(filePath, "utf-8")
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(texto)
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "No se pudo leer datos.json" }))
    }
    return
  }

  res.writeHead(404, { "Content-Type": "text/plain" })
  res.end("Ruta no encontrada")
})

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})