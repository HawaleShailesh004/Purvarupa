# TB Pre-Screening Platform - API Contracts & Integration Guide

## Backend API Endpoints

### 1. Screening Analysis
**POST /api/analyze**
```json
// Request payload
{
  "user": {
    "name": "string|null",
    "age": 34,
    "gender": "Male|Female|Other",
    "location": "string|null",
    "contact": "string|null"
  },
  "symptoms": {
    "cough_gt_2_weeks": true,
    "cough_with_sputum": false,
    "cough_with_blood": false,
    "fever_evening": true,
    "weight_loss": false,
    "night_sweats": false,
    "chest_pain": false,
    "loss_of_appetite": false,
    "none_of_the_above": false
  },
  "deep_questions": {
    "cough_duration_weeks": "> 1 month",
    "cough_type": "With sputum",
    "fever_pattern": "Evening/low-grade",
    "weight_appetite": "None",
    "night_sweats_fatigue": "None",
    "exposure_contact": "Family member with TB",
    "previous_conditions": ["diabetes","previous_tb_completed"]
  },
  "uploads": [
    {
      "type": "chest_xray",
      "filename": "xray1.jpg",
      "content_base64": "..."
    }
  ],
  "local_score": 8
}

// Response
{
  "likelihood": "High|Moderate|Low|Confirmed",
  "confidence_percent": 78,
  "reasons": [
    "Cough > 2 weeks (3 pts)",
    "Evening fever (2 pts)", 
    "Family contact (3 pts)"
  ],
  "urgency": "Immediate|TestSoon|Monitor",
  "recommended_tests": ["Sputum smear","CBNAAT (GeneXpert)","Chest X-ray"],
  "referrals": [
    {
      "name": "District TB Center A",
      "type": "DOTS center",
      "phone": "+91...",
      "address": "...",
      "lat": 19.0760,
      "lng": 72.8777,
      "distance": "2.3 km"
    }
  ],
  "explanation_plain": "Simple paragraph in user language explaining why...",
  "session_id": "uuid"
}
```

### 2. File Upload
**POST /api/upload**
- Handles medical report uploads (X-ray, sputum tests, blood tests)
- Returns file URL and metadata

### 3. Save Report
**POST /api/reports**
- Saves screening results for user history
- Returns report ID

### 4. Get Referrals
**GET /api/referrals?lat={lat}&lng={lng}&radius={radius}**
- Returns nearby TB testing centers
- Includes distance calculation

## Frontend Mocked Data to Replace

### Current Mock Files:
1. **src/data/referrals.js** - Replace with API call to `/api/referrals`
2. **src/utils/mockApi.js** - Replace `mockApiCall()` with real API calls
3. **LocalStorage screening data** - Optionally sync with backend user sessions

### Integration Points:

#### 1. Screening Submission (src/pages/Screening.js)
- Replace `mockApiCall()` in `handleSubmit()`
- Add proper error handling and loading states
- Implement session management

#### 2. Results Display (src/pages/Result.js)
- Fetch referrals from API based on user location
- Enhanced scoring display with AI confidence
- Improved reasoning explanations

#### 3. PDF Generation (src/utils/pdfGenerator.js)
- Integrate with backend for server-side PDF generation option
- Include session metadata and timestamps

## Enhanced Question Flow Logic

### Improved Branching Logic:
1. **Smart Skip Logic**: If "none of the above" symptoms → skip to upload step
2. **Conditional Deep Questions**: Only show relevant deep questions based on symptoms
3. **Risk-Based Prioritization**: High-risk indicators trigger immediate escalation path
4. **Previous TB History**: Special handling for incomplete TB treatment cases

### Backend Business Logic:
1. **Intelligent Scoring**: Enhanced algorithm with weighted risk factors
2. **AI Integration**: Natural language analysis of symptoms
3. **Location-Based Referrals**: Dynamic center recommendations
4. **Multi-language Support**: Backend translations for Hindi/Marathi

## Database Schema

### Collections:
1. **screening_sessions** - User screening data and results
2. **tb_centers** - Referral center information with geolocation
3. **uploaded_files** - Medical report metadata
4. **user_reports** - Saved screening history

## Security & Privacy:
- No PII storage without explicit consent
- File upload validation and sanitization
- Session-based data management
- GDPR-compliant data handling

## Dashboard Improvements:
1. **Trust Indicators**: Medical disclaimers, certification badges
2. **Enhanced Visualization**: Risk level charts, confidence meters  
3. **Action-Oriented Design**: Clear next steps, emergency contacts
4. **Professional Color Palette**: Medical blues, trust greens, warning ambers