"use client";
import Link from 'next/link';
import LoginBtn from './LoginBtn';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/campaigns/create', label: 'Create Campaign' },
    { href: '/campaigns/history', label: 'Campaign History' },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg w-10 h-10 flex items-center justify-center mr-2 shadow-md group-hover:shadow-indigo-500/30 transition-all duration-300">
                X
              </div>
              <span className="font-bold text-xl text-white group-hover:text-indigo-200 transition-colors duration-200">
                XenoCRM
              </span>
              <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-600 text-white group-hover:bg-indigo-500 transition-colors duration-200">
                AI
              </span>
            </Link>
            
            
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                      ${pathname === link.href 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-gray-300 hover:bg-indigo-700/40 hover:text-white'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>AI Assistant</span>
            </button>
            
            
            <div className="hidden md:block">
              <LoginBtn />
            </div>
            
            
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-slate-900/90 backdrop-blur-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === link.href
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:bg-indigo-700/40 hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-4 flex items-center justify-between px-3">
            <button className="flex items-center px-3 py-1.5 text-sm font-medium rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm transition-all duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>AI Assistant</span>
            </button>
            <LoginBtn />
          </div>
        </div>
      </div>
    </nav>
  );
}