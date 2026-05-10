export default {

  // ── STAT BOX ──────────────────────────────────────────────

  oeeCorrente: () => {
    const rows = qry_hp_oee_ole.data;
    if (!rows || rows.length === 0) return '—';
    const last = rows[rows.length - 1];
    return last.oee_pct != null
      ? parseFloat(last.oee_pct).toFixed(1) + '%'
      : '—';
  },

  oleCorrente: () => {
    const rows = qry_hp_oee_ole.data;
    if (!rows || rows.length === 0) return '—';
    const last = rows[rows.length - 1];
    return last.ole_pct != null
      ? parseFloat(last.ole_pct).toFixed(1) + '%'
      : '—';
  },

  oeeDelta: () => {
    const rows = qry_hp_oee_ole.data;
    if (!rows || rows.length < 2) return null;
    const curr = parseFloat(rows[rows.length - 1].oee_pct);
    const prev = parseFloat(rows[rows.length - 2].oee_pct);
    if (isNaN(curr) || isNaN(prev)) return null;
    return (curr - prev).toFixed(1);
  },

  oleDelta: () => {
    const rows = qry_hp_oee_ole.data;
    if (!rows || rows.length < 2) return null;
    const curr = parseFloat(rows[rows.length - 1].ole_pct);
    const prev = parseFloat(rows[rows.length - 2].ole_pct);
    if (isNaN(curr) || isNaN(prev)) return null;
    return (curr - prev).toFixed(1);
  },

kriAllarmeCount: () => {
  const rows = qry_hp_kri.data;
  if (!rows) return 0;
  return rows.filter(r => r.stato === 'ALLARME').length;
},

deltaMargineYtd: () => {
  const rows = qry_hp_delta_margine.data;
  if (!rows || rows.length < 2) return '—';
  const curr = parseFloat(rows[0].value);
  const prev = parseFloat(rows[1].value);
  if (isNaN(curr) || isNaN(prev)) return '—';
  const delta = (curr - prev).toFixed(1);
  const sign = delta >= 0 ? '+' : '';
  return sign + delta + 'pt';
},

deltaMarginePositivo: () => {
  const rows = qry_hp_delta_margine.data;
  if (!rows || rows.length < 2) return true;
  const curr = parseFloat(rows[0].value);
  const prev = parseFloat(rows[1].value);
  if (isNaN(curr) || isNaN(prev)) return true;
  return curr >= prev;
},

  // ── COLORI STAT BOX ──────────────────────────────────────

  coloreOee: () => {
    const rows = qry_hp_oee_ole.data;
    if (!rows || rows.length === 0) return '#888';
    const livello = rows[rows.length - 1].oee_livello;
    if (livello === 'excellent') return '#1E8449';
    if (livello === 'good')      return '#1A5276';
    if (livello === 'poor')      return '#E67E22';
    if (livello === 'critical')  return '#C0392B';
    return '#888';
  },

  coloreOle: () => {
    const rows = qry_hp_oee_ole.data;
    if (!rows || rows.length === 0) return '#888';
    const livello = rows[rows.length - 1].ole_livello;
    if (livello === 'excellent') return '#1E8449';
    if (livello === 'good')      return '#1A5276';
    if (livello === 'poor')      return '#E67E22';
    if (livello === 'critical')  return '#C0392B';
    return '#888';
  },

  // ── SEMAFORI KRI ─────────────────────────────────────────

coloreSemaforo: (stato) => {
  if (stato === 'OK')         return '#1E8449';
  if (stato === 'ATTENZIONE') return '#E67E22';
  if (stato === 'ALLARME')    return '#C0392B';
  return '#888';
},

labelSoglia: (row) => {
  const dir = row.direzione_allarme;
  const soglia = parseFloat(row.soglia_attiva);
  if (isNaN(soglia)) return '';
  const op = dir === 'sopra' ? '< ' : '> ';
  return 'soglia ' + op + soglia;
},

  // ── GRAFICO OEE/OLE ──────────────────────────────────────

  chartLabels: () => {
    const mesi = ['Gen','Feb','Mar','Apr','Mag','Giu',
                  'Lug','Ago','Set','Ott','Nov','Dic'];
    const rows = qry_hp_oee_ole.data;
    if (!rows) return [];
    return rows.map(r => mesi[r.mese - 1]);
  },

  chartDataOee: () => {
    const rows = qry_hp_oee_ole.data;
    if (!rows) return [];
    return rows.map(r =>
      r.oee_pct != null ? parseFloat(parseFloat(r.oee_pct).toFixed(1)) : null
    );
  },
	
	nomeArea: (codice) => {
  const map = {
    'C': 'Cost',
    'O': 'Operations',
    'S': 'Speed',
    'T': 'Technology',
    'A': 'Adaptability'
  };
  return map[codice] || codice;
},
	
	areaCostaPerRuolo: () => {
  const map = {
    resp_produzione: 'O',
    resp_qualita:    'O',
    resp_acquisti:   'A',
    cfo:             'C',
    hr:              'A',
    manager_rd:      'T',
    manager_vendite: 'S',
    manager_it:      'T'
  };
  const ruolo = appsmith.store.currentUser?.ruolo;
  return map[ruolo] || 'O';
},

chartDataOle: () => {
  const rows = qry_hp_oee_ole.data;
  if (!rows) return [];
  return rows.map(r =>
    r.ole_pct != null ? parseFloat(parseFloat(r.ole_pct).toFixed(1)) : 0
  );
  }

}