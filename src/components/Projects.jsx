import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Loader from './Loader';
import { Edit, ChevronLeft, ChevronRight } from 'lucide-react';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projRes = await api.get('/admin/projects');
      setProjects(projRes.data);
      setLoading(false);
    } catch(err) { console.error(err); setLoading(false); }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Project</h2>
        <button onClick={() => navigate('/add-project')} className="bg-gray-800 text-white px-3 py-1.5 text-sm rounded shadow-sm hover:bg-gray-700">
          + Add New Project
        </button>
      </div>

      {/* Advanced Filter Header */}
      <div className="grid grid-cols-6 gap-3 mb-4">
        <input className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="ID" />
        <input className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="Parent" />
        <input className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="From CPC" />
        <input className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="To CPC" />
        <input className="border border-gray-300 rounded px-2 py-1 text-sm" placeholder="Project Name" />
        <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-500"><option>Study Type</option></select>
        <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-500"><option>Status</option></select>
        <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-500"><option>Country</option></select>
        <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-500"><option>Client</option></select>
        <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-500"><option>Project Manager</option></select>
        <select className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-500"><option>Sales Person</option></select>
        <div className="flex space-x-2">
            <button className="bg-blue-500 text-white px-3 py-1 text-sm rounded">Submit</button>
            <button className="bg-gray-100 border border-gray-300 text-gray-700 px-3 py-1 text-sm rounded">Reset</button>
        </div>
      </div>

      {/* Show entries */}
      <div className="flex items-center mb-3">
        <span className="text-sm text-gray-600 mr-2">entries per page</span>
        <select className="border rounded px-2 py-1 text-sm"><option>25</option></select>
      </div>

      {/* Data Table */}
      {loading ? <Loader /> : <div className="overflow-x-auto border rounded">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-gray-100 border-b text-gray-600">
            <tr>
              <th className="p-2 font-semibold">Id</th>
              <th className="p-2 font-semibold">Parent</th>
              <th className="p-2 font-semibold">Name</th>
              <th className="p-2 font-semibold">Company</th>
              <th className="p-2 font-semibold">PM/SM</th>
              <th className="p-2 font-semibold">Start Date</th>
              <th className="p-2 font-semibold">N</th>
              <th className="p-2 font-semibold">Hits</th>
              <th className="p-2 font-semibold">Comp.</th>
              <th className="p-2 font-semibold">Drop</th>
              <th className="p-2 font-semibold">QF</th>
              <th className="p-2 font-semibold">IR%</th>
              <th className="p-2 font-semibold">LOI</th>
              <th className="p-2 font-semibold">Status</th>
              <th className="p-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr><td colSpan="15" className="p-4 text-center text-gray-500">No data available in table</td></tr>
            ) : projects.map(p => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td className="p-2" title={p._id}>{p._id.substring(p._id.length - 4)}</td>
                <td className="p-2 text-center">{p.parentProjectId ? p.parentProjectId.substring(p.parentProjectId.length - 4) : '0'}</td>
                <td className="p-2 text-blue-600 cursor-pointer" onClick={() => navigate(`/projects/${p._id}`)}>{p.name}<br/><span className="text-gray-500 text-[10px]">{(p.country && p.country.length > 0) ? p.country.join(', ') : 'United States'}</span></td>
                <td className="p-2">{p.clientId?.name || 'N/A'}</td>
                <td className="p-2">{p.projectManager || 'Admin'} /<br/>{p.salesPerson || 'Sales'}</td>
                <td className="p-2">{p.startDate ? p.startDate.split('T')[0] : 'N/A'}</td>
                <td className="p-2">{p.reqCompletes}</td>
                <td className="p-2 font-semibold text-orange-500">{p.completedCount || 0}</td>
                <td className="p-2">{p.completedCount || 0}</td>
                <td className="p-2">0%</td>
                <td className="p-2">0</td>
                <td className="p-2">{p.ir}%</td>
                <td className="p-2">{p.loi}</td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-[11px] font-bold ${p.status === 'Running' || p.status === 'Select Status' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {p.status === 'Select Status' ? 'Running' : (p.status || 'Running')}
                  </span>
                </td>
                <td className="p-2">
                  <button 
                    onClick={() => navigate(`/projects/${p._id}`)}
                    className="flex items-center text-blue-500 hover:text-blue-700 px-2 py-1 rounded text-xs transition-colors"
                  >
                    <Edit size={14} className="mr-1"/> 
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>}

      <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
        <span>Showing 1 to {projects.length || 0} of {projects.length || 0} entries</span>
        <div className="flex space-x-1">
           <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border flex items-center text-gray-600"><ChevronLeft size={14} /></button>
           <button className="px-2.5 py-1 bg-blue-500 text-white rounded border font-medium">1</button>
           <button className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded border flex items-center text-gray-600"><ChevronRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

export default Projects;


