const express = require('express');
const { db } = require('../database');
const router = express.Router();

// GET - Listar todos os setores
router.get('/', (req, res) => {
  db.all('SELECT * FROM sectors WHERE active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST - Criar novo setor
router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  db.run('INSERT INTO sectors (name) VALUES (?)', [name], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'Setor já existe' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM sectors WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// PUT - Atualizar setor
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, active } = req.body;

  db.run(
    'UPDATE sectors SET name = ?, active = ? WHERE id = ?',
    [name, active !== undefined ? active : 1, id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Nome já existe' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Setor não encontrado' });
      }

      db.get('SELECT * FROM sectors WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
});

// DELETE - Desativar setor
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE sectors SET active = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Setor não encontrado' });
    }
    
    res.json({ message: 'Setor desativado com sucesso' });
  });
});

module.exports = router;