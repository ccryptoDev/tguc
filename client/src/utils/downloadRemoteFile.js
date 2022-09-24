export const downloadFile = async (url, fileName = "file") => {
  const file = await fetch(url);
  const blob = await file.blob();
  const blobUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = blobUrl;
  downloadLink.download = fileName;
  downloadLink.click();
  downloadLink.remove();
};
