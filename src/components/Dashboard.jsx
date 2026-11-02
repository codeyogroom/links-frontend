import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  CheckCircle2, XCircle, AlertCircle, ShieldAlert, Ban, 
  Activity, TrendingUp, Layers, Globe, Users, ArrowUpRight
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
const TRAFFIC_COLORS = {
  Redirected: '#3b82f6',
  Completed: '#10b981',
  Rejected: '#ef4444',
  Quotafull: '#f59e0b',
};

const clientCompletesData = [
  { name: 'Asia Monitor', value: 200 },
  { name: 'Simple Junction', value: 40 },
  { name: 'Multinational', value: 10 },
  { name: 'Epitome', value: 5 },
];

const trafficData = [
  { name: 'Asia Monitor', Redirected: 400, Completed: 200, Rejected: 50, Quotafull: 100 },
  { name: 'Simple Junction', Redirected: 100, Completed: 40, Rejected: 200, Quotafull: 300 },
  { name: 'Market Resonance', Redirected: 350, Completed: 50, Rejected: 100, Quotafull: 50 },
  { name: 'Epitome', Redirected: 200, Completed: 50, Rejected: 40, Quotafull: 10 },
  { name: 'Data Xing', Redirected: 450, Completed: 20, Rejected: 10, Quotafull: 5 },
];

const supplierCompletesData = [
  { name: 'Cint', value: 72 },
  { name: 'Toluna', value: 15 },
  { name: 'Dynata', value: 8 },
  { name: 'PureSpectrum', value: 5 },
];

const pmCompletesData = [
  { name: 'Sudhanshu', value: 65 },
  { name: 'Niharika', value: 25 },
  { name: 'Suhasini', value: 10 },
];

function TimeFilters() {
  const [active, setActive] = useState('1 Day');
  return (
    <div className="inline-flex p-1 bg-slate-100 rounded-xl mb-4 text-xs font-semibold">
      {['1 Day', '1 Week', '1 Month', '3 Months'].map(time => (
        <button 
          key={time}
          onClick={() => setActive(time)}
          className={`px-3 py-1 rounded-lg transition-all ${
            active === time 
              ? 'bg-white text-slate-900 shadow-xs font-bold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {time}
        </button>
      ))}
    </div>
  );
}

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
    <div className={`p-4 rounded-xl border ${style.border} ${color === 'slate' ? 'bg-slate-900 text-white' : 'bg-white'} shadow-xs flex items-center justify-between`}>
      <div>
        <span className={`text-[11px] font-semibold uppercase tracking-wider block ${color === 'slate' ? 'text-slate-400' : 'text-slate-500'}`}>
          {label}
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className={`text-2xl font-extrabold tracking-tight ${color === 'slate' ? 'text-white' : 'text-slate-900'}`}>
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
        <span className="text-sm font-bold text-slate-900">{percentage}</span>
      </div>
      <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mb-2">
        <div 
          className={`h-full rounded-full transition-all duration-700 ${colorMap[color].split(' ')[0]}`} 
          style={{ width: percentage }}
        />
      </div>
      <span className="text-[11px] font-mono text-slate-400 font-medium">{ratio}</span>
    </div>
  );
}

function Dashboard() {
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
            Real-time traffic health, respondent completion rates, and supplier distribution.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-700 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Router Active</span>
        </div>
      </div>

      {/* Top Stats Section */}
      <div>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <TrendingUp size={14} className="text-blue-600" />
          Today's Routing Performance
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <ModernStatCard icon={CheckCircle2} value="246" label="Completed" color="green" trend="+12%" />
          <ModernStatCard icon={XCircle} value="844" label="Disqualified" color="yellow" />
          <ModernStatCard icon={AlertCircle} value="138" label="Quota Full" color="purple" />
          <ModernStatCard icon={ShieldAlert} value="627" label="Security Term" color="red" />
          <ModernStatCard icon={Ban} value="132" label="Blocked" color="slate" />
        </div>
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
              <span className="text-2xl font-black text-blue-700 mt-1 block">1,151</span>
            </div>
            <div className="p-3.5 bg-amber-50/60 border border-amber-100 rounded-xl">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">On Hold</span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">7</span>
            </div>
            <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">Awaiting IDs</span>
              <span className="text-2xl font-black text-purple-700 mt-1 block">13</span>
            </div>
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Completed</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">38</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>Closed Archives: <strong className="text-slate-800">325 projects</strong></span>
            <span className="text-emerald-600 font-semibold">99.4% Uptime</span>
          </div>
        </div>

        {/* Monthly Progress Bars */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-indigo-600" />
              Monthly Conversion Ratios
            </h3>
            <span className="text-xs text-slate-500 font-medium">Sample size: 67,031</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ModernProgressBar label="Completed" percentage="3.83%" ratio="2,570 / 67,031" color="emerald" />
            <ModernProgressBar label="Disqualified" percentage="28.94%" ratio="20,120 / 67,031" color="amber" />
            <ModernProgressBar label="Quota Full" percentage="6.22%" ratio="4,170 / 67,031" color="blue" />
            <ModernProgressBar label="Security Terminated" percentage="21.04%" ratio="14,100 / 67,031" color="rose" />
          </div>
        </div>
      </div>

      {/* Country & Client Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Client Completes Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Top Clients by Completes</h3>
            <TimeFilters />
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clientCompletesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'}} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Traffic Analysis */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Client Traffic Distribution</h3>
            <TimeFilters />
          </div>
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} layout="vertical" stackOffset="expand">
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

      {/* Supplier & PM Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Supplier Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              Supplier Completes Share
            </h3>
            <TimeFilters />
          </div>
          <div className="h-64 flex mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={supplierCompletesData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {supplierCompletesData.map((entry, index) => (
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

        {/* PM Completes Donut */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Project Manager Volume</h3>
            <TimeFilters />
          </div>
          <div className="h-64 flex mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pmCompletesData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={60} 
                  outerRadius={85} 
                  paddingAngle={4} 
                  dataKey="value" 
                  stroke="none"
                >
                  {pmCompletesData.map((entry, index) => (
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
