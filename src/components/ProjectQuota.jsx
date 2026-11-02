import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Trash2, Save } from 'lucide-react';
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
    <div className="bg-white p-6 rounded shadow-sm">
      {/* Add Quota Form */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Quota</h2>
        <div className="border-b pb-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-medium">Quota Name</label>
              <input 
                type="text" 
                placeholder="Quota Name"
                className="w-full border p-2.5 rounded text-sm focus:outline-none focus:border-blue-500" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-medium">Quota</label>
              <input 
                type="number" 
                placeholder="Quota"
                className="w-full border p-2.5 rounded text-sm focus:outline-none focus:border-blue-500" 
                value={formData.quota} 
                onChange={e => setFormData({...formData, quota: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1 font-medium">Primary Qualification</label>
              <select 
                className="w-full border p-2.5 rounded text-sm focus:outline-none focus:border-blue-500 bg-white" 
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
              <label className="block text-sm text-gray-600 mb-1 font-medium">Question Field Type</label>
              <select 
                className="w-full border p-2.5 rounded text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer" 
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

          <div className="flex space-x-3">
            <button 
              onClick={handleSave} 
              className="bg-[#4b8df8] hover:bg-blue-600 text-white font-bold px-5 py-2 rounded flex items-center text-xs shadow transition"
            >
              <Save size={14} className="mr-1.5" /> Save
            </button>
            <button 
              onClick={() => setFormData({ name: '', quota: '', qualificationId: '', questionFieldType: 'Range' })} 
              className="px-5 py-2 text-red-500 border border-red-300 rounded font-bold hover:bg-red-50 text-xs shadow-sm transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Quotas Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b text-gray-700 bg-gray-50">
                <th className="p-3.5 font-semibold">Quota Name</th>
                <th className="p-3.5 font-semibold">Quota</th>
                <th className="p-3.5 font-semibold">Total Remaining</th>
                <th className="p-3.5 font-semibold">Field Type</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-red-500 bg-[#f9f9f9]">
                    No quota added
                  </td>
                </tr>
              ) : (
                quotas.map(q => (
                  <tr key={q._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3.5 font-medium text-gray-900">{q.name}</td>
                    <td className="p-3.5">{q.quota}</td>
                    <td className="p-3.5">{q.quota}</td>
                    <td className="p-3.5 text-blue-600 font-medium">{q.questionFieldType || 'Range'}</td>
                    <td className="p-3.5 text-green-600 font-bold">Active</td>
                    <td className="p-3.5 text-right">
                      <button 
                        onClick={() => handleDelete(q._id)} 
                        className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded transition"
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
  );
}

export default ProjectQuota;
