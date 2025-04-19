import React from 'react';

interface BackgroundProps {
  children: React.ReactNode;
}

const Background: React.FC<BackgroundProps> = ({ children }) => {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {children}
    </div>
  );
};

export default Background; 