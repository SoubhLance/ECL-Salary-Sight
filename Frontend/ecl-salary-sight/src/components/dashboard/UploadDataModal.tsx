import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import { useEmployeeData, EmployeeRecord } from '@/contexts/EmployeeDataContext';

const loadingStates = [
  { text: "Reading file..." },
  { text: "Parsing spreadsheet data..." },
  { text: "Validating columns..." },
  { text: "Processing employee records..." },
  { text: "Mapping salary data..." },
  { text: "Finalizing import..." },
];

const UploadDataModal = () => {
  const { setEmployeeData } = useEmployeeData();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    // Close dialog first so the full-screen loader is visible
    setIsOpen(false);
    setUploadComplete(false);
    
    // Small delay to let dialog close before showing loader
    await new Promise(resolve => setTimeout(resolve, 100));
    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Simulate processing time for loader effect
      await new Promise(resolve => setTimeout(resolve, 6000));

      const processedData: EmployeeRecord[] = jsonData.map((row: any) => ({
        code: String(row['Employee Code'] || row['code'] || row['EmpCode'] || ''),
        name: String(row['Name'] || row['name'] || row['Employee Name'] || ''),
        department: String(row['Department'] || row['department'] || row['Dept'] || ''),
        collieryArea: String(row['Colliery Area'] || row['collieryArea'] || row['Area'] || ''),
        month: String(row['Month'] || row['month'] || ''),
        gross: String(row['Gross'] || row['gross'] || row['Salary'] || ''),
        net: String(row['Net'] || row['net'] || row['Net Paid'] || ''),
      }));

      setRecordCount(processedData.length);
      setIsLoading(false);
      setUploadComplete(true);
      
      // Re-open dialog to show success message
      setIsOpen(true);

      // Update shared employee data
      setEmployeeData(processedData);

      toast.success(`Successfully imported ${processedData.length} records`);

      // Auto close after success
      setTimeout(() => {
        setIsOpen(false);
        setUploadComplete(false);
      }, 2000);

    } catch (error) {
      setIsLoading(false);
      setIsOpen(true);
      toast.error('Failed to process file. Please check the format.');
    }
  }, [setEmployeeData]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const isValidType = file.name.endsWith('.xlsx') || file.name.endsWith('.csv') || file.name.endsWith('.xls');
      if (isValidType) {
        processFile(file);
      } else {
        toast.error('Please upload a valid XLSX or CSV file');
      }
    }
  }, [processFile]);

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={isLoading}
        duration={1000}
        loop={false}
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted">
            <Upload className="w-4 h-4" />
            Upload Data
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Upload Dataset
            </DialogTitle>
          </DialogHeader>

          {uploadComplete ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Upload Complete!</h3>
              <p className="text-muted-foreground">{recordCount} records imported successfully</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
                  ${isDragging 
                    ? 'border-primary bg-primary/10 scale-[1.02]' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                `}
              >
                <div className={`
                  w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors
                  ${isDragging ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  <Upload className={`w-8 h-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <p className="text-foreground font-medium mb-1">
                  {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">.xlsx</span>
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">.xls</span>
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md">.csv</span>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Expected Columns */}
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-foreground mb-2">Expected Columns:</p>
                <div className="flex flex-wrap gap-2">
                  {['Employee Code', 'Name', 'Department', 'Colliery Area', 'Month', 'Gross', 'Net'].map((col) => (
                    <span key={col} className="px-2 py-1 text-xs bg-background rounded-md text-muted-foreground border border-border">
                      {col}
                    </span>
                  ))}
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
