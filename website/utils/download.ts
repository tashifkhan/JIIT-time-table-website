import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

// Add callbacks for progress, success, and error
export const downloadAsPng = async (
  elementId: string,
  filename: string,
  {
    onProgress,
    onSuccess,
    onError,
  }: {
    onProgress?: (msg: string) => void;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
  } = {}
) => {
  try {
    if (onProgress) onProgress('Preparing image...');
    // Wait for next animation frame to ensure rendering
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    // Use devicePixelRatio for sharpness
    const dataUrl = await toPng(element, {
      quality: 1,
      backgroundColor: '#131010',
      pixelRatio: window.devicePixelRatio || 2,
      skipFonts: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left',
      },
    });

    if (onProgress) onProgress('Saving image...');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('Error downloading PNG:', err);
    if (onError) onError(err instanceof Error ? err : new Error('Unknown error'));
  }
};

export const downloadAsPdf = async (
  elementId: string,
  filename: string,
  {
    onProgress,
    onSuccess,
    onError,
  }: {
    onProgress?: (msg: string) => void;
    onSuccess?: () => void;
    onError?: (err: Error) => void;
  } = {}
) => {
  try {
    if (onProgress) onProgress('Preparing PDF...');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const dataUrl = await toPng(element, {
      backgroundColor: '#131010',
      quality: 1,
      pixelRatio: window.devicePixelRatio || 2,
      skipFonts: true,
    });

    // A4 dimensions in mm
    const a4Width = 297;
    const a4Height = 210;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [a4Width, a4Height],
    });

    // Calculate image height to fit A4
    const imageWidth = a4Width;
    const imageHeight = (element.offsetHeight * a4Width) / element.offsetWidth;

    pdf.addImage(
      dataUrl,
      'PNG',
      0,
      0,
      imageWidth,
      Math.min(imageHeight, a4Height)
    );

    if (onProgress) onProgress('Saving PDF...');
    pdf.save(`${filename}.pdf`);
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('Error downloading PDF:', err);
    if (onError) onError(err instanceof Error ? err : new Error('Unknown error'));
  }
};