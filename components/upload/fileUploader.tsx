"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAtomValue, useAtom } from "jotai";
import {
  uploadedFilesAtom,
  validationReadyAtom,
  EntityType,
  validationErrorsAtom,
} from "@/store/uploadAtoms";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { validateAllFiles } from "@/lib/validators";
import { normalizeRowTypes } from "@/utils/normalizeData";
import { reformHeaders } from "@/app/actions/reformHeaders";

const expectedHeadersMap: Record<EntityType, string[]> = {
  clients: [
    "ClientID",
    "ClientName",
    "PriorityLevel",
    "RequestedTaskIDs",
    "GroupTag",
    "AttributesJSON",
  ],
  workers: [
    "WorkerID",
    "WorkerName",
    "Skills",
    "AvailableSlots",
    "MaxLoadPerPhase",
    "WorkerGroup",
    "QualificationLevel",
  ],
  tasks: [
    "TaskID",
    "TaskName",
    "Category",
    "Duration",
    "RequiredSkills",
    "PreferredPhases",
    "MaxConcurrent",
  ],
};

export default function FileUploader() {
  const [, setErrors] = useAtom(validationErrorsAtom);
  const [uploadedFiles, setUploadedFiles] = useAtom(uploadedFilesAtom);
  const isReady = useAtomValue(validationReadyAtom);
  const router = useRouter();

  const handleFileUpload = async (file: File, entityType: EntityType) => {
    const ext = file.name.split(".").pop();
    const reader = new FileReader();

    reader.onload = async (e) => {
      const result = e.target?.result;
      if (!result) return;

      let rawData: Record<string, any>[] = [];

      // Step 1: Parse the data
      if (ext === "csv") {
        const parsed = Papa.parse(result as string, {
          header: true,
          skipEmptyLines: true,
        });
        rawData = parsed.data as Record<string, any>[];
      } else {
        const workbook = XLSX.read(result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        rawData = XLSX.utils.sheet_to_json(sheet);
      }

      if (!rawData.length) return;

      const rawHeaders = Object.keys(rawData[0]);
      const expectedHeaders = expectedHeadersMap[entityType];

      // Step 2: If headers don't match, call Gemini to fix
      const headersAreMismatch = expectedHeaders.some(
        (h) => !rawHeaders.includes(h)
      );

      let finalData = [...rawData];

      if (headersAreMismatch) {
        const mapping = await reformHeaders({
          rawHeaders,
          expectedHeaders,
          sampleRow: rawData[0],
        });

        if (Object.keys(mapping).length > 0) {
          finalData = rawData.map((row) => {
            const newRow: Record<string, any> = {};
            for (const key in row) {
              const newKey = mapping[key] || key;
              newRow[newKey] = row[key];
            }
            return newRow;
          });
        }
      }

      // Step 3: Normalize the rows
      const parsedData = finalData.map((row) =>
        normalizeRowTypes(entityType, row)
      );

      // Step 4: Update atom
      setUploadedFiles((prev) => [
        ...prev.filter((f) => f.entityType !== entityType),
        {
          fileName: file.name,
          entityType,
          rawData: parsedData,
        },
      ]);
    };

    if (ext === "csv") {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleValidateAndContinue = () => {
    const errors = validateAllFiles(uploadedFiles);
    setErrors(errors);
    router.push("/validate");
  };

  return (
    <div className="space-y-6">
      {(["clients", "workers", "tasks"] as EntityType[]).map((entityType) => (
        <div key={entityType} className="space-y-2">
          <label className="font-medium capitalize">{entityType} File</label>
          <Input
            type="file"
            accept=".csv,.xlsx"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleFileUpload(file, entityType);
              }
            }}
          />
        </div>
      ))}

      <div className="pt-6">
        <Button
          disabled={!isReady}
          onClick={handleValidateAndContinue}
          className="w-full"
        >
          Validate & Continue
        </Button>
      </div>
    </div>
  );
}
