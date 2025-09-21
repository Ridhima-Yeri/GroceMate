import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonText,
  IonBackButton,
  useIonViewDidEnter
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { closeOutline, locationOutline, callOutline, timeOutline, cardOutline, checkmarkCircleOutline, hourglassOutline, closeCircleOutline, alertCircleOutline, chevronBackOutline, printOutline } from 'ionicons/icons';
import '../styles/OrderDetails.css';
import '../styles/PageThemeForce.css';

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface DeliveryAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
}

interface OrderDetails {
  id: string;
  date: string;
  total: string;
  status: string;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  paymentMethod?: string;
  phoneNumber?: string;
  orderNotes?: string;
}

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const history = useHistory();
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useIonViewDidEnter(() => {
    document.querySelector('.order-details-page')?.classList.add('theme-applied');
    setTimeout(() => {
      document.querySelector('.order-details-page')?.classList.remove('theme-applied');
    }, 10);
  });

  const getStatusColor = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'delivered': return 'success';
      case 'processing': return 'warning';
      case 'shipped': return 'tertiary';
      case 'cancelled': return 'danger';
      default: return 'medium';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch(status.toLowerCase()) {
      case 'delivered': return checkmarkCircleOutline;
      case 'processing': return hourglassOutline;
      case 'shipped': return timeOutline;
      case 'cancelled': return closeCircleOutline;
      default: return alertCircleOutline;
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    const fetchOrderDetails = () => {
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const matchedOrder = orders.find((o: any) => o.orderNumber === orderId || o._id === orderId);
        if (matchedOrder) {
          setOrder({
            id: matchedOrder.orderNumber,
            date: matchedOrder.createdAt,
            total: `₹${matchedOrder.total.toFixed(2)}`,
            status: matchedOrder.status,
            items: matchedOrder.items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: `₹${item.price.toFixed(2)}`
            })),
            deliveryAddress: matchedOrder.deliveryAddress ? { ...matchedOrder.deliveryAddress } : undefined,
            paymentMethod: matchedOrder.paymentMethod,
            phoneNumber: matchedOrder.deliveryAddress?.phone,
            orderNotes: matchedOrder.orderNotes
          });
        } else {
          setNotFound(true);
        }
      } catch (error) {
        setNotFound(true);
      }
    };
    fetchOrderDetails();
  }, [orderId, history]);

  const handleGoBack = () => {
    history.replace('/orders');
  };
  
  const handlePrint = () => {
    if (!order) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('GroceMate - Order Invoice', 20, 20);

    doc.setFontSize(12);
    doc.text(`Order Number: ${order.id}`, 20, 35);
    doc.text(`Order Date: ${formatDate(order.date)}`, 20, 43);
    doc.text(`Status: ${order.status}`, 20, 51);

    if (order.deliveryAddress) {
      doc.text('Delivery Information:', 20, 63);
      doc.text(`Address: ${order.deliveryAddress}`, 25, 71);
      if (order.phoneNumber) doc.text(`Phone: ${order.phoneNumber}`, 25, 79);
    }

    if (order.paymentMethod) {
      doc.text('Payment Information:', 20, 91);
      doc.text(`Method: ${order.paymentMethod}`, 25, 99);
    }

    let y = 111;
    doc.text('Order Items:', 20, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Item', 20, y);
    doc.text('Qty', 70, y);
    doc.text('Price', 100, y);
    doc.text('Subtotal', 140, y);
    doc.setFont('helvetica', 'normal');
    y += 7;
    order.items.forEach((item) => {
      doc.text(item.name, 20, y);
      doc.text(String(item.quantity), 70, y);
      doc.text(item.price, 100, y);
      doc.text(`₹${(parseFloat(item.price.replace('₹', '')) * item.quantity).toFixed(2)}`, 140, y);
      y += 7;
    });

    y += 5;
    doc.text(`Items Subtotal: ${order.total}`, 20, y);
    y += 7;
    doc.text(`Delivery Charges: ${parseFloat(order.total.replace('₹', '')) > 500 ? 'FREE' : '₹40.00'}`, 20, y);
    y += 7;
    doc.text(`GST (5%): ₹${(parseFloat(order.total.replace('₹', '')) * 0.05).toFixed(2)}`, 20, y);
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text(`Final Total: ₹${(
      parseFloat(order.total.replace('₹', '')) +
      (parseFloat(order.total.replace('₹', '')) > 500 ? 0 : 40) +
      parseFloat(order.total.replace('₹', '')) * 0.05
    ).toFixed(2)}`, 20, y);
    doc.setFont('helvetica', 'normal');

    if (order.orderNotes) {
      y += 10;
      doc.text('Special Instructions:', 20, y);
      y += 7;
      doc.text(order.orderNotes, 25, y);
    }

    doc.save(`Order_${order.id}_Invoice.pdf`);
  };

  if (notFound) {
    return (
      <IonPage className="order-details-page admin-page">
        <IonHeader>
          <IonToolbar className="themed-toolbar">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/orders" text="" />
            </IonButtons>
            <IonTitle className="admin-dashboard-title">Order Details</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="admin-dashboard-content" color="background">
          <div className="admin-dashboard-full" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#ff5252', marginBottom: 12 }}>Order Not Found</h2>
              <p style={{ color: '#ccc' }}>We couldn't find the details for this order. It may have been removed or is unavailable.</p>
              <IonButton routerLink="/orders" color="primary" style={{ marginTop: 24 }}>Back to Orders</IonButton>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }
  if (!order) return null;

  return (
    <IonPage className="order-details-page admin-page">
      <IonHeader className="no-print">
        <IonToolbar className="themed-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/orders" />
          </IonButtons>
          <IonTitle className="admin-dashboard-title">Order Details</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleGoBack} fill="clear">
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="admin-dashboard-content" color="background">
        <div className="admin-dashboard-full">
          {/* Printable Content Section */}
          <div className="print-section">
            {/* Company Header - Only shows in print */}
            <div className="print-header">
              <h1>Order Invoice</h1>
              <p>Thank you for your order!</p>
            </div>

            {/* Order Details */}
            <div className="print-order-details">
              {/* Order Status Summary Card */}
              <div className="order-summary-card">
                <div className="order-summary-header">
                  <div className="order-id-section">
                    <h1>#{order.id}</h1>
                    <IonBadge color={getStatusColor(order.status)} className="status-badge-large">
                      <IonIcon icon={getStatusIcon(order.status)} />
                      {order.status}
                    </IonBadge>
                  </div>
                  
                  {/* Status Progress Indicator */}
                  <div className="status-progress">
                    <div className="progress-steps">
                      <div className={`progress-step ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'completed' : ''}`}>
                        <div className="step-icon">
                          <IonIcon icon={alertCircleOutline} />
                        </div>
                        <span>Pending</span>
                      </div>
                      <div className="progress-line"></div>
                      <div className={`progress-step ${['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'completed' : ''}`}>
                        <div className="step-icon">
                          <IonIcon icon={hourglassOutline} />
                        </div>
                        <span>Processing</span>
                      </div>
                      <div className="progress-line"></div>
                      <div className={`progress-step ${['shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'completed' : ''}`}>
                        <div className="step-icon">
                          <IonIcon icon={timeOutline} />
                        </div>
                        <span>Shipped</span>
                      </div>
                      <div className="progress-line"></div>
                      <div className={`progress-step ${order.status.toLowerCase() === 'delivered' ? 'completed' : ''}`}>
                        <div className="step-icon">
                          <IonIcon icon={checkmarkCircleOutline} />
                        </div>
                        <span>Delivered</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="order-meta">
                    <div className="order-date-info">
                      <IonIcon icon={timeOutline} />
                      <span>{formatDate(order.date)}</span>
                    </div>
              
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              <div className="simple-card">
                <div className="minimal-section">
                  <h2 className="minimal-title">Order Items</h2>
                  <table className="minimal-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.price}</td>
                          <td>₹{(parseFloat(item.price.replace('₹', '')) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} className="minimal-label">Items Subtotal</td>
                        <td className="minimal-value">{order.total}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="minimal-label">Delivery Charges</td>
                        <td className="minimal-value">{parseFloat(order.total.replace('₹', '')) > 500 ? 'FREE' : '₹40.00'}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="minimal-label">GST (5%)</td>
                        <td className="minimal-value">₹{(parseFloat(order.total.replace('₹', '')) * 0.05).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="minimal-label minimal-total">Final Total</td>
                        <td className="minimal-value minimal-total">₹{(
                          parseFloat(order.total.replace('₹', '')) +
                          (parseFloat(order.total.replace('₹', '')) > 500 ? 0 : 40) +
                          parseFloat(order.total.replace('₹', '')) * 0.05
                        ).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delivery Information */}
              {order.deliveryAddress && (
                <div className="simple-card">
                  <div className="minimal-section">
                    <h2 className="minimal-title">Delivery Information</h2>
                    <table className="minimal-table">
                      <tbody>
                        <tr>
                          <td className="minimal-label">Address</td>
                          <td className="minimal-value">
                            {order.deliveryAddress.addressLine1}
                            {order.deliveryAddress.addressLine2 && (<>, {order.deliveryAddress.addressLine2}</>)}<br />
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                          </td>
                        </tr>
                        {order.phoneNumber && (
                          <tr>
                            <td className="minimal-label">Phone Number</td>
                            <td className="minimal-value">{order.phoneNumber}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              {order.paymentMethod && (
                <div className="simple-card" style={{ marginBottom: '2rem' }}>
                  <div className="minimal-section">
                    <h2 className="minimal-title">Payment Information</h2>
                    <table className="minimal-table">
                      <tbody>
                        <tr>
                          <td className="minimal-label">Payment Method</td>
                          <td className="minimal-value">{order.paymentMethod}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              {order.orderNotes && (
                <div className="admin-form">
                  <h2 className="section-title-admin">
                    <IonIcon icon={alertCircleOutline} />
                    Special Instructions
                  </h2>
                  <div className="order-notes-admin">
                    <p>{order.orderNotes}</p>
                  </div>
                </div>
              )}
            </div>

            
          </div>

          {/* Non-printable Actions Section */}
          <div className="simple-card no-print">
            <div className="minimal-section">
              <h2 className="minimal-title">
                Quick Actions
              </h2>
              <div className="action-buttons">
                <button 
                  className="simple-admin-btn" 
                  onClick={handleGoBack}
                >
                  <IonIcon icon={locationOutline} />
                  Back to Orders
                </button>
                <button 
                  className="simple-admin-btn outline"
                  onClick={() => window.open('tel:+916366147567')}
                >
                  <IonIcon icon={callOutline} />
                  Call Customer Support
                </button>
                <button 
                  className="simple-admin-btn outline"
                  onClick={handlePrint}
                >
                  <IonIcon icon={printOutline} />
                  Print Order
                </button>
              </div>
            </div>
          </div>

        </div>
      </IonContent>
      </IonPage>
    );
}
export default OrderDetailsPage;
