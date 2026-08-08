const AboutView = {
  template: `
    <div>
      <!-- Hero -->
      <div style="position:relative;height:320px;overflow:hidden;background:linear-gradient(135deg,#0d2b1e 0%,#1B4332 45%,#2D6A4F 100%);">
        <div style="position:absolute;inset:0;opacity:.07;background-image:repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%);background-size:20px 20px;"></div>
        <div class="container px-4 h-100 d-flex align-items-center" style="position:relative;z-index:1;max-width:900px;margin:0 auto;">
          <div>
            <div style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.6);margin-bottom:14px;display:flex;align-items:center;gap:8px;">
              <i class="bi bi-compass"></i> Our Story
            </div>
            <h1 style="font-family:'Playfair Display',serif;font-size:3rem;font-weight:700;color:white;line-height:1.15;margin-bottom:16px;">
              Connecting trekkers<br>with the mountains.
            </h1>
            <p style="color:rgba(255,255,255,.7);font-size:.95rem;max-width:480px;line-height:1.75;margin:0;">
              TMA is India's premier trekking management platform — making every adventure seamless from booking to summit.
            </p>
          </div>
        </div>
      </div>

      <div class="page-wrapper" style="padding-top:40px;">
        <div class="container px-4" style="max-width:900px;margin:0 auto;">

          <!-- Stats row -->
          <div class="row g-3 mb-5">
            <div class="col-6 col-md-3" v-for="s in stats" :key="s.label">
              <div :class="'stat-tile ' + s.color">
                <div class="stat-tile-icon"><i :class="'bi ' + s.icon"></i></div>
                <div>
                  <div class="stat-tile-value">{{ s.value }}</div>
                  <div class="stat-tile-label">{{ s.label }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mission -->
          <div class="row g-4 mb-5 align-items-center">
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header"><i class="bi bi-bullseye"></i>Our Mission</div>
                <div class="card-body">
                  <p style="font-size:.9rem;line-height:1.8;color:var(--text);margin:0;">
                    We believe every person deserves access to the transformative power of the mountains. TMA was built to remove the friction between a trekker's dream and the actual experience — handling logistics, safety, and discovery so you can focus on the journey.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card h-100">
                <div class="card-header"><i class="bi bi-eye"></i>Our Vision</div>
                <div class="card-body">
                  <p style="font-size:.9rem;line-height:1.8;color:var(--text);margin:0;">
                    To become the most trusted trekking platform in South Asia — one that empowers local guides, preserves mountain ecosystems, and brings communities together through shared adventure.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Values -->
          <div class="section-rule mb-4">Our Values</div>
          <div class="row g-3 mb-5">
            <div class="col-md-4" v-for="v in values" :key="v.title">
              <div class="card h-100">
                <div class="card-body" style="padding:22px;">
                  <div style="width:42px;height:42px;border-radius:10px;background:var(--g100);display:flex;align-items:center;justify-content:center;margin-bottom:14px;">
                    <i :class="'bi ' + v.icon" style="color:var(--icon);font-size:1.1rem;"></i>
                  </div>
                  <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:1rem;margin-bottom:8px;">{{ v.title }}</div>
                  <p style="font-size:.84rem;line-height:1.7;color:var(--muted);margin:0;">{{ v.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Team -->
          <div class="section-rule mb-4">The Team</div>
          <div class="row g-3 mb-5">
            <div class="col-6 col-md-3" v-for="m in team" :key="m.name">
              <div class="card text-center" style="padding:22px 16px;">
                <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--g900),var(--g700));display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:white;font-weight:700;font-size:1.1rem;">
                  {{ m.name.charAt(0) }}
                </div>
                <div style="font-weight:700;font-size:.88rem;">{{ m.name }}</div>
                <div style="font-size:.76rem;color:var(--muted);margin-top:3px;">{{ m.role }}</div>
                <div style="margin-top:10px;display:flex;justify-content:center;gap:8px;">
                  <a href="#" style="color:var(--icon);font-size:.9rem;"><i class="bi bi-linkedin"></i></a>
                  <a href="#" style="color:var(--icon);font-size:.9rem;"><i class="bi bi-twitter-x"></i></a>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA -->
          <div class="card text-center mb-4" style="background:linear-gradient(135deg,#1B4332,#2D6A4F);border:none;padding:48px 32px;">
            <h2 style="font-family:'Playfair Display',serif;color:white;font-size:1.8rem;margin-bottom:10px;">Ready to start your adventure?</h2>
            <p style="color:rgba(255,255,255,.75);margin-bottom:24px;font-size:.9rem;">Join thousands of trekkers who trust TMA for their mountain journeys.</p>
            <div class="d-flex gap-3 justify-content-center flex-wrap">
              <router-link to="/register" class="btn fw-bold" style="background:white;color:var(--g900);border-radius:10px;padding:10px 26px;">
                <i class="bi bi-person-plus me-2"></i>Create Account
              </router-link>
              <router-link to="/careers" class="btn fw-bold" style="background:rgba(255,255,255,.15);color:white;border:1px solid rgba(255,255,255,.3);border-radius:10px;padding:10px 26px;">
                <i class="bi bi-briefcase me-2"></i>Join Our Team
              </router-link>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,

  data() {
    return {
      stats: [
        { value: '50+',  label: 'Trek Routes',     icon: 'bi-map',            color: 'green'  },
        { value: '2K+',  label: 'Happy Trekkers',  icon: 'bi-person-walking', color: 'blue'   },
        { value: '30+',  label: 'Expert Guides',   icon: 'bi-person-badge',   color: 'gold'   },
        { value: '8yrs', label: 'In Business',     icon: 'bi-award',          color: 'purple' },
      ],
      values: [
        { icon: 'bi-shield-check',    title: 'Safety First',       desc: 'Every trek is planned with rigorous safety protocols. Certified guides, medical kits, and emergency protocols on every expedition.' },
        { icon: 'bi-tree',            title: 'Eco Responsible',    desc: 'We follow Leave No Trace principles, work with local communities, and offset our carbon footprint on every route.' },
        { icon: 'bi-people',          title: 'Community Driven',   desc: 'Our local staff are fairly compensated and empowered. We believe the best guides are those who grew up in the mountains.' },
        { icon: 'bi-star',            title: 'Quality Experience', desc: 'From curated itineraries to premium camping gear, we never compromise on the quality of your experience.' },
        { icon: 'bi-transparency',    title: 'Full Transparency',  desc: 'No hidden fees. What you see is what you pay. Full itinerary, packing lists, and staff details shared upfront.' },
        { icon: 'bi-heart-pulse',     title: 'Passion for Hills',  desc: 'We are trekkers first. Every decision we make is filtered through the lens of a fellow adventurer.' },
      ],
      team: [
        { name: 'Arjun Mehta',   role: 'CEO & Founder'       },
        { name: 'Priya Nair',    role: 'Head of Operations'  },
        { name: 'Vikram Singh',  role: 'Lead Trek Planner'   },
        { name: 'Sneha Rao',     role: 'Community Manager'   },
      ],
    };
  },
};
