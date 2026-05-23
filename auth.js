/**
 * gastrowerke – auth.js
 * localStorage-basiertes Usersystem: Registrierung, Login, Logout, Session
 */

'use strict';

function getUsers() { return JSON.parse(localStorage.getItem('gw_users') || '[]'); }
function saveUsers(users) { localStorage.setItem('gw_users', JSON.stringify(users)); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('gw_current_user') || 'null'); }
function setCurrentUser(user) { localStorage.setItem('gw_current_user', JSON.stringify(user)); }
function clearCurrentUser() { localStorage.removeItem('gw_current_user'); }

function registerUser(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, msg: 'Diese E-Mail-Adresse ist bereits registriert.' };
  }
  const user = {
    id: 'u_' + Date.now(),
    name,
    email,
    password, // In Produktion: gehashed
    created: new Date().toISOString(),
    orders: [],
    addresses: [],
    wishlist: []
  };
  users.push(user);
  saveUsers(users);
  setCurrentUser({ id: user.id, name: user.name, email: user.email });
  return { ok: true };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { ok: false, msg: 'E-Mail oder Passwort ist falsch.' };
  setCurrentUser({ id: user.id, name: user.name, email: user.email });
  return { ok: true };
}

function logoutUser() {
  clearCurrentUser();
  window.location.href = 'index.html';
}

function requireLogin() {
  if (!getCurrentUser()) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
    return false;
  }
  return true;
}

function saveOrderToUser(order) {
  const cur = getCurrentUser();
  if (!cur) return;
  const users = getUsers();
  const user = users.find(u => u.id === cur.id);
  if (!user) return;
  if (!user.orders) user.orders = [];
  user.orders.unshift(order);
  saveUsers(users);
}

function getUserData() {
  const cur = getCurrentUser();
  if (!cur) return null;
  return getUsers().find(u => u.id === cur.id) || null;
}

function updateUserData(fields) {
  const cur = getCurrentUser();
  if (!cur) return false;
  const users = getUsers();
  const idx = users.findIndex(u => u.id === cur.id);
  if (idx === -1) return false;
  Object.assign(users[idx], fields);
  saveUsers(users);
  return true;
}

// Exportieren für andere Module
window.gwAuth = { registerUser, loginUser, logoutUser, requireLogin, getCurrentUser, getUserData, updateUserData, saveOrderToUser };
