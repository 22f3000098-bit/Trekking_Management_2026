store._init();

const NavBar = {
  template: `
    <nav class="tma-navbar">
      <div class="container-fluid px-4">

        <!-- Back button (shown on detail/sub pages) -->
        <button v-if="showBack" @click="$router.back()"
                class="back-btn me-3"
                title="Go back">
          <i class="bi bi-arrow-left"></i>
        </button>

        <!-- Brand -->
        <a class="navbar-brand-tma" href="#/">
          <div class="brand-icon"><i class="bi bi-geo-alt-fill"></i></div>
          TMA
        </a>

        <!-- Centre links (hidden on mobile) -->
        <ul class="nav-links">
          <!-- Admin -->
          <template v-if="role === 'admin'">
            <li><router-link class="nav-link-item" to="/admin/dashboard"><i class="bi bi-grid-1x2"></i>Dashboard</router-link></li>
            <li><router-link class="nav-link-item" to="/admin/treks"><i class="bi bi-map"></i>Treks</router-link></li>
            <li><router-link class="nav-link-item" to="/admin/staff"><i class="bi bi-person-badge"></i>Staff</router-link></li>
            <li><router-link class="nav-link-item" to="/admin/users"><i class="bi bi-people"></i>Users</router-link></li>
            <li><router-link class="nav-link-item" to="/admin/bookings"><i class="bi bi-journal-check"></i>Bookings</router-link></li>
          </template>
          <!-- Staff -->
          <template v-if="role === 'staff'">
            <li><router-link class="nav-link-item" to="/staff/dashboard"><i class="bi bi-map"></i>My Treks</router-link></li>
            <li><router-link class="nav-link-item" to="/staff/treks/new"><i class="bi bi-plus-circle"></i>Add Trek</router-link></li>
          </template>
          <!-- Trekker -->
          <template v-if="role === 'trekker'">
            <li><router-link class="nav-link-item" to="/user/dashboard"><i class="bi bi-grid-1x2"></i>Dashboard</router-link></li>
            <li><router-link class="nav-link-item" to="/user/treks"><i class="bi bi-compass"></i>Browse Treks</router-link></li>
            <li><router-link class="nav-link-item" to="/user/bookings"><i class="bi bi-journal-check"></i>My Bookings</router-link></li>
          </template>
          <!-- Public (no auth) -->
          <template v-if="!role">
            <li><router-link class="nav-link-item" to="/about"><i class="bi bi-info-circle"></i>About</router-link></li>
            <li><router-link class="nav-link-item" to="/careers"><i class="bi bi-briefcase"></i>Careers</router-link></li>
          </template>
        </ul>

        <!-- Right side -->
        <div class="nav-right">
          <span :class="'role-chip ' + role">{{ role }}</span>

          <div class="dropdown">
            <button class="avatar-btn dropdown-toggle" data-bs-toggle="dropdown" style="--bs-btn-padding-x:0;--bs-btn-padding-y:0;">
              {{ initials }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm" style="min-width:190px;border:1px solid var(--border);border-radius:12px;">
              <li class="px-3 py-2">
                <div style="font-weight:700;font-size:.85rem;">{{ user?.username || user?.email }}</div>
                <div style="font-size:.75rem;color:var(--muted);">{{ user?.email }}</div>
              </li>
              <li><hr class="dropdown-divider my-1"></li>
              <li v-if="role === 'trekker'">
                <router-link class="dropdown-item d-flex align-items-center gap-2" to="/user/profile">
                  <i class="bi bi-person"></i> My Profile
                </router-link>
              </li>
              <li>
                <a class="dropdown-item d-flex align-items-center gap-2 text-danger" href="#" @click.prevent="logout">
                  <i class="bi bi-box-arrow-right"></i> Sign Out
                </a>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </nav>
  `,

  computed: {
    user()    { return store.state.user; },
    role()    { return store.state.user?.role; },
    initials() {
      const u = store.state.user;
      if (!u) return '?';
      const name = u.username || u.email || '';
      return name.slice(0,2).toUpperCase();
    },
    showBack() {
      const root = new Set([
        '/login','/register','/about','/careers',
        '/admin/dashboard','/admin/treks','/admin/staff','/admin/users','/admin/bookings',
        '/staff/dashboard','/staff/treks/new',
        '/user/dashboard','/user/treks','/user/bookings','/user/profile',
      ]);
      return !root.has(this.$route?.path);
    },
  },

  methods: {
    async logout() {
      try { await API.post('/auth/logout'); } catch (_) {}
      store.logout();
      this.$router.push('/login');
    },
  },
};

const routes = [
  { path: '/',         redirect: '/login' },
  { path: '/login',    component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/about',    component: AboutView },
  { path: '/careers',  component: CareersView },

  { path: '/admin',           redirect: '/admin/dashboard' },
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/treks',     component: AdminTreks,     meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/staff',     component: AdminStaff,     meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/users',     component: AdminUsers,     meta: { requiresAuth: true, role: 'admin' } },
  { path: '/admin/bookings',  component: AdminBookings,  meta: { requiresAuth: true, role: 'admin' } },

  { path: '/staff',            redirect: '/staff/dashboard' },
  { path: '/staff/dashboard',  component: StaffDashboard,  meta: { requiresAuth: true, role: 'staff' } },
  { path: '/staff/treks/new',  component: StaffAddTrek,    meta: { requiresAuth: true, role: 'staff' } },
  { path: '/staff/treks/:id',  component: StaffTrekDetail, meta: { requiresAuth: true, role: 'staff' } },

  { path: '/user',                redirect: '/user/dashboard' },
  { path: '/user/dashboard',      component: UserDashboard,   meta: { requiresAuth: true, role: 'trekker' } },
  { path: '/user/treks',          component: UserTreks,       meta: { requiresAuth: true, role: 'trekker' } },
  { path: '/user/treks/:id',      component: UserTrekDetail,  meta: { requiresAuth: true, role: 'trekker' } },
  { path: '/user/payment/:id',    component: PaymentPage,     meta: { requiresAuth: true, role: 'trekker' } },
  { path: '/user/bookings',       component: UserBookings,    meta: { requiresAuth: true, role: 'trekker' } },
  { path: '/user/profile',        component: UserProfile,     meta: { requiresAuth: true, role: 'trekker' } },

  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; },
});

router.beforeEach((to, _from, next) => {
  const token = store.state.token;
  const user  = store.state.user;

  if (to.meta.requiresAuth && !token) {
    next('/login');
    return;
  }

  if (token && (to.path === '/login' || to.path === '/register')) {
    const role = user?.role;
    if (role === 'admin')   { next('/admin/dashboard'); return; }
    if (role === 'staff')   { next('/staff/dashboard'); return; }
    if (role === 'trekker') { next('/user/dashboard');  return; }
  }

  if (to.meta.role && user && to.meta.role !== user.role) {
    const role = user.role;
    if (role === 'admin')   { next('/admin/dashboard'); return; }
    if (role === 'staff')   { next('/staff/dashboard'); return; }
    if (role === 'trekker') { next('/user/dashboard');  return; }
    next('/login');
    return;
  }

  next();
});

const app = Vue.createApp({
  components: { NavBar },

  computed: {
    isLoggedIn()  { return !!store.state.token; },
    isPublicPage() {
      const p = this.$route?.path || '';
      return ['/about', '/careers'].includes(p);
    },
  },

  template: `
    <div>
      <nav-bar v-if="isLoggedIn || isPublicPage"></nav-bar>
      <router-view></router-view>
    </div>
  `,
});

app.use(router);
app.mount('#app');
