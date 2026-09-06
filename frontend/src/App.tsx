import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/admin-layout'
import { AdminAuthBoundary } from './components/admin/admin-auth-boundary'
import { ProtectedRoute } from './components/admin/protected-route'
import { AdminHomePage } from './pages/admin-home-page'
import { AdminEnrollmentsPage } from './pages/admin-enrollments-page'
import { AdminClassesPage } from './pages/admin-classes-page'
import { AdminLoginPage } from './pages/admin-login-page'
import { AdminWorkshopsPage } from './pages/admin-workshops-page'
import { PublicHomePage } from './pages/public-home-page'
import { EnrollmentCancellationPage } from './pages/enrollment-cancellation-page'
import { EnrollmentPaymentPage } from './pages/enrollment-payment-page'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHomePage />} />
      <Route
        path="/inscricoes/cancelar/:token"
        element={<EnrollmentCancellationPage />}
      />
      <Route
        path="/inscricoes/pagamento/:token"
        element={<EnrollmentPaymentPage />}
      />
      <Route element={<AdminAuthBoundary />}>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHomePage />} />
            <Route path="inscricoes" element={<AdminEnrollmentsPage />} />
            <Route path="oficinas" element={<AdminWorkshopsPage />} />
            <Route
              path="oficinas/:workshopId/turmas"
              element={<AdminClassesPage />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
