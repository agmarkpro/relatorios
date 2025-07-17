const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const router = express.Router();

// GET - Listar todos os chamados
router.get('/', (req, res) => {
  const query = `
    SELECT * FROM tickets 
    ORDER BY createdAt DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET - Buscar chamado por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    res.json(row);
  });
});

// POST - Criar novo chamado
router.post('/', (req, res) => {
  const {
    title,
    description,
    technician,
    sector,
    user,
    category,
    priority
  } = req.body;

  const id = uuidv4();
  const dateTime = new Date().toISOString();
  const createdAt = dateTime;
  const status = 'Aberto';
  const solution = '';

  const query = `
    INSERT INTO tickets (
      id, title, description, solution, technician, sector, 
      user, status, category, priority, dateTime, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    id, title, description, solution, technician, sector,
    user, status, category, priority, dateTime, createdAt
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // Retornar o chamado criado
    db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// PUT - Atualizar chamado
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    solution,
    technician,
    sector,
    user,
    status,
    category,
    priority
  } = req.body;

  const updatedAt = new Date().toISOString();
  const resolvedAt = status === 'Resolvido' ? updatedAt : null;

  const query = `
    UPDATE tickets SET
      title = ?, description = ?, solution = ?, technician = ?,
      sector = ?, user = ?, status = ?, category = ?, priority = ?,
      resolvedAt = ?, updatedAt = ?
    WHERE id = ?
  `;

  const values = [
    title, description, solution, technician, sector, user,
    status, category, priority, resolvedAt, updatedAt, id
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    // Retornar o chamado atualizado
    db.get('SELECT * FROM tickets WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

// DELETE - Excluir chamado
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tickets WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }
    
    res.json({ message: 'Chamado excluído com sucesso' });
  });
});

module.exports = router;