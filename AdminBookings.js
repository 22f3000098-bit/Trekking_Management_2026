const AdminBookings = {
  template: `
    <div>
      <div style="
        position:relative;height:120px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1501554728187-ce583db33af7?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 30%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(17,24,39,.82) 0%,rgba(17,24,39,.4) 60%,transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-center justify-content-between" style="position:relative;z-index:1;">
          <div>
            <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.65);margin:0 0 4px;">Admin · Bookings</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:white;margin:0;">All Bookings</h2>
          </div>
          <span style="font-size:.82rem;color:rgba(255,255,255,.7);">{{ total }} total</span>
        </div>
      </div>
    <div class="page-wrapper" style="padding-top:24px;">
      <div class="container-fluid px-4">

        <div class="card mb-3">
          <div class="card-body py-2">
            <div class="row g-2">
              <div class="col-md-4">
                <select v-model="filters.status" @change="fetchBookings" class="form-select form-select-sm">
                  <option value="">All Statuses</option>
                  <option>Booked</option><option>Cancelled</option><option>Completed</option>
                </select>
              </div>
              <div class="col-auto">
                <button class="btn btn-outline-secondary btn-sm" @click="resetFilters">Reset</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body p-0">
            <div v-if="loading" class="loading-overlay"><div class="spinner-border text-success"></div></div>
            <div v-else-if="!bookings.length" class="text-center text-muted py-5">No bookings found.</div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Ref</th><th>User</th><th>Trek</th><th>Location</th>
                    <th>Booked On</th><th>Trek Dates</th><th>Status</th><th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="b in bookings" :key="b.id">
                    <td><code class="small">{{ b.booking_ref }}</code></td>
                    <td>
                      <div class="small fw-semibold">{{ b.user_name || '—' }}</div>
                      <small class="text-muted">{{ b.user_email }}</small>
                    </td>
                    <td><small class="fw-semibold">{{ b.trek_name }}</small></td>
                    <td><small>{{ b.location }}</small></td>
                    <td><small>{{ b.booking_date?.slice(0,10) }}</small></td>
                    <td>
                      <small>{{ b.start_date }}<br>{{ b.end_date }}</small>
                    </td>
                    <td>
                      <span :class="'badge badge-booking-' + b.status.toLowerCase()">{{ b.status }}</span>
                    </td>
                    <td>
                      <span class="small">{{ b.payment_status }}</span>
                      <small v-if="b.amount_paid" class="d-block text-muted">₹{{ b.amount_paid }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
      </div>
    </div>
    </div>
  `,

  data() {
    return {
      bookings: [], loading: true,
      page: 1, totalPages: 1, total: 0,
      filters: { status: '' },
    };
  },

  async mounted() { await this.fetchBookings(); },

  methods: {
    async fetchBookings() {
      this.loading = true;
      try {
        const res = await API.get('/admin/bookings', { page: this.page, status: this.filters.status });
        this.bookings = res.data.bookings;
        this.totalPages = res.data.pages;
        this.total = res.data.total;
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },

    resetFilters() { this.filters.status = ''; this.page = 1; this.fetchBookings(); },
    go(p) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.fetchBookings(); } },
  },
};
