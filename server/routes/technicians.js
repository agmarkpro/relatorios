const express = require('express');
const { db } = require('../database');
const router = express.Router();

// GET - Listar todos os técnicos
router.get('/', (req, res) => {
  db.all('SELECT * FROM technicians WHERE active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST - Criar novo técnico
router.post('/', (req, res) => {
  const { name, email } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  db.run('INSERT INTO technicians (name, email) VALUES (?, ?)', [name, email], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'Técnico já existe' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM technicians WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// PUT - Atualizar técnico
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, active } = req.body;

  db.run(
    'UPDATE technicians SET name = ?, email = ?, active = ? WHERE id = ?',
    [name, email, active !== undefined ? active : 1, id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Nome já existe' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Técnico não encontrado' });
      }

      db.get('SELECT * FROM technicians WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
});

// DELETE - Desativar técnico
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE technicians SET active = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Técnico não encontrado' });
    }
    
    res.json({ message: 'Técnico desativado com sucesso' });
  });
});

module.exports = router;