const UserTreks = {
  template: `
    <div>

      <!-- Photo Hero Banner -->
      <div style="
        position:relative;height:240px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 55%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom, rgba(0,0,0,.15) 0%, rgba(0,0,0,.6) 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-end pb-5" style="position:relative;z-index:1;">
          <div>
            <p style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1.2px;color:rgba(255,255,255,.75);margin-bottom:8px;">
              — Upcoming Departures —
            </p>
            <h2 style="font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;color:white;margin-bottom:6px;line-height:1.2;">
              Explore Trek Routes
            </h2>
            <p style="color:rgba(255,255,255,.75);font-size:.9rem;margin:0;">
              Curated treks across India — filter by difficulty, duration, or price.
            </p>
          </div>
        </div>
      </div>

    <div class="page-wrapper" style="padding-top:28px;">
      <div class="container-fluid px-4">

        <div class="row g-4">

          <!-- Sidebar Filter -->
          <div class="col-md-3">
            <div class="card filter-card">
              <div class="card-header d-flex align-items-center justify-content-between">
                <span><i class="bi bi-sliders me-2 text-muted"></i>Filters</span>
                <button class="btn btn-sm" style="font-size:.75rem;color:var(--muted);padding:2px 8px;"
                        @click="resetFilters">Clear</button>
              </div>
              <div class="card-body" style="padding:20px;">

                <div class="filter-section">
                  <div class="filter-title">Search</div>
                  <input v-model="filters.search" @input="debouncedFetch" class="form-control"
                         placeholder="Name or location…" style="font-size:.85rem;" />
                </div>

                <div class="filter-section">
                  <div class="filter-title">Difficulty</div>
                  <div class="d-flex flex-column gap-1">
                    <label v-for="d in ['Easy','Moderate','Hard','']" :key="d"
                           class="d-flex align-items-center gap-2" style="cursor:pointer;font-size:.875rem;">
                      <input type="radio" v-model="filters.difficulty" :value="d" @change="fetchTreks"
                             class="form-check-input mt-0" style="accent-color:var(--icon);" />
                      <span>{{ d || 'All levels' }}</span>
                    </label>
                  </div>
                </div>

                <div class="filter-section">
                  <div class="filter-title">Max Duration (days)</div>
                  <input v-model.number="filters.max_duration" @change="fetchTreks"
                         type="number" min="1" class="form-control" placeholder="Any"
                         style="font-size:.85rem;" />
                </div>

                <div>
                  <div class="filter-title">Max Price (₹)</div>
                  <input v-model.number="filters.max_price" @change="fetchTreks"
                         type="number" min="0" class="form-control" placeholder="Any"
                         style="font-size:.85rem;" />
                </div>

              </div>
            </div>
          </div>

          <!-- Trek Listings -->
          <div class="col-md-9">

            <div v-if="loading" class="loading-overlay">
              <div class="spinner-tma"></div>
            </div>

            <div v-else-if="!treks.length" class="empty-state">
              <div class="empty-state-icon"><i class="bi bi-compass"></i></div>
              <div class="empty-state-title">No treks found</div>
              <p class="empty-state-desc">Try adjusting your filters to see more options.</p>
              <button class="btn btn-outline-success btn-sm" @click="resetFilters">Clear Filters</button>
            </div>

            <div v-else>
              <!-- Count bar -->
              <div class="d-flex align-items-center justify-content-between mb-3"
                   style="font-size:.82rem;color:var(--muted);">
                <span>Showing <strong style="color:var(--text);">{{ treks.length }}</strong> of <strong style="color:var(--text);">{{ total }}</strong> treks</span>
              </div>

              <!-- Table header -->
              <div class="trek-table-wrap">
                <div class="trek-row trek-row-header">
                  <div>Date &amp; Duration</div>
                  <div>Trek &amp; Location</div>
                  <div>Difficulty</div>
                  <div>Altitude</div>
                  <div>Availability</div>
                  <div>Price</div>
                </div>

                <!-- Trek rows -->
                <div v-for="t in treks" :key="t.id" class="trek-row">
                  <div class="trek-row-date">
                    <div class="date-main">{{ formatDate(t.start_date) }}</div>
                    <div class="date-dur">{{ t.duration }} day{{ t.duration !== 1 ? 's' : '' }}</div>
                  </div>

                  <div class="trek-row-info">
                    <div class="trek-name-link">{{ t.trek_name }}</div>
                    <div class="trek-loc"><i class="bi bi-geo-alt me-1"></i>{{ t.location }}</div>
                  </div>

                  <div>
                    <span :class="'tma-badge badge-' + t.difficulty.toLowerCase()">{{ t.difficulty }}</span>
                  </div>

                  <div style="font-size:.82rem;color:var(--muted);">
                    <span v-if="t.altitude_meters">
                      <i class="bi bi-arrow-up-short"></i>{{ t.altitude_meters }}m
                    </span>
                    <span v-else>—</span>
                  </div>

                  <div>
                    <span v-if="t.available_slots > 0" class="avail-tag available">
                      <span class="avail-dot open"></span>{{ t.available_slots }} left
                    </span>
                    <span v-else class="avail-tag full">
                      <span class="avail-dot sold"></span>Sold out
                    </span>
                  </div>

                  <div>
                    <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:.95rem;margin-bottom:6px;">
                      {{ t.price > 0 ? '₹' + t.price.toLocaleString() : 'Free' }}
                    </div>
                    <button v-if="t.available_slots > 0"
                            class="btn btn-success btn-sm fw-bold"
                            style="font-size:.75rem;padding:5px 14px;"
                            @click="$router.push('/user/treks/' + t.id)">
                      <i class="bi bi-arrow-right me-1"></i>Book Now
                    </button>
                    <button v-else class="btn btn-sm disabled fw-bold"
                            style="font-size:.75rem;padding:5px 14px;background:var(--bg);color:var(--muted);border:1px solid var(--border);">
                      Full
                    </button>
                  </div>
                </div>
              </div>

              <!-- Pagination -->
              <div class="tma-pagination" v-if="totalPages > 1">
                <button class="tma-page-btn" @click="go(page-1)" :disabled="page===1">‹</button>
                <button v-for="p in totalPages" :key="p"
                        :class="'tma-page-btn ' + (p===page ? 'active' : '')"
                        @click="go(p)">{{ p }}</button>
                <button class="tma-page-btn" @click="go(page+1)" :disabled="page===totalPages">›</button>
              </div>
            </div>

          </div>
        </div>

        <!-- Toast -->
        <div class="tma-toast-container">
          <div v-if="toast.show" :class="'tma-toast ' + toast.type">
            <i :class="toast.type==='success' ? 'bi bi-check-circle-fill text-success' : 'bi bi-exclamation-circle-fill text-danger'"></i>
            {{ toast.msg }}
            <button type="button" class="btn-close ms-auto" style="font-size:.7rem;" @click="toast.show=false"></button>
          </div>
        </div>

      </div>
    </div>
    </div>
  `,

  data() {
    return {
      treks: [], loading: true,
      page: 1, totalPages: 1, total: 0,
      filters: { search: '', difficulty: '', max_duration: null, max_price: null },
      toast: { show: false, msg: '', type: 'success' },
      _debounce: null,
    };
  },

  async mounted() { await this.fetchTreks(); },

  methods: {
    async fetchTreks() {
      this.loading = true;
      try {
        const params = { page: this.page };
        if (this.filters.search)       params.search       = this.filters.search;
        if (this.filters.difficulty)   params.difficulty   = this.filters.difficulty;
        if (this.filters.max_duration) params.max_duration = this.filters.max_duration;
        if (this.filters.max_price)    params.max_price    = this.filters.max_price;
        const res = await API.get('/user/treks', params);
        this.treks = res.data.treks; this.totalPages = res.data.pages; this.total = res.data.total;
      } catch (e) { this.showToast(e.message, 'danger'); }
      finally { this.loading = false; }
    },

    debouncedFetch() {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => { this.page = 1; this.fetchTreks(); }, 400);
    },

    resetFilters() {
      this.filters = { search: '', difficulty: '', max_duration: null, max_price: null };
      this.page = 1; this.fetchTreks();
    },

    go(p) { if (p >= 1 && p <= this.totalPages) { this.page = p; this.fetchTreks(); } },

    formatDate(d) {
      if (!d) return '—';
      const dt = new Date(d + 'T00:00:00');
      return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    showToast(msg, type = 'success') {
      this.toast = { show: true, msg, type };
      setTimeout(() => { this.toast.show = false; }, 4500);
    },
  },
};
