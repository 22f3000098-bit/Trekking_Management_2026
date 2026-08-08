const UserDashboard = {
  template: `
    <div>

      <!-- Photo Hero Banner -->
      <div style="
        position:relative;height:200px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 45%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(17,24,39,.72) 0%, rgba(17,24,39,.3) 60%, transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-end pb-4" style="position:relative;z-index:1;">
          <div class="d-flex align-items-end justify-content-between w-100">
            <div>
              <p style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.7);margin-bottom:6px;">
                Trekker Portal
              </p>
              <h2 style="font-family:'Playfair Display',serif;font-size:1.85rem;font-weight:700;color:white;margin-bottom:0;">
                Welcome back, {{ firstName }}
              </h2>
            </div>
            <router-link to="/user/treks" class="btn btn-sm fw-bold"
              style="background:white;color:var(--g900);border:none;border-radius:8px;padding:7px 16px;">
              <i class="bi bi-compass me-1"></i>Browse Treks
            </router-link>
          </div>
        </div>
      </div>

    <div class="page-wrapper" style="padding-top:28px;">
      <div class="container-fluid px-4">

        <!-- Stats -->
        <div class="row g-3 mb-5">
          <div class="col-6 col-md-3">
            <div class="stat-tile purple">
              <div class="stat-tile-icon"><i class="bi bi-journal-check"></i></div>
              <div>
                <div class="stat-tile-value">{{ stats.total }}</div>
                <div class="stat-tile-label">Total Bookings</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-tile blue">
              <div class="stat-tile-icon"><i class="bi bi-check2-circle"></i></div>
              <div>
                <div class="stat-tile-value">{{ stats.active }}</div>
                <div class="stat-tile-label">Active Bookings</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-tile green">
              <div class="stat-tile-icon"><i class="bi bi-map"></i></div>
              <div>
                <div class="stat-tile-value">{{ stats.completed }}</div>
                <div class="stat-tile-label">Treks Completed</div>
              </div>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-tile teal">
              <div class="stat-tile-icon"><i class="bi bi-bell"></i></div>
              <div>
                <div class="stat-tile-value">{{ unreadNotifs }}</div>
                <div class="stat-tile-label">Unread Alerts</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">

          <!-- Active Bookings -->
          <div class="col-md-7">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span><i class="bi bi-journal-check me-2 text-muted"></i>Active Bookings</span>
                <router-link to="/user/bookings" class="btn btn-outline-success btn-sm fw-bold">View All</router-link>
              </div>

              <div v-if="bookingsLoading" class="loading-overlay">
                <div class="spinner-tma"></div>
              </div>
              <div v-else-if="!activeBookings.length" class="empty-state">
                <div class="empty-state-icon"><i class="bi bi-map"></i></div>
                <div class="empty-state-title">No active bookings yet</div>
                <p class="empty-state-desc">
                  <router-link to="/user/treks" style="color:var(--icon);font-weight:700;">Browse treks →</router-link>
                </p>
              </div>
              <div v-else>
                <div v-for="b in activeBookings" :key="b.id" class="clean-list-item">
                  <div class="d-flex align-items-start gap-3">
                    <div style="width:40px;height:40px;border-radius:10px;background:var(--g100);display:flex;align-items:center;justify-content:center;color:var(--icon);font-size:1.1rem;flex-shrink:0;"><i class="bi bi-map"></i></div>
                    <div>
                      <div style="font-family:'Playfair Display',serif;font-weight:600;font-size:.9rem;">{{ b.trek_name }}</div>
                      <div style="font-size:.78rem;color:var(--muted);margin-top:2px;">
                        <i class="bi bi-geo-alt me-1"></i>{{ b.location }}
                        <span class="mx-2">·</span>
                        <i class="bi bi-calendar me-1"></i>{{ b.start_date }}
                      </div>
                    </div>
                  </div>
                  <div class="text-end flex-shrink-0">
                    <span class="tma-badge badge-booked">Booked</span>
                    <div style="font-size:.72rem;color:var(--light);margin-top:4px;font-family:monospace;">{{ b.booking_ref }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div class="col-md-5">
            <div class="card">
              <div class="card-header d-flex align-items-center gap-2">
                <i class="bi bi-bell text-muted"></i>
                Notifications
                <span v-if="unreadNotifs" class="tma-badge badge-hard ms-auto" style="font-size:.65rem;">
                  {{ unreadNotifs }} new
                </span>
              </div>
              <div style="max-height:340px;overflow-y:auto;">
                <div v-if="!notifications.length" class="empty-state" style="padding:32px;">
                  <div class="empty-state-icon"><i class="bi bi-bell"></i></div>
                  <p class="empty-state-desc mb-0">All caught up!</p>
                </div>
                <div v-for="n in notifications" :key="n.id" class="clean-list-item"
                     :style="!n.is_read ? 'background:var(--g50);' : ''">
                  <div>
                    <div style="font-weight:700;font-size:.82rem;display:flex;align-items:center;gap:6px;">
                      {{ n.title }}
                      <span v-if="!n.is_read" class="tma-badge badge-approved" style="font-size:.62rem;">New</span>
                    </div>
                    <div style="font-size:.78rem;color:var(--muted);margin-top:2px;">{{ n.content }}</div>
                    <div style="font-size:.72rem;color:var(--light);margin-top:4px;">{{ n.created_at?.slice(0,10) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
    </div>
  `,

  data() {
    return {
      activeBookings: [], bookingsLoading: true,
      notifications: [],
      stats: { total: 0, active: 0, completed: 0 },
    };
  },

  computed: {
    user()         { return store.state.user || {}; },
    firstName()    { return this.user.first_name || this.user.username || 'Explorer'; },
    unreadNotifs() { return this.notifications.filter(n => !n.is_read).length; },
  },

  async mounted() {
    await Promise.all([this.fetchBookings(), this.fetchNotifications()]);
  },

  methods: {
    async fetchBookings() {
      this.bookingsLoading = true;
      try {
        const res = await API.get('/user/bookings');
        const all = res.data.bookings;
        this.activeBookings  = all.filter(b => b.status === 'Booked').slice(0, 5);
        this.stats.total     = all.length;
        this.stats.active    = all.filter(b => b.status === 'Booked').length;
        this.stats.completed = all.filter(b => b.status === 'Completed').length;
      } catch (e) { console.error(e); }
      finally { this.bookingsLoading = false; }
    },

    async fetchNotifications() {
      try {
        const res = await API.get('/user/notifications');
        this.notifications = res.data.notifications;
      } catch (e) { console.error(e); }
    },
  },
};
