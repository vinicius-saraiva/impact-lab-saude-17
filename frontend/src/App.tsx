import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ListaPage } from './pages/ListaPage'
import { LoginPage } from './pages/LoginPage'
import { PacientePage } from './pages/PacientePage'
import { VisitaPage } from './pages/VisitaPage'
import { SupervisorPage } from './pages/SupervisorPage'
import { getAuth } from './auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return getAuth() ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><ListaPage /></ProtectedRoute>} />
          <Route path="/paciente/:id" element={<ProtectedRoute><PacientePage /></ProtectedRoute>} />
          <Route path="/visita/:id" element={<ProtectedRoute><VisitaPage /></ProtectedRoute>} />
          <Route path="/supervisor" element={<ProtectedRoute><SupervisorPage /></ProtectedRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
