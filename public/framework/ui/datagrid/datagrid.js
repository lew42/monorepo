import DataGrid from "../../ext/DataGrid/DataGrid.js";

// ui/datagrid now lives in ext/DataGrid (DataGrid.head / body / template / plain). Re-exports only.
export const to_len = DataGrid.len;
export const grid_template = DataGrid.template;
export const datagrid_head = DataGrid.head;
export const datagrid_body = DataGrid.body;
export const datagrid = DataGrid.plain;
export default datagrid;
