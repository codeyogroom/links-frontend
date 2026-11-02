import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Save, Trash2 } from 'lucide-react';
import api from '../api';
import Loader from './Loader';

function ProjectClientLink() {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, [id]);

  const fetchCodes = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/projects/${id}/client-codes`);
      setCodes(res.data || []);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = () => {
    if (!file) return alert('Please select a file first.');
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        setIsImporting(true);
        const text = e.target.result;
        const rawCodes = text.split(/\r?\n|,/).map(c => c.trim()).filter(Boolean);
        
        if (rawCodes.length === 0) {
          alert('No valid codes found in file');
          setIsImporting(false);
          return;
        }

        await api.post(`/admin/projects/${id}/client-codes/import`, { codes: rawCodes });
        alert(`Successfully imported ${rawCodes.length} client codes.`);
        setFile(null);
        fetchCodes();
      } catch (err) {
        console.error(err);
        alert('Failed to import codes: ' + (err.response?.data?.message || err.message));
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearUnused = async () => {
    if (!window.confirm('Are you sure you want to delete all remaining (unused) client codes?')) return;
    try {
      await api.delete(`/admin/projects/${id}/client-codes/unused`);
      fetchCodes();
    } catch(e) {
      console.error(e);
      alert('Failed to clear unused codes');
    }
  };

  const totalCodes = codes.length;
  const usedCodesList = codes.filter(c => c.isUsed);
  const usedCodes = usedCodesList.length;
  const remainingCodes = totalCodes - usedCodes;

  return (
    <div className="bg-white p-6 rounded shadow-sm min-h-[500px]">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Import Unique Links</h1>

      {/* 3 Metric Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 mb-6 text-center rounded overflow-hidden">
        <div className="bg-[#b3d4df] py-8">
          <h3 className="text-2xl text-gray-800 mb-2 font-normal">Total Client Codes</h3>
          <p className="text-2xl font-bold text-white">{totalCodes}</p>
        </div>
        <div className="bg-[#f86c6b] py-8">
          <h3 className="text-2xl text-gray-800 mb-2 font-normal">Used Client Codes</h3>
          <p className="text-2xl font-bold text-white">{usedCodes}</p>
        </div>
        <div className="bg-[#7ec2a6] py-8 relative">
          <h3 className="text-2xl text-gray-800 mb-2 font-normal">Remaining Client Codes</h3>
          <div className="flex justify-center items-center">
             <span className="text-2xl font-bold text-white mr-1.5">{remainingCodes}</span>
             <Trash2 
               size={16} 
               className="text-red-600 hover:text-red-800 cursor-pointer inline transition" 
               title="Clear unused codes" 
               onClick={handleClearUnused}
             />
          </div>
        </div>
      </div>

      {/* Upload Controls */}
      <div className="mb-6">
        <label className="block text-xs text-gray-600 mb-1.5 font-medium">Select File :</label>
        <div className="flex items-center space-x-2">
          <div className="flex border rounded overflow-hidden shadow-sm bg-white">
            <label className="bg-gray-100 hover:bg-gray-200 px-3.5 py-1.5 border-r cursor-pointer text-xs font-medium text-gray-700 transition">
              Choose file
              <input type="file" accept=".txt,.csv" className="hidden" onChange={handleFileChange} />
            </label>
            <span className="px-3.5 py-1.5 text-xs text-gray-500 bg-white min-w-[180px] flex items-center">
              {file ? file.name : 'No file chosen'}
            </span>
          </div>
          <button 
            onClick={handleImport} 
            disabled={isImporting} 
            className="bg-[#4eb3f7] hover:bg-sky-400 disabled:bg-blue-300 text-white px-4 py-1.5 rounded text-xs font-bold flex items-center shadow-sm transition"
          >
            <Save size={13} className="mr-1.5" /> {isImporting ? 'Importing...' : 'Import'}
          </button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b text-gray-700 bg-white">
                <th className="p-3 border-r font-medium text-gray-600">TTPID</th>
                <th className="p-3 border-r font-medium text-gray-600">Vendor Name</th>
                <th className="p-3 border-r font-medium text-gray-600">Started</th>
                <th className="p-3 border-r font-medium text-gray-600">Completed On</th>
                <th className="p-3 border-r font-medium text-gray-600">PanelList ID</th>
                <th className="p-3 font-medium text-gray-600">Client Code</th>
              </tr>
            </thead>
            <tbody>
              {usedCodesList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-4 text-center font-bold text-gray-900 border-b bg-white">
                    No Client Code is Used
                  </td>
                </tr>
              ) : (
                usedCodesList.map(c => (
                  <tr key={c._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3 border-r text-gray-800">{c.ttpid || '-'}</td>
                    <td className="p-3 border-r text-gray-800">{c.vendorName || '-'}</td>
                    <td className="p-3 border-r text-gray-600">{c.started ? new Date(c.started).toLocaleString() : '-'}</td>
                    <td className="p-3 border-r text-gray-600">{c.completedOn ? new Date(c.completedOn).toLocaleString() : '-'}</td>
                    <td className="p-3 border-r text-gray-800">{c.panelListId || '-'}</td>
                    <td className="p-3 font-mono font-medium text-blue-600">{c.clientCode}</td>
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

export default ProjectClientLink;
