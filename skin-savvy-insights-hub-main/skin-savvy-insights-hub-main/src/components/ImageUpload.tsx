import React, { useState, useRef } from "react";
import { Upload, Camera, X, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SkinAnalysisFormData {
  age?: number;
  skinType?: string;
}

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onAnalysisDataChange: (data: SkinAnalysisFormData) => void;
  selectedImage?: File | null;
  analysisData?: SkinAnalysisFormData;
  loading?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onAnalysisDataChange,
  selectedImage,
  analysisData = {},
  loading = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skinTypes = [
    { value: "oily", label: "Oily" },
    { value: "dry", label: "Dry" },
    { value: "combination", label: "Combination" },
    { value: "sensitive", label: "Sensitive" },
    { value: "normal", label: "Normal" },
  ];

  const handleAnalysisDataChange = (field: keyof SkinAnalysisFormData, value: string | number) => {
    const updatedData = { ...analysisData, [field]: value };
    onAnalysisDataChange(updatedData);
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onImageSelect(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden shadow-lg border border-border/40 rounded-2xl bg-background p-4 transition-all hover:shadow-xl">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-72 object-cover rounded-xl border border-border/40"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-3 right-3 rounded-full shadow-md"
              onClick={clearImage}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>

            {loading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl backdrop-blur-sm">
                <div className="text-center">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Analyzing your skin...
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 ease-in-out
              ${dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/60"}
              ${loading ? "opacity-50 pointer-events-none" : "cursor-pointer"}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              disabled={loading}
            />

            <div className="space-y-5">
              <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="h-9 w-9 text-white drop-shadow" />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Upload Your Photo</h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Take a clear photo of your face in good lighting for the best
                  analysis
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <span className="text-xs text-muted-foreground self-center">
                    or drag & drop
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Additional Analysis Information */}
      <Card className="shadow-lg border border-border/40 rounded-2xl bg-background p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Additional Information</h3>
          </div>
          
          <p className="text-sm text-muted-foreground mb-6">
            Provide additional details for more personalized skin analysis and recommendations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age Input */}
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Age (Optional)
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                min="13"
                max="100"
                value={analysisData.age || ""}
                onChange={(e) => handleAnalysisDataChange("age", parseInt(e.target.value) || undefined)}
                className="rounded-lg"
              />
            </div>

            {/* Skin Type Selector */}
            <div className="space-y-2">
              <Label htmlFor="skinType" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Skin Type (Optional)
              </Label>
              <Select 
                value={analysisData.skinType || ""} 
                onValueChange={(value) => handleAnalysisDataChange("skinType", value)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select your skin type" />
                </SelectTrigger>
                <SelectContent>
                  {skinTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Providing your age and skin type helps our AI deliver more accurate, 
              personalized recommendations tailored to your specific needs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImageUpload;
