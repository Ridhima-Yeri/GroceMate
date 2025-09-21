import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonButton, IonIcon, IonBadge } from '@ionic/react';
import { addOutline, removeOutline, trashOutline, cartOutline } from 'ionicons/icons';
import { useCart } from '../contexts/CartContext';
import '../styles/Menu.css';

const Menu: React.FC = () => {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <IonPage>
      <IonContent fullscreen className="menu-content">
      </IonContent>
    </IonPage>
  );
};

export default Menu;