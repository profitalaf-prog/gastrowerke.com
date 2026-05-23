/**
 * gastrowerke – supabase.js
 * Zentrale Supabase-Konfiguration und Auth-Wrapper
 *
 * ⚠️ SETUP ERFORDERLICH:
 * Ersetze SUPABASE_URL und SUPABASE_ANON_KEY mit deinen echten Werten aus:
 * Supabase Dashboard → Project Settings → API
 *
 * Solange die Platzhalter drin sind, läuft das System im Offline-Modus
 * (localStorage-Fallback) damit die Seite trotzdem funktioniert.
 */

'use strict';

// ── Konfiguration ─────────────────────────────────────────────────
const SUPABASE_URL = 'https://dbsxihqtibyejprbsvvr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_X9tkqIKochA3AuF71HM-Hg_H--0FZsi';

// Erkennt ob echte Credentials eingetragen sind
const SUPABASE_CONFIGURED = SUPABASE_URL !== 'DEINE_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'DEIN_SUPABASE_ANON_KEY';

let supabase = null;

function getSupabase() {
  if (!SUPABASE_CONFIGURED) return null; // Fallback-Modus
  if (!supabase) {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.error('Supabase SDK nicht geladen!');
      return null;
    }
  }
  return supabase;
}

// ── localStorage-Fallback-Hilfsfunktionen ─────────────────────────
function _getLocalUsers() { return JSON.parse(localStorage.getItem('gw_users') || '[]'); }
function _saveLocalUsers(u) { localStorage.setItem('gw_users', JSON.stringify(u)); }
function _getLocalUser() { return JSON.parse(localStorage.getItem('gw_current_user') || 'null'); }
function _setLocalUser(u) { localStorage.setItem('gw_current_user', JSON.stringify(u)); }

// ── Auth-Funktionen ────────────────────────────────────────────────

async function registerUser(name, email, password) {
  const sb = getSupabase();

  // ── Supabase-Modus ──
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } }
    });
    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        return { ok: false, msg: 'Diese E-Mail-Adresse ist bereits registriert.' };
      }
      return { ok: false, msg: error.message };
    }
    if (data.user) {
      // Profil manuell anlegen (falls kein Trigger existiert)
      try {
        await sb.from('profiles').upsert({
          id: data.user.id,
          name,
          email,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Profil konnte nicht erstellt werden (evtl. fehlende Tabelle):', e);
      }
    }
    // Hinweis auf E-Mail-Bestätigung, falls aktiviert
    if (data.user && data.user.confirmed_at === null) {
      return { ok: true, msg: 'Bitte bestätigen Sie Ihre E-Mail-Adresse, bevor Sie sich anmelden.' };
    }
    return { ok: true, user: data.user };
  }

  // ── localStorage-Fallback ──
  const users = _getLocalUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, msg: 'Diese E-Mail-Adresse ist bereits registriert.' };
  }
  const user = { id: 'u_' + Date.now(), name, email, password, created: new Date().toISOString(), orders: [], addresses: [], wishlist: [] };
  users.push(user);
  _saveLocalUsers(users);
  _setLocalUser({ id: user.id, name: user.name, email: user.email });
  return { ok: true };
}

async function loginUser(email, password) {
  const sb = getSupabase();

  // ── Supabase-Modus ──
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, msg: 'E-Mail oder Passwort ist falsch.' };
    return { ok: true, user: data.user };
  }

  // ── localStorage-Fallback ──
  const users = _getLocalUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, msg: 'E-Mail oder Passwort ist falsch.' };
  _setLocalUser({ id: user.id, name: user.name, email: user.email });
  return { ok: true };
}

async function logoutUser() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  localStorage.removeItem('gw_current_user');
  window.location.href = 'index.html';
}

async function getCurrentUserAsync() {
  const sb = getSupabase();
  if (sb) {
    const { data: { user } } = await sb.auth.getUser();
    return user || null;
  }
  return _getLocalUser();
}

function getCurrentUser() {
  if (!SUPABASE_CONFIGURED) return _getLocalUser();
  try {
    const prefix = SUPABASE_URL.split('//')[1]?.split('.')[0];
    const raw = prefix ? localStorage.getItem(`sb-${prefix}-auth-token`) : null;
    if (raw) {
      const session = JSON.parse(raw);
      const user = session?.user;
      if (user) return { id: user.id, name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Benutzer', email: user.email };
    }
    // Supabase v2 neues Key-Format durchsuchen
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('auth-token')) {
        const val = JSON.parse(localStorage.getItem(key) || 'null');
        if (val?.user) return { id: val.user.id, name: val.user.user_metadata?.display_name || val.user.email?.split('@')[0], email: val.user.email };
      }
    }
  } catch {}
  return _getLocalUser();
}

async function getUserData() {
  const sb = getSupabase();
  if (sb) {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
    const { data: orders } = await sb.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    const { data: addresses } = await sb.from('addresses').select('*').eq('user_id', user.id);
    return { id: user.id, name: profile?.name || user.user_metadata?.display_name || '', email: user.email, phone: profile?.phone || '', company: profile?.company || '', created: user.created_at, orders: orders || [], addresses: addresses || [] };
  }
  // Fallback
  const cur = _getLocalUser();
  if (!cur) return null;
  return _getLocalUsers().find(u => u.id === cur.id) || null;
}

async function updateUserData(fields) {
  const sb = getSupabase();
  if (sb) {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return false;
    const profileUpdate = {};
    if (fields.name)    profileUpdate.name    = fields.name;
    if (fields.phone)   profileUpdate.phone   = fields.phone;
    if (fields.company) profileUpdate.company = fields.company;
    if (Object.keys(profileUpdate).length > 0) {
      await sb.from('profiles').update(profileUpdate).eq('id', user.id);
    }
    if (fields.name) {
      await sb.auth.updateUser({ data: { display_name: fields.name } });
    }
    return true;
  }
  // Fallback
  const cur = _getLocalUser();
  if (!cur) return false;
  const users = _getLocalUsers();
  const idx = users.findIndex(u => u.id === cur.id);
  if (idx === -1) return false;
  Object.assign(users[idx], fields);
  _saveLocalUsers(users);
  return true;
}

async function saveOrderToUser(order) {
  const sb = getSupabase();
  if (sb) {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return;
    await sb.from('orders').insert({ user_id: user.id, order_number: order.orderNumber, items: order.items, total: order.total, shipping_address: order.shippingAddress || order.address, billing_address: order.billingAddress, payment_method: order.paymentMethod, status: order.status || 'pending', created_at: new Date().toISOString() });
    return;
  }
  // Fallback
  const cur = _getLocalUser();
  if (!cur) return;
  const users = _getLocalUsers();
  const user = users.find(u => u.id === cur.id);
  if (!user) return;
  if (!user.orders) user.orders = [];
  user.orders.unshift(order);
  _saveLocalUsers(users);
}

async function addAddress(address) {
  const sb = getSupabase();
  if (sb) {
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return false;
    const { error } = await sb.from('addresses').insert({ user_id: user.id, ...address, created_at: new Date().toISOString() });
    return !error;
  }
  // Fallback
  const cur = _getLocalUser();
  if (!cur) return false;
  const users = _getLocalUsers();
  const user = users.find(u => u.id === cur.id);
  if (!user) return false;
  if (!user.addresses) user.addresses = [];
  user.addresses.push({ id: 'a_' + Date.now(), ...address });
  _saveLocalUsers(users);
  return true;
}

async function deleteAddress(id) {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb.from('addresses').delete().eq('id', id);
    return !error;
  }
  // Fallback
  const cur = _getLocalUser();
  if (!cur) return false;
  const users = _getLocalUsers();
  const user = users.find(u => u.id === cur.id);
  if (!user) return false;
  user.addresses = (user.addresses || []).filter(a => a.id !== id);
  _saveLocalUsers(users);
  return true;
}

async function requireLogin() {
  const user = await getCurrentUserAsync();
  if (!user) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
  return true;
}

function initAuthListener(callback) {
  const sb = getSupabase();
  if (!sb) return;
  sb.auth.onAuthStateChange((event, session) => {
    if (callback) callback(event, session);
    if (typeof updateAuthLinks === 'function') updateAuthLinks();
  });
}

// ── Globaler Export ────────────────────────────────────────────────
window.gwAuth = {
  registerUser, loginUser, logoutUser,
  getCurrentUser, getCurrentUserAsync,
  getUserData, updateUserData, saveOrderToUser,
  addAddress, deleteAddress, requireLogin, initAuthListener,
  getSupabase,
  isSupabaseConfigured: () => SUPABASE_CONFIGURED
};
