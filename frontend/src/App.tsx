import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import DatasetsPage from './pages/DatasetsPage';
import DatasetDetailsPage from './pages/DatasetDetailsPage';
import AnnotationPage from './pages/AnnotationPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DatasetsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/datasets/:datasetId"
          element={
            <PrivateRoute>
              <DatasetDetailsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/datasets/:datasetId/images/:imageId?"
          element={
            <PrivateRoute>
              <AnnotationPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
