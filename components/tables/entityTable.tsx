"use client";

import React from "react";
import { useAtom } from "jotai";
import {
  uploadedFilesAtom,
  validationErrorsAtom,
  EntityType,
} from "@/store/uploadAtoms";
import { DataGrid, Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import "../../app/globals.css";

type EntityTableProps = {
  entity: EntityType;
};

export default function EntityTable({ entity }: EntityTableProps) {
  const [files, setFiles] = useAtom(uploadedFilesAtom);
  const [errors] = useAtom(validationErrorsAtom);

  const file = files.find((f) => f.entityType === entity);
  if (!file) return <div>No data found for {entity}</div>;

  const rows = file.rawData;

  const columns: Column<any>[] = Object.keys(rows[0] || {}).map((col) => ({
    key: col,
    name: col,
    editable: true,
    // Highlight cells with error and show tooltip
    renderCell: (props) => {
      const rowIdx = props.rowIdx;
      const error = errors?.[entity]?.[rowIdx]?.[col];

      return (
        <div
          className={`w-full h-full px-2 py-1 ${
            error ? "bg-red-100 text-red-600" : ""
          }`}
          title={error || ""}
        >
          {props.row[col]}
        </div>
      );
    },
  }));

  const onRowsChange = (newRows: any, { indexes }: any) => {
    const updatedRows = [...newRows];

    setFiles((prev) =>
      prev.map((f) =>
        f.entityType === entity ? { ...f, rawData: updatedRows } : f
      )
    );

    // TODO: Re-run validation for changed row and update validationErrorsAtom
    // Optional enhancement you can add later
  };

  return (
    <div className="mt-6 border rounded">
      <h2 className="text-xl font-semibold capitalize mb-2">{entity} Data</h2>
      <DataGrid
        columns={columns}
        rows={rows}
        onRowsChange={onRowsChange}
        className="rdg-light"
      />
    </div>
  );
}
