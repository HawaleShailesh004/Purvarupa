import jsPDF from 'jspdf';

/**
 * Generate PDF report from screening results
 */
export async function generatePDF(data) {
  const { result, localScore, basicInfo, symptoms, deepQuestions, referrals } = data;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text, x, y, options = {}) => {
    const maxWidth = pageWidth - 2 * margin;
    const fontSize = options.fontSize || 12;
    doc.setFontSize(fontSize);
    
    if (options.bold) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * fontSize * 0.35) + (options.spacing || 5);
  };

  // Header
  doc.setFillColor(31, 78, 121); // #1F4E79
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  yPosition = addText('TB Pre-Screening Report', margin, 20, { fontSize: 18, bold: true });

  // Reset text color
  doc.setTextColor(0, 0, 0);
  yPosition += 10;

  // Patient Information
  yPosition = addText('Patient Information', margin, yPosition, { fontSize: 14, bold: true, spacing: 10 });
  
  if (basicInfo.fullName) {
    yPosition = addText(`Name: ${basicInfo.fullName}`, margin + 10, yPosition);
  }
  yPosition = addText(`Age: ${basicInfo.age} years`, margin + 10, yPosition);
  if (basicInfo.gender) {
    yPosition = addText(`Gender: ${basicInfo.gender}`, margin + 10, yPosition);
  }
  if (basicInfo.location) {
    yPosition = addText(`Location: ${basicInfo.location}`, margin + 10, yPosition);
  }
  yPosition = addText(`Report Date: ${new Date().toLocaleDateString()}`, margin + 10, yPosition);
  yPosition += 10;

  // Results Summary
  yPosition = addText('Screening Results', margin, yPosition, { fontSize: 14, bold: true, spacing: 10 });
  
  const likelihoodText = `TB Likelihood: ${result.likelihood}`;
  yPosition = addText(likelihoodText, margin + 10, yPosition, { fontSize: 12, bold: true });
  
  yPosition = addText(`Confidence Level: ${result.confidence_percent}%`, margin + 10, yPosition);
  yPosition = addText(`Risk Score: ${localScore}/15`, margin + 10, yPosition);
  yPosition = addText(`Urgency Level: ${result.urgency}`, margin + 10, yPosition);
  yPosition += 10;

  // Symptoms Reported
  yPosition = addText('Reported Symptoms', margin, yPosition, { fontSize: 14, bold: true, spacing: 10 });
  
  const reportedSymptoms = Object.keys(symptoms).filter(key => symptoms[key] && key !== 'none_of_the_above');
  
  if (symptoms.none_of_the_above) {
    yPosition = addText('• None of the above symptoms reported', margin + 10, yPosition);
  } else if (reportedSymptoms.length > 0) {
    reportedSymptoms.forEach(symptom => {
      const symptomText = symptom.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      yPosition = addText(`• ${symptomText}`, margin + 10, yPosition);
    });
  } else {
    yPosition = addText('• No symptoms reported', margin + 10, yPosition);
  }
  yPosition += 10;

  // Risk Factors Analysis
  if (result.reasons && result.reasons.length > 0) {
    yPosition = addText('Risk Factors Analysis', margin, yPosition, { fontSize: 14, bold: true, spacing: 10 });
    
    result.reasons.forEach(reason => {
      yPosition = addText(`• ${reason}`, margin + 10, yPosition);
    });
    yPosition += 10;
  }

  // Recommended Tests
  if (result.recommended_tests && result.recommended_tests.length > 0) {
    yPosition = addText('Recommended Tests', margin, yPosition, { fontSize: 14, bold: true, spacing: 10 });
    
    result.recommended_tests.forEach(test => {
      yPosition = addText(`• ${test}`, margin + 10, yPosition);
    });
    yPosition += 10;
  }

  // Check if we need a new page
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Nearby TB Centers
  if (referrals && referrals.length > 0) {
    yPosition = addText('Nearby TB Centers', margin, yPosition, { fontSize: 14, bold: true, spacing: 10 });
    
    referrals.forEach((referral, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      yPosition = addText(`${index + 1}. ${referral.name}`, margin + 10, yPosition, { bold: true });
      yPosition = addText(`   Type: ${referral.type}`, margin + 10, yPosition);
      yPosition = addText(`   Address: ${referral.address}`, margin + 10, yPosition);
      if (referral.phone) {
        yPosition = addText(`   Phone: ${referral.phone}`, margin + 10, yPosition);
      }
      yPosition += 5;
    });
    yPosition += 10;
  }

  // Explanation
  if (result.explanation_plain) {
    if (yPosition > 220) {
      doc.addPage();
      yPosition = 20;
    }
    
    yPosition = addText('Detailed Explanation', margin, yPosition, { fontSize: 14, bold: true, spacing: 10 });
    yPosition = addText(result.explanation_plain, margin + 10, yPosition, { spacing: 10 });
  }

  // Footer disclaimer
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }
  
  yPosition += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const disclaimer = 'MEDICAL DISCLAIMER: This screening tool is for informational purposes only and does not constitute medical advice. Please consult with a qualified healthcare professional for proper diagnosis and treatment. This is not a substitute for professional medical evaluation.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, yPosition);

  // Save the PDF
  const filename = `TB_Screening_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Generate summary text for sharing
 */
export function generateSummaryText(data) {
  const { result, localScore, basicInfo } = data;
  
  let summary = 'TB Pre-Screening Summary\n';
  summary += '========================\n\n';
  
  if (basicInfo.fullName) {
    summary += `Patient: ${basicInfo.fullName}\n`;
  }
  summary += `Age: ${basicInfo.age} years\n`;
  summary += `Date: ${new Date().toLocaleDateString()}\n\n`;
  
  summary += `TB Likelihood: ${result.likelihood}\n`;
  summary += `Risk Score: ${localScore}/15\n`;
  summary += `Confidence: ${result.confidence_percent}%\n`;
  summary += `Urgency: ${result.urgency}\n\n`;
  
  if (result.explanation_plain) {
    summary += `Assessment: ${result.explanation_plain}\n\n`;
  }
  
  summary += 'DISCLAIMER: This is a screening tool only. Please consult a healthcare professional for proper medical evaluation.\n';
  
  return summary;
}