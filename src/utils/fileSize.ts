export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatFileSizeFromString = (sizeString: string): string => {
  if (!sizeString) return "--";
  
  // Try to parse as number (bytes)
  const bytes = parseInt(sizeString);
  
  if (!isNaN(bytes)) {
    return formatFileSize(bytes);
  }
  
  // If it's already formatted, return as is
  return sizeString;
};

export const calculateCompressionPercentage = (originalSize: string, compressedSize: string): number => {
  // Handle formatted sizes like "3.24 MB" or "Unknown"
  if (originalSize === "Unknown" || compressedSize === "Unknown" || 
      originalSize === "0" || compressedSize === "0") {
    return 0;
  }
  
  // Try to parse as numbers (bytes)
  const original = parseInt(originalSize);
  const compressed = parseInt(compressedSize);
  
  if (!isNaN(original) && !isNaN(compressed) && original > 0) {
    return Math.round(((original - compressed) / original) * 100);
  }
  
  // If parsing as numbers failed, try to extract numbers from formatted strings
  const originalMatch = originalSize.match(/(\d+(?:\.\d+)?)/);
  const compressedMatch = compressedSize.match(/(\d+(?:\.\d+)?)/);
  
  if (originalMatch && compressedMatch) {
    const originalNum = parseFloat(originalMatch[1]);
    const compressedNum = parseFloat(compressedMatch[1]);
    
    if (originalNum > 0) {
      return Math.round(((originalNum - compressedNum) / originalNum) * 100);
    }
  }
  
  return 0;
};
