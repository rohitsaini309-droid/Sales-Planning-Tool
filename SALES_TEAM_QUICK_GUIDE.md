# Air Cargo Planning Tool - Quick Start Guide
**Version 1.0 | January 23, 2026**

---

## Getting Started
1. Open **index.html** in your web browser
2. Navigate using tabs: **Sales Input** → **BSA/Charter Daily Plan** → **Consolidated View**
3. Data saves automatically in your browser

---

## Entering Opportunities

### BSA Opportunities

**Section 1: General Details**
- Sales Person Name, Customer Name, Opportunity Type = "BSA"

**Section 2: Opportunity Details**
- **Route:** Use format AAA-BBB-CCC (e.g., JFK-ORD-LAX)
- **Dates:** Overall start/end dates (Apr 1 - Dec 31, 2026)
- **Capacity Type:** Comingled or Dedicated
- **Shipment Type:** Skid-Level or Piece-level
- **Customer ULD Type:** AAX, DQF, LAY, AMP, AAP, PMC, PAJ, Others
  - *If PMC/PAJ/Others selected → Amazon ULD Type field appears*
- **Rate Unit:** per Lb or per ULD

**Time Periods** (Add multiple for volume ramp-ups or rate changes)
- Period dates, Frequency, # Customer Positions, # Amazon Positions (if applicable)
- Volume, Weight, Rate, Revenue per Shipment
- **Days of Shipment:** Hold Ctrl/Cmd to select multiple days
- Ancillary Revenue and whether it's covered

**Section 3: Ancillary Services**
- Build @Origin, Break @Destination, Linehaul, Screening, etc.
- Enter costs for Linehaul Movement and Screening Event

**Section 4: Holidays**
- Default holidays pre-loaded (July 4, Thanksgiving, Christmas, etc.)
- For each holiday: "Revenue and Volume on Holiday is Zero" = Yes (no ops) or No (custom values)
- **Tip:** Use "Apply to All" to configure all holidays at once

### Charter Opportunities

**Section 1-2: Similar to BSA, plus:**
- **Charter Type:** Domestic or International
- **Ferry Leg:** Empty positioning flight (if applicable)
- **Carrier:** 21Air, ATSG, Other
- **Gauge:** 767-300, 767-600, A330

**Time Periods:**
- **# Rotations per Day:** Number of round trips (default: 1)
- **Revenue per Rotation:** Revenue for one round trip
- **Ancillary per Rotation:** Additional services revenue

**Revenue Calculation:**
```
If Ancillary NOT Covered: Total = (Revenue + Ancillary) × Rotations
If Ancillary IS Covered: Total = Revenue × Rotations

Example: $50k revenue + $10k ancillary (not covered) × 2 rotations = $120k
```

---

## Understanding Frequency

| Frequency | Behavior | Example |
|-----------|----------|---------|
| **Weekly** | Every selected day | Every Tuesday |
| **Biweekly** | Every other occurrence | 1st, 3rd, 5th Tuesday |
| **Monthly** | Last occurrence in 30-day intervals | Last Tuesday per 30-day period |

**Important:** Monthly requires at least 30 days in the interval.

---

## Holiday Rules (CRITICAL)

**Holidays ALWAYS Override Frequency:**

| Frequency Says | Holiday Says | Result |
|----------------|--------------|--------|
| NO operations | YES with values | ✅ Operations occur (holiday values) |
| YES operations | ZERO | ❌ No operations |
| YES operations | YES with values | ✅ Operations occur (holiday values) |

**Key Takeaway:** Holiday configuration determines what happens, regardless of frequency settings.

---

## Viewing & Exporting Data

### Daily Plan Views
- **BSA Daily Plan:** All BSA operations with 31 columns
- **Charter Daily Plan:** All Charter operations with 25 columns
- **Filters:** Sales Person, Customer, Route/Opportunity Type

### Consolidated View
- Summary cards: Total Revenue, BSA/Charter split, Volume, Weight
- Revenue by Customer & Route, by Month, by Week
- Use filters to focus on specific segments

### Export to CSV
1. Click **"Export to CSV"** (top right)
2. Select filters (optional): Sales Person, Customer, Opportunity Type
3. Click **"Export CSV"**
4. File downloads with all daily plan columns

---

## Quick Tips

### Data Entry
✅ **Route Format:** Always use 3-letter codes with hyphens (JFK-ORD-LAX)  
✅ **Multiple Periods:** Use for ramp-ups or rate changes, not for every small variation  
✅ **Overlapping Periods:** Tool allows this and aggregates values (adds them together)  
✅ **Days Selection:** Hold Ctrl/Cmd to select multiple days  

### Validation
✅ **Check Daily Plan:** After submitting, verify operations appear on expected dates  
✅ **Use Filters:** Filter by your name to review only your opportunities  
✅ **Rate Calculation:** Rate = Total Revenue / Weight (auto-calculated when aggregating)  

### Holiday Configuration
✅ **Review Defaults:** Tool includes major US holidays  
✅ **International Charters:** Consider destination country holidays  
✅ **Apply to All:** Use when all holidays have same impact (saves time)  

### Data Management
✅ **Export Backups:** Export CSV periodically as backup  
✅ **Edit vs. New:** Use "Edit" button to modify existing entries  
✅ **Delete Carefully:** Cannot be undone  

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Operations not on expected dates | Check frequency setting and holiday configuration |
| Amazon ULD Type not showing | Select PMC, PAJ, or Others in Customer ULD Type |
| "Start date must be before end date" | Correct date order in period configuration |
| "Dates must be within planning period" | Use dates between Apr 1 - Dec 31, 2026 |
| "At least one time period required" | Keep at least one period per opportunity |
| No data to export | Clear or adjust export filters |

---

## Input Checklists

### BSA Checklist
☐ Sales Person, Customer, Type = BSA  
☐ Route (AAA-BBB format)  
☐ Overall dates, Capacity Type, Shipment Type  
☐ Customer ULD Type, Amazon ULD Type (if needed), Rate Unit  
☐ At least one Time Period with all fields  
☐ Days of Shipment selected  
☐ Ancillary Services configured  
☐ Holidays reviewed  

### Charter Checklist
☐ Sales Person, Customer, Type = Charter  
☐ Route, Overall dates  
☐ Charter Type, Ferry Leg, Carrier, Gauge  
☐ At least one Time Period with Rotations per Day  
☐ Days of Operations selected  
☐ Ancillary Services configured  
☐ Holidays reviewed (including international)  

---

## Need Help?
1. Check the detailed SOP (SALES_TEAM_SOP.md)
2. Review HOLIDAY_FREQUENCY_INTERACTION.md for holiday logic
3. Contact your manager or IT support

---

**Remember:** The tool generates daily plans for April 1 - December 31, 2026. All data is saved in your browser automatically.
