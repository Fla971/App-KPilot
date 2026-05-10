# CLAUDE.md — Contesto progetto KPilot™
> Questo file viene letto automaticamente da Claude Code all'avvio.  
> Contiene tutto il contesto necessario per lavorare sulla repo senza ripetere spiegazioni ogni volta.  
> Lingua di lavoro: **italiano**.

---

## 1. Chi sono e cosa stiamo costruendo

Sono **Flavio Castelli**, Ingegnere Gestionale, titolare di **Castelli Consulting** — studio di consulenza per PMI manifatturiere italiane (fatturato 5–50M€, ATECO C, area Lombardia).

**KPilot™** è l'applicazione gestionale che supporta i clienti in Fase 2 del mio servizio di consulenza (Implementazione e Monitoraggio, 12 mesi). Permette di monitorare KPI, KRI e performance operativa in tempo reale.

---

## 2. Stack tecnologico

| Componente | Dettaglio |
|---|---|
| Database | Supabase (PostgreSQL) — `lnhfgsuiaahtarmzvyry.supabase.co` |
| Frontend | Appsmith Cloud — workspace `fcastelli's apps`, progetto `Scudo Operativo` |
| Auth | Supabase Auth (email + password), token JWT |
| Automazioni | Make.com (alert KRI, notifiche via Brevo) |
| Calcolo KPI | JavaScript lato Appsmith (scelta architetturale deliberata — NON trigger SQL) |
| Repo | GitHub — sincronizzata via Git Sync di Appsmith |

> **Nota sulla repo:** Appsmith esporta l'app in formato JSON strutturato (una cartella per pagina, una per datasource, ecc.). I file `.json` nelle cartelle `pages/` contengono widget, query e JSObject di ogni pagina.

---

## 3. Principi architetturali — NON modificare senza conferma

- Il **calcolo dei KPI avviene in JavaScript Appsmith**, mai in trigger SQL. Questa è una decisione consapevole: trasparenza, debug facile, flessibilità per archetipi cliente.
- `js_auth` è un JSObject **locale a ogni pagina** — va replicato su ogni nuova pagina, non è globale.
- RLS (Row Level Security) attiva su tutte le tabelle dati in Supabase.
- Il ruolo `consulente` bypassa la logica `azienda_id` e vede tutti i dati.
- `azienda_id` è nullable **solo** per il ruolo `consulente`.
- `kpi_valori_mensili` viene popolato da Appsmith via UPSERT, non da trigger.
- OEE/OLE sono calcolati da GENERATED columns nel DB, aggregati da viste SQL.
- L'app è **solo desktop** — nessun responsive da implementare.

---

## 4. Ruoli utenti — USARE SEMPRE QUESTI NOMI

```
ceo | consulente | resp_qualita | resp_produzione | resp_acquisti |
cfo | hr | capo_reparto | manager_rd | manager_vendite | manager_it
```

> ⚠️ Il documento UX/UI usa nomi vecchi (`manager_produzione`, `manager_qualita`, ecc.) che **non esistono nel DB**. Ignorarli sempre. Usare solo i nomi del CHECK constraint sopra.

---

## 5. Aziende e utenti di test

| Azienda | UUID |
|---|---|
| Meccanica Brianza Srl | `2e544cb8-1836-484e-9ec8-8637e00a5e80` |
| Assemblaggi Lariani SpA | `ab2852f5-4b1b-480c-ab6f-a90ea0b8fb83` |
| Food Lombardo SpA | `44e65c5c-2792-48fb-91df-52b168d49c0e` |

| Email | Ruolo | Azienda |
|---|---|---|
| `fcastelli@castelliconsulting.it` | consulente | — |
| `ceo@test.it` | ceo | Meccanica Brianza Srl |
| `resp_prod@test.it` | resp_produzione | Meccanica Brianza Srl |

---

## 6. Stato di sviluppo (v1.7 — Maggio 2026)

| Pagina | Stato |
|---|---|
| Login | ✅ Fatto |
| Layout master + Guard | ✅ Fatto |
| Wizard onboarding KPI | ✅ Fatto — ⚠️ da aggiornare: filtro KPI per ruolo via `ruolo_aree_kpi` |
| Pagina Registrazione | ✅ Base fatto — ⚠️ da aggiornare: gestione param `azienda_id` da URL |
| Homepage — vista CEO + vista Manager | ✅ Fatto |
| **Dashboard CEO** | ⏳ Prossimo |
| Selettore azienda (consulente) | ⏳ Da fare |
| Consuntivo giornaliero | ⏳ Da fare |
| Monitor OEE/OLE | ⏳ Da fare |
| Dati mensili Step 1 + Step 2 | ⏳ Da fare |
| KRI & Allarmi | ⏳ Da fare |
| Roadmap Azioni | ⏳ Da fare |
| Audit PVI | ⏳ Da fare |
| Admin — gestione utenti, aziende, richieste accesso | ⏳ Da fare |
| Lead Magnet — Wizard KPI standalone | ⏳ Da fare (dopo app) |

---

## 7. Note operative critiche (errori già incontrati)

- `selectedRows` NON affidabile in Appsmith — usare sempre `selectedRowIndices`
- `onRowSelected` NON affidabile in Appsmith Cloud
- Paginazione tabella nel wizard: **DISATTIVATA** — obbligatorio mantenerla off
- `js_homepage` NON può essere chiamato dentro query SQL — usare CASE SQL direttamente
- `kri_valori.in_allarme` è una GENERATED column — **non inserirla negli INSERT**
- `oee_livello`/`ole_livello` restituiscono valori in inglese: `excellent`, `good`, `poor`, `critical`
- `v_kri_stato` restituisce stato in MAIUSCOLO: `OK`, `ATTENZIONE`, `ALLARME`
- In Appsmith i widget hanno posizione fissa — usare **visibilità widget interni**, non container sovrapposti
- `tipo_linee` è stato eliminato — usare sempre `tipo_produzione`
- `dimensioni_aziendali` usa codici inglesi: `micro` / `small` / `medium` / `large`
- `partita_iva` è nullable nella tabella `aziende`
- Per eliminare un utente di test: prima `DELETE FROM utenti`, poi `DELETE FROM aziende`
- `qry_crea_utente_auth` usa **Service Role Key** nell'header — NON la anon key
- Piano Free: ruolo ≠ consulente → Free. Ruolo consulente → sempre Pro
- KPI COSTA core: `is_costa_core = true`

---

## 7b. Architettura permessi per area KPI (v1.7)

Esiste la tabella `ruolo_aree_kpi` che mappa ogni ruolo alle aree KPI visibili. **Usarla sempre** per filtrare KPI nel wizard e nelle query, invece di hardcodare la categoria nel codice JS.

| Ruolo | Aree visibili |
|---|---|
| ceo, consulente | Tutte |
| resp_produzione | Produzione, Logistica |
| resp_qualita | Qualità |
| resp_acquisti | Logistica |
| cfo | Finanza |
| hr | Risorse Umane |
| manager_rd | Ricerca & Sviluppo |
| manager_vendite | Vendite |
| manager_it | IT |
| capo_reparto | Nessun KPI — redirect diretto al Consuntivo Giornaliero |

**Query tipo per filtrare KPI per ruolo nel wizard:**
```sql
SELECT k.*
FROM kpi k
JOIN ruolo_aree_kpi r ON k.categoria = r.area_kpi
WHERE r.ruolo = {{appsmith.store.currentUser.ruolo}}
  AND k.is_active = true
ORDER BY k.is_costa_core DESC, k.kpi_key;
```

**Strategia Bottom-Up (v1.7):** i Manager possono iscriversi autonomamente senza aspettare il CEO.
- Scenario A: azienda non esiste → Manager la crea, con permessi limitati alla sua area
- Scenario B: azienda già esiste → Manager invia richiesta in `richieste_accesso` (stato `pending`), CEO approva dall'Admin
- Il Manager fondatore NON ottiene ruolo CEO — incentivo a invitare il CEO tramite link pre-configurato via Make/Brevo

---

## 8. Viste SQL principali disponibili

- `v_dashboard_kpi` — vista principale con valori KPI + metadati + insight
- `v_kpi_produzione`, `v_kpi_qualita`, `v_kpi_finanza`, `v_kpi_logistica`, `v_kpi_hr`, `v_kpi_rd`, `v_kpi_vendite`, `v_kpi_it` — una per area COSTA
- `v_kpi_form_input` — genera dinamicamente i form di input per ogni KPI
- `v_kpi_per_azienda` — KPI applicabili a una specifica azienda
- `v_kri_stato` — stato allarmi KRI per azienda
- `v_oee_mensile`, `v_ole_mensile`, `v_oee_giornaliero`, `v_ole_giornaliero` — OEE/OLE
- `v_pareto_fermi` — analisi Pareto delle causali di fermo
- `v_avanzamento_commesse` — avanzamento commesse aperte

---

## 9. Problemi aperti noti

- `kri_valori.in_allarme` gestisce solo la direzione "sopra soglia" — non gestisce KRI dove l'allarme scatta sotto soglia. Fix da fare.
- `qry_hp_oee_ole`: anno/mese attualmente hardcodati — da aggiornare con selettore mese dinamico.
- 7 KPI (key 200–206) senza `required_variables` nel catalogo — da completare con UPDATE.
- **[v1.7]** Tabella `ruolo_aree_kpi` da creare e popolare in Supabase (SQL nel Diario v1.7, sezione 3.3).
- **[v1.7]** Tabella `richieste_accesso` da creare in Supabase (SQL nel Diario v1.7, sezione 2.5).
- **[v1.7]** Verificare se RLS su `kpi_valori_mensili` filtra correttamente per area quando accede un Manager.
- **[v1.7]** Pagina Registrazione: aggiungere gestione parametro `azienda_id` da URL (logica in Diario v1.7, sezione 6).

---

## 10. Come lavorare su questa repo

Quando modifico file JSON di Appsmith:
1. Leggere il file della pagina interessata in `pages/`
2. Proporre la modifica puntuale (non riscrivere l'intero JSON se non necessario)
3. Dopo il commit, in Appsmith: **Deploy → Pull from repository**

Per query SQL nuove: seguire il pattern UPSERT già in uso su `kpi_valori_mensili`.

Per nuove pagine: replicare sempre `js_auth` dalla pagina Login come primo passo.

---

*Castelli Consulting | KPilot™ | Documento riservato*  
*Aggiornato: Maggio 2026 — v1.7*
