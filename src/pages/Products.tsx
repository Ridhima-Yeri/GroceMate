import { IonContent, IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonToast, IonTitle, IonButton, IonIcon, IonList, IonItem, IonLabel, IonCheckbox } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../api/api';
import { useCart } from '../contexts/CartContext';
import { filterOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Product.css';
import '../styles/ProductsMobile.css';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category?: Category;
  featured?: boolean;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

const Products: React.FC = () => {
  const location = useLocation();
  // Sync state with URL params on initial load and when location.search changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category') || 'all';
    const featured = params.get('featured') === 'true';
    setSelectedCategory(category);
    setShowFeaturedOnly(featured);
  }, [location.search]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add toast notification state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Use cart context
  const { addToCart } = useCart();

  // Fetch products and categories from backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use getProducts() for consistent API response
        const [productsResponse, categoriesResponse] = await Promise.all([
          getProducts(),
          getCategories()
        ]);

        if (productsResponse.error) {
          setError(productsResponse.message);
          setAllProducts([]);
          setFilteredProducts([]);
        } else {
          const products = productsResponse.data || [];
          setAllProducts(products);
          setFilteredProducts(products);
          setError(null);
        }

        if (!categoriesResponse.error) {
          setCategories(categoriesResponse.data || []);
        }
      } catch (err) {
        setError('Failed to fetch data');
        setAllProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle filtering
  useEffect(() => {
    let filtered = [...allProducts];

    // Filter by featured if requested
    if (showFeaturedOnly) {
      filtered = filtered.filter((product: Product) => product.featured === true);
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((product: Product) => 
        product.category?._id === selectedCategory || 
        product.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [allProducts, selectedCategory, showFeaturedOnly, searchTerm]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsCategoryDropdownOpen(false);
    
    // Update URL with new category
    const params = new URLSearchParams(location.search);
    params.set('category', categoryId);
    window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
  };

  // Handle adding product to cart
  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  // Get product count for each category
  const getCategoryCount = (categoryId: string) => {
    if (categoryId === 'all') return allProducts.length;
    return allProducts.filter((product: Product) => product.category?._id === categoryId).length;
  };

  // Get selected category name
  const getSelectedCategoryName = () => {
    if (selectedCategory === 'all') return 'All Products';
    const category = categories.find((c: Category) => c._id === selectedCategory);
    return category ? category.name : 'All Products';
  };

  // Handle opening the categories dropdown
  const handleCategoriesButtonClick = () => {
    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
  };

  return (
    <IonPage className="products-page">
      <IonHeader>
        {/* Toolbar removed as requested */}
      </IonHeader>
      <IonContent fullscreen className="products-content">
        {loading ? (
          <LoadingSpinner message="Loading products..." size="large" fullPage={true} />
        ) : (
          <>
            <div className="page-header">
              <h1 className="page-title">Products</h1>
              <p>Explore our fresh range of products below.</p>
              {/* Search input below header-title */}
              <div className="products-search-container" style={{ margin: '1rem 0', width: '100%', maxWidth: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <input
                    type="text"
                    className="products-search-input"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearchTerm('')}
                      style={{ marginLeft: '0.5rem', background: '#eee', border: 'none', borderRadius: '50%', width: '2rem', height: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <IonIcon icon={closeOutline} style={{ fontSize: '1.2rem' }} />
                    </button>
                  )}
                </div>
              </div>
              {/* Categories Button with Dropdown - Only show if categories exist */}
              {categories.length > 0 && (
                <div className="categories-dropdown-container">
                  <button 
                    className="categories-button"
                    onClick={handleCategoriesButtonClick}
                    aria-label="Filter by category"
                  >
                    <IonIcon icon={filterOutline} />
                    <span>Categories</span>
                    <span className="selected-category">({getSelectedCategoryName()})</span>
                  </button>
                  {isCategoryDropdownOpen && (
                    <div className="categories-dropdown">
                      <div 
                        className={`category-item ${selectedCategory === 'all' ? 'selected' : ''}`}
                        onClick={() => handleCategorySelect('all')}
                      >
                        <span>All Products</span>
                        <span className="item-count">({getCategoryCount('all')})</span>
                        {selectedCategory === 'all' && <IonIcon icon={checkmarkOutline} />}
                      </div>
                      
                      {categories.map(category => (
                        <div 
                          key={category._id}
                          className={`category-item ${selectedCategory === category._id ? 'selected' : ''}`}
                          onClick={() => handleCategorySelect(category._id)}
                        >
                          <span>{category.name}</span>
                          <span className="item-count">({getCategoryCount(category._id)})</span>
                          {selectedCategory === category._id && <IonIcon icon={checkmarkOutline} />}
                        </div>
                      ))}
                      
                      {/* Featured products filter */}
                      <div 
                        className="category-item featured-filter"
                        onClick={() => {
                          const newFeaturedState = !showFeaturedOnly;
                          setShowFeaturedOnly(newFeaturedState);
                          
                          // Update URL with featured status
                          const params = new URLSearchParams(location.search);
                          if (newFeaturedState) {
                            params.set('featured', 'true');
                          } else {
                            params.delete('featured');
                          }
                          window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
                        }}
                      >
                        <span>Featured Products Only</span>
                        <IonCheckbox 
                          checked={showFeaturedOnly} 
                          onIonChange={(e) => {
                            const newFeaturedState = e.detail.checked;
                            setShowFeaturedOnly(newFeaturedState);
                            
                            // Update URL with featured status
                            const params = new URLSearchParams(location.search);
                            if (newFeaturedState) {
                              params.set('featured', 'true');
                            } else {
                              params.delete('featured');
                            }
                            window.history.pushState({}, '', `${location.pathname}?${params.toString()}`);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="products-list">
              {error ? (
                <div className="error-message">{error}</div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map((product: Product) => (
                  <div className="product-card" key={product._id}>
                    <img className="product-image" src={product.image} alt={product.name} />
                    <div className="product-info">
                      <div className="product-name">{product.name}</div>
                      <div className="product-price">₹{product.price}</div>
                      <div className="product-category">{product.category?.name}</div>
                      <button
                        className="product-add-btn"
                        type="button"
                        aria-label={`Add ${product.name} to cart`}
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-products">
                  <p>
                    {selectedCategory !== 'all'
                      ? `No products found in ${categories.find(c => c._id === selectedCategory)?.name || 'selected category'}`
                      : 'No products found'
                    }
                  </p>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Toast notification for cart additions */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2500}
          position="top"
          color="success"
          cssClass="toast-products"
          buttons={[
            {
              text: 'Dismiss',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Products;