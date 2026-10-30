import { sql } from './db';
import {
  GlobalKPIs,
  SegmentResponse,
  InputerResponse,
  AMResponse,
  MatrixItem,
  SegmentSnapshotRow,
  InputerSnapshotRow,
} from './types';
import { getDaysInMonth } from './utils';

export const INPUTER_NAMES = ['MAGFIRAH', 'NOVITA', 'NIGEL', 'GITA', 'WAWAN', 'LILA', 'YUNI'];

export const AM_NAMES = [
  'AMAR, KANA', 'ARIEF RAHMAN', 'BAWIAS, RIVO', 'DJABAR TIMUMUN',
  'FAJAR, MARWAN', 'FIKRI RAMADAN, MOH.', 'HALID, FITYAN',
  'LIMONU, DESRIYANTI', 'MUHAMMAD, MUHAMMAD', 'NUGROHO, AGUNG',
  'P. TOAGO, SADDAM', 'PRAMONO RAUF, MOH.INDRA',
  'RIESKA ALFIAH, RANIYANTI', 'SHINTA KRISTIANTI, THERESIA',
  'ZULFIKAR, ZULFIKAR',
];

function toDateParts(isoStr: string | Date) {
  const d = new Date(isoStr);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const mStr = month < 10 ? `0${month}` : `${month}`;
  return { day, month, year, dateKey: `${dayStr}-${mStr}-${year}`, monthKey: `${year}-${mStr}`, yearKey: `${year}` };
}

/* 1. Global KPIs */
export async function getGlobalKPIs(): Promise<GlobalKPIs> {
  try {
    const data = await sql`
      SELECT segment, in_progress, pending_baso, pending_billing, complete, created_at
      FROM "segment_monitoring"
      ORDER BY created_at DESC
      LIMIT 100
    `;

    if (!data || data.length === 0) {
      return { inProgress: 0, pendingBaso: 0, pendingBilling: 0, complete: 0, totalOrders: 0, lastUpdated: new Date().toISOString() };
    }

    const seen = new Set<string>();
    let ip = 0, pb = 0, pbil = 0, c = 0;

    for (const row of data) {
      const seg = String(row.segment).toUpperCase();
      if (!seen.has(seg)) {
        seen.add(seg);
        ip += Number(row.in_progress) || 0;
        pb += Number(row.pending_baso) || 0;
        pbil += Number(row.pending_billing) || 0;
        c += Number(row.complete) || 0;
      }
    }

    return {
      inProgress: ip,
      pendingBaso: pb,
      pendingBilling: pbil,
      complete: c,
      totalOrders: ip + pb + pbil + c,
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error('getGlobalKPIs error:', err);
    return { inProgress: 0, pendingBaso: 0, pendingBilling: 0, complete: 0, totalOrders: 0, lastUpdated: new Date().toISOString() };
  }
}

/* 2. Segment Data */
export async function getSegmentData(bulan: string, tahun: string): Promise<SegmentResponse> {
  const bInt = parseInt(bulan, 10);
  const yInt = parseInt(tahun, 10);

  try {
    const data = await sql`
      SELECT segment, in_progress, pending_baso, pending_billing, complete, created_at
      FROM "segment_monitoring"
      ORDER BY created_at ASC
    `;

    const harianMap = new Map<string, Map<string, any>>();
    const bulananMap = new Map<string, Map<string, any>>();
    const tahunanMap = new Map<string, Map<string, any>>();
    const latestBySeg = new Map<string, any>();

    for (const row of data) {
      const seg = String(row.segment).toUpperCase();
      const { month, year, dateKey, monthKey, yearKey } = toDateParts(row.created_at);
      latestBySeg.set(seg, row);

      if (month === bInt && year === yInt) {
        if (!harianMap.has(dateKey)) harianMap.set(dateKey, new Map());
        harianMap.get(dateKey)!.set(seg, row);
      }

      if (year === yInt) {
        if (!bulananMap.has(monthKey)) bulananMap.set(monthKey, new Map());
        bulananMap.get(monthKey)!.set(seg, row);
      }

      if (!tahunanMap.has(yearKey)) tahunanMap.set(yearKey, new Map());
      tahunanMap.get(yearKey)!.set(seg, row);
    }

    function buildSegmentRow(periode: string, segMap: Map<string, any>): SegmentSnapshotRow {
      const rbs = segMap.get('RBS') || {};
      const dgs = segMap.get('DGS') || {};
      const dss = segMap.get('DSS') || {};
      const dps = segMap.get('DPS') || {};

      const ip_rbs = Number(rbs.in_progress) || 0;
      const ip_dgs = Number(dgs.in_progress) || 0;
      const ip_dss = Number(dss.in_progress) || 0;
      const ip_dps = Number(dps.in_progress) || 0;

      const pb_rbs = Number(rbs.pending_baso) || 0;
      const pb_dgs = Number(dgs.pending_baso) || 0;
      const pb_dss = Number(dss.pending_baso) || 0;
      const pb_dps = Number(dps.pending_baso) || 0;

      const pbil_rbs = Number(rbs.pending_billing) || 0;
      const pbil_dgs = Number(dgs.pending_billing) || 0;
      const pbil_dss = Number(dss.pending_billing) || 0;
      const pbil_dps = Number(dps.pending_billing) || 0;

      const c_rbs = Number(rbs.complete) || 0;
      const c_dgs = Number(dgs.complete) || 0;
      const c_dss = Number(dss.complete) || 0;
      const c_dps = Number(dps.complete) || 0;

      return {
        periode,
        ip_rbs, ip_dgs, ip_dss, ip_dps, ip_total: ip_rbs + ip_dgs + ip_dss + ip_dps,
        pb_rbs, pb_dgs, pb_dss, pb_dps, pb_total: pb_rbs + pb_dgs + pb_dss + pb_dps,
        pbil_rbs, pbil_dgs, pbil_dss, pbil_dps, pbil_total: pbil_rbs + pbil_dgs + pbil_dss + pbil_dps,
        c_rbs, c_dgs, c_dss, c_dps, c_total: c_rbs + c_dgs + c_dss + c_dps,
      };
    }

    const harian = Array.from(harianMap.entries()).map(([k, map]) => buildSegmentRow(k, map));
    const bulanan = Array.from(bulananMap.entries()).map(([k, map]) => buildSegmentRow(k, map));
    const tahunan = Array.from(tahunanMap.entries()).map(([k, map]) => buildSegmentRow(k, map));

    const segKPI = (seg: string) => {
      const s = latestBySeg.get(seg) || {};
      const ip = Number(s.in_progress) || 0;
      const pb = Number(s.pending_baso) || 0;
      const pbil = Number(s.pending_billing) || 0;
      const complete = Number(s.complete) || 0;
      return { ip, pb, pbil, complete, total: ip + pb + pbil + complete };
    };

    return {
      harian, bulanan, tahunan,
      kpis: { rbs: segKPI('RBS'), dgs: segKPI('DGS'), dss: segKPI('DSS'), dps: segKPI('DPS') },
    };
  } catch (err) {
    console.error('getSegmentData error:', err);
    return {
      harian: [], bulanan: [], tahunan: [],
      kpis: {
        rbs: { ip: 0, pb: 0, pbil: 0, complete: 0, total: 0 },
        dgs: { ip: 0, pb: 0, pbil: 0, complete: 0, total: 0 },
        dss: { ip: 0, pb: 0, pbil: 0, complete: 0, total: 0 },
        dps: { ip: 0, pb: 0, pbil: 0, complete: 0, total: 0 },
      },
    };
  }
}

/* 3. Inputer Data */
export async function getInputerData(bulan: string, tahun: string): Promise<InputerResponse> {
  const bInt = parseInt(bulan, 10);
  const yInt = parseInt(tahun, 10);
  const daysInMonth = getDaysInMonth(bInt, yInt);

  try {
    const data = await sql`
      SELECT segment, in_progress, pending_baso, pending_billing, complete, created_at
      FROM "inputer_monitoring"
      ORDER BY created_at ASC
    `;

    const popHari = new Map<string, { totalOrder: number; complete: number }>();
    const matrixHariVal = new Map<string, Map<number, number>>();
    const harianMap = new Map<string, Map<string, any>>();
    const bulananMap = new Map<string, Map<string, any>>();
    const tahunanMap = new Map<string, Map<string, any>>();

    for (const name of INPUTER_NAMES) {
      matrixHariVal.set(name, new Map());
    }

    for (const row of data) {
      const name = String(row.segment).toUpperCase().trim();
      const { day, month, year, dateKey, monthKey, yearKey } = toDateParts(row.created_at);

      if (month === bInt && year === yInt) {
        const tot = (Number(row.in_progress) || 0) + (Number(row.pending_baso) || 0) + (Number(row.pending_billing) || 0) + (Number(row.complete) || 0);
        popHari.set(name, { totalOrder: tot, complete: Number(row.complete) || 0 });

        if (matrixHariVal.has(name)) {
          matrixHariVal.get(name)!.set(day, Number(row.complete) || 0);
        }

        if (!harianMap.has(dateKey)) harianMap.set(dateKey, new Map());
        harianMap.get(dateKey)!.set(name, row);
      }

      if (year === yInt) {
        if (!bulananMap.has(monthKey)) bulananMap.set(monthKey, new Map());
        bulananMap.get(monthKey)!.set(name, row);
      }

      if (!tahunanMap.has(yearKey)) tahunanMap.set(yearKey, new Map());
      tahunanMap.get(yearKey)!.set(name, row);
    }

    const matrixHarian: MatrixItem[] = INPUTER_NAMES.map((name) => {
      const pop = popHari.get(name)?.totalOrder || 0;
      const days: Record<number, number> = {};
      const dayMap = matrixHariVal.get(name)!;

      for (let d = 1; d <= 31; d++) {
        days[d] = d <= daysInMonth ? (dayMap.get(d) || 0) : 0;
      }

      const total = popHari.get(name)?.complete || Object.values(days).reduce((a, b) => a + b, 0);
      const ach = pop > 0 ? parseFloat(((total / pop) * 100).toFixed(1)) : 0;
      return { name, populasi: pop, days, total, achievement: ach };
    });

    const matrixBulanan: MatrixItem[] = INPUTER_NAMES.map((name) => {
      const months: Record<number, number> = {};
      for (let m = 1; m <= 12; m++) {
        const mStr = m < 10 ? `0${m}` : `${m}`;
        const mKey = `${yInt}-${mStr}`;
        months[m] = Number(bulananMap.get(mKey)?.get(name)?.complete) || 0;
      }
      const total = Object.values(months).reduce((a, b) => a + b, 0);
      const pop = total > 0 ? total + 50 : 0;
      const ach = pop > 0 ? parseFloat(((total / pop) * 100).toFixed(1)) : 0;
      return { name, populasi: pop, months, total, achievement: ach };
    });

    function buildInputerRow(periode: string, map: Map<string, any>): InputerSnapshotRow {
      const row: InputerSnapshotRow = { periode, ip_total: 0, pb_total: 0, pbil_total: 0, c_total: 0 };
      for (const name of INPUTER_NAMES) {
        const item = map.get(name) || {};
        const low = name.toLowerCase();
        const ip = Number(item.in_progress) || 0;
        const pb = Number(item.pending_baso) || 0;
        const pbil = Number(item.pending_billing) || 0;
        const c = Number(item.complete) || 0;
        row[`ip_${low}`] = ip;
        row[`pb_${low}`] = pb;
        row[`pbil_${low}`] = pbil;
        row[`c_${low}`] = c;
        row.ip_total += ip;
        row.pb_total += pb;
        row.pbil_total += pbil;
        row.c_total += c;
      }
      return row;
    }

    const harian = Array.from(harianMap.entries()).map(([k, m]) => buildInputerRow(k, m));
    const bulanan = Array.from(bulananMap.entries()).map(([k, m]) => buildInputerRow(k, m));
    const tahunan = Array.from(tahunanMap.entries()).map(([k, m]) => buildInputerRow(k, m));

    return { harian, bulanan, tahunan, matrixHarian, matrixBulanan, names: INPUTER_NAMES };
  } catch (err) {
    console.error('getInputerData error:', err);
    return { harian: [], bulanan: [], tahunan: [], matrixHarian: [], matrixBulanan: [], names: INPUTER_NAMES };
  }
}

/* 4. Account Manager Data */
export async function getAMData(bulan: string, tahun: string): Promise<AMResponse> {
  const bInt = parseInt(bulan, 10);
  const yInt = parseInt(tahun, 10);
  const daysInMonth = getDaysInMonth(bInt, yInt);

  try {
    const data = await sql`
      SELECT segment, total_order, in_progress, pending_baso, pending_billing, complete, created_at
      FROM "AM_monitoring"
      ORDER BY created_at ASC
    `;

    const popMap = new Map<string, number>();
    const completeDayMap = new Map<string, Map<number, number>>();
    const completeMonthMap = new Map<string, Map<number, number>>();

    for (const name of AM_NAMES) {
      completeDayMap.set(name, new Map());
      completeMonthMap.set(name, new Map());
    }

    for (const row of data) {
      const seg = String(row.segment).trim().toUpperCase();
      const { day, month, year } = toDateParts(row.created_at);

      // Match regardless of exact casing
      const matchedName = AM_NAMES.find(n => n.toUpperCase() === seg) || seg;

      if (month === bInt && year === yInt) {
        popMap.set(matchedName, Number(row.total_order) || 0);
        if (completeDayMap.has(matchedName)) {
          completeDayMap.get(matchedName)!.set(day, Number(row.complete) || 0);
        }
      }

      if (year === yInt && completeMonthMap.has(matchedName)) {
        completeMonthMap.get(matchedName)!.set(month, Number(row.complete) || 0);
      }
    }

    // Delta calculation for daily complete
    const matrixHarian: MatrixItem[] = AM_NAMES.map((name) => {
      const pop = popMap.get(name) || 0;
      const days: Record<number, number> = {};
      const rawDays = completeDayMap.get(name)!;
      let prev = 0;
      let runningTotal = 0;

      for (let d = 1; d <= 31; d++) {
        if (d <= daysInMonth) {
          const current = rawDays.get(d) || 0;
          let delta = current - prev;
          if (delta < 0) delta = 0;
          days[d] = delta;
          runningTotal += delta;
          prev = current;
        } else {
          days[d] = 0;
        }
      }

      const ach = pop > 0 ? parseFloat(((runningTotal / pop) * 100).toFixed(1)) : 0;
      return { name, populasi: pop, days, total: runningTotal, achievement: ach };
    });

    const matrixBulanan: MatrixItem[] = AM_NAMES.map((name) => {
      const pop = popMap.get(name) || 0;
      const months: Record<number, number> = {};
      const rawMonths = completeMonthMap.get(name)!;
      let total = 0;

      for (let m = 1; m <= 12; m++) {
        const val = rawMonths.get(m) || 0;
        months[m] = val;
        total += val;
      }

      const ach = pop > 0 ? parseFloat(((total / pop) * 100).toFixed(1)) : 0;
      return { name, populasi: pop, months, total, achievement: ach };
    });

    return { harian: [], bulanan: [], tahunan: [], matrixHarian, matrixBulanan, names: AM_NAMES };
  } catch (err) {
    return { harian: [], bulanan: [], tahunan: [], matrixHarian: [], matrixBulanan: [], names: AM_NAMES };
  }
}
