const LoginView = {
  template: `
    <div class="auth-layout">

      <!-- Hero Panel -->
      <div class="auth-hero" style="background:none;">
        <div class="auth-hero-photo" style="
          position:absolute;inset:0;
          background-image:url('/static/img/hero-login.jpg');
          background-size:cover;background-position:center 40%;
          filter:brightness(.55) saturate(1.1);
        "></div>
        <div class="auth-hero-particles" style="background:linear-gradient(to top, rgba(0,0,0,.6) 0%, transparent 50%);"></div>

        <div style="position:relative;z-index:1;">
          <div class="auth-hero-badge"><i class="bi bi-compass"></i>Trekking Management Platform</div>
          <h1 class="auth-hero-title">Your next<br>adventure<br>awaits.</h1>
          <p class="auth-hero-desc">
            Discover curated treks, book your spot in seconds,
            and track every adventure — all in one place.
          </p>
          <div class="auth-features">
            <div class="auth-feature-item">
              <div class="auth-feature-dot"><i class="bi bi-person-badge-fill"></i></div>
              Verified expert trek staff
            </div>
            <div class="auth-feature-item">
              <div class="auth-feature-dot"><i class="bi bi-lightning-charge-fill"></i></div>
              Real-time slot availability
            </div>
            <div class="auth-feature-item">
              <div class="auth-feature-dot"><i class="bi bi-check2"></i></div>
              Instant booking confirmation
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="auth-form-side">
        <div class="auth-form-box">

          <div class="auth-form-logo">
            <div class="auth-form-logo-icon"><i class="bi bi-geo-alt-fill"></i></div>
            <span class="auth-form-logo-text">TMA</span>
          </div>

          <h2 class="auth-form-heading">Welcome back</h2>
          <p class="auth-form-subheading">Sign in to continue your journey</p>

          <div v-if="error" class="alert alert-danger py-2 px-3 rounded-3 small mb-4"
               style="border:1px solid #FCA5A5;background:#FEF2F2;color:#991B1B;">
            <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
          </div>

          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label">Email Address</label>
              <input v-model="form.email" type="email" class="form-control"
                     placeholder="you@example.com" required autocomplete="email" />
            </div>

            <div class="mb-4">
              <label class="form-label">Password</label>
              <div class="input-group">
                <input v-model="form.password" :type="showPwd ? 'text' : 'password'"
                       class="form-control" placeholder="Your password" required
                       autocomplete="current-password"
                       style="border-radius:9px 0 0 9px !important;" />
                <button type="button" class="btn btn-outline-secondary"
                        style="border-radius:0 9px 9px 0;border-color:var(--border);"
                        @click="showPwd = !showPwd">
                  <i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-success w-100 py-2 fw-bold" :disabled="loading"
                    style="border-radius:9px;font-size:.95rem;letter-spacing:.2px;">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Signing in…' : 'Sign In' }}
            </button>
          </form>

          <div class="auth-divider">or</div>

          <p class="text-center small" style="color:var(--muted);">
            New trekker?
            <router-link to="/register" style="color:var(--icon);font-weight:700;">
              Create a free account →
            </router-link>
          </p>

          <p class="text-center mt-4" style="font-size:.75rem;color:var(--light);">
            Admin / Staff accounts are created by the system administrator.
          </p>

          <div class="d-flex justify-content-center gap-4 mt-4" style="font-size:.78rem;">
            <router-link to="/about"   style="color:var(--muted);text-decoration:none;display:flex;align-items:center;gap:4px;"><i class="bi bi-info-circle" style="color:var(--icon);"></i>About Us</router-link>
            <router-link to="/careers" style="color:var(--muted);text-decoration:none;display:flex;align-items:center;gap:4px;"><i class="bi bi-briefcase" style="color:var(--icon);"></i>Careers</router-link>
          </div>
        </div>
      </div>

    </div>
  `,

  data() {
    return { form: { email: '', password: '' }, loading: false, error: '', showPwd: false };
  },

  methods: {
    async login() {
      this.loading = true; this.error = '';
      try {
        const res = await API.post('/auth/login', this.form);
        store.setAuth(res.data.token, res.data.user);
        const role = res.data.user.role;
        if (role === 'admin')   this.$router.push('/admin/dashboard');
        else if (role === 'staff') this.$router.push('/staff/dashboard');
        else                       this.$router.push('/user/dashboard');
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
