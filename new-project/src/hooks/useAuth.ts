import { useState, useEffect } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize with sample users if none exist
    const existingUsers = storageService.getUsers();
    if (existingUsers.length === 0) {
      const sampleUsers: User[] = [
        {
          id: '1',
          name: 'Chris (Admin)',
          role: 'admin',
          email: 'chris@loadsmart.com'
        },
        {
          id: '2', 
          name: 'VP of Sales',
          role: 'evaluator',
          email: 'vp@loadsmart.com'
        },
        {
          id: '3',
          name: 'Director',
          role: 'evaluator',
          email: 'director@loadsmart.com'
        }
      ];
      storageService.saveUsers(sampleUsers);
    }

    // Check for current user
    const user = storageService.getCurrentUser();
    setCurrentUser(user);
    setLoading(false);
  }, []);

  const login = (user: User) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('sales_training_current_user');
    setCurrentUser(null);
  };

  return {
    currentUser,
    loading,
    login,
    logout
  };
}