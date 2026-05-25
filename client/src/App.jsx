import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Navbar from './components/navbar/Navbar'
import LoginPage from './pages/customer/LoginPage'
import RegisterPage from './pages/customer/RegisterPage'
import HomePage from './pages/customer/HomePage'
import MovieDetailPage from './pages/customer/MovieDetailPage'
import SchedulePage from './pages/customer/SchedulePage'
import PricePage from './pages/customer/PricePage'
import BookingPage from './pages/customer/BookingPage'
import PaymentPage from './pages/customer/PaymentPage'
import PaymentSuccessPage from './pages/customer/PaymentSuccessPage'
import MyTicketsPage from './pages/customer/MyTicketsPage'
import TicketDetailPage from './pages/customer/TicketDetailPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminMovies from './pages/admin/AdminMovies'
import AdminShowtimes from './pages/admin/AdminShowtimes'
import AdminBookings from './pages/admin/AdminBookings'
import AdminCustomers from './pages/admin/AdminCustomers'

function Guard({ children, adminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function PublicOnly({ children }) {
  const { isAuthenticated, user } = useAuthStore()
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/'} replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"    element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><RegisterPage /></PublicOnly>} />
      <Route path="/ticket/:code" element={<TicketDetailPage />} />

      <Route element={<Navbar />}>
        <Route path="/"              element={<HomePage />} />
        <Route path="/movies/:id"    element={<MovieDetailPage />} />
        <Route path="/schedule"      element={<SchedulePage />} />
        <Route path="/price"         element={<PricePage />} />
        <Route path="/booking/:id"   element={<Guard><BookingPage /></Guard>} />
        <Route path="/payment"       element={<Guard><PaymentPage /></Guard>} />
        <Route path="/payment/success" element={<Guard><PaymentSuccessPage /></Guard>} />
        <Route path="/my-tickets"    element={<Guard><MyTicketsPage /></Guard>} />
      </Route>

      <Route path="/admin" element={<Guard adminOnly><AdminLayout /></Guard>}>
        <Route index           element={<AdminDashboard />} />
        <Route path="movies"   element={<AdminMovies />} />
        <Route path="showtimes" element={<AdminShowtimes />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}