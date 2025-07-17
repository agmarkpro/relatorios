const express = require('express');
const { db } = require('../database');
const router = express.Router();

// GET - Listar todos os usuários
router.get('/', (req, res) => {
  db.all('SELECT * FROM users WHERE active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST - Criar novo usuário
router.post('/', (req, res) => {
  const { name, email, sector } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  db.run('INSERT INTO users (name, email, sector) VALUES (?, ?, ?)', [name, email, sector], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'Usuário já existe' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// PUT - Atualizar usuário
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, sector, active } = req.body;

  db.run(
    'UPDATE users SET name = ?, email = ?, sector = ?, active = ? WHERE id = ?',
    [name, email, sector, active !== undefined ? active : 1, id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Nome já existe' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
});

// DELETE - Desativar usuário
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE users SET active = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ message: 'Usuário desativado com sucesso' });
  });
});

module.exports = router;