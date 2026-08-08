const store = {
  state: null,

  _init() {
    this.state = Vue.reactive({
      user:  JSON.parse(localStorage.getItem('tma_user')  || 'null'),
      token: localStorage.getItem('tma_token') || null,
    });
  },

  get user()  { return this.state ? this.state.user  : null; },
  get token() { return this.state ? this.state.token : null; },

  setAuth(token, user) {
    this.state.token = token;
    this.state.user  = user;
    localStorage.setItem('tma_token', token);
    localStorage.setItem('tma_user',  JSON.stringify(user));
  },

  updateUser(user) {
    this.state.user = user;
    localStorage.setItem('tma_user', JSON.stringify(user));
  },

  logout() {
    this.state.token = null;
    this.state.user  = null;
    localStorage.removeItem('tma_token');
    localStorage.removeItem('tma_user');
  },

  isLoggedIn() { return !!this.state?.token; },
  role()       { return this.state?.user?.role || null; },
};
