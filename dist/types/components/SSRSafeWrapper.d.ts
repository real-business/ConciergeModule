import React from 'react';
interface SSRSafeWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
export declare const SSRSafeWrapper: React.FC<SSRSafeWrapperProps>;
export default SSRSafeWrapper;
