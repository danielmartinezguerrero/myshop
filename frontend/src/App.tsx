import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Header from './components/Header'
import InactivityModal from './components/InactivityModal'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useAuth } from './hooks/useAuth'
import { useInactivityTimer } from './hooks/useInactivityTimer'

const App = () => {
  const { isAuthenticated, rememberMe, logout } = useAuth()
  const navigate = useNavigate()

  // Only track inactivity if logged in AND "Remember me" is unchecked
  const trackInactivity = isAuthenticated && !rememberMe

  const { showWarning, secondsLeft, stayActive } = useInactivityTimer({
    enabled: trackInactivity,
    onTimeout: () => {
      logout()
      navigate('/login')
    },
  })

  // "Sign out now" button
  const handleSignOutNow = () => {
    stayActive()
    logout()
    navigate('/login')
  }

  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showWarning && trackInactivity && (
        <InactivityModal
          secondsLeft={secondsLeft}
          onStayActive={stayActive}
          onSignOut={handleSignOutNow}
        />
      )}
    </>
  )
}

export default App