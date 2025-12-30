import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";
import { toast } from "sonner";
import { uploadSalary } from "@/lib/salaryApi";

const loadingStates = [
  { text: "Reading file..." },
  { text: "Uploading to server..." },
  { text: "Validating columns..." },
  { text: "Processing records..." },
  { text: "Upserting into database..." },
  { text: "Finalizing import..." },
];

const UploadDataModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStats, setUploadStats] = useState({
    totalRows: 0,
    employees: 0,
    years: [] as string[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setUploadComplete(false);
    setUploadStats({ totalRows: 0, employees: 0, years: [] });
  }, []);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        valid: false,
        error: "Please upload a valid Excel (.xlsx, .xls) or CSV file",
      };
    }

    return { valid: true };
  };

  const processFile = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error("Invalid File", {
        description: validation.error,
        duration: 6000,
      });
      return;
    }

    setIsOpen(false);
    setUploadComplete(false);
    setIsLoading(true);

    try {
      console.log("📤 Uploading:", file.name);

      const result = await uploadSalary(file);

      console.log("✅ Backend response:", result);

      const totalRows = result?.total_rows_processed ?? 0;
      const employees = result?.employees_synced ?? 0;
      const years = Object.keys(result?.years_processed ?? {});

      setUploadStats({ totalRows, employees, years });

      // Smooth transition
      await new Promise((r) => setTimeout(r, 1200));

      setIsLoading(false);
      setUploadComplete(true);
      setIsOpen(true);

      toast.success("Upload Successful!", {
        description: `Synced ${employees} employee${employees !== 1 ? 's' : ''} across ${years.length} year${years.length !== 1 ? 's' : ''} (${years.join(", ")}) • ${totalRows} total rows processed`,
        duration: 12000,
      });

      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        resetState();
      }, 5000);
    } catch (err: any) {
      console.error("❌ Upload failed:", err);

      setIsLoading(false);
      setIsOpen(true);

      const errorMessage = err?.response?.data?.detail || err?.message || "Something went wrong";

      toast.error("Upload Failed", {
        description: errorMessage,
        duration: 10000,
      });
    }
  }, [resetState]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      processFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  return (
    <>
      <MultiStepLoader
        loading={isLoading}
        loadingStates={loadingStates}
        duration={1400}
        loop={false}
      />

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200">
            <Upload className="w-4 h-4" />
            Upload Data
          </button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="flex items-center gap-2.5 text-xl">
              {uploadComplete ? (
                <>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Upload Complete
                </>
              ) : (
                <>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  Upload Salary Dataset
                </>
              )}
            </DialogTitle>
            {!uploadComplete && (
              <p className="text-sm text-muted-foreground">
                Upload your salary data in Excel or CSV format
              </p>
            )}
          </DialogHeader>

          {uploadComplete ? (
            <div className="py-6 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Successfully Uploaded!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your salary data has been processed and saved to the database
                </p>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 space-y-4 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">Upload Summary</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-background/80 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">
                      Total Records
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {uploadStats.totalRows.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-background/80 rounded-lg">
                    <span className="text-sm font-medium text-muted-foreground">
                      Employees Synced
                    </span>
                    <span className="text-lg font-bold text-foreground">
                      {uploadStats.employees.toLocaleString()}
                    </span>
                  </div>
                  
                  {uploadStats.years.length > 0 && (
                    <div className="flex justify-between items-center p-3 bg-background/80 rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground">
                        Years Processed
                      </span>
                      <div className="flex gap-1.5">
                        {uploadStats.years.map((year) => (
                          <span
                            key={year}
                            className="px-2.5 py-1 text-sm font-semibold bg-primary/20 text-primary rounded-md"
                          >
                            {year}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5 py-2">
              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300
                  ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }
                `}
              >
                <div className="relative z-10">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isDragging 
                      ? "bg-primary/20 scale-110" 
                      : "bg-muted"
                  }`}>
                    <Upload
                      className={`w-8 h-8 transition-colors duration-300 ${
                        isDragging ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  
                  <p className="font-semibold text-base mb-1.5">
                    {isDragging ? "Drop your file here" : "Drag & drop your file"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-5">
                    or click to browse from your computer
                  </p>

                  <div className="flex justify-center gap-2 flex-wrap mb-3">
                    {[
                      { ext: ".xlsx", label: "Excel" },
                      { ext: ".xls", label: "Excel Legacy" },
                      { ext: ".csv", label: "CSV" }
                    ].map(({ ext, label }) => (
                      <span
                        key={ext}
                        className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded-lg font-medium border border-primary/20"
                      >
                        {label} ({ext})
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground/70">
                    No size limit
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />

              {/* Required Columns Info */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-200/60 dark:border-blue-900/50 rounded-xl p-5">
                <div className="flex gap-3.5">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg h-fit">
                    <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Required Columns
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Employee Code",
                        "Name",
                        "Department",
                        "Colliery Area",
                        "Month",
                        "Net",
                      ].map((col) => (
                        <span
                          key={col}
                          className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border-2 border-blue-200/60 dark:border-blue-800/60 rounded-lg text-blue-700 dark:text-blue-300 font-semibold"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-3">
                      Make sure your file contains all these columns with exact names
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UploadDataModal;