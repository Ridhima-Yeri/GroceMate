import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonButton, IonIcon, IonToast } from '@ionic/react';
import { addOutline, removeOutline, trashOutline, cartOutline } from 'ionicons/icons';
import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import '../styles/Cart.css';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCart();
  const [showClearToast, setShowClearToast] = useState(false);

  const handleClearCart = () => {
    clearCart();
    setShowClearToast(true);
  };

  return (
    <IonPage className="cart-page">
      <IonContent fullscreen className="cart-content">
        {items.length === 0 ? (
          <div className="cart-container">
            <div className="page-header">
              <h1 className="page-title">Shopping Cart</h1>
              <p className="page-subtitle">Review your items</p>
            </div>
            <div className="cart-empty">
              <IonIcon icon={cartOutline} className="cart-empty-icon" />
              <p>Your cart is empty</p>
              <IonButton routerLink="/menu" expand="block" className="continue-shopping-btn">
                Continue Shopping
              </IonButton>
            </div>
          </div>
        ) : (
          <div className="cart-container cart-has-items">
            <div className="page-header">
              <h1 className="page-title">Shopping Cart</h1>
              <p className="page-subtitle">Review your items</p>
            </div>
            <div className="cart-items">
              {items.map(item => (
                <div className="cart-item" key={item._id}>
                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="cart-item-no-image">No Image</div>
                    )}
                  </div>
                  <div className="cart-item-details">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{item.price} each</div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="cart-item-quantity">
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <IonIcon icon={removeOutline} />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button 
                        className="quantity-btn" 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <IonIcon icon={addOutline} />
                      </button>
                    </div>
                    <button 
                      className="cart-item-remove" 
                      onClick={() => removeFromCart(item._id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <IonIcon icon={trashOutline} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>₹{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="cart-actions">
                <IonButton expand="block" className="checkout-btn" routerLink="/checkout">
                  Proceed to Checkout
                </IonButton>
                <button className="clear-cart-btn" onClick={handleClearCart}>
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
        <IonToast
          isOpen={showClearToast}
          onDidDismiss={() => setShowClearToast(false)}
          message="Cart cleared"
          color="danger"
          duration={1800}
          position="top"
          cssClass="toast-cart"
        />
      </IonContent>
    </IonPage>
  );
};

export default Cart;