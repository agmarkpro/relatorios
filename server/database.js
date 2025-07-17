const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com o banco de dados
const dbPath = path.join(__dirname, 'tickets.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tabelas
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Tabela de chamados
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          solution TEXT DEFAULT '',
          technician TEXT NOT NULL,
          sector TEXT NOT NULL,
          user TEXT NOT NULL,
          status TEXT NOT NULL,
          category TEXT NOT NULL,
          priority TEXT NOT NULL,
          dateTime TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          resolvedAt TEXT,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de técnicos
      db.run(`
        CREATE TABLE IF NOT EXISTS technicians (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          email TEXT,
          active INTEGER DEFAULT 1,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de setores
      db.run(`
        CREATE TABLE IF NOT EXISTS sectors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          active INTEGER DEFAULT 1,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de categorias
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          active INTEGER DEFAULT 1,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          email TEXT,
          sector TEXT,
          active INTEGER DEFAULT 1,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Inserir dados padrão se não existirem
      insertDefaultData();
      
      resolve();
    });
  });
};

const insertDefaultData = () => {
  // Técnicos padrão
  const defaultTechnicians = [
    'João Silva',
    'Maria Santos',
    'Pedro Oliveira',
    'Ana Costa',
    'Carlos Ferreira'
  ];

  defaultTechnicians.forEach(name => {
    db.run('INSERT OR IGNORE INTO technicians (name) VALUES (?)', [name]);
  });

  // Setores padrão
  const defaultSectors = [
    'Administrativo',
    'Financeiro',
    'Recursos Humanos',
    'Vendas',
    'Produção',
    'TI',
    'Marketing'
  ];

  defaultSectors.forEach(name => {
    db.run('INSERT OR IGNORE INTO sectors (name) VALUES (?)', [name]);
  });

  // Categorias padrão
  const defaultCategories = [
    'Hardware',
    'Software',
    'Rede',
    'Email',
    'Impressora',
    'Sistema',
    'Telefonia',
    'Outros'
  ];

  defaultCategories.forEach(name => {
    db.run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [name]);
  });

  // Usuários padrão
  const defaultUsers = [
    { name: 'Roberto Silva', sector: 'Administrativo' },
    { name: 'Fernanda Lima', sector: 'Financeiro' },
    { name: 'Marcos Pereira', sector: 'Vendas' },
    { name: 'Juliana Rocha', sector: 'Recursos Humanos' },
    { name: 'André Souza', sector: 'Produção' }
  ];

  defaultUsers.forEach(user => {
    db.run('INSERT OR IGNORE INTO users (name, sector) VALUES (?, ?)', [user.name, user.sector]);
  });
};

module.exports = { db, initDatabase };