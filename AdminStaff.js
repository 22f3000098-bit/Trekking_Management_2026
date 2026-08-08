const AdminStaff = {
  template: `
    <div>
      <div class="page-header-strip" style="
        position:relative;height:120px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1486911278844-a81c5267e227?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 35%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(17,24,39,.82) 0%,rgba(17,24,39,.4) 60%,transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-center justify-content-between" style="position:relative;z-index:1;">
          <div>
            <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.65);margin:0 0 4px;">Admin · Staff Management</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:white;margin:0;">Trek Staff</h2>
          </div>
          <button class="btn btn-sm fw-bold" style="background:white;color:var(--g900);border:none;border-radius:8px;padding:7px 16px;" @click="openCreate">
            <i class="bi bi-person-plus me-1"></i>Add Staff
          </button>
        </div>
      </div>
    <div class="page-wrapper" style="padding-top:24px;">
      <div class="container-fluid px-4">

        <div class="card mb-3">
          <div class="card-body py-2">
            <input v-model="search" @input="debouncedFetch" class="form-control form-control-sm"
                   placeholder="Search by name, code, or email…" style="max-width:360px;" />
          </div>
        </div>

        <div class="card">
          <div class="card-body p-0">
            <div v-if="loading" class="loading-overlay"><div class="spinner-border text-success"></div></div>
            <div v-else-if="!staff.length" class="text-center text-muted py-5">No staff members found.</div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Staff</th><th>Code</th><th>Email</th>
                    <th>Specialization</th><th>Experience</th>
                    <th>Assigned Treks</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="s in staff" :key="s.id">
                    <td>
                      <div class="fw-semibold">{{ s.first_name }} {{ s.last_name }}</div>
                      <small class="text-muted">{{ s.phone || '—' }}</small>
                    </td>
                    <td><code class="small">{{ s.staff_code }}</code></td>
                    <td><small>{{ s.email }}</small></td>
                    <td><small>{{ s.specialization || '—' }}</small></td>
                    <td>{{ s.years_experience }}y</td>
                    <td>
                      <span class="badge bg-secondary">{{ s.assigned_treks_count }}</span>
                    </td>
                    <td>
                      <span :class="'badge ' + statusBadge(s.status)">{{ s.status }}</span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <button class="btn btn-xs btn-outline-secondary" @click="openEdit(s)" title="Edit">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-xs" :class="s.is_active ? 'btn-outline-warning' : 'btn-outline-success'"
                                @click="toggleStatus(s, s.is_active ? 'deactivate' : 'activate')">
                          <i :class="s.is_active ? 'bi bi-pause' : 'bi bi-play'"></i>
                        </button>
                        <button class="btn btn-xs btn-outline-danger" @click="toggleStatus(s, 'blacklist')" title="Blacklist">
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

        <div class="toast-container">
          <div v-if="toast.show" :class="'toast show align-items-center text-white border-0 bg-' + toast.type">
            <div class="d-flex">
              <div class="toast-body">{{ toast.msg }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show=false"></button>
            </div>
          </div>
        </div>
      </div>

      <!-- Create / Edit Modal -->
      <div class="modal fade" ref="staffModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editMode ? 'Edit Staff' : 'Add New Staff' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">First Name *</label>
                  <input v-model="form.first_name" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Last Name *</label>
                  <input v-model="form.last_name" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email *</label>
                  <input v-model="form.email" type="email" class="form-control" :disabled="editMode" required />
                </div>
                <div class="col-md-6" v-if="!editMode">
                  <label class="form-label">Password *</label>
                  <input v-model="form.password" type="password" class="form-control" required minlength="6" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Phone</label>
                  <input v-model="form.phone" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Years of Experience</label>
                  <input v-model.number="form.years_experience" type="number" min="0" class="form-control" />
                </div>
                <div class="col-12">
                  <label class="form-label">Specialization</label>
                  <input v-model="form.specialization" class="form-control" placeholder="e.g. High Altitude, River Crossings" />
                </div>
                <div class="col-12">
                  <label class="form-label">Certifications</label>
                  <textarea v-model="form.certifications" class="form-control" rows="2"></textarea>
                </div>
                <div class="col-12">
                  <label class="form-label">Address</label>
                  <input v-model="form.address" class="form-control" />
                </div>
              </div>
              <div v-if="formError" class="alert alert-danger mt-3 py-2 small">{{ formError }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-success" @click="saveStaff" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ editMode ? 'Update' : 'Create Staff' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,

  data() {
    return {
      staff: [], loading: true, saving: false,
      search: '', editMode: false, selectedStaff: null,
      form: this._blank(), formError: '',
      toast: { show: false, msg: '', type: 'success' },
      _debounce: null,
    };
  },

  async mounted() { await this.fetchStaff(); },

  methods: {
    _blank() {
      return { first_name: '', last_name: '', email: '', password: '', phone: '',
               specialization: '', certifications: '', years_experience: 0, address: '' };
    },

    async fetchStaff() {
      this.loading = true;
      try {
        const res = await API.get('/admin/staff', { search: this.search });
        this.staff = res.data.staff;
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.loading = false; }
    },

    debouncedFetch() {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this.fetchStaff(), 400);
    },

    statusBadge(s) {
      return s === 'Active' ? 'bg-success' : s === 'Inactive' ? 'bg-warning' : 'bg-danger';
    },

    openCreate() {
      this.form = this._blank(); this.editMode = false; this.formError = '';
      new bootstrap.Modal(this.$refs.staffModal).show();
    },

    openEdit(s) {
      this.form = { first_name: s.first_name, last_name: s.last_name, email: s.email,
                    phone: s.phone || '', specialization: s.specialization || '',
                    certifications: s.certifications || '', years_experience: s.years_experience || 0,
                    address: s.address || '' };
      this.selectedStaff = s; this.editMode = true; this.formError = '';
      new bootstrap.Modal(this.$refs.staffModal).show();
    },

    closeModal() { bootstrap.Modal.getInstance(this.$refs.staffModal)?.hide(); },

    async saveStaff() {
      this.saving = true; this.formError = '';
      try {
        if (this.editMode) {
          await API.put(`/admin/staff/${this.selectedStaff.id}`, this.form);
          this.showToast('Staff updated');
        } else {
          await API.post('/admin/staff', this.form);
          this.showToast('Staff created');
        }
        this.closeModal();
        this.fetchStaff();
      } catch (e) { this.formError = e.message; }
      finally { this.saving = false; }
    },

    async toggleStatus(s, action) {
      const labels = { activate: 'activate', deactivate: 'deactivate', blacklist: 'blacklist' };
      if (!confirm(`${labels[action]} ${s.first_name} ${s.last_name}?`)) return;
      try {
        await API.put(`/admin/staff/${s.id}/toggle-status`, { action });
        this.showToast(`Staff ${action}d`);
        this.fetchStaff();
      } catch (e) { this.showToast(e.message, 'danger'); }
    },

    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 3500);
    },
  },
};
