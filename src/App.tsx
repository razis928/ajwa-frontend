/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, useRoutes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { appRoutes } from './routes';

function AppRoutes() {
  return useRoutes(appRoutes);
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
