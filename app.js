// Data storage
let salesInputs = JSON.parse(localStorage.getItem('salesInputs')) || [];
let dailyPlan = JSON.parse(localStorage.getItem('dailyPlan')) || [];
let editingInputId = null;
let bsaPeriodCounter = 0;
let charterPeriodCounter = 0;

// Planning period constants - Use UTC to avoid timezone issues
const PLAN_START_DATE = new Date(Date.UTC(2026, 3, 1)); // April 1, 2026 UTC
const PLAN_END_DATE = new Date(Date.UTC(2026, 11, 31)); // December 31, 2026 UTC

// Helper function to create UTC date from date string
function createUTCDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}

// Helper function to get days difference using UTC
function getDaysDifference(date1, date2) {
    const utc1 = Date.UTC(date1.getUTCFullYear(), date1.getUTCMonth(), date1.getUTCDate());
    const utc2 = Date.UTC(date2.getUTCFullYear(), date2.getUTCMonth(), date2.getUTCDate());
    return Math.floor((utc1 - utc2) / (1000 * 60 * 60 * 24));
}

// Helper function to validate and parse number
function parseNumber(value, defaultValue = 0) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
}

// Helper function to validate date range
function validateDateRange(startDate, endDate, fieldName = 'Date') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const planStart = new Date('2026-04-01');
    const planEnd = new Date('2026-12-31');
    
    if (start > end) {
        return `${fieldName}: Start date must be before end date`;
    }
    
    if (start < planStart || end > planEnd) {
        return `${fieldName}: Dates must be within planning period (April 1 - December 31, 2026)`;
    }
    
    return null; // Valid
}

// Helper function to check for overlapping periods
function checkOverlappingPeriods(periods) {
    const overlaps = [];
    for (let i = 0; i < periods.length; i++) {
        for (let j = i + 1; j < periods.length; j++) {
            const start1 = new Date(periods[i].startDate);
            const end1 = new Date(periods[i].endDate);
            const start2 = new Date(periods[j].startDate);
            const end2 = new Date(periods[j].endDate);
            
            // Check if periods overlap
            if (start1 <= end2 && start2 <= end1) {
                overlaps.push({ period1: i + 1, period2: j + 1 });
            }
        }
    }
    return overlaps;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeForm();
    renderInputsList();
    renderBsaDailyPlan();
    renderCharterDailyPlan();
    renderConsolidated();
});

// Tab management
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });
}

// Form initialization
function initializeForm() {
    const form = document.getElementById('salesInputForm');
    const opportunityType = document.getElementById('opportunityType');
    const bsaSection = document.getElementById('bsaSection');
    const ancillarySection = document.getElementById('ancillarySection');
    const bsaHolidaySection = document.getElementById('bsaHolidaySection');
    const charterSection = document.getElementById('charterSection');
    const charterAncillarySection = document.getElementById('charterAncillarySection');
    const charterHolidaySection = document.getElementById('charterHolidaySection');
    
    // Show/hide sections based on opportunity type
    opportunityType.addEventListener('change', (e) => {
        if (e.target.value === 'BSA') {
            bsaSection.style.display = 'block';
            ancillarySection.style.display = 'block';
            bsaHolidaySection.style.display = 'block';
            charterSection.style.display = 'none';
            charterAncillarySection.style.display = 'none';
            charterHolidaySection.style.display = 'none';
            setBSAFieldsRequired(true);
            setCharterFieldsRequired(false);
        } else if (e.target.value === 'Charter') {
            charterSection.style.display = 'block';
            charterAncillarySection.style.display = 'block';
            charterHolidaySection.style.display = 'block';
            bsaSection.style.display = 'none';
            ancillarySection.style.display = 'none';
            bsaHolidaySection.style.display = 'none';
            setCharterFieldsRequired(true);
            setBSAFieldsRequired(false);
        } else {
            bsaSection.style.display = 'none';
            ancillarySection.style.display = 'none';
            bsaHolidaySection.style.display = 'none';
            charterSection.style.display = 'none';
            charterAncillarySection.style.display = 'none';
            charterHolidaySection.style.display = 'none';
            setBSAFieldsRequired(false);
            setCharterFieldsRequired(false);
        }
    });
    
    form.addEventListener('submit', handleFormSubmit);
    
    document.getElementById('exportBtn').addEventListener('click', showExportModal);
    document.getElementById('confirmExport').addEventListener('click', exportData);
    document.querySelector('.close').addEventListener('click', closeExportModal);
    
    document.getElementById('consolidateBtn').addEventListener('click', () => {
        document.querySelector('[data-tab="consolidated"]').click();
    });
    
    document.getElementById('applyBsaFilter').addEventListener('click', applyBsaFilters);
    document.getElementById('clearBsaFilter').addEventListener('click', clearBsaFilters);
    document.getElementById('applyCharterFilter').addEventListener('click', applyCharterFilters);
    document.getElementById('clearCharterFilter').addEventListener('click', clearCharterFilters);
    document.getElementById('applyConsolidatedFilter').addEventListener('click', applyConsolidatedFilters);
    document.getElementById('clearConsolidatedFilter').addEventListener('click', clearConsolidatedFilters);
    
    // Period management
    document.getElementById('addBsaPeriod').addEventListener('click', addBsaPeriod);
    document.getElementById('addCharterPeriod').addEventListener('click', addCharterPeriod);
    
    // Holiday management
    document.getElementById('addBsaAnticipatedHoliday').addEventListener('click', () => addBsaHoliday('anticipated', '', 'New Holiday'));
    document.getElementById('addCharterAnticipatedHoliday').addEventListener('click', () => addCharterHoliday('anticipated', '', 'New Holiday'));
    
    // Add listeners for overall date changes to update first period
    document.getElementById('startDate').addEventListener('change', updateBsaFirstPeriodDates);
    document.getElementById('endDate').addEventListener('change', updateBsaFirstPeriodDates);
    document.getElementById('charterStartDate').addEventListener('change', updateCharterFirstPeriodDates);
    document.getElementById('charterEndDate').addEventListener('change', updateCharterFirstPeriodDates);
    
    // Add listener for Customer ULD Type to show/hide Amazon ULD Type
    document.getElementById('customerUldType').addEventListener('change', toggleAmazonUldType);
    
    // Add initial periods and holidays
    setTimeout(() => {
        addBsaPeriod();
        addCharterPeriod();
        initializeDefaultHolidays();
    }, 0);
}

function toggleAmazonUldType() {
    const customerUldType = document.getElementById('customerUldType').value;
    const amazonUldTypeRow = document.getElementById('amazonUldTypeRow');
    const amazonUldTypeField = document.getElementById('amazonUldType');
    
    if (customerUldType === 'PMC' || customerUldType === 'PAJ' || customerUldType === 'Others') {
        amazonUldTypeRow.style.display = 'block';
        amazonUldTypeField.required = true;
        
        // Show Amazon Positions fields in all periods
        document.querySelectorAll('.bsa-period-amazon-positions-row').forEach(row => {
            row.style.display = 'block';
            const input = row.querySelector('.bsa-period-amazon-positions');
            if (input) input.required = true;
        });
        
        // Show Amazon Positions fields in all holidays
        document.querySelectorAll('.bsa-holiday-amazon-positions-group').forEach(group => {
            group.style.display = 'block';
            const input = group.querySelector('.bsa-holiday-amazon-positions');
            if (input) input.required = false; // Not required since holiday values are optional
        });
    } else {
        amazonUldTypeRow.style.display = 'none';
        amazonUldTypeField.required = false;
        amazonUldTypeField.value = '';
        
        // Hide Amazon Positions fields in all periods
        document.querySelectorAll('.bsa-period-amazon-positions-row').forEach(row => {
            row.style.display = 'none';
            const input = row.querySelector('.bsa-period-amazon-positions');
            if (input) {
                input.required = false;
                input.value = '';
            }
        });
        
        // Hide Amazon Positions fields in all holidays
        document.querySelectorAll('.bsa-holiday-amazon-positions-group').forEach(group => {
            group.style.display = 'none';
            const input = group.querySelector('.bsa-holiday-amazon-positions');
            if (input) {
                input.required = false;
                input.value = '';
            }
        });
    }
}

function setBSAFieldsRequired(required) {
    const bsaFields = ['route', 'startDate', 'endDate', 'capacityType', 'shipmentType', 'customerUldType', 'rateUnit'];
    
    bsaFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.required = required;
        }
    });
}

function setCharterFieldsRequired(required) {
    const charterFields = ['charterRoute', 'charterStartDate', 'charterEndDate', 'charterType',
                           'carrier', 'gauge'];
    
    charterFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.required = required;
        }
    });
}

// Add BSA period
function addBsaPeriod() {
    const container = document.getElementById('bsaPeriodsContainer');
    const periodId = bsaPeriodCounter++;
    const isFirstPeriod = container.children.length === 0;
    
    const periodCard = document.createElement('div');
    periodCard.className = 'period-card';
    periodCard.id = `bsaPeriod${periodId}`;
    periodCard.innerHTML = `
        <div class="period-card-header">
            <h5>Time Period ${periodId + 1}</h5>
            <button type="button" class="btn-remove-period" onclick="removeBsaPeriod(${periodId})">Remove</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Period Start Date *</label>
                <input type="date" class="bsa-period-start" data-period="${periodId}">
            </div>
            <div class="form-group">
                <label>Period End Date *</label>
                <input type="date" class="bsa-period-end" data-period="${periodId}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Frequency of Shipment *</label>
                <select class="bsa-period-frequency" data-period="${periodId}">
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Once every two weeks</option>
                    <option value="monthly">Once a month</option>
                </select>
            </div>
            <div class="form-group">
                <label># Customer Positions *</label>
                <input type="number" class="bsa-period-customer-positions" data-period="${periodId}" min="1" step="1">
            </div>
        </div>
        <div class="form-row bsa-period-amazon-positions-row" data-period="${periodId}" style="display:none;">
            <div class="form-group">
                <label># Amazon Positions *</label>
                <input type="number" class="bsa-period-amazon-positions" data-period="${periodId}" min="1" step="1">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Volume per Shipment (cuft) *</label>
                <input type="number" class="bsa-period-volume" data-period="${periodId}" step="0.01">
            </div>
            <div class="form-group">
                <label>Weight per Shipment (lbs) *</label>
                <input type="number" class="bsa-period-weight" data-period="${periodId}" step="0.01">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Rate (USD) *</label>
                <input type="number" class="bsa-period-rate" data-period="${periodId}" step="0.01">
            </div>
            <div class="form-group">
                <label>Revenue per Shipment (USD) *</label>
                <input type="number" class="bsa-period-revenue" data-period="${periodId}" step="0.01">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Days of Shipment *</label>
                <select class="bsa-period-days" data-period="${periodId}" multiple size="7">
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                </select>
                <small>Hold Ctrl/Cmd to select multiple days</small>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Revenue from Ancillary Services (USD)</label>
                <input type="number" class="bsa-period-ancillary" data-period="${periodId}" step="0.01" value="0">
            </div>
            <div class="form-group">
                <label>Ancillary Revenue Covered Under Revenue per Shipment</label>
                <select class="bsa-period-ancillary-covered" data-period="${periodId}">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
        </div>
    `;
    
    container.appendChild(periodCard);
    
    // Check if Amazon Positions should be shown based on Customer ULD Type
    const customerUldType = document.getElementById('customerUldType').value;
    const amazonPositionsRow = periodCard.querySelector('.bsa-period-amazon-positions-row');
    if (customerUldType === 'PMC' || customerUldType === 'PAJ' || customerUldType === 'Others') {
        amazonPositionsRow.style.display = 'block';
        const input = amazonPositionsRow.querySelector('.bsa-period-amazon-positions');
        if (input) input.required = true;
    } else {
        amazonPositionsRow.style.display = 'none';
        const input = amazonPositionsRow.querySelector('.bsa-period-amazon-positions');
        if (input) input.required = false;
    }
    
    // Set default dates for new periods
    if (!isFirstPeriod) {
        // Find the last period's end date
        const allPeriods = container.querySelectorAll('.period-card');
        if (allPeriods.length > 1) {
            const lastPeriod = allPeriods[allPeriods.length - 2];
            const lastEndDate = lastPeriod.querySelector('.bsa-period-end').value;
            
            if (lastEndDate) {
                // Set start date to next day after last period's end date
                const nextDay = new Date(lastEndDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const startInput = periodCard.querySelector('.bsa-period-start');
                startInput.value = nextDay.toISOString().split('T')[0];
            }
        }
        
        // Set end date to overall end date
        const overallEnd = document.getElementById('endDate').value;
        if (overallEnd) {
            const endInput = periodCard.querySelector('.bsa-period-end');
            endInput.value = overallEnd;
        }
    }
    
    // If this is the first period, sync with overall dates
    if (isFirstPeriod) {
        updateBsaFirstPeriodDates();
    }
}

// Update BSA first period dates from overall dates
function updateBsaFirstPeriodDates() {
    const overallStart = document.getElementById('startDate').value;
    const overallEnd = document.getElementById('endDate').value;
    const firstPeriodStart = document.querySelector('.bsa-period-start[data-period="0"]');
    const firstPeriodEnd = document.querySelector('.bsa-period-end[data-period="0"]');
    
    if (firstPeriodStart && overallStart) {
        firstPeriodStart.value = overallStart;
    }
    if (firstPeriodEnd && overallEnd) {
        firstPeriodEnd.value = overallEnd;
    }
}

// Remove BSA period
function removeBsaPeriod(periodId) {
    const periodCard = document.getElementById(`bsaPeriod${periodId}`);
    if (periodCard) {
        // Don't allow removing if it's the only period
        const container = document.getElementById('bsaPeriodsContainer');
        if (container.children.length > 1) {
            periodCard.remove();
        } else {
            alert('At least one time period is required.');
        }
    }
}

// Add Charter period
function addCharterPeriod() {
    const container = document.getElementById('charterPeriodsContainer');
    const periodId = charterPeriodCounter++;
    const isFirstPeriod = container.children.length === 0;
    
    const periodCard = document.createElement('div');
    periodCard.className = 'period-card';
    periodCard.id = `charterPeriod${periodId}`;
    periodCard.innerHTML = `
        <div class="period-card-header">
            <h5>Time Period ${periodId + 1}</h5>
            <button type="button" class="btn-remove-period" onclick="removeCharterPeriod(${periodId})">Remove</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Period Start Date *</label>
                <input type="date" class="charter-period-start" data-period="${periodId}">
            </div>
            <div class="form-group">
                <label>Period End Date *</label>
                <input type="date" class="charter-period-end" data-period="${periodId}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Frequency of Operations *</label>
                <select class="charter-period-frequency" data-period="${periodId}">
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Once every two weeks</option>
                    <option value="monthly">Once a month</option>
                </select>
            </div>
            <div class="form-group">
                <label># Rotations per Day *</label>
                <input type="number" class="charter-period-rotations" data-period="${periodId}" min="1" step="1" value="1">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Revenue per Rotation (USD) *</label>
                <input type="number" class="charter-period-revenue" data-period="${periodId}" step="0.01">
            </div>
            <div class="form-group">
                <label>Revenue from Ancillary Services per Rotation (USD)</label>
                <input type="number" class="charter-period-ancillary" data-period="${periodId}" step="0.01" value="0">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Ancillary Revenue Covered Under Revenue per Rotation</label>
                <select class="charter-period-ancillary-covered" data-period="${periodId}">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Days of Operations *</label>
                <select class="charter-period-days" data-period="${periodId}" multiple size="7">
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                </select>
                <small>Hold Ctrl/Cmd to select multiple days</small>
            </div>
        </div>
    `;
    
    container.appendChild(periodCard);
    
    // Set default dates for new periods
    if (!isFirstPeriod) {
        // Find the last period's end date
        const allPeriods = container.querySelectorAll('.period-card');
        if (allPeriods.length > 1) {
            const lastPeriod = allPeriods[allPeriods.length - 2];
            const lastEndDate = lastPeriod.querySelector('.charter-period-end').value;
            
            if (lastEndDate) {
                // Set start date to next day after last period's end date
                const nextDay = new Date(lastEndDate);
                nextDay.setDate(nextDay.getDate() + 1);
                const startInput = periodCard.querySelector('.charter-period-start');
                startInput.value = nextDay.toISOString().split('T')[0];
            }
        }
        
        // Set end date to overall end date
        const overallEnd = document.getElementById('charterEndDate').value;
        if (overallEnd) {
            const endInput = periodCard.querySelector('.charter-period-end');
            endInput.value = overallEnd;
        }
    }
    
    // If this is the first period, sync with overall dates
    if (isFirstPeriod) {
        updateCharterFirstPeriodDates();
    }
}

// Update Charter first period dates from overall dates
function updateCharterFirstPeriodDates() {
    const overallStart = document.getElementById('charterStartDate').value;
    const overallEnd = document.getElementById('charterEndDate').value;
    const firstPeriodStart = document.querySelector('.charter-period-start[data-period="0"]');
    const firstPeriodEnd = document.querySelector('.charter-period-end[data-period="0"]');
    
    if (firstPeriodStart && overallStart) {
        firstPeriodStart.value = overallStart;
    }
    if (firstPeriodEnd && overallEnd) {
        firstPeriodEnd.value = overallEnd;
    }
}

// Initialize default holidays
let bsaHolidayCounter = 0;
let charterHolidayCounter = 0;

const anticipatedHolidayDates = [
    { value: '2026-07-03', label: '03 JULY 2026' },
    { value: '2026-07-04', label: '04 JULY 2026' },
    { value: '2026-11-06', label: '06 NOV 2026: RME Closure' },
    { value: '2026-11-25', label: '25 NOV 2026' },
    { value: '2026-11-26', label: '26 NOV 2026' },
    { value: '2026-11-27', label: '27 NOV 2026' },
    { value: '2026-12-24', label: '24 DEC 2026' },
    { value: '2026-12-25', label: '25 DEC 2026' },
    { value: '2026-12-31', label: '31 DEC 2026' }
];

function initializeDefaultHolidays() {
    // Add default anticipated holidays for BSA
    anticipatedHolidayDates.forEach((holiday, index) => {
        addBsaHoliday('anticipated', holiday.value, holiday.label, index);
    });
    
    // Add default anticipated holidays for Charter
    anticipatedHolidayDates.forEach((holiday, index) => {
        addCharterHoliday('anticipated', holiday.value, holiday.label, index);
    });
}

// Add BSA holiday
function addBsaHoliday(type, defaultDate = '', defaultLabel = '', index = -1) {
    const container = document.getElementById(type === 'anticipated' ? 'bsaAnticipatedHolidaysContainer' : 'bsaAdditionalHolidaysContainer');
    const holidayId = bsaHolidayCounter++;
    const isFirstHoliday = index === 0;
    
    const holidayCard = document.createElement('div');
    holidayCard.className = 'period-card';
    holidayCard.id = `bsaHoliday${type}${holidayId}`;
    
    let dateInput = '';
    if (type === 'anticipated' && defaultDate) {
        dateInput = `<input type="date" class="bsa-holiday-date" data-holiday="${holidayId}" data-type="${type}" value="${defaultDate}" readonly style="background: #f0f0f0;">
                     <small>${defaultLabel}</small>`;
    } else {
        dateInput = `<input type="date" class="bsa-holiday-date" data-holiday="${holidayId}" data-type="${type}">`;
    }
    
    const applyToAllSection = isFirstHoliday ? `
        <div class="form-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
            <div class="form-group">
                <label>Apply same selection to all anticipated holidays</label>
                <select id="bsaApplyToAll" onchange="applyBsaHolidayToAll()">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
        </div>
    ` : '';
    
    holidayCard.innerHTML = `
        <div class="period-card-header">
            <h5>${type === 'anticipated' ? defaultLabel || 'Anticipated Holiday' : 'Additional Holiday'}</h5>
            <button type="button" class="btn-remove-period" onclick="removeBsaHoliday('${type}', ${holidayId})">Remove</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Holiday Date</label>
                ${dateInput}
            </div>
            <div class="form-group">
                <label>Revenue and Volume on Holiday is Zero</label>
                <select class="bsa-holiday-zero" data-holiday="${holidayId}" data-type="${type}" onchange="toggleBsaHolidayValues(${holidayId}, '${type}')">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
        </div>
        <div id="bsaHolidayValues${holidayId}" style="display:none;">
            <div class="form-row">
                <div class="form-group">
                    <label># Customer Positions on Holiday</label>
                    <input type="number" class="bsa-holiday-customer-positions" data-holiday="${holidayId}" data-type="${type}" min="1" step="1">
                </div>
                <div class="form-group bsa-holiday-amazon-positions-group" data-holiday="${holidayId}" style="display:none;">
                    <label># Amazon Positions on Holiday</label>
                    <input type="number" class="bsa-holiday-amazon-positions" data-holiday="${holidayId}" data-type="${type}" min="1" step="1">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Volume per Shipment on Holiday (cuft)</label>
                    <input type="number" class="bsa-holiday-volume" data-holiday="${holidayId}" data-type="${type}" step="0.01">
                </div>
                <div class="form-group">
                    <label>Weight per Shipment on Holiday (lbs)</label>
                    <input type="number" class="bsa-holiday-weight" data-holiday="${holidayId}" data-type="${type}" step="0.01">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Revenue per Shipment on Holiday (USD)</label>
                    <input type="number" class="bsa-holiday-revenue" data-holiday="${holidayId}" data-type="${type}" step="0.01">
                </div>
                <div class="form-group">
                    <label>Revenue from Ancillary Services (USD)</label>
                    <input type="number" class="bsa-holiday-ancillary" data-holiday="${holidayId}" data-type="${type}" step="0.01" value="0">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Ancillary Revenue Covered Under Revenue per Shipment</label>
                    <select class="bsa-holiday-ancillary-covered" data-holiday="${holidayId}" data-type="${type}">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
            </div>
        </div>
        ${applyToAllSection}
    `;
    
    container.appendChild(holidayCard);
    
    // Check if Amazon Positions should be shown based on Customer ULD Type
    const customerUldType = document.getElementById('customerUldType');
    if (customerUldType) {
        const customerUldTypeValue = customerUldType.value;
        const amazonPositionsGroup = holidayCard.querySelector('.bsa-holiday-amazon-positions-group');
        if (amazonPositionsGroup) {
            if (customerUldTypeValue === 'PMC' || customerUldTypeValue === 'PAJ' || customerUldTypeValue === 'Others') {
                amazonPositionsGroup.style.display = 'block';
            } else {
                amazonPositionsGroup.style.display = 'none';
            }
        }
    }
}

function applyBsaHolidayToAll() {
    const applyToAll = document.getElementById('bsaApplyToAll');
    if (!applyToAll || applyToAll.value !== 'Yes') return;
    
    // Get values from first holiday
    const firstHolidayZero = document.querySelector('.bsa-holiday-zero[data-type="anticipated"]');
    if (!firstHolidayZero) return;
    
    const firstHolidayId = firstHolidayZero.dataset.holiday;
    const zeroValue = firstHolidayZero.value;
    
    // Get all other anticipated holidays
    const allZeroSelects = document.querySelectorAll('.bsa-holiday-zero[data-type="anticipated"]');
    
    allZeroSelects.forEach(select => {
        if (select.dataset.holiday !== firstHolidayId) {
            select.value = zeroValue;
            toggleBsaHolidayValues(select.dataset.holiday, 'anticipated');
            
            if (zeroValue === 'No') {
                // Copy values from first holiday
                const firstCustomerPositions = document.querySelector(`.bsa-holiday-customer-positions[data-holiday="${firstHolidayId}"]`);
                const firstAmazonPositions = document.querySelector(`.bsa-holiday-amazon-positions[data-holiday="${firstHolidayId}"]`);
                const firstVolume = document.querySelector(`.bsa-holiday-volume[data-holiday="${firstHolidayId}"]`);
                const firstWeight = document.querySelector(`.bsa-holiday-weight[data-holiday="${firstHolidayId}"]`);
                const firstRevenue = document.querySelector(`.bsa-holiday-revenue[data-holiday="${firstHolidayId}"]`);
                const firstAncillary = document.querySelector(`.bsa-holiday-ancillary[data-holiday="${firstHolidayId}"]`);
                const firstCovered = document.querySelector(`.bsa-holiday-ancillary-covered[data-holiday="${firstHolidayId}"]`);
                
                const targetCustomerPositions = document.querySelector(`.bsa-holiday-customer-positions[data-holiday="${select.dataset.holiday}"]`);
                const targetAmazonPositions = document.querySelector(`.bsa-holiday-amazon-positions[data-holiday="${select.dataset.holiday}"]`);
                const targetVolume = document.querySelector(`.bsa-holiday-volume[data-holiday="${select.dataset.holiday}"]`);
                const targetWeight = document.querySelector(`.bsa-holiday-weight[data-holiday="${select.dataset.holiday}"]`);
                const targetRevenue = document.querySelector(`.bsa-holiday-revenue[data-holiday="${select.dataset.holiday}"]`);
                const targetAncillary = document.querySelector(`.bsa-holiday-ancillary[data-holiday="${select.dataset.holiday}"]`);
                const targetCovered = document.querySelector(`.bsa-holiday-ancillary-covered[data-holiday="${select.dataset.holiday}"]`);
                
                if (firstCustomerPositions && targetCustomerPositions) targetCustomerPositions.value = firstCustomerPositions.value;
                if (firstAmazonPositions && targetAmazonPositions) targetAmazonPositions.value = firstAmazonPositions.value;
                if (firstVolume && targetVolume) targetVolume.value = firstVolume.value;
                if (firstWeight && targetWeight) targetWeight.value = firstWeight.value;
                if (firstRevenue && targetRevenue) targetRevenue.value = firstRevenue.value;
                if (firstAncillary && targetAncillary) targetAncillary.value = firstAncillary.value;
                if (firstCovered && targetCovered) targetCovered.value = firstCovered.value;
            }
        }
    });
}

function toggleBsaHolidayValues(holidayId, type) {
    const select = document.querySelector(`.bsa-holiday-zero[data-holiday="${holidayId}"][data-type="${type}"]`);
    const valuesSection = document.getElementById(`bsaHolidayValues${holidayId}`);
    
    if (select && valuesSection) {
        valuesSection.style.display = select.value === 'No' ? 'block' : 'none';
    }
}

function removeBsaHoliday(type, holidayId) {
    const holidayCard = document.getElementById(`bsaHoliday${type}${holidayId}`);
    if (holidayCard) {
        holidayCard.remove();
    }
}

// Add Charter holiday
function addCharterHoliday(type, defaultDate = '', defaultLabel = '', index = -1) {
    const container = document.getElementById(type === 'anticipated' ? 'charterAnticipatedHolidaysContainer' : 'charterAdditionalHolidaysContainer');
    const holidayId = charterHolidayCounter++;
    const isFirstHoliday = index === 0;
    
    const holidayCard = document.createElement('div');
    holidayCard.className = 'period-card';
    holidayCard.id = `charterHoliday${type}${holidayId}`;
    
    let dateInput = '';
    if (type === 'anticipated' && defaultDate) {
        dateInput = `<input type="date" class="charter-holiday-date" data-holiday="${holidayId}" data-type="${type}" value="${defaultDate}" readonly style="background: #f0f0f0;">
                     <small>${defaultLabel}</small>`;
    } else {
        dateInput = `<input type="date" class="charter-holiday-date" data-holiday="${holidayId}" data-type="${type}">`;
    }
    
    const applyToAllSection = isFirstHoliday ? `
        <div class="form-row" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
            <div class="form-group">
                <label>Apply same selection to all anticipated holidays</label>
                <select id="charterApplyToAll" onchange="applyCharterHolidayToAll()">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
        </div>
    ` : '';
    
    holidayCard.innerHTML = `
        <div class="period-card-header">
            <h5>${type === 'anticipated' ? defaultLabel || 'Anticipated Holiday' : 'Additional Holiday'}</h5>
            <button type="button" class="btn-remove-period" onclick="removeCharterHoliday('${type}', ${holidayId})">Remove</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Holiday Date</label>
                ${dateInput}
            </div>
            <div class="form-group">
                <label>Revenue on Holiday is Zero</label>
                <select class="charter-holiday-zero" data-holiday="${holidayId}" data-type="${type}" onchange="toggleCharterHolidayValues(${holidayId}, '${type}')">
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                </select>
            </div>
        </div>
        <div id="charterHolidayValues${holidayId}" style="display:none;">
            <div class="form-row">
                <div class="form-group">
                    <label># Rotations per Day on Holiday</label>
                    <input type="number" class="charter-holiday-rotations" data-holiday="${holidayId}" data-type="${type}" min="1" step="1" value="1">
                </div>
                <div class="form-group">
                    <label>Revenue per Rotation on Holiday (USD)</label>
                    <input type="number" class="charter-holiday-revenue" data-holiday="${holidayId}" data-type="${type}" step="0.01">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Revenue from Ancillary Services per Rotation (USD)</label>
                    <input type="number" class="charter-holiday-ancillary" data-holiday="${holidayId}" data-type="${type}" step="0.01" value="0">
                </div>
                <div class="form-group">
                    <label>Ancillary Revenue Covered Under Revenue per Rotation</label>
                    <select class="charter-holiday-ancillary-covered" data-holiday="${holidayId}" data-type="${type}">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
            </div>
        </div>
        ${applyToAllSection}
    `;
    
    container.appendChild(holidayCard);
}

function applyCharterHolidayToAll() {
    const applyToAll = document.getElementById('charterApplyToAll');
    if (!applyToAll || applyToAll.value !== 'Yes') return;
    
    // Get values from first holiday
    const firstHolidayZero = document.querySelector('.charter-holiday-zero[data-type="anticipated"]');
    if (!firstHolidayZero) return;
    
    const firstHolidayId = firstHolidayZero.dataset.holiday;
    const zeroValue = firstHolidayZero.value;
    
    // Get all other anticipated holidays
    const allZeroSelects = document.querySelectorAll('.charter-holiday-zero[data-type="anticipated"]');
    
    allZeroSelects.forEach(select => {
        if (select.dataset.holiday !== firstHolidayId) {
            select.value = zeroValue;
            toggleCharterHolidayValues(select.dataset.holiday, 'anticipated');
            
            if (zeroValue === 'No') {
                // Copy values from first holiday
                const firstRevenue = document.querySelector(`.charter-holiday-revenue[data-holiday="${firstHolidayId}"]`);
                const firstAncillary = document.querySelector(`.charter-holiday-ancillary[data-holiday="${firstHolidayId}"]`);
                const firstCovered = document.querySelector(`.charter-holiday-ancillary-covered[data-holiday="${firstHolidayId}"]`);
                
                const targetRevenue = document.querySelector(`.charter-holiday-revenue[data-holiday="${select.dataset.holiday}"]`);
                const targetAncillary = document.querySelector(`.charter-holiday-ancillary[data-holiday="${select.dataset.holiday}"]`);
                const targetCovered = document.querySelector(`.charter-holiday-ancillary-covered[data-holiday="${select.dataset.holiday}"]`);
                
                if (firstRevenue && targetRevenue) targetRevenue.value = firstRevenue.value;
                if (firstAncillary && targetAncillary) targetAncillary.value = firstAncillary.value;
                if (firstCovered && targetCovered) targetCovered.value = firstCovered.value;
            }
        }
    });
}

function toggleCharterHolidayValues(holidayId, type) {
    const select = document.querySelector(`.charter-holiday-zero[data-holiday="${holidayId}"][data-type="${type}"]`);
    const valuesSection = document.getElementById(`charterHolidayValues${holidayId}`);
    
    if (select && valuesSection) {
        valuesSection.style.display = select.value === 'No' ? 'block' : 'none';
    }
}

function removeCharterHoliday(type, holidayId) {
    const holidayCard = document.getElementById(`charterHoliday${type}${holidayId}`);
    if (holidayCard) {
        holidayCard.remove();
    }
}

// Remove Charter period
function removeCharterPeriod(periodId) {
    const periodCard = document.getElementById(`charterPeriod${periodId}`);
    if (periodCard) {
        // Don't allow removing if it's the only period
        const container = document.getElementById('charterPeriodsContainer');
        if (container.children.length > 1) {
            periodCard.remove();
        } else {
            alert('At least one time period is required.');
        }
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        console.log('Form submitted');
        
        const opportunityType = document.getElementById('opportunityType').value;
        
        console.log('Opportunity Type:', opportunityType);
        
        // Validation errors array
        const validationErrors = [];
        
        const input = {
            id: editingInputId || Date.now(),
            salesPerson: document.getElementById('salesPerson').value,
            customer: document.getElementById('customer').value,
            opportunityType: opportunityType
        };
    
    // Add BSA-specific fields
    if (opportunityType === 'BSA') {
        // Validate overall date range
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        const dateError = validateDateRange(startDate, endDate, 'Overall Date Range');
        if (dateError) validationErrors.push(dateError);
        
        // Collect holidays from individual holiday cards
        const holidays = [];
        const holidayDates = document.querySelectorAll('.bsa-holiday-date[data-type="anticipated"]');
        
        holidayDates.forEach(dateInput => {
            const holidayId = dateInput.dataset.holiday;
            const holidayDate = dateInput.value;
            const zeroSelect = document.querySelector(`.bsa-holiday-zero[data-holiday="${holidayId}"][data-type="anticipated"]`);
            
            if (holidayDate && zeroSelect) {
                const holidayConfig = {
                    date: holidayDate,
                    isZero: zeroSelect.value === 'Yes'
                };
                
                if (zeroSelect.value === 'No') {
                    const customerPositionsInput = document.querySelector(`.bsa-holiday-customer-positions[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const amazonPositionsInput = document.querySelector(`.bsa-holiday-amazon-positions[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const volumeInput = document.querySelector(`.bsa-holiday-volume[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const weightInput = document.querySelector(`.bsa-holiday-weight[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const revenueInput = document.querySelector(`.bsa-holiday-revenue[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const ancillaryInput = document.querySelector(`.bsa-holiday-ancillary[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const coveredSelect = document.querySelector(`.bsa-holiday-ancillary-covered[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    
                    holidayConfig.customerPositions = customerPositionsInput ? parseInt(customerPositionsInput.value) || 0 : 0;
                    holidayConfig.amazonPositions = amazonPositionsInput ? parseInt(amazonPositionsInput.value) || 0 : 0;
                    holidayConfig.volume = volumeInput ? parseFloat(volumeInput.value) || 0 : 0;
                    holidayConfig.weight = weightInput ? parseFloat(weightInput.value) || 0 : 0;
                    holidayConfig.revenue = revenueInput ? parseFloat(revenueInput.value) || 0 : 0;
                    holidayConfig.ancillaryRevenue = ancillaryInput ? parseFloat(ancillaryInput.value) || 0 : 0;
                    holidayConfig.ancillaryCovered = coveredSelect ? coveredSelect.value : 'No';
                }
                
                holidays.push(holidayConfig);
            }
        });
        
        input.holidays = holidays;
        
        input.route = document.getElementById('route').value.toUpperCase();
        input.startDate = document.getElementById('startDate').value;
        input.endDate = document.getElementById('endDate').value;
        input.capacityType = document.getElementById('capacityType').value;
        input.shipmentType = document.getElementById('shipmentType').value;
        input.customerUldType = document.getElementById('customerUldType').value;
        input.amazonUldType = document.getElementById('amazonUldType').value;
        input.rateUnit = document.getElementById('rateUnit').value;
        
        // Collect all BSA periods
        const periods = [];
        const periodStarts = document.querySelectorAll('.bsa-period-start');
        periodStarts.forEach((startInput, index) => {
            const periodId = startInput.dataset.period;
            const endInput = document.querySelector(`.bsa-period-end[data-period="${periodId}"]`);
            
            // Validate period date range
            const periodDateError = validateDateRange(startInput.value, endInput.value, `Period ${index + 1}`);
            if (periodDateError) validationErrors.push(periodDateError);
            
            const frequencySelect = document.querySelector(`.bsa-period-frequency[data-period="${periodId}"]`);
            const customerPositionsInput = document.querySelector(`.bsa-period-customer-positions[data-period="${periodId}"]`);
            const amazonPositionsInput = document.querySelector(`.bsa-period-amazon-positions[data-period="${periodId}"]`);
            const volumeInput = document.querySelector(`.bsa-period-volume[data-period="${periodId}"]`);
            const weightInput = document.querySelector(`.bsa-period-weight[data-period="${periodId}"]`);
            const rateInput = document.querySelector(`.bsa-period-rate[data-period="${periodId}"]`);
            const daysSelect = document.querySelector(`.bsa-period-days[data-period="${periodId}"]`);
            const revenueInput = document.querySelector(`.bsa-period-revenue[data-period="${periodId}"]`);
            const ancillaryInput = document.querySelector(`.bsa-period-ancillary[data-period="${periodId}"]`);
            const ancillaryCoveredSelect = document.querySelector(`.bsa-period-ancillary-covered[data-period="${periodId}"]`);
            
            const selectedDays = Array.from(daysSelect.selectedOptions).map(opt => opt.value);
            
            // Validate numeric inputs
            const customerPositions = parseNumber(customerPositionsInput.value);
            const amazonPositions = parseNumber(amazonPositionsInput ? amazonPositionsInput.value : 0);
            const volume = parseNumber(volumeInput.value);
            const weight = parseNumber(weightInput.value);
            const rate = parseNumber(rateInput.value);
            const revenue = parseNumber(revenueInput.value);
            const ancillary = parseNumber(ancillaryInput.value);
            
            if (customerPositions <= 0) validationErrors.push(`Period ${index + 1}: Customer Positions must be greater than 0`);
            if (volume < 0) validationErrors.push(`Period ${index + 1}: Volume cannot be negative`);
            if (weight < 0) validationErrors.push(`Period ${index + 1}: Weight cannot be negative`);
            if (rate < 0) validationErrors.push(`Period ${index + 1}: Rate cannot be negative`);
            if (revenue < 0) validationErrors.push(`Period ${index + 1}: Revenue cannot be negative`);
            
            periods.push({
                startDate: startInput.value,
                endDate: endInput.value,
                frequency: frequencySelect.value,
                customerPositions: customerPositions,
                amazonPositions: amazonPositions,
                volume: volume,
                weight: weight,
                rate: rate,
                daysOfShipment: selectedDays,
                revenuePerShipment: revenue,
                ancillaryRevenue: ancillary,
                ancillaryCovered: ancillaryCoveredSelect.value
            });
        });
        
        // Check for overlapping periods and warn user
        const overlaps = checkOverlappingPeriods(periods);
        if (overlaps.length > 0) {
            const overlapMsg = overlaps.map(o => `Period ${o.period1} and Period ${o.period2}`).join(', ');
            const confirmOverlap = confirm(`Warning: The following periods overlap: ${overlapMsg}.\n\nValues will be aggregated for overlapping dates. Do you want to continue?`);
            if (!confirmOverlap) return;
        }
        
        // Show validation errors if any
        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
            return;
        }
        
        input.periods = periods;
        input.buildOrigin = document.getElementById('buildOrigin').value;
        input.breakDestination = document.getElementById('breakDestination').value;
        input.linehaul = document.getElementById('linehaul').value;
        input.linehaulCost = parseNumber(document.getElementById('linehaulCost').value);
        input.screening = document.getElementById('screening').value;
        input.screeningCost = parseNumber(document.getElementById('screeningCost').value);
        input.primeflightCVG = document.getElementById('primeflightCVG').value;
        input.cargoforceULD = document.getElementById('cargoforceULD').value;
    }
    
    // Add Charter-specific fields
    if (opportunityType === 'Charter') {
        // Validate overall date range
        const startDate = document.getElementById('charterStartDate').value;
        const endDate = document.getElementById('charterEndDate').value;
        const dateError = validateDateRange(startDate, endDate, 'Overall Date Range');
        if (dateError) validationErrors.push(dateError);
        
        // Collect holidays from individual holiday cards
        const holidays = [];
        const holidayDates = document.querySelectorAll('.charter-holiday-date[data-type="anticipated"]');
        
        holidayDates.forEach(dateInput => {
            const holidayId = dateInput.dataset.holiday;
            const holidayDate = dateInput.value;
            const zeroSelect = document.querySelector(`.charter-holiday-zero[data-holiday="${holidayId}"][data-type="anticipated"]`);
            
            if (holidayDate && zeroSelect) {
                const holidayConfig = {
                    date: holidayDate,
                    isZero: zeroSelect.value === 'Yes'
                };
                
                if (zeroSelect.value === 'No') {
                    const rotationsInput = document.querySelector(`.charter-holiday-rotations[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const revenueInput = document.querySelector(`.charter-holiday-revenue[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const ancillaryInput = document.querySelector(`.charter-holiday-ancillary[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    const coveredSelect = document.querySelector(`.charter-holiday-ancillary-covered[data-holiday="${holidayId}"][data-type="anticipated"]`);
                    
                    holidayConfig.rotationsPerDay = parseNumber(rotationsInput ? rotationsInput.value : 1, 1);
                    holidayConfig.revenue = parseNumber(revenueInput ? revenueInput.value : 0);
                    holidayConfig.ancillaryRevenue = parseNumber(ancillaryInput ? ancillaryInput.value : 0);
                    holidayConfig.ancillaryCovered = coveredSelect ? coveredSelect.value : 'No';
                }
                
                holidays.push(holidayConfig);
            }
        });
        
        input.holidays = holidays;
        
        input.route = document.getElementById('charterRoute').value.toUpperCase();
        input.startDate = document.getElementById('charterStartDate').value;
        input.endDate = document.getElementById('charterEndDate').value;
        input.charterType = document.getElementById('charterType').value;
        input.ferryLeg = document.getElementById('ferryLeg').value.toUpperCase();
        input.carrier = document.getElementById('carrier').value;
        input.gauge = document.getElementById('gauge').value;
        
        // Collect all Charter periods
        const periods = [];
        const periodStarts = document.querySelectorAll('.charter-period-start');
        periodStarts.forEach((startInput, index) => {
            const periodId = startInput.dataset.period;
            const endInput = document.querySelector(`.charter-period-end[data-period="${periodId}"]`);
            
            // Validate period date range
            const periodDateError = validateDateRange(startInput.value, endInput.value, `Period ${index + 1}`);
            if (periodDateError) validationErrors.push(periodDateError);
            
            const frequencySelect = document.querySelector(`.charter-period-frequency[data-period="${periodId}"]`);
            const daysSelect = document.querySelector(`.charter-period-days[data-period="${periodId}"]`);
            const rotationsInput = document.querySelector(`.charter-period-rotations[data-period="${periodId}"]`);
            const revenueInput = document.querySelector(`.charter-period-revenue[data-period="${periodId}"]`);
            const ancillaryInput = document.querySelector(`.charter-period-ancillary[data-period="${periodId}"]`);
            const ancillaryCoveredSelect = document.querySelector(`.charter-period-ancillary-covered[data-period="${periodId}"]`);
            
            const selectedDays = Array.from(daysSelect.selectedOptions).map(opt => opt.value);
            
            // Validate numeric inputs
            const rotations = parseNumber(rotationsInput.value, 1);
            const revenue = parseNumber(revenueInput.value);
            const ancillary = parseNumber(ancillaryInput.value);
            
            if (rotations <= 0) validationErrors.push(`Period ${index + 1}: Rotations per Day must be greater than 0`);
            if (revenue < 0) validationErrors.push(`Period ${index + 1}: Revenue cannot be negative`);
            
            periods.push({
                startDate: startInput.value,
                endDate: endInput.value,
                frequency: frequencySelect.value,
                daysOfOperation: selectedDays,
                rotationsPerDay: rotations,
                revenuePerRotation: revenue,
                ancillaryRevenue: ancillary,
                ancillaryCovered: ancillaryCoveredSelect.value
            });
        });
        
        // Check for overlapping periods and warn user
        const overlaps = checkOverlappingPeriods(periods);
        if (overlaps.length > 0) {
            const overlapMsg = overlaps.map(o => `Period ${o.period1} and Period ${o.period2}`).join(', ');
            const confirmOverlap = confirm(`Warning: The following periods overlap: ${overlapMsg}.\n\nValues will be aggregated for overlapping dates. Do you want to continue?`);
            if (!confirmOverlap) return;
        }
        
        // Show validation errors if any
        if (validationErrors.length > 0) {
            alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
            return;
        }
        
        input.periods = periods;
        input.buildOrigin = document.getElementById('charterBuildOrigin').value;
        input.breakDestination = document.getElementById('charterBreakDestination').value;
        input.linehaul = document.getElementById('charterLinehaul').value;
        input.linehaulCost = parseNumber(document.getElementById('charterLinehaulCost').value);
        input.screening = document.getElementById('charterScreening').value;
        input.screeningCost = parseNumber(document.getElementById('charterScreeningCost').value);
        input.wfsCVG = document.getElementById('charterWfsCVG').value;
    }
    
    if (editingInputId) {
        const index = salesInputs.findIndex(i => i.id === editingInputId);
        if (index !== -1) {
            salesInputs[index] = input;
        }
        dailyPlan = dailyPlan.filter(plan => plan.inputId !== editingInputId);
        editingInputId = null;
    } else {
        salesInputs.push(input);
    }
    
    localStorage.setItem('salesInputs', JSON.stringify(salesInputs));
    
    if (opportunityType === 'BSA' || opportunityType === 'Charter') {
        generateDailyPlan(input);
    }
    
    e.target.reset();
    renderInputsList();
    renderBsaDailyPlan();
    renderCharterDailyPlan();
    renderConsolidated();
    populateFilterOptions();
    
    alert(editingInputId ? 'Input updated successfully!' : 'Input added successfully!');
    } catch (error) {
        console.error('Error in form submission:', error);
        alert('Error: ' + error.message);
    }
}

function generateDailyPlan(input) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    
    // Build holiday map from new structure
    const holidayMap = {};
    if (input.holidays && input.holidays.length > 0) {
        input.holidays.forEach(holiday => {
            holidayMap[holiday.date] = holiday;
        });
    }
    
    // Generate for entire planning period (Apr 1 - Dec 31, 2026)
    let currentDate = new Date(PLAN_START_DATE);
    
    // April 1, 2026 is a Wednesday (day 3) - Use UTC to avoid timezone issues
    const APRIL_1_2026_DAY = 3; // Wednesday
    const APRIL_1_2026 = new Date(Date.UTC(2026, 3, 1)); // April 1, 2026 UTC
    
    // Track occurrence counts for biweekly and monthly frequencies per period
    const periodOccurrenceCounts = {};
    
    // Ensure we include December 31 by using <= comparison
    const endDateInclusive = new Date(PLAN_END_DATE);
    endDateInclusive.setUTCHours(23, 59, 59, 999);
    
    while (currentDate <= endDateInclusive) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isInRange = currentDate >= startDate && currentDate <= endDate;
        const holidayConfig = holidayMap[dateStr];
        const isHoliday = !!holidayConfig;
        
        // Calculate correct day of week using UTC to avoid timezone issues
        const daysDiff = getDaysDifference(currentDate, APRIL_1_2026);
        const dayOfWeek = (APRIL_1_2026_DAY + daysDiff) % 7;
        
        // Get day name
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = dayNames[dayOfWeek];
        
        // Find ALL applicable periods for this date (to handle overlaps)
        const applicablePeriods = [];
        if (input.periods && input.periods.length > 0) {
            for (let i = 0; i < input.periods.length; i++) {
                const period = input.periods[i];
                const periodStart = new Date(period.startDate);
                const periodEnd = new Date(period.endDate);
                if (currentDate >= periodStart && currentDate <= periodEnd) {
                    applicablePeriods.push({ ...period, periodIndex: i });
                }
            }
        }
        
        // Parse route into legs (each leg is AAA-BBB format)
        const routeParts = input.route ? input.route.split('-') : [];
        let leg1 = '', leg2 = '', leg3 = '', leg4 = '';
        
        if (routeParts.length >= 2) {
            leg1 = `${routeParts[0]}-${routeParts[1]}`;
        }
        if (routeParts.length >= 3) {
            leg2 = `${routeParts[1]}-${routeParts[2]}`;
        }
        if (routeParts.length >= 4) {
            leg3 = `${routeParts[2]}-${routeParts[3]}`;
        }
        if (routeParts.length >= 5) {
            leg4 = `${routeParts[3]}-${routeParts[4]}`;
        }
        
        if (input.opportunityType === 'BSA') {
            let customerPositions = 0, amazonPositions = 0, volume = 0, weight = 0, rate = 0, revenuePerShipment = 0, ancillaryRevenue = 0, totalRevenue = 0;
            let capacityType = input.capacityType;
            let shipmentType = input.shipmentType;
            let customerUldType = input.customerUldType;
            let amazonUldType = input.amazonUldType;
            let buildOrigin = input.buildOrigin;
            let breakDestination = input.breakDestination;
            let wfsLinehaul = input.wfsLinehaul;
            let otherLinehaul = input.otherLinehaul;
            let screening = input.screening;
            let primeflightCVG = input.primeflightCVG;
            let cargoforceULD = input.cargoforceULD;
            let ancillaryCovered = 'No';
            
            let hasAnyOperation = false;
            
            // Check for holiday with special values
            if (isHoliday && holidayConfig && !holidayConfig.isZero && isInRange) {
                customerPositions = holidayConfig.customerPositions || 0;
                amazonPositions = holidayConfig.amazonPositions || 0;
                volume = holidayConfig.volume || 0;
                weight = holidayConfig.weight || 0;
                revenuePerShipment = holidayConfig.revenue || 0;
                ancillaryRevenue = holidayConfig.ancillaryRevenue || 0;
                
                if (holidayConfig.ancillaryCovered === 'Yes') {
                    totalRevenue = revenuePerShipment;
                } else {
                    totalRevenue = revenuePerShipment + ancillaryRevenue;
                }
                
                // Calculate rate based on total revenue and weight
                rate = weight > 0 ? totalRevenue / weight : 0;
                
                ancillaryCovered = holidayConfig.ancillaryCovered || 'No';
                hasAnyOperation = true;
            } else if (!isHoliday && isInRange && applicablePeriods.length > 0) {
                // Process all applicable periods and aggregate values
                for (const period of applicablePeriods) {
                    const selectedDays = (period.daysOfShipment || []).map(d => parseInt(d));
                    
                    if (selectedDays.includes(dayOfWeek)) {
                        // Check frequency
                        let shouldIncludeForFrequency = false;
                        const periodKey = `${input.id}-${period.periodIndex}`;
                        
                        if (!periodOccurrenceCounts[periodKey]) {
                            periodOccurrenceCounts[periodKey] = {};
                        }
                        
                        if (period.frequency === 'weekly') {
                            shouldIncludeForFrequency = true;
                        } else if (period.frequency === 'biweekly') {
                            // Track occurrences per day of week
                            if (!periodOccurrenceCounts[periodKey][dayOfWeek]) {
                                periodOccurrenceCounts[periodKey][dayOfWeek] = 0;
                            }
                            // Include every other occurrence
                            if (periodOccurrenceCounts[periodKey][dayOfWeek] % 2 === 0) {
                                shouldIncludeForFrequency = true;
                            }
                            periodOccurrenceCounts[periodKey][dayOfWeek]++;
                        } else if (period.frequency === 'monthly') {
                            // Monthly: Last occurrence of selected day in every 30-day interval from period start
                            // The clock resets regardless of whether the expected day is a holiday
                            const periodStart = new Date(period.startDate);
                            const periodEnd = new Date(period.endDate);
                            const daysSinceStart = getDaysDifference(currentDate, periodStart);
                            
                            // Determine which 30-day interval we're in
                            const intervalIndex = Math.floor(daysSinceStart / 30);
                            const intervalStart = new Date(periodStart);
                            intervalStart.setDate(intervalStart.getDate() + (intervalIndex * 30));
                            const intervalEnd = new Date(intervalStart);
                            intervalEnd.setDate(intervalEnd.getDate() + 29); // 30 days total (0-29)
                            
                            // Make sure interval end doesn't exceed period end
                            if (intervalEnd > periodEnd) {
                                intervalEnd.setTime(periodEnd.getTime());
                            }
                            
                            // Check if this interval is at least 30 days
                            const intervalDays = getDaysDifference(intervalEnd, intervalStart) + 1;
                            
                            if (intervalDays >= 30) {
                                // Find the last occurrence of this day of week in this interval
                                let lastOccurrence = null;
                                let checkDate = new Date(intervalStart);
                                
                                while (checkDate <= intervalEnd) {
                                    const checkDayOfWeek = (APRIL_1_2026_DAY + getDaysDifference(checkDate, APRIL_1_2026)) % 7;
                                    if (checkDayOfWeek === dayOfWeek) {
                                        lastOccurrence = new Date(checkDate);
                                    }
                                    checkDate.setDate(checkDate.getDate() + 1);
                                }
                                
                                // Check if current date is the last occurrence
                                // The clock resets regardless of holiday, so we don't skip to next date
                                if (lastOccurrence && currentDate.getTime() === lastOccurrence.getTime()) {
                                    shouldIncludeForFrequency = true;
                                }
                            }
                            // If interval is less than 30 days, no operations (shouldIncludeForFrequency stays false)
                        }
                        
                        if (shouldIncludeForFrequency) {
                            // Aggregate values from this period
                            customerPositions += period.customerPositions;
                            amazonPositions += period.amazonPositions || 0;
                            volume += period.volume;
                            weight += period.weight;
                            // Don't aggregate rate - will calculate after aggregation
                            revenuePerShipment += period.revenuePerShipment;
                            ancillaryRevenue += period.ancillaryRevenue || 0;
                            
                            if (period.ancillaryCovered === 'Yes') {
                                totalRevenue += period.revenuePerShipment;
                            } else {
                                totalRevenue += period.revenuePerShipment + (period.ancillaryRevenue || 0);
                            }
                            
                            ancillaryCovered = period.ancillaryCovered;
                            hasAnyOperation = true;
                        }
                    }
                }
                
                // Calculate rate based on aggregated total revenue and weight
                rate = weight > 0 ? totalRevenue / weight : 0;
            }
            
            dailyPlan.push({
                id: `${input.id}-${dateStr}`,
                inputId: input.id,
                date: dateStr,
                day: dayName,
                salesPerson: input.salesPerson,
                customer: input.customer,
                opportunityType: input.opportunityType,
                route: input.route,
                leg1: leg1,
                leg2: leg2,
                leg3: leg3,
                leg4: leg4,
                capacityType: capacityType,
                shipmentType: shipmentType,
                customerUldType: customerUldType,
                amazonUldType: amazonUldType,
                rateUnit: input.rateUnit,
                customerPositions: customerPositions,
                amazonPositions: amazonPositions,
                volume: volume,
                weight: weight,
                rate: rate,
                revenuePerShipment: revenuePerShipment,
                ancillaryRevenue: ancillaryRevenue,
                totalRevenue: totalRevenue,
                buildOrigin: buildOrigin,
                breakDestination: breakDestination,
                linehaul: input.linehaul,
                linehaulCost: input.linehaulCost,
                screening: screening,
                screeningCost: input.screeningCost,
                primeflightCVG: primeflightCVG,
                cargoforceULD: cargoforceULD,
                ancillaryCovered: ancillaryCovered
            });
        } else if (input.opportunityType === 'Charter') {
            let charterType = input.charterType;
            let ferryLeg = input.ferryLeg;
            let carrier = input.carrier;
            let gauge = input.gauge;
            let rotationsPerDay = 0;
            let revenuePerRotation = 0;
            let ancillaryRevenuePerRotation = 0;
            let totalRevenue = 0;
            let buildOrigin = input.buildOrigin;
            let breakDestination = input.breakDestination;
            let linehaul = input.linehaul;
            let screening = input.screening;
            let wfsCVG = input.wfsCVG;
            let ancillaryCovered = 'No';
            
            // Check for holiday with special values
            if (isHoliday && holidayConfig && !holidayConfig.isZero && isInRange) {
                rotationsPerDay = holidayConfig.rotationsPerDay || 1;
                revenuePerRotation = holidayConfig.revenue || 0;
                ancillaryRevenuePerRotation = holidayConfig.ancillaryRevenue || 0;
                
                // Calculate total revenue with rotations per day
                if (holidayConfig.ancillaryCovered === 'Yes') {
                    totalRevenue = revenuePerRotation * rotationsPerDay;
                } else {
                    totalRevenue = (revenuePerRotation + ancillaryRevenuePerRotation) * rotationsPerDay;
                }
                
                ancillaryCovered = holidayConfig.ancillaryCovered || 'No';
            } else if (!isHoliday && isInRange && applicablePeriods.length > 0) {
                // Process all applicable periods and aggregate values
                for (const period of applicablePeriods) {
                    const selectedDays = (period.daysOfOperation || []).map(d => parseInt(d));
                    
                    if (selectedDays.includes(dayOfWeek)) {
                        // Check frequency
                        let shouldIncludeForFrequency = false;
                        const periodKey = `${input.id}-${period.periodIndex}`;
                        
                        if (!periodOccurrenceCounts[periodKey]) {
                            periodOccurrenceCounts[periodKey] = {};
                        }
                        
                        if (period.frequency === 'weekly') {
                            shouldIncludeForFrequency = true;
                        } else if (period.frequency === 'biweekly') {
                            if (!periodOccurrenceCounts[periodKey][dayOfWeek]) {
                                periodOccurrenceCounts[periodKey][dayOfWeek] = 0;
                            }
                            if (periodOccurrenceCounts[periodKey][dayOfWeek] % 2 === 0) {
                                shouldIncludeForFrequency = true;
                            }
                            periodOccurrenceCounts[periodKey][dayOfWeek]++;
                        } else if (period.frequency === 'monthly') {
                            // Monthly: Last occurrence of selected day in every 30-day interval from period start
                            // The clock resets regardless of whether the expected day is a holiday
                            const periodStart = new Date(period.startDate);
                            const periodEnd = new Date(period.endDate);
                            const daysSinceStart = getDaysDifference(currentDate, periodStart);
                            
                            // Determine which 30-day interval we're in
                            const intervalIndex = Math.floor(daysSinceStart / 30);
                            const intervalStart = new Date(periodStart);
                            intervalStart.setDate(intervalStart.getDate() + (intervalIndex * 30));
                            const intervalEnd = new Date(intervalStart);
                            intervalEnd.setDate(intervalEnd.getDate() + 29); // 30 days total (0-29)
                            
                            // Make sure interval end doesn't exceed period end
                            if (intervalEnd > periodEnd) {
                                intervalEnd.setTime(periodEnd.getTime());
                            }
                            
                            // Check if this interval is at least 30 days
                            const intervalDays = getDaysDifference(intervalEnd, intervalStart) + 1;
                            
                            if (intervalDays >= 30) {
                                // Find the last occurrence of this day of week in this interval
                                let lastOccurrence = null;
                                let checkDate = new Date(intervalStart);
                                
                                while (checkDate <= intervalEnd) {
                                    const checkDayOfWeek = (APRIL_1_2026_DAY + getDaysDifference(checkDate, APRIL_1_2026)) % 7;
                                    if (checkDayOfWeek === dayOfWeek) {
                                        lastOccurrence = new Date(checkDate);
                                    }
                                    checkDate.setDate(checkDate.getDate() + 1);
                                }
                                
                                // Check if current date is the last occurrence
                                // The clock resets regardless of holiday, so we don't skip to next date
                                if (lastOccurrence && currentDate.getTime() === lastOccurrence.getTime()) {
                                    shouldIncludeForFrequency = true;
                                }
                            }
                            // If interval is less than 30 days, no operations (shouldIncludeForFrequency stays false)
                        }
                        
                        if (shouldIncludeForFrequency) {
                            // Get rotations per day and revenue values
                            const periodRotations = period.rotationsPerDay || 1;
                            const periodRevenue = period.revenuePerRotation || 0;
                            const periodAncillary = period.ancillaryRevenue || 0;
                            
                            // Calculate total revenue for this period
                            let periodTotalRevenue = 0;
                            if (period.ancillaryCovered === 'Yes') {
                                periodTotalRevenue = periodRevenue * periodRotations;
                            } else {
                                periodTotalRevenue = (periodRevenue + periodAncillary) * periodRotations;
                            }
                            
                            // Aggregate values
                            rotationsPerDay += periodRotations;
                            revenuePerRotation += periodRevenue;
                            ancillaryRevenuePerRotation += periodAncillary;
                            totalRevenue += periodTotalRevenue;
                            ancillaryCovered = period.ancillaryCovered;
                        }
                    }
                }
            }
            
            dailyPlan.push({
                id: `${input.id}-${dateStr}`,
                inputId: input.id,
                date: dateStr,
                day: dayName,
                salesPerson: input.salesPerson,
                customer: input.customer,
                opportunityType: input.opportunityType,
                route: input.route,
                leg1: leg1,
                leg2: leg2,
                leg3: leg3,
                leg4: leg4,
                charterType: charterType,
                ferryLeg: ferryLeg,
                carrier: carrier,
                gauge: gauge,
                rotationsPerDay: rotationsPerDay,
                revenuePerRotation: revenuePerRotation,
                ancillaryRevenuePerRotation: ancillaryRevenuePerRotation,
                totalRevenue: totalRevenue,
                buildOrigin: buildOrigin,
                breakDestination: breakDestination,
                linehaul: linehaul,
                linehaulCost: input.linehaulCost,
                screening: screening,
                screeningCost: input.screeningCost,
                wfsCVG: wfsCVG,
                ancillaryCovered: ancillaryCovered
            });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    localStorage.setItem('dailyPlan', JSON.stringify(dailyPlan));
}

// Render inputs list
function renderInputsList() {
    const container = document.getElementById('inputsList');
    
    if (salesInputs.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">No inputs added yet.</p>';
        return;
    }
    
    container.innerHTML = salesInputs.map(input => {
        let daysText = 'N/A';
        if (input.opportunityType === 'BSA' && input.daysOfShipment) {
            daysText = input.daysOfShipment.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ');
        } else if (input.opportunityType === 'Charter' && input.daysOfOperation) {
            daysText = input.daysOfOperation.map(d => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]).join(', ');
        }
        
        return `
        <div class="input-item">
            <div class="input-item-details">
                <strong>${input.customer} - ${input.opportunityType}</strong>
                <div>
                    <span>Sales: ${input.salesPerson}</span>
                    ${input.route ? `<span>Route: ${input.route}</span>` : ''}
                    ${input.startDate ? `<span>Period: ${input.startDate} to ${input.endDate}</span>` : ''}
                    <span>Days: ${daysText}</span>
                    ${input.revenuePerShipment ? `<span>Revenue/Shipment: $${input.revenuePerShipment}</span>` : ''}
                    ${input.revenuePerRotation ? `<span>Revenue/Rotation: $${input.revenuePerRotation}</span>` : ''}
                </div>
            </div>
            <div>
                <button class="btn btn-secondary" onclick="editInput(${input.id})" style="margin-right: 10px;">Edit</button>
                <button class="btn btn-danger" onclick="deleteInput(${input.id})">Delete</button>
            </div>
        </div>
    `;
    }).join('');
}

// Edit input
function editInput(id) {
    const input = salesInputs.find(i => i.id === id);
    if (!input) return;
    
    editingInputId = id;
    
    // Fill general fields
    document.getElementById('salesPerson').value = input.salesPerson;
    document.getElementById('customer').value = input.customer;
    document.getElementById('opportunityType').value = input.opportunityType;
    
    // Trigger change event to show appropriate sections
    document.getElementById('opportunityType').dispatchEvent(new Event('change'));
    
    if (input.opportunityType === 'BSA') {
        document.getElementById('route').value = input.route;
        document.getElementById('startDate').value = input.startDate;
        document.getElementById('endDate').value = input.endDate;
        document.getElementById('capacityType').value = input.capacityType;
        document.getElementById('shipmentType').value = input.shipmentType;
        document.getElementById('uldType').value = input.uldType;
        document.getElementById('positions').value = input.positions;
        document.getElementById('volume').value = input.volume;
        document.getElementById('weight').value = input.weight;
        document.getElementById('rate').value = input.rate;
        document.getElementById('revenuePerShipment').value = input.revenuePerShipment;
        document.getElementById('buildOrigin').value = input.buildOrigin;
        document.getElementById('breakDestination').value = input.breakDestination;
        document.getElementById('wfsLinehaul').value = input.wfsLinehaul;
        document.getElementById('otherLinehaul').value = input.otherLinehaul;
        document.getElementById('screening').value = input.screening;
        document.getElementById('primeflightCVG').value = input.primeflightCVG;
        document.getElementById('cargoforceULD').value = input.cargoforceULD;
        document.getElementById('ancillaryRevenue').value = input.ancillaryRevenue;
        document.getElementById('ancillaryCovered').value = input.ancillaryCovered;
        
        const daysSelect = document.getElementById('daysOfShipment');
        Array.from(daysSelect.options).forEach(opt => {
            opt.selected = input.daysOfShipment.includes(opt.value);
        });
        
        const holidaysSelect = document.getElementById('bsaAnticipatedHolidays');
        Array.from(holidaysSelect.options).forEach(opt => {
            opt.selected = (input.anticipatedHolidays || []).includes(opt.value);
        });
        
        document.getElementById('bsaAdditionalHolidays').value = (input.additionalHolidays || []).join(', ');
    } else if (input.opportunityType === 'Charter') {
        document.getElementById('charterRoute').value = input.route;
        document.getElementById('charterStartDate').value = input.startDate;
        document.getElementById('charterEndDate').value = input.endDate;
        document.getElementById('charterType').value = input.charterType;
        document.getElementById('ferryLeg').value = input.ferryLeg;
        document.getElementById('carrier').value = input.carrier;
        document.getElementById('gauge').value = input.gauge;
        document.getElementById('charterRevenue').value = input.revenuePerRotation;
        document.getElementById('charterBuildOrigin').value = input.buildOrigin;
        document.getElementById('charterBreakDestination').value = input.breakDestination;
        document.getElementById('charterLinehaul').value = input.linehaul;
        document.getElementById('charterScreening').value = input.screening;
        document.getElementById('charterWfsCVG').value = input.wfsCVG;
        document.getElementById('charterAncillaryRevenue').value = input.ancillaryRevenue;
        document.getElementById('charterAncillaryCovered').value = input.ancillaryCovered;
        
        const daysSelect = document.getElementById('charterDaysOfOperation');
        Array.from(daysSelect.options).forEach(opt => {
            opt.selected = input.daysOfOperation.includes(opt.value);
        });
        
        const holidaysSelect = document.getElementById('charterAnticipatedHolidays');
        Array.from(holidaysSelect.options).forEach(opt => {
            opt.selected = (input.anticipatedHolidays || []).includes(opt.value);
        });
        
        document.getElementById('charterAdditionalHolidays').value = (input.additionalHolidays || []).join(', ');
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('Editing input. Modify the fields and click "Add to Plan" to save changes.');
}

// Delete input
function deleteInput(id) {
    if (!confirm('Are you sure you want to delete this input?')) return;
    
    salesInputs = salesInputs.filter(input => input.id !== id);
    dailyPlan = dailyPlan.filter(plan => plan.inputId !== id);
    
    localStorage.setItem('salesInputs', JSON.stringify(salesInputs));
    localStorage.setItem('dailyPlan', JSON.stringify(dailyPlan));
    
    renderInputsList();
    renderBsaDailyPlan();
    renderCharterDailyPlan();
    renderConsolidated();
}

// Render BSA daily plan
function renderBsaDailyPlan(filteredData = null) {
    const container = document.getElementById('bsaDailyPlanTable');
    const bsaData = dailyPlan.filter(p => p.opportunityType === 'BSA');
    const data = filteredData || bsaData;
    
    if (data.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">No BSA daily plan generated yet.</p>';
        return;
    }
    
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const formatValue = (val) => {
        if (typeof val === 'number') return val.toFixed(2);
        return val;
    };
    
    const rows = sortedData.map(plan => `
        <tr>
            <td>${plan.date}</td>
            <td>${plan.day}</td>
            <td>${plan.salesPerson}</td>
            <td>${plan.customer}</td>
            <td>${plan.route}</td>
            <td>${plan.leg1}</td>
            <td>${plan.leg2}</td>
            <td>${plan.leg3}</td>
            <td>${plan.leg4}</td>
            <td>${plan.capacityType}</td>
            <td>${plan.shipmentType}</td>
            <td>${plan.customerUldType}</td>
            <td>${plan.amazonUldType || '-'}</td>
            <td>${formatValue(plan.customerPositions)}</td>
            <td>${formatValue(plan.amazonPositions)}</td>
            <td>${formatValue(plan.volume)}</td>
            <td>${formatValue(plan.weight)}</td>
            <td>${plan.rateUnit || '-'}</td>
            <td>$${formatValue(plan.rate)}</td>
            <td>$${formatValue(plan.revenuePerShipment)}</td>
            <td>${plan.buildOrigin}</td>
            <td>${plan.breakDestination}</td>
            <td>${plan.linehaul}</td>
            <td>${formatValue(plan.linehaulCost)}</td>
            <td>${plan.screening}</td>
            <td>${formatValue(plan.screeningCost)}</td>
            <td>${plan.primeflightCVG}</td>
            <td>${plan.cargoforceULD}</td>
            <td>$${formatValue(plan.ancillaryRevenue)}</td>
            <td>${plan.ancillaryCovered}</td>
            <td>$${formatValue(plan.totalRevenue)}</td>
        </tr>
    `).join('');
    
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Sales Person</th>
                        <th>Customer</th>
                        <th>Route</th>
                        <th>Leg 1</th>
                        <th>Leg 2</th>
                        <th>Leg 3</th>
                        <th>Leg 4</th>
                        <th>Capacity Type</th>
                        <th>Shipment Type</th>
                        <th>Customer ULD Type</th>
                        <th>Amazon ULD Type</th>
                        <th># Customer Positions</th>
                        <th># Amazon Positions</th>
                        <th>Volume (cuft)</th>
                        <th>Weight (lbs)</th>
                        <th>Rate: Unit of Measurement</th>
                        <th>Rate</th>
                        <th>Revenue/Shipment</th>
                        <th>Build @Origin</th>
                        <th>Break @Destination</th>
                        <th>Linehaul</th>
                        <th>Cost per Linehaul Movement</th>
                        <th>Screening</th>
                        <th>Cost per Screening Event</th>
                        <th>Primeflight CVG</th>
                        <th>Cargoforce ULD Movement</th>
                        <th>Ancillary Revenue</th>
                        <th>Ancillary Covered</th>
                        <th>Total Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Render Charter daily plan
function renderCharterDailyPlan(filteredData = null) {
    const container = document.getElementById('charterDailyPlanTable');
    const charterData = dailyPlan.filter(p => p.opportunityType === 'Charter');
    const data = filteredData || charterData;
    
    if (data.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">No Charter daily plan generated yet.</p>';
        return;
    }
    
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const formatValue = (val) => {
        if (typeof val === 'number') return val.toFixed(2);
        return val;
    };
    
    const rows = sortedData.map(plan => `
        <tr>
            <td>${plan.date}</td>
            <td>${plan.day}</td>
            <td>${plan.salesPerson}</td>
            <td>${plan.customer}</td>
            <td>${plan.route}</td>
            <td>${plan.leg1}</td>
            <td>${plan.leg2}</td>
            <td>${plan.leg3}</td>
            <td>${plan.leg4}</td>
            <td>${plan.charterType}</td>
            <td>${plan.ferryLeg}</td>
            <td>${plan.carrier}</td>
            <td>${plan.gauge}</td>
            <td>${formatValue(plan.rotationsPerDay)}</td>
            <td>$${formatValue(plan.revenuePerRotation)}</td>
            <td>$${formatValue(plan.ancillaryRevenuePerRotation)}</td>
            <td>${plan.ancillaryCovered}</td>
            <td>${plan.buildOrigin}</td>
            <td>${plan.breakDestination}</td>
            <td>${plan.linehaul}</td>
            <td>$${formatValue(plan.linehaulCost)}</td>
            <td>${plan.screening}</td>
            <td>$${formatValue(plan.screeningCost)}</td>
            <td>${plan.wfsCVG}</td>
            <td>$${formatValue(plan.totalRevenue)}</td>
        </tr>
    `).join('');
    
    container.innerHTML = `
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Sales Person</th>
                        <th>Customer</th>
                        <th>Route</th>
                        <th>Leg 1</th>
                        <th>Leg 2</th>
                        <th>Leg 3</th>
                        <th>Leg 4</th>
                        <th>Charter Type</th>
                        <th>Ferry Leg</th>
                        <th>Carrier</th>
                        <th>Gauge</th>
                        <th># Rotations per Day</th>
                        <th>Revenue/Rotation</th>
                        <th>Revenue from Ancillary Services per Rotation</th>
                        <th>Ancillary Covered</th>
                        <th>Build @Origin</th>
                        <th>Break @Destination</th>
                        <th>Linehaul</th>
                        <th>Cost per Linehaul Movement</th>
                        <th>Screening</th>
                        <th>Cost per Screening Event</th>
                        <th>WFS CVG</th>
                        <th>Total Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

// Populate filter options
function populateFilterOptions() {
    const bsaInputs = salesInputs.filter(i => i.opportunityType === 'BSA');
    const charterInputs = salesInputs.filter(i => i.opportunityType === 'Charter');
    
    const bsaSalesPersons = [...new Set(bsaInputs.map(i => i.salesPerson))].sort();
    const bsaCustomers = [...new Set(bsaInputs.map(i => i.customer))].sort();
    const bsaRoutes = [...new Set(bsaInputs.map(i => i.route).filter(r => r))].sort();
    
    const charterSalesPersons = [...new Set(charterInputs.map(i => i.salesPerson))].sort();
    const charterCustomers = [...new Set(charterInputs.map(i => i.customer))].sort();
    const charterRoutes = [...new Set(charterInputs.map(i => i.route).filter(r => r))].sort();
    
    const allSalesPersons = [...new Set(salesInputs.map(i => i.salesPerson))].sort();
    const allCustomers = [...new Set(salesInputs.map(i => i.customer))].sort();
    const opportunityTypes = [...new Set(salesInputs.map(i => i.opportunityType))].sort();
    
    // BSA filters
    populateSelect('bsaFilterSalesPerson', bsaSalesPersons, 'All Sales Persons');
    populateSelect('bsaFilterCustomer', bsaCustomers, 'All Customers');
    populateSelect('bsaFilterRoute', bsaRoutes, 'All Routes');
    
    // Charter filters
    populateSelect('charterFilterSalesPerson', charterSalesPersons, 'All Sales Persons');
    populateSelect('charterFilterCustomer', charterCustomers, 'All Customers');
    populateSelect('charterFilterRoute', charterRoutes, 'All Routes');
    
    // Export filters
    populateSelect('exportFilterSalesPerson', allSalesPersons, 'All Sales Persons');
    populateSelect('exportFilterCustomer', allCustomers, 'All Customers');
    populateSelect('exportFilterOpportunityType', opportunityTypes, 'All Opportunity Types');
    
    // Consolidated filters
    populateSelect('consolidatedFilterSalesPerson', allSalesPersons, 'All Sales Persons');
    populateSelect('consolidatedFilterCustomer', allCustomers, 'All Customers');
    populateSelect('consolidatedFilterOpportunityType', opportunityTypes, 'All Opportunity Types');
}

function populateSelect(selectId, options, defaultText) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">${defaultText}</option>`;
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
}

// Apply BSA filters
function applyBsaFilters() {
    const salesPersonFilter = document.getElementById('bsaFilterSalesPerson').value;
    const customerFilter = document.getElementById('bsaFilterCustomer').value;
    const routeFilter = document.getElementById('bsaFilterRoute').value;
    
    let filtered = dailyPlan.filter(p => p.opportunityType === 'BSA');
    
    if (salesPersonFilter) {
        filtered = filtered.filter(p => p.salesPerson === salesPersonFilter);
    }
    
    if (customerFilter) {
        filtered = filtered.filter(p => p.customer === customerFilter);
    }
    
    if (routeFilter) {
        filtered = filtered.filter(p => p.route === routeFilter);
    }
    
    renderBsaDailyPlan(filtered);
}

// Clear BSA filters
function clearBsaFilters() {
    document.getElementById('bsaFilterSalesPerson').value = '';
    document.getElementById('bsaFilterCustomer').value = '';
    document.getElementById('bsaFilterRoute').value = '';
    renderBsaDailyPlan();
}

// Apply Charter filters
function applyCharterFilters() {
    const salesPersonFilter = document.getElementById('charterFilterSalesPerson').value;
    const customerFilter = document.getElementById('charterFilterCustomer').value;
    const routeFilter = document.getElementById('charterFilterRoute').value;
    
    let filtered = dailyPlan.filter(p => p.opportunityType === 'Charter');
    
    if (salesPersonFilter) {
        filtered = filtered.filter(p => p.salesPerson === salesPersonFilter);
    }
    
    if (customerFilter) {
        filtered = filtered.filter(p => p.customer === customerFilter);
    }
    
    if (routeFilter) {
        filtered = filtered.filter(p => p.route === routeFilter);
    }
    
    renderCharterDailyPlan(filtered);
}

// Clear Charter filters
function clearCharterFilters() {
    document.getElementById('charterFilterSalesPerson').value = '';
    document.getElementById('charterFilterCustomer').value = '';
    document.getElementById('charterFilterRoute').value = '';
    renderCharterDailyPlan();
}

// Apply consolidated filters
function applyConsolidatedFilters() {
    const salesPersonFilter = document.getElementById('consolidatedFilterSalesPerson').value;
    const customerFilter = document.getElementById('consolidatedFilterCustomer').value;
    const opportunityTypeFilter = document.getElementById('consolidatedFilterOpportunityType').value;
    
    let filtered = dailyPlan;
    
    if (salesPersonFilter) {
        filtered = filtered.filter(p => p.salesPerson === salesPersonFilter);
    }
    
    if (customerFilter) {
        filtered = filtered.filter(p => p.customer === customerFilter);
    }
    
    if (opportunityTypeFilter) {
        filtered = filtered.filter(p => p.opportunityType === opportunityTypeFilter);
    }
    
    renderConsolidated(filtered);
}

// Clear consolidated filters
function clearConsolidatedFilters() {
    document.getElementById('consolidatedFilterSalesPerson').value = '';
    document.getElementById('consolidatedFilterCustomer').value = '';
    document.getElementById('consolidatedFilterOpportunityType').value = '';
    renderConsolidated();
}

// Render consolidated view
function renderConsolidated(filteredData = null) {
    const data = filteredData || dailyPlan;
    const validData = data.filter(p => typeof p.totalRevenue === 'number' && p.totalRevenue > 0);
    
    // Split by opportunity type
    const bsaData = validData.filter(p => p.opportunityType === 'BSA');
    const charterData = validData.filter(p => p.opportunityType === 'Charter');
    
    // Calculate totals
    const totalRevenue = validData.reduce((sum, p) => sum + p.totalRevenue, 0);
    const bsaRevenue = bsaData.reduce((sum, p) => sum + p.totalRevenue, 0);
    const charterRevenue = charterData.reduce((sum, p) => sum + p.totalRevenue, 0);
    
    const totalAncillaryRevenue = validData.reduce((sum, p) => sum + (p.ancillaryRevenue || 0), 0);
    const bsaAncillaryRevenue = bsaData.reduce((sum, p) => sum + (p.ancillaryRevenue || 0), 0);
    const charterAncillaryRevenue = charterData.reduce((sum, p) => sum + (p.ancillaryRevenue || 0), 0);
    
    const totalVolume = validData.filter(p => typeof p.volume === 'number').reduce((sum, p) => sum + p.volume, 0);
    const totalWeight = validData.filter(p => typeof p.weight === 'number').reduce((sum, p) => sum + p.weight, 0);
    const totalShipments = bsaData.length;
    const totalRotations = charterData.length;
    
    // Update summary cards
    document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    document.getElementById('bsaRevenue').textContent = `$${bsaRevenue.toFixed(2)}`;
    document.getElementById('charterRevenue').textContent = `$${charterRevenue.toFixed(2)}`;
    document.getElementById('totalAncillaryRevenue').textContent = `$${totalAncillaryRevenue.toFixed(2)}`;
    document.getElementById('bsaAncillaryRevenue').textContent = `$${bsaAncillaryRevenue.toFixed(2)}`;
    document.getElementById('charterAncillaryRevenue').textContent = `$${charterAncillaryRevenue.toFixed(2)}`;
    document.getElementById('totalVolume').textContent = `${totalVolume.toFixed(2)} cuft`;
    document.getElementById('totalWeight').textContent = `${totalWeight.toFixed(2)} lbs`;
    document.getElementById('totalShipments').textContent = totalShipments;
    document.getElementById('totalRotations').textContent = totalRotations;
    
    // Group by customer and route
    const grouped = {};
    validData.forEach(plan => {
        const key = `${plan.customer}|${plan.route}|${plan.opportunityType}`;
        if (!grouped[key]) {
            grouped[key] = {
                customer: plan.customer,
                route: plan.route,
                opportunityType: plan.opportunityType,
                count: 0,
                volume: 0,
                weight: 0,
                revenue: 0,
                ancillaryRevenue: 0
            };
        }
        grouped[key].count++;
        if (typeof plan.volume === 'number') grouped[key].volume += plan.volume;
        if (typeof plan.weight === 'number') grouped[key].weight += plan.weight;
        grouped[key].revenue += plan.totalRevenue;
        if (typeof plan.ancillaryRevenue === 'number') grouped[key].ancillaryRevenue += plan.ancillaryRevenue;
    });
    
    const consolidatedData = Object.values(grouped);
    
    const container = document.getElementById('consolidatedTable');
    
    if (consolidatedData.length === 0) {
        container.innerHTML = '<p style="color: #7f8c8d;">No data to consolidate.</p>';
    } else {
        container.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Route</th>
                            <th>Opportunity Type</th>
                            <th>Total Shipments/Rotations</th>
                            <th>Total Volume (cuft)</th>
                            <th>Total Weight (lbs)</th>
                            <th>Total Ancillary Revenue</th>
                            <th>Total Revenue (USD)</th>
                            <th>Avg Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${consolidatedData.map(item => `
                            <tr>
                                <td>${item.customer}</td>
                                <td>${item.route}</td>
                                <td>${item.opportunityType}</td>
                                <td>${item.count}</td>
                                <td>${item.volume.toFixed(2)}</td>
                                <td>${item.weight.toFixed(2)}</td>
                                <td>$${item.ancillaryRevenue.toFixed(2)}</td>
                                <td>$${item.revenue.toFixed(2)}</td>
                                <td>$${(item.revenue / item.count).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Monthly revenue breakdown - show all months from April to December
    const monthlyData = {};
    const months = [
        { key: '2026-04', name: 'April 2026' },
        { key: '2026-05', name: 'May 2026' },
        { key: '2026-06', name: 'June 2026' },
        { key: '2026-07', name: 'July 2026' },
        { key: '2026-08', name: 'August 2026' },
        { key: '2026-09', name: 'September 2026' },
        { key: '2026-10', name: 'October 2026' },
        { key: '2026-11', name: 'November 2026' },
        { key: '2026-12', name: 'December 2026' }
    ];
    
    // Initialize all months with zero
    months.forEach(month => {
        monthlyData[month.key] = {
            month: month.name,
            totalRevenue: 0,
            bsaRevenue: 0,
            charterRevenue: 0
        };
    });
    
    // Fill in actual data
    validData.forEach(plan => {
        const date = new Date(plan.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
            monthlyData[monthKey].totalRevenue += plan.totalRevenue;
            if (plan.opportunityType === 'BSA') {
                monthlyData[monthKey].bsaRevenue += plan.totalRevenue;
            } else {
                monthlyData[monthKey].charterRevenue += plan.totalRevenue;
            }
        }
    });
    
    const monthlyArray = months.map(m => monthlyData[m.key]);
    
    const monthlyContainer = document.getElementById('monthlyRevenueTable');
    if (monthlyArray.length === 0) {
        monthlyContainer.innerHTML = '<p style="color: #7f8c8d;">No monthly data available.</p>';
    } else {
        monthlyContainer.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Month</th>
                            <th>Total Revenue</th>
                            <th>BSA Revenue</th>
                            <th>Charter Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${monthlyArray.map(item => `
                            <tr>
                                <td>${item.month}</td>
                                <td>$${item.totalRevenue.toFixed(2)}</td>
                                <td>$${item.bsaRevenue.toFixed(2)}</td>
                                <td>$${item.charterRevenue.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    // Weekly revenue breakdown - show all weeks from April to December
    const weeklyData = {};
    
    // Generate all weeks in the planning period
    let weekDate = new Date(PLAN_START_DATE);
    const weeks = [];
    while (weekDate <= PLAN_END_DATE) {
        const startOfYear = new Date(weekDate.getFullYear(), 0, 1);
        const daysDiff = Math.floor((weekDate - startOfYear) / (1000 * 60 * 60 * 24));
        const weekNum = Math.ceil((daysDiff + startOfYear.getDay() + 1) / 7);
        const weekKey = `${weekDate.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
                week: `Week ${weekNum}, ${weekDate.getFullYear()}`,
                totalRevenue: 0,
                bsaRevenue: 0,
                charterRevenue: 0
            };
            weeks.push(weekKey);
        }
        
        weekDate.setDate(weekDate.getDate() + 7);
    }
    
    // Fill in actual data
    validData.forEach(plan => {
        const date = new Date(plan.date);
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const daysDiff = Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24));
        const weekNum = Math.ceil((daysDiff + startOfYear.getDay() + 1) / 7);
        const weekKey = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
        
        if (weeklyData[weekKey]) {
            weeklyData[weekKey].totalRevenue += plan.totalRevenue;
            if (plan.opportunityType === 'BSA') {
                weeklyData[weekKey].bsaRevenue += plan.totalRevenue;
            } else {
                weeklyData[weekKey].charterRevenue += plan.totalRevenue;
            }
        }
    });
    
    const weeklyArray = weeks.map(key => weeklyData[key]);
    
    const weeklyContainer = document.getElementById('weeklyRevenueTable');
    if (weeklyArray.length === 0) {
        weeklyContainer.innerHTML = '<p style="color: #7f8c8d;">No weekly data available.</p>';
    } else {
        weeklyContainer.innerHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Week</th>
                            <th>Total Revenue</th>
                            <th>BSA Revenue</th>
                            <th>Charter Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${weeklyArray.map(item => `
                            <tr>
                                <td>${item.week}</td>
                                <td>$${item.totalRevenue.toFixed(2)}</td>
                                <td>$${item.bsaRevenue.toFixed(2)}</td>
                                <td>$${item.charterRevenue.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}

// Show export modal
function showExportModal() {
    populateFilterOptions();
    document.getElementById('exportModal').style.display = 'block';
}

// Close export modal
function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

// Export data to CSV
function exportData() {
    const salesPersonFilter = document.getElementById('exportFilterSalesPerson').value;
    const customerFilter = document.getElementById('exportFilterCustomer').value;
    const opportunityTypeFilter = document.getElementById('exportFilterOpportunityType').value;
    
    let filtered = dailyPlan;
    
    if (salesPersonFilter) {
        filtered = filtered.filter(p => p.salesPerson === salesPersonFilter);
    }
    
    if (customerFilter) {
        filtered = filtered.filter(p => p.customer === customerFilter);
    }
    
    if (opportunityTypeFilter) {
        filtered = filtered.filter(p => p.opportunityType === opportunityTypeFilter);
    }
    
    if (filtered.length === 0) {
        alert('No data to export with selected filters.');
        return;
    }
    
    const sortedData = [...filtered].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Determine columns based on data
    const hasBSA = sortedData.some(p => p.opportunityType === 'BSA');
    const hasCharter = sortedData.some(p => p.opportunityType === 'Charter');
    
    let headers = ['Date', 'Day', 'Sales Person', 'Customer', 'Opportunity Type', 'Route', 'Leg 1', 'Leg 2', 'Leg 3', 'Leg 4'];
    
    if (hasBSA) {
        headers.push('Capacity Type', 'Shipment Type', 'Customer ULD Type', 'Amazon ULD Type', '# Customer Positions', '# Amazon Positions', 'Volume (cuft)', 'Weight (lbs)', 'Rate: Unit of Measurement', 'Rate', 'Revenue/Shipment', 'Build @Origin', 'Break @Destination', 'Linehaul', 'Cost per Linehaul Movement', 'Screening', 'Cost per Screening Event', 'Primeflight CVG', 'Cargoforce ULD Movement');
    }
    
    if (hasCharter) {
        headers.push('Charter Type', 'Ferry Leg', 'Carrier', 'Gauge', '# Rotations per Day', 'Revenue/Rotation', 'Revenue from Ancillary Services per Rotation', 'Ancillary Covered', 'Build @Origin', 'Break @Destination', 'Linehaul', 'Cost per Linehaul Movement', 'Screening', 'Cost per Screening Event', 'WFS CVG');
    }
    
    headers.push('Ancillary Revenue', 'Ancillary Covered', 'Total Revenue');
    
    const csvRows = [headers.join(',')];
    
    sortedData.forEach(plan => {
        const row = [
            plan.date,
            plan.day,
            plan.salesPerson,
            plan.customer,
            plan.opportunityType,
            plan.route,
            plan.leg1 || '-',
            plan.leg2 || '-',
            plan.leg3 || '-',
            plan.leg4 || '-'
        ];
        
        if (hasBSA) {
            if (plan.opportunityType === 'BSA') {
                row.push(
                    plan.capacityType,
                    plan.shipmentType,
                    plan.customerUldType,
                    plan.amazonUldType || '-',
                    plan.customerPositions,
                    plan.amazonPositions,
                    plan.volume,
                    plan.weight,
                    plan.rateUnit || '-',
                    plan.rate,
                    plan.revenuePerShipment,
                    plan.buildOrigin,
                    plan.breakDestination,
                    plan.linehaul,
                    plan.linehaulCost,
                    plan.screening,
                    plan.screeningCost,
                    plan.primeflightCVG,
                    plan.cargoforceULD
                );
            } else {
                row.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
            }
        }
        
        if (hasCharter) {
            if (plan.opportunityType === 'Charter') {
                row.push(
                    plan.charterType,
                    plan.ferryLeg || '-',
                    plan.carrier,
                    plan.gauge,
                    plan.rotationsPerDay,
                    plan.revenuePerRotation,
                    plan.ancillaryRevenuePerRotation,
                    plan.ancillaryCovered,
                    plan.buildOrigin,
                    plan.breakDestination,
                    plan.linehaul,
                    plan.linehaulCost,
                    plan.screening,
                    plan.screeningCost,
                    plan.wfsCVG
                );
            } else {
                row.push('-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-');
            }
        }
        
        row.push(plan.ancillaryRevenue, plan.ancillaryCovered, plan.totalRevenue);
        
        csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `air-cargo-daily-plan-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    closeExportModal();
    alert('Export completed successfully!');
}
