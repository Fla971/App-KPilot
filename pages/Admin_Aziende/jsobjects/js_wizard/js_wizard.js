export default {

  opzioni_automazione: [
    { label: "Livello 1 — 0-20%: Prevalentemente manuale", value: 1 },
    { label: "Livello 2 — 21-40%: Parzialmente automatizzato", value: 2 },
    { label: "Livello 3 — 41-60%: Mix equilibrato", value: 3 },
    { label: "Livello 4 — 61-80%: Molto automatizzato", value: 4 },
    { label: "Livello 5 — 81-100%: Altamente automatizzato", value: 5 }
  ],

  opzioni_personalizzazione: [
    { label: "Livello 1 — 81-100%: Quasi tutto customizzato", value: 1 },
    { label: "Livello 2 — 61-80%: Molto customizzato", value: 2 },
    { label: "Livello 3 — 41-60%: Mix equilibrato", value: 3 },
    { label: "Livello 4 — 21-40%: Poco customizzato", value: 4 },
    { label: "Livello 5 — 0-20%: Standardizzato", value: 5 }
  ],

  opzioni_volume: [
    { label: "Livello 1 — Pezzi unici", value: 1 },
    { label: "Livello 2 — Piccole serie (meno di 50 pz)", value: 2 },
    { label: "Livello 3 — Serie medie (50-500 pz)", value: 3 },
    { label: "Livello 4 — Grandi serie (500-5000 pz)", value: 4 },
    { label: "Livello 5 — Produzione di massa (oltre 5000 pz)", value: 5 }
  ],

  opzioni_skill: [
    { label: "Livello 1 — 81-100%: Competenza manuale critica", value: 1 },
    { label: "Livello 2 — 61-80%: Molto importante", value: 2 },
    { label: "Livello 3 — 41-60%: Importante", value: 3 },
    { label: "Livello 4 — 21-40%: Poco importante", value: 4 },
    { label: "Livello 5 — 0-20%: Minima", value: 5 }
  ],

  opzioni_standardizzazione: [
    { label: "Livello 1 — 0-20%: Quasi nulla", value: 1 },
    { label: "Livello 2 — 21-40%: Bassa", value: 2 },
    { label: "Livello 3 — 41-60%: Media", value: 3 },
    { label: "Livello 4 — 61-80%: Alta", value: 4 },
    { label: "Livello 5 — 81-100%: Molto alta", value: 5 }
  ],

  opzioni_flessibilita: [
    { label: "Livello 1 — Altissima flessibilità", value: 1 },
    { label: "Livello 2 — Alta flessibilità", value: 2 },
    { label: "Livello 3 — Media flessibilità", value: 3 },
    { label: "Livello 4 — Bassa flessibilità", value: 4 },
    { label: "Livello 5 — Minima flessibilità", value: 5 }
  ],

  opzioni_tipo_produzione: [
    { label: "Assemblaggio — produzione su commessa, manuale o semi-automatica", value: "assemblaggio" },
    { label: "Produzione — linee di produzione con macchinari", value: "produzione" },
    { label: "Mista — sia assemblaggio che produzione con macchine", value: "mista" }
  ],

  opzioni_dimensione: [
    { label: "Micro impresa — fino a 9 dipendenti", value: "micro" },
    { label: "Piccola impresa — 10-49 dipendenti", value: "small" },
    { label: "Media impresa — 50-249 dipendenti", value: "medium" },
    { label: "Grande impresa — 250+ dipendenti", value: "large" }
  ],

  calcolaScore: () => {
    const a = sel_automazione.selectedOptionValue || 0;
    const p = sel_personalizzazione.selectedOptionValue || 0;
    const v = sel_volume.selectedOptionValue || 0;
    const s = sel_skill.selectedOptionValue || 0;
    const st = sel_standardizzazione.selectedOptionValue || 0;
    const f = sel_flessibilita.selectedOptionValue || 0;
    return (a * 5) + (p * 4) + (v * 4) + (s * 3) + (st * 2) + (f * 2);
  },

  classificazioneTestuale: () => {
    const score = js_wizard.calcolaScore();
    if (score <= 20) return "Puramente artigianale";
    if (score <= 40) return "Prevalentemente artigianale";
    if (score <= 60) return "Mista";
    if (score <= 80) return "Prevalentemente industriale";
    return "Puramente industriale";
  },

  valoreDBAzienda: () => {
    const score = js_wizard.calcolaScore();
    if (score <= 40) return "artigianale";
    if (score <= 60) return "mista";
    return "industriale";
  },

  coloreRisultato: () => {
    const score = js_wizard.calcolaScore();
    if (score <= 40) return "#E67E22";
    if (score <= 60) return "#1A5276";
    return "#1E8449";
  },

  isPianoFree: () => {
    const utente = appsmith.store.currentUser;
    if (!utente) return true;
    if (utente.ruolo === 'consulente') return false;
    return true;
  },

  isKpiBloccato: (is_costa_core) => {
    if (!js_wizard.isPianoFree()) return false;
    return is_costa_core === true;
  },
	
	aggiornaKpiSelezionati: () => {
  const selezionati = tbl_kpi_raccomandati.selectedRows
    .filter(k => k.is_costa_core === false)
    .map(k => k.kpi_code);
  storeValue('kpi_aggiuntivi_selezionati', selezionati);
},

salva: async () => {
    if (!inp_ragione_sociale.text) {
      showAlert('Inserisci la ragione sociale', 'error');
      return;
    }
    if (!sel_dimensione.selectedOptionValue) {
      showAlert('Seleziona la dimensione aziendale', 'error');
      return;
    }
    if (!sel_tipo_produzione.selectedOptionValue) {
      showAlert('Seleziona il tipo di produzione', 'error');
      return;
    }


    const tuttiDati = qry_kpi_wizard.data;
    const indiciSelezionati = tbl_kpi_raccomandati.selectedRowIndices || [];
    const righeSelezionate = indiciSelezionati.map(i => tuttiDati[i]).filter(Boolean);
    
    const aggiuntivi = righeSelezionate
      .filter(k => k.is_costa_core === false)
      .map(k => k.kpi_code);

    if (js_wizard.isPianoFree()) {
      const righeAggiuntive = righeSelezionate.filter(k => !k.is_costa_core);
      const perArea = {};
      righeAggiuntive.forEach(k => {
        perArea[k.category] = (perArea[k.category] || 0) + 1;
      });
      const areeSuperate = Object.entries(perArea)
        .filter(([area, count]) => count > 1)
        .map(([area]) => area);
      if (areeSuperate.length > 0) {
        showAlert('Piano Free: max 1 KPI per area. Aree: ' + areeSuperate.join(', '), 'error');
        return;
      }
    }

    const costaCore = js_wizard.isPianoFree() ? [] :
      qry_kpi_wizard.data
        .filter(k => k.is_costa_core === true)
        .map(k => k.kpi_code);

    const tuttiKpi = [...new Set([...costaCore, ...aggiuntivi])];

    const risultato = await qry_salva_azienda.run();
    const nuovoId = risultato[0]?.id;
    if (!nuovoId) {
      showAlert('Errore nel salvataggio azienda', 'error');
      return;
    }

    await storeValue('nuova_azienda_id', nuovoId);
    await storeValue('kpi_selezionati', tuttiKpi);
    await qry_salva_kpi_azienda.run();

    showAlert('Azienda e KPI salvati! KPI totali: ' + tuttiKpi.length, 'success');
}

}