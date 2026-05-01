# SOLUCION.md - Errores del servidor nativo

Este documento registra los errores encontrados en `servidor-malo.js` y como fueron
corregidos en `servidor-corregido.js`. En total se identificaron **6 errores** entre
sintaxis, logica, HTTP y asincronia.

---

## Error 1 - Falta parentesis de cierre en createServer

- **Ubicacion**: `servidor-malo.js`, final del callback de `http.createServer(...)`.
- **Tipo**: Sintaxis.
- **Que estaba mal**: la llamada `http.createServer(async (req, res) => { ... }`
  cierra la llave del callback con `}`, pero nunca se cierra el parentesis del
  `createServer(`. Node tira un `SyntaxError` y el archivo ni siquiera carga.

**Antes:**
```js
  res.writeHead(200, { "Content-Type": "text/plain" })
  res.end("Ruta no encontrada")
}

server.listen(PORT, () => {
```

**Despues:**
```js
  res.writeHead(404, { "Content-Type": "text/plain" })
  res.end("Ruta no encontrada")
})

server.listen(PORT, () => {
```

- **Por que funciona**: con `})` cerramos correctamente la funcion flecha y la
  llamada a `createServer`, asi el parser de JavaScript reconoce la sentencia
  como completa.

---

## Error 2 - Falta parentesis de cierre en server.listen

- **Ubicacion**: `servidor-malo.js`, ultima linea.
- **Tipo**: Sintaxis.
- **Que estaba mal**: igual que el anterior, `server.listen(PORT, () => { ... }`
  cierra la llave pero no el parentesis. Esto rompe el archivo entero.

**Antes:**
```js
server.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:3000")
}
```

**Despues:**
```js
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
```

- **Por que funciona**: con `})` cerramos la flecha y la llamada a `listen`. Ya
  con esto y la correccion anterior el archivo carga sin errores.

---

## Error 3 - Content-Type mal escrito en /info

- **Ubicacion**: ruta `/info` dentro del callback de `createServer`.
- **Tipo**: HTTP.
- **Que estaba mal**: el header decia `"application-json"` (con guion) en lugar de
  `"application/json"` (con slash). Ademas el cuerpo era texto plano, asi que
  aunque el header estuviera bien, el contenido no era JSON valido.

**Antes:**
```js
res.writeHead(200, { "Content-Type": "application-json" })
res.end("Ruta de informacion")
```

**Despues:**
```js
res.writeHead(200, { "Content-Type": "application/json" })
res.end(JSON.stringify({
  mensaje: "Informacion del servidor",
  autor: "Diego Guevara",
  carnet: "24128"
}))
```

- **Por que funciona**: el MIME oficial es `application/json`. Ahora el header
  declara JSON y el cuerpo es JSON real, asi el cliente (navegador, Postman) lo
  parsea correctamente.

---

## Error 4 - Falta await al leer el archivo

- **Ubicacion**: ruta `/api/videojuegos`, llamada a `fs.readFile`.
- **Tipo**: Asincronia.
- **Que estaba mal**: `fs/promises.readFile` devuelve una **Promesa**. Al no usar
  `await`, la variable `texto` quedaba siendo un objeto `Promise`, no el
  contenido del archivo. El cliente recibia algo como `"{}"` o `"[object Promise]"`
  en lugar del JSON real.

**Antes:**
```js
const texto = fs.readFile(filePath, "utf-8")
```

**Despues:**
```js
const texto = await fs.readFile(filePath, "utf-8")
```

- **Por que funciona**: `await` pausa la funcion `async` hasta que la promesa
  resuelve, asi `texto` queda con el contenido real del archivo (un string).

---

## Error 5 - Doble codificacion JSON

- **Ubicacion**: ruta `/api/videojuegos`, despues de leer el archivo.
- **Tipo**: Logica.
- **Que estaba mal**: `texto` ya es un string con JSON (porque asi se leyo el
  archivo). Hacer `JSON.stringify(texto)` lo vuelve a serializar, devolviendo
  un string con todas las comillas escapadas (`"\"{\\\"tienda\\\":...}\""`).
  El cliente recibe un string en lugar de un objeto.

**Antes:**
```js
const texto = fs.readFile(filePath, "utf-8")
res.writeHead(200, { "Content-Type": "application/json" })
res.end(JSON.stringify(texto))
```

**Despues:**
```js
try {
  const texto = await fs.readFile(filePath, "utf-8")
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(texto)
} catch (err) {
  res.writeHead(500, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "No se pudo leer datos.json" }))
}
```

- **Por que funciona**: enviamos directamente el texto (que ya es JSON valido).
  Tambien aprovechamos para agregar un `try/catch` que devuelve `500` si el
  archivo no existe o no se puede leer.

---

## Error 6 - Status 200 en ruta no encontrada

- **Ubicacion**: respuesta por defecto al final del callback (cuando ninguna
  ruta coincide).
- **Tipo**: HTTP / Logica.
- **Que estaba mal**: cualquier URL desconocida respondia `200 OK` con el texto
  "Ruta no encontrada". Eso engana al cliente: HTTP 200 significa exito, pero
  realmente la ruta no existe.

**Antes:**
```js
res.writeHead(200, { "Content-Type": "text/plain" })
res.end("Ruta no encontrada")
```

**Despues:**
```js
res.writeHead(404, { "Content-Type": "text/plain" })
res.end("Ruta no encontrada")
```

- **Por que funciona**: 404 es el codigo correcto para recursos inexistentes.
  Ahora navegadores, Postman, fetch, etc. interpretan correctamente que la
  ruta no existe.

---

## Resumen

| #  | Tipo        | Ubicacion                       |
|----|-------------|---------------------------------|
| 1  | Sintaxis    | Cierre de createServer          |
| 2  | Sintaxis    | Cierre de server.listen         |
| 3  | HTTP        | Content-Type en /info           |
| 4  | Asincronia  | fs.readFile sin await           |
| 5  | Logica      | JSON.stringify sobre texto JSON |
| 6  | HTTP        | Status 200 en ruta inexistente  |