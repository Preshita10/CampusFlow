import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  switchUser: (userId: string, role: UserRole) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const token = api.getAccessToken();
    if (token) {
      fetchUser();
    } else {
      // No saved token - show login page
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = api.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const user = await api.getMe();
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Clear invalid session
      api.setAccessToken(null);
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchUser = async (userId: string, role: UserRole): Promise<void> => {
    // For demo purposes, we'll use the login API with demo credentials
    const demoCredentials: Record<string, { email: string; password: string }> = {
      '1': { email: 'student@gmu.edu', password: 'student123' },
      '2': { email: 'advisor@gmu.edu', password: 'advisor123' },
    };

    const credentials = demoCredentials[userId];
    if (!credentials) {
      // Fallback to creating a minimal user object
      setCurrentUser({
        id: userId,
        name: role === UserRole.STUDENT ? 'John Student' : 'Jane Staff',
        email: role === UserRole.STUDENT ? 'student@gmu.edu' : 'staff@gmu.edu',
        role,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    try {
      setLoading(true);
      const { user, accessToken } = await api.login(credentials.email, credentials.password);
      api.setAccessToken(accessToken);
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        createdAt: user.createdAt || new Date().toISOString(),
      });
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userRole', user.role);
    } catch (error) {
      console.error('Failed to switch user:', error);
      // Fallback to creating a minimal user object
      setCurrentUser({
        id: userId,
        name: role === UserRole.STUDENT ? 'John Student' : 'Jane Staff',
        email: role === UserRole.STUDENT ? 'student@gmu.edu' : 'staff@gmu.edu',
        role,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, switchUser, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
