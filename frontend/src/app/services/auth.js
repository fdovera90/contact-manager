// Servicio de autenticación
const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/contacts';
  // Extraer la base URL (remover /api/contacts si existe)
  return apiUrl.replace('/api/contacts', '');
};

export const authService = {

  async login(username, password) {
    try {
      const apiUrl = `${getApiUrl()}/api/login`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('user_roles', JSON.stringify(data.user.roles || []));
        return { success: true, data };
      } else {
        console.error('Login failed:', data);
        return { success: false, message: data.message || 'Login failed', debug: data.debug };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.', error: error.message };
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_roles');
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },

  getToken() {
    return localStorage.getItem('auth_token');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getRoles() {
    const roles = localStorage.getItem('user_roles');
    return roles ? JSON.parse(roles) : [];
  },

  hasRole(role) {
    const roles = this.getRoles();
    return roles.includes(role);
  },

  canEdit() {
    const hasAdmin = this.hasRole('ROLE_ADMIN');
    const hasEditor = this.hasRole('ROLE_EDITOR');
    return hasAdmin || hasEditor;
  },

  canDelete() {
    const result = this.hasRole('ROLE_ADMIN');
    return result;
  },

  canAdd() {
    const hasAdmin = this.hasRole('ROLE_ADMIN');
    const hasEditor = this.hasRole('ROLE_EDITOR');
    return hasAdmin || hasEditor;
  },
};

