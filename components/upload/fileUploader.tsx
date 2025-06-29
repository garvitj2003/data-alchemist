"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAtomValue, useAtom } from "jotai";
import {
  uploadedFilesAtom,
  validationReadyAtom,
  EntityType,
  validationErrorsAtom,
  parsedFile,
} from "@/store/uploadAtoms";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import { validateAllFiles } from "@/lib/validators";
import { normalizeRowTypes } from "@/utils/normalizeData";
import { reformHeaders } from "@/app/actions/reformHeaders";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import {
  Upload,
  CheckCircle,
  Bot,
  X,
  AlertCircle,
  Download,
} from "lucide-react";

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
  const [loadingStates, setLoadingStates] = useState<
    Record<EntityType, boolean>
  >({} as Record<EntityType, boolean>);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const isReady = useAtomValue(validationReadyAtom);
  const router = useRouter();

  const handleFileUpload = async (file: File, entityType: EntityType) => {
    // Set loading state
    setLoadingStates((prev) => ({ ...prev, [entityType]: true }));

    const ext = file.name.split(".").pop();
    const reader = new FileReader();

    reader.onload = async (e) => {
      const result = e.target?.result;
      if (!result) {
        setLoadingStates((prev) => ({ ...prev, [entityType]: false }));
        return;
      }

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

      if (!rawData.length) {
        setLoadingStates((prev) => ({ ...prev, [entityType]: false }));
        return;
      }

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

      // Set loading to false
      setLoadingStates((prev) => ({ ...prev, [entityType]: false }));
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

  const loadSampleData = async () => {
    setIsLoadingSample(true);

    try {
      const sampleFiles = [
        {
          path: "/samples/sample_clients.csv",
          entityType: "clients" as EntityType,
        },
        {
          path: "/samples/sample_workers.csv",
          entityType: "workers" as EntityType,
        },
        {
          path: "/samples/sample_tasks.csv",
          entityType: "tasks" as EntityType,
        },
      ];

      const newFiles: parsedFile[] = [];

      // Load all sample files
      for (const { path, entityType } of sampleFiles) {
        setLoadingStates((prev) => ({ ...prev, [entityType]: true }));

        const response = await fetch(path);
        const csvText = await response.text();

        // Parse CSV
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        const rawData = parsed.data as Record<string, any>[];

        if (rawData.length > 0) {
          const rawHeaders = Object.keys(rawData[0]);
          const expectedHeaders = expectedHeadersMap[entityType];

          // Check if headers need fixing
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

          // Normalize the rows
          const parsedData = finalData.map((row) =>
            normalizeRowTypes(entityType, row)
          );

          // Add to new files array
          newFiles.push({
            fileName: `sample_${entityType}.csv`,
            entityType,
            rawData: parsedData,
          });
        }

        setLoadingStates((prev) => ({ ...prev, [entityType]: false }));
      }

      // Update uploaded files with all sample files at once
      setUploadedFiles(newFiles);

      // Small delay to ensure all files are processed and state is updated
      setTimeout(() => {
        // Automatically proceed to validation
        const errors = validateAllFiles(newFiles);
        setErrors(errors);
        router.push("/validate");
      }, 500);
    } catch (error) {
      console.error("Error loading sample data:", error);
      setLoadingStates({
        clients: false,
        workers: false,
        tasks: false,
      });
    } finally {
      setIsLoadingSample(false);
    }
  };

  const FileUploadArea = ({ entityType }: { entityType: EntityType }) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const currentFile = uploadedFiles.find((f) => f.entityType === entityType);
    const isLoading = loadingStates[entityType];

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        const file = files[0];
        if (
          file &&
          (file.name.endsWith(".csv") || file.name.endsWith(".xlsx"))
        ) {
          handleFileUpload(file, entityType);
        }
      },
      [entityType]
    );

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file, entityType);
      }
    };

    const removeFile = () => {
      setUploadedFiles((prev) =>
        prev.filter((f) => f.entityType !== entityType)
      );
    };

    return (
      <div className="flex flex-col space-y-3 w-full">
        <label className="font-medium capitalize text-sm text-foreground/90 text-center">
          {entityType} File
        </label>

        <div
          className={`
            relative border-2 border-dashed rounded-lg transition-all duration-200
            w-full h-40 flex items-center justify-center
            ${
              isDragOver
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-muted-foreground/30 hover:border-primary/50"
            }
            ${currentFile ? "bg-muted/30" : "bg-background"}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isLoading}
          />

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center space-y-3 text-center p-4 w-full"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Bot className="w-6 h-6 text-primary" />
                </motion.div>
                <div className="text-center space-y-2">
                  <div className="text-sm font-medium leading-tight">
                    AI is processing and fixing headers...
                  </div>
                  <div className="h-1.5 w-24 mx-auto bg-muted rounded animate-pulse" />
                </div>
              </motion.div>
            ) : currentFile ? (
              <div
               
                className="flex flex-col items-center justify-center space-y-3 text-center p-4 w-full relative"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-sm leading-tight px-2 break-words">
                    {currentFile.fileName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentFile.rawData.length} rows processed
                  </div>
                </div>
              </div>
            ) : (
              <div
                
                className="flex flex-col items-center justify-center space-y-3 text-center p-4 w-full"
              >
                <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-sm leading-tight">
                    Drop {entityType} file here
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    or click to browse
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Upload Areas - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {(["clients", "workers", "tasks"] as EntityType[]).map((entityType) => (
          <div key={entityType} className="min-w-0">
            <FileUploadArea entityType={entityType} />
          </div>
        ))}
      </div>

      <div
        className="pt-4"
      >
        <Button
          disabled={!isReady}
          onClick={handleValidateAndContinue}
          className="w-full relative overflow-hidden group"
          size="lg"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100"
            animate={{
              x: isReady ? [-300, 300] : 0,
            }}
            transition={{
              duration: 2,
              repeat: isReady ? Infinity : 0,
              ease: "linear",
            }}
          />
          <span className="relative z-10 flex items-center gap-2">
            {isReady ? (
              <>
                <CheckCircle className="w-5 h-5" />
                Validate & Continue
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5" />
                Upload all files to continue
              </>
            )}
          </span>
        </Button>
      </div>
      {/* Try Sample Data Button */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-6">
          Not sure about the format? Load our sample dataset and see how it
          works!
        </p>
        <Button
          variant="outline"
          onClick={loadSampleData}
          disabled={isLoadingSample}
          className="mb-4"
        >
          {isLoadingSample ? (
            <Bot className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {isLoadingSample ? "Loading Sample Data..." : "Try Sample Data"}
        </Button>
      </div>
    </div>
  );
}
