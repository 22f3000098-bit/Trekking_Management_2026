const PaymentPage = {
  template: `
    <div class="page-wrapper">
      <div class="container-fluid px-4" style="max-width:820px;margin:0 auto;">

        <!-- Stepper -->
        <div class="d-flex align-items-center justify-content-center gap-0 mb-5 mt-2">
          <div class="d-flex align-items-center gap-2">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--g200);display:flex;align-items:center;justify-content:center;">
              <i class="bi bi-check2" style="color:var(--g700);font-size:.8rem;"></i>
            </div>
            <span style="font-size:.78rem;font-weight:700;color:var(--muted);">Select Trek</span>
          </div>
          <div style="width:48px;height:2px;background:linear-gradient(90deg,var(--g700),var(--g200));margin:0 8px;"></div>
          <div class="d-flex align-items-center gap-2">
            <div style="width:28px;height:28px;border-radius:50%;background:var(--g200);display:flex;align-items:center;justify-content:center;">
              <i class="bi bi-check2" style="color:var(--g700);font-size:.8rem;"></i>
            </div>
            <span style="font-size:.78rem;font-weight:700;color:var(--muted);">Trek Details</span>
          </div>
          <div style="width:48px;height:2px;background:linear-gradient(90deg,var(--g700),var(--g200));margin:0 8px;"></div>
          <div class="d-flex align-items-center gap-2">
            <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--g900),var(--g700));display:flex;align-items:center;justify-content:center;">
              <i class="bi bi-credit-card" style="color:white;font-size:.75rem;"></i>
            </div>
            <span style="font-size:.78rem;font-weight:700;color:var(--g900);">Payment</span>
          </div>
        </div>

        <!-- Success state -->
        <div v-if="success" class="card text-center" style="padding:56px 40px;">
          <div style="width:68px;height:68px;border-radius:50%;background:linear-gradient(135deg,var(--g900),var(--g700));display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
            <i class="bi bi-check2-all" style="color:white;font-size:1.8rem;"></i>
          </div>
          <h2 style="font-family:'Playfair Display',serif;font-size:1.8rem;margin-bottom:8px;">Booking Confirmed!</h2>
          <p style="color:var(--muted);font-size:.9rem;margin-bottom:24px;">Your spot is secured. Check your dashboard for details.</p>
          <div class="card mx-auto mb-4" style="max-width:320px;background:var(--g50);border:1px solid var(--g200);">
            <div class="card-body" style="padding:20px;">
              <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:6px;">Booking Reference</div>
              <div style="font-family:monospace;font-size:1.3rem;font-weight:700;color:var(--g900);letter-spacing:2px;">{{ bookingRef }}</div>
            </div>
          </div>
          <div class="d-flex gap-3 justify-content-center">
            <button class="btn fw-bold" style="border:1px solid rgba(0,0,0,.15);border-radius:10px;padding:10px 22px;"
                    @click="$router.push('/user/treks')">
              <i class="bi bi-compass me-2"></i>Browse More Treks
            </button>
            <button class="btn btn-success fw-bold" style="border-radius:10px;padding:10px 22px;"
                    @click="$router.push('/user/bookings')">
              <i class="bi bi-journal-check me-2"></i>My Bookings
            </button>
          </div>
        </div>

        <!-- Payment form -->
        <div v-else>
          <div class="row g-4">

            <!-- Left: payment form -->
            <div class="col-md-7">
              <div class="card mb-4">
                <div class="card-header"><i class="bi bi-lock-fill"></i>Secure Payment</div>
                <div class="card-body">

                  <div class="mb-4">
                    <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);margin-bottom:12px;">Pay via UPI</div>
                    <div class="d-flex gap-2 flex-wrap">
                      <button v-for="upi in ['GPay','PhonePe','Paytm','BHIM']" :key="upi"
                              :class="'btn btn-sm fw-bold ' + (payMethod===upi ? 'btn-success' : '')"
                              :style="payMethod===upi ? '' : 'border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.6);color:var(--text);'"
                              style="border-radius:8px;font-size:.8rem;padding:7px 16px;"
                              @click="payMethod=upi">
                        <i class="bi bi-phone me-1"></i>{{ upi }}
                      </button>
                    </div>
                    <div v-if="payMethod" class="mt-3">
                      <label class="form-label">UPI ID</label>
                      <input v-model="upiId" class="form-control" :placeholder="'yourname@' + payMethod.toLowerCase()" />
                    </div>
                  </div>

                  <div class="auth-divider">or pay by card</div>

                  <div class="mb-3">
                    <label class="form-label">Card Number</label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="bi bi-credit-card"></i></span>
                      <input v-model="card.number" class="form-control" placeholder="4242 4242 4242 4242"
                             maxlength="19" @input="formatCard" />
                    </div>
                    <div style="font-size:.74rem;color:var(--muted);margin-top:4px;">Use any number — this is a demo</div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-6">
                      <label class="form-label">Expiry</label>
                      <input v-model="card.expiry" class="form-control" placeholder="MM / YY" maxlength="7" @input="formatExpiry" />
                    </div>
                    <div class="col-6">
                      <label class="form-label">CVV</label>
                      <div class="input-group">
                        <input v-model="card.cvv" class="form-control" placeholder="123" maxlength="3" type="password" />
                        <span class="input-group-text"><i class="bi bi-shield-lock"></i></span>
                      </div>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label">Name on Card</label>
                    <input v-model="card.name" class="form-control" :placeholder="userName" />
                  </div>

                  <div v-if="error" class="tma-toast danger d-flex mb-3" style="position:static;max-width:100%;">
                    <i class="bi bi-exclamation-circle-fill text-danger"></i>{{ error }}
                  </div>

                  <button class="btn btn-success fw-bold w-100"
                          style="border-radius:10px;padding:13px;font-size:.95rem;letter-spacing:.3px;"
                          @click="confirmPayment" :disabled="processing">
                    <span v-if="processing">
                      <span class="spinner-border spinner-border-sm me-2"></span>Processing...
                    </span>
                    <span v-else>
                      <i class="bi bi-lock-fill me-2"></i>Pay {{ trek.price > 0 ? '₹' + Number(trek.price).toLocaleString() : 'Free' }} &amp; Confirm
                    </span>
                  </button>

                  <div class="d-flex align-items-center justify-content-center gap-2 mt-3" style="font-size:.75rem;color:var(--muted);">
                    <i class="bi bi-shield-fill-check" style="color:var(--g700);"></i> 256-bit SSL encrypted &nbsp;·&nbsp;
                    <i class="bi bi-award-fill" style="color:var(--g700);"></i> PCI DSS compliant
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: order summary -->
            <div class="col-md-5">
              <div class="card" style="position:sticky;top:calc(var(--nav-h) + 16px);">
                <div class="card-header"><i class="bi bi-bag-check"></i>Order Summary</div>
                <div v-if="trekLoading" class="loading-overlay" style="min-height:120px;"><div class="spinner-tma"></div></div>
                <div v-else class="card-body">

                  <!-- Trek card mini -->
                  <div style="border-radius:10px;overflow:hidden;margin-bottom:18px;">
                    <div :class="'trek-card-thumb-bg ' + diffClass" style="height:90px;position:relative;">
                      <div style="position:absolute;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">
                        <i class="bi bi-geo-alt-fill" style="color:rgba(255,255,255,.5);font-size:2rem;"></i>
                      </div>
                    </div>
                    <div style="padding:12px 0 0;">
                      <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:.95rem;">{{ trek.trek_name }}</div>
                      <div style="font-size:.78rem;color:var(--muted);margin-top:3px;display:flex;align-items:center;gap:4px;">
                        <i class="bi bi-geo-alt" style="color:var(--icon);"></i>{{ trek.location }}
                      </div>
                    </div>
                  </div>

                  <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:18px;">
                    <div style="display:flex;justify-content:space-between;font-size:.84rem;">
                      <span style="color:var(--muted);display:flex;align-items:center;gap:6px;"><i class="bi bi-calendar-event" style="color:var(--icon);"></i>Start</span>
                      <span style="font-weight:600;">{{ formatDate(trek.start_date) }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:.84rem;">
                      <span style="color:var(--muted);display:flex;align-items:center;gap:6px;"><i class="bi bi-calendar-check" style="color:var(--icon);"></i>End</span>
                      <span style="font-weight:600;">{{ formatDate(trek.end_date) }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:.84rem;">
                      <span style="color:var(--muted);display:flex;align-items:center;gap:6px;"><i class="bi bi-clock-history" style="color:var(--icon);"></i>Duration</span>
                      <span style="font-weight:600;">{{ trek.duration }} days</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:.84rem;">
                      <span style="color:var(--muted);display:flex;align-items:center;gap:6px;"><i class="bi bi-person-badge" style="color:var(--icon);"></i>Guide</span>
                      <span style="font-weight:600;">{{ trek.staff?.name || '—' }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:.84rem;">
                      <span style="color:var(--muted);display:flex;align-items:center;gap:6px;"><i class="bi bi-speedometer2" style="color:var(--icon);"></i>Difficulty</span>
                      <span :class="'tma-badge badge-' + diffClass">{{ trek.difficulty }}</span>
                    </div>
                  </div>

                  <div style="border-top:2px solid rgba(0,0,0,.07);padding-top:14px;">
                    <div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--muted);margin-bottom:5px;">
                      <span>Trek fee</span>
                      <span>{{ trek.price > 0 ? '₹' + Number(trek.price).toLocaleString() : 'Free' }}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;font-size:.82rem;color:var(--muted);margin-bottom:14px;">
                      <span>Booking fee</span>
                      <span style="color:var(--g700);font-weight:700;">Free</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span style="font-weight:700;font-size:.9rem;">Total</span>
                      <span style="font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:700;color:var(--g900);">
                        {{ trek.price > 0 ? '₹' + Number(trek.price).toLocaleString() : 'Free' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <button class="btn fw-bold w-100 mt-3"
                      style="border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.6);border-radius:10px;padding:10px;"
                      @click="$router.back()">
                <i class="bi bi-arrow-left me-2"></i>Back to Trek Details
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  `,

  data() {
    return {
      trek: {}, trekLoading: true,
      card: { number: '', expiry: '', cvv: '', name: '' },
      payMethod: '',
      upiId: '',
      processing: false, success: false,
      bookingRef: '', error: '',
    };
  },

  computed: {
    userName() { return store.state?.user?.first_name || store.state?.user?.username || 'Your Name'; },
    diffClass() {
      const d = (this.trek.difficulty || '').toLowerCase();
      return d === 'easy' ? 'easy' : d === 'hard' ? 'hard' : 'moderate';
    },
  },

  async mounted() {
    const id = this.$route.params.id;
    try {
      const res = await API.get('/user/treks/' + id);
      this.trek = res.data;
    } catch (e) { console.error(e); }
    finally { this.trekLoading = false; }
  },

  methods: {
    formatDate(d) {
      if (!d) return '—';
      return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    formatCard() {
      this.card.number = this.card.number.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
    },

    formatExpiry() {
      this.card.expiry = this.card.expiry.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1 / $2').slice(0, 7);
    },

    async confirmPayment() {
      this.error = '';
      if (!this.payMethod && (!this.card.number || !this.card.expiry || !this.card.cvv)) {
        this.error = 'Please complete payment details.'; return;
      }
      this.processing = true;
      await new Promise(r => setTimeout(r, 2200));
      try {
        const res = await API.post('/user/bookings', { trek_id: this.trek.id });
        this.bookingRef = res.data.booking_ref;
        this.success = true;
      } catch (e) {
        this.error = e.message || 'Booking failed. Please try again.';
      } finally {
        this.processing = false;
      }
    },
  },
};
