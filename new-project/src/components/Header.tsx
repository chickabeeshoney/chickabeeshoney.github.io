import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', path: '/' },
    { name: 'Vendors', path: '/vendors' },
    { name: 'Results', path: '/results' },
    { name: 'Comparison', path: '/comparison' }
  ];

  const logout = () => {
    localStorage.removeItem('sales_training_current_user');
    window.location.reload();
  };

  return (
    <header style={headerStyle}>
      <div style={containerStyle}>
        <div style={brandStyle}>
          <h1 style={titleStyle}>Sales Training Vendor Evaluation</h1>
          <span style={subtitleStyle}>LoadSmart</span>
        </div>
        
        <nav style={navStyle}>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              style={{
                ...navLinkStyle,
                ...(location.pathname === item.path ? activeNavLinkStyle : {})
              }}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div style={userMenuStyle}>
          <span style={userNameStyle}>{user.name}</span>
          <span style={userRoleStyle}>({user.role})</span>
          <button onClick={logout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderBottom: '1px solid #e2e8f0',
  padding: '16px 0',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const brandStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
};

const titleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a202c',
  margin: 0
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#718096',
  marginTop: '2px'
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '32px'
};

const navLinkStyle: React.CSSProperties = {
  color: '#4a5568',
  textDecoration: 'none',
  fontWeight: '500',
  padding: '8px 16px',
  borderRadius: '6px',
  transition: 'all 0.2s'
};

const activeNavLinkStyle: React.CSSProperties = {
  color: '#3182ce',
  backgroundColor: '#ebf8ff'
};

const userMenuStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px'
};

const userNameStyle: React.CSSProperties = {
  fontWeight: '500',
  color: '#2d3748'
};

const userRoleStyle: React.CSSProperties = {
  color: '#718096',
  fontSize: '14px'
};

const logoutButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  backgroundColor: 'white',
  color: '#4a5568',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.2s'
};