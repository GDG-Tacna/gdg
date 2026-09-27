// Generate sample portrait data URLs for instant demo testing
export function generateSamplePortrait(type: 'dev1' | 'dev2' | 'dev3'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'dev1') {
    // Warm skin tone with Google Blue hoodie
    ctx.fillStyle = '#E8EAED';
    ctx.fillRect(0, 0, 300, 300);

    // Blue hoodie
    ctx.fillStyle = '#4285F4';
    ctx.beginPath();
    ctx.ellipse(150, 270, 110, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#D6895A'; // warm medium skin tone
    ctx.fillRect(135, 175, 30, 45);

    // Face
    ctx.fillStyle = '#EAA374';
    ctx.beginPath();
    ctx.arc(150, 140, 55, 0, Math.PI * 2);
    ctx.fill();

    // Dark curly hair
    ctx.fillStyle = '#221510';
    ctx.beginPath();
    ctx.arc(150, 115, 60, Math.PI, 0);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(95, 130, 15, 0, Math.PI * 2);
    ctx.arc(205, 130, 15, 0, Math.PI * 2);
    ctx.arc(150, 95, 20, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1B140E';
    ctx.fillRect(125, 135, 10, 8);
    ctx.fillRect(165, 135, 10, 8);

    // Smile
    ctx.strokeStyle = '#934823';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(150, 155, 18, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Red Google lanyard
    ctx.strokeStyle = '#EA4335';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(130, 210);
    ctx.lineTo(145, 290);
    ctx.moveTo(170, 210);
    ctx.lineTo(155, 290);
    ctx.stroke();
  } else if (type === 'dev2') {
    // Lighter skin tone with Red Polera and Glasses
    ctx.fillStyle = '#DCE5FA';
    ctx.fillRect(0, 0, 300, 300);

    // Red Polera (T-Shirt)
    ctx.fillStyle = '#EA4335';
    ctx.beginPath();
    ctx.ellipse(150, 280, 120, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#F5C6A5';
    ctx.fillRect(135, 180, 30, 40);

    // Face
    ctx.fillStyle = '#FDDFCB';
    ctx.beginPath();
    ctx.arc(150, 140, 52, 0, Math.PI * 2);
    ctx.fill();

    // Brown straight hair
    ctx.fillStyle = '#4A2A18';
    ctx.beginPath();
    ctx.arc(150, 120, 58, 0.8 * Math.PI, 2.2 * Math.PI);
    ctx.lineTo(210, 160);
    ctx.lineTo(90, 160);
    ctx.closePath();
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#223843';
    ctx.fillRect(128, 138, 8, 8);
    ctx.fillRect(164, 138, 8, 8);

    // Glasses
    ctx.strokeStyle = '#202124';
    ctx.lineWidth = 3;
    ctx.strokeRect(122, 132, 20, 16);
    ctx.strokeRect(158, 132, 20, 16);
    ctx.beginPath();
    ctx.moveTo(142, 140);
    ctx.lineTo(158, 140);
    ctx.stroke();

    // Smile
    ctx.strokeStyle = '#D97D64';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(150, 160, 15, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else {
    // Deep skin tone with Green GDG jacket
    ctx.fillStyle = '#FFF5E0';
    ctx.fillRect(0, 0, 300, 300);

    // Green jacket
    ctx.fillStyle = '#34A853';
    ctx.beginPath();
    ctx.ellipse(150, 275, 120, 85, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#5A321A';
    ctx.fillRect(135, 175, 30, 45);

    // Face
    ctx.fillStyle = '#784323';
    ctx.beginPath();
    ctx.arc(150, 140, 55, 0, Math.PI * 2);
    ctx.fill();

    // Short dark hair / fade
    ctx.fillStyle = '#100D0A';
    ctx.beginPath();
    ctx.arc(150, 125, 58, Math.PI, 0);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(124, 136, 12, 8);
    ctx.fillRect(164, 136, 12, 8);
    ctx.fillStyle = '#100D0A';
    ctx.fillRect(128, 137, 6, 6);
    ctx.fillRect(168, 137, 6, 6);

    // Beard / goatee
    ctx.fillStyle = '#100D0A';
    ctx.beginPath();
    ctx.arc(150, 165, 22, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.fill();

    // Smile
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(142, 162, 16, 5);
  }

  return canvas.toDataURL('image/png');
}
