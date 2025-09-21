import { useEffect, useState } from 'react';
import { IonContent, IonPage, IonButton, IonInput, IonItem, IonLabel, IonSpinner, IonHeader, IonToolbar, IonButtons, IonBackButton, IonToast, IonIcon, IonList, IonGrid, IonRow, IonCol, IonTitle } from '@ionic/react';
import { pencilOutline, trashOutline, closeCircleOutline, eyeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import '../styles/AdminDashboardMobile.css';
import { 
  getAllOrders, 
  getOrderById, 
  updateOrderStatus,
  formatOrdersForAdmin 
} from '../utils/mockOrdersApi';

const API_BASE = 'https://grocemate-bckend.onrender.com/api/admin';

function getToken() {
  return localStorage.getItem('token');
}

async function apiGet(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      const errorData = await res.json();
      return { error: true, message: errorData.message || 'Request failed' };
    }
    return await res.json();
  } catch (error) {
    console.error('API Get Error:', error);
    return { error: true, message: 'Network error. Please check your connection.' };
  }
}

async function apiPost(path: string, body: any) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorData = await res.json();
      return { error: true, message: errorData.message || 'Request failed' };
    }
    return await res.json();
  } catch (error) {
    console.error('API Post Error:', error);
    return { error: true, message: 'Network error. Please check your connection.' };
  }
}

async function apiPut(path: string, body: any) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorData = await res.json();
      return { error: true, message: errorData.message || 'Request failed' };
    }
    return await res.json();
  } catch (error) {
    return { error: true, message: 'Network error. Please check your connection.' };
  }
}

async function apiDelete(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (!res.ok) {
      const errorData = await res.json();
      return { error: true, message: errorData.message || 'Request failed' };
    }
    return await res.json();
  } catch (error) {
    console.error('API Delete Error:', error);
    return { error: true, message: 'Network error. Please check your connection.' };
  }
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'products' | 'orders'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // Order items modal state
  const [orderItemsModalOpen, setOrderItemsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Form states
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'user', id: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', id: '' });
  const [productForm, setProductForm] = useState({ 
    name: '', 
    price: '', 
    image: '', 
    category: '', 
    featured: false,
    id: '' 
  });
  const [orderStatusForm, setOrderStatusForm] = useState({ 
    id: '', 
    status: '',
    orderNumber: '',
    customerName: ''
  });

  // Fetch all data
  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);

    if (window.location.hostname === 'localhost' && !window.location.port.includes('5000')) {
      try {
        // Get users, categories, and products from mock data
        const usersRes = await apiGet('/users');
        const categoriesRes = await apiGet('/categories');
        const productsRes = await apiGet('/products');
        
        // Get orders from our mock API
        const ordersFromStorage = await getAllOrders();
        
        setUsers(Array.isArray(usersRes) ? usersRes : []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setProducts(Array.isArray(productsRes) ? productsRes : []);
        setOrders(formatOrdersForAdmin(ordersFromStorage));
        
        console.log('Orders loaded from mock API:', ordersFromStorage);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      
      setLoading(false);
      return;
    }
    
    // For API implementation
    const usersRes = await apiGet('/users');
    const categoriesRes = await apiGet('/categories');
    const productsRes = await apiGet('/products');
    const ordersRes = await apiGet('/orders');
    setUsers(Array.isArray(usersRes) ? usersRes : []);
    setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
    setProducts(Array.isArray(productsRes) ? productsRes : []);
    setOrders(Array.isArray(ordersRes) ? ordersRes : []);
    setLoading(false);
  }

  // --- USERS ---
  async function handleUserSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { role: userForm.role };
      const response = await apiPut(`/users/${userForm.id}`, updateData);
      
      if (!response.error) {
        const updatedUsers = users.map(user => 
          user._id === userForm.id ? { ...user, role: userForm.role } : user
        );
        setUsers(updatedUsers);
        setNotification({
          show: true,
          message: 'User role updated successfully',
          type: 'success'
        });
        setUserForm({ name: '', email: '', role: 'user', id: '' });
      } else {
        setNotification({
          show: true,
          message: response.message || 'Error updating user role',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  function handleUserEdit(u: any) {
    setUserForm({ 
      name: u.name || '', 
      email: u.email || '', 
      role: u.role || 'user', 
      id: u._id 
    });
  }

  async function handleUserDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true);
      try {
        const response = await apiDelete(`/users/${id}`);
        if (!response.error) {
          setUsers(users.filter(user => user._id !== id));
          setNotification({
            show: true,
            message: 'User deleted successfully',
            type: 'success'
          });
        } else {
          setNotification({
            show: true,
            message: response.message || 'Error deleting user',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        setLoading(false);
      }
    }
  }

  // --- CATEGORIES ---
  async function handleCategorySubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (!categoryForm.name.trim()) {
        setNotification({
          show: true,
          message: 'Category name is required',
          type: 'error'
        });
        setLoading(false);
        return;
      }

      const response = categoryForm.id 
        ? await apiPut(`/categories/${categoryForm.id}`, categoryForm)
        : await apiPost('/categories', categoryForm);

      if (!response.error) {
        // Refresh categories list immediately
        const updatedCategories = await apiGet('/categories');
        setCategories(Array.isArray(updatedCategories) ? updatedCategories : []);
        
        setCategoryForm({ name: '', id: '' });
        setNotification({
          show: true,
          message: `Category ${categoryForm.id ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
      } else {
        setNotification({
          show: true,
          message: response.message || 'Error processing category',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error processing category:', error);
      setNotification({
        show: true,
        message: 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryEdit(c: any) {
    setCategoryForm({ name: c.name, id: c._id });
  }

  async function handleCategoryDelete(id: string) {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        const response = await apiDelete(`/categories/${id}`);
        if (!response.error) {
          const updatedCategories = await apiGet('/categories');
          setCategories(Array.isArray(updatedCategories) ? updatedCategories : []);
          setNotification({
            show: true,
            message: 'Category deleted successfully',
            type: 'success'
          });
        } else {
          setNotification({
            show: true,
            message: response.message || 'Error deleting category',
            type: 'error'
          });
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        setNotification({
          show: true,
          message: 'Network error. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    }
  }

  // --- ORDERS ---
  function showOrderItems(order: any) {
    const formattedOrder = {
      ...order,
      // Handle different possible order item structures
      orderItems: order.products?.map((item: any) => ({
        product: item.product || item,
        quantity: item.quantity
      })) || order.items?.map((item: any) => ({
        product: {
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image
        },
        quantity: item.quantity
      })) || []
    };
    
    console.log('Showing order details:', formattedOrder);
    setSelectedOrder(formattedOrder);
    setOrderItemsModalOpen(true);
  }

  function closeOrderItemsModal() {
    setOrderItemsModalOpen(false);
    setSelectedOrder(null);
  }
  
  async function handleOrderStatusUpdate(e: React.FormEvent | { preventDefault: () => void }) {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!orderStatusForm.id || !orderStatusForm.status) {
      setNotification({
        show: true,
        message: 'Please select an order and status',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {

      if (window.location.hostname === 'localhost' && !window.location.port.includes('5000')) {

        const updatedOrder = await updateOrderStatus(orderStatusForm.id, orderStatusForm.status);
        const refreshedOrders = await getAllOrders();
        setOrders(formatOrdersForAdmin(refreshedOrders));
        
        setNotification({
          show: true,
          message: 'Order status updated successfully',
          type: 'success'
        });

        if (selectedOrder && (selectedOrder._id === orderStatusForm.id || selectedOrder.orderNumber === orderStatusForm.id)) {
          setSelectedOrder({
            ...selectedOrder,
            status: updatedOrder.status,
            deliveryStatus: updatedOrder.deliveryStatus
          });
        }

        if ('target' in e) {
          setOrderStatusForm({ id: '', status: '', orderNumber: '', customerName: '' });
        }
        
        setLoading(false);
        return;
      }

      const response = await apiPut(`/orders/${orderStatusForm.id}/status`, {
        deliveryStatus: orderStatusForm.status
      });

      if (!response.error) {
        const updatedOrders = orders.map(order => 
          order._id === orderStatusForm.id ? { 
            ...order, 
            deliveryStatus: orderStatusForm.status,
            status: orderStatusForm.status
          } : order
        );

        setOrders(updatedOrders);

        if (selectedOrder && selectedOrder._id === orderStatusForm.id) {
          setSelectedOrder({
            ...selectedOrder,
            status: orderStatusForm.status,
            deliveryStatus: orderStatusForm.status
          });
        }
        
        setNotification({
          show: true,
          message: 'Order status updated successfully',
          type: 'success'
        });

        if ('target' in e) {
          setOrderStatusForm({ id: '', status: '', orderNumber: '', customerName: '' });
        }
      } else {
        setNotification({
          show: true,
          message: response.message || 'Error updating order status',
          type: 'error'
        });
      }
    } catch (error) {
      setNotification({
        show: true,
        message: 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }

  function handleOrderEdit(order: any) {
    setOrderStatusForm({
      id: order._id,
      status: order.deliveryStatus || 'pending',
      orderNumber: order.orderNumber || (order._id.substring(order._id.length - 6).toUpperCase()),
      // Improve customer name logic to use delivery address name when user name is not available
      customerName: order.user?.name || order.deliveryAddress?.fullName || 'Unknown Customer'
    });
  }

  // --- PRODUCTS ---
  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting product form:', productForm); // Debug log
      
      if (!productForm.name.trim() || !productForm.price || !productForm.category) {
        setNotification({
          show: true,
          message: 'Name, price, and category are required',
          type: 'error'
        });
        setLoading(false);
        return;
      }

      const productData = {
        name: productForm.name.trim(),
        price: parseFloat(productForm.price),
        image: productForm.image.trim(),
        category: productForm.category,
        featured: productForm.featured // Ensure this is included
      };

      console.log('Product data being sent:', productData); // Debug log

      const response = productForm.id 
        ? await apiPut(`/products/${productForm.id}`, productData)
        : await apiPost('/products', productData);

      if (!response.error) {
        // Refresh products list
        const updatedProducts = await apiGet('/products');
        setProducts(Array.isArray(updatedProducts) ? updatedProducts : []);
        
        setProductForm({ name: '', price: '', image: '', category: '', featured: false, id: '' });
        setNotification({
          show: true,
          message: `Product ${productForm.id ? 'updated' : 'created'} successfully`,
          type: 'success'
        });
      } else {
        setNotification({
          show: true,
          message: response.message || 'Error processing product',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error processing product:', error);
      setNotification({
        show: true,
        message: 'Network error. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  }
  function handleProductEdit(p: any) {
    setProductForm({
      name: p.name,
      price: p.price,
      image: p.image,
      category: p.category?._id || '',
      featured: p.featured || false, 
      id: p._id
    });
  }
  async function handleProductDelete(id: string) {
    await apiDelete(`/products/${id}`);
    setProducts(await apiGet('/products'));
  }

  return (
    <IonPage className="admin-page">
      <IonContent fullscreen className="admin-dashboard-content">
        <div className="admin-dashboard-full">
          <div className="page-header">
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Manage your store's content</p>
          </div>
          
          <IonToast
            isOpen={notification.show}
            onDidDismiss={() => setNotification({ ...notification, show: false })}
            message={notification.message}
            duration={3000}
            color={notification.type === 'success' ? 'success' : 'danger'}
            position="top"
          />
          <div className="admin-dashboard-tabs">
            <IonButton 
              expand="block"
              fill={activeTab === 'users' ? 'solid' : 'outline'} 
              onClick={() => setActiveTab('users')}
            >
              Users
            </IonButton>
            <IonButton 
              expand="block"
              fill={activeTab === 'categories' ? 'solid' : 'outline'} 
              onClick={() => setActiveTab('categories')}
            >
              Categories
            </IonButton>
            <IonButton 
              expand="block"
              fill={activeTab === 'products' ? 'solid' : 'outline'} 
              onClick={() => setActiveTab('products')}
            >
              Products
            </IonButton>
            <IonButton 
              expand="block"
              fill={activeTab === 'orders' ? 'solid' : 'outline'} 
              onClick={() => setActiveTab('orders')}
            >
              Orders
            </IonButton>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <IonSpinner />
            </div>
          ) : (
            <>
              {activeTab === 'users' && (
                <>
                  {userForm.id && (
                    <form className="admin-form" onSubmit={handleUserSubmit}>
                      <div className="simple-admin-form">
                        <div className="simple-admin-field">
                          <label className="simple-admin-label required" htmlFor="userRole">
                            User Role
                          </label>
                          <select 
                            id="userRole"
                            className="simple-admin-select"
                            value={userForm.role} 
                            onChange={e => setUserForm(f => ({ ...f, role: e.target.value }))}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div className="action-buttons">
                          <button type="submit" className="simple-admin-btn">
                            Update Role
                          </button>
                          <button 
                            type="button"
                            className="simple-admin-btn outline" 
                            onClick={() => setUserForm({ name: '', email: '', role: 'user', id: '' })}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u._id}>
                            <td data-label="Name">
                              <div className="cell-content">{u.name}</div>
                            </td>
                            <td data-label="Email">
                              <div className="cell-content">{u.email}</div>
                            </td>
                            <td data-label="Role">
                              <div className="cell-content">{u.role}</div>
                            </td>
                            <td data-label="Actions">
                              <div className="table-action-buttons">
                                <button className="simple-table-btn edit" onClick={() => handleUserEdit(u)}>
                                  <IonIcon icon={pencilOutline} />
                                </button>
                                <button className="simple-table-btn danger" onClick={() => handleUserDelete(u._id)}>
                                  <IonIcon icon={trashOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === 'categories' && (
                <>
                  <form className="admin-form" onSubmit={handleCategorySubmit}>
                    <div className="simple-admin-form">
                      <div className="simple-admin-field">
                        <label className="simple-admin-label required" htmlFor="categoryName">
                          Category Name
                        </label>
                        <input
                          id="categoryName"
                          className="simple-admin-input"
                          type="text"
                          value={categoryForm.name}
                          onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Enter category name"
                          required
                        />
                      </div>
                      <div className="action-buttons">
                        <button type="submit" className="simple-admin-btn">
                          {categoryForm.id ? 'Update' : 'Add'} Category
                        </button>
                        {categoryForm.id && (
                          <button 
                            type="button"
                            className="simple-admin-btn outline" 
                            onClick={() => setCategoryForm({ name: '', id: '' })}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map(c => (
                          <tr key={c._id}>
                            <td data-label="Name">
                              <div className="cell-content">{c.name}</div>
                            </td>
                            <td data-label="Actions">
                              <div className="table-action-buttons">
                                <button className="simple-table-btn edit" onClick={() => handleCategoryEdit(c)}>
                                  <IonIcon icon={pencilOutline} />
                                </button>
                                <button className="simple-table-btn danger" onClick={() => handleCategoryDelete(c._id)}>
                                  <IonIcon icon={trashOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {activeTab === 'products' && (
                <>
                  <form className="admin-form" onSubmit={handleProductSubmit}>
                    <div className="simple-admin-form">
                      <div className="simple-admin-field">
                        <label className="simple-admin-label required" htmlFor="productName">
                          Product Name
                        </label>
                        <input
                          id="productName"
                          className="simple-admin-input"
                          type="text"
                          value={productForm.name}
                          onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Enter product name"
                          required
                        />
                      </div>
                      <div className="simple-admin-field">
                        <label className="simple-admin-label required" htmlFor="productPrice">
                          Price
                        </label>
                        <input
                          id="productPrice"
                          className="simple-admin-input"
                          type="number"
                          value={productForm.price}
                          onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                          placeholder="Enter price"
                          required
                        />
                      </div>
                      <div className="simple-admin-field">
                        <label className="simple-admin-label" htmlFor="productImage">
                          Image URL
                        </label>
                        <input
                          id="productImage"
                          className="simple-admin-input"
                          type="text"
                          value={productForm.image}
                          onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))}
                          placeholder="Enter image URL"
                        />
                      </div>
                      <div className="simple-admin-field">
                        <label className="simple-admin-label required" htmlFor="productCategory">
                          Category
                        </label>
                        <select
                          id="productCategory"
                          className="simple-admin-select"
                          value={productForm.category}
                          onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Featured product dropdown - replacing checkbox */}
                      <div className="simple-admin-field">
                        <label className="simple-admin-label" htmlFor="productFeatured">
                          Featured Product
                        </label>
                        <select
                          id="productFeatured"
                          className="simple-admin-select"
                          value={productForm.featured ? 'yes' : 'no'}
                          onChange={e => setProductForm(f => ({ ...f, featured: e.target.value === 'yes' }))}
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                        <p className="featured-description">
                          Featured products will appear on the homepage
                        </p>
                      </div>
                      
                      <div className="action-buttons">
                        <button type="submit" className="simple-admin-btn">
                          {productForm.id ? 'Update' : 'Add'} Product
                        </button>
                        {productForm.id && (
                          <button 
                            type="button"
                            className="simple-admin-btn outline" 
                            onClick={() => setProductForm({ name: '', price: '', image: '', category: '', featured: false, id: '' })}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </form>

                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th><th>Price</th><th>Category</th><th>Featured</th><th>Image</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(p => (
                          <tr key={p._id}>
                            <td data-label="Name">
                              <div className="cell-content">{p.name}</div>
                            </td>
                            <td data-label="Price">
                              <div className="cell-content">₹{p.price}</div>
                            </td>
                            <td data-label="Category">
                              <div className="cell-content">{p.category?.name || ''}</div>
                            </td>
                            <td data-label="Featured">
                              <div className="cell-content">{p.featured ? 'Yes' : 'No'}</div>
                            </td>
                            <td data-label="Image">
                              <div className="cell-content">
                                {p.image && <img src={p.image} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />}
                              </div>
                            </td>
                            <td data-label="Actions">
                              <div className="table-action-buttons">
                                <button className="simple-table-btn edit" onClick={() => handleProductEdit(p)}>
                                  <IonIcon icon={pencilOutline} />
                                </button>
                                <button className="simple-table-btn danger" onClick={() => handleProductDelete(p._id)}>
                                  <IonIcon icon={trashOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
              
              {activeTab === 'orders' && (
                <>
                  <h2>Order Management</h2>
                  
                  {/* Order Status Update Form - only show when order is selected */}
                  {orderStatusForm.id && (
                    <form onSubmit={handleOrderStatusUpdate} className="admin-form">
                      <div className="form-wrapper">
                        <h3>Update Order Status</h3>
                        
                        <div className="simple-admin-field">
                          <label className="simple-admin-label">Order Number</label>
                          <p>{orderStatusForm.orderNumber}</p>
                        </div>
                        
                        <div className="simple-admin-field">
                          <label className="simple-admin-label">Customer</label>
                          <p>{orderStatusForm.customerName}</p>
                        </div>
                        
                        <div className="simple-admin-field">
                          <label className="simple-admin-label required" htmlFor="orderStatus">
                            Status
                          </label>
                          <select
                            id="orderStatus"
                            className="simple-admin-select"
                            value={orderStatusForm.status}
                            onChange={e => setOrderStatusForm(f => ({ ...f, status: e.target.value }))}
                            required
                          >
                            <option value="">Select Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">On Its Way</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                        
                        <div className="action-buttons">
                          <button type="submit" className="simple-admin-btn">
                            Update Status
                          </button>
                          <button 
                            type="button"
                            className="simple-admin-btn outline" 
                            onClick={() => setOrderStatusForm({ id: '', status: '', orderNumber: '', customerName: '' })}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Order Number</th>
                          <th>Customer</th>
                          <th>Date</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order._id || order.orderNumber}>
                            <td data-label="Order Number">
                              <div className="cell-content">
                                <span 
                                  className="order-number-link" 
                                  onClick={() => showOrderItems(order)}
                                >
                                  {order.orderNumber || order._id.substring(order._id.length - 6).toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td data-label="Customer">
                              <div className="cell-content">
                                {order.user?.name || order.deliveryAddress?.fullName || 'Unknown Customer'}
                              </div>
                            </td>
                            <td data-label="Date">
                              <div className="cell-content">{new Date(order.createdAt).toLocaleDateString()}</div>
                            </td>
                            <td data-label="Total">
                              <div className="cell-content">₹{order.total}</div>
                            </td>
                            <td data-label="Status">
                              <div className="cell-content">
                                <span className={`status-badge status-${order.deliveryStatus}`}>
                                  {order.status || order.deliveryStatus}
                                </span>
                              </div>
                            </td>
                            <td data-label="Actions">
                              <div className="table-action-buttons">
                                <button 
                                  className="simple-table-btn view-icon" 
                                  onClick={() => window.location.href = `/admin-order-details/${order.orderNumber || order._id}`}
                                  title="View Order Details"
                                >
                                  <IonIcon icon={eyeOutline} />
                                </button>
                                <button 
                                  className="simple-table-btn edit" 
                                  onClick={() => handleOrderEdit(order)}
                                  title="Edit Order Status"
                                >
                                  <IonIcon icon={pencilOutline} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      
      </IonContent>
    </IonPage>
  );
};

