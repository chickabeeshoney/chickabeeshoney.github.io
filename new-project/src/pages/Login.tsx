import React, { useState } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [users, setUsers] = useState<User[]>([]);
  const { login } = useAuth();

  React.useEffect(() => {
    setUsers(storageService.getUsers());
  }, []);

  const handleLogin = (user: User) => {
    login(user);
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Sales Training Vendor Evaluation</h1>
          <p style={subtitleStyle}>LoadSmart - August 2024 Decision Process</p>
        </div>
        
        <div style={contentStyle}>
          <h2 style={sectionTitleStyle}>Select Your Profile</h2>
          <p style={descriptionStyle}>
            Choose your role to access the vendor evaluation system
          </p>
          
          <div style={userListStyle}>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                style={userButtonStyle}
              >
                <div style={userInfoStyle}>
                  <div style={userNameStyle}>{user.name}</div>
                  <div style={userRoleStyle}>
                    {user.role === 'admin' ? 'Administrator' : 'Evaluator'}
                  </div>
                </div>
                <div style={arrowStyle}>→</div>
              </button>
            ))}
          </div>
          
          <div style={infoBoxStyle}>
            <h3 style={infoTitleStyle}>About This Tool</h3>
            <ul style={infoListStyle}>
              <li>Evaluate 6-8 sales training vendors using weighted criteria</li>
              <li>Each evaluator scores vendors independently</li>
              <li>View aggregated results and vendor comparisons</li>
              <li>Generate reports for decision meetings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#f7fafc',
  padding: '24px'
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  maxWidth: '500px',
  width: '100%',
  overflow: 'hidden'
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#3182ce',
  color: 'white',
  padding: '32px',
  textAlign: 'center'
};

const titleStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 8px 0'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '16px',
  opacity: 0.9,
  margin: 0
};

const contentStyle: React.CSSProperties = {
  padding: '32px'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 8px 0'
};

const descriptionStyle: React.CSSProperties = {
  color: '#718096',
  margin: '0 0 32px 0'
};

const userListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '32px'
};

const userButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  backgroundColor: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s',
  textAlign: 'left'
};

const userInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
};

const userNameStyle: React.CSSProperties = {
  fontWeight: '500',
  color: '#1a202c',
  fontSize: '16px'
};

const userRoleStyle: React.CSSProperties = {
  color: '#718096',
  fontSize: '14px',
  marginTop: '2px'
};

const arrowStyle: React.CSSProperties = {
  color: '#3182ce',
  fontSize: '18px',
  fontWeight: 'bold'
};

const infoBoxStyle: React.CSSProperties = {
  backgroundColor: '#f7fafc',
  padding: '20px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0'
};

const infoTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#1a202c',
  margin: '0 0 12px 0'
};

const infoListStyle: React.CSSProperties = {
  margin: 0,
  paddingLeft: '20px',
  color: '#4a5568'
};