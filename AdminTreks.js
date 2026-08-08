const AdminTreks = {
  template: `
    <div>
      <div class="page-header-strip" style="
        position:relative;height:120px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 50%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(17,24,39,.82) 0%,rgba(17,24,39,.4) 60%,transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-center justify-content-between" style="position:relative;z-index:1;">
          <div>
            <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.65);margin:0 0 4px;">Admin · Trek Management</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:white;margin:0;">Trek Routes</h2>
          </div>
          <button class="btn btn-sm fw-bold" style="background:white;color:var(--g900);border:none;border-radius:8px;padding:7px 16px;" @click="openCreate">
            <i class="bi bi-plus-lg me-1"></i>New Trek
          </button>
        </div>
      </div>
    <div class="page-wrapper" style="padding-top:24px;">
      <div class="container-fluid px-4">

        <!-- Filters -->
        <div class="card mb-3">
          <div class="card-body py-2">
            <div class="row g-2 align-items-center">
              <div class="col-md-5">
                <input v-model="filters.search" @input="debouncedFetch" class="form-control form-control-sm"
                       placeholder="Search trek name or location…" />
              </div>
              <div class="col-md-3">
                <select v-model="filters.status" @change="fetchTreks" class="form-select form-select-sm">
                  <option value="">All Statuses</option>
                  <option v-for="s in statuses" :key="s">{{ s }}</option>
                </select>
              </div>
              <div class="col-auto">
                <button class="btn btn-outline-secondary btn-sm" @click="resetFilters">Reset</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <div class="card">
          <div class="card-body p-0">
            <div v-if="loading" class="loading-overlay"><div class="spinner-border text-success"></div></div>
            <div v-else-if="treks.length === 0" class="text-center text-muted py-5">No treks found.</div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Trek</th><th>Location</th><th>Difficulty</th>
                    <th>Slots</th><th>Dates</th><th>Staff</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="t in treks" :key="t.id">
                    <td>
                      <div class="fw-semibold">{{ t.trek_name }}</div>
                      <small class="text-muted">{{ t.duration }}d · ₹{{ t.price }}</small>
                    </td>
                    <td><small>{{ t.location }}</small></td>
                    <td>
                      <span :class="'tma-badge badge-' + t.difficulty.toLowerCase()">{{ t.difficulty }}</span>                    </td>
                    <td>
                      <span :class="t.available_slots === 0 ? 'text-danger fw-bold' : ''">
                        {{ t.available_slots }}/{{ t.total_slots }}
                      </span>
                    </td>
                    <td>
                      <small>{{ t.start_date }}<br>{{ t.end_date }}</small>
                    </td>
                    <td><small>{{ t.staff_name || '—' }}</small></td>
                    <td>
                      <span :class="'tma-badge badge-' + t.status.toLowerCase()">{{ t.status }}</span>
                    </td>
                    <td>
                      <div class="d-flex gap-1 flex-wrap">
                        <button class="btn btn-xs btn-outline-secondary" title="Edit"
                                @click="openEdit(t)"><i class="bi bi-pencil"></i></button>
                        <button class="btn btn-xs btn-outline-primary" title="Assign Staff"
                                @click="openAssign(t)"><i class="bi bi-person-check"></i></button>
                        <button class="btn btn-xs btn-outline-success" title="Change Status"
                                @click="openStatus(t)"><i class="bi bi-arrow-repeat"></i></button>
                        <button class="btn btn-xs btn-outline-danger" title="Delete"
                                @click="deleteTrek(t)"><i class="bi bi-trash"></i></button>
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
            <li class="page-item" :class="{ disabled: page === 1 }">
              <a class="page-link" @click.prevent="changePage(page - 1)" href="#">«</a>
            </li>
            <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: p === page }">
              <a class="page-link" @click.prevent="changePage(p)" href="#">{{ p }}</a>
            </li>
            <li class="page-item" :class="{ disabled: page === totalPages }">
              <a class="page-link" @click.prevent="changePage(page + 1)" href="#">»</a>
            </li>
          </ul>
        </nav>

        <!-- Toast -->
        <div class="toast-container">
          <div v-if="toast.show" :class="'toast show align-items-center text-white border-0 bg-' + toast.type">
            <div class="d-flex">
              <div class="toast-body">{{ toast.msg }}</div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="toast.show=false"></button>
            </div>
          </div>
        </div>

      </div>

      <!-- Create/Edit Modal -->
      <div class="modal fade" ref="trekModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ editMode ? 'Edit Trek' : 'Create New Trek' }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTrek" id="trekForm">
                <div class="row g-3">
                  <div class="col-md-8">
                    <label class="form-label">Trek Name *</label>
                    <input v-model="form.trek_name" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Difficulty *</label>
                    <select v-model="form.difficulty" class="form-select" required>
                      <option>Easy</option><option>Moderate</option><option>Hard</option>
                    </select>
                  </div>
                  <div class="col-md-8">
                    <label class="form-label">Location *</label>
                    <input v-model="form.location" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Duration (days) *</label>
                    <input v-model.number="form.duration" type="number" min="1" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Total Slots *</label>
                    <input v-model.number="form.total_slots" type="number" min="1" class="form-control" required />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Price (₹)</label>
                    <input v-model.number="form.price" type="number" min="0" class="form-control" />
                  </div>
                  <div class="col-md-4">
                    <label class="form-label">Altitude (m)</label>
                    <input v-model.number="form.altitude_meters" type="number" class="form-control" />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Start Date *</label>
                    <input v-model="form.start_date" type="date" class="form-control" required />
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">End Date *</label>
                    <input v-model="form.end_date" type="date" class="form-control" required />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Meeting Point</label>
                    <input v-model="form.meeting_point" class="form-control" />
                  </div>
                  <div class="col-12">
                    <label class="form-label">Description</label>
                    <textarea v-model="form.description" class="form-control" rows="3"></textarea>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Requirements</label>
                    <textarea v-model="form.requirement" class="form-control" rows="2"></textarea>
                  </div>
                </div>
              </form>
              <div v-if="formError" class="alert alert-danger mt-3 py-2 small">{{ formError }}</div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal">Cancel</button>
              <button class="btn btn-success" @click="saveTrek" :disabled="saving">
                <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                {{ editMode ? 'Update Trek' : 'Create Trek' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Assign Staff Modal -->
      <div class="modal fade" ref="assignModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Assign Staff — {{ selectedTrek?.trek_name }}</h5>
              <button type="button" class="btn-close" @click="closeAssignModal"></button>
            </div>
            <div class="modal-body">
              <label class="form-label">Select Staff Member</label>
              <select v-model="assignStaffId" class="form-select">
                <option value="">— Unassigned —</option>
                <option v-for="s in activeStaff" :key="s.id" :value="s.id">
                  {{ s.name }} ({{ s.staff_code }}) — {{ s.specialization || 'General' }}
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeAssignModal">Cancel</button>
              <button class="btn btn-primary" @click="doAssign" :disabled="!assignStaffId || saving">Assign</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Modal -->
      <div class="modal fade" ref="statusModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Change Status — {{ selectedTrek?.trek_name }}</h5>
              <button type="button" class="btn-close" @click="closeStatusModal"></button>
            </div>
            <div class="modal-body">
              <label class="form-label">New Status</label>
              <select v-model="newStatus" class="form-select">
                <option v-for="s in statuses" :key="s">{{ s }}</option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeStatusModal">Cancel</button>
              <button class="btn btn-success" @click="doStatusChange" :disabled="saving">Update</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,

  data() {
    return {
      treks: [], loading: true, saving: false,
      page: 1, totalPages: 1,
      filters: { search: '', status: '' },
      statuses: ['Pending', 'Approved', 'Open', 'Closed', 'Completed'],
      form: this._blankForm(),
      editMode: false, selectedTrek: null, formError: '',
      activeStaff: [], assignStaffId: '',
      newStatus: 'Approved',
      toast: { show: false, msg: '', type: 'success' },
      _debounce: null,
    };
  },

  async mounted() {
    await this.fetchTreks();
  },

  methods: {
    _blankForm() {
      return {
        trek_name: '', location: '', description: '', difficulty: 'Moderate',
        duration: 1, total_slots: 20, price: 0, altitude_meters: null,
        start_date: '', end_date: '', meeting_point: '', requirement: '',
      };
    },

    async fetchTreks() {
      this.loading = true;
      try {
        const res = await API.get('/admin/treks', {
          page: this.page, search: this.filters.search, status: this.filters.status,
        });
        this.treks      = res.data.treks;
        this.totalPages = res.data.pages;
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.loading = false; }
    },

    debouncedFetch() {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => { this.page = 1; this.fetchTreks(); }, 400);
    },

    resetFilters() { this.filters = { search: '', status: '' }; this.page = 1; this.fetchTreks(); },
    changePage(p)  { if (p >= 1 && p <= this.totalPages) { this.page = p; this.fetchTreks(); } },

    openCreate() {
      this.form = this._blankForm(); this.editMode = false; this.formError = '';
      new bootstrap.Modal(this.$refs.trekModal).show();
    },

    openEdit(t) {
      this.form = {
        trek_name: t.trek_name, location: t.location, description: t.description || '',
        difficulty: t.difficulty, duration: t.duration, total_slots: t.total_slots,
        price: t.price, altitude_meters: t.altitude_meters,
        start_date: t.start_date, end_date: t.end_date,
        meeting_point: t.meeting_point || '', requirement: t.requirement || '',
      };
      this.selectedTrek = t; this.editMode = true; this.formError = '';
      new bootstrap.Modal(this.$refs.trekModal).show();
    },

    closeModal() { bootstrap.Modal.getInstance(this.$refs.trekModal)?.hide(); },

    async saveTrek() {
      this.saving = true; this.formError = '';
      try {
        if (this.editMode) {
          await API.put(`/admin/treks/${this.selectedTrek.id}`, this.form);
          this.showToast('Trek updated successfully');
        } else {
          await API.post('/admin/treks', this.form);
          this.showToast('Trek created successfully');
        }
        this.closeModal();
        this.fetchTreks();
      } catch (e) { this.formError = e.message; }
      finally { this.saving = false; }
    },

    async deleteTrek(t) {
      if (!confirm(`Delete "${t.trek_name}"? This cannot be undone.`)) return;
      try {
        await API.delete(`/admin/treks/${t.id}`);
        this.showToast('Trek deleted');
        this.fetchTreks();
      } catch (e) { this.showToast(e.message, 'danger'); }
    },

    async openAssign(t) {
      this.selectedTrek = t; this.assignStaffId = t.assigned_staff_id || '';
      const res = await API.get('/admin/staff/active');
      this.activeStaff = res.data;
      new bootstrap.Modal(this.$refs.assignModal).show();
    },

    closeAssignModal() { bootstrap.Modal.getInstance(this.$refs.assignModal)?.hide(); },

    async doAssign() {
      this.saving = true;
      try {
        await API.post(`/admin/treks/${this.selectedTrek.id}/assign-staff`, { staff_profile_id: this.assignStaffId });
        this.showToast('Staff assigned successfully');
        this.closeAssignModal();
        this.fetchTreks();
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.saving = false; }
    },

    openStatus(t) {
      this.selectedTrek = t; this.newStatus = t.status;
      new bootstrap.Modal(this.$refs.statusModal).show();
    },

    closeStatusModal() { bootstrap.Modal.getInstance(this.$refs.statusModal)?.hide(); },

    async doStatusChange() {
      this.saving = true;
      try {
        await API.put(`/admin/treks/${this.selectedTrek.id}/status`, { status: this.newStatus });
        this.showToast(`Status updated to ${this.newStatus}`);
        this.closeStatusModal();
        this.fetchTreks();
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.saving = false; }
    },

    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 3500);
    },
  },
};
