export default {

  valida: () => {
    if (!inp_nome.text || inp_nome.text.trim() === '') {
      showAlert('Inserisci il tuo nome', 'error');
      return false;
    }
    if (!inp_email.text || !inp_email.text.includes('@')) {
      showAlert('Inserisci una email valida', 'error');
      return false;
    }
    if (!inp_password.text || inp_password.text.length < 8) {
      showAlert('La password deve essere di almeno 8 caratteri', 'error');
      return false;
    }
    if (inp_password.text !== inp_conferma_password.text) {
      showAlert('Le password non coincidono', 'error');
      return false;
    }
    if (!inp_azienda.text || inp_azienda.text.trim() === '') {
      showAlert('Inserisci il nome della tua azienda', 'error');
      return false;
    }
    return true;
  },

  registra: async () => {
    if (!js_registrazione.valida()) return;

    const authResult = await qry_crea_utente_auth.run();
    const nuovoUserId = authResult?.id;

    if (!nuovoUserId) {
      showAlert('Errore nella creazione utente — riprova', 'error');
      return;
    }

    await storeValue('nuovo_user_id', nuovoUserId);

    const azResult = await qry_crea_azienda_free.run();
    const nuovaAziendaId = azResult[0]?.id;

    if (!nuovaAziendaId) {
      showAlert('Errore nella creazione azienda', 'error');
      return;
    }

    await storeValue('nuova_azienda_id', nuovaAziendaId);
    await qry_crea_utente_db.run();

    showAlert('Registrazione completata! Benvenuto in KPilot.', 'success');
    await new Promise(r => setTimeout(r, 1500));
    navigateTo('Admin_Aziende', {}, 'SAME_WINDOW');
  }

}