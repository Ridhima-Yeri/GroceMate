import { useState, useEffect } from 'react';
import { IonContent, IonPage, IonToast, IonChip, IonIcon, IonLabel, IonHeader, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';
import { login as apiLogin, register as apiRegister } from '../api/api';
import { useHistory } from 'react-router-dom';
import { cloudOfflineOutline } from 'ionicons/icons';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const history = useHistory();

  // Check network status
  useEffect(() => {
    const checkOnlineStatus = () => {
      setIsOffline(!navigator.onLine);
    };

    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);
    checkOnlineStatus();

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Handle offline state
    if (isOffline && !isRegister) {
      // For login, we can check if we have a cached token
      const cachedToken = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user');
      // @ts-ignore
      const email = (e.target as any).elements[0].value;
      
      if (cachedToken && cachedUser) {
        const user = JSON.parse(cachedUser);
        if (user.email === email) {
          setToastMessage('Logged in with cached credentials (offline mode)');
          setShowToast(true);
          
          // Redirect based on role
          if (user.role === 'admin') {
            history.push('/admin');
          } else {
            history.push('/');
          }
          setLoading(false);
          return;
        }
      }
      
      setError('Cannot login while offline without cached credentials');
      setLoading(false);
      return;
    }

    if (isOffline && isRegister) {
      setError('Cannot register while offline. Please check your connection.');
      setLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // @ts-ignore
        const name = (e.target as any).elements[0].value;
        // @ts-ignore
        const email = (e.target as any).elements[isRegister ? 1 : 0].value;
        // @ts-ignore
        const password = (e.target as any).elements[isRegister ? 2 : 1].value;
        const res = await apiRegister(name, email, password);
        if (res.token) {
          localStorage.setItem('token', res.token); // Save token for authenticated requests
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          // Dispatch custom event for same-tab menu update
          window.dispatchEvent(new Event('authChanged'));
          if (res.user?.role === 'admin') {
            history.push('/admin');
          } else {
            history.push('/');
          }
        } else {
          setError(res.message || 'Registration failed');
        }
      } else {
        // @ts-ignore
        const email = (e.target as any).elements[0].value;
        // @ts-ignore
        const password = (e.target as any).elements[1].value;
        const res = await apiLogin(email, password);
        if (res.token) {
          localStorage.setItem('token', res.token); // Save token for authenticated requests
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          // Dispatch custom event for same-tab menu update
          window.dispatchEvent(new Event('authChanged'));
          if (res.user?.role === 'admin') {
            history.push('/admin');
          } else {
            history.push('/');
          }
        } else {
          setError(res.message || 'Login failed');
        }
      }
    } catch (err) {
      setError('Something went wrong. Please check your connection.');
      setIsOffline(true);
    }
    setLoading(false);
  };

  return (
    <IonPage className="login-page">
      {/* No IonHeader or toolbar, only in-content header as per user request */}
      <IonContent fullscreen className="login-content">
        <div className="page-header">
          <h1 className="page-title">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
        </div>
        <div className="login-center">
          {isOffline && (
            <IonChip color="warning" className="offline-warning">
              <IonIcon icon={cloudOfflineOutline} />
              <IonLabel>Offline Mode</IonLabel>
            </IonChip>
          )}
          
          <form className="login-form" onSubmit={handleSubmit}>
            {isRegister && (
              <input
                className="login-input"
                type="text"
                placeholder="Full Name"
                required
              />
            )}
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              required
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              required
            />
            {isRegister && (
              <input
                className="login-input"
                type="password"
                placeholder="Confirm Password"
                required
              />
            )}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>
          {error && <div className="login-error">{error}</div>}
          {loading && <div className="login-loading">Loading...</div>}
          <div className="login-toggle">
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => setIsRegister(false)} className="login-link">
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button type="button" onClick={() => setIsRegister(true)} className="login-link">
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="warning"
          position="top"
          cssClass="toast-login"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
