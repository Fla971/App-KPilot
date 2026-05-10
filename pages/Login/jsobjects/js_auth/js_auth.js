export default {

  login: async () => {
    if (!inp_email.text || !inp_password.text) {
      showAlert('Inserisci email e password', 'warning');
      return;
    }

    // 1. Autenticazione Supabase
    const authResult = await qry_supabase_login.run();
    if (!authResult || authResult.error) {
      showAlert('Email o password non corretti', 'error');
      return;
    }

    // 2. Salva token
    storeValue('access_token', authResult.access_token);

    // 3. Leggi profilo utente
    const profilo = await qry_profilo_utente.run();
    if (!profilo || profilo.length === 0) {
      showAlert('Utente non trovato nel sistema', 'error');
      return;
    }

    const user = profilo[0];

    // 4. Salva profilo in memoria globale
    storeValue('currentUser', {
      id:           user.id,
      nome:         user.nome,
      ruolo:        user.ruolo,
      azienda_id:   user.azienda_id,
      azienda_nome: user.azienda_nome || 'Castelli Consulting'
    });

    // 5. Salva mese corrente
    const oggi = new Date();
    const meseCorrente = new Date(oggi.getFullYear(), oggi.getMonth(), 1)
      .toISOString().split('T')[0];
    storeValue('currentMonth', meseCorrente);

    // 6. Redirect per ruolo
    if (user.ruolo === 'capo_reparto') {
      navigateTo('Consuntivo_Giornaliero');
    } else {
      navigateTo('Homepage');
    }
  },

  hasAccess: (sezioniConsentite) => {
    const user = appsmith.store.currentUser;
    if (!user) return false;
    if (user.ruolo === 'consulente') return true;
    return sezioniConsentite.includes(user.ruolo);
  },

  getAziendaId: () => {
    const user = appsmith.store.currentUser;
    if (!user) return null;
    if (user.ruolo === 'consulente') {
      return appsmith.store.azienda_selezionata || null;
    }
    return user.azienda_id;
  },

  logout: () => {
    storeValue('currentUser', null);
    storeValue('access_token', null);
    storeValue('currentMonth', null);
    navigateTo('Login');
  }
}