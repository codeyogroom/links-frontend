import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Loader from './Loader';
import { 
  Plus, Search, Filter, Edit3, ChevronLeft, ChevronRight, 
  ExternalLink, Layers, ArrowUpDown, X, Globe, Building
} from 'lucide-react';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [entriesPerPage, setEntriesPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filter states
  const [filters, setFilters] = useState({
    id: '',
    parent: '',
    fromCpc: '',
    toCpc: '',
    studyType: '',
    country: '',
    client: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/admin/projects');
      setProjects(projRes.data || []);
    } catch(err) { 
      console.error(err); 
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setFilters({
      id: '',
      parent: '',
      fromCpc: '',
      toCpc: '',
      studyType: '',
      country: '',
      client: ''
    });
    setCurrentPage(1);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // Global search
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = (p.name || '').toLowerCase().includes(term);
        const matchesId = (p.projectId || p._id || '').toLowerCase().includes(term);
        const matchesClient = (p.clientId?.name || '').toLowerCase().includes(term);
        if (!matchesName && !matchesId && !matchesClient) return false;
      }

      // Status filter
      if (statusFilter !== 'All') {
        const pStatus = (p.status === 'Select Status' || !p.status) ? 'Running' : p.status;
        if (pStatus !== statusFilter) return false;
      }

      // Advanced filters
      if (filters.id && !(p.projectId || p._id || '').includes(filters.id)) return false;
      if (filters.parent && !((p.parentProjectId || '').toString()).includes(filters.parent)) return false;
      if (filters.fromCpc && Number(p.cpc || 0) < Number(filters.fromCpc)) return false;
      if (filters.toCpc && Number(p.cpc || 0) > Number(filters.toCpc)) return false;
      if (filters.studyType && (p.studyTypeId?.name || '') !== filters.studyType) return false;
      if (filters.client && (p.clientId?.name || '') !== filters.client) return false;

      return true;
    });
  }, [projects, searchTerm, statusFilter, filters]);

  const totalPages = Math.ceil(filteredProjects.length / entriesPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Layers className="text-blue-600" size={24} />
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage research links, allocation quotas, suppliers and status metrics.
          </p>
        </div>

        <button 
          onClick={() => navigate('/add-project')}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Project</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Search & Action Bar */}
        <div className="p-4 md:p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search by project name, ID, or client..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                showAdvancedFilters || Object.values(filters).some(Boolean)
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Toggle filters"
            >
              <Filter size={14} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {/* Status Quick Pills */}
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-medium">
              {['All', 'Running', 'Testing', 'Paused'].map(st => (
                <button
                  key={st}
                  onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Entries dropdown */}
            <div className="hidden sm:flex items-center text-xs text-slate-500 ml-2">
              <select
                value={entriesPerPage}
                onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <input
              placeholder="ID"
              value={filters.id}
              onChange={(e) => setFilters({ ...filters, id: e.target.value })}
              className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            />
            <input
              placeholder="Parent ID"
              value={filters.parent}
              onChange={(e) => setFilters({ ...filters, parent: e.target.value })}
              className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            />
            <input
              placeholder="Min CPC ($)"
              value={filters.fromCpc}
              onChange={(e) => setFilters({ ...filters, fromCpc: e.target.value })}
              className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            />
            <input
              placeholder="Max CPC ($)"
              value={filters.toCpc}
              onChange={(e) => setFilters({ ...filters, toCpc: e.target.value })}
              className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            />
            <input
              placeholder="Client Name"
              value={filters.client}
              onChange={(e) => setFilters({ ...filters, client: e.target.value })}
              className="border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleResetFilters}
                className="w-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-1.5 rounded-lg font-medium transition"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Modern Data Table */}
        {loading ? (
          <div className="py-16">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-3">Parent</th>
                  <th className="py-3 px-4">Project Name</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-3">PM / SM</th>
                  <th className="py-3 px-3">Start Date</th>
                  <th className="py-3 px-3 text-center">N</th>
                  <th className="py-3 px-3 text-center">Hits</th>
                  <th className="py-3 px-3 text-center">Comp.</th>
                  <th className="py-3 px-3 text-center">Drop</th>
                  <th className="py-3 px-3 text-center">QF</th>
                  <th className="py-3 px-3 text-center">IR%</th>
                  <th className="py-3 px-3 text-center">LOI</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedProjects.length === 0 ? (
                  <tr>
                    <td colSpan="15" className="py-12 text-center text-slate-400">
                      <Layers size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium text-slate-600">No projects found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try clearing your filters or create a new project.</p>
                    </td>
                  </tr>
                ) : paginatedProjects.map(p => {
                  const status = (p.status === 'Select Status' || !p.status) ? 'Running' : p.status;
                  const isRunning = status === 'Running';
                  const isTesting = status === 'Testing';
                  
                  return (
                    <tr 
                      key={p._id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/projects/${p._id}`)}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        #{p.projectId || p._id.substring(p._id.length - 4)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        P-{p.parentProjectId ? (p.parentProjectId._id ? p.parentProjectId._id.slice(-4) : p.parentProjectId.toString().slice(-4)) : '0'}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Globe size={11} />
                          <span>{(p.country && p.country.length > 0) ? p.country.join(', ') : 'United States'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building size={12} className="text-slate-400" />
                          <span className="font-medium">{p.clientId?.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px]">
                        <div>{p.projectManager || 'Admin'}</div>
                        <div className="text-slate-400">{p.salesPerson || 'Sales'}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {p.startDate ? p.startDate.split('T')[0] : 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-slate-700">
                        {p.reqCompletes || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-600">
                        {p.completedCount || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">
                        {p.completedCount || 0}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        0%
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">
                        0
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">
                        {p.ir || 0}%
                      </td>
                      <td className="py-3 px-3 text-center font-medium text-slate-700">
                        {p.loi || 0}m
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          isRunning 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : isTesting
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isRunning ? 'bg-emerald-500' : isTesting ? 'bg-amber-500' : 'bg-slate-400'
                          }`}></span>
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => navigate(`/projects/${p._id}`)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Project"
                        >
                          <Edit3 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modern Pagination Bar */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{filteredProjects.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">{Math.min(currentPage * entriesPerPage, filteredProjects.length)}</span> of{' '}
            <span className="font-semibold text-slate-700">{filteredProjects.length}</span> projects
          </div>

          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft size={15} />
            </button>
            
            <span className="px-3 py-1 font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg">
              {currentPage} / {totalPages}
            </span>

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Projects;
