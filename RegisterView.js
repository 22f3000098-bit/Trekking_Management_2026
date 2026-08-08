const RegisterView = {
  template: `
    <div class="auth-layout">

      <!-- Hero Panel -->
      <div class="auth-hero" style="background:none;">
        <div class="auth-hero-photo" style="
          position:absolute;inset:0;
          background-image:url('https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80&fit=crop&crop=center');
          background-size:cover;background-position:center;
          filter:brightness(.5) saturate(1.15);
        "></div>
        <div class="auth-hero-particles" style="background:linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 55%);"></div>

        <div style="position:relative;z-index:1;">
          <div class="auth-hero-badge"><i class="bi bi-people-fill"></i>Join the Community</div>
          <h1 class="auth-hero-title">Start your<br>trekking<br>journey.</h1>
          <p class="auth-hero-desc">
            Register once, explore forever.
            Browse verified trek routes, book slots instantly,
            and connect with expert guides.
          </p>
          <div class="auth-features">
            <div class="auth-feature-item">
              <div class="auth-feature-dot"><i class="bi bi-gift"></i></div>
              Free to join, no hidden fees
            </div>
            <div class="auth-feature-item">
              <div class="auth-feature-dot"><i class="bi bi-map-fill"></i></div>
              Access 50+ curated trek routes
            </div>
            <div class="auth-feature-item">
              <div class="auth-feature-dot"><i class="bi bi-journal-check"></i></div>
              Track your booking history
            </div>
          </div>
        </div>
      </div>

      <!-- Form Panel -->
      <div class="auth-form-side" style="padding:32px 48px;">
        <div class="auth-form-box" style="max-width:460px;">

          <div class="auth-form-logo">
            <div class="auth-form-logo-icon"><i class="bi bi-geo-alt-fill"></i></div>
            <span class="auth-form-logo-text">TMA</span>
          </div>

          <h2 class="auth-form-heading">Create account</h2>
          <p class="auth-form-subheading">Fill in your details to get started</p>

          <div v-if="error"   class="alert alert-danger  py-2 px-3 rounded-3 small mb-3"
               style="border:1px solid #FCA5A5;background:#FEF2F2;color:#991B1B;">
            <i class="bi bi-exclamation-circle me-2"></i>{{ error }}
          </div>
          <div v-if="success" class="alert alert-success py-2 px-3 rounded-3 small mb-3"
               style="border:1px solid var(--g200);background:var(--g50);color:var(--g800);">
            <i class="bi bi-check-circle me-2"></i>{{ success }}
          </div>

          <form @submit.prevent="register">
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label">First Name *</label>
                <input v-model="form.first_name" class="form-control" placeholder="Jane" required />
              </div>
              <div class="col-6">
                <label class="form-label">Last Name *</label>
                <input v-model="form.last_name"  class="form-control" placeholder="Doe"  required />
              </div>
              <div class="col-12">
                <label class="form-label">Email Address *</label>
                <input v-model="form.email" type="email" class="form-control"
                       placeholder="you@example.com" required />
              </div>
              <div class="col-12">
                <label class="form-label">Username</label>
                <input v-model="form.username" class="form-control" placeholder="jane_doe" />
              </div>
              <div class="col-6">
                <label class="form-label">Password *</label>
                <input v-model="form.password" type="password" class="form-control"
                       placeholder="Min 6 characters" required minlength="6" />
              </div>
              <div class="col-6">
                <label class="form-label">Phone</label>
                <input v-model="form.phone" class="form-control" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div class="col-6">
                <label class="form-label">Date of Birth</label>
                <input v-model="form.date_of_birth" type="date" class="form-control" />
              </div>
              <div class="col-6">
                <label class="form-label">Gender</label>
                <select v-model="form.gender" class="form-select">
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">Experience Level</label>
                <div class="d-flex gap-2">
                  <label v-for="lvl in ['Beginner','Intermediate','Expert']" :key="lvl"
                         :class="'flex-fill text-center py-2 rounded-3 border fw-600 small cursor-pointer ' +
                                 (form.experience_level===lvl ? 'border-success bg-green-50 text-green' : 'border-light bg-light text-muted')"
                         style="cursor:pointer;transition:all .15s;">
                    <input type="radio" v-model="form.experience_level" :value="lvl" class="d-none" />
                    {{ lvl }}
                  </label>
                </div>
              </div>
            </div>

            <button type="submit" class="btn btn-success w-100 py-2 fw-bold mt-4" :disabled="loading"
                    style="border-radius:9px;font-size:.95rem;">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Creating account…' : 'Create Account' }}
            </button>
          </form>

          <div class="auth-divider">already have an account?</div>

          <p class="text-center small" style="color:var(--muted);">
            <router-link to="/login" style="color:var(--icon);font-weight:700;">
              ← Sign in instead
            </router-link>
          </p>
        </div>
      </div>

    </div>
  `,

  data() {
    return {
      form: {
        first_name: '', last_name: '', email: '', username: '',
        password: '', phone: '', date_of_birth: '', gender: '',
        experience_level: 'Beginner',
      },
      loading: false, error: '', success: '',
    };
  },

  methods: {
    async register() {
      this.loading = true; this.error = ''; this.success = '';
      try {
        const res = await API.post('/auth/register', this.form);
        store.setAuth(res.data.token, res.data.user);
        this.$router.push('/user/dashboard');
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
