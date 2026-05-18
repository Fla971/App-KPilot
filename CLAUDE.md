# CLAUDE.md — KPilot™
## Castelli Consulting | Aggiornato: maggio 2026

> Questo file viene letto automaticamente da Claude Code ad ogni sessione.
> Contiene tutto il contesto necessario per lavorare su questo progetto
> senza ripetere errori già incontrati.
> Leggi TUTTO prima di iniziare qualsiasi modifica.

---

## 1. Cos'è questo progetto

**KPilot™** (ex Scudo Operativo™) è la piattaforma gestionale di
Castelli Consulting per il monitoraggio di KPI, KRI e performance
operativa delle PMI manifatturiere clienti.

Supporta la Fase 2 del servizio consulenziale (Implementazione e
Monitoraggio, 12 mesi) del Piano PERFORMANCE.

**URL produzione:** https://app.kpilot.tech
**Repository GitHub:** github.com/Fla971/App-KPilot
**Frontend:** Appsmith Cloud (sviluppo) → VPS self-hosted (produzione, futuro)

---

## 2. Stack tecnologico

| Componente | Dettaglio |
|---|---|
| Database | Supabase (PostgreSQL) — lnhfgsuiaahtarmzvyry.supabase.co |
| Frontend | Appsmith — progetto "Scudo Operativo" (workspace fcastelli's apps) |
| Auth | Supabase Auth (email + password), token JWT |
| Automazioni | Make.com (alert KRI) + Brevo (notifiche email) |
| Calcolo KPI | JavaScript lato Appsmith — MAI in trigger SQL |
| Git Sync | Attivato maggio 2026 — sincronizzato con GitHub |

---

## 3. Principi architetturali — NON cambiare mai

- **Calcolo KPI in JavaScript Appsmith** — mai in trigger SQL
  (decisione deliberata per trasparenza e debug)
- **RLS attiva su tutte le tabelle** — non disabilitare mai
- **Il consulente bypassa la logica azienda** e vede tutto
- **azienda_id nullable SOLO per ruolo consulente**
- **OEE/OLE: GENERATED columns SQL** — non calcolare in JS
- **kpi_valori_mensili: popolato via UPSERT da Appsmith**
- **KPI attivati per azienda: tabella kpi_azienda**

---

## 4. Ruoli utente — Nomi ESATTI nel database

Usare SEMPRE questi nomi — i nomi nella documentazione UX/UI vecchia
sono SBAGLIATI:

| Ruolo corretto (DB) | NON usare |
|---|---|
| `consulente` | — |
| `ceo` | — |
| `cfo` | — |
| `resp_produzione` | "responsabile_produzione", "prod" |
| `resp_qualita` | "responsabile_qualita", "qualita" |
| `resp_acquisti` | "responsabile_acquisti", "acquisti" |
| `hr` | "risorse_umane" |
| `capo_reparto` | "capo_reparto_produzione" |
| `manager_rd` | "manager_ricerca" |
| `manager_vendite` | "manager_commerciale" |
| `manager_it` | "manager_informatica" |

---

## 5. Errori critici già incontrati — NON ripetere

| Problema | Soluzione |
|---|---|
| `selectedRows` non affidabile | Usare SEMPRE `selectedRowIndices` |
| `onRowSelected` non affidabile | Non usare — gestire selezione diversamente |
| Paginazione tabella wizard | DISATTIVATA — obbligatorio lasciarla disattivata |
| `kri_valori.in_allarme` | È GENERATED column — non inserirla negli INSERT |
| `JSObject1` sulla pagina Login | Causava errore "Start object with export default" — eliminato |
| Campo `category` nella tabella kpi | Si chiama `category` NON `categoria` |
| `manager_vendite` → area | 'Vendite/Commerciale' (non 'Vendite') — valore esatto nel DB |
| `v_kri_stato` restituisce stato | In MAIUSCOLO: 'OK', 'ATTENZIONE', 'ALLARME' |
| `oee_livello/ole_livello` | Valori: 'excellent', 'good', 'poor', 'critical' (inglese) |
| Google Docs Markdown tables | Non supportate — usare testo block |
| JSON truncation Make.com | max_tokens deve essere 8192 |

---

## 6. Stato sviluppo attuale (maggio 2026)

### Completato ✅
- Schema database completo e operativo
- Pagina Login
- Pagina Registrazione (con flusso Auth → aziende → utenti)
- Homepage (vista CEO e vista Manager)
- Wizard onboarding self-service
- Strategia Bottom-Up (Manager si iscrive → invita CEO)
- Git Sync con GitHub attivato
- KPI catalogati: 135 con required_variables JSONB
- KRI catalogati: 20 base

### In sviluppo ⏳ (Minimum Viable KPilot)
- Dashboard CEO completa
- KRI e Allarmi
- Inserimento dati mensili
- Audit PVI (Protocollo Verifica Implementazione)
- Selettore azienda per consulente

### Rinviato ❌ (dopo i primi 2 clienti attivi)
- Piano PRO completo
- Piano FREE
- App mobile
- Self-hosting VPS
- Report trimestrale automatizzato (Consulente Digitale AI)

---

## 7. Tre piani commerciali

| Piano | Prezzo | Funzioni chiave |
|---|---|---|
| FREE | Gratuito | 2 KPI per area, dashboard base, funzioni avanzate 🔒 |
| PRO | ~200€/mese | Tutto FREE + KPI personalizzati + alert KRI + multi-utente |
| PERFORMANCE | 3.500€ setup + 1.500€/mese | Tutto PRO + Check-Up + consulenza + audit PVI + Success Fee |

**Success Fee:** 15% del Margine Annuo Recuperato, cap 80.000€/anno
**Clausola salvaguardia:** I_imp ≥85% e obiettivi non raggiunti → Success Fee non dovuta

---

## 8. Database — Tabelle principali

```
Catalogo (statiche):
  kpi                    ← 135 KPI con required_variables JSONB
  kri                    ← 20 KRI base
  aree_kpi               ← 8 aree COSTA
  ruolo_aree_kpi         ← mappatura ruolo → aree visibili

Per azienda (configurazione):
  aziende                ← anagrafica multi-tenant
  utenti                 ← con ruolo e azienda_id
  kpi_azienda            ← KPI attivati per azienda
  kri_azienda            ← KRI configurati per azienda

Input mensile:
  kpi_valori_mensili     ← valori inseriti dai manager
  kri_valori             ← valori KRI (in_allarme è GENERATED)

Governance:
  kpi_insight            ← foundation per AI review automation
  kpi_tips               ← foundation per AI review automation
```

**Tabelle legacy da rimuovere** (dopo verifica conteggio):
- `rilevazioni_mensili`
- `soglie_allarme`

---

## 9. Viste SQL disponibili

```sql
v_kpi_form_input        ← input form dinamico per manager
v_kpi_<categoria>       ← 8 viste per area COSTA
v_kri_stato             ← stato KRI (OK/ATTENZIONE/ALLARME maiuscolo)
```

---

## 10. Appsmith — Pattern fondamentali

```javascript
// Selezione riga tabella — SEMPRE così
const idx = Table1.selectedRowIndices[0];
const row = Table1.tableData[idx];

// UPSERT kpi_valori_mensili
INSERT INTO kpi_valori_mensili (azienda_id, kpi_id, anno, mese, valore)
VALUES (...)
ON CONFLICT (azienda_id, kpi_id, anno, mese)
DO UPDATE SET valore = EXCLUDED.valore;

// Visibilità widget CEO vs Manager
// Usare proprietà isVisible dei widget interni
// NON sovrapporre container — posizione fissa in Appsmith

// URL invito CEO — usare variabile di ambiente
// per switching Cloud → VPS automatico
```

---

## 11. Make.com — Flussi AI attivi

| Modulo | Funzione |
|---|---|
| AI-03 | Analisi questionario CEO → output strutturato |
| AI-08 | KPI per dimensione con mappa_margine |
| AI-10 | Report finale |

**Variabili corrette:** `costa_*` e `valori_*` (non invertire)
**Campo aggiunto:** `riepilogo_kpi` in AI-03 output e Google Docs mapper

---

## 12. Nomi prodotto — Usare sempre KPilot™

Il vecchio nome "Scudo Operativo™" è deprecato.
In Appsmith il progetto si chiama ancora "Scudo Operativo" — non rinominare
il progetto Appsmith (romperebbe il Git Sync), ma nei contenuti usare KPilot™.

---

## 13. Ecosistema prodotti

```
KPilot™ (questo progetto) — DESTINAZIONE del funnel
  ├── Piano FREE → acquisizione lead
  ├── Piano PRO → monetizzazione autonoma
  └── Piano PERFORMANCE → consulenza completa
      ├── include BalanceScan™ annuale (gratis)
      └── include RadarFinanziario™ trimestrale (gratis)

BalanceScan™ → porta d'ingresso del funnel
  URL: balancescan.kpilot.tech

RadarFinanziario™ → continuità del funnel
  URL: radar.kpilot.tech

Token System → controllo accessi per tutti e tre
  URL: tokens.kpilot.tech (in sviluppo)
```

---

## 14. Metriche obiettivo 2026

| Metrica | Obiettivo | Scadenza |
|---|---|---|
| Contratti Piano PERFORMANCE attivi | 2-3 | Dicembre 2026 |
| Check-Up Margine e Rischi completati | 5 | Dicembre 2026 |
| CEO contattati su LinkedIn | 50 | Giugno 2026 |
| Commercialisti partner | 3 | Dicembre 2026 |
| KPilot Minimum Viable completato | ✅ | Prima del primo cliente Fase 2 |

---

## 15. Prossimi task KPilot (in ordine di priorità)

- [ ] Dashboard CEO — completare
- [ ] KRI e Allarmi — completare
- [ ] Inserimento dati mensili — costruire
- [ ] Audit PVI — costruire
- [ ] Selettore azienda per consulente
- [ ] Rimuovere tabelle legacy dopo verifica (rilevazioni_mensili, soglie_allarme)
- [ ] Fix kri_valori.in_allarme per direzione below-threshold

---

## 16. Documenti di riferimento nel progetto

| File | Contenuto |
|---|---|
| `KPilot_Diario_Progetto_Appsmith_v1_8.md` | Diario tecnico completo — leggere per contesto storico |
| `KPilot_Strategia_Commerciale_e_Piani_v3.md` | Strategia commerciale, piani, LinkedIn, BalanceScan |
| `KPilot_Linee_Guida_UX_UI_v2-0.md` | Design system e UX |
| `Scudo_Operativo_Architettura_DB_2026.md` | Schema database completo |
| `Database_CC.sql` | SQL completo del database |
| `kpi_rows.sql` | 135 KPI con variabili |
| `kri_rows.sql` | 20 KRI base |

---

*Aggiorna questo file dopo ogni sessione se scopri nuovi errori o decisioni.*
*Versione documento: 1.0 — maggio 2026*
