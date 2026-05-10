export default {
  hasAccess: (ruoli) => {
    const utente = appsmith.store.currentUser;
    if (!utente) return false;
    if (utente.ruolo === 'consulente') return true;
    return ruoli.includes(utente.ruolo);
  },
  getAziendaId: () => {
    const utente = appsmith.store.currentUser;
    if (!utente) return null;
    if (utente.ruolo === 'consulente') return appsmith.store.azienda_selezionata ?? null;
    return utente.azienda_id;
  },
  checkAuth: () => {
    if (!appsmith.store.currentUser) {
      navigateTo('Login', {}, 'SAME_WINDOW');
      return false;
    }
    return true;
  },
  logout: () => {
    clearStore();
    navigateTo('Login', {}, 'SAME_WINDOW');
  }
}