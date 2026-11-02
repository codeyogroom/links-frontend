import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Monitor, Smartphone, Tablet, RefreshCw, FileText, Link as LinkIcon, AlertCircle, PlayCircle, Shield, ShieldAlert, ShieldCheck, CheckSquare, X, Copy, Check, Mail, Activity } from 'lucide-react';
import api from '../api';
import { COUNTRIES } from '../utils/countries';
import { LANGUAGES } from '../utils/languages';

function EditProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Accordion state
  const [openSections, setOpenSections] = useState({
    setup: true, metrics: true, people: true, timeline: true, memo: true, status: true, changeLog: false
  });
  const toggleSection = (sec) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));

  // Form Data State
  const [formData, setFormData] = useState({
    name: '', parentProjectId: '', studyTypeId: '', country: '', language: '',
    surveyLink: '', surveyTestLink: '', cpc: '0.00', vendorMaxCpc: '0.00', invoiceCurrency: 'US Dollar', conversionRate: '1.00',
    surveyFriendlyName: '', pv: '0.00', setupCost: '0.00',
    reqCompletes: '', maxCompletes: '', loi: '0:10', ir: '', pointsToAward: '0',
    supportedDevices: { desktop: true, mobile: true, tablet: true },
    clientId: '', clientContactId: '', projectManager: '', salesPerson: '',
    startDate: '', endDate: '', notes: '', projectBrief: '', status: 'Running'
  });

  // Sidebar Security State
  const [security, setSecurity] = useState({
    validateBlankReferrer: false, validateStartEndIp: true, deviceValidation: false,
    geographicValidation: false, trafficAnonymization: false, threatIntelligence: false,
    botDetection: false, rdeProfanityCheck: false
  });
  const handleSecurityChange = (e) => setSecurity({ ...security, [e.target.name]: e.target.checked });

  // Dropdown options
  const [studyTypes, setStudyTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [allContacts, setAllContacts] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

  // Project Stats State
  const [stats, setStats] = useState({
    totalHits: 0, redirects: 0, blocked: 0, completed: 0, disqualified: 0,
    quotaFull: 0, securityTerminate: 0, epc: 0, cr: 0, ir: 0,
    avgLoi: 0, medianLoi: 0, abandons: 0, lastCompleted: '-'
  });

  // End Pages & Link Codes Modal State
  const [showEndPagesModal, setShowEndPagesModal] = useState(false);
  const [showLinkCodesModal, setShowLinkCodesModal] = useState(false);
  const [showRedirectStatusModal, setShowRedirectStatusModal] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const serverBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');

  const getAuthToken = (statusCode, projId) => {
    let hash = 0;
    const str = `${statusCode}_${projId || ''}_ttp_salt_2026`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return (hex + hex + hex + hex).slice(0, 32);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [stRes, compRes, projRes, contactRes] = await Promise.all([
          api.get('/admin/study-types'),
          api.get('/admin/companies'),
          api.get('/admin/projects'),
          api.get('/admin/contacts').catch(() => ({ data: [] }))
        ]);
        setStudyTypes(stRes.data || []);
        // Only include companies whose type is Client (or Both)
        const clientOnly = (compRes.data || []).filter(c => {
          const t = (c.companyType || '').trim().toLowerCase();
          return t === 'client' || t === 'both' || t.includes('client');
        });
        setClients(clientOnly);
        setAllProjects(projRes.data || []);
        setAllContacts(contactRes?.data || []);
      } catch (e) {
        console.error("Error fetching configs", e);
      }
    };
    fetchConfigs();
  }, []);

  useEffect(() => {
    const fetchProjectAndStats = async () => {
      try {
        const [projRes, statsRes] = await Promise.all([
          api.get(`/admin/projects/${id}`),
          api.get(`/admin/projects/${id}/stats`)
        ]);
        const p = projRes.data;
        // Checkboxes conversion
        const sd = { desktop: false, mobile: false, tablet: false };
        p.supportedDevices?.forEach(d => {
          if (d === 'Desktop') sd.desktop = true;
          if (d === 'Mobile') sd.mobile = true;
          if (d === 'Tablet') sd.tablet = true;
        });
        setFormData({
          name: p.name || '', parentProjectId: p.parentProjectId || '', studyTypeId: p.studyTypeId?._id || p.studyTypeId || '', 
          country: p.country || '', language: p.language || '', surveyLink: p.surveyLink || '', 
          surveyTestLink: p.surveyTestLink || '', cpc: p.cpc || 0, vendorMaxCpc: p.vendorMaxCpc || 0, invoiceCurrency: p.invoiceCurrency || 'US Dollar', 
          conversionRate: p.conversionRate || 1, surveyFriendlyName: p.surveyFriendlyName || '', pv: p.pv || 0, setupCost: p.setupCost || 0,
          reqCompletes: p.reqCompletes || '', maxCompletes: p.maxCompletes || '', 
          loi: p.loi || '', ir: p.ir || '', pointsToAward: p.pointsToAward || 0, supportedDevices: sd, 
          clientId: p.clientId?._id || p.clientId || '', clientContactId: p.clientContactId?._id || p.clientContactId || '', projectManager: p.projectManager || '', 
          salesPerson: p.salesPerson || '', startDate: p.startDate ? p.startDate.split('T')[0] : '', 
          endDate: p.endDate ? p.endDate.split('T')[0] : '', notes: p.notes || '', 
          projectBrief: p.projectBrief || '', status: p.status || 'Running'
        });
        setStats(statsRes.data);
      } catch (e) { console.error("Error fetching project data", e); }
    };
    
    if (id) fetchProjectAndStats();
  }, [id]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleDeviceChange = (device) => setFormData(prev => ({
    ...prev, supportedDevices: { ...prev.supportedDevices, [device]: !prev.supportedDevices[device] }
  }));

  const handleUpdate = async () => {
    try {
      const devices = [];
      if (formData.supportedDevices.desktop) devices.push('Desktop');
      if (formData.supportedDevices.mobile) devices.push('Mobile');
      if (formData.supportedDevices.tablet) devices.push('Tablet');

      const payload = {
          ...formData, supportedDevices: devices,
          studyTypeId: formData.studyTypeId || undefined,
          cpc: formData.cpc !== '' ? Number(formData.cpc) : 0,
          reqCompletes: formData.reqCompletes !== '' ? Number(formData.reqCompletes) : 0,
          ir: formData.ir !== '' ? Number(formData.ir) : 0,
          pointsToAward: formData.pointsToAward !== '' ? Number(formData.pointsToAward) : 0,
          conversionRate: formData.conversionRate !== '' ? Number(formData.conversionRate) : 1,
          clientId: formData.clientId || undefined,
          clientContactId: formData.clientContactId || undefined,
          parentProjectId: formData.parentProjectId || undefined
      };

      await api.put(`/admin/projects/${id}`, payload);
      alert("Project updated successfully");
      navigate('/projects');
    } catch (e) {
      console.error("Error updating project", e);
      alert("Failed to update project.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons Row */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
         <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setShowEndPagesModal(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs transition-all"
            >
              <FileText size={14} className="mr-1.5"/> End Pages
            </button>
            <button 
              onClick={() => setShowLinkCodesModal(true)} 
              className="bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs transition-all"
            >
              <LinkIcon size={14} className="mr-1.5"/> Link Codes
            </button>
            <button 
              onClick={() => setShowRedirectStatusModal(true)} 
              className="bg-slate-700 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs transition-all"
            >
              <AlertCircle size={14} className="mr-1.5"/> Redirect Status ID(s)
            </button>
            <button 
              className="bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center shadow-xs transition-all"
            >
              <Mail size={14} className="mr-1.5"/> RFQ
            </button>
         </div>
         <div className="flex items-center space-x-2 text-xs">
             <span className="font-semibold text-slate-500">True Up Status:</span>
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider text-[11px]">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               {formData.status}
             </span>
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN - ACCORDION FORM */}
        <div className="flex-1 space-y-4">
            
            {/* 1. Setup Requirements */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div 
                className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
                onClick={() => toggleSection('setup')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Setup Requirements
                </span>
                {openSections.setup ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
              {openSections.setup && (
                <div className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Project Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Parent Project</label>
                      <select name="parentProjectId" value={formData.parentProjectId} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Self Parent</option>
                        {allProjects.filter(p => p._id !== id).map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Study Type</label>
                      <select name="studyTypeId" value={formData.studyTypeId} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Please Select</option>
                        {studyTypes.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Country</label>
                      <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Select Country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Language</label>
                      <select name="language" value={formData.language} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                        <option value="">Select Language</option>
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">CPC $</label><input type="number" step="0.01" name="cpc" value={formData.cpc} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Vendor Max CPC $</label><input type="number" step="0.01" name="vendorMaxCpc" value={formData.vendorMaxCpc} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Invoice Currency</label><select name="invoiceCurrency" value={formData.invoiceCurrency} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"><option>US Dollar</option></select></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Conversion Rate</label><input type="number" step="0.01" name="conversionRate" value={formData.conversionRate} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Survey Friendly Name</label><input type="text" name="surveyFriendlyName" value={formData.surveyFriendlyName} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div className="grid grid-cols-2 gap-2">
                        <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">PV $</label><input type="number" step="0.01" name="pv" value={formData.pv} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                        <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Setup Cost $</label><input type="number" step="0.01" name="setupCost" value={formData.setupCost} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Survey Link</label>
                      <textarea name="surveyLink" value={formData.surveyLink} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 h-20 text-[11px] font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"></textarea>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Survey Test Link</label>
                      <textarea name="surveyTestLink" value={formData.surveyTestLink} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-2.5 h-20 text-[11px] font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Expected Metrics & Data */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div 
                className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
                onClick={() => toggleSection('metrics')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Expected Metrics & Data
                </span>
                {openSections.metrics ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
              {openSections.metrics && (
                <div className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Req. Completes :</label><input type="number" name="reqCompletes" value={formData.reqCompletes} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Max. Completes</label><select name="maxCompletes" value={formData.maxCompletes} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"><option>No Max Limit</option></select></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">LOI (Length of Interview)</label><input type="text" name="loi" value={formData.loi} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">IR % (Incidence Rate)</label><input type="number" name="ir" value={formData.ir} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5"># of points to award</label><input type="number" name="pointsToAward" value={formData.pointsToAward} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Supported Devices :</label>
                      <div className="flex items-center space-x-5 pt-1">
                        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                          <input type="checkbox" checked={formData.supportedDevices.desktop} onChange={() => handleDeviceChange('desktop')} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                          <Monitor size={18} className={formData.supportedDevices.desktop ? 'text-blue-600' : 'text-slate-400'} />
                          <span className="text-xs text-slate-700">Desktop</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                          <input type="checkbox" checked={formData.supportedDevices.mobile} onChange={() => handleDeviceChange('mobile')} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                          <Smartphone size={18} className={formData.supportedDevices.mobile ? 'text-blue-600' : 'text-slate-400'} />
                          <span className="text-xs text-slate-700">Mobile</span>
                        </label>
                        <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                          <input type="checkbox" checked={formData.supportedDevices.tablet} onChange={() => handleDeviceChange('tablet')} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                          <Tablet size={18} className={formData.supportedDevices.tablet ? 'text-blue-600' : 'text-slate-400'} />
                          <span className="text-xs text-slate-700">Tablet</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. People */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div 
                className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
                onClick={() => toggleSection('people')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  People & Assignments
                </span>
                {openSections.people ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
              {openSections.people && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Client</label>
                    <select name="clientId" value={formData.clientId} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                      <option value="">Please Select</option>
                      {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Client Contact</label>
                    <select 
                      name="clientContactId" 
                      value={formData.clientContactId} 
                      onChange={handleChange} 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="">Select Client Contact</option>
                      {allContacts
                        .filter(ct => {
                          const cId = ct.companyId?._id || ct.companyId;
                          return !formData.clientId || (cId && cId.toString() === formData.clientId.toString());
                        })
                        .map(ct => (
                          <option key={ct._id} value={ct._id}>
                            {ct.firstName} {ct.lastName} {ct.email ? `(${ct.email})` : ''}
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Project Manager</label><select name="projectManager" value={formData.projectManager} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"><option>Admin TTP</option></select></div>
                  <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Sales Person</label><select name="salesPerson" value={formData.salesPerson} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"><option>Admin TTP</option></select></div>
                </div>
              )}
            </div>

            {/* 4. Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div 
                className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
                onClick={() => toggleSection('timeline')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Timeline
                </span>
                {openSections.timeline ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
              {openSections.timeline && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Start Date</label><input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                  <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">End Date</label><input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" /></div>
                </div>
              )}
            </div>

            {/* 5. Memorandum */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div 
                className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
                onClick={() => toggleSection('memo')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Memorandum & Invoicing Notes
                </span>
                {openSections.memo ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
              {openSections.memo && (
                <div className="p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Notes</label><textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 h-24 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"></textarea></div>
                      <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Project Brief (All Partner)</label><textarea name="projectBrief" value={formData.projectBrief} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl p-3 h-24 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y"></textarea></div>
                    </div>
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-slate-600 font-mono text-[11px] leading-relaxed">
                        Notes For Project Invoicing:<br/>
                        PO: {`{{PO Number}}`}<br/>
                        CID: {`{{CID Number}}`}<br/>
                        Client Email: {`{{Email Address}}`}<br/>
                        Notes: {`{{Notes}}`}
                    </div>
                </div>
              )}
            </div>

            {/* 6. Status */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div 
                className="bg-slate-50/80 px-5 py-3.5 flex justify-between items-center cursor-pointer text-xs font-bold text-slate-800 hover:bg-slate-100/70 transition-colors border-b border-slate-200/80" 
                onClick={() => toggleSection('status')}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Status & Invoicing
                </span>
                {openSections.status ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </div>
              {openSections.status && (
                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Project Status</label><select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"><option>Running</option><option>Closed</option></select></div>
                  <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Invoice Status</label><select className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"><option>Pending</option></select></div>
                  <div><label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Invoice Number</label><input type="text" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-500 cursor-not-allowed" value="0" readOnly /></div>
                </div>
              )}
            </div>
            
            {/* Form Footer Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all">Save Changes</button>
              <button className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all">Clone Project</button>
              <button onClick={() => navigate('/projects')} className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all">Cancel</button>
            </div>

        </div>

        {/* RIGHT COLUMN - SIDEBAR */}
        <div className="w-full lg:w-80 flex flex-col space-y-6">
            
            {/* Security Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="bg-slate-50/80 border-b border-slate-200/80 px-5 py-3.5 text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Shield size={15} className="text-blue-600" />
                  Security Engine Controls
                </div>
                <div className="p-5 text-xs space-y-3.5">
                    <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer">
                      <span>Validate Blank Referrer</span> 
                      <input type="checkbox" name="validateBlankReferrer" checked={security.validateBlankReferrer} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                    </label>
                    <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer">
                      <span>Validate Start/End IP</span> 
                      <input type="checkbox" name="validateStartEndIp" checked={security.validateStartEndIp} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                    </label>
                    
                    <div className="pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-blue-600 font-bold text-xs flex items-center gap-1"><ShieldCheck size={14} /> veritasIdentity</span>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Active</span>
                        </div>
                        
                        <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer mb-2.5">
                          <span>Device Validation</span> 
                          <input type="checkbox" name="deviceValidation" checked={security.deviceValidation} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        </label>
                        <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer mb-2.5">
                          <span>Geographic Validation</span> 
                          <input type="checkbox" name="geographicValidation" checked={security.geographicValidation} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        </label>
                        
                        <div className="mt-3">
                          <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer mb-0.5">
                            <span>Traffic Anonymization</span> 
                            <input type="checkbox" name="trafficAnonymization" checked={security.trafficAnonymization} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                          </label>
                          <p className="text-[10px] text-slate-400">VPN / Proxy Detection</p>
                        </div>
                        
                        <div className="mt-2.5">
                          <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer mb-0.5">
                            <span>Threat Intelligence</span> 
                            <input type="checkbox" name="threatIntelligence" checked={security.threatIntelligence} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                          </label>
                          <p className="text-[10px] text-slate-400">Tor Network, Malicious Actor Detection</p>
                        </div>
                        
                        <div className="mt-2.5">
                          <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer mb-0.5">
                            <span>Bot Detection</span> 
                            <input type="checkbox" name="botDetection" checked={security.botDetection} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                          </label>
                          <p className="text-[10px] text-slate-400">Automated Traffic Interception</p>
                        </div>

                        <label className="flex justify-between items-center text-slate-700 font-medium cursor-pointer mt-3 pt-3 border-t border-slate-100">
                          <span>RDE / Profanity Check</span> 
                          <input type="checkbox" name="rdeProfanityCheck" checked={security.rdeProfanityCheck} onChange={handleSecurityChange} className="rounded border-slate-300 text-blue-600 focus:ring-0" />
                        </label>
                    </div>
                </div>
            </div>

            {/* Statistics Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="bg-slate-50/80 border-b border-slate-200/80 px-5 py-3.5 font-bold text-slate-800 text-xs flex items-center gap-2">
                <Activity size={15} className="text-blue-600" />
                Live Session Telemetry
              </div>
              <div className="p-5 text-center text-xs">
                
                {/* Row 1 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Hits</p>
                    <p className="text-lg font-bold text-slate-900">{stats.totalHits}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Redirects</p>
                    <p className="text-lg font-bold text-blue-600">{stats.redirects}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Blocked</p>
                    <p className="text-lg font-bold text-rose-600">{stats.blocked}</p>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">Completed</p>
                    <p className="text-lg font-bold text-emerald-700">{stats.completed}</p>
                  </div>
                  <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                    <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider mb-1">Disqualified</p>
                    <p className="text-lg font-bold text-amber-700">{stats.disqualified}</p>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Quota Full</p>
                    <p className="text-base font-bold text-slate-800">{stats.quotaFull}</p>
                  </div>
                  <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                    <p className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider mb-1">Security Term</p>
                    <p className="text-base font-bold text-rose-700">{stats.securityTerminate}</p>
                  </div>
                </div>

                <div className="my-3 border-t border-slate-100" />

                {/* Row 4 */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">EPC</p>
                    <p className="text-sm font-bold text-slate-800">${stats.epc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">CR</p>
                    <p className="text-sm font-bold text-slate-800">{stats.cr}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">IR</p>
                    <p className="text-sm font-bold text-slate-800">{stats.ir}%</p>
                  </div>
                </div>

                <div className="my-3 border-t border-slate-100" />

                <div className="text-left pt-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Last Activity</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{stats.lastCompleted}</p>
                </div>

              </div>
            </div>

        </div>

      </div>

            {/* End Pages Modal */}
      {showEndPagesModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200/80">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Redirect End Pages & Variables</h3>
              <button 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition" 
                onClick={() => setShowEndPagesModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs">
              {/* Section 1: End Links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">End Links</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-emerald-600 block mb-1">Complete:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('1', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('1', id)}`, 'c1')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'c1' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-rose-600 block mb-1">Terminate:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('2', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('2', id)}`, 'c2')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'c2' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-amber-600 block mb-1">Quota Full:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('3', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('3', id)}`, 'c3')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'c3' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-rose-700 block mb-1">Security Term:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('4', id)}`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&authToken=${getAuthToken('4', id)}`, 'c4')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'c4' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: S2S Postback Link */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">S2S Postback Link</h4>
                <div>
                  <span className="font-semibold text-emerald-600 block mb-1">S2S Postback Link:</span>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                    <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                      {`${serverBaseUrl}/redirect-postback/?pid=[[TTPID]]&status_id=[[status]]`}
                    </code>
                    <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-postback/?pid=[[TTPID]]&status_id=[[status]]`, 's2s')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                      {copiedKey === 's2s' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Static Links */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">Static Links</h4>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold text-emerald-600 block mb-1">Complete:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=1&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=1&pid=[[TTPID]]`, 'st1')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'st1' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-rose-600 block mb-1">Terminate:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=2&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=2&pid=[[TTPID]]`, 'st2')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'st2' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-amber-600 block mb-1">Quota Full:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=3&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=3&pid=[[TTPID]]`, 'st3')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'st3' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-rose-700 block mb-1">Security Term:</span>
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                      <code className="text-slate-800 break-all select-all font-mono text-[11px]">
                        {`${serverBaseUrl}/redirect-process/?supp_code=55&status=4&pid=[[TTPID]]`}
                      </code>
                      <button onClick={() => copyToClipboard(`${serverBaseUrl}/redirect-process/?supp_code=55&status=4&pid=[[TTPID]]`, 'st4')} className="ml-2 p-1 text-slate-400 hover:text-blue-600 rounded">
                        {copiedKey === 'st4' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowEndPagesModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Codes Modal */}
      {showLinkCodesModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200/80">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Redirect End Pages & Variables</h3>
              <button 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition" 
                onClick={() => setShowLinkCodesModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              {/* Left Column: Client Link Variable */}
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Client Link Variable</h4>
                <p className="text-slate-500 mb-2 leading-relaxed text-[11px]">
                  These variables shall be used only in client survey link. The values will be replaced in begin pages and passed to client survey URL.
                </p>
                <p className="font-semibold text-rose-500 mb-4 text-[11px]">
                  * Variables are case sensitive
                </p>

                <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 w-1/3 bg-slate-50/50">ClientCode</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{CLIENTKEY}}`}</span>
                          <button onClick={() => copyToClipboard('{{CLIENTKEY}}', 'lc1')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc1' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">ID</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{ID}}`}</span>
                          <button onClick={() => copyToClipboard('{{ID}}', 'lc2')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc2' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">Ext</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{PASSTHRU}}`}</span>
                          <button onClick={() => copyToClipboard('{{PASSTHRU}}', 'lc3')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc3' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">Re Connect ID</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{RECONNECTID}}`}</span>
                          <button onClick={() => copyToClipboard('{{RECONNECTID}}', 'lc4')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc4' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">Zip</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{Zip}}`}</span>
                          <button onClick={() => copyToClipboard('{{Zip}}', 'lc5')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc5' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">Age</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{Age}}`}</span>
                          <button onClick={() => copyToClipboard('{{Age}}', 'lc6')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc6' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">Gender</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{Gender}}`}</span>
                          <button onClick={() => copyToClipboard('{{Gender}}', 'lc7')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc7' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">authToken</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{authToken}}`}</span>
                          <button onClick={() => copyToClipboard('{{authToken}}', 'lc8')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lc8' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Vendor Link Variable */}
              <div>
                <h4 className="text-base font-bold text-slate-900 mb-1.5">Vendor Link Variable</h4>
                <p className="text-slate-500 mb-2 leading-relaxed text-[11px]">
                  These variables shall be used only with vendor endpages. Values are substituted dynamically upon redirect.
                </p>
                <p className="font-semibold text-rose-500 mb-4 text-[11px]">
                  * Variables are case sensitive
                </p>

                <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                  <table className="w-full text-left border-collapse text-xs">
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 w-1/3 bg-slate-50/50">Ext</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{PASSTHRU}}`}</span>
                          <button onClick={() => copyToClipboard('{{PASSTHRU}}', 'lv1')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lv1' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">Re Connect ID</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{RECONNECTID}}`}</span>
                          <button onClick={() => copyToClipboard('{{RECONNECTID}}', 'lv2')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lv2' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-semibold text-slate-800 bg-slate-50/50">Panellist ID</td>
                        <td className="p-2.5 text-slate-800 font-mono flex items-center justify-between">
                          <span>{`{{panellist_id}}`}</span>
                          <button onClick={() => copyToClipboard('{{panellist_id}}', 'lv3')} className="text-slate-400 hover:text-blue-600 p-1">
                            {copiedKey === 'lv3' ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowLinkCodesModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redirect Status ID(s) Modal */}
      {showRedirectStatusModal && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200/80">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Redirect Status ID(s)</h3>
              <button 
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition" 
                onClick={() => setShowRedirectStatusModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 text-xs text-slate-700 space-y-2 font-medium divide-y divide-slate-100">
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-blue-600 font-bold">6</span> <span>Completed</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-amber-600 font-bold">7</span> <span>Disqualified</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-purple-600 font-bold">8</span> <span>Quota FULL</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-blue-500 font-bold">9</span> <span>Redirected</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-rose-600 font-bold">10</span> <span>Rejected - Failed SECURITY</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-rose-600 font-bold">11</span> <span>Rejected - Inconsistency</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-rose-600 font-bold">12</span> <span>Rejected - Poor OPEN ENDS</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-rose-600 font-bold">13</span> <span>Rejected - Quality issues</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-rose-600 font-bold">14</span> <span>Rejected - Speeding</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-rose-600 font-bold">31</span> <span>Rejected - Blank Referrer</span></div>
              <div className="pt-1.5 flex justify-between"><span className="font-mono text-rose-600 font-bold">32</span> <span>Rejected - IP Mismatch</span></div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowRedirectStatusModal(false)}
                className="bg-slate-700 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2 rounded-xl shadow-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EditProjectForm;

