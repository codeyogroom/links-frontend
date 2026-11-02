import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, Save, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

const QUESTION_FIELD_TYPES = [
  'Range',
  'Zone',
  'ZipCode',
  'Dropdown',
  'Radio',
  'Checkbox',
  'MultiSelectDropdown'
];

function ProjectQuota() {
  const { id } = useParams();
  const [quotas, setQuotas] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    quota: '',
    qualificationId: '',
    questionFieldType: 'Range'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quotaRes, qualRes] = await Promise.all([
        api.get(`/admin/projects/${id}/quotas`),
        api.get(`/admin/projects/${id}/qualifications`)
      ]);
      setQuotas(quotaRes.data || []);
      setQualifications(qualRes.data || []);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQualificationChange = (qualId) => {
    const selectedQual = qualifications.find(q => q._id === qualId);
    let fieldType = formData.questionFieldType;
    if (selectedQual && selectedQual.fieldType) {
      fieldType = selectedQual.fieldType;
    }
    setFormData(prev => ({
      ...prev,
      qualificationId: qualId,
      questionFieldType: fieldType
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.quota) {
      return alert('Enter Quota Name and Quota value');
    }
    try {
      const payload = {
        ...formData,
        quota: Number(formData.quota),
        qualificationId: formData.qualificationId || undefined
      };
      await api.post(`/admin/projects/${id}/quotas`, payload);
      setFormData({ name: '', quota: '', qualificationId: '', questionFieldType: 'Range' });
      fetchData();
    } catch(e) {
      console.error(e);
      alert('Failed to save quota');
    }
  };

  const handleDelete = async (quotaId) => {
    if(!window.confirm('Delete quota?')) return;
    try {
      await api.delete(`/admin/quotas/${quotaId}`);
      fetchData();
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 md:p-8">
      {/* Add Quota Form */}
      <div className="mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target size={20} className="text-blue-600" />
            Add Project Quota
          </h2>
          <p className="text-xs text-slate-500 mt-1">Set maximum completion targets per qualification segment or demographic bracket.</p>
        </div>

        <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-5 md:p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Quota Name</label>
              <input 
                type="text" 
                placeholder="e.g. Males 18-34 Target"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Completes Target (N)</label>
              <input 
                type="number" 
                placeholder="e.g. 150"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900" 
                value={formData.quota} 
                onChange={e => setFormData({...formData, quota: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Primary Qualification</label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900" 
                value={formData.qualificationId} 
                onChange={e => handleQualificationChange(e.target.value)}
              >
                <option value="">Please Select</option>
                {qualifications.map(q => (
                  <option key={q._id} value={q._id}>
                    {q.questionName || q.customQuestionName || (q.questionType === 'Age' ? 'What is your age?' : (q.questionType === 'Gender' ? 'What is your gender?' : q.questionType))}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Question Field Type</label>
              <select 
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900 cursor-pointer" 
                value={formData.questionFieldType} 
                onChange={e => setFormData({...formData, questionFieldType: e.target.value})}
              >
                {QUESTION_FIELD_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button 
              onClick={handleSave} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-xl flex items-center text-xs shadow-xs transition"
            >
              <Save size={13} className="mr-1.5" /> Save Quota
            </button>
            <button 
              onClick={() => setFormData({ name: '', quota: '', qualificationId: '', questionFieldType: 'Range' })} 
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Quotas Table */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Configured Quotas</h3>
        {loading ? (
          <div className="py-12"><Loader /></div>
        ) : (
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Quota Name</th>
                  <th className="py-3 px-4">Target Limit</th>
                  <th className="py-3 px-4">Remaining</th>
                  <th className="py-3 px-4">Field Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No quota targets defined yet. Fill the form above to add limits.
                    </td>
                  </tr>
                ) : (
                  quotas.map(q => (
                    <tr key={q._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{q.name}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{q.quota}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{q.quota}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md text-[11px] font-medium border border-slate-200">
                          {q.questionFieldType || 'Range'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => handleDelete(q._id)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                          title="Delete Quota"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectQuota;
