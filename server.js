const express = require('express');
const path = require('path');
const nomeApp = process.env.npm_package_name;

const app = express();

// Serve os arquivos estáticos da pasta dist (gerada pelo ng build)
app.use(express.static(`${__dirname}/dist/${nomeApp}`));

app.get('/*', function(req,res) {
    console.log('executando', req.path);
    res.sendFile(path.join(`${__dirname}/dist/${nomeApp}/index.html`));
});

// Inicia a aplicação pela porta configurada
app.listen(process.env.PORT || 8080);
