const AdminUsers = {
  template: `
    <div>
      <div class="page-header-strip" style="
        position:relative;height:120px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 40%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(17,24,39,.82) 0%,rgba(17,24,39,.4) 60%,transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-center justify-content-between" style="position:relative;z-index:1;">
          <div>
            <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.65);margin:0 0 4px;">Admin · User Management</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:white;margin:0;">Trekkers</h2>
          </div>
          <span style="font-size:.82rem;color:rgba(255,255,255,.7);">{{ total }} registered</span>
        </div>
      </div>
    <div class="page-wrapper" style="padding-top:24px;">
      <div class="container-fluid px-4">

        <div class="card mb-3">
          <div class="card-body py-2">
            <input v-model="search" @input="debouncedFetch" class="form-control form-control-sm"
                   placeholder="Search by email or username…" style="max-width:360px;" />
          </div>
        </div>

        <div class="card">
          <div class="card-body p-0">
            <div v-if="loading" class="loading-overlay"><div class="spinner-border text-success"></div></div>
            <div v-else-if="!users.length" class="text-center text-muted py-5">No users found.</div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>User</th><th>Email</th><th>Phone</th>
                    <th>Bookings</th><th>Joined</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="u in users" :key="u.id">
                    <td>
                      <div class="fw-semibold">{{ u.first_name || '' }} {{ u.last_name || '' }}</div>
                      <small class="text-muted">@{{ u.username }}</small>
                    </td>
                    <td><small>{{ u.email }}</small></td>
                    <td><small>{{ u.phone || '—' }}</small></td>
                    <td><span class="badge bg-secondary">{{ u.bookings_count }}</span></td>
                    <td><small>{{ u.created_at?.slice(0,10) }}</small></td>
                    <td>
                      <span v-if="u.is_blacklisted" class="badge bg-danger">Blacklisted</span>
                      <span v-else-if="!u.is_active" class="badge bg-warning">Inactive</span>
                      <span v-else class="badge bg-success">Active</span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button v-if="!u.is_active" class="btn btn-xs btn-outline-success"
                                @click="toggleUser(u, 'activate')" title="Activate">
                          <i class="bi bi-check-circle"></i>
                        </button>
                        <button v-if="u.is_active" class="btn btn-xs btn-outline-warning"
                                @click="toggleUser(u, 'deactivate')" title="Deactivate">
                          <i class="bi bi-pause-circle"></i>
                        </button>
                        <button v-if="!u.is_blacklisted" class="btn btn-xs btn-outline-danger"
                                @click="toggleUser(u, 'blacklist')" title="Blacklist">
                          <i class="bi bi-slash-circle"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <nav class="mt-3" v-if="totalPages > 1">
          <ul class="pagination pagination-sm justify-content-center">
            <li class="page-item" :class="{ disabled: page===1 }">
              <a class="page-link" href="#" @click.prevent="go(page-1)">«</a>
            </li>
            <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: p===page }">
              <a class="page-link" href="#" @click.prevent="go(p)">{{ p }}</a>
            </li>
            <li class="page-item" :class="{ disabled: page===totalPages }">
              <a class="page-link" href="#" @click.prevent="go(page+1)">»</a>
            </li>
          </ul>
        </nav>

        <div class="toast-container">
          <div v-if="toast.show" :class="'toast show align-items-center text-white border-0 bg-' + toast.type">
            <div class="d-flex">
              <div class="toast-body">{{ toast.msg }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show=false"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,

  data() {
    return {
      users: [], loading: true, search: '',
      page: 1, totalPages: 1, total: 0,
      toast: { show: false, msg: '', type: 'success' },
      _debounce: null,
    };
  },

  async mounted() { await this.fetchUsers(); },

  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const res = await API.get('/admin/users', { page: this.page, search: this.search });
        this.users = res.data.users; this.totalPages = res.data.pages; this.total = res.data.total;
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.loading = false; }
    },

    debouncedFetch() {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => { this.page = 1; this.fetchUsers(); }, 400);
    },

    go(p) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.fetchUsers(); } },

    async toggleUser(u, action) {
      if (!confirm(`${action} user "${u.username}"?`)) return;
      try {
        await API.put(`/admin/users/${u.id}/toggle-status`, { action });
        this.showToast(`User ${action}d`);
        this.fetchUsers();
      } catch (e) { this.showToast(e.message, 'danger'); }
    },

    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 3500);
    },
  },
};
