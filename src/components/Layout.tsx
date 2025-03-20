
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title: string;
  breadcrumbs?: { label: string; path: string }[];
  actions?: ReactNode;
}

const Layout = ({ children, title, breadcrumbs = [], actions }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Breadcrumbs */}
            <div className="flex items-center text-lg font-semibold">
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="mx-2 text-gray-400">/</span>}
                  <Link
                    to={crumb.path}
                    className={`hover:text-blue-accent transition-colors ${
                      i === breadcrumbs.length - 1 ? 'text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {actions}
            <div className="w-8 h-8 bg-blue-accent rounded-full flex items-center justify-center text-white">
              <User size={18} />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
