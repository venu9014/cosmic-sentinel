import { jsPDF } from 'jspdf';
import { ProcessedAsteroid } from '@/types/asteroid';
import { formatDistance, formatVelocity, formatDiameter } from '@/lib/asteroidUtils';

export function exportAsteroidToPdf(asteroid: ProcessedAsteroid) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(15, 23, 42); // Dark background
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ASTEROID REPORT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('AstroTrack AI - Near Earth Object Analysis', pageWidth / 2, 30, { align: 'center' });
  
  // Asteroid Name
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(asteroid.name, 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`NASA JPL ID: ${asteroid.id}`, 20, 62);
  
  // Risk Status Box
  const riskColor = getRiskColor(asteroid.riskLevel);
  doc.setFillColor(riskColor.r, riskColor.g, riskColor.b);
  doc.roundedRect(20, 70, pageWidth - 40, 25, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const riskLabel = getRiskLabel(asteroid.riskLevel);
  doc.text(riskLabel, pageWidth / 2, 82, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Risk Score: ${asteroid.riskScore}/100`, pageWidth / 2, 90, { align: 'center' });
  
  // Data Section
  doc.setTextColor(0, 0, 0);
  let yPos = 110;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Orbital Data', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const dataRows = [
    ['Miss Distance:', formatDistance(asteroid.missDistance)],
    ['Lunar Distance:', `${asteroid.missDistanceLunar.toFixed(2)} LD`],
    ['Velocity:', formatVelocity(asteroid.velocity)],
    ['Velocity (km/h):', `${(asteroid.velocity * 3600).toFixed(0)} km/h`],
    ['Close Approach Date:', asteroid.closeApproachDate],
  ];
  
  dataRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Physical Characteristics', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const physicalRows = [
    ['Estimated Diameter:', formatDiameter(asteroid.diameterAvg)],
    ['Diameter Range:', `${formatDiameter(asteroid.diameterMin)} - ${formatDiameter(asteroid.diameterMax)}`],
    ['Absolute Magnitude:', asteroid.absoluteMagnitude.toFixed(2)],
  ];
  
  physicalRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 8;
  });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Classification', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  
  const classificationRows = [
    ['NASA PHA Status:', asteroid.isHazardousActual ? 'Potentially Hazardous' : 'Non-Hazardous'],
    ['ML Prediction:', asteroid.predictedHazardous ? 'HAZARDOUS' : 'SAFE'],
    ['Risk Level:', asteroid.riskLevel.toUpperCase()],
  ];
  
  classificationRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 80, yPos);
    yPos += 8;
  });
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 280);
  doc.text(`Source: NASA JPL - ${asteroid.nasaUrl}`, 20, 285);
  
  // Save the PDF
  const fileName = `asteroid-${asteroid.id}-report.pdf`;
  doc.save(fileName);
}

export function exportAllAsteroidsToPdf(asteroids: ProcessedAsteroid[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ASTEROID TRACKING REPORT', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('AstroTrack AI - Complete NEO Analysis', pageWidth / 2, 30, { align: 'center' });
  
  // Summary Stats
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, 55);
  
  const hazardousCount = asteroids.filter(a => a.predictedHazardous).length;
  const safeCount = asteroids.filter(a => !a.predictedHazardous).length;
  const avgRisk = asteroids.reduce((sum, a) => sum + a.riskScore, 0) / asteroids.length;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Asteroids: ${asteroids.length}`, 25, 65);
  doc.text(`Hazardous: ${hazardousCount}`, 25, 73);
  doc.text(`Safe: ${safeCount}`, 25, 81);
  doc.text(`Average Risk Score: ${avgRisk.toFixed(1)}/100`, 25, 89);
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 25, 97);
  
  // Table Header
  let yPos = 115;
  doc.setFillColor(240, 240, 240);
  doc.rect(15, yPos - 6, pageWidth - 30, 10, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Name', 20, yPos);
  doc.text('Risk', 70, yPos);
  doc.text('Distance', 90, yPos);
  doc.text('Velocity', 125, yPos);
  doc.text('Size', 160, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  
  // Asteroid rows
  asteroids.slice(0, 25).forEach((asteroid, index) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
      
      // Repeat header on new page
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPos - 6, pageWidth - 30, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text('Name', 20, yPos);
      doc.text('Risk', 70, yPos);
      doc.text('Distance', 90, yPos);
      doc.text('Velocity', 125, yPos);
      doc.text('Size', 160, yPos);
      
      yPos += 10;
      doc.setFont('helvetica', 'normal');
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
    }
    
    const name = asteroid.name.length > 15 ? asteroid.name.substring(0, 15) + '...' : asteroid.name;
    doc.text(name, 20, yPos);
    doc.text(`${asteroid.riskScore}`, 70, yPos);
    doc.text(formatDistance(asteroid.missDistance), 90, yPos);
    doc.text(formatVelocity(asteroid.velocity), 125, yPos);
    doc.text(formatDiameter(asteroid.diameterAvg), 160, yPos);
    
    yPos += 8;
  });
  
  if (asteroids.length > 25) {
    yPos += 5;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`... and ${asteroids.length - 25} more asteroids`, 20, yPos);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const lastPage = doc.internal.pages.length - 1;
  doc.text('Source: NASA Near Earth Object Web Service (NeoWs)', 20, 285);
  
  doc.save(`asteroid-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

function getRiskColor(level: string): { r: number; g: number; b: number } {
  switch (level) {
    case 'critical':
      return { r: 220, g: 38, b: 38 };
    case 'high':
      return { r: 245, g: 158, b: 11 };
    case 'medium':
      return { r: 139, g: 92, b: 246 };
    default:
      return { r: 34, g: 197, b: 94 };
  }
}

function getRiskLabel(level: string): string {
  switch (level) {
    case 'critical':
      return 'CRITICAL THREAT';
    case 'high':
      return 'HIGH RISK';
    case 'medium':
      return 'MODERATE RISK';
    default:
      return 'LOW RISK - SAFE';
  }
}
