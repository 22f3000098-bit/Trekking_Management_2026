const StaffDashboard = {
  template: `
    <div>

      <!-- Photo Hero Banner -->
      <div style="
        position:relative;height:200px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 40%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right, rgba(17,24,39,.78) 0%, rgba(17,24,39,.3) 60%, transparent 100%);"></div>
        <div class="container-fluid px-4 h-100 d-flex align-items-end justify-content-between pb-4" style="position:relative;z-index:1;">
          <div v-if="dashData">
            <p style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.7);margin-bottom:6px;">
              Staff Portal
            </p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.85rem;font-weight:700;color:white;margin-bottom:4px;">
              {{ dashData.staff.first_name }} {{ dashData.staff.last_name }}
            </h2>
            <div style="display:flex;align-items:center;gap:10px;">
              <code style="font-size:.76rem;background:rgba(255,255,255,.15);color:rgba(255,255,255,.9);padding:2px 10px;border-radius:5px;border:1px solid rgba(255,255,255,.25);">
                {{ dashData.staff.staff_code }}
              </code>
              <span v-if="dashData.staff.specialization" style="font-size:.82rem;color:rgba(255,255,255,.75);">
                · {{ dashData.staff.specialization }}
              </span>
            </div>
          </div>
          <button class="btn btn-sm fw-bold" style="background:white;color:var(--g900);border:none;border-radius:8px;padding:8px 16px;"
                  @click="$router.push('/staff/treks/new')">
            <i class="bi bi-plus-lg me-1"></i>Add Trek
          </button>
        </div>
      </div>

    <div class="page-wrapper" style="padding-top:28px;">
      <div class="container-fluid px-4">

        <div v-if="loading" class="loading-overlay"><div class="spinner-tma"></div></div>

        <div v-else-if="dashData">
          <!-- Stats -->
          <div class="row g-3 mb-5">
            <div class="col-md-4">
              <div class="stat-tile green">
                <div class="stat-tile-icon"><i class="bi bi-map"></i></div>
                <div>
                  <div class="stat-tile-value">{{ dashData.total_assigned }}</div>
                  <div class="stat-tile-label">Assigned Treks</div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-tile blue">
                <div class="stat-tile-icon"><i class="bi bi-people"></i></div>
                <div>
                  <div class="stat-tile-value">{{ totalBookings }}</div>
                  <div class="stat-tile-label">Total Participants</div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-tile gold">
                <div class="stat-tile-icon"><i class="bi bi-lightning-charge"></i></div>
                <div>
                  <div class="stat-tile-value">{{ activeCount }}</div>
                  <div class="stat-tile-label">Active Treks</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Trek Cards -->
          <div class="section-rule">My Assigned Treks</div>

          <div v-if="!dashData.treks.length" class="empty-state">
            <div class="empty-state-icon"><i class="bi bi-map"></i></div>
            <div class="empty-state-title">No treks assigned yet</div>
            <p class="empty-state-desc">Propose a new trek for admin approval, or contact the admin to get your first assignment.</p>
            <button class="btn btn-success btn-sm fw-bold mt-2" @click="$router.push('/staff/treks/new')">
              <i class="bi bi-plus-lg me-1"></i>Add Trek
            </button>
          </div>

          <div class="row g-3">
            <div class="col-md-6 col-xl-4" v-for="t in dashData.treks" :key="t.id">
              <div class="trek-card" @click="$router.push('/staff/treks/' + t.id)">
                <div class="trek-card-thumb">
                  <div :class="'trek-card-thumb-bg ' + t.difficulty.toLowerCase()">
                    <div class="trek-card-thumb-icon"><i class="bi bi-geo-alt-fill"></i></div>
                  </div>
                  <span class="trek-card-difficulty">{{ t.difficulty }}</span>
                  <span :class="'tma-badge badge-' + t.status.toLowerCase()"
                        style="position:absolute;top:10px;left:10px;font-size:.65rem;">
                    {{ t.status }}
                  </span>
                </div>
                <div class="trek-card-body">
                  <div class="trek-card-name">{{ t.trek_name }}</div>
                  <div class="trek-card-location">
                    <i class="bi bi-geo-alt"></i> {{ t.location }}
                  </div>
                  <div class="trek-meta">
                    <span class="trek-meta-chip"><i class="bi bi-calendar"></i>{{ t.start_date }}</span>
                    <span class="trek-meta-chip"><i class="bi bi-people"></i>{{ t.booked_count }} booked</span>
                  </div>

                  <!-- Fill bar -->
                  <div style="margin-bottom:8px;">
                    <div class="d-flex justify-content-between" style="font-size:.75rem;color:var(--muted);margin-bottom:5px;">
                      <span>{{ t.total_slots - t.available_slots }} / {{ t.total_slots }} slots filled</span>
                      <span>{{ Math.round((t.total_slots - t.available_slots) / t.total_slots * 100) }}%</span>
                    </div>
                    <div style="height:5px;background:var(--g100);border-radius:4px;overflow:hidden;">
                      <div style="height:100%;background:var(--icon);border-radius:4px;transition:width .3s;"
                           :style="'width:' + Math.round((t.total_slots - t.available_slots) / t.total_slots * 100) + '%'">
                      </div>
                    </div>
                  </div>

                  <div style="font-size:.78rem;color:var(--icon);font-weight:700;">
                    View Details →
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

  data() { return { dashData: null, loading: true }; },

  computed: {
    totalBookings() { return this.dashData?.treks.reduce((s, t) => s + t.booked_count, 0) || 0; },
    activeCount()   { return this.dashData?.treks.filter(t => ['Open','Approved'].includes(t.status)).length || 0; },
  },

  async mounted() {
    try {
      const res = await API.get('/staff/dashboard');
      this.dashData = res.data;
    } catch (e) { console.error(e); }
    finally { this.loading = false; }
  },
};
