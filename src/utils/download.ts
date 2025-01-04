import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

const RENDER_DELAY = 2000; // Increased to 2 seconds

export const downloadAsPng = async (elementId: string, filename: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, RENDER_DELAY));
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const dataUrl = await toPng(element, { 
      quality: 0.95,
      backgroundColor: '#131010',
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      }
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error downloading PNG:', err);
    alert('Failed to download image. Please try again.');
  }
};

export const downloadAsPdf = async (elementId: string, filename: string) => {
  try {
    await new Promise(resolve => setTimeout(resolve, RENDER_DELAY));
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    const dataUrl = await toPng(element, {
      backgroundColor: '#131010',
      quality: 1,
      pixelRatio: 2
    });

    // A4 dimensions in mm
    const a4Width = 297;
    const a4Height = 210;

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [a4Width, a4Height]
    });

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
    
    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error('Error downloading PDF:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    alert(`Failed to download PDF: ${errorMessage}`);
  }
};