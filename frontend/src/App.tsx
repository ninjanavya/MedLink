import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import HCPDirectory from './pages/HCPDirectory';
import LogInteraction from './pages/LogInteraction';
import History from './pages/History';
import AIInsights from './pages/AIInsights';
import FollowUps from './pages/FollowUps';
import Login from './pages/Login';
import HCPManagement from './pages/HCPManagement';
import AdminPanel from './pages/AdminPanel';
import { RequireAuth, RequireAdmin } from './components/RouteGuard';
import { NotificationToast } from './components/NotificationToast';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {/* Global Toast Alerts */}
        <NotificationToast />

        <Routes>
          {/* Public standalone login route */}
          <Route path="/login" element={<Login />} />

          {/* Protected layout routes */}
          <Route 
            path="/*" 
            element={
              <RequireAuth>
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/hcps" element={<HCPDirectory />} />
                    <Route path="/log" element={<LogInteraction />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/ai-insights" element={<AIInsights />} />
                    <Route path="/follow-ups" element={<FollowUps />} />
                    {/* Administrator Control Panel */}
                    <Route 
                      path="/admin" 
                      element={
                        <RequireAdmin>
                          <AdminPanel />
                        </RequireAdmin>
                      } 
                    />
                    
                    {/* Administrator Master Directory Actions */}
                    <Route 
                      path="/admin/hcps" 
                      element={
                        <RequireAdmin>
                          <HCPManagement />
                        </RequireAdmin>
                      } 
                    />

                    {/* Catch-all fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </MainLayout>
              </RequireAuth>
            } 
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
