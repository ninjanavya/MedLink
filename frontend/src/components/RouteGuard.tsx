import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../redux/store';

interface GuardProps {
  children: React.ReactNode;
}

export const RequireAuth: React.FC<GuardProps> = ({ children }) => {
  const { isAuthenticated } = useAppSelector(state => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to the login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export const RequireAdmin: React.FC<GuardProps> = ({ children }) => {
  const { user } = useAppSelector(state => state.auth);

  if (!user || user.role !== 'Administrator') {
    // Redirection if not authorized
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
export default RequireAuth;
