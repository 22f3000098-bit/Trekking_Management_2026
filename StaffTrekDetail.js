const StaffTrekDetail = {
  template: `
    <div class="page-wrapper">
      <div class="container-fluid px-4">
        <div class="mb-3">
          <router-link to="/staff/dashboard" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i>Dashboard
          </router-link>
        </div>

        <div v-if="loading" class="loading-overlay"><div class="spinner-border text-success"></div></div>

        <div v-else-if="trek">
          <!-- Trek Header -->
          <div class="card mb-4">
            <div class="card-body">
              <div class="row align-items-center">
                <div class="col-md-8">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <h4 class="fw-bold mb-0">{{ trek.trek_name }}</h4>
                    <span :class="'tma-badge badge-' + trek.status.toLowerCase()">{{ trek.status }}</span>
                    <span :class="'tma-badge badge-' + trek.difficulty.toLowerCase()">{{ trek.difficulty }}</span>
                  </div>
                  <p class="text-muted mb-2"><i class="bi bi-geo-alt me-1"></i>{{ trek.location }}</p>
                  <div class="row g-3 small text-muted">
                    <div class="col-auto"><i class="bi bi-calendar me-1"></i>{{ trek.start_date }} → {{ trek.end_date }}</div>
                    <div class="col-auto"><i class="bi bi-clock me-1"></i>{{ trek.duration }} days</div>
                    <div class="col-auto"><i class="bi bi-currency-rupee"></i>{{ trek.price }}</div>
                    <div class="col-auto" v-if="trek.altitude_meters">
                      <i class="bi bi-arrow-up me-1"></i>{{ trek.altitude_meters }}m
                    </div>
                  </div>
                </div>
                <div class="col-md-4 text-md-end mt-3 mt-md-0">
                  <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                    <button class="btn btn-sm btn-outline-primary" @click="openSlotsModal">
                      <i class="bi bi-people me-1"></i>Update Slots
                    </button>
                    <button class="btn btn-sm btn-outline-success" @click="openStatusModal">
                      <i class="bi bi-arrow-repeat me-1"></i>Change Status
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Booking Stats + Slot Info -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
              <div class="card text-center">
                <div class="card-body py-3">
                  <div class="h3 fw-bold text-success">{{ trek.booking_stats.booked }}</div>
                  <small class="text-muted">Booked</small>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card text-center">
                <div class="card-body py-3">
                  <div class="h3 fw-bold text-danger">{{ trek.booking_stats.cancelled }}</div>
                  <small class="text-muted">Cancelled</small>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card text-center">
                <div class="card-body py-3">
                  <div class="h3 fw-bold text-secondary">{{ trek.booking_stats.completed }}</div>
                  <small class="text-muted">Completed</small>
                </div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card text-center">
                <div class="card-body py-3">
                  <div class="h3 fw-bold text-primary">{{ trek.available_slots }}/{{ trek.total_slots }}</div>
                  <small class="text-muted">Available Slots</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Participants -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 fw-semibold">Participant List</h6>
              <div class="d-flex gap-2 align-items-center">
                <select v-model="partStatus" @change="fetchParticipants" class="form-select form-select-sm"
                        style="width:auto;">
                  <option value="">All</option>
                  <option>Booked</option><option>Cancelled</option><option>Completed</option>
                </select>
              </div>
            </div>
            <div class="card-body p-0">
              <div v-if="partLoading" class="loading-overlay"><div class="spinner-border text-success spinner-border-sm"></div></div>
              <div v-else-if="!participants.length" class="text-center text-muted py-4">No participants found.</div>
              <div v-else class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>#</th><th>Participant</th><th>Contact</th>
                      <th>Experience</th><th>Emergency Contact</th>
                      <th>Booking Ref</th><th>Status</th><th>Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(p, idx) in participants" :key="p.booking_id">
                      <td class="text-muted small">{{ idx + 1 }}</td>
                      <td>
                        <div class="fw-semibold">{{ p.first_name || '' }} {{ p.last_name || '' }}</div>
                        <small class="text-muted">{{ p.email }}</small>
                      </td>
                      <td><small>{{ p.phone || '—' }}</small></td>
                      <td><small>{{ p.experience_level || '—' }}</small></td>
                      <td>
                        <small>{{ p.emergency_contact_name || '—' }}</small>
                        <small class="d-block text-muted">{{ p.emergency_contact_phone || '' }}</small>
                      </td>
                      <td><code class="small">{{ p.booking_ref }}</code></td>
                      <td><span :class="'tma-badge badge-' + p.status.toLowerCase()">{{ p.status }}</span></td>
                      <td><small>{{ p.booking_date?.slice(0,10) }}</small></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

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

      <!-- Slots Modal -->
      <div class="modal fade" ref="slotsModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Update Available Slots</h5>
              <button type="button" class="btn-close" @click="closeModal('slotsModal')"></button>
            </div>
            <div class="modal-body">
              <label class="form-label">Available Slots (max {{ trek?.total_slots }})</label>
              <input v-model.number="newSlots" type="number" min="0"
                     :max="trek?.total_slots" class="form-control" />
              <small class="text-muted">Current: {{ trek?.available_slots }} / {{ trek?.total_slots }}</small>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal('slotsModal')">Cancel</button>
              <button class="btn btn-primary" @click="doUpdateSlots" :disabled="saving">Update</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Status Modal -->
      <div class="modal fade" ref="statusModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Change Trek Status</h5>
              <button type="button" class="btn-close" @click="closeModal('statusModal')"></button>
            </div>
            <div class="modal-body">
              <label class="form-label">New Status</label>
              <select v-model="newStatus" class="form-select">
                <option>Open</option><option>Closed</option><option>Completed</option>
              </select>
              <div v-if="newStatus === 'Completed'" class="alert alert-warning mt-3 small py-2">
                ⚠️ Marking as Completed will automatically complete all active bookings.
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="closeModal('statusModal')">Cancel</button>
              <button class="btn btn-success" @click="doUpdateStatus" :disabled="saving">Update Status</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      trek: null, loading: true,
      participants: [], partLoading: false, partStatus: '',
      newSlots: 0, newStatus: 'Open', saving: false,
      toast: { show: false, msg: '', type: 'success' },
    };
  },

  async mounted() {
    await this.fetchTrek();
    await this.fetchParticipants();
  },

  methods: {
    async fetchTrek() {
      this.loading = true;
      try {
        const res = await API.get(`/staff/treks/${this.$route.params.id}`);
        this.trek   = res.data;
        this.newSlots  = res.data.available_slots;
        this.newStatus = res.data.status;
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.loading = false; }
    },

    async fetchParticipants() {
      this.partLoading = true;
      try {
        const res = await API.get(`/staff/treks/${this.$route.params.id}/participants`,
                                  { status: this.partStatus });
        this.participants = res.data.participants;
      } catch (e) { console.error(e); }
      finally { this.partLoading = false; }
    },

    openSlotsModal()  { new bootstrap.Modal(this.$refs.slotsModal).show(); },
    openStatusModal() { new bootstrap.Modal(this.$refs.statusModal).show(); },
    closeModal(ref)   { bootstrap.Modal.getInstance(this.$refs[ref])?.hide(); },

    async doUpdateSlots() {
      this.saving = true;
      try {
        await API.put(`/staff/treks/${this.trek.id}/slots`, { available_slots: this.newSlots });
        this.showToast('Slots updated');
        this.closeModal('slotsModal');
        await this.fetchTrek();
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.saving = false; }
    },

    async doUpdateStatus() {
      this.saving = true;
      try {
        await API.put(`/staff/treks/${this.trek.id}/status`, { status: this.newStatus });
        this.showToast(`Status updated to ${this.newStatus}`);
        this.closeModal('statusModal');
        await this.fetchTrek();
        await this.fetchParticipants();
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.saving = false; }
    },

    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 3500);
    },
  },
};
