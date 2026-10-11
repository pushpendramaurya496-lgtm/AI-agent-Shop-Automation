const express = require('express');
const cors = require('cors');
const { swaggerUi, specs } = require('./config/swagger');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Allow JSON data in requests

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check if the backend is running
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Success message
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend is running fine!' });
});

// Swagger Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customSiteTitle: 'Shop-Home AI-agent Documentation',
    customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info { margin: 25px 0; } .swagger-ui .info .title { font-family: sans-serif; font-weight: 700; color: #1e293b; }',
}));

// Yahan par baaki routes connect hote hain
app.use('/api/v1', require('./routes/index'));

module.exports = app;