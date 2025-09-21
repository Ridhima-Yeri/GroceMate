import React, { useState, useEffect } from 'react';

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
import { useHistory } from 'react-router-dom';
import { IonContent, IonPage, IonIcon, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonBadge, IonText, IonRefresher, IonRefresherContent, IonButton, IonModal, IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonCardHeader, IonSpinner } from '@ionic/react';
import { bagCheckOutline, timeOutline, chevronForwardOutline, cartOutline, closeOutline, locationOutline, cardOutline, callOutline, chatboxEllipsesOutline } from 'ionicons/icons';
import '../styles/Orders.css';
import '../styles/OrdersMobile.css';

// Order interfaces
interface OrderItem {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  total: number;
  status: string;
  items: OrderItem[];
  deliveryAddress?: string;
  paymentMethod?: string;
  phoneNumber?: string;
  estimatedDelivery?: string;
  orderNotes?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

const getUserOrders = async (): Promise<ApiResponse<Order[]>> => {
  try {

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    return {
      success: true,
      data: orders,
      message: orders.length === 0 ? 'No orders found' : 'Orders loaded successfully'
    };
  } catch (error) {
    console.error('Error reading orders from localStorage:', error);
    return {
      success: false,
      data: [],
      message: 'Failed to load orders'
    };
  }
};

const Orders: React.FC = () => {
  const history = useHistory();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const response = await fetch('https://grocemate-bckend.onrender.com/api/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();

      if (response.ok) {
        const mappedOrders = data.data.map((order: any) => ({
          _id: order.orderNumber || order._id || `order_${Date.now()}`,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          total: order.total,
          status: order.status,
          items: order.items.map((item: any) => ({
            _id: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          })),
          deliveryAddress: order.deliveryAddress ? { ...order.deliveryAddress } : undefined,
          paymentMethod: order.paymentMethod,
          phoneNumber: order.deliveryAddress?.phone,
          estimatedDelivery: order.estimatedDelivery,
          orderNotes: order.orderNotes
        }));
        setOrders(mappedOrders || []);
        localStorage.setItem('orders', JSON.stringify(mappedOrders || []));
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    history.push(`/order-details/${order.orderNumber || order._id}`);
  };

  const handleRefresh = async (event: CustomEvent) => {
    await fetchOrders();
    event.detail.complete();
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getItemCount = (items: OrderItem[]): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getStatusClass = (status: string): string => {
    return `status-${status.toLowerCase()}`;
  };

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'processing': return 'warning';
      case 'cancelled': return 'danger';
      case 'shipped': return 'primary';
      default: return 'medium';
    }
  };

  return (
    <IonPage className="orders-page">
      <IonContent fullscreen className="orders-content">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <div className="page-header">
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Track your order history and status</p>
        </div>
        
        <div className="orders-container">
          {loading ? (
            <div className="orders-loading">
              <IonSpinner name="crescent" />
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="orders-error">
              <IonIcon icon={cartOutline} />
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
              <IonButton fill="outline" onClick={fetchOrders}>
                Try Again
              </IonButton>
            </div>
          ) : orders.length === 0 ? (
            <div className="no-orders">
              <IonIcon icon={cartOutline} />
              <h3>No Orders Yet</h3>
              <p>Your order history will appear here</p>
              <IonButton routerLink="/menu" fill="outline">
                Start Shopping
              </IonButton>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <div className="order-id-container">
                      <div className="order-id">
                        <IonIcon icon={bagCheckOutline} />
                        <span>#{order.orderNumber}</span>
                      </div>
                      <div className={`order-status ${getStatusClass(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                    <div className="order-date">
                      <IonIcon icon={timeOutline} />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>

                  <div className="order-summary">
                    <div className="order-items-summary">
                      <IonBadge color="light">{getItemCount(order.items)} items</IonBadge>
                      <IonText color="medium" className="order-items-preview">
                        {order.items.slice(0, 2).map(item => item.name).join(', ')}
                        {order.items.length > 2 && '...'}
                      </IonText>
                    </div>
                    <div className="order-total">
                      <strong>₹{order.total.toFixed(2)}</strong>
                    </div>
                  </div>

                  <button 
                    className="order-details-btn" 
                    onClick={() => handleViewDetails(order)}
                    aria-label={`View details for order ${order.orderNumber}`}
                    type="button"
                  >
                    View Details
                    <IonIcon icon={chevronForwardOutline} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Orders;
