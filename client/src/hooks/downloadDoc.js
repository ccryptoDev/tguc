import { useState } from "react";

export const useFetchDocs = () => {
  const [loading, setLoading] = useState(false);

  const download = async (url) => {
    if (screenId) {
      setLoading(true);
      const file = await fetch(url);
      const blob = await file.blob();
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      downloadLink.click();
      downloadLink.remove();
      setLoading(false);
    }
  };
  return { download, loading };
};
