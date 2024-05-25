// routes/webhook.routes.js

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const webhookController = require('../controllers/webhook.controller');

// Middleware para parsear el cuerpo de la solicitud
router.use(bodyParser.raw({ type: 'application/json' }));

// Ruta para manejar los eventos de webhook de Stripe
router.post('/webhook', async (req, res) => {
  try {
    await webhookController.handleWebhook(req, res);
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
