import { Redirect, Route, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent as IonMenuContent,
  IonButtons,
  IonMenuButton,
  IonBadge,
  IonButton,
  IonBackButton
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle, homeOutline, cartOutline, storefrontOutline } from 'ionicons/icons';
import { useEffect } from 'react';
import { initializePlatform } from './utils/platform';
import './styles/platform.css';
import './styles/ToolbarHeightFix.css';

import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import AdminOrderDetails from './pages/AdminOrderDetails';
import Profile from './pages/Profile';
import SideMenu from './components/SideMenu';
import { useState } from 'react';
import { CartProvider, useCart } from './contexts/CartContext';
import Checkout from './pages/Checkout';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './styles/variables.css';
import './styles/ToolbarThemeFix.css';
import './styles/App.css';
import './styles/ProfessionalAppFix.css';
import './styles/ThemeSupport.css';
import './styles/IconFix.css';
import './styles/TabBarFix.css';
import './styles/MenuSmoothnessFix.css';
import './styles/Footer.css';  // Add this line

// Add custom style for focus management
const style = document.createElement('style');
style.textContent = `
  [inert] * {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }

  /* Ensure menu items are properly focusable */
  ion-item[button]:focus {
    outline: 2px solid var(--ion-color-primary);
    outline-offset: -2px;
  }
`;
document.head.appendChild(style);

import { isPlatform } from '@ionic/react';

setupIonicReact({
  // Add these accessibility-focused config options
  animated: true,
  mode: 'md',
  innerHTMLTemplatesEnabled: false,
  tabButtonLayout: 'label-hide'
  // Removed a11yStatusMessageEnabled as it's not a valid config option
});

const TabBar: React.FC = () => {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <IonTabBar slot="bottom" className="tab-bar-custom">
      <IonTabButton tab="home" href="/" className="tab-button-custom">
        <IonIcon aria-hidden="true" icon={homeOutline} className="nav-icon" style={{visibility: 'visible', opacity: 1, display: 'block'}} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton tab="menu" href="/menu" className="tab-button-custom">
        <IonIcon aria-hidden="true" icon={storefrontOutline} className="nav-icon" style={{visibility: 'visible', opacity: 1, display: 'block'}} />
        <IonLabel>Products</IonLabel>
      </IonTabButton>
      <IonTabButton tab="cart" href="/cart" className="tab-button-custom">
        <IonIcon aria-hidden="true" icon={cartOutline} className="nav-icon" style={{visibility: 'visible', opacity: 1, display: 'block'}} />
        <IonLabel>Cart</IonLabel>
        {itemCount > 0 && (
          <IonBadge className="cart-badge-circular">{itemCount}</IonBadge>
        )}
      </IonTabButton>
    </IonTabBar>
  );
};

const MainLayout: React.FC = () => {
  const { getTotalItems } = useCart();
  const location = useLocation();
  const [authVersion, setAuthVersion] = useState(0);

  useEffect(() => {
    initializePlatform();
    // Listen for authChanged event to force SideMenu re-mount
    const handleAuthChanged = () => setAuthVersion(v => v + 1);
    window.addEventListener('authChanged', handleAuthChanged);
    return () => {
      window.removeEventListener('authChanged', handleAuthChanged);
    };
  }, []);

  return (
    <IonApp>
      <SideMenu key={authVersion} />
      {/* Main Content */}
      <div 
        className="ion-page" 
        id="main-content" 
        role="main"
        aria-live="polite"
      >
        <IonHeader>
          <IonToolbar className="app-toolbar">
            <IonButtons slot="start">
              {location.pathname !== '/' && location.pathname !== '/home' && (
                <IonBackButton 
                  defaultHref={location.pathname.includes('admin-order-details') ? '/admin' : (location.pathname.includes('order-details') ? '/orders' : '/')} 
                  text="" 
                />
              )}
            </IonButtons>
            <IonTitle className="app-title">GroceMate</IonTitle>
            <IonButtons slot="end">
              {/* Cart button removed as requested */}
              <IonMenuButton 
                aria-label="Menu"
                className="smooth-menu-button"
              />
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/" component={Home} />
            <Route exact path="/menu" component={Products} />
            <Route exact path="/cart" component={Cart} />
            <Route exact path="/checkout" component={Checkout} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/admin" render={() => <AdminDashboard />} />
            <Route exact path="/orders" component={Orders} />
            <Route exact path="/order-details/:orderId" component={OrderDetails} />
            <Route exact path="/admin-order-details/:orderId" component={AdminOrderDetails} />
            <Route exact path="/profile" component={Profile} />
          </IonRouterOutlet>
          <TabBar />
        </IonTabs>
      </div>
    </IonApp>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <IonReactRouter>
        <MainLayout />
      </IonReactRouter>
    </CartProvider>
  );
};

export default App;
