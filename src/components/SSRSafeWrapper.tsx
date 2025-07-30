import React, { useState, useEffect } from 'react';

interface SSRSafeWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SSRSafeWrapper: React.FC<SSRSafeWrapperProps> = ({ 
  children, 
  fallback = <div>Loading...</div> 
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default SSRSafeWrapper; 