const UserProfile = {
  template: `
    <div>
      <div style="
        position:relative;height:130px;overflow:hidden;
        background-image:url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&q=80&fit=crop&crop=center');
        background-size:cover;background-position:center 35%;
      ">
        <div style="position:absolute;inset:0;background:linear-gradient(to right,rgba(17,24,39,.78) 0%,rgba(17,24,39,.35) 60%,transparent 100%);"></div>
        <div class="container px-4 h-100 d-flex align-items-end pb-4" style="position:relative;z-index:1;max-width:720px;">
          <div>
            <p style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,.65);margin:0 0 4px;">Trekker Profile</p>
            <h2 style="font-family:'Playfair Display',serif;font-size:1.55rem;font-weight:700;color:white;margin:0;">My Profile</h2>
          </div>
        </div>
      </div>
    <div class="page-wrapper" style="padding-top:24px;">
      <div class="container" style="max-width:720px;">

        <div v-if="loading" class="loading-overlay"><div class="spinner-border text-success"></div></div>

        <div v-else class="card">
          <div class="card-body">

            <!-- Profile Picture -->
            <div class="text-center mb-4">
              <div class="position-relative d-inline-block">
                <img v-if="profile.profile_picture"
                     :src="profile.profile_picture" alt="Profile"
                     class="rounded-circle border" style="width:100px;height:100px;object-fit:cover;" />
                <div v-else class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                     style="width:100px;height:100px;font-size:2.5rem;margin:0 auto;">
                  {{ (profile.first_name || 'U')[0].toUpperCase() }}
                </div>
              </div>
              <div class="mt-2">
                <label class="btn btn-sm btn-outline-secondary">
                  <i class="bi bi-camera me-1"></i>Change Photo
                  <input type="file" class="d-none" accept="image/*" @change="uploadPhoto" />
                </label>
              </div>
            </div>

            <div v-if="success" class="alert alert-success py-2 small">{{ success }}</div>
            <div v-if="error"   class="alert alert-danger  py-2 small">{{ error }}</div>

            <form @submit.prevent="saveProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">First Name</label>
                  <input v-model="form.first_name" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Last Name</label>
                  <input v-model="form.last_name" class="form-control" required />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Email</label>
                  <input :value="profile.email" class="form-control" disabled />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Username</label>
                  <input v-model="form.username" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Phone</label>
                  <input v-model="form.phone" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Date of Birth</label>
                  <input v-model="form.date_of_birth" type="date" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Gender</label>
                  <select v-model="form.gender" class="form-select">
                    <option value="">Prefer not to say</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Experience Level</label>
                  <select v-model="form.experience_level" class="form-select">
                    <option>Beginner</option><option>Intermediate</option><option>Expert</option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold">Address</label>
                  <input v-model="form.address" class="form-control" />
                </div>

                <div class="col-12"><hr class="my-1"><p class="fw-semibold mb-1">Emergency Contact</p></div>
                <div class="col-md-6">
                  <label class="form-label">Contact Name</label>
                  <input v-model="form.emergency_contact_name" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Contact Phone</label>
                  <input v-model="form.emergency_contact_phone" class="form-control" />
                </div>
              </div>

              <div class="d-flex justify-content-end gap-2 mt-4">
                <button type="button" class="btn btn-outline-secondary" @click="resetForm">
                  Reset
                </button>
                <button type="submit" class="btn btn-success" :disabled="saving">
                  <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                  Save Changes
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
      profile: {}, form: {}, loading: true, saving: false,
      error: '', success: '',
    };
  },

  async mounted() { await this.fetchProfile(); },

  methods: {
    async fetchProfile() {
      this.loading = true;
      try {
        const res = await API.get('/user/profile');
        this.profile = res.data;
        this.resetForm();
      } catch (e) { this.error = e.message; }
      finally { this.loading = false; }
    },

    resetForm() {
      this.form = {
        username:                this.profile.username || '',
        first_name:              this.profile.first_name || '',
        last_name:               this.profile.last_name || '',
        phone:                   this.profile.phone || '',
        date_of_birth:           this.profile.date_of_birth || '',
        gender:                  this.profile.gender || '',
        experience_level:        this.profile.experience_level || 'Beginner',
        address:                 this.profile.address || '',
        emergency_contact_name:  this.profile.emergency_contact_name || '',
        emergency_contact_phone: this.profile.emergency_contact_phone || '',
      };
    },

    async saveProfile() {
      this.saving = true; this.error = ''; this.success = '';
      try {
        await API.put('/user/profile', this.form);
        this.success = 'Profile updated successfully!';
        store.updateUser({ ...store.user, username: this.form.username,
                           first_name: this.form.first_name, last_name: this.form.last_name });
        await this.fetchProfile();
      } catch (e) { this.error = e.message; }
      finally { this.saving = false; }
    },

    async uploadPhoto(e) {
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await API.upload('/user/profile/upload-picture', fd);
        this.profile.profile_picture = res.data.picture_url + '?t=' + Date.now();
        this.success = 'Profile picture updated!';
      } catch (err) { this.error = err.message; }
    },
  },
};
