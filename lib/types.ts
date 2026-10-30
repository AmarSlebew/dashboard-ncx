export interface GlobalKPIs {
  inProgress: number;
  pendingBaso: number;
  pendingBilling: number;
  complete: number;
  totalOrders: number;
  lastUpdated: string;
}

export interface SegmentSnapshotRow {
  periode: string;
  ip_rbs: number;
  ip_dgs: number;
  ip_dss: number;
  ip_dps: number;
  ip_total: number;

  pb_rbs: number;
  pb_dgs: number;
  pb_dss: number;
  pb_dps: number;
  pb_total: number;

  pbil_rbs: number;
  pbil_dgs: number;
  pbil_dss: number;
  pbil_dps: number;
  pbil_total: number;

  c_rbs: number;
  c_dgs: number;
  c_dss: number;
  c_dps: number;
  c_total: number;
}

export interface SegmentResponse {
  harian: SegmentSnapshotRow[];
  bulanan: SegmentSnapshotRow[];
  tahunan: SegmentSnapshotRow[];
  kpis: {
    rbs: { ip: number; pb: number; pbil: number; complete: number; total: number };
    dgs: { ip: number; pb: number; pbil: number; complete: number; total: number };
    dss: { ip: number; pb: number; pbil: number; complete: number; total: number };
    dps: { ip: number; pb: number; pbil: number; complete: number; total: number };
  };
}

export interface InputerSnapshotRow {
  periode: string;
  ip_magfirah?: number;
  pb_magfirah?: number;
  pbil_magfirah?: number;
  c_magfirah?: number;

  ip_novita?: number;
  pb_novita?: number;
  pbil_novita?: number;
  c_novita?: number;

  ip_nigel?: number;
  pb_nigel?: number;
  pbil_nigel?: number;
  c_nigel?: number;

  ip_gita?: number;
  pb_gita?: number;
  pbil_gita?: number;
  c_gita?: number;

  ip_wawan?: number;
  pb_wawan?: number;
  pbil_wawan?: number;
  c_wawan?: number;

  ip_lila?: number;
  pb_lila?: number;
  pbil_lila?: number;
  c_lila?: number;

  ip_yuni?: number;
  pb_yuni?: number;
  pbil_yuni?: number;
  c_yuni?: number;

  ip_total: number;
  pb_total: number;
  pbil_total: number;
  c_total: number;
  [key: string]: string | number | undefined;
}

export interface MatrixItem {
  name: string;
  populasi: number;
  days?: Record<number, number>;
  months?: Record<number, number>;
  total: number;
  achievement: number;
}

export interface InputerResponse {
  harian: InputerSnapshotRow[];
  bulanan: InputerSnapshotRow[];
  tahunan: InputerSnapshotRow[];
  matrixHarian: MatrixItem[];
  matrixBulanan: MatrixItem[];
  names: string[];
}

export interface AMResponse {
  harian: any[];
  bulanan: any[];
  tahunan: any[];
  matrixHarian: MatrixItem[];
  matrixBulanan: MatrixItem[];
  names: string[];
}
