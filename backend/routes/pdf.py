from fastapi import APIRouter, HTTPException, Depends, Response
from fastapi.responses import FileResponse
from typing import Optional
from models.screening import ScreeningSession, AnalysisResult
from motor.motor_asyncio import AsyncIOMotorClient
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import os
import io
from datetime import datetime
import tempfile
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["pdf"])

# Database dependency
def get_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    return db

@router.get("/pdf/report/{session_id}")
async def generate_pdf_report(session_id: str, db = Depends(get_database)):
    """
    Generate and download PDF report for a screening session
    """
    try:
        # Get session data from database
        session_doc = await db.screening_sessions.find_one({"id": session_id})
        
        if not session_doc:
            raise HTTPException(status_code=404, detail="Screening session not found")
        
        session = ScreeningSession(**session_doc)
        
        if not session.analysis_result:
            raise HTTPException(status_code=400, detail="No analysis result available for PDF generation")
        
        # Generate PDF
        pdf_buffer = generate_professional_pdf(session)
        
        # Return PDF as response
        filename = f"TB_Screening_Report_{session_id[:8]}_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return Response(
            content=pdf_buffer.getvalue(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation failed: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

def generate_professional_pdf(session: ScreeningSession) -> io.BytesIO:
    """
    Generate a professional, medical-grade PDF report
    """
    buffer = io.BytesIO()
    
    # Create PDF document with A4 page size
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles for medical report
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#1F4E79')  # Deep blue
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        spaceBefore=20,
        textColor=colors.HexColor('#1F4E79'),
        borderPadding=4
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        alignment=TA_JUSTIFY
    )
    
    # Build PDF content
    content = []
    
    # Header
    content.append(Paragraph("TUBERCULOSIS PRE-SCREENING REPORT", title_style))
    content.append(Spacer(1, 20))
    
    # Report metadata
    report_date = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    content.append(Paragraph(f"<b>Report Generated:</b> {report_date}", normal_style))
    content.append(Paragraph(f"<b>Session ID:</b> {session.id}", normal_style))
    content.append(Spacer(1, 20))
    
    # Patient Information
    content.append(Paragraph("PATIENT INFORMATION", heading_style))
    
    patient_data = [
        ['Field', 'Value'],
        ['Name', session.user_info.name or 'Not provided'],
        ['Age', f"{session.user_info.age} years"],
        ['Gender', session.user_info.gender or 'Not specified'],
        ['Location', session.user_info.location or 'Not provided'],
        ['Contact', session.user_info.contact or 'Not provided']
    ]
    
    patient_table = Table(patient_data, colWidths=[2*inch, 3*inch])
    patient_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E6EEF6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC'))
    ]))
    
    content.append(patient_table)
    content.append(Spacer(1, 20))
    
    # Screening Results
    content.append(Paragraph("SCREENING RESULTS", heading_style))
    
    result = session.analysis_result
    
    # Result summary table
    result_color = get_risk_color(result.likelihood)
    
    result_data = [
        ['Assessment', 'Value'],
        ['TB Likelihood', result.likelihood],
        ['Risk Score', f"{result.risk_score}/20"],
        ['AI Confidence', f"{result.confidence_percent}%"],
        ['Urgency Level', result.urgency]
    ]
    
    result_table = Table(result_data, colWidths=[2*inch, 3*inch])
    result_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E6EEF6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('BACKGROUND', (1, 1), (1, 1), result_color),  # Likelihood cell
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('FONTNAME', (1, 1), (1, 1), 'Helvetica-Bold'),  # Bold likelihood
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC'))
    ]))
    
    content.append(result_table)
    content.append(Spacer(1, 20))
    
    # Explanation
    content.append(Paragraph("CLINICAL ASSESSMENT", heading_style))
    content.append(Paragraph(result.explanation_plain, normal_style))
    
    if result.ai_analysis:
        content.append(Spacer(1, 10))
        content.append(Paragraph(f"<b>AI Analysis:</b> {result.ai_analysis}", normal_style))
    
    content.append(Spacer(1, 20))
    
    # Risk factors
    if result.reasons:
        content.append(Paragraph("IDENTIFIED RISK FACTORS", heading_style))
        for i, reason in enumerate(result.reasons[:8], 1):  # Limit to 8 reasons
            content.append(Paragraph(f"• {reason}", normal_style))
        
        if len(result.reasons) > 8:
            content.append(Paragraph(f"... and {len(result.reasons) - 8} additional factors", normal_style))
        
        content.append(Spacer(1, 20))
    
    # Recommended tests
    if result.recommended_tests:
        content.append(Paragraph("RECOMMENDED MEDICAL TESTS", heading_style))
        for test in result.recommended_tests:
            content.append(Paragraph(f"• {test}", normal_style))
        content.append(Spacer(1, 20))
    
    # Referral centers
    if result.referrals:
        content.append(Paragraph("NEARBY TB TESTING CENTERS", heading_style))
        
        referral_data = [['Center Name', 'Type', 'Phone', 'Distance']]
        
        for referral in result.referrals[:5]:  # Limit to 5 centers
            referral_data.append([
                referral.name,
                referral.type,
                referral.phone,
                referral.distance or 'N/A'
            ])
        
        referral_table = Table(referral_data, colWidths=[2.2*inch, 1.2*inch, 1.1*inch, 0.8*inch])
        referral_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E6EEF6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP')
        ]))
        
        content.append(referral_table)
        content.append(Spacer(1, 20))
    
    # Medical disclaimer
    content.append(Paragraph("IMPORTANT MEDICAL DISCLAIMER", heading_style))
    
    disclaimer_text = (
        "This screening tool is for informational and educational purposes only and does not constitute medical advice, "
        "diagnosis, or treatment. The results are based on self-reported symptoms and risk factors and should not replace "
        "professional medical evaluation. Please consult with a qualified healthcare provider for proper diagnosis, "
        "treatment, and medical guidance. TB is a serious medical condition that requires professional medical care."
    )
    
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=normal_style,
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        borderWidth=1,
        borderColor=colors.HexColor('#CCCCCC'),
        borderPadding=8,
        backColor=colors.HexColor('#F8F9FA')
    )
    
    content.append(Paragraph(disclaimer_text, disclaimer_style))
    
    # Add footer with report generation info
    content.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'Footer',
        parent=normal_style,
        fontSize=8,
        textColor=colors.HexColor('#888888'),
        alignment=TA_CENTER
    )
    
    content.append(Paragraph(
        f"Generated by TB Pre-Screening Platform • {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} • Session: {session.id[:8]}",
        footer_style
    ))
    
    # Build PDF
    doc.build(content)
    
    # Reset buffer position
    buffer.seek(0)
    
    return buffer

def get_risk_color(likelihood: str) -> colors.Color:
    """
    Get appropriate color for risk level
    """
    color_map = {
        'Low': colors.HexColor('#D4F6D4'),      # Light green
        'Moderate': colors.HexColor('#FFF4D4'), # Light yellow  
        'High': colors.HexColor('#FFE4D4'),     # Light orange
        'Confirmed': colors.HexColor('#FFD4D4') # Light red
    }
    
    return color_map.get(likelihood, colors.HexColor('#F0F0F0'))