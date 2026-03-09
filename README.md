Air Cargo Annual/Quarterly Planning Tool
Standard Operating Procedure (SOP) for Sales Team
Version: 1.0
Date: January 23, 2026
Purpose: Guide sales team on using the planning tool to input projections and generate daily plans

Table of Contents
Overview
Getting Started
BSA Opportunity Input
Charter Opportunity Input
Understanding Frequency Options
Holiday Configuration
Viewing Daily Plans
Exporting Data
Tips & Best Practices
Troubleshooting
Overview
What is This Tool?
The Air Cargo Annual/Quarterly Planning Tool helps you:

Input sales projections for BSA and Charter opportunities
Generate detailed daily operational plans (April 1 - December 31, 2026)
View consolidated revenue forecasts
Export data for analysis and reporting
Key Features
✅ Supports both BSA and Charter opportunities
✅ Multiple time periods with different volumes/rates
✅ Flexible frequency options (weekly, biweekly, monthly)
✅ Individual holiday configurations
✅ Automatic daily plan generation
✅ CSV export with filters
Getting Started
Opening the Tool
Double-click index.html to open in your web browser
The tool opens to the Sales Input tab
All data is saved automatically in your browser
Navigation Tabs
Sales Input: Enter new opportunities
BSA Daily Plan: View BSA daily operations
Charter Daily Plan: View Charter daily operations
Consolidated View: See overall revenue summary
BSA Opportunity Input
Section 1: General Details
Required Fields:

Sales Person Name: Your name
Customer Name: Customer's company name
Opportunity Type: Select "BSA"
Section 2: Opportunity Details
Basic Information
Route: Enter in format AAA-BBB-CCC (e.g., JFK-ORD-LAX)

Use 3-letter airport codes
Separate with hyphens
Tool will automatically parse into legs
Overall Start Date: First day of operations (within Apr 1 - Dec 31, 2026)

Overall End Date: Last day of operations (within Apr 1 - Dec 31, 2026)

Capacity Type:

Comingled: Shared space with other customers
Dedicated: Exclusive space for this customer
Shipment Type:

Skid-Level: Palletized shipments
Piece-level: Individual packages
Customer ULD Type: Select the ULD type customer provides

AAX, DQF, LAY, AMP, AAP: Standard types
PMC, PAJ, Others: Triggers Amazon ULD Type field
Amazon ULD Type: (Only if Customer ULD Type is PMC/PAJ/Others)

Select the ULD type Amazon will use
Options: AAX, DQF, LAY, AMP, AAP
Rate: Unit of Measurement:

per Lb: Rate is per pound
per ULD: Rate is per ULD container
Time Period Details
Why Multiple Periods? Use multiple time periods when volume or rates change over time (e.g., ramp-up scenarios).

For Each Period:

Period Start/End Date: Date range for this period

First period auto-fills with overall dates
Subsequent periods start day after previous period ends
Frequency of Shipment:

Weekly: Operations every selected day
Once every two weeks: Operations every other occurrence
Once a month: Operations on last occurrence in each 30-day interval
# Customer Positions: Number of ULD positions customer provides

# Amazon Positions: (Only if Customer ULD Type is PMC/PAJ/Others)

Number of ULD positions Amazon provides
Volume per Shipment (cuft): Cubic feet per shipment

Weight per Shipment (lbs): Pounds per shipment

Rate (USD): Rate based on unit of measurement selected

Revenue per Shipment (USD): Total revenue per shipment

Days of Shipment: Select all days operations occur

Hold Ctrl/Cmd to select multiple days
Revenue from Ancillary Services (USD): Additional services revenue

Ancillary Revenue Covered Under Revenue per Shipment:

Yes: Ancillary already included in revenue per shipment
No: Ancillary is additional to revenue per shipment
Adding More Periods:

Click "+ Add Time Period" to add another period
Useful for volume ramp-ups or rate changes
Section 3: Ancillary Services
Select which ancillary services apply:

Build @Origin: ULD building at origin

No / Yes-AFN / Yes-3P
Break @Destination: ULD breakdown at destination

No / Yes-AFN / Yes-3P
Linehaul: Ground transportation

No / Yes
Cost per Linehaul Movement (USD): Cost per linehaul trip

Screening: Security screening

No / Yes
Cost per Screening Event (USD): Cost per screening

Primeflight CVG: Primeflight services at CVG

Cargoforce ULD Movement: ULD movement services

Section 4: Holiday Impact
Default Holidays Included:

July 3-4, 2026
November 6, 25-27, 2026
December 24-25, 31, 2026
For Each Holiday:

Revenue and Volume on Holiday is Zero:

Yes: No operations on this holiday
No: Operations occur with custom values
If "No" (Operations Occur):

Enter custom values for the holiday:
Customer Positions
Amazon Positions (if applicable)
Volume per Shipment
Weight per Shipment
Revenue per Shipment
Ancillary Revenue
Ancillary Covered status
Apply to All Feature:

Configure first holiday
Select "Yes" in "Apply same selection to all anticipated holidays"
All holidays will use the same configuration
Important: Holidays override frequency settings!

If frequency says "no operations" but holiday says "yes with values" → Operations occur
If frequency says "yes operations" but holiday says "zero" → No operations
Charter Opportunity Input
Section 1: General Details
Same as BSA (Sales Person, Customer, Opportunity Type = "Charter")

Section 2: Opportunity Details
Basic Information
Route: Format AAA-BBB-CCC (e.g., JFK-ORD-LAX)

Overall Start/End Date: Operation period (Apr 1 - Dec 31, 2026)

Charter Type:

Domestic: Within country
International: Cross-border
Ferry Leg: Empty positioning flight (e.g., AAA-BBB)

Carrier: Select carrier

21Air / ATSG / Other
Gauge: Aircraft type

767-300 / 767-600 / A330
Time Period Details
For Each Period:

Period Start/End Date: Date range for this period

Frequency of Operations:

Weekly / Once every two weeks / Once a month
# Rotations per Day: Number of round trips per day

Default: 1
Example: 2 rotations = 2 complete round trips
Revenue per Rotation (USD): Revenue for one round trip

Revenue from Ancillary Services per Rotation (USD): Additional services per rotation

Ancillary Revenue Covered Under Revenue per Rotation:

Yes: Ancillary included in revenue per rotation
No: Ancillary is additional
Days of Operations: Select all days operations occur

Revenue Calculation:

If Ancillary NOT Covered:
Total Daily Revenue = (Revenue per Rotation + Ancillary per Rotation) × Rotations per Day

If Ancillary IS Covered:
Total Daily Revenue = Revenue per Rotation × Rotations per Day
Example:

Revenue per Rotation: $50,000
Ancillary per Rotation: $10,000 (NOT covered)
Rotations per Day: 2
Total Daily Revenue = ($50,000 + $10,000) × 2 = $120,000
Section 3: Ancillary Services
Build @Origin: No / Yes-AFN / Yes-3P
Break @Destination: No / Yes-AFN / Yes-3P
Linehaul: No / Yes
Cost per Linehaul Movement (USD)
Screening: No / Yes
Cost per Screening Event (USD)
WFS CVG: WFS services at CVG
Section 4: Holiday Impact
Note: For international charters, consider holidays at non-US gateways

For Each Holiday:

Revenue on Holiday is Zero:

Yes: No operations
No: Operations with custom values
If "No" (Operations Occur):

Rotations per Day on Holiday
Revenue per Rotation on Holiday
Revenue from Ancillary Services per Rotation
Ancillary Covered status
Understanding Frequency Options
Weekly
Operations occur every week on selected days
Example: Every Tuesday and Thursday
Once Every Two Weeks (Biweekly)
Operations occur every other week on selected days
System tracks occurrences and includes 1st, 3rd, 5th... occurrences
Example: If you select Tuesday, operations occur on 1st Tuesday, 3rd Tuesday, 5th Tuesday, etc.
Once a Month
Operations occur on the last occurrence of selected day in each 30-day interval
30-day intervals start from period start date
Clock resets every 30 days regardless of holidays
Example: If period starts April 1 and you select Tuesday:
Interval 1 (Apr 1-30): Last Tuesday in this range
Interval 2 (May 1-30): Last Tuesday in this range
And so on...
Important: Monthly frequency requires at least 30 days in the interval. If less than 30 days remain, no operations occur.

Holiday Configuration
Understanding Holiday Behavior
Holidays ALWAYS Override Frequency:

If frequency says "no operations" but holiday says "yes" → Operations occur
If frequency says "yes operations" but holiday says "zero" → No operations
Holiday values replace period values when both say "yes"
Configuration Options
Option 1: No Operations on Holiday
Select "Revenue and Volume on Holiday is Zero" = Yes
All values will be zero on this date
Use for: Complete closures, non-working holidays
Option 2: Custom Operations on Holiday
Select "Revenue and Volume on Holiday is Zero" = No
Enter custom values for the holiday
Use for: Reduced operations, special holiday schedules
Option 3: Apply to All Holidays
Configure the first holiday
Select "Yes" in "Apply same selection to all anticipated holidays"
All holidays will inherit the same configuration
Saves time when all holidays have similar impact
Best Practices
Review each holiday individually if operations vary
Use "Apply to All" if all holidays have same impact (e.g., all zero)
Consider international holidays for Charter operations
Document assumptions about holiday operations for your records
Viewing Daily Plans
BSA Daily Plan View
Columns Displayed:

Date, Day, Sales Person, Customer
Route and Legs (1-4)
Capacity Type, Shipment Type
Customer ULD Type, Amazon ULD Type
Customer Positions, # Amazon Positions
Volume, Weight, Rate Unit, Rate
Revenue per Shipment
Ancillary services details
Ancillary Revenue, Ancillary Covered
Total Revenue
Filtering:

Filter by Sales Person, Customer, or Route
Click "Apply Filter" to filter
Click "Clear" to reset
Charter Daily Plan View
Columns Displayed:

Date, Day, Sales Person, Customer
Route and Legs (1-4)
Charter Type, Ferry Leg, Carrier, Gauge
Rotations per Day
Revenue per Rotation
Revenue from Ancillary Services per Rotation
Ancillary Covered
Ancillary services details
Total Revenue
Filtering:

Same as BSA (Sales Person, Customer, Route)
Consolidated View
Summary Cards:

Total Revenue (BSA + Charter)
BSA Revenue
Charter Revenue
Total Ancillary Revenue
Total Volume, Weight, Shipments, Rotations
Tables:

Revenue by Customer & Route: Grouped summary
Revenue by Month: April - December 2026
Revenue by Week: Weekly breakdown
Filtering:

Filter by Sales Person, Customer, or Opportunity Type
View specific segments of your portfolio
Exporting Data
Export Process
Click "Export to CSV" button (top right)
Select filters (optional):
Sales Person
Customer
Opportunity Type (BSA/Charter/Both)
Click "Export CSV"
File downloads automatically
Export File Contents
File Name: air-cargo-daily-plan-YYYY-MM-DD.csv

Includes ALL columns from daily plan views:

BSA: All 31 columns
Charter: All 25 columns
Date range: April 1 - December 31, 2026
Use Cases:

Import into Excel for analysis
Share with operations team
Create presentations
Financial forecasting
Tips & Best Practices
Data Entry
Start with Overall Dates

Set overall start/end dates first
First period auto-fills with these dates
Use Multiple Periods Strategically

Ramp-up scenarios: Period 1 (low volume) → Period 2 (high volume)
Rate changes: Period 1 (promotional rate) → Period 2 (standard rate)
Don't create unnecessary periods
Route Format

Always use 3-letter airport codes
Use hyphens to separate: JFK-ORD-LAX
Tool automatically creates legs
Days of Shipment

Hold Ctrl (Windows) or Cmd (Mac) to select multiple days
Select all applicable days for the period
Overlapping Periods

Tool allows overlapping periods
Values are aggregated (added together)
Use intentionally for complex scenarios
Tool will warn you about overlaps
Holiday Configuration
Review Default Holidays

Tool includes major US holidays
Verify they apply to your customer
International Considerations

For Charter, consider destination country holidays
Add custom holidays if needed
Document Assumptions

Keep notes on why you configured holidays certain ways
Helps with future planning cycles
Validation
Check Your Math

Revenue per Shipment should align with Weight × Rate (if per Lb)
Total Revenue = Revenue per Shipment (+ Ancillary if not covered)
Review Daily Plan

After submitting, check BSA/Charter Daily Plan tab
Verify operations appear on expected dates
Check frequency is working correctly
Use Filters

Filter by your name to see only your opportunities
Easier to review and validate
Data Management
Save Regularly

Data saves automatically in browser
But export CSV backups periodically
Edit vs. New Entry

Use "Edit" button to modify existing entries
Don't create duplicates
Delete Carefully

Deleted entries cannot be recovered
Export before deleting if unsure
Troubleshooting
Common Issues
"At least one time period is required"
Cause: Trying to remove the only period
Solution: Keep at least one period per opportunity
"Please fix the following errors: Period X: Start date must be before end date"
Cause: End date is before start date
Solution: Check dates and correct the order
"Dates must be within planning period (April 1 - December 31, 2026)"
Cause: Dates outside allowed range
Solution: Use dates within Apr 1 - Dec 31, 2026
"No data to export with selected filters"
Cause: Filters exclude all data
Solution: Clear filters or adjust filter criteria
Operations not appearing on expected dates
Cause: Frequency or holiday configuration
Solution:
Check frequency setting (weekly/biweekly/monthly)
Check if date is a holiday with zero operations
Remember: Holidays override frequency
Rate seems incorrect
Cause: Rate is calculated from total revenue / weight
Solution:
When multiple periods overlap, rate = total revenue / total weight
This is correct behavior for aggregated values
Amazon ULD Type field not appearing
Cause: Customer ULD Type not set to PMC/PAJ/Others
Solution: Select PMC, PAJ, or Others in Customer ULD Type
Getting Help
If you encounter issues:

Check this SOP first
Review the HOLIDAY_FREQUENCY_INTERACTION.md document
Contact your manager or IT support
Export your data before making major changes
Appendix A: Quick Reference
BSA Input Checklist
 Sales Person Name
 Customer Name
 Opportunity Type = BSA
 Route (AAA-BBB format)
 Overall Start/End Dates
 Capacity Type
 Shipment Type
 Customer ULD Type
 Amazon ULD Type (if needed)
 Rate Unit of Measurement
 At least one Time Period configured
 Days of Shipment selected
 Ancillary Services configured
 Holidays reviewed
Charter Input Checklist
 Sales Person Name
 Customer Name
 Opportunity Type = Charter
 Route (AAA-BBB format)
 Overall Start/End Dates
 Charter Type
 Ferry Leg (if applicable)
 Carrier
 Gauge
 At least one Time Period configured
 Rotations per Day
 Days of Operations selected
 Ancillary Services configured
 Holidays reviewed (including international)
Frequency Quick Guide
Frequency	Behavior	Example
Weekly	Every selected day	Every Tuesday
Biweekly	Every other occurrence	1st, 3rd, 5th Tuesday
Monthly	Last occurrence in 30-day intervals	Last Tuesday of each 30-day period
Holiday Override Rules
Frequency Says	Holiday Says	Result
NO operations	YES with values	Operations occur (holiday values)
YES operations	ZERO	No operations
YES operations	YES with values	Operations occur (holiday values)
NO operations	ZERO	No operations
Document Control
Version History:

v1.0 (Jan 23, 2026): Initial release
Review Schedule: Quarterly

Feedback: Submit feedback to your manager for SOP improvements

End of SOP
