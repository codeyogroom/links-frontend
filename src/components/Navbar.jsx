import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown, ChevronUp, Layers, Building2, BarChart3, LayoutDashboard } from 'lucide-react';

function Navbar({ setAuth }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (setAuth) {
      setAuth(false);
    }
    navigate('/login');
  };

  const toggleDropdown = (name) => {
    if (mobileDropdown === name) setMobileDropdown('');
    else setMobileDropdown(name);
  };

  const isProjectsActive = location.pathname.startsWith('/projects') || location.pathname.startsWith('/study-types');
  const isCompanyActive = location.pathname.startsWith('/companies') || location.pathname.startsWith('/contacts') || location.pathname.startsWith('/contact-types');
  const isAnalysisActive = location.pathname.startsWith('/analysis');

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6 lg:space-x-8">
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-xl focus:outline-none transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 cursor-pointer group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <div className="flex space-x-0.5">
                  <span className="w-1.5 h-3 bg-white rounded-full"></span>
                  <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span>
                  <span className="w-1.5 h-2 bg-emerald-400 rounded-full"></span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-slate-900">Talk To Panel</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => 
                  `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                <LayoutDashboard size={14} className="opacity-70" />
                Dashboard
              </NavLink>
              
              {/* Projects Dropdown */}
              <div className="relative group py-2">
                <button 
                  className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isProjectsActive 
                      ? 'bg-blue-50 text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Layers size={14} className="mr-1.5 opacity-70" />
                  Projects 
                  <ChevronDown size={13} className="ml-1 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 z-50 hidden w-48 pt-1 group-hover:block transition-all duration-150">
                  <div className="bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-900/5 p-1.5 ring-1 ring-slate-900/5">
                    <Link to="/projects" className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                      Projects List
                    </Link>
                    <Link to="/study-types" className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                      Study Types
                    </Link>
                  </div>
                </div>
              </div>

              {/* Company Dropdown */}
              <div className="relative group py-2">
                <button 
                  className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isCompanyActive 
                      ? 'bg-blue-50 text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Building2 size={14} className="mr-1.5 opacity-70" />
                  Company 
                  <ChevronDown size={13} className="ml-1 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 z-50 hidden w-48 pt-1 group-hover:block transition-all duration-150">
                  <div className="bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-900/5 p-1.5 ring-1 ring-slate-900/5">
                    <Link to="/companies" className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                      Companies
                    </Link>
                    <Link to="/contacts" className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                      Contacts
                    </Link>
                    <Link to="/contact-types" className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                      Contact Types
                    </Link>
                  </div>
                </div>
              </div>

              {/* Analysis Dropdown (Reports Only) */}
              <div className="relative group py-2">
                <button 
                  className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isAnalysisActive 
                      ? 'bg-blue-50 text-blue-700 shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <BarChart3 size={14} className="mr-1.5 opacity-70" />
                  Analysis 
                  <ChevronDown size={13} className="ml-1 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:rotate-180" />
                </button>
                <div className="absolute left-0 z-50 hidden w-44 pt-1 group-hover:block transition-all duration-150">
                  <div className="bg-white border border-slate-200/80 rounded-xl shadow-xl shadow-slate-900/5 p-1.5 ring-1 ring-slate-900/5">
                    <Link to="/analysis/reports" className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors">
                      Reports
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 pl-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-xs">
                  A
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 leading-tight">Admin TTP</span>
                <span className="text-[10px] text-slate-500 leading-tight">Super Administrator</span>
              </div>
            </div>
            
            <div className="h-5 w-px bg-slate-200 hidden sm:block mx-1"></div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-xs"
              title="Sign out of console"
            >
              <LogOut size={13} className="mr-1.5 opacity-80" /> 
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-xl absolute w-full left-0 z-40">
          <div className="px-3 pt-2 pb-4 space-y-1">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
            
            {/* Mobile Projects */}
            <button onClick={() => toggleDropdown('projects')} className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <span className="flex items-center gap-2"><Layers size={16} /> Projects</span>
              {mobileDropdown === 'projects' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {mobileDropdown === 'projects' && (
              <div className="pl-8 space-y-1 pb-1">
                 <Link to="/projects" className="block px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Projects List</Link>
                 <Link to="/study-types" className="block px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Study Types</Link>
              </div>
            )}

            {/* Mobile Company */}
            <button onClick={() => toggleDropdown('company')} className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <span className="flex items-center gap-2"><Building2 size={16} /> Company</span>
              {mobileDropdown === 'company' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {mobileDropdown === 'company' && (
              <div className="pl-8 space-y-1 pb-1">
                 <Link to="/companies" className="block px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Companies</Link>
                 <Link to="/contacts" className="block px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contacts</Link>
                 <Link to="/contact-types" className="block px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact Types</Link>
              </div>
            )}

            {/* Mobile Analysis */}
            <button onClick={() => toggleDropdown('analysis')} className="w-full flex justify-between items-center px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <span className="flex items-center gap-2"><BarChart3 size={16} /> Analysis</span>
              {mobileDropdown === 'analysis' ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {mobileDropdown === 'analysis' && (
              <div className="pl-8 space-y-1 pb-1">
                 <Link to="/analysis/reports" className="block px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Reports</Link>
              </div>
            )}
            
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
