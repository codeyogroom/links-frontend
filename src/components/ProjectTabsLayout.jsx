import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams, Link } from 'react-router-dom';
import { 
  RefreshCw, Sliders, CheckSquare, Target, Users, Link2, GitCompare, 
  Download, KeyRound, ArrowLeft, Activity, ShieldCheck
} from 'lucide-react';
import api from '../api';
import Loader from './Loader';

function ProjectTabsLayout() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/admin/projects/${id}`);
      setProject(res.data);
    } catch (e) {
      console.error("Error fetching project", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id && id.length === 24) {
      setLoading(true);
      fetchProject();
    }
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProject();
  };

  const tabs = [
    { name: 'Project', path: 'edit', icon: Sliders },
    { name: 'Qualification', path: 'qualification', icon: CheckSquare },
    { name: 'Project Quota', path: 'quota', icon: Target },
    { name: 'Suppliers', path: 'suppliers', icon: Users },
    { name: 'Client Link', path: 'client-link', icon: Link2 },
    { name: 'Reconcile', path: 'reconcile', icon: GitCompare },
    { name: 'Download', path: 'download', icon: Download },
    { name: 'Map Foreign IDs', path: 'map-foreign-ids', icon: KeyRound }
  ];

  const parentIdDisplay = project?.parentProjectId 
    ? (project.parentProjectId._id ? project.parentProjectId._id.slice(-4) : project.parentProjectId.toString().slice(-4)) 
    : '0';

  return (
    <div className="space-y-6">
      
      {/* Modern Project Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 md:p-6 transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start md:items-center space-x-3.5">
            <Link 
              to="/projects"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors border border-slate-200/80"
              title="Back to Projects"
            >
              <ArrowLeft size={16} />
            </Link>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200/70">
                  #{project?.projectId || id?.slice(-4)}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                  P-{parentIdDisplay}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {project?.status || 'Active'}
                </span>
                {project?.studyTypeId?.name && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                    {project.studyTypeId.name}
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                {project?.name || 'Loading Project...'}
              </h1>
            </div>
          </div>

          {/* Quick Info & Refresh */}
          <div className="flex items-center space-x-3 self-end md:self-center">
            {project?.cpc && (
              <div className="text-right hidden sm:block pr-3 border-r border-slate-200">
                <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Client CPC</div>
                <div className="text-sm font-bold text-slate-900">${Number(project.cpc).toFixed(2)}</div>
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200/80 transition-all shadow-xs"
              title="Refresh project details"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-blue-600' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1 min-w-max">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.name}
                to={`/projects/${id}/${tab.path}`}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <Icon size={14} className="opacity-80" />
                <span>{tab.name}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="transition-all">
        {loading ? <Loader fullScreen={false} /> : <Outlet context={{ project, setProject, refreshProject: fetchProject }} />}
      </div>

    </div>
  );
}

export default ProjectTabsLayout;
