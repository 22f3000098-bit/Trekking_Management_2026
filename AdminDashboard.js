const AdminDashboard = {
  template: `
    <div>

      <!-- Photo Hero Banner -->
      <div class="page-hero-banner" style="
        position:relative;height:220px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 60%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(17,24,39,.75) 0%, rgba(17,24,39,.35) 60%, transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-end pb-4" style="position:relative;z-index:1;">
          <div class="d-flex align-items-end justify-content-between w-100">
            <div>
              <p style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.7);margin-bottom:6px;">
                Admin Console
              </p>
              <h2 style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:white;margin-bottom:0;line-height:1.2;">
                Good day, {{ user.username }}
              </h2>
            </div>
            <div class="d-flex gap-2">
              <router-link to="/admin/treks" class="btn btn-sm fw-bold"
                style="background:white;color:var(--g900);border:none;border-radius:8px;padding:7px 16px;">
                <i class="bi bi-plus-lg me-1"></i>New Trek
              </router-link>
              <router-link to="/admin/staff" class="btn btn-sm fw-bold"
                style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.4);border-radius:8px;padding:7px 16px;backdrop-filter:blur(4px);">
                <i class="bi bi-person-plus me-1"></i>Add Staff
              </router-link>
            </div>
          </div>
        </div>
      </div>

    <div class="page-wrapper" style="padding-top:28px;">
      <div class="container-fluid px-4">
        <p class="page-subtitle mb-4">Here's an overview of your trekking platform.</p>

        <!-- Stat tiles -->
        <div class="row g-3 mb-5">
          <div class="col-6 col-xl-3" v-for="s in statCards" :key="s.label">
            <div :class="'stat-tile ' + s.color">
              <div class="stat-tile-icon"><i :class="'bi ' + s.icon"></i></div>
              <div>
                <div class="stat-tile-value">{{ loading ? '—' : (stats[s.key] ?? 0) }}</div>
                <div class="stat-tile-label">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Secondary metrics -->
        <div class="row g-3 mb-5">
          <div class="col-md-4" v-for="m in metaCards" :key="m.label">
            <div class="card text-center" style="padding:20px 16px;">
              <div style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:var(--text);">
                {{ stats[m.key] || 0 }}
              </div>
              <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-top:4px;">
                {{ m.label }}
              </div>
              <div :class="'tma-badge mt-2 justify-content-center ' + m.badge" style="font-size:.65rem;">
                {{ m.sub }}
              </div>
            </div>
          </div>
        </div>

        <!-- Analytics Charts -->
        <div class="row g-3 mb-5" v-if="analytics">
          <div class="col-lg-6">
            <div class="card h-100">
              <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-bar-chart text-muted"></i>Popular Treks</div>
              <div class="card-body">
                <div v-if="!analytics.popular_treks.length" class="text-center text-muted py-5">No booking data yet.</div>
                <div v-else style="height:260px;"><canvas ref="popularChart"></canvas></div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card h-100">
              <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-pie-chart text-muted"></i>Bookings by Status</div>
              <div class="card-body">
                <div v-if="!analytics.bookings_by_status.length" class="text-center text-muted py-5">No data.</div>
                <div v-else style="height:260px;"><canvas ref="statusChart"></canvas></div>
              </div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6">
            <div class="card h-100">
              <div class="card-header d-flex align-items-center gap-2"><i class="bi bi-pie-chart text-muted"></i>Trek Difficulty</div>
              <div class="card-body">
                <div v-if="!analytics.difficulty.length" class="text-center text-muted py-5">No data.</div>
                <div v-else style="height:260px;"><canvas ref="difficultyChart"></canvas></div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Quick Search -->
          <div class="col-md-7">
            <div class="card">
              <div class="card-header d-flex align-items-center gap-2">
                <i class="bi bi-search text-muted"></i>
                Quick Search
              </div>
              <div class="card-body">
                <div class="d-flex gap-2 mb-3">
                  <input v-model="searchQ" @keyup.enter="doSearch" class="form-control"
                         placeholder="Search users, staff, or treks…" />
                  <select v-model="searchType" class="form-select" style="max-width:130px;">
                    <option value="all">All</option>
                    <option value="users">Users</option>
                    <option value="staff">Staff</option>
                    <option value="treks">Treks</option>
                  </select>
                  <button class="btn btn-success px-3" @click="doSearch" :disabled="searching">
                    <i class="bi bi-search"></i>
                  </button>
                </div>

                <div v-if="searchResults">
                  <div v-if="searchResults.users?.length" class="mb-3">
                    <div class="filter-title">Users</div>
                    <div class="d-flex flex-wrap gap-2">
                      <span v-for="u in searchResults.users" :key="u.id"
                            class="tma-badge badge-approved">
                        <i class="bi bi-person me-1"></i>{{ u.username || u.email }}
                      </span>
                    </div>
                  </div>
                  <div v-if="searchResults.staff?.length" class="mb-3">
                    <div class="filter-title">Staff</div>
                    <div class="d-flex flex-wrap gap-2">
                      <span v-for="s in searchResults.staff" :key="s.id"
                            class="tma-badge badge-open">
                        <i class="bi bi-person-badge me-1"></i>{{ s.name }}
                      </span>
                    </div>
                  </div>
                  <div v-if="searchResults.treks?.length" class="mb-3">
                    <div class="filter-title">Treks</div>
                    <div class="d-flex flex-wrap gap-2">
                      <span v-for="t in searchResults.treks" :key="t.id"
                            class="tma-badge badge-moderate">
                        <i class="bi bi-geo-alt me-1"></i>{{ t.trek_name }}
                      </span>
                    </div>
                  </div>
                  <div v-if="!searchResults.users?.length && !searchResults.staff?.length && !searchResults.treks?.length"
                       class="empty-state" style="padding:24px;">
                    <div class="empty-state-icon"><i class="bi bi-search"></i></div>
                    <p class="empty-state-desc mb-0">No results found for "{{ searchQ }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick navigation -->
          <div class="col-md-5">
            <div class="card h-100">
              <div class="card-header">Quick Navigation</div>
              <div class="card-body p-0">
                <router-link v-for="link in quickLinks" :key="link.to" :to="link.to"
                             class="clean-list-item text-decoration-none"
                             style="color:var(--text);">
                  <div class="d-flex align-items-center gap-3">
                    <div style="width:38px;height:38px;border-radius:9px;background:var(--g100);display:flex;align-items:center;justify-content:center;color:var(--icon);font-size:1.1rem;flex-shrink:0;">
                      <i :class="'bi ' + link.icon"></i>
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:.875rem;">{{ link.label }}</div>
                      <div style="font-size:.76rem;color:var(--muted);">{{ link.desc }}</div>
                    </div>
                  </div>
                  <i class="bi bi-chevron-right text-muted" style="font-size:.75rem;"></i>
                </router-link>
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
      stats: {}, loading: true,
      analytics: null, _charts: [],
      searchQ: '', searchType: 'all', searchResults: null, searching: false,
      statCards: [
        { key: 'total_treks',    label: 'Total Treks',    icon: 'bi-map',           color: 'green'  },
        { key: 'total_users',    label: 'Trekkers',       icon: 'bi-person-walking', color: 'blue'   },
        { key: 'total_staff',    label: 'Staff Members',  icon: 'bi-person-badge',  color: 'gold'   },
        { key: 'total_bookings', label: 'Total Bookings', icon: 'bi-journal-check', color: 'purple' },
      ],
      metaCards: [
        { key: 'pending_treks',   label: 'Pending Approval', sub: 'Awaiting review',    badge: 'badge-pending'   },
        { key: 'open_treks',      label: 'Open Treks',       sub: 'Accepting bookings', badge: 'badge-open'      },
        { key: 'completed_treks', label: 'Completed Treks',  sub: 'All time',           badge: 'badge-completed' },
      ],
      quickLinks: [
        { to: '/admin/treks',    icon: 'bi-map',            label: 'Manage Treks',  desc: 'Create, approve & assign treks' },
        { to: '/admin/staff',    icon: 'bi-person-badge',   label: 'Manage Staff',  desc: 'Add & manage trek staff'        },
        { to: '/admin/users',    icon: 'bi-person-walking', label: 'Manage Users',  desc: 'View & moderate trekkers'       },
        { to: '/admin/bookings', icon: 'bi-journal-check',  label: 'All Bookings',  desc: 'Review all trek bookings'       },
      ],
    };
  },

  computed: {
    user() { return store.state.user || {}; },
  },

  async mounted() {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/analytics'),
      ]);
      this.stats     = statsRes.data;
      this.analytics = analyticsRes.data;
      this.$nextTick(() => this.renderCharts());
    } catch (e) { console.error(e); }
    finally { this.loading = false; }
  },

  beforeUnmount() {
    this._charts.forEach(c => c.destroy());
    this._charts = [];
  },

  methods: {
    renderCharts() {
      if (typeof Chart === 'undefined' || !this.analytics) return;
      this._charts.forEach(c => c.destroy());
      this._charts = [];

      const pop = this.analytics.popular_treks || [];
      if (this.$refs.popularChart && pop.length) {
        this._charts.push(new Chart(this.$refs.popularChart, {
          type: 'bar',
          data: {
            labels: pop.map(p => p.name),
            datasets: [{ label: 'Bookings', data: pop.map(p => p.bookings),
                         backgroundColor: '#2c7a4b', borderRadius: 6 }],
          },
          options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
          },
        }));
      }

      const st = this.analytics.bookings_by_status || [];
      if (this.$refs.statusChart && st.length) {
        this._charts.push(new Chart(this.$refs.statusChart, {
          type: 'doughnut',
          data: {
            labels: st.map(s => s.label),
            datasets: [{ data: st.map(s => s.count),
                         backgroundColor: ['#2c7a4b', '#dc3545', '#6c757d', '#0d6efd', '#ffc107'] }],
          },
          options: { responsive: true, maintainAspectRatio: false,
                     plugins: { legend: { position: 'bottom' } } },
        }));
      }

      const df = this.analytics.difficulty || [];
      if (this.$refs.difficultyChart && df.length) {
        this._charts.push(new Chart(this.$refs.difficultyChart, {
          type: 'doughnut',
          data: {
            labels: df.map(d => d.label),
            datasets: [{ data: df.map(d => d.count),
                         backgroundColor: ['#28a745', '#fd7e14', '#dc3545', '#6c757d'] }],
          },
          options: { responsive: true, maintainAspectRatio: false,
                     plugins: { legend: { position: 'bottom' } } },
        }));
      }
    },

    async doSearch() {
      if (!this.searchQ.trim()) return;
      this.searching = true;
      try {
        const res = await API.get('/admin/search', { q: this.searchQ, type: this.searchType });
        this.searchResults = res.data;
      } catch (e) { console.error(e); }
      finally { this.searching = false; }
    },
  },
};
