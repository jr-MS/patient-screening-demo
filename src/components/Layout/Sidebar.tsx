import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    {
      path: '/screening',
      icon: '👤',
      label: '患者筛查',
      sublabel: ''
    }
  ];
  
  return (
    <div className="w-64 bg-bg-dark text-white h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🧬</div>
          <div>
            <h1 className="text-lg font-bold">Contoso Clinical AI</h1>
            <p className="text-xs text-gray-400">医疗研究智能助手</p>
          </div>
        </div>
      </div>
      
      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{item.label}</div>
                    {item.sublabel && (
                      <div className="text-xs opacity-75">{item.sublabel}</div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>© 2025 Contoso AI</p>
        {/* <p className="mt-1">特应性皮炎临床试验平台</p> */}
        <p>本材料所涉内容仅为技术工具能力展示，不构成医疗建议或承诺，相关结果以客户实际应用为准。</p>
      </div>
    </div>
  );
};
