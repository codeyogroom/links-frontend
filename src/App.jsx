import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Loader from './components/Loader';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Companies from './components/Companies';
import Contacts from './components/Contacts';
import ContactTypes from './components/ContactTypes';
import StudyTypes from './components/StudyTypes';
import AddProjectForm from './components/AddProjectForm';
import EditProjectForm from './components/EditProjectForm';
import ProjectTabsLayout from './components/ProjectTabsLayout';
import ProjectQualification from './components/ProjectQualification';
import ProjectQuota from './components/ProjectQuota';
import ProjectSuppliers from './components/ProjectSuppliers';
import ProjectClientLink from './components/ProjectClientLink';
import ProjectReconcile from './components/ProjectReconcile';
import ProjectDownload from './components/ProjectDownload';
import ProjectMapForeignIDs from './components/ProjectMapForeignIDs';
import Login from './components/Login';
import AnalysisReports from './components/AnalysisReports';

function Layout({ children, setAuth }) {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar setAuth={setAuth} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </main>
      <footer className="bg-white/80 backdrop-blur-xs border-t border-slate-200/80 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-2">
            <span>&copy; {new Date().getFullYear()} Talk To Panel Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span>Powered by</span>
            <span className="font-semibold text-slate-700">VeritasInsights Engine</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" title="System operational"></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) return <Loader fullScreen={true} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />
        } />

        <Route path="/*" element={
          isAuthenticated ? (
            <Layout setAuth={setIsAuthenticated}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/add-project" element={<AddProjectForm />} />
                
                {/* Nested Project Routes */}
                <Route path="/projects/:id" element={<ProjectTabsLayout />}>
                  <Route path="edit" element={<EditProjectForm />} />
                  <Route path="qualification" element={<ProjectQualification />} />
                  <Route path="quota" element={<ProjectQuota />} />
                  <Route path="suppliers" element={<ProjectSuppliers />} />
                  <Route path="client-link" element={<ProjectClientLink />} />
                  <Route path="reconcile" element={<ProjectReconcile />} />
                  <Route path="download" element={<ProjectDownload />} />
                  <Route path="map-foreign-ids" element={<ProjectMapForeignIDs />} />
                  <Route index element={<EditProjectForm />} />
                </Route>
                
                <Route path="/study-types" element={<StudyTypes />} />
                <Route path="/companies" element={<Companies />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/contact-types" element={<ContactTypes />} />
                <Route path="/analytics" element={<div className="text-xl font-bold bg-white p-6 rounded shadow">Analysis Logs</div>} />
                <Route path="/analysis/reports" element={<AnalysisReports />} />
                
                {/* Catch all unmatched authenticated routes and send to dashboard */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


