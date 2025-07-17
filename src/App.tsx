import React, { useState, useEffect } from 'react';
import { 
  TicketIcon, 
  PlusIcon, 
  SettingsIcon, 
  BarChart3Icon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  XIcon,
  UserIcon,
  BuildingIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  FileTextIcon,
  DownloadIcon,
  FilterIcon,
  BellIcon,
  ShieldIcon,
  EyeIcon,
  CalendarIcon
} from 'lucide-react';
import { DashboardCharts } from './components/Charts';
import { exportToExcel, saveMonthlyBackup } from './utils/excelExport';

interface Ticket {
  id: string;
  title: string;
  description: string;
  solution: string;
  technician: string;
  sector: string;
  user: string;
  status: string;
  category: string;
  priority: string;
  dateTime: string;
  createdAt: string;
  resolvedAt?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'technician' | 'user';
}

const INITIAL_DATA = {
  technicians: ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa'],
  sectors: ['TI', 'Recursos Humanos', 'Financeiro', 'Vendas', 'Operações'],
  categories: ['Hardware', 'Software', 'Rede', 'Email', 'Impressora', 'Sistema', 'Acesso'],
  priorities: ['Baixa', 'Média', 'Alta', 'Crítica'],
  statusList: ['Aberto', 'Em Andamento', 'Aguardando', 'Resolvido', 'Fechado'],
  users: {
    'TI': ['Ana Costa', 'Carlos Lima', 'Fernanda Rocha'],
    'Recursos Humanos': ['Luciana Pereira', 'Roberto Alves'],
    'Financeiro': ['Patrícia Silva', 'Marcos Souza', 'Juliana Castro'],
    'Vendas': ['Ricardo Mendes', 'Camila Rodrigues', 'Diego Santos']
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentUser] = useState<User>({ id: '1', name: 'Admin', email: 'admin@empresa.com', role: 'admin' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [viewingTicket, setViewingTicket] = useState<Ticket | null>(null);
  const [showNotification, setShowNotification] = useState('');
  const [nextTicketId, setNextTicketId] = useState(1);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  
  // Export options
  const [exportOptions, setExportOptions] = useState({
    startMonth: new Date().getMonth() + 1,
    startYear: new Date().getFullYear(),
    endMonth: new Date().getMonth() + 1,
    endYear: new Date().getFullYear()
  });
  
  // Data management
  const [technicians, setTechnicians] = useState(INITIAL_DATA.technicians);
  const [sectors, setSectors] = useState(INITIAL_DATA.sectors);
  const [categories, setCategories] = useState(INITIAL_DATA.categories);
  const [priorities, setPriorities] = useState(INITIAL_DATA.priorities);
  const [statusList, setStatusList] = useState(INITIAL_DATA.statusList);
  const [users, setUsers] = useState(INITIAL_DATA.users);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTickets = localStorage.getItem('tickets');
    const savedNextId = localStorage.getItem('nextTicketId');
    const savedTechnicians = localStorage.getItem('technicians');
    const savedSectors = localStorage.getItem('sectors');
    const savedUsers = localStorage.getItem('users');

    if (savedTickets) setTickets(JSON.parse(savedTickets));
    if (savedNextId) setNextTicketId(parseInt(savedNextId));
    if (savedTechnicians) setTechnicians(JSON.parse(savedTechnicians));
    if (savedSectors) setSectors(JSON.parse(savedSectors));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
    localStorage.setItem('nextTicketId', nextTicketId.toString());
    localStorage.setItem('technicians', JSON.stringify(technicians));
    localStorage.setItem('sectors', JSON.stringify(sectors));
    localStorage.setItem('users', JSON.stringify(users));

    // Save monthly backup
    if (tickets.length > 0) {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      saveMonthlyBackup(tickets, currentMonth, currentYear);
    }
  }, [tickets, nextTicketId, technicians, sectors, users]);

  const showNotificationMessage = (message: string) => {
    setShowNotification(message);
    setTimeout(() => setShowNotification(''), 3000);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  const handleSubmitTicket = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTicket: Ticket = {
      id: String(nextTicketId).padStart(6, '0'),
      title: formData.get('title') as string || 'Sem título',
      description: formData.get('description') as string || 'Sem descrição',
      solution: formData.get('solution') as string || 'Sem solução',
      technician: formData.get('technician') as string || 'Não atribuído',
      sector: formData.get('sector') as string || 'Não definido',
      user: formData.get('user') as string || 'Não definido',
      status: formData.get('status') as string || 'Aberto',
      category: formData.get('category') as string || 'Geral',
      priority: formData.get('priority') as string || 'Média',
      dateTime: formData.get('dateTime') as string || getCurrentDateTime(),
      createdAt: new Date().toISOString(),
      resolvedAt: formData.get('status') === 'Resolvido' ? new Date().toISOString() : undefined
    };

    setTickets(prev => [newTicket, ...prev]);
    setNextTicketId(prev => prev + 1);
    e.currentTarget.reset();
    showNotificationMessage('Chamado criado com sucesso!');
  };

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === updatedTicket.id ? {
        ...updatedTicket,
        resolvedAt: updatedTicket.status === 'Resolvido' && !ticket.resolvedAt ? new Date().toISOString() : ticket.resolvedAt
      } : ticket
    ));
    setEditingTicket(null);
    showNotificationMessage('Chamado atualizado com sucesso!');
  };

  const handleDeleteTicket = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este chamado?')) {
      setTickets(prev => prev.filter(ticket => ticket.id !== id));
      showNotificationMessage('Chamado excluído com sucesso!');
    }
  };

  const handleAddSector = (sectorName: string) => {
    if (sectorName && !sectors.includes(sectorName)) {
      setSectors(prev => [...prev, sectorName]);
      setUsers(prev => ({ ...prev, [sectorName]: [] }));
      showNotificationMessage('Setor adicionado com sucesso!');
    }
  };

  const handleRemoveSector = (sectorName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o setor "${sectorName}" e todos os seus usuários?`)) {
      setSectors(prev => prev.filter(s => s !== sectorName));
      setUsers(prev => {
        const newUsers = { ...prev };
        delete newUsers[sectorName];
        return newUsers;
      });
      if (selectedSector === sectorName) {
        setSelectedSector(null);
      }
      showNotificationMessage('Setor removido com sucesso!');
    }
  };

  const handleAddUserToSector = (userName: string) => {
    if (!selectedSector) {
      showNotificationMessage('Selecione um setor primeiro!');
      return;
    }
    
    if (!userName) {
      showNotificationMessage('Digite o nome do usuário!');
      return;
    }
    
    if (users[selectedSector]?.includes(userName)) {
      showNotificationMessage('Usuário já existe neste setor!');
      return;
    }
    
    setUsers(prev => ({
      ...prev,
      [selectedSector]: [...(prev[selectedSector] || []), userName]
    }));
    showNotificationMessage(`Usuário "${userName}" adicionado ao setor "${selectedSector}"!`);
  };

  const handleRemoveUserFromSector = (userName: string) => {
    if (!selectedSector) return;
    
    if (window.confirm(`Tem certeza que deseja remover "${userName}" do setor "${selectedSector}"?`)) {
      setUsers(prev => ({
        ...prev,
        [selectedSector]: prev[selectedSector]?.filter(u => u !== userName) || []
      }));
      showNotificationMessage(`Usuário "${userName}" removido do setor "${selectedSector}"!`);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || ticket.status === filterStatus;
    const matchesPriority = !filterPriority || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStats = () => {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    return {
      total: tickets.length,
      today: tickets.filter(t => new Date(t.dateTime).toDateString() === today).length,
      thisMonth: tickets.filter(t => {
        const date = new Date(t.dateTime);
        return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
      }).length,
      resolved: tickets.filter(t => t.status === 'Resolvido').length,
      pending: tickets.filter(t => ['Aberto', 'Em Andamento'].includes(t.status)).length,
      critical: tickets.filter(t => t.priority === 'Crítica' && t.status !== 'Resolvido').length
    };
  };

  const handleExportExcel = () => {
    try {
      const fileName = exportToExcel(tickets, exportOptions);
      showNotificationMessage(`Arquivo ${fileName} exportado com sucesso!`);
    } catch (error) {
      showNotificationMessage('Erro ao exportar: ' + (error as Error).message);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'Baixa': 'bg-green-100 text-green-800',
      'Média': 'bg-yellow-100 text-yellow-800',
      'Alta': 'bg-orange-100 text-orange-800',
      'Crítica': 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Aberto': 'bg-blue-100 text-blue-800',
      'Em Andamento': 'bg-purple-100 text-purple-800',
      'Aguardando': 'bg-yellow-100 text-yellow-800',
      'Resolvido': 'bg-green-100 text-green-800',
      'Fechado': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
          <CheckCircleIcon className="w-5 h-5" />
          {showNotification}
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <TicketIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sistema de Chamados TI</h1>
                <p className="text-sm text-gray-600">Gerenciamento profissional de suporte técnico</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                {currentUser.name}
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {currentUser.role}
                </span>
              </div>
              <BellIcon className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-1">
          <nav className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3Icon },
              { id: 'new-ticket', label: 'Novo Chamado', icon: PlusIcon },
              { id: 'manage', label: 'Gerenciar', icon: SettingsIcon },
              { id: 'reports', label: 'Relatórios', icon: FileTextIcon }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {[
                { label: 'Total', value: stats.total, color: 'blue', icon: TicketIcon },
                { label: 'Hoje', value: stats.today, color: 'green', icon: ClockIcon },
                { label: 'Este Mês', value: stats.thisMonth, color: 'purple', icon: BarChart3Icon },
                { label: 'Resolvidos', value: stats.resolved, color: 'emerald', icon: CheckCircleIcon },
                { label: 'Pendentes', value: stats.pending, color: 'yellow', icon: AlertCircleIcon },
                { label: 'Críticos', value: stats.critical, color: 'red', icon: ShieldIcon }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                    <div className={`bg-${stat.color}-100 p-3 rounded-lg`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <DashboardCharts tickets={tickets} />

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar chamados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todos os Status</option>
                    {statusList.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Todas as Prioridades</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Tickets List */}
            <div className="space-y-4">
              {filteredTickets.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum chamado encontrado</h3>
                  <p className="text-gray-600">Crie um novo chamado para começar</p>
                </div>
              ) : (
                filteredTickets.map(ticket => (
                  <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-blue-600">#{ticket.id}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Técnico:</span>
                          <p className="font-medium">{ticket.technician}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Setor:</span>
                          <p className="font-medium">{ticket.sector}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Usuário:</span>
                          <p className="font-medium">{ticket.user}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Data:</span>
                          <p className="font-medium">{new Date(ticket.dateTime).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-gray-500 text-sm">Problema:</span>
                        <p className="text-gray-900 mt-1">{ticket.description}</p>
                      </div>

                      <div className="mb-4">
                        <span className="text-gray-500 text-sm">Solução:</span>
                        <p className="text-gray-900 mt-1">{ticket.solution}</p>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewingTicket(ticket)}
                          className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Visualizar
                        </button>
                        <button
                          onClick={() => setEditingTicket(ticket)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* New Ticket Tab */}
        {activeTab === 'new-ticket' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Criar Novo Chamado</h2>
            <form onSubmit={handleSubmitTicket} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título do chamado (opcional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Técnico</label>
                  <select
                    name="technician"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um técnico (opcional)</option>
                    {technicians.map(tech => (
                      <option key={tech} value={tech}>{tech}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Setor</label>
                  <select
                    name="sector"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um setor (opcional)</option>
                    {sectors.map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Usuário</label>
                  <select
                    name="user"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um usuário (opcional)</option>
                    {Object.entries(users).map(([sector, userList]) => (
                      <optgroup key={sector} label={sector}>
                        {userList.map(user => (
                          <option key={user} value={user}>{user}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria (opcional)</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridade</label>
                  <select
                    name="priority"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione a prioridade (opcional)</option>
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione o status (opcional)</option>
                    {statusList.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data e Hora</label>
                  <input
                    type="datetime-local"
                    name="dateTime"
                    defaultValue={getCurrentDateTime()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição do Problema</label>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva detalhadamente o problema... (opcional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solução Aplicada</label>
                <textarea
                  name="solution"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva a solução aplicada... (opcional)"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md"
                >
                  <SaveIcon className="w-4 h-4" />
                  Criar Chamado
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Technicians Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Técnicos</h3>
              </div>
              <div className="space-y-3">
                {technicians.map((tech, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{tech}</span>
                    <button
                      onClick={() => {
                        const newTechnicians = technicians.filter((_, i) => i !== index);
                        setTechnicians(newTechnicians);
                        showNotificationMessage(`${tech} removido com sucesso!`);
                      }}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Novo técnico"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value && !technicians.includes(value)) {
                          setTechnicians([...technicians, value]);
                          input.value = '';
                          showNotificationMessage(`${value} adicionado com sucesso!`);
                        }
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      const value = input.value.trim();
                      if (value && !technicians.includes(value)) {
                        setTechnicians([...technicians, value]);
                        input.value = '';
                        showNotificationMessage(`${value} adicionado com sucesso!`);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Sectors Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <BuildingIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Setores</h3>
              </div>
              <div className="space-y-3">
                {sectors.map((sector, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">{sector}</span>
                    <button
                      onClick={() => handleRemoveSector(sector)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Novo setor"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        handleAddSector(value);
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                      const value = input.value.trim();
                      handleAddSector(value);
                      input.value = '';
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>

                {/* User Management by Sector */}
                <div className="mt-8 pt-6 border-t-2 border-gray-200">
                  <h4 className="text-md font-semibold text-gray-900 mb-4">👤 Gerenciar Usuários por Setor</h4>
                  
                  {/* Sector Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecione um setor:</label>
                    <div className="flex flex-wrap gap-2">
                      {sectors.map(sector => {
                        const userCount = users[sector]?.length || 0;
                        const isSelected = selectedSector === sector;
                        
                        return (
                          <button
                            key={sector}
                            onClick={() => setSelectedSector(sector)}
                            className={`flex flex-col items-center px-4 py-2 rounded-lg transition-all ${
                              isSelected 
                                ? 'bg-blue-600 text-white transform scale-105' 
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <span className="font-medium">{sector}</span>
                            <small className="opacity-80">{userCount} usuário{userCount !== 1 ? 's' : ''}</small>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Management Area */}
                  {selectedSector && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nome do usuário"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              const value = input.value.trim();
                              handleAddUserToSector(value);
                              input.value = '';
                            }
                          }}
                        />
                        <button
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                            const value = input.value.trim();
                            handleAddUserToSector(value);
                            input.value = '';
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Adicionar Usuário
                        </button>
                      </div>

                      {/* Users List */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">Usuários do setor: {selectedSector}</h5>
                        {users[selectedSector]?.length === 0 || !users[selectedSector] ? (
                          <div className="text-center py-8 text-gray-500">
                            <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p>Nenhum usuário cadastrado no setor <strong>{selectedSector}</strong></p>
                            <small>Adicione o primeiro usuário acima</small>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {users[selectedSector].map(user => (
                              <div key={user} className="flex items-center justify-between p-2 bg-white rounded-lg">
                                <span className="font-medium">{user}</span>
                                <button
                                  onClick={() => handleRemoveUserFromSector(user)}
                                  className="text-red-600 hover:text-red-800 transition-colors px-2 py-1 rounded"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Export Configuration */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Configuração de Exportação
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mês Inicial</label>
                  <select
                    value={exportOptions.startMonth}
                    onChange={(e) => setExportOptions({...exportOptions, startMonth: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(0, i).toLocaleDateString('pt-BR', {month: 'long'})}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ano Inicial</label>
                  <select
                    value={exportOptions.startYear}
                    onChange={(e) => setExportOptions({...exportOptions, startYear: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({length: 10}, (_, i) => (
                      <option key={2020+i} value={2020+i}>{2020+i}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mês Final</label>
                  <select
                    value={exportOptions.endMonth}
                    onChange={(e) => setExportOptions({...exportOptions, endMonth: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>
                        {new Date(0, i).toLocaleDateString('pt-BR', {month: 'long'})}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ano Final</label>
                  <select
                    value={exportOptions.endYear}
                    onChange={(e) => setExportOptions({...exportOptions, endYear: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({length: 10}, (_, i) => (
                      <option key={2020+i} value={2020+i}>{2020+i}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Exportar para Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* Tickets Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gerenciar Chamados</h2>
              
              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Nenhum chamado encontrado</p>
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-blue-600">#{ticket.id}</span>
                          <span className="font-medium">{ticket.title}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {ticket.technician} • {ticket.sector} • {new Date(ticket.dateTime).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingTicket(ticket)}
                          className="flex items-center gap-1 px-3 py-1 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Ver
                        </button>
                        <button
                          onClick={() => setEditingTicket(ticket)}
                          className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Estatísticas Detalhadas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries({
                  'Por Técnico': tickets.reduce((acc, ticket) => {
                    acc[ticket.technician] = (acc[ticket.technician] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>),
                  'Por Setor': tickets.reduce((acc, ticket) => {
                    acc[ticket.sector] = (acc[ticket.sector] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>),
                  'Por Status': tickets.reduce((acc, ticket) => {
                    acc[ticket.status] = (acc[ticket.status] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                }).map(([title, data]) => (
                  <div key={title} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
                    <div className="space-y-2">
                      {Object.entries(data).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{key}</span>
                          <span className="font-medium text-blue-600">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Visualizar Chamado #{viewingTicket.id}</h2>
                <button
                  onClick={() => setViewingTicket(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <p className="text-gray-900">{viewingTicket.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(viewingTicket.status)}`}>
                      {viewingTicket.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(viewingTicket.priority)}`}>
                      {viewingTicket.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <p className="text-gray-900">{viewingTicket.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
                    <p className="text-gray-900">{viewingTicket.technician}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                    <p className="text-gray-900">{viewingTicket.sector}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                    <p className="text-gray-900">{viewingTicket.user}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data/Hora</label>
                    <p className="text-gray-900">{new Date(viewingTicket.dateTime).toLocaleString('pt-BR')}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Problema</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingTicket.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solução Aplicada</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingTicket.solution}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6">
                <button
                  onClick={() => setViewingTicket(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => {
                    setViewingTicket(null);
                    setEditingTicket(viewingTicket);
                  }}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <EditIcon className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Editar Chamado #{editingTicket.id}</h2>
                <button
                  onClick={() => setEditingTicket(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const updatedTicket: Ticket = {
                    ...editingTicket,
                    title: formData.get('title') as string || editingTicket.title,
                    description: formData.get('description') as string || editingTicket.description,
                    solution: formData.get('solution') as string || editingTicket.solution,
                    technician: formData.get('technician') as string || editingTicket.technician,
                    sector: formData.get('sector') as string || editingTicket.sector,
                    user: formData.get('user') as string || editingTicket.user,
                    status: formData.get('status') as string || editingTicket.status,
                    category: formData.get('category') as string || editingTicket.category,
                    priority: formData.get('priority') as string || editingTicket.priority,
                    dateTime: formData.get('dateTime') as string || editingTicket.dateTime
                  };
                  handleUpdateTicket(updatedTicket);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingTicket.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Técnico</label>
                    <select
                      name="technician"
                      defaultValue={editingTicket.technician}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um técnico</option>
                      {technicians.map(tech => (
                        <option key={tech} value={tech}>{tech}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Setor</label>
                    <select
                      name="sector"
                      defaultValue={editingTicket.sector}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um setor</option>
                      {sectors.map(sector => (
                        <option key={sector} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                    <select
                      name="user"
                      defaultValue={editingTicket.user}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione um usuário</option>
                      {Object.entries(users).map(([sector, userList]) => (
                        <optgroup key={sector} label={sector}>
                          {userList.map(user => (
                            <option key={user} value={user}>{user}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      defaultValue={editingTicket.status}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione o status</option>
                      {statusList.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      name="category"
                      defaultValue={editingTicket.category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                    <select
                      name="priority"
                      defaultValue={editingTicket.priority}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione a prioridade</option>
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
                    <input
                      type="datetime-local"
                      name="dateTime"
                      defaultValue={editingTicket.dateTime}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    name="description"
                    defaultValue={editingTicket.description}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solução</label>
                  <textarea
                    name="solution"
                    defaultValue={editingTicket.solution}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingTicket(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <SaveIcon className="w-4 h-4" />
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;