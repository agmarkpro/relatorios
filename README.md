# relatorios

## Sistema de Chamados TI com Backend

Sistema completo de gerenciamento de chamados de TI com backend em Node.js e banco de dados SQLite.

### Funcionalidades

- ✅ **Backend completo** com API REST
- ✅ **Banco de dados SQLite** para persistência
- ✅ **Sincronização em tempo real** entre dispositivos
- ✅ **CRUD completo** para chamados, técnicos, setores, categorias e usuários
- ✅ **Status de conexão** em tempo real
- ✅ **Validação de dados** no backend
- ✅ **Tratamento de erros** robusto

### Como executar

#### Opção 1: Executar frontend e backend separadamente

1. **Backend:**
   ```bash
   npm run server
   ```
   Servidor rodará em: http://localhost:3001

2. **Frontend:**
   ```bash
   npm run dev
   ```
   Interface rodará em: http://localhost:5173

#### Opção 2: Executar tudo junto

```bash
npm run dev:full
```

### Estrutura do Projeto

```
├── server/                 # Backend Node.js
│   ├── database.js        # Configuração do SQLite
│   ├── server.js          # Servidor Express
│   ├── tickets.db         # Banco de dados SQLite (criado automaticamente)
│   └── routes/            # Rotas da API
│       ├── tickets.js     # CRUD de chamados
│       ├── technicians.js # CRUD de técnicos
│       ├── sectors.js     # CRUD de setores
│       ├── categories.js  # CRUD de categorias
│       └── users.js       # CRUD de usuários
├── src/
│   ├── services/          # Serviços de API
│   ├── hooks/             # Hooks customizados
│   └── components/        # Componentes React
```

### API Endpoints

#### Chamados
- `GET /api/tickets` - Listar chamados
- `POST /api/tickets` - Criar chamado
- `PUT /api/tickets/:id` - Atualizar chamado
- `DELETE /api/tickets/:id` - Excluir chamado

#### Técnicos
- `GET /api/technicians` - Listar técnicos
- `POST /api/technicians` - Criar técnico
- `PUT /api/technicians/:id` - Atualizar técnico
- `DELETE /api/technicians/:id` - Desativar técnico

#### Setores
- `GET /api/sectors` - Listar setores
- `POST /api/sectors` - Criar setor
- `PUT /api/sectors/:id` - Atualizar setor
- `DELETE /api/sectors/:id` - Desativar setor

#### Categorias
- `GET /api/categories` - Listar categorias
- `POST /api/categories` - Criar categoria
- `PUT /api/categories/:id` - Atualizar categoria
- `DELETE /api/categories/:id` - Desativar categoria

#### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/:id` - Atualizar usuário
- `DELETE /api/users/:id` - Desativar usuário

### Banco de Dados

O sistema utiliza SQLite como banco de dados, que é criado automaticamente na primeira execução. As tabelas incluem:

- **tickets** - Chamados de TI
- **technicians** - Técnicos responsáveis
- **sectors** - Setores da empresa
- **categories** - Categorias de problemas
- **users** - Usuários do sistema

### Recursos Implementados

1. **Persistência de dados**: Todos os dados são salvos no banco SQLite
2. **Sincronização**: Alterações são refletidas instantaneamente
3. **Status de conexão**: Indicador visual do status do servidor
4. **Validação**: Validação de dados no backend
5. **Tratamento de erros**: Mensagens de erro amigáveis
6. **CRUD completo**: Operações completas para todas as entidades
7. **Dados padrão**: Sistema inicializa com dados de exemplo

### Tecnologias Utilizadas

**Backend:**
- Node.js
- Express.js
- SQLite3
- CORS
- UUID

**Frontend:**
- React + TypeScript
- Tailwind CSS
- Lucide React (ícones)
- Chart.js (gráficos)
- XLSX (exportação)

### Próximos Passos

Para produção, considere:
- Implementar autenticação/autorização
- Adicionar logs de auditoria
- Configurar backup automático do banco
- Implementar WebSockets para atualizações em tempo real
- Adicionar testes unitários e de integração