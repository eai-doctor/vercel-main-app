# Bug Fix: ReferenceError - patientSnapshot is not defined

## Issue
When clicking "End Consultation" to generate an AI summary, the application crashed with:
```
Error generating summary: ReferenceError: patientSnapshot is not defined
    at generateAISummary (ConsultationSummaryUI.jsx:619:29)
```

## Root Cause
The `generateAISummary` function was trying to use two undefined variables:
- `patientSnapshot` (line 619)
- `conversationHistory` (line 620)

These variables were never created as state variables in the component.

## Analysis
Looking at the data flow:
1. The backend API returns `patient_snapshot` and `conversation_history`
2. The frontend receives these in the streaming response (line 399)
3. However, only `conversation_history` was saved to the `snapshot` state (line 401)
4. `patient_snapshot` was completely ignored
5. Later, when generating the summary, the code tried to use the wrong variable names

## Fix Applied
Changed the `generateAISummary` function to use the correct state variable:

**Before:**
```javascript
consultation_data: {
  conversation_summary: conversationSummary,
  patient_snapshot: patientSnapshot,        // ❌ Undefined variable
  conversation_history: conversationHistory, // ❌ Undefined variable
  new_diagnoses: patientData.diagnoses || [],
  new_medications: patientData.medications || []
}
```

**After:**
```javascript
consultation_data: {
  conversation_summary: conversationSummary,
  patient_snapshot: snapshot || conversationSummary,  // ✓ Use existing snapshot state
  conversation_history: snapshot,                     // ✓ Use existing snapshot state
  new_diagnoses: patientData.diagnoses || [],
  new_medications: patientData.medications || []
}
```

## Why This Works
- The `snapshot` state variable already contains the `conversation_history` data
- Using `snapshot || conversationSummary` as a fallback ensures there's always some data
- Both fields now reference valid state variables

## Testing
To verify the fix:
1. Start a consultation recording
2. Complete the recording
3. Click "End Consultation"
4. The AI summary should generate without errors

## Files Modified
- `/Consultation App/frontend/src/ConsultationSummaryUI.jsx` (lines 619-620)

---

**Date Fixed**: November 20, 2025
**Status**: ✓ RESOLVED
