"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSetAtom, useAtomValue, useAtom } from "jotai";
import {
  uploadedFilesAtom,
  validationReadyAtom,
  EntityType,
} from "@/store/uploadAtoms";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { validateAllFiles } from "@/lib/validators";

export default function FileUploader() {
  const [uploadedFiles, setUploadedFiles] = useAtom(uploadedFilesAtom);
  const isReady = useAtomValue(validationReadyAtom);
  const router = useRouter();

  const handleFileUpload = async (file: File, entityType: EntityType) => {
    const ext = file.name.split(".").pop();
    const reader = new FileReader();

    reader.onload = async (e) => {
      const result = e.target?.result;
      let parsedData: any[] = [];

      if (!result) return;

      if (ext === "csv") {
        const parsed = Papa.parse(result as string, {
          header: true,
          skipEmptyLines: true,
        });
        parsedData = parsed.data as any[];
      } else {
        const workbook = XLSX.read(result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        parsedData = XLSX.utils.sheet_to_json(sheet);
      }

      // Remove old data of same entity before pushing new
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
    const passed = validateAllFiles(uploadedFiles);
    if (passed) {
      router.push("/validate");
    } else {
      alert("Validation failed! Please fix the issues and try again.");
    }
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
