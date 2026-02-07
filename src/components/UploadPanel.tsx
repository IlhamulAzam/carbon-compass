import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadPanelProps {
  onRunAudit: (files: File[]) => void;
  isLoading?: boolean;
}

const UploadPanel = ({ onRunAudit, isLoading }: UploadPanelProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="w-full max-w-xl animate-fade-in">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${
          isDragging
            ? "border-foreground/30 bg-muted/50"
            : "border-border bg-background hover:border-foreground/20 hover:bg-muted/30"
        }`}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
          accept=".pdf,.xlsx,.xls,.doc,.docx,.csv"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Upload className="h-7 w-7 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Upload Project Documents
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              PDD, Calculation Files, and Methodology
            </p>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Drag and drop or click to browse
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6 animate-fade-in space-y-3">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <Button
          onClick={() => onRunAudit(files)}
          disabled={files.length === 0 || isLoading}
          className="h-12 rounded-xl px-8 text-base font-medium shadow-soft-md transition-all hover:shadow-soft-lg disabled:opacity-40"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Audit...
            </>
          ) : (
            "Run Pre-Audit"
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadPanel;
