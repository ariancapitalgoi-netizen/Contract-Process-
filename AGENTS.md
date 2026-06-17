# Developer Guide

## Mandatory Fields
All fields in the "Initial Party Contract Information" form (`افزودن اطلاعات اولیه طرف قرارداد`) are mandatory. 
1. Ensure all inputs are validated for presence before submission.
2. Mandatory fields MUST be clearly marked by a red line at the side of the field in the UI (by setting required to true on FieldRow), as per Bizagi Technical Notes.

## Prompt Context
By default, assume any functional or visual change request refers to the form currently active in the preview environment, unless a different form is explicitly specified in the prompt.
