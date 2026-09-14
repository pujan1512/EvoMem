import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ adminUser, children }) {
  if (!adminUser) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}
