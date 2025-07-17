const express = require('express');
const { db } = require('../database');
const router = express.Router();

// GET - Listar todas as categorias
router.get('/', (req, res) => {
  db.all('SELECT * FROM categories WHERE active = 1 ORDER BY name', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST - Criar nova categoria
router.post('/', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  db.run('INSERT INTO categories (name) VALUES (?)', [name], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({ error: 'Categoria já existe' });
      }
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM categories WHERE id = ?', [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json(row);
    });
  });
});

// PUT - Atualizar categoria
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, active } = req.body;

  db.run(
    'UPDATE categories SET name = ?, active = ? WHERE id = ?',
    [name, active !== undefined ? active : 1, id],
    function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.status(400).json({ error: 'Nome já existe' });
        }
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      db.get('SELECT * FROM categories WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    }
  );
});

// DELETE - Desativar categoria
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('UPDATE categories SET active = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    res.json({ message: 'Categoria desativada com sucesso' });
  });
});

module.exports = router;