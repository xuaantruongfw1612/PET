import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Pet, Service, Product, Appointment, Order, CartItem, OrderItem, Promotion, ShippingInfo, Role } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { apiRequest } from '../lib/api';
import { INITIAL_SERVICES, INITIAL_PRODUCTS, INITIAL_USERS, INITIAL_PETS } from '../lib/mockData';

const USE_API = true;

interface AppState {
  users: User[];
  currentUser: User | null;
  pets: Pet[];
  services: Service[];
  products: Product[];
  promotions: Promotion[];
  appointments: Appointment[];
  orders: Order[];
  cart: CartItem[];
  chats: Record<string, import('../types').ChatMessage[]>;
}

interface AppContextType extends AppState {
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  register: (user: Omit<User, 'id'> & { phone?: string; address?: string }) => Promise<boolean>;
  addPet: (pet: Omit<Pet, 'id' | 'userId'>) => Promise<void>;
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => void;
  checkout: (paymentMethod: string, shippingInfo: ShippingInfo) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  adjustStock: (id: string, amount: number, type: 'import' | 'export', reason?: string) => Promise<void>;
  updateProfile: (userId: string, data: Partial<User>) => Promise<void>;
  updatePet: (petId: string, data: Partial<Pet>) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Omit<Service, 'id'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addPromotion: (promotion: Omit<Promotion, 'id'>) => Promise<void>;
  updatePromotion: (id: string, promotion: Omit<Promotion, 'id'>) => Promise<void>;
  deletePromotion: (id: string) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUserRole: (id: string, role: Role) => Promise<void>;
  toggleUserLock: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  addChatMessage: (userId: string, message: Omit<import('../types').ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadState = (): AppState => {
  const saved = localStorage.getItem('petcare_state');
  if (saved) {
    const parsed = JSON.parse(saved);
    // Ensure initial data exists if empty
    if (!parsed.services || parsed.services.length === 0) parsed.services = INITIAL_SERVICES;
    if (!parsed.products || parsed.products.length === 0) parsed.products = INITIAL_PRODUCTS;
    // Force update p4 image
    if (parsed.products) {
      parsed.products = parsed.products.map(p => {
        if (p.id === 'p4') {
          return { ...p, imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80' };
        }
        return p;
      });
    }

    if (!parsed.promotions) parsed.promotions = [];
    if (!parsed.appointments) parsed.appointments = [];
    if (!parsed.orders) parsed.orders = [];
    if (!parsed.cart) parsed.cart = [];
    if (!parsed.pets) parsed.pets = [];
    if (!parsed.users) parsed.users = [];
    
    // Ensure default users exist if local storage is outdated
    INITIAL_USERS.forEach(iu => {
      const existing = parsed.users.find((u: User) => u.email === iu.email);
      if (!existing) {
        parsed.users.push(iu);
      } else {
        existing.password = iu.password;
        existing.role = iu.role;
      }
    });

    if (!parsed.chats) parsed.chats = {};

    return parsed;
  }
  return {
    users: INITIAL_USERS,
    currentUser: null,
    pets: INITIAL_PETS,
    services: INITIAL_SERVICES,
    products: INITIAL_PRODUCTS,
    promotions: [],
    appointments: [],
    orders: [],
    cart: [],
    chats: {}
  };
};

export const AppProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem('petcare_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (USE_API) {
      const fetchData = async () => {
        try {
          const [products, services] = await Promise.all([
             apiRequest('/products').catch(() => null),
             apiRequest('/services').catch(() => null)
          ]);
          
          setState(prev => {
             const newState = { ...prev };
             if (products && Array.isArray(products)) {
               newState.products = products.map((p: any) => ({
                 id: String(p.productId),
                 name: p.name,
                 category: p.category,
                 price: p.price,
                 stock: p.stockQuantity,
                 description: p.description || '',
                 imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80'
               }));
             }
             if (services && Array.isArray(services)) {
               newState.services = services.map((s: any) => ({
                 id: String(s.serviceId),
                 name: s.name,
                 description: s.description,
                 price: s.price,
                 durationMinutes: s.durationMinutes || 30,
                 isActive: s.isActive !== false
               }));
             }
             return newState;
          });
        } catch(err) {
          console.error("Failed to load initial data from API", err);
        }
      };
      fetchData();
    }
  }, []);

  const login = async (email: string, password?: string) => {
    if (USE_API && password) {
      try {
        const response = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username: email, password })
        });
        if (response && response.userId) {
          const apiUser: User = {
            id: String(response.userId),
            name: response.username,
            email: email, // Use provided email
            role: response.role.toLowerCase() as any,
            password: password
          };
          setState(prev => {
            const users = prev.users.some(u => u.id === apiUser.id) ? prev.users : [...prev.users, apiUser];
            return { ...prev, users, currentUser: apiUser };
          });
          return true;
        }
      } catch (err) {
        console.error('API Login failed, falling back to mock:', err);
      }
    }
    const user = state.users.find(u => u.email === email && (u.password === password || !password));
    if (user) {
      if (user.isLocked) {
        throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }
      setState(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    if (USE_API) {
      apiRequest('/auth/logout', { method: 'POST' }).catch(console.error);
    }
    setState(prev => ({ ...prev, currentUser: null, cart: [] }));
  };

  const register = async (userData: Omit<User, 'id'> & { phone?: string; address?: string }) => {
    if (USE_API) {
      try {
        const response = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: userData.name,
            password: userData.password,
            email: userData.email,
            phoneNumber: userData.phone || '',
            address: userData.address || ''
          })
        });
        if (response) {
          const apiUser: User = {
            id: String(response.customerId || response.userId || uuidv4()),
            name: response.username || userData.name,
            email: response.email || userData.email,
            role: 'customer',
            password: userData.password
          };
          setState(prev => ({ ...prev, users: [...prev.users, apiUser], currentUser: apiUser }));
          return true;
        }
      } catch (err) {
        console.error('API Register failed, falling back to mock:', err);
      }
    }
    if (state.users.some(u => u.email === userData.email)) {
      return false;
    }
    const newUser = { ...userData, id: uuidv4() };
    setState(prev => ({ ...prev, users: [...prev.users, newUser], currentUser: newUser }));
    return true;
  };

  const addPet = async (petData: Omit<Pet, 'id' | 'userId'>) => {
    if (!state.currentUser) return;
    if (USE_API) {
      try {
        const response = await apiRequest('/pets', {
          method: 'POST',
          body: JSON.stringify({
            customerId: Number(state.currentUser.id), // Ensure it matches backend type
            name: petData.name,
            species: petData.species,
            age: petData.age,
            healthStatus: petData.healthStatus
          })
        });
        if (response && response.petId) {
          const newPet = { ...petData, id: String(response.petId), userId: state.currentUser.id };
          setState(prev => ({ ...prev, pets: [...prev.pets, newPet] }));
          return;
        }
      } catch (err) {
        console.error('API addPet failed, falling back to mock:', err);
      }
    }
    const newPet = { ...petData, id: uuidv4(), userId: state.currentUser.id };
    setState(prev => ({ ...prev, pets: [...prev.pets, newPet] }));
  };

  const bookAppointment = async (appData: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => {
    if (USE_API && state.currentUser) {
      try {
        const response = await apiRequest('/appointments', {
          method: 'POST',
          body: JSON.stringify({
            customerId: Number(state.currentUser.id),
            petId: Number(appData.petId),
            date: appData.date,
            time: appData.time,
            serviceIds: appData.serviceIds.map(Number)
          })
        });
        if (response && response.appointmentId) {
           const newApp: Appointment = {
            ...appData,
            id: String(response.appointmentId),
            status: 'pending',
            createdAt: new Date().toISOString()
          };
          setState(prev => ({ ...prev, appointments: [...prev.appointments, newApp] }));
          return;
        }
      } catch (err) {
        console.error('API bookAppointment failed, falling back to mock:', err);
        // Optionally return early if we want strict API enforcement
      }
    }
    const newApp: Appointment = {
      ...appData,
      id: uuidv4(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setState(prev => ({ ...prev, appointments: [...prev.appointments, newApp] }));
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (USE_API) {
      try {
        const { available } = await apiRequest(`/cart/check-stock?productId=${productId}&qty=${quantity}`);
        if (!available) {
          alert('Sản phẩm đã hết hàng hoặc không đủ số lượng!');
          return;
        }
      } catch(err) {
        console.error('API check-stock failed, skipping constraint', err);
      }
    }

    setState(prev => {
      const existing = prev.cart.find(item => item.productId === productId);
      if (existing) {
        return {
          ...prev,
          cart: prev.cart.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item)
        };
      }
      return { ...prev, cart: [...prev.cart, { productId, quantity }] };
    });
  };

  const removeFromCart = async (productId: string) => {
    setState(prev => ({ ...prev, cart: prev.cart.filter(item => item.productId !== productId) }));
  };

  const clearCart = () => {
    setState(prev => ({ ...prev, cart: [] }));
  };

  const checkout = async (paymentMethod: string, shippingInfo: ShippingInfo) => {
    if (!state.currentUser || state.cart.length === 0) return;

    if (USE_API) {
      try {
        // Sync cart first
        const cartItems = state.cart.map(item => ({
          productId: Number(item.productId),
          quantity: item.quantity
        }));
        await apiRequest(`/cart/${state.currentUser.id}/items`, {
          method: 'PUT',
          body: JSON.stringify(cartItems)
        });

        // Create order
        const orderResponse = await apiRequest('/orders', {
          method: 'POST',
          body: JSON.stringify({ customerId: Number(state.currentUser.id) })
        });

        if (orderResponse && orderResponse.orderId) {
          // Process payment
          await apiRequest('/payments', {
             method: 'POST',
             body: JSON.stringify({ orderId: orderResponse.orderId, method: paymentMethod })
          });

          // Deduct stock in backend
          for (const cartItem of state.cart) {
            const product = state.products.find(p => p.id === cartItem.productId);
            if (product) {
              const newStock = Math.max(0, product.stock - cartItem.quantity);
              try {
                await apiRequest(`/products/${product.id}`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    name: product.name,
                    category: product.category,
                    price: product.price,
                    stockQuantity: newStock
                  })
                });
              } catch (e) {
                console.error('Failed to deduct stock for', product.id, e);
              }
            }
          }

          // Mock state update for UI
          const newOrder: Order = {
            id: String(orderResponse.orderId),
            userId: state.currentUser.id,
            items: state.cart.map(cartItem => {
              const product = state.products.find(p => p.id === cartItem.productId);
              return { productId: cartItem.productId, quantity: cartItem.quantity, price: product ? product.price : 0 };
            }),
            totalAmount: orderResponse.totalAmount,
            status: orderResponse.status.toLowerCase() as any,
            paymentMethod,
            paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
            shippingInfo,
            createdAt: orderResponse.orderDate
          };

          setState(prev => {
            const updatedProducts = prev.products.map(p => {
              const cartItem = prev.cart.find(c => c.productId === p.id);
              if (cartItem) {
                return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
              }
              return p;
            });
            return { ...prev, orders: [...prev.orders, newOrder], cart: [], products: updatedProducts };
          });
          return;
        }
      } catch (err: any) {
         console.warn('API checkout failed, falling back to mock:', err);
      }
    }
    
    let totalAmount = 0;
    const items: OrderItem[] = state.cart.map(cartItem => {
      const product = state.products.find(p => p.id === cartItem.productId);
      const price = product ? product.price : 0;
      totalAmount += price * cartItem.quantity;
      return { productId: cartItem.productId, quantity: cartItem.quantity, price };
    });

    const newOrder: Order = {
      id: uuidv4(),
      userId: state.currentUser.id,
      items,
      totalAmount,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid', // simplistic assumption
      shippingInfo,
      createdAt: new Date().toISOString()
    };

    setState(prev => {
      // Deduct stock
      const updatedProducts = prev.products.map(p => {
        const cartItem = prev.cart.find(c => c.productId === p.id);
        if (cartItem) {
          return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
        }
        return p;
      });

      return {
        ...prev,
        orders: [...prev.orders, newOrder],
        cart: [],
        products: updatedProducts
      };
    });
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    if (USE_API) {
      try {
        let endpoint = `/appointments/${id}/`;
        if (status === 'confirmed') endpoint += 'approve';
        else if (status === 'completed') endpoint += 'confirm';
        else endpoint += 'status'; // fallback if backend supports general patch

        await apiRequest(endpoint, { method: 'PATCH' });
      } catch (err) {
        console.error('API updateAppointmentStatus failed:', err);
      }
    }
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === id ? { ...a, status } : a)
    }));
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    if (USE_API) {
      try {
        if (status === 'completed' || status === 'processing') {
           await apiRequest(`/orders/${id}/approve`, { method: 'PATCH' });
        } else if (status === 'cancelled') {
           await apiRequest(`/orders/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason: 'Hủy đơn hàng' }) });
        } else {
           await apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
        }
      } catch(err) {
        console.error('API updateOrderStatus failed:', err);
      }
    }
    setState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === id ? { ...o, status } : o)
    }));
  };

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    if (USE_API) {
      try {
        const response = await apiRequest('/products', {
          method: 'POST',
          body: JSON.stringify({
            name: productData.name,
            category: productData.category,
            price: productData.price,
            stockQuantity: productData.stock
          })
        });
        if (response && response.productId) {
           const newProduct = { ...productData, id: String(response.productId) };
           setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
           return;
        }
      } catch (err) {
        console.error('API addProduct failed', err);
      }
    }
    const newProduct = { ...productData, id: uuidv4() };
    setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  const updateProduct = async (id: string, productData: Omit<Product, 'id'>) => {
    if (USE_API) {
      try {
         await apiRequest(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: productData.name,
            category: productData.category,
            price: productData.price,
            stockQuantity: productData.stock
          })
        });
      } catch (err) {
        console.error('API updateProduct failed', err);
      }
    }
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...productData } : p)
    }));
  };

  const deleteProduct = async (id: string) => {
    if (USE_API) {
       try {
         await apiRequest(`/products/${id}`, { method: 'DELETE' });
       } catch (err) {
         console.error('API deleteProduct failed', err);
       }
    }
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  const adjustStock = async (id: string, amount: number, type: 'import' | 'export', reason?: string) => {
    // There is no specific endpoint for adjustStock, we can update the whole product or ignore if backend doesn't support
    const product = state.products.find(p => p.id === id);
    if (product && USE_API) {
       const newStock = type === 'import' ? product.stock + amount : Math.max(0, product.stock - amount);
       try {
         await apiRequest(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: product.name,
            category: product.category,
            price: product.price,
            stockQuantity: newStock
          })
        });
       } catch (err) {
         console.error('API adjustStock failed', err);
       }
    }
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => {
        if (p.id === id) {
          const newStock = type === 'import' ? p.stock + amount : Math.max(0, p.stock - amount);
          return { ...p, stock: newStock };
        }
        return p;
      })
    }));
  };

  const updateProfile = (userId: string, data: Partial<User>) => {
    setState(prev => {
      const newUsers = prev.users.map(u => u.id === userId ? { ...u, ...data } : u);
      const newCurrentUser = prev.currentUser?.id === userId ? { ...prev.currentUser, ...data } : prev.currentUser;
      return { ...prev, users: newUsers, currentUser: newCurrentUser as User };
    });
  };

  const updatePet = (petId: string, data: Partial<Pet>) => {
    setState(prev => ({
      ...prev,
      pets: prev.pets.map(p => p.id === petId ? { ...p, ...data } : p)
    }));
  };

  const deletePet = async (petId: string) => {
    setState(prev => ({
      ...prev,
      pets: prev.pets.filter(p => p.id !== petId)
    }));
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    const newUser: User = { ...user, id: uuidv4() };
    setState(prev => ({ ...prev, users: [...prev.users, newUser] }));
  };

  const updateUserRole = async (id: string, role: Role) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, role } : u),
      currentUser: prev.currentUser?.id === id ? { ...prev.currentUser, role } : prev.currentUser
    }));
  };

  const toggleUserLock = async (id: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === id ? { ...u, isLocked: !u.isLocked } : u)
    }));
  };

  const deleteUser = async (id: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== id)
    }));
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService = { ...serviceData, id: uuidv4() };
    setState(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const updateService = (id: string, serviceData: Omit<Service, 'id'>) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, ...serviceData } : s)
    }));
  };

  const deleteService = (id: string) => {
    setState(prev => ({ ...prev, services: prev.services.filter(s => s.id !== id) }));
  };

  const addPromotion = (promoData: Omit<Promotion, 'id'>) => {
    const newPromo = { ...promoData, id: uuidv4() };
    setState(prev => ({ ...prev, promotions: [...prev.promotions, newPromo] }));
  };

  const updatePromotion = (id: string, promoData: Omit<Promotion, 'id'>) => {
    setState(prev => ({
      ...prev,
      promotions: prev.promotions.map(p => p.id === id ? { ...p, ...promoData } : p)
    }));
  };

  const deletePromotion = (id: string) => {
    setState(prev => ({ ...prev, promotions: prev.promotions.filter(p => p.id !== id) }));
  };

  const addChatMessage = async (userId: string, message: Omit<import('../types').ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage = {
      ...message,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setState(prev => {
      const userChats = prev.chats[userId] || [];
      return {
        ...prev,
        chats: {
          ...prev.chats,
          [userId]: [...userChats, newMessage]
        }
      };
    });
  };

  const forgotPassword = async (email: string) => {
    // In a real app, this would send a reset email
    return true; // Simulate success
  };

  return (
    <AppContext.Provider value={{
      ...state,
      login, logout, register, addPet, bookAppointment,
      addToCart, removeFromCart, clearCart, checkout,
      updateAppointmentStatus, updateOrderStatus,
      addProduct, updateProduct, deleteProduct, adjustStock,
      updateProfile, updatePet, deletePet,
      addService, updateService, deleteService,
      addPromotion, updatePromotion, deletePromotion,
      addUser, updateUserRole, toggleUserLock, deleteUser,
      addChatMessage, forgotPassword
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
