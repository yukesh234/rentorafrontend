import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import './App.css'
import Test from './pages/test.jsx'
import Layout from './layout/layout.jsx'
import HomePage from './pages/HomePage.jsx'
import OAuth2Success from './pages/Oauth2success.jsx'
import ManageListingsPage from './pages/ManageListingPage.jsx'
import MyBookingsPage from './pages/MyBookingPage.jsx'
import PaymentFailurePage from './pages/PaymentFailure.jsx'
import PaymentSuccessPage from './pages/PaymentSuccess.jsx'
import './styles/datepicker-override.css';
import OwnerBookingsPage from './pages/OwnerBookingPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import BrowseLivePage from './pages/BrowseLivePage.jsx'
import WatchStreamPage from './pages/WatchStreamPage.jsx'
import GoLivePage from './pages/GoLivePage.jsx'
import BrowseTournamentsPage from './pages/BrowseTournamentsPage.jsx'
import TournamentDetailPage from './pages/TournamentDetailPage.jsx'
import CreateTournamentPage from './pages/createTournamentPage.jsx'
import OwnerTournamentsPage from './pages/OwnerTournamentPage.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx'
import RequireAdmin from './components/RequireAdmin.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import { useAuthStore } from './stores/Authstore.js' 
import ListingDetailPage from './pages/ListingDetailPage.jsx'

function App() {
  const initialize = useAuthStore((s) => s.initialize);

  // restore the user session once on app start (refresh-cookie -> new access token)
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* public */}
        <Route path='/' element={<HomePage />} />
        <Route path='/listings/:id' element={<ListingDetailPage />} />
        <Route path='/live' element={<BrowseLivePage />} />
        <Route path='/live/:bookingId' element={<WatchStreamPage />} />
        <Route path='/tournaments' element={<BrowseTournamentsPage />} />
        <Route path='/tournaments/:id' element={<TournamentDetailPage />} />

        {/* everything below needs a logged-in user */}
        <Route element={<RequireAuth />}>
          <Route path='/Managelisting' element={<ManageListingsPage />} />
          <Route path='/bookings' element={<MyBookingsPage />} />
          <Route path='/owner-bookings' element={<OwnerBookingsPage />} />
          <Route path='/profile' element={<ProfilePage />} />
          <Route path='/go-live/:bookingId' element={<GoLivePage />} />
          <Route path='/owner-tournaments' element={<OwnerTournamentsPage />} />
          <Route path='/create-tournament/:bookingId' element={<CreateTournamentPage />} />
          <Route path='/analytics' element={<AnalyticsPage />} />
        </Route>
      </Route>

      {/* public: must stay open, this is where Google login returns a token */}
      <Route path='/oauth2/success' element={<OAuth2Success />} />
      <Route path='/about' element={<h1 className='bg-blue-500' >About Page</h1>} />
      <Route path='/test' element={<Test />} />

      {/* payment redirects: protected, the guard waits for the refresh first */}
      <Route element={<RequireAuth />}>
        <Route path='/payment/success' element={<PaymentSuccessPage />} />
        <Route path='/payment/failure' element={<PaymentFailurePage />} />
      </Route>

      {/* admin side: separate auth, unchanged */}
      <Route path='/admin/login' element={<AdminLoginPage />} />
      <Route
        path='/admin/dashboard'
        element={
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}

export default App