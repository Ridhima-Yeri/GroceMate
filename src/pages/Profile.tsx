import { useState, useEffect, useRef } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButton, 
  IonItem, 
  IonLabel, 
  IonInput,
  IonAvatar,
  IonIcon,
  IonToast,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonList,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonChip,
  IonBadge,
  IonAlert,
  IonText,
  IonModal,
  IonContent as IonModalContent
} from '@ionic/react';
import { pencilOutline, logOutOutline, personOutline, keyOutline, shieldOutline, closeOutline, checkmarkOutline, cameraOutline, cloudOfflineOutline, refreshOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { updateProfile, changePassword, uploadProfileImage, getProfileData } from '../api/api';
import '../styles/Profile.css';
import '../styles/IconFix.css';

interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

const createUserProfile = (data: Partial<UserProfile> & { name: string, email: string, role: string }): UserProfile => {
  return {
    name: data.name,
    email: data.email,
    role: data.role,
    ...(data._id && { _id: data._id }),
    ...(data.id && { id: data.id }),
    ...(data.avatar && { avatar: data.avatar }),
    ...(data.createdAt && { createdAt: data.createdAt }),
    ...(data.updatedAt && { updatedAt: data.updatedAt })
  };
};

const useAccessibleModal = () => {
  const modalRef = useRef<HTMLIonModalElement>(null);
  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const openModal = () => {
    lastFocusedElement.current = document.activeElement as HTMLElement;
    return true;
  };

  const closeModal = () => {
    setTimeout(() => {
      lastFocusedElement.current?.focus();
    }, 100);
    return false;
  };

  return { modalRef, openModal, closeModal };
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [dataChanged, setDataChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const history = useHistory();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const serverUrl = 'https://grocemate-bckend.onrender.com';
  const modalCloseRef = useRef<HTMLIonButtonElement>(null);
  const firstInputRef = useRef<HTMLIonInputElement>(null);
  const { modalRef: editModalRef, openModal: openEditModal, closeModal: closeEditModal } = useAccessibleModal();
  const { modalRef: passwordModalRef, openModal: openPasswordModal, closeModal: closePasswordModal } = useAccessibleModal();

  useEffect(() => {
    fetchUserProfile();
  }, [history]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        history.push('/login');
        return;
      }
      
      try {
        const userData = await getProfileData();
        if (userData) {
          console.log("Fetched user data:", userData);

          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setFormData(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || ''
          }));
          setIsOfflineMode(false);
        }
      } catch (error) {
        console.log('Using offline mode due to connection issue:', error);
        setIsOfflineMode(true);
        
        const cachedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (Object.keys(cachedUser).length === 0) {
          setToastMessage('Could not connect to server. Please check your connection.');
          setToastColor('warning');
          setShowToast(true);
          
          const email = localStorage.getItem('lastLoginEmail');
          if (email) {
            const tempUser = {
              name: email.split('@')[0],
              email: email,
              role: 'user',
              createdAt: new Date().toISOString()
            };
            setUser(tempUser);
            setFormData({
              ...formData,
              name: tempUser.name,
              email: tempUser.email
            });
          } else {
            setTimeout(() => {
              history.push('/login');
            }, 2000);
          }
        } else {
          setUser(cachedUser);
          setFormData(prev => ({
            ...prev,
            name: cachedUser.name || '',
            email: cachedUser.email || ''
          }));
          
          setToastMessage('Working in offline mode with cached data.');
          setToastColor('warning');
          setShowToast(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetryConnection = () => {
    fetchUserProfile();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    history.push('/login');
  };


  const handleInputChange = (e: CustomEvent) => {
    const { name, value } = e.detail;
    setFormData(prevData => {
      const newData = {
        ...prevData,
        [name]: value
      };
      
      if (user) {
        const hasChanged = 
          name === 'name' && value !== user.name || 
          name === 'email' && value !== user.email;
        
        setDataChanged(hasChanged || 
          (name === 'name' ? newData.email !== user.email : newData.name !== user.name));
      }
      
      return newData;
    });
  };



  const openFilePicker = () => {
    if (isOfflineMode) {
      setToastMessage('Cannot upload images while offline. Please try again when connected.');
      setToastColor('warning');
      setShowToast(true);
      return;
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
      setTimeout(() => mainContentRef.current?.focus(), 100);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setToastMessage('Invalid file type. Please upload an image.');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setToastMessage('File is too large. Maximum size is 5MB.');
      setToastColor('danger');
      setShowToast(true);
      return;
    }
    
    try {
      setUploading(true);
      const result = await uploadProfileImage(file);
      
      if (user) {
        const updatedUser = createUserProfile({
          ...user,
          avatar: result.avatar
        });
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
      
      setToastMessage('Profile picture uploaded successfully!');
      setToastColor('success');
      setShowToast(true);
    } catch (error) {
      setIsOfflineMode(true);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setToastMessage('Server unavailable. Image uploads require an active connection.');
      setToastColor('warning');
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  const goToAdminDashboard = () => {
    history.push('/admin');
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="profile-loading">
            <IonSpinner name="crescent" />
            <p>Loading profile...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!user) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="profile-loading">
            <p>No user data found. Please log in again.</p>
            <IonButton onClick={() => history.push('/login')}>Login</IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : 'January 2024';

  const avatarUrl = user.avatar && !user.avatar.startsWith('http') && !user.avatar.startsWith('data:') 
    ? `${serverUrl}${user.avatar}` 
    : user.avatar;

  return (
    <IonPage className="profile-page">
      <IonContent fullscreen className="profile-content">
        <div 
          className="profile-container" 
          ref={mainContentRef} 
          tabIndex={-1}
        >
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar-container">
              <IonAvatar 
                className="profile-avatar" 
                onClick={!isOfflineMode ? openFilePicker : undefined}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" />
                ) : (
                  <div className="profile-avatar-placeholder">
                    <IonIcon icon={personOutline} />
                  </div>
                )}
              </IonAvatar>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={handleFileChange}
              />
              {!isOfflineMode && (
                <IonButton 
                  fill="clear" 
                  size="small" 
                  onClick={openFilePicker}
                  disabled={uploading}
                  className="avatar-change-btn"
                >
                {uploading ? 'Uploading...' : 'Change Picture'}
                </IonButton>
              )}
            </div>
            <h2 className={`profile-name ${user.role}-role`}>
              <span className="name-text">{user.name}</span>
              {user.role === 'admin' && (
                <span className="admin-badge">
                  <IonIcon icon={shieldOutline} />
                </span>
              )}
            </h2>
            <p className="profile-email">{user.email}</p>
          </div>

          {/* Profile Actions */}
          <div className="profile-actions">
            {user.role === 'admin' && (
              <IonButton 
                expand="block" 
                color="tertiary" 
                onClick={goToAdminDashboard}
                disabled={isOfflineMode}
              >
                <IonIcon slot="start" icon={shieldOutline} />
                Admin Dashboard
              </IonButton>
            )}
            <IonButton expand="block" color="danger" onClick={handleLogout}>
              <IonIcon slot="start" icon={logOutOutline} />
              Logout
            </IonButton>
          </div>

          {/* Account Info Card */}
          <IonCard className="profile-card">
            <IonCardHeader>
              <IonCardTitle>Account Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList lines="none">
                <IonItem>
                  <IonLabel>
                    <h3>Full Name</h3>
                    <p>{user.name}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Email</h3>
                    <p>{user.email}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Role</h3>
                    <p>{user.role}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h3>Member Since</h3>
                    <p>{memberSince}</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          {/* Removed Edit Profile and Change Password Modals for Admin */}

          <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={toastMessage}
            duration={2000}
            color={toastColor}
            position="top"
            cssClass="toast-profile"
          />
          
          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header="Invalid Input"
            message={alertMessage}
            buttons={['OK']}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
