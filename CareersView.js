const CareersView = {
  template: `
    <div>
      <!-- Hero -->
      <div style="position:relative;height:300px;overflow:hidden;background:linear-gradient(135deg,#1e1b4b 0%,#4C1D95 50%,#7C3AED 100%);">
        <div style="position:absolute;inset:0;opacity:.07;background-image:radial-gradient(circle,#fff 1px,transparent 1px);background-size:28px 28px;"></div>
        <div class="container px-4 h-100 d-flex align-items-center" style="position:relative;z-index:1;max-width:900px;margin:0 auto;">
          <div>
            <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.6);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
              <i class="bi bi-briefcase"></i> Work With Us
            </div>
            <h1 style="font-family:'Playfair Display',serif;font-size:2.8rem;font-weight:700;color:white;line-height:1.2;margin-bottom:14px;">
              Build the future of<br>adventure travel.
            </h1>
            <p style="color:rgba(255,255,255,.7);font-size:.92rem;max-width:440px;line-height:1.75;margin:0;">
              Join a passionate team that believes technology and nature can coexist beautifully. Remote-first, mission-driven, and always heading uphill.
            </p>
          </div>
        </div>
      </div>

      <div class="page-wrapper" style="padding-top:40px;">
        <div class="container px-4" style="max-width:900px;margin:0 auto;">

          <!-- Perks -->
          <div class="section-rule mb-4">Why TMA</div>
          <div class="row g-3 mb-5">
            <div class="col-md-4" v-for="p in perks" :key="p.title">
              <div class="card h-100">
                <div class="card-body" style="padding:20px;">
                  <div style="width:38px;height:38px;border-radius:9px;background:linear-gradient(135deg,var(--g900),var(--g700));display:flex;align-items:center;justify-content:center;margin-bottom:12px;">
                    <i :class="'bi ' + p.icon" style="color:white;font-size:.9rem;"></i>
                  </div>
                  <div style="font-weight:700;font-size:.88rem;margin-bottom:5px;">{{ p.title }}</div>
                  <p style="font-size:.82rem;line-height:1.65;color:var(--muted);margin:0;">{{ p.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Open roles -->
          <div class="section-rule mb-4">Open Positions</div>

          <!-- Filter tabs -->
          <div class="d-flex gap-2 flex-wrap mb-4">
            <button v-for="dept in departments" :key="dept"
                    @click="activeDept = dept"
                    :class="'btn btn-sm fw-bold ' + (activeDept === dept ? 'btn-success' : '')"
                    :style="activeDept !== dept ? 'border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.6);color:var(--text);border-radius:8px;' : 'border-radius:8px;'">
              {{ dept }}
            </button>
          </div>

          <div class="trek-table-wrap mb-5">
            <div v-if="!filteredJobs.length" class="empty-state" style="padding:40px;">
              <div class="empty-state-icon"><i class="bi bi-briefcase"></i></div>
              <div class="empty-state-title">No openings in this department right now</div>
              <p class="empty-state-desc">Check back soon or send a general application.</p>
            </div>
            <div v-for="job in filteredJobs" :key="job.id" class="clean-list-item" style="padding:18px 22px;">
              <div class="d-flex align-items-start gap-3">
                <div style="width:40px;height:40px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;"
                     :style="'background:' + job.iconBg + ';'">
                  <i :class="'bi ' + job.icon" style="color:white;font-size:.9rem;"></i>
                </div>
                <div>
                  <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:.95rem;">{{ job.title }}</div>
                  <div style="font-size:.78rem;color:var(--muted);margin-top:3px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <span><i class="bi bi-building me-1" style="color:var(--icon);"></i>{{ job.dept }}</span>
                    <span><i class="bi bi-geo-alt me-1" style="color:var(--icon);"></i>{{ job.location }}</span>
                    <span><i class="bi bi-clock me-1" style="color:var(--icon);"></i>{{ job.type }}</span>
                  </div>
                </div>
              </div>
              <div class="d-flex align-items-center gap-3 flex-shrink-0">
                <span class="tma-badge" :class="job.urgent ? 'badge-hard' : 'badge-open'">
                  {{ job.urgent ? 'Urgent' : 'Open' }}
                </span>
                <button class="btn btn-sm btn-success fw-bold" style="border-radius:8px;font-size:.8rem;"
                        @click="apply(job)">
                  Apply <i class="bi bi-arrow-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- General application -->
          <div class="card mb-4" style="background:linear-gradient(135deg,rgba(27,67,50,.07),rgba(64,145,108,.07));border:1px solid var(--g200);">
            <div class="card-body d-flex align-items-center justify-content-between gap-4 flex-wrap" style="padding:24px 28px;">
              <div>
                <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:1.1rem;margin-bottom:5px;">Don't see a role that fits?</div>
                <p style="font-size:.85rem;color:var(--muted);margin:0;">We're always looking for passionate people. Drop us a general application and we'll reach out when something opens up.</p>
              </div>
              <button class="btn btn-success fw-bold flex-shrink-0" style="border-radius:10px;padding:10px 22px;"
                      @click="showGeneral = true">
                <i class="bi bi-envelope me-2"></i>General Application
              </button>
            </div>
          </div>

          <!-- General application form (inline) -->
          <div v-if="showGeneral" class="card mb-4">
            <div class="card-header"><i class="bi bi-envelope"></i>Send General Application</div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">Full Name</label>
                  <input v-model="form.name" class="form-control" placeholder="Your name" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Email</label>
                  <input v-model="form.email" class="form-control" type="email" placeholder="you@example.com" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Area of Interest</label>
                  <select v-model="form.dept" class="form-select">
                    <option value="">Select…</option>
                    <option v-for="d in departments.slice(1)" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label">LinkedIn / Portfolio</label>
                  <input v-model="form.link" class="form-control" placeholder="https://linkedin.com/in/…" />
                </div>
                <div class="col-12">
                  <label class="form-label">Why do you want to join TMA?</label>
                  <textarea v-model="form.message" class="form-control" rows="3" placeholder="Tell us about yourself…"></textarea>
                </div>
              </div>
              <div v-if="submitted" class="tma-toast success d-flex mt-3" style="position:static;max-width:100%;">
                <i class="bi bi-check-circle-fill text-success"></i>Application received! We'll be in touch soon.
              </div>
              <div class="d-flex gap-2 justify-content-end mt-4">
                <button class="btn fw-bold" style="border:1px solid rgba(0,0,0,.12);border-radius:9px;background:transparent;"
                        @click="showGeneral=false">Cancel</button>
                <button class="btn btn-success fw-bold" style="border-radius:9px;" @click="submitGeneral" :disabled="submitted">
                  <i class="bi bi-send me-2"></i>Submit
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
      activeDept: 'All',
      showGeneral: false,
      submitted: false,
      form: { name: '', email: '', dept: '', link: '', message: '' },
      departments: ['All', 'Engineering', 'Operations', 'Marketing', 'Trek Staff'],
      jobs: [
        { id:1, title:'Senior Full-Stack Engineer',  dept:'Engineering', location:'Remote',         type:'Full-time', icon:'bi-code-slash',   iconBg:'#1E3A5F', urgent:true  },
        { id:2, title:'Mobile App Developer',        dept:'Engineering', location:'Remote',         type:'Full-time', icon:'bi-phone',        iconBg:'#1E3A5F', urgent:false },
        { id:3, title:'Trek Operations Manager',     dept:'Operations',  location:'Dehradun, India',type:'Full-time', icon:'bi-map',          iconBg:'#1B4332', urgent:true  },
        { id:4, title:'Customer Success Lead',       dept:'Operations',  location:'Remote',         type:'Full-time', icon:'bi-headset',      iconBg:'#1B4332', urgent:false },
        { id:5, title:'Growth Marketing Manager',   dept:'Marketing',   location:'Remote',         type:'Full-time', icon:'bi-graph-up',     iconBg:'#78350F', urgent:false },
        { id:6, title:'Content & Social Strategist',dept:'Marketing',   location:'Remote',         type:'Part-time', icon:'bi-camera',       iconBg:'#78350F', urgent:false },
        { id:7, title:'Senior Trek Guide (Himachal)',dept:'Trek Staff',  location:'Manali, India',  type:'Seasonal',  icon:'bi-person-badge', iconBg:'#4C1D95', urgent:true  },
        { id:8, title:'Trek Guide (Uttarakhand)',    dept:'Trek Staff',  location:'Rishikesh, India',type:'Seasonal', icon:'bi-person-badge', iconBg:'#4C1D95', urgent:false },
      ],
      perks: [
        { icon:'bi-laptop',         title:'Remote-First',        desc:'Work from anywhere in India. We have a hub in Dehradun if you prefer an office.' },
        { icon:'bi-backpack2',      title:'Free Trek Allowance', desc:'Every TMA employee gets 2 fully-sponsored treks per year. Experience what you build.' },
        { icon:'bi-heart-pulse',    title:'Health Coverage',     desc:'Comprehensive medical, dental, and mental health coverage for you and your family.' },
        { icon:'bi-mortarboard',    title:'Learning Budget',     desc:'₹50,000 annual budget for courses, conferences, and books. We invest in your growth.' },
        { icon:'bi-calendar-check', title:'Flexible Time Off',   desc:'Minimum 20 days PTO. Take the time you need — we measure output, not hours.' },
        { icon:'bi-people',         title:'Tight-Knit Culture',  desc:'Small team, big impact. Everyone has a direct line to the founders and their ideas matter.' },
      ],
    };
  },

  computed: {
    filteredJobs() {
      if (this.activeDept === 'All') return this.jobs;
      return this.jobs.filter(j => j.dept === this.activeDept);
    },
  },

  methods: {
    apply(job) {
      this.form.dept = job.dept;
      this.showGeneral = true;
      this.$nextTick(() => document.querySelector('.card-header')?.scrollIntoView({ behavior: 'smooth' }));
    },
    submitGeneral() {
      if (!this.form.name || !this.form.email) return;
      this.submitted = true;
      setTimeout(() => { this.showGeneral = false; this.submitted = false; this.form = { name:'',email:'',dept:'',link:'',message:'' }; }, 3000);
    },
  },
};
