import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const downloadAsPng = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await toPng(element, { quality: 0.95 });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error downloading PNG:', err);
  }
};

export const downloadAsPdf = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const dataUrl = await toPng(element);
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [element.offsetWidth, element.offsetHeight]
    });
    
    pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('Error downloading PDF:', err);
  }
};