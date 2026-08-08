const UserTrekDetail = {
  template: `
    <div>

      <!-- Hero -->
      <div :class="'trek-card-thumb-bg ' + diffClass" style="height:260px;position:relative;overflow:hidden;">
        <div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.15) 0%,rgba(0,0,0,.65) 100%);z-index:1;"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:0;opacity:.2;">
          <i class="bi bi-geo-alt-fill" style="font-size:10rem;color:white;"></i>
        </div>
        <div class="container-fluid px-4 h-100 d-flex align-items-end pb-5" style="position:relative;z-index:2;">
          <div class="d-flex align-items-end justify-content-between w-100 flex-wrap gap-3">
            <div>
              <div class="d-flex align-items-center gap-2 mb-2">
                <span :class="'tma-badge badge-' + diffClass">{{ trek.difficulty }}</span>
                <span :class="'tma-badge badge-' + (trek.status||'').toLowerCase()">{{ trek.status }}</span>
              </div>
              <h1 style="font-family:'Playfair Display',serif;font-size:2rem;font-weight:700;color:white;margin-bottom:4px;">{{ trek.trek_name }}</h1>
              <div style="color:rgba(255,255,255,.8);font-size:.88rem;display:flex;align-items:center;gap:6px;">
                <i class="bi bi-geo-alt-fill"></i>{{ trek.location }}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:700;color:white;line-height:1;">
                {{ trek.price > 0 ? '₹' + Number(trek.price).toLocaleString() : 'Free' }}
              </div>
              <div style="font-size:.75rem;color:rgba(255,255,255,.7);margin-top:3px;">per person</div>
            </div>
          </div>
        </div>
      </div>

      <div class="page-wrapper" style="padding-top:28px;">
        <div class="container-fluid px-4" style="max-width:960px;margin:0 auto;">

          <div v-if="loading" class="loading-overlay"><div class="spinner-tma"></div></div>

          <div v-else-if="trek.id">

            <!-- Key stats strip -->
            <div class="card mb-4">
              <div class="card-body" style="padding:20px;">
                <div class="row g-3 text-center">
                  <div class="col-6 col-md-3">
                    <div style="color:var(--icon);font-size:1.3rem;margin-bottom:4px;"><i class="bi bi-calendar-event"></i></div>
                    <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:.9rem;">{{ formatDate(trek.start_date) }}</div>
                    <div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Start Date</div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div style="color:var(--icon);font-size:1.3rem;margin-bottom:4px;"><i class="bi bi-calendar-check"></i></div>
                    <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:.9rem;">{{ formatDate(trek.end_date) }}</div>
                    <div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">End Date</div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div style="color:var(--icon);font-size:1.3rem;margin-bottom:4px;"><i class="bi bi-clock-history"></i></div>
                    <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:.9rem;">{{ trek.duration }} Days</div>
                    <div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Duration</div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div style="color:var(--icon);font-size:1.3rem;margin-bottom:4px;"><i class="bi bi-arrow-up-circle"></i></div>
                    <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:.9rem;">{{ trek.altitude_meters ? trek.altitude_meters + 'm' : '—' }}</div>
                    <div style="font-size:.72rem;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-top:2px;">Max Altitude</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row g-4">
              <!-- Left column -->
              <div class="col-md-8">

                <!-- Description -->
                <div class="card mb-4">
                  <div class="card-header"><i class="bi bi-journal-text"></i>About This Trek</div>
                  <div class="card-body">
                    <p style="font-size:.9rem;line-height:1.75;color:var(--text);margin:0;">{{ trek.description || 'No description provided.' }}</p>
                  </div>
                </div>

                <!-- Requirements / Provisions -->
                <div class="card mb-4">
                  <div class="card-header"><i class="bi bi-bag-check"></i>What to Carry</div>
                  <div class="card-body">
                    <div v-if="trek.requirement">
                      <div v-for="(item, i) in requirementItems" :key="i"
                           style="display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(0,0,0,.06);">
                        <span style="width:22px;height:22px;background:var(--g100);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;">
                          <i class="bi bi-check2" style="color:var(--icon);font-size:.75rem;"></i>
                        </span>
                        <span style="font-size:.87rem;color:var(--text);">{{ item.trim() }}</span>
                      </div>
                    </div>
                    <p v-else style="font-size:.87rem;color:var(--muted);">Standard trekking gear required. Details shared on confirmation.</p>
                  </div>
                </div>

                <!-- Meeting point -->
                <div class="card">
                  <div class="card-header"><i class="bi bi-pin-map"></i>Meeting Point</div>
                  <div class="card-body d-flex align-items-center gap-3">
                    <div style="width:44px;height:44px;background:linear-gradient(135deg,var(--g900),var(--g700));border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      <i class="bi bi-geo-alt-fill" style="color:white;font-size:1.1rem;"></i>
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:.9rem;">{{ trek.meeting_point || trek.location }}</div>
                      <div style="font-size:.8rem;color:var(--muted);margin-top:2px;">Assembly at 6:00 AM on start date</div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Right column -->
              <div class="col-md-4">

                <!-- Slots availability -->
                <div class="card mb-4">
                  <div class="card-header"><i class="bi bi-people"></i>Availability</div>
                  <div class="card-body">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                      <span style="font-size:.82rem;color:var(--muted);">Slots Remaining</span>
                      <span style="font-family:'Playfair Display',serif;font-size:1.2rem;font-weight:700;" :style="slotsColor">
                        {{ trek.available_slots }} / {{ trek.total_slots }}
                      </span>
                    </div>
                    <div class="level-bar">
                      <div class="level-bar-fill" :class="barClass" :style="'width:' + fillPct + '%'"></div>
                    </div>
                    <div style="font-size:.75rem;margin-top:6px;" :style="slotsColor">
                      <i class="bi bi-info-circle me-1"></i>
                      <span v-if="trek.available_slots === 0">Fully booked</span>
                      <span v-else-if="trek.available_slots <= 3">Only {{ trek.available_slots }} spot(s) left!</span>
                      <span v-else>{{ trek.available_slots }} spots available</span>
                    </div>
                  </div>
                </div>

                <!-- Trek Staff -->
                <div class="card mb-4" v-if="trek.staff">
                  <div class="card-header"><i class="bi bi-person-badge"></i>Trek Leader</div>
                  <div class="card-body d-flex align-items-center gap-3">
                    <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--g900),var(--g700));display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:.9rem;flex-shrink:0;">
                      {{ trek.staff.name.charAt(0) }}
                    </div>
                    <div>
                      <div style="font-weight:700;font-size:.9rem;">{{ trek.staff.name }}</div>
                      <div style="font-size:.78rem;color:var(--muted);margin-top:2px;display:flex;align-items:center;gap:4px;">
                        <i class="bi bi-patch-check-fill" style="color:var(--icon);"></i>{{ trek.staff.specialization || 'Certified Guide' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Price breakdown -->
                <div class="card mb-4">
                  <div class="card-header"><i class="bi bi-receipt"></i>Price Includes</div>
                  <div class="card-body" style="padding:16px 20px;">
                    <div v-for="inc in inclusions" :key="inc"
                         style="display:flex;align-items:center;gap:9px;padding:6px 0;border-bottom:1px solid rgba(0,0,0,.05);font-size:.84rem;">
                      <i class="bi bi-check-circle-fill" style="color:var(--icon);flex-shrink:0;"></i>
                      {{ inc }}
                    </div>
                    <div style="margin-top:14px;padding-top:12px;border-top:2px solid rgba(0,0,0,.08);display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-size:.82rem;color:var(--muted);">Total per person</span>
                      <span style="font-family:'Playfair Display',serif;font-size:1.35rem;font-weight:700;color:var(--g900);">
                        {{ trek.price > 0 ? '₹' + Number(trek.price).toLocaleString() : 'Free' }}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Action bar -->
            <div class="card mt-4" style="position:sticky;bottom:16px;z-index:100;">
              <div class="card-body d-flex align-items-center justify-content-between gap-3" style="padding:18px 24px;flex-wrap:wrap;">
                <div>
                  <div style="font-family:'Playfair Display',serif;font-size:1.1rem;font-weight:700;">{{ trek.trek_name }}</div>
                  <div style="font-size:.82rem;color:var(--muted);">
                    <i class="bi bi-calendar me-1"></i>{{ formatDate(trek.start_date) }} &nbsp;·&nbsp;
                    <i class="bi bi-people me-1"></i>{{ trek.available_slots }} slots left
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn fw-bold" style="border:1px solid rgba(0,0,0,.15);background:rgba(255,255,255,.6);color:var(--text);border-radius:10px;padding:10px 22px;"
                          @click="$router.back()">
                    <i class="bi bi-arrow-left me-2"></i>Back
                  </button>
                  <button v-if="trek.available_slots > 0"
                          class="btn btn-success fw-bold"
                          style="border-radius:10px;padding:10px 28px;font-size:.92rem;"
                          @click="proceedToBook">
                    <i class="bi bi-credit-card me-2"></i>Proceed to Book
                  </button>
                  <button v-else class="btn fw-bold disabled"
                          style="border-radius:10px;padding:10px 28px;background:var(--bg);color:var(--muted);border:1px solid var(--border);">
                    Sold Out
                  </button>
                </div>
              </div>
            </div>

          </div>

          <div v-else class="empty-state" style="padding:80px 0;">
            <div class="empty-state-icon"><i class="bi bi-map"></i></div>
            <div class="empty-state-title">Trek not found</div>
            <button class="btn btn-success mt-3 fw-bold" @click="$router.push('/user/treks')">Browse Treks</button>
          </div>

        </div>
      </div>
    </div>
  `,

  data() {
    return {
      trek: {},
      loading: true,
      inclusions: ['Accommodation (camping/homestay)', 'All meals during trek', 'Expert certified guide', 'Safety & first-aid kit', 'Permits & entry fees'],
    };
  },

  computed: {
    diffClass() {
      const d = (this.trek.difficulty || '').toLowerCase();
      return d === 'easy' ? 'easy' : d === 'hard' ? 'hard' : 'moderate';
    },
    requirementItems() {
      if (!this.trek.requirement) return [];
      return this.trek.requirement.split(/[,;]/).filter(s => s.trim());
    },
    fillPct() {
      if (!this.trek.total_slots) return 0;
      return Math.round(((this.trek.total_slots - this.trek.available_slots) / this.trek.total_slots) * 100);
    },
    barClass() {
      if (this.fillPct >= 90) return 'full';
      if (this.fillPct >= 60) return 'warn';
      return '';
    },
    slotsColor() {
      if (this.trek.available_slots === 0) return 'color:var(--red)';
      if (this.trek.available_slots <= 3) return 'color:var(--gold)';
      return 'color:var(--g700)';
    },
  },

  async mounted() {
    const id = this.$route.params.id;
    try {
      const res = await API.get('/user/treks/' + id);
      this.trek = res.data;
    } catch (e) {
      console.error(e);
    } finally {
      this.loading = false;
    }
  },

  methods: {
    formatDate(d) {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },
    proceedToBook() {
      this.$router.push('/user/payment/' + this.trek.id);
    },
  },
};
