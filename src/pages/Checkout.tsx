import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonRadioGroup,
  IonRadio,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCheckbox,
  IonToast,
  IonSpinner,
} from '@ionic/react';
import {
  locationOutline,
  callOutline,
  mailOutline,
  cardOutline,
  cashOutline,
  timeOutline,
  checkmarkCircleOutline,
  bagCheckOutline,
  arrowForward
} from 'ionicons/icons';
import { useCart } from '../contexts/CartContext';
import '../styles/Checkout.css';

interface DeliveryAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
}

const Checkout: React.FC = () => {
  const history = useHistory();
  const { items, getTotalPrice, clearCart } = useCart();
  
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showGoToOrders, setShowGoToOrders] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showLoginToast, setShowLoginToast] = useState(false);
  
  // Calculate totals
  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const total = subtotal + deliveryFee;
  
  // Handle form input changes
  const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
    setDeliveryAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Validate form
  const validateForm = (): boolean => {
    if (!deliveryAddress.fullName.trim()) {
      showError('Full name is required');
      return false;
    }
    if (!deliveryAddress.phone.trim() || deliveryAddress.phone.length < 10) {
      showError('Valid phone number is required');
      return false;
    }
    if (!deliveryAddress.addressLine1.trim()) {
      showError('Address is required');
      return false;
    }
    return true;
  };
  
  // Show error message
  const showError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };
  
  // Navigate to orders page
  const goToOrders = () => {
    setShowToast(false);
    setShowGoToOrders(false);
    history.push('/orders');
  };
  
  // Handle order placement
  const handlePlaceOrder = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginToast(true);
      return;
    }

    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Generate order number first
      const generatedOrderNumber = `ORD${Date.now()}`;
      setOrderNumber(generatedOrderNumber);

      // Create order object
      const order = {
        items: items.map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          price: Number(item.price), // Ensure price is a number
          image: item.image
        })),
        deliveryAddress: {
          fullName: deliveryAddress.fullName,
          phone: deliveryAddress.phone,
          email: deliveryAddress.email,
          addressLine1: deliveryAddress.addressLine1
        },
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
        orderNotes: orderNotes,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        total: Number(total),
        status: 'Processing',
        deliveryStatus: 'processing',
        createdAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      // Send order to backend
      const response = await fetch('https://grocemate-bckend.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(order)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to place order');
      }

      // Clear cart
      clearCart();

      setIsLoading(false);
      setToastMessage('Order placed successfully!');
      setShowToast(true);
      setShowGoToOrders(true);

    } catch (error) {
      console.error('Error placing order:', error);
      showError('Failed to place order. Please try again.');
      setIsLoading(false);
    }
  };
  
  if (items.length === 0) {
    return (
      <IonPage className="checkout-page">
        <IonContent className="checkout-content">
          <div className="page-header">
            <h1 className="page-title">Checkout</h1>
          </div>
          <div className="checkout-empty">
            <IonIcon icon={checkmarkCircleOutline} />
            <h3>No items to checkout</h3>
            <p>Your cart is empty</p>
            <IonButton routerLink="/menu" fill="outline">
              Continue Shopping
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <IonPage className="checkout-page">
      <IonContent className="checkout-content">
        <div className="page-header">
          <h1 className="page-title">Checkout</h1>
        </div>
        <div className="checkout-container">
          
          {/* Order Summary */}
          <IonCard className="order-summary-card">
            <IonCardHeader>
              <IonCardTitle>Order Summary</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="simple-order-summary">
                <div className="simple-order-items">
                  {items.map((item, index) => (
                    <div key={index} className="simple-order-item">
                      <div className="simple-item-details">
                        <span className="simple-item-name">{item.name}</span>
                        <span className="simple-item-quantity">x{item.quantity}</span>
                      </div>
                      <span className="simple-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="simple-order-totals">
                  <div className="simple-total-row">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="simple-total-row">
                    <span>Delivery Fee:</span>
                    <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                  </div>
                  {deliveryFee === 0 && (
                    <div className="simple-free-delivery-note">Free delivery on orders above ₹500</div>
                  )}
                  <div className="simple-total-row final-total">
                    <span>Total:</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
          
          {/* Delivery Address */}
          <IonCard className="delivery-address-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={locationOutline} />
                Delivery Address
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="simple-address-form">
                <div className="simple-form-field">
                  <label className="simple-form-label required" htmlFor="fullName">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    className="simple-form-input"
                    type="text"
                    value={deliveryAddress.fullName}
                    onChange={e => handleAddressChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="simple-form-row">
                  <div className="simple-form-field">
                    <label className="simple-form-label required" htmlFor="phone">
                      Phone
                    </label>
                    <input
                      id="phone"
                      className="simple-form-input"
                      type="tel"
                      value={deliveryAddress.phone}
                      onChange={e => handleAddressChange('phone', e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="simple-form-field">
                    <label className="simple-form-label" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      className="simple-form-input"
                      type="email"
                      value={deliveryAddress.email}
                      onChange={e => handleAddressChange('email', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="simple-form-field">
                  <label className="simple-form-label required" htmlFor="address1">
                    Street Address
                  </label>
                  <input
                    className="simple-form-input"
                    value={deliveryAddress.addressLine1}
                    onChange={e => handleAddressChange('addressLine1', e.target.value)}
                    placeholder="House no, Building, Street name"
                    required
                  />
                </div>
              </div>
            </IonCardContent>
          </IonCard>
          
          {/* Payment Method */}
          <IonCard className="payment-method-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={cardOutline} />
                Payment Method
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonRadioGroup value={paymentMethod} onIonChange={e => setPaymentMethod(e.detail.value)}>
                <IonItem>
                  <IonIcon icon={cashOutline} slot="start" />
                  <IonLabel>
                    <h3>Cash on Delivery</h3>
                    <p>Pay when your order arrives</p>
                  </IonLabel>
                  <IonRadio slot="end" value="cod" />
                </IonItem>
                <IonItem>
                  <IonIcon icon={cardOutline} slot="start" />
                  <IonLabel>
                    <h3>Online Payment</h3>
                    <p>Pay now with card/UPI (Coming Soon)</p>
                  </IonLabel>
                  <IonRadio slot="end" value="online" disabled />
                </IonItem>
              </IonRadioGroup>
            </IonCardContent>
          </IonCard>
          
          {/* Order Notes */}
          <IonCard className="order-notes-card">
            <IonCardHeader>
              <IonCardTitle>Order Notes (Optional)</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div className="simple-notes-form">
                <label className="simple-notes-label" htmlFor="orderNotes">
                  Special Instructions
                </label>
                <textarea
                  id="orderNotes"
                  className="simple-notes-textarea"
                  value={orderNotes}
                  onChange={e => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for delivery (e.g., gate code, specific time, etc.)"
                  rows={4}
                  maxLength={200}
                />
                <div className="simple-character-count">
                  {orderNotes.length}/200 characters
                </div>
              </div>
            </IonCardContent>
          </IonCard>
          
          {/* Place Order Button */}
          <div className="place-order-section">
            <IonButton
              expand="block"
              size="large"
              onClick={handlePlaceOrder}
              disabled={isLoading}
              className="place-order-btn"
            >
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" />
                  <span className="ion-margin-start">Placing Order...</span>
                </>
              ) : (
                <>
                  Place Order - ₹{total.toFixed(2)}
                </>
              )}
            </IonButton>
          </div>
          
        </div>
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          duration={showGoToOrders ? 0 : 4000}
          position="top"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span>{toastMessage}</span>
            {showGoToOrders && (
              <IonButton size="small" color="primary" style={{ marginTop: 8 }} onClick={goToOrders}>
                Go to Orders
              </IonButton>
            )}
          </div>
        </IonToast>
        {/* Login required toast */}
        <IonToast
          isOpen={showLoginToast}
          onDidDismiss={() => setShowLoginToast(false)}
          duration={0}
          position="top"
          color="warning"
          cssClass="login-required-toast"
          message="Please login to continue"
          buttons={[
            {
              text: 'Login',
              role: 'cancel',
              handler: () => {
                setShowLoginToast(false);
                history.push('/login');
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Checkout;

