const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { initDatabase } = require('./database');

// Importar rotas
const ticketsRouter = require('./routes/tickets');
const techniciansRouter = require('./routes/technicians');
const sectorsRouter = require('./routes/sectors');
const categoriesRouter = require('./routes/categories');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/tickets', ticketsRouter);
app.use('/api/technicians', techniciansRouter);
app.use('/api/sectors', sectorsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/users', usersRouter);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor funcionando corretamente' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar banco de dados e servidor
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em http://localhost:${PORT}/api`);
      console.log(`💾 Banco de dados SQLite inicializado`);
    });
  })
  .catch((err) => {
    console.error('Erro ao inicializar banco de dados:', err);
    process.exit(1);
  });

module.exports = app;