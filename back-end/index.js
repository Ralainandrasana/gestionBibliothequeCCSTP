//IMPORT DEPENDANCE
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const crudRout = require('./routes/crudRouter');
const otherRout = require('./routes/otherRouter');
const cors = require('cors');
const cookieParser = require('cookie-parser');

//VARIABLE D'ENVIRONNEMENT
const PORT = 3000;

//UTILISATION DES ...
app.use(bodyParser.json()); // Pour les requêtes avec des données JSON
app.use(bodyParser.urlencoded({ extended: true })); // Pour les données envoyées via formulaire
app.use(crudRout);
app.use(otherRout);
app.use(cors());
app.use(cookieParser);

//ECOUTE AU PORT
app.listen(PORT, () => {
    console.log('server is running on port ' + PORT);
});

