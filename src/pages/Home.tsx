import { IonContent, IonPage, IonButton, IonIcon, IonGrid, IonRow, IonCol, IonToast } from '@ionic/react';
import { searchOutline, leafOutline, bagOutline, heartOutline, starOutline, trophyOutline, shieldCheckmarkOutline, peopleOutline, addOutline, mailOutline, callOutline } from 'ionicons/icons';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { getCategories, getProducts } from '../api/api';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Home.css';
import '../styles/FeatureMobile.css';
import '../styles/ThemeSupport.css';
import rupeeOutline from '../utils/custom-icons';

interface Category {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category?: {
    name: string;
  };
  featured: boolean;
  quantity?: number;
}

const Home: React.FC = () => {
  const history = useHistory();
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          getCategories(),
          getProducts()
        ]);
        
        if (!categoriesResponse.error) {
          setCategories(categoriesResponse.data?.slice(0, 6) || []);
        }
        
        if (!productsResponse.error) {
          const featured = productsResponse.data?.filter(
            (product: Product) => product.featured === true
          ) || [];
          
          const productsToShow = featured.length > 0 
            ? featured
            : productsResponse.data?.slice(0, 12) || [];
        
          setFeaturedProducts(productsToShow);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const handleSearch = () => {
    if (searchTerm.trim()) {
      history.push(`/menu?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    history.push(`/menu?category=${categoryId}`);
  };

  const handleAddToCart = (product: Product, event: React.MouseEvent) => {
    event.stopPropagation();
    addToCart(product);
    setToastMessage(`${product.name} added to cart!`);
    setShowToast(true);
  };

  const getCategoryPosition = (index: number): string => {
    return index % 2 === 0 ? 'from-left' : 'from-right';
  };

  return (
    <IonPage>
      <IonContent fullscreen className="home-content">
        {/* Hero Section */}
        <div className="home-bg">
          <video 
            className="home-video" 
            autoPlay 
            muted 
            loop 
            playsInline
            onError={(e) => console.error('Video failed to load:', e)}
            onLoadStart={() => console.log('Video loading started')}
            onCanPlay={() => console.log('Video can play')}
          >
            <source src="/prod.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="home-overlay"></div>
          <div className="home-center">
            <h1 className="home-title">Fresh Groceries Delivered</h1>
            <p className="home-subtitle">Quality products at your doorstep</p>
            <div className="home-search-container">
              <div className="search-wrapper">
                <input
                  className="home-search"
                  type="text"
                  placeholder="Search for fresh groceries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="section categories-section">
          <div className="container">
            <h2 className="section-title">Shop by Category</h2>
            <div className="categories-grid">
              {loading ? (
                <LoadingSpinner message="Loading categories..." size="medium" />
              ) : categories.length > 0 ? (
                categories.map((category, index) => (
                  <div 
                    key={category._id} 
                    className={`category-card ${getCategoryPosition(index)}`}
                    onClick={() => handleCategoryClick(category._id)}
                  >
                    <div className="category-content">
                      <h3>{category.name}</h3>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-categories-message">No categories available</div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div className="section featured-section">
          <div className="container">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Hand-picked fresh items just for you</p>
            
            <div className="featured-products-horizontal-container">
              {loading ? (
                <LoadingSpinner message="Loading featured products..." size="large" />
              ) : featuredProducts.length > 0 ? (
                <div className="featured-products-horizontal-scroll">
                  {featuredProducts.map((product, index) => {

                    const badgeTypes = ['Featured', 'Hot', 'New', 'Sale'];
                    const badgeClasses = ['badge-featured', 'badge-hot', 'badge-new', 'badge-sale'];
                    const currentBadge = badgeTypes[index % badgeTypes.length];
                    const currentBadgeClass = badgeClasses[index % badgeClasses.length];
                    
                    return (
                      <div className="featured-product-card" key={product._id}>
                        <div className="featured-product-image">
                          <img src={product.image} alt={product.name} />
                          <div className={`product-badge ${currentBadgeClass}`}>
                            <span className="badge-text">{currentBadge}</span>
                          </div>
                        </div>
                        <div className="featured-product-info">
                          <h3 className="featured-product-name">{product.name}</h3>
                          <p className="featured-product-category">{product.category?.name}</p>
                          <div className="featured-product-price">₹{product.price}</div>
                          <button 
                            className="featured-add-to-cart-btn"
                            onClick={(e) => handleAddToCart(product, e)}
                            aria-label={`Add ${product.name} to cart`}
                          >
                            <IonIcon icon={addOutline} />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-products-message">No featured products available.</div>
              )}
            </div>
            
            <div className="section-cta">
              <IonButton 
                expand="block" 
                fill="outline" 
                className="view-all-btn"
                routerLink="/menu"
              >
                View All Products
              </IonButton>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="section features-section">
          <div className="container">
            <h2 className="section-title">Why Choose GroceMate?</h2>
            
            <IonGrid className="features-grid">
              <IonRow>
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="feature-card">
                    <IonIcon icon={leafOutline} className="feature-icon" />
                    <h3>Fresh Quality</h3>
                    <p>Hand-picked fresh produce delivered daily to ensure the highest quality</p>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="feature-card">
                    <IonIcon icon={rupeeOutline} className="feature-icon" />
                    <h3>Best Prices</h3>
                    <p>Competitive pricing with regular discounts and offers for our customers</p>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="feature-card">
                    <IonIcon icon={shieldCheckmarkOutline} className="feature-icon" />
                    <h3>Safe Delivery</h3>
                    <p>Contactless delivery with proper hygiene and safety measures</p>
                  </div>
                </IonCol>
                <IonCol size="12" sizeMd="6" sizeLg="3">
                  <div className="feature-card">
                    <IonIcon icon={peopleOutline} className="feature-icon" />
                    <h3>24/7 Support</h3>
                    <p>Round-the-clock customer support to help you with any queries</p>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </div>

        {/* About Us Section */}
        <div className="section about-section">
          <div className="container">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="12" sizeLg="6">
                  <div className="about-content">
                    <h2 className="section-title">About GroceMate</h2>
                    <p className="about-text">
                      We're passionate about bringing fresh, quality groceries right to your doorstep. 
                      Founded with a mission to make grocery shopping convenient and accessible for everyone, 
                      GroceMate connects you with the finest local suppliers and farmers.
                    </p>
                    <p className="about-text">
                      Our commitment to quality, freshness, and customer satisfaction drives everything we do. 
                      From farm-fresh vegetables to premium pantry staples, we ensure every product meets 
                      our high standards before it reaches your home.
                    </p>
                  </div>
                </IonCol>
                <IonCol size="12" sizeLg="6">
                  <div className="about-image">
                    <img src="/GroceMate.webp" alt="About GroceMate" />
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </div>
        </div>

        {/* CTA Section */}
        <div className="section cta-section">
          <div className="container">
            <div className="cta-content">
              <h2>Start Shopping Today!</h2>
              <p>Join thousands of satisfied customers who trust GroceMate for their daily needs</p>
              <IonButton 
                expand="block" 
                size="large" 
                className="cta-btn"
                routerLink="/menu"
              >
                Shop Now
              </IonButton>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <footer className="home-footer">
          <div className="footer-content">
            <div className="footer-sections">
              <div className="footer-contact">
                <h3 className="contact-heading">Contact Us</h3>
                <a href="mailto:support@grocemate.com" className="footer-link">
                  <IonIcon icon={mailOutline} />
                  support@grocemate.com
                </a>
                <a href="tel:+91-6366147567" className="footer-link">
                  <IonIcon icon={callOutline} />
                  +91 - 6366147567
                </a>
              </div>
            </div>
          </div>
        </footer>

        {/* Toast notification for cart additions */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color="success"
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

export default Home;
