"use client";
import FileUploader from "@/components/upload/fileUploader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, FileText, Sparkles } from "lucide-react";
import Navbar from "@/components/navbar";

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navbar showBackButton={true} />

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Page Title and Description */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Upload Your Data Files
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your messy data into perfect workflows. Don't worry about
            formatting - our AI will fix everything!
          </p>
        </div>

        {/* Encouraging Message */}
        <Alert className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-950/30 dark:to-emerald-950/30 dark:border-green-800">
          <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200 font-medium">
            <strong>Fuzzy headers? No problem!</strong> Our AI automatically
            detects and fixes column names, data types, and formatting issues.
            Just upload your files and we'll handle the rest.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Data Format Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Required Data Files
                </CardTitle>
                <CardDescription>
                  Upload these three types of data files to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Clients</h4>
                      <Badge variant="secondary">CSV/Excel</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Client information with priorities and requirements
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Expected: ClientID, ClientName, PriorityLevel,
                      RequestedTaskIDs, GroupTag, AttributesJSON
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Workers</h4>
                      <Badge variant="secondary">CSV/Excel</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Worker capabilities and availability
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Expected: WorkerID, WorkerName, Skills, AvailableSlots,
                      MaxLoadPerPhase, WorkerGroup, QualificationLevel
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Tasks</h4>
                      <Badge variant="secondary">CSV/Excel</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Task definitions and requirements
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Expected: TaskID, TaskName, Category, Duration,
                      RequiredSkills, PreferredPhases, MaxConcurrent
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI-Powered Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Smart Header Mapping</strong>
                      <p className="text-muted-foreground">
                        Automatically fixes column names and mappings
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Data Type Detection</strong>
                      <p className="text-muted-foreground">
                        Converts data to proper formats automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <strong>Validation & Fixing</strong>
                      <p className="text-muted-foreground">
                        Identifies and suggests fixes for data issues
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - File Upload */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader>
                <CardTitle>Upload Your Data Files</CardTitle>
                <CardDescription>
                  Drag and drop your files or click to browse. We support CSV
                  and Excel formats.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
