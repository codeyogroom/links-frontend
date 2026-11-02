import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

function Navbar({ setAuth }) {
  const navigate = useNavigate();
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

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-md focus:outline-none transition-colors" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 cursor-pointer group">
              <div className="flex space-x-1">
                <span className="w-3.5 h-3.5 bg-orange-400 rounded-full group-hover:scale-110 transition-transform"></span>
                <span className="w-3.5 h-3.5 bg-blue-500 rounded-full group-hover:scale-110 transition-transform delay-75"></span>
                <span className="w-3.5 h-3.5 bg-green-500 rounded-full group-hover:scale-110 transition-transform delay-150"></span>
              </div>
              <span className="hidden sm:block text-lg font-extrabold tracking-tight text-gray-800 uppercase ml-2">Talk To Panel</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-blue-600 hover:bg-blue-50 transition-colors">
                Dashboard
              </Link>
              
              {/* Projects Dropdown */}
              <div className="relative pb-4 -mb-4 group">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors">
                  Projects <ChevronDown size={14} className="ml-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
                <div className="absolute left-0 z-50 hidden w-48 mt-1 origin-top-left bg-white border border-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                  <div className="py-1">
                    <Link to="/projects" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Projects List</Link>
                    <Link to="/study-types" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Study Types</Link>
                  </div>
                </div>
              </div>

              {/* Company Dropdown */}
              <div className="relative pb-4 -mb-4 group">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors">
                  Company <ChevronDown size={14} className="ml-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
                <div className="absolute left-0 z-50 hidden w-48 mt-1 origin-top-left bg-white border border-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                  <div className="py-1">
                    <Link to="/companies" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Companies</Link>
                    <Link to="/contacts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Contacts</Link>
                    <Link to="/contact-types" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Contact Types</Link>
                  </div>
                </div>
              </div>

              {/* Analysis Dropdown */}
              <div className="relative pb-4 -mb-4 group">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-colors">
                  Analysis <ChevronDown size={14} className="ml-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
                <div className="absolute left-0 z-50 hidden w-44 mt-1 origin-top-left bg-white border border-gray-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 group-hover:block">
                  <div className="py-1">
                    <Link to="/analysis/reports" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">Reports</Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                A
              </div>
              <span className="text-sm font-medium text-gray-700">Admin TTP</span>
            </div>
            
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-red-600 hover:border-red-200 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <LogOut size={16} className="mr-1.5" /> 
              <span className="hidden sm:inline-block">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-inner absolute w-full left-0 z-40">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
            
            {/* Mobile Projects */}
            <button onClick={() => toggleDropdown('projects')} className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              Projects {mobileDropdown === 'projects' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {mobileDropdown === 'projects' && (
              <div className="pl-6 space-y-1 pb-2">
                 <Link to="/projects" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Projects List</Link>
                 <Link to="/study-types" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Study Types</Link>
              </div>
            )}

            {/* Mobile Company */}
            <button onClick={() => toggleDropdown('company')} className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              Company {mobileDropdown === 'company' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {mobileDropdown === 'company' && (
              <div className="pl-6 space-y-1 pb-2">
                 <Link to="/companies" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Companies</Link>
                 <Link to="/contacts" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contacts</Link>
                 <Link to="/contact-types" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact Types</Link>
              </div>
            )}

            {/* Mobile Analysis */}
            <button onClick={() => toggleDropdown('analysis')} className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              Analysis {mobileDropdown === 'analysis' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>
            {mobileDropdown === 'analysis' && (
              <div className="pl-6 space-y-1 pb-2">
                 <Link to="/analysis/reports" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors" onClick={() => setMobileMenuOpen(false)}>Reports</Link>
              </div>
            )}
            
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;

