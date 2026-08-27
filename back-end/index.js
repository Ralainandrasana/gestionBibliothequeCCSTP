const express = require('express');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const crudRout = require('./routes/crudRouter');
const otherRout = require('./routes/otherRouter');
const auditMiddleware = require('./middleware/audit');
const decodeHtmlEntitiesResponse = require('./middleware/decodeHtmlEntitiesResponse');
const gzipJsonResponse = require('./middleware/gzipJsonResponse');
const createPrecompressedStatic = require('./middleware/precompressedStatic');

const app = express();
const PORT = process.env.PORT || 5000;
const frontendDistPath = path.resolve(__dirname, '../front-end/dist');

// ✅ CONFIGURATION CORS CORRECTE
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],  // Ajouter les deux ports
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compresser les reponses JSON assez volumineuses avec le Gzip natif de Node.
// Le niveau rapide limite le travail CPU sur les postes aux ressources modestes.
app.use(gzipJsonResponse);

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
    // HTTP local : cookie utilisable. HTTPS : attribut Secure automatique.
    secure: 'auto',
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

// Une route API inconnue ne doit jamais recevoir le index.html de React.
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Route API introuvable.' });
});

// En production, Express sert directement le build Vite.
if (process.env.NODE_ENV === 'production' && fs.existsSync(frontendDistPath)) {
  // Envoyer les variantes .gz generees au build aux navigateurs compatibles.
  app.use(createPrecompressedStatic(frontendDistPath));

  app.use(express.static(frontendDistPath, {
    index: false,
    setHeaders: (res, filePath) => {
      if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  }));

  // Fallback requis pour les routes gerees par React Router.
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else if (process.env.NODE_ENV === 'production') {
  console.warn(`Build React introuvable dans ${frontendDistPath}. Lancez npm run build dans front-end.`);
}

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
