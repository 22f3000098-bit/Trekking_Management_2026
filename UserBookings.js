const UserBookings = {
  template: `
    <div>
      <div style="
        position:relative;height:150px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 40%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(17,24,39,.78) 0%,rgba(17,24,39,.35) 60%,transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-end pb-4 justify-content-between" style="position:relative;z-index:1;">
          <div>
            <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.65);margin:0 0 4px;">Your Journey</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.65rem;font-weight:700;color:white;margin:0;">My Bookings</h2>
          </div>
          <button class="btn btn-sm fw-bold" style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.35);border-radius:8px;padding:7px 16px;backdrop-filter:blur(4px);"
                  @click="exportCSV" :disabled="exporting">
            <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
            <i v-else class="bi bi-download me-1"></i>Export CSV
          </button>
        </div>
      </div>
    <div class="page-wrapper" style="padding-top:24px;">
      <div class="container-fluid px-4">

        <!-- Filter Tabs -->
        <div class="card mb-3">
          <div class="card-body py-2">
            <div class="d-flex gap-2 flex-wrap">
              <button v-for="tab in tabs" :key="tab.value"
                      :class="'btn btn-sm ' + (activeTab === tab.value ? 'btn-success' : 'btn-outline-secondary')"
                      @click="setTab(tab.value)">
                {{ tab.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body p-0">
            <div v-if="loading" class="loading-overlay"><div class="spinner-border text-success"></div></div>
            <div v-else-if="!bookings.length" class="text-center text-muted py-5">
              <div style="font-size:2.5rem">📭</div>
              <p>No {{ activeTab ? activeTab.toLowerCase() : '' }} bookings found.</p>
              <router-link v-if="activeTab !== 'Cancelled'" to="/user/treks"
                           class="btn btn-success btn-sm">Browse Open Treks</router-link>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Ref</th><th>Trek</th><th>Location</th><th>Difficulty</th>
                    <th>Dates</th><th>Booked On</th><th>Status</th><th>Payment</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in bookings" :key="b.id">
                    <td><code class="small">{{ b.booking_ref }}</code></td>
                    <td>
                      <div class="fw-semibold small">{{ b.trek_name }}</div>
                      <small class="text-muted">{{ b.duration }}d</small>
                    </td>
                    <td><small>{{ b.location }}</small></td>
                    <td>
                      <span v-if="b.difficulty" :class="'tma-badge badge-' + b.difficulty.toLowerCase()">
                        {{ b.difficulty }}
                      </span>
                    </td>
                    <td>
                      <small>{{ b.start_date }}<br>{{ b.end_date }}</small>
                    </td>
                    <td><small>{{ b.booking_date?.slice(0,10) }}</small></td>
                    <td>
                      <span :class="'tma-badge badge-' + b.status.toLowerCase()">{{ b.status }}</span>
                    </td>
                    <td>
                      <small>{{ b.payment_status }}</small>
                      <small v-if="b.amount_paid" class="d-block text-muted">₹{{ b.amount_paid }}</small>
                    </td>
                    <td>
                      <button v-if="b.status === 'Booked'" class="btn btn-xs btn-outline-danger"
                              @click="cancel(b)" :disabled="cancelingId === b.id">
                        <span v-if="cancelingId === b.id" class="spinner-border spinner-border-sm"></span>
                        <i v-else class="bi bi-x-circle"></i>
                        Cancel
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
    </div>
    </div>
  `,

  data() {
    return {
      bookings: [], loading: true,
      activeTab: '',
      tabs: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'Booked' },
        { label: 'Completed', value: 'Completed' },
        { label: '❌ Cancelled', value: 'Cancelled' },
      ],
      cancelingId: null, exporting: false,
      toast: { show: false, msg: '', type: 'success' },
    };
  },

  async mounted() { await this.fetchBookings(); },

  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const res = await API.get('/user/bookings', { status: this.activeTab });
        this.bookings = res.data.bookings;
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.loading = false; }
    },

    setTab(v) { this.activeTab = v; this.fetchBookings(); },

    async cancel(b) {
      const reason = prompt(`Reason for cancelling "${b.trek_name}" (optional):`) ?? '';
      if (reason === null) return;
      this.cancelingId = b.id;
      try {
        await API.delete(`/user/bookings/${b.id}`, { reason });
        this.showToast('Booking cancelled');
        await this.fetchBookings();
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.cancelingId = null; }
    },

    async exportCSV() {
      this.exporting = true;
      try {
        await API.post('/user/bookings/export');
        this.showToast('Export started! You\'ll receive an email shortly.');
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.exporting = false; }
    },

    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 4000);
    },
  },
};
