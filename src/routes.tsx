import React from 'react';
import { Navigate, RouteObject } from 'react-router-dom';
import { DashboardOverview } from './components/DashboardOverview';
import { InventoryView } from './components/InventoryView';
import { MenuView } from './components/MenuView';
import { POSView } from './components/POSView';
import { AccountsView } from './components/AccountsView';
import { VendorsView } from './components/VendorsView';
import { CustomersView } from './components/CustomersView';
import { SalesReportsView } from './components/SalesReportsView';
import { AppLayout } from './layouts/AppLayout';

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'inventory', element: <InventoryView /> },
      { path: 'menu', element: <MenuView /> },
      { path: 'pos', element: <POSView /> },
      { path: 'accounts', element: <AccountsView /> },
      { path: 'vendors', element: <VendorsView /> },
      { path: 'customers', element: <CustomersView /> },
      { path: 'reports', element: <SalesReportsView /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const navItems = [
  { path: '/', label: 'Dashboard', end: true },
  { path: '/inventory', label: 'Inventory', end: false },
  { path: '/menu', label: 'Menu', end: false },
  { path: '/pos', label: 'POS', end: false },
  { path: '/accounts', label: 'Accounts', end: false },
  { path: '/vendors', label: 'Vendors', end: false },
  { path: '/customers', label: 'Customers', end: false },
  { path: '/reports', label: 'Sales Reports', end: false },
] as const;
