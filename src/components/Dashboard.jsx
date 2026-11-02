import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CheckCircle2, XCircle, AlertCircle, ShieldAlert, Ban, 
  Activity, TrendingUp, Layers, Globe, Users, ArrowUpRight, RefreshCw
} from 'lucide-react';
import api from '../api';
import Loader from './Loader';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
const TRAFFIC_COLORS = {
  Redirected: '#3b82f6',
  Completed: '#10b981',
  Rejected: '#ef4444',
  Quotafull: '#f59e0b',
};

function ModernStatCard({ icon: Icon, value, label, color, trend }) {
  const colors = {
    green: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
    purple: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
    red: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
    slate: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-800' }
  };

  const style = colors[color] || colors.green;

  return (
    <div className={`p-4 rounded-xl border ${style.border} ${color === 'slate' ? 'bg-slate-900 text-white' : 'bg-white'} shadow-xs flex items-center justify-between transition-all hover:shadow-sm`}>
      <div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider block ${color === 'slate' ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-2xl font-extrabold tracking-tight font-mono ${color === 'slate' ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </span>
          {trend && (
            <span className="text-[11px] font-medium text-emerald-600 flex items-center">
              <ArrowUpRight size={12} /> {trend}
            </span>
          )}
        </div>
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.text}`}>
        <Icon size={20} />
      </div>
    </div>
  );
}

function ModernProgressBar({ label, percentage, ratio, color }) {
  const colorMap = {
    emerald: 'bg-emerald-500 text-emerald-700',
    amber: 'bg-amber-500 text-amber-700',
    blue: 'bg-blue-500 text-blue-700',
    rose: 'bg-rose-500 text-rose-700'
  };

  return (
    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-xs font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-bold text-slate-900 font-mono">{percentage}</span>
      </div>
      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-700 ${colorMap[color].split(' ')[0]}`} 
          style={{ width: percentage === '0%' ? '2%' : percentage }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-400 font-medium">{ratio}</span>
    </div>
  );
}

function Dashboard() {
  const [timeframe, setTimeframe] = useState('1 Day');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchStats = async (selectedTimeframe = timeframe) => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/dashboard?timeframe=${encodeURIComponent(selectedTimeframe)}`);
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(timeframe);
  }, [timeframe]);

  const handleTimeframeChange = (newTime) => {
    setTimeframe(newTime);
  };

  // Metrics fallbacks
  const today = dashboardData?.today || { completed: 0, disqualified: 0, quotaFull: 0, securityTerm: 0, blocked: 0 };
  const allTime = dashboardData?.allTime || { completed: 0, disqualified: 0, quotaFull: 0, securityTerm: 0, blocked: 0 };
  
  // Use today if non-zero, otherwise show all-time with indicator
  const displayStats = (today.completed || today.disqualified || today.quotaFull || today.securityTerm) > 0 ? today : allTime;
  const isAllTimeFallback = (today.completed || today.disqualified || today.quotaFull || today.securityTerm) === 0;

  const projectMatrix = dashboardData?.projectMatrix || { running: 0, onHold: 0, awaitingIds: 0, completed: 0, archived: 0, total: 0 };
  const conversionRatios = dashboardData?.conversionRatios || {
    sampleSize: 0,
    completed: { count: 0, percentage: '0%' },
    disqualified: { count: 0, percentage: '0%' },
    quotaFull: { count: 0, percentage: '0%' },
    securityTerminated: { count: 0, percentage: '0%' }
  };

  const clientCompletes = dashboardData?.clientCompletes || [];
  const clientTraffic = dashboardData?.clientTraffic || [];
  const supplierShare = dashboardData?.supplierShare || [];
  const pmVolume = dashboardData?.pmVolume || [];

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Activity className="text-blue-600" size={24} />
            Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time traffic health, respondent completion rates, and dynamic supplier distribution.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button 
            onClick={() => fetchStats(timeframe)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            title="Refresh Analytics"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Router Active</span>
          </div>
        </div>
      </div>

      {/* Timeframe Filter Bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <TrendingUp size={14} className="text-blue-600" />
          Routing Telemetry {isAllTimeFallback ? '(All-Time Activity)' : `(${timeframe})`}
        </h2>
        
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          {['1 Day', '1 Week', '1 Month', '3 Months'].map(time => (
            <button 
              key={time}
              onClick={() => handleTimeframeChange(time)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeframe === time 
                  ? 'bg-white text-slate-900 shadow-xs font-bold' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Top 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <ModernStatCard icon={CheckCircle2} value={displayStats.completed} label="Completed" color="green" trend={displayStats.completed > 0 ? '+Active' : null} />
        <ModernStatCard icon={XCircle} value={displayStats.disqualified} label="Disqualified" color="yellow" />
        <ModernStatCard icon={AlertCircle} value={displayStats.quotaFull} label="Quota Full" color="purple" />
        <ModernStatCard icon={ShieldAlert} value={displayStats.securityTerm} label="Security Term" color="red" />
        <ModernStatCard icon={Ban} value={displayStats.blocked} label="Blocked" color="slate" />
      </div>

      {/* Status Summary & Monthly Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Counters */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            Project Status Matrix
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">Running</span>
              <span className="text-2xl font-black text-blue-700 mt-1 block font-mono">{projectMatrix.running}</span>
            </div>
            <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">On Hold</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block font-mono">{projectMatrix.onHold}</span>
            </div>
            <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Awaiting IDs</span>
              <span className="text-2xl font-black text-purple-700 mt-1 block font-mono">{projectMatrix.awaitingIds}</span>
            </div>
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Completed</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">{projectMatrix.completed}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Closed Archives: <strong className="text-slate-800">{projectMatrix.archived} projects</strong></span>
            <span className="text-slate-700 font-semibold">Total: {projectMatrix.total}</span>
          </div>
        </div>

        {/* Monthly Progress Bars */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-indigo-600" />
              Live Conversion Ratios
            </h3>
            <span className="text-xs text-slate-500 font-medium">Sample size: <strong className="text-slate-800 font-mono">{conversionRatios.sampleSize}</strong></span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernProgressBar label="Completed" percentage={conversionRatios.completed.percentage} ratio={`${conversionRatios.completed.count} / ${conversionRatios.sampleSize}`} color="emerald" />
            <ModernProgressBar label="Disqualified" percentage={conversionRatios.disqualified.percentage} ratio={`${conversionRatios.disqualified.count} / ${conversionRatios.sampleSize}`} color="amber" />
            <ModernProgressBar label="Quota Full" percentage={conversionRatios.quotaFull.percentage} ratio={`${conversionRatios.quotaFull.count} / ${conversionRatios.sampleSize}`} color="blue" />
            <ModernProgressBar label="Security Terminated" percentage={conversionRatios.securityTerminated.percentage} ratio={`${conversionRatios.securityTerminated.count} / ${conversionRatios.sampleSize}`} color="rose" />
          </div>
        </div>
      </div>

      {/* Dynamic Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dynamic Top Clients Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Top Clients by Completes</h3>
            <span className="text-[11px] text-slate-400 font-medium">Live Database Aggregate</span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientCompletes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}} 
                />
                <Bar dataKey="value" name="Completes" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Client Traffic Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Client Traffic Distribution</h3>
            <span className="text-[11px] text-slate-400 font-medium">Grouped by Outcomes</span>
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientTraffic} layout="vertical" stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{fontSize: 11, fill: '#64748b'}} width={110} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Redirected" stackId="a" fill={TRAFFIC_COLORS.Redirected} radius={[4, 0, 0, 4]} />
                <Bar dataKey="Completed" stackId="a" fill={TRAFFIC_COLORS.Completed} />
                <Bar dataKey="Rejected" stackId="a" fill={TRAFFIC_COLORS.Rejected} />
                <Bar dataKey="Quotafull" stackId="a" fill={TRAFFIC_COLORS.Quotafull} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Dynamic Supplier & PM Share */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Dynamic Supplier Share Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              Supplier Completes Share
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">By Vendor</span>
          </div>
          <div className="h-64 flex mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={supplierShare} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {supplierShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}} 
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic PM Volume Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Project Manager Volume</h3>
            <span className="text-[11px] text-slate-400 font-medium">By PM Lead</span>
          </div>
          <div className="h-64 flex mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pmVolume} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {pmVolume.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}} 
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
