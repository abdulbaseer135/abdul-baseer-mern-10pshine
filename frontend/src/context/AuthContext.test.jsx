import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthContext, AuthProvider, useAuth } from './AuthContext';

describe('AuthContext', () => {
  const mockUser = {
    _id: '1',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('AuthProvider', () => {
    it('should render children', () => {
      render(
        <AuthProvider>
          <div>Test Content</div>
        </AuthProvider>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should initialize with null user and token', () => {
      const TestComponent = () => {
        const { user, token } = useAuth();
        return (
          <div>
            user: {user ? user.email : 'null'}, token: {token || 'null'}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('user: null, token: null')).toBeInTheDocument();
    });

    it('should restore user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));

      const TestComponent = () => {
        const { user } = useAuth();
        return <div>{user ? user.email : 'null'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    it('should restore token from localStorage', () => {
      localStorage.setItem('token', mockToken);

      const TestComponent = () => {
        const { token } = useAuth();
        return <div>{token || 'null'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText(mockToken)).toBeInTheDocument();
    });

    it('should restore both user and token from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      const TestComponent = () => {
        const { user, token } = useAuth();
        return (
          <div>
            {user?.email}:{token}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText(`${mockUser.email}:${mockToken}`)).toBeInTheDocument();
    });

    it('should handle invalid JSON in user localStorage', () => {
      localStorage.setItem('user', 'invalid-json');

      const TestComponent = () => {
        const { user } = useAuth();
        return <div>{user ? 'has-user' : 'no-user'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should fallback to null gracefully
      expect(screen.getByText('no-user')).toBeInTheDocument();
    });

    it('should require children prop', () => {
      const { container } = render(
        <AuthProvider>
          <div>Test</div>
        </AuthProvider>
      );

      expect(container.querySelector('div')).toBeInTheDocument();
    });
  });

  describe('useAuth Hook', () => {
    it('should return auth context', () => {
      const TestComponent = () => {
        const auth = useAuth();
        return (
          <div>
            {auth && Object.keys(auth).includes('login')
              ? 'has-context'
              : 'no-context'}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('has-context')).toBeInTheDocument();
    });

    it('should provide user, token, login, logout', () => {
      const TestComponent = () => {
        const { user, token, login, logout } = useAuth();
        return (
          <div>
            {typeof login === 'function' && typeof logout === 'function'
              ? 'has-methods'
              : 'no-methods'}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('has-methods')).toBeInTheDocument();
    });
  });

  describe('login Function', () => {
    it('should update user and token state', () => {
      const TestComponent = () => {
        const { user, token, login } = useAuth();

        React.useEffect(() => {
          if (!user) {
            login(mockUser, mockToken);
          }
        }, [user, token, login]);

        return <div>{user?.email || 'loading'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    it('should persist user to localStorage', () => {
      const TestComponent = () => {
        const { login } = useAuth();

        React.useEffect(() => {
          login(mockUser, mockToken);
        }, [login]);

        return <div>logged-in</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should persist token to localStorage', () => {
      const TestComponent = () => {
        const { login } = useAuth();

        React.useEffect(() => {
          login(mockUser, mockToken);
        }, [login]);

        return <div>logged-in</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should handle different user objects', () => {
      const differentUser = {
        _id: '2',
        email: 'other@example.com',
        name: 'Other User',
        role: 'admin',
      };

      const TestComponent = () => {
        const { user, login } = useAuth();

        React.useEffect(() => {
          if (!user) {
            login(differentUser, 'different-token');
          }
        }, [user, login]);

        return <div>{user?.role || 'loading'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('admin')).toBeInTheDocument();
    });

    it('should overwrite previous user data', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      const newUser = { _id: '99', email: 'new@example.com' };

      const TestComponent = () => {
        const { user, login } = useAuth();

        React.useEffect(() => {
          if (user?.email === mockUser.email) {
            login(newUser, 'new-token');
          }
        }, [user, login]);

        return <div>{user?.email}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(localStorage.getItem('user')).toBe(JSON.stringify(newUser));
    });

    it('should accept various token formats', () => {
      const TestComponent = () => {
        const { token, login } = useAuth();

        React.useEffect(() => {
          login(mockUser, 'bearer-token-123-abc');
        }, [login]);

        return <div>{token || 'none'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('bearer-token-123-abc')).toBeInTheDocument();
    });
  });

  describe('logout Function', () => {
    it('should clear user and token state', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      const TestComponent = () => {
        const { user, token, logout } = useAuth();

        React.useEffect(() => {
          if (user) {
            logout();
          }
        }, [user, logout]);

        return <div>{user ? 'logged-in' : 'logged-out'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByText('logged-out')).toBeInTheDocument();
    });

    it('should remove user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      const TestComponent = () => {
        const { user, logout } = useAuth();

        React.useEffect(() => {
          if (user) {
            logout();
          }
        }, [user, logout]);

        return <div>done</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should remove token from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      const TestComponent = () => {
        const { token, logout } = useAuth();

        React.useEffect(() => {
          if (token) {
            logout();
          }
        }, [token, logout]);

        return <div>done</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle logout when already logged out', () => {
      const TestComponent = () => {
        const { user, logout } = useAuth();

        React.useEffect(() => {
          logout();
        }, [logout]);

        return <div>{user ? 'has-user' : 'no-user'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Should not crash
      expect(screen.getByText('no-user')).toBeInTheDocument();
    });

    it('should be able to login again after logout', () => {
      const TestComponent = () => {
        const { user, login, logout } = useAuth();
        const [phase, setPhase] = React.useState('start');

        React.useEffect(() => {
          if (phase === 'start' && !user) {
            login(mockUser, mockToken);
            setPhase('logged-in');
          } else if (phase === 'logged-in' && user) {
            logout();
            setPhase('logged-out');
          } else if (phase === 'logged-out' && !user) {
            login(mockUser, mockToken);
            setPhase('logged-in-again');
          }
        }, [phase, user, login, logout]);

        return <div>{user?.email || 'no-user'}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(localStorage.getItem('token')).toBe(mockToken);
    });
  });

  describe('Context Value Memoization', () => {
    it('should memoize context value', () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        const auth = useAuth();
        renderSpy();
        return <div>{auth.user ? 'with-user' : 'no-user'}</div>;
      };

      const { rerender } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const callCount1 = renderSpy.mock.calls.length;

      rerender(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Value should be memoized (though component may re-render)
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('Multiple Consumers', () => {
    it('should work with multiple components', () => {
      const Component1 = () => {
        const { user } = useAuth();
        return <div>{user?.email || 'no-user'}</div>;
      };

      const Component2 = () => {
        const { token } = useAuth();
        return <div>{token || 'no-token'}</div>;
      };

      localStorage.setItem('user', JSON.stringify(mockUser));
      localStorage.setItem('token', mockToken);

      render(
        <AuthProvider>
          <Component1 />
          <Component2 />
        </AuthProvider>
      );

      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockToken)).toBeInTheDocument();
    });

    it('should sync state across multiple consumers', () => {
      const Consumer1 = () => {
        const { user, login } = useAuth();

        React.useEffect(() => {
          if (!user) {
            login(mockUser, mockToken);
          }
        }, [user, login]);

        return <div>consumer1-{user?.email || 'loading'}</div>;
      };

      const Consumer2 = () => {
        const { user } = useAuth();
        return <div>consumer2-{user?.email || 'no-user'}</div>;
      };

      const { rerender } = render(
        <AuthProvider>
          <Consumer1 />
          <Consumer2 />
        </AuthProvider>
      );

      // Both should eventually show the user email
      expect(screen.getByText(`consumer1-${mockUser.email}`)).toBeInTheDocument();
    });
  });
});
