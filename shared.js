/**
 * gastrowerke – supabase.js
 * Zentrale Supabase-Konfiguration und Auth-Wrapper
 */

// ═══════════════════════════════════════════════════════════
// ↓↓↓  NUR DIESE ZWEI ZEILEN AUSFÜLLEN  ↓↓↓
// ═══════════════════════════════════════════════════════════
const SUPABASE_URL      = 'https://dbsxihqtibyejprbsvvr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_X9tkqIKochA3AuF71HM-Hg_H--0FZsi';
// ═══════════════════════════════════════════════════════════

let supabase = null;

function getSupabase() {
  if (!supabase) {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
      console.error('Supabase SDK nicht geladen! Prüfe die Script-Tags in den HTML-Dateien.');
      return null;
    }
  }
  return supabase;
}

async function registerUser(name, email, password) {
  const sb = getSupabase();
  if (!sb) return { ok: false, msg: 'Supabase nicht verfügbar.' };

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
    await sb.from('profiles').upsert({
      id: data.user.id,
      name,
      email,
      created_at: new Date().toISOString()
    });
  }

  return { ok: true, user: data.user };
}

async function loginUser(email, password) {
  const sb = getSupabase();
  if (!sb) return { ok: false, msg: 'Supabase nicht verfügbar.' };

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, msg: 'E-Mail oder Passwort ist falsch.' };
  return { ok: true, user: data.user };
}

async function logoutUser() {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
  localStorage.removeItem('gw_current_user');
  window.location.href = 'index.html';
}

async function getCurrentUserAsync() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user || null;
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(`sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const user = session?.user;
    if (!user) return null;
    return {
      id: user.id,
      name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Benutzer',
      email: user.email
    };
  } catch {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('auth-token')) {
          const val = JSON.parse(localStorage.getItem(key) || 'null');
          if (val?.user) {
            return {
              id: val.user.id,
              name: val.user.user_metadata?.display_name || val.user.email?.split('@')[0],
              email: val.user.email
            };
          }
        }
      }
    } catch {}
    return null;
  }
}

async function getUserData() {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: profile } = await sb.from('profiles').select('*').eq('id', user.id).single();
  const { data: orders } = await sb.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  const { data: addresses } = await sb.from('addresses').select('*').eq('user_id', user.id);

  return {
    id: user.id,
    name: profile?.name || user.user_metadata?.display_name || '',
    email: user.email,
    created: user.created_at,
    orders: orders || [],
    addresses: addresses || []
  };
}

async function updateUserData(fields) {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const profileUpdate = {};
  if (fields.name) profileUpdate.name = fields.name;
  if (Object.keys(profileUpdate).length > 0) {
    await sb.from('profiles').update(profileUpdate).eq('id', user.id);
    await sb.auth.updateUser({ data: { display_name: fields.name } });
  }
  return true;
}

async function saveOrderToUser(order) {
  const sb = getSupabase();
  if (!sb) return;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return;

  await sb.from('orders').insert({
    user_id: user.id,
    order_number: order.orderNumber,
    items: order.items,
    total: order.total,
    shipping_address: order.shippingAddress || order.address,
    billing_address: order.billingAddress,
    payment_method: order.paymentMethod,
    status: order.status || 'pending',
    created_at: new Date().toISOString()
  });
}

async function addAddress(address) {
  const sb = getSupabase();
  if (!sb) return false;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const { error } = await sb.from('addresses').insert({
    user_id: user.id,
    ...address,
    created_at: new Date().toISOString()
  });
  return !error;
}

async function deleteAddress(id) {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from('addresses').delete().eq('id', id);
  return !error;
}

async function requireLogin() {
  const sb = getSupabase();
  if (!sb) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
  const { data: { user } } = await sb.auth.getUser();
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

window.gwAuth = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getCurrentUserAsync,
  getUserData,
  updateUserData,
  saveOrderToUser,
  addAddress,
  deleteAddress,
  requireLogin,
  initAuthListener,
  getSupabase
};
