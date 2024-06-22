const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static('public'));

// Middleware para manejar la subida de archivos
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  abortOnLimit: true,
  responseOnLimit: 'El archivo supera el límite de 5MB'
}));

// Ruta para servir el formulario HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/formulario.html');
});

// Ruta POST para subir imágenes
app.post('/imagen', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No se subió ningún archivo.');
  }

  try {
    // Obtener el archivo subido y la posición
    let uploadedFile = req.files.target_file;
    let position = req.body.posicion;
    
    // Construir la ruta de destino
    let uploadPath = __dirname + '/public/imgs/imagen-' + position + '.jpg';
    
    // Mover el archivo al directorio especificado
    uploadedFile.mv(uploadPath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al mover el archivo.');
      }
      // Enviar respuesta de éxito con el botón para volver al collage
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Subida Exitosa</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous" />
        </head>
        <body class="p-5">
          <div class="container p-5 w-50 border">
            <h1 class="text-center">Archivo subido correctamente. 😎</h1>
            <a href="/" class="btn btn-light mt-3">Ir a Inicio</a>
            <a href="/collage" class="btn btn-light mt-3">Ir al Collage</a>
          </div>
          <style>
            body {
              background: black;
              color: white;
              text-align: center;
            }
          </style>
        </body>
        </html>
      `);
    });
  } catch (err) {
    console.error("Error al agregar imagen: ", err);
    res.status(500).send('Error en el servidor.');
  }
});

// Ruta DELETE para eliminar imágenes
app.delete('/imagen/:nombre', (req, res) => {
  let imageName = req.params.nombre;
  let imagePath = __dirname + '/public/imgs/' + imageName;
  
  fs.unlink(imagePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al eliminar el archivo.');
    }
    res.send('Archivo eliminado correctamente.');
  });
});

// Ruta para servir el collage HTML
app.get('/collage', (req, res) => {
  res.sendFile(__dirname + '/public/collage.html');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});
