/**
 * AdminApp - Main component for the unified admin interface
 *
 * This component serves as the entry point for the admin interface
 * in the main SmashingApps.ai application.
 */

import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import ProviderManagement from './components/ProviderManagement';
import PromptManagement from './components/PromptManagement';
import SettingsManagement from './components/SettingsManagement';
import UsageMonitoring from './components/UsageMonitoring';
import { AdminProvider } from './contexts/AdminContext';

/**
 * AdminApp - Main component for the unified admin interface
 *
 * This component provides a centralized admin interface for all tools
 * in the SmashingApps.ai application.
 */
const AdminApp: React.FC = () => {
  return (
    <AdminProvider>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/providers" element={<ProviderManagement />} />
          <Route path="/admin/prompts" element={<PromptManagement />} />
          <Route path="/admin/settings" element={<SettingsManagement />} />
          <Route path="/admin/usage" element={<UsageMonitoring />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </AdminProvider>
  );
};

export default AdminApp;