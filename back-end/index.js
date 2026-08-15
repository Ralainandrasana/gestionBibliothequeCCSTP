const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const crudRout = require('./routes/crudRouter');
const otherRout = require('./routes/otherRouter');
const auditMiddleware = require('./middleware/audit');
const decodeHtmlEntitiesResponse = require('./middleware/decodeHtmlEntitiesResponse');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CONFIGURATION CORS CORRECTE
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],  // Ajouter les deux ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Les données historiques du projet PHP contiennent parfois des apostrophes
// et guillemets stockés comme entités HTML. Les réponses JSON les restaurent
// en texte normal avant d'être consommées par React.
app.use(decodeHtmlEntitiesResponse);

// Configuration des sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  name: 'bibliotheque.sid'
}));

// Journaliser automatiquement les actions métier après l'initialisation de la session.
app.use(auditMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/crud', crudRout); // Utilisation de routes avec point de montage
app.use('/api/other', otherRout);

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
