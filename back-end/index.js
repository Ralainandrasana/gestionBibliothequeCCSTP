const express = require('express');
const session = require('express-session');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const authRoutes = require('./routes/authRoutes');
const crudRout = require('./routes/crudRouter');
const otherRout = require('./routes/otherRouter');
const auditMiddleware = require('./middleware/audit');

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
