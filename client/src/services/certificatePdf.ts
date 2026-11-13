import api from "./api";

// For blob requests the error body is a Blob too, so parse the JSON out of it.
export const readApiError = async (err: any, fallback: string): Promise<string> => {
  const data = err?.response?.data;
  try {
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      const parsed = JSON.parse(await data.text());
      return parsed?.error || parsed?.message || fallback;
    }
  } catch {
    return fallback;
  }
  return data?.error || data?.message || fallback;
};

// this already exist in the certificate context and not neeed - get the pdf from te context page 
export const fetchCertificatePdf = async (certId: number | string): Promise<Blob> => {
  try {
    const response = await api.get(`/certificate/${certId}/pdf`, {
      responseType: "blob",
      withCredentials: true,
    });
    return response.data as Blob;
  } catch (err) {
    throw new Error(await readApiError(err, "Could not load the PDF"));
  }
};

export const saveBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};