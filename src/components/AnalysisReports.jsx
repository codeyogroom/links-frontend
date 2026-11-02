import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, XCircle, AlertCircle, ShieldAlert, Search, Calendar, Filter } from 'lucide-react';

function AnalysisReports() {
  const [activeTab, setActiveTab] = useState('summary');
  
  const stats = {
    completes: 51,
    disqualified: 554,
    quotaFull: 87,
    securityTerm: 760,
    blocked: 497,
    running: 862,
    onHold: 8,
    awaiting: 14,
    completedProjects: 36,
    closed: 288
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="text-blue-600" size={24} />
            Reports Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cross-sectional delivery summaries, partner performance, and throughput audits.</p>
        </div>

        {/* Reports Toggle Bar */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button 
            onClick={() => setActiveTab('summary')} 
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'summary' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Summary Reports
          </button>
          <button 
            onClick={() => setActiveTab('detailed')} 
            className={`px-4 py-1.5 rounded-lg transition-all ${
              activeTab === 'detailed' 
                ? 'bg-white text-slate-900 shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detailed Reports
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
        
        {/* Filters Area */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 mb-6">
          <div className="relative">
            <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56">
              <option>Client Performance Report</option>
              <option>Supplier Performance Report</option>
              <option>Project Throughput Summary</option>
            </select>
          </div>
          
          <div className="relative">
            <select className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-36">
              <option>For Year 2026</option>
              <option>For Year 2025</option>
            </select>
          </div>

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition">
            Generate Report
          </button>
        </div>

        {activeTab === 'summary' ? (
          <div className="space-y-8">
            
            {/* Metric Cards */}
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Today's Traffic Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 block">Completed</span>
                    <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">{stats.completes}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={20} />
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block">Disqualified</span>
                    <span className="text-2xl font-black text-amber-700 mt-1 block font-mono">{stats.disqualified}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                    <XCircle size={20} />
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-200/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 block">Quota Full</span>
                    <span className="text-2xl font-black text-blue-700 mt-1 block font-mono">{stats.quotaFull}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <AlertCircle size={20} />
                  </div>
                </div>

                <div className="bg-rose-50/50 border border-rose-200/60 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 block">Security Term</span>
                    <span className="text-2xl font-black text-rose-700 mt-1 block font-mono">{stats.securityTerm}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <ShieldAlert size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Ranking Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* PM Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 font-bold text-xs text-slate-800">
                  Top 10 Project Managers
                </div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Sudhanshu Kumar</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-blue-600">39</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Niharika Tiwari</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-blue-600">12</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sales Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 font-bold text-xs text-slate-800">
                  Top 10 Sales Managers
                </div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Sales TTP</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-emerald-600">51</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Clients Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 font-bold text-xs text-slate-800">
                  Top 10 Clients by Completes
                </div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Epitome</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-900">25</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Asia Monitor</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-900">17</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Data Xing</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-900">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Vendors Table */}
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-200/80 font-bold text-xs text-slate-800">
                  Top 10 Suppliers by Volume
                </div>
                <table className="w-full text-left text-xs">
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Fantasy</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-900">17</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Internal Company</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-900">10</td>
                    </tr>
                    <tr className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-5 font-medium text-slate-800">Yahu</td>
                      <td className="py-2.5 px-5 text-right font-mono font-bold text-slate-900">8</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <Filter size={32} className="mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-slate-700 text-sm">Detailed Breakdown Ready</p>
            <p className="text-slate-400 mt-1">Select an audit query above to display individual respondent timestamps and telemetry logs.</p>
          </div>
        )}

      </div>

    </div>
  );
}

export default AnalysisReports;
