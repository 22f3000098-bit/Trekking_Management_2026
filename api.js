const API = {
  base: '/api',

  _headers(extra = {}) {
    const h = { 'Content-Type': 'application/json', ...extra };
    if (store.token) h['Authorization'] = `Bearer ${store.token}`;
    return h;
  },

  async _req(method, path, body = null, params = null) {
    let url = this.base + path;
    if (params) {
      const qs = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''))
      ).toString();
      if (qs) url += '?' + qs;
    }

    const cfg = { method, headers: this._headers() };
    if (body && method !== 'GET') cfg.body = JSON.stringify(body);

    const res  = await fetch(url, cfg);
    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.message || json.msg || `HTTP ${res.status}`);
    }
    return json;
  },

  get(path, params)  { return this._req('GET',    path, null, params); },
  post(path, body)   { return this._req('POST',   path, body); },
  put(path, body)    { return this._req('PUT',    path, body); },
  delete(path, body) { return this._req('DELETE', path, body); },

  async upload(path, formData) {
    const headers = {};
    if (store.token) headers['Authorization'] = `Bearer ${store.token}`;
    const res  = await fetch(this.base + path, { method: 'POST', headers, body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || `HTTP ${res.status}`);
    return json;
  },
};
