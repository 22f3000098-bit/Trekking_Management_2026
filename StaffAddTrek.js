const StaffAddTrek = {
  template: `
    <div>
      <!-- Hero -->
      <div style="
        position:relative;height:150px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 50%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(17,24,39,.82) 0%,rgba(17,24,39,.4) 60%,transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-end pb-4" style="position:relative;z-index:1;">
          <div>
            <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.65);margin:0 0 4px;">Staff · Propose Trek</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.55rem;font-weight:700;color:white;margin:0;">Add a New Trek</h2>
          </div>
        </div>
      </div>

    <div class="page-wrapper" style="padding-top:24px;">
      <div class="container-fluid px-4" style="max-width:920px;margin:0 auto;">

        <!-- Success state -->
        <div v-if="success" class="card text-center" style="padding:48px 40px;">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--g200);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;">
            <i class="bi bi-check2-all" style="color:var(--g700);font-size:1.7rem;"></i>
          </div>
          <h3 style="font-family:'Playfair Display',serif;margin-bottom:6px;">Trek Submitted!</h3>
          <p style="color:var(--muted);font-size:.9rem;margin-bottom:22px;">
            "{{ submittedName }}" has been submitted and is now <strong>Pending admin approval</strong>.
            Once approved, you'll be able to open it for bookings.
          </p>
          <div class="d-flex gap-3 justify-content-center">
            <button class="btn btn-outline-secondary fw-bold" @click="resetForm">
              <i class="bi bi-plus-lg me-1"></i>Add Another
            </button>
            <button class="btn btn-success fw-bold" @click="$router.push('/staff/dashboard')">
              <i class="bi bi-grid-1x2 me-1"></i>Back to Dashboard
            </button>
          </div>
        </div>

        <!-- Form -->
        <div v-else class="card">
          <div class="card-header"><i class="bi bi-map"></i>Trek Details</div>
          <div class="card-body">
            <p class="text-muted small mb-4">
              <i class="bi bi-info-circle me-1"></i>
              New treks you add are assigned to you and start as <strong>Pending</strong> until an admin approves them.
            </p>
            <form @submit.prevent="submit">
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
                  <input v-model.number="form.altitude_meters" type="number" min="0" class="form-control" />
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

              <div v-if="formError" class="alert alert-danger mt-3 py-2 small mb-0">{{ formError }}</div>

              <div class="d-flex gap-2 justify-content-end mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="$router.push('/staff/dashboard')">Cancel</button>
                <button type="submit" class="btn btn-success fw-bold" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                  Submit Trek
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
    </div>
  `,

  data() {
    return {
      form: this._blankForm(),
      saving: false,
      formError: '',
      success: false,
      submittedName: '',
    };
  },

  methods: {
    _blankForm() {
      return {
        trek_name: '', location: '', description: '', difficulty: 'Moderate',
        duration: 1, total_slots: 20, price: 0, altitude_meters: null,
        start_date: '', end_date: '', meeting_point: '', requirement: '',
      };
    },

    resetForm() {
      this.form = this._blankForm();
      this.formError = '';
      this.success = false;
    },

    async submit() {
      this.formError = '';
      if (this.form.end_date && this.form.start_date && this.form.end_date <= this.form.start_date) {
        this.formError = 'End date must be after start date.';
        return;
      }
      this.saving = true;
      try {
        const res = await API.post('/staff/treks', this.form);
        this.submittedName = res.data?.trek_name || this.form.trek_name;
        this.success = true;
      } catch (e) {
        this.formError = e.message;
      } finally {
        this.saving = false;
      }
    },
  },
};
