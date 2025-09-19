-- Migration 010: Fix missing step content in howto_steps table
-- Description: Add missing descriptions for incomplete steps
-- Version: 2025-09-19

-- Fix how-to-calculate-variance Step 6
UPDATE howto_steps
SET description = '1. Navigate to our [Variance Calculator](/calculator/variance)
2. Enter your data values separated by commas or spaces
3. Select whether your data represents a sample or population
4. Click "Calculate" to get instant results
5. Review the detailed breakdown showing:
   - Mean calculation
   - Individual deviations
   - Squared deviations
   - Final variance value
   - Standard deviation (square root of variance)'
WHERE howto_slug = 'how-to-calculate-variance' AND slug = 'step-6';

-- Fix how-to-import-data-from-excel Step 1
UPDATE howto_steps
SET description = '### From Excel to Calculator:
1. **Select your data** in Excel (single column or row)
2. **Copy** (Ctrl+C or Cmd+C)
3. **Navigate** to our calculator
4. **Paste** (Ctrl+V or Cmd+V) into the data input field
5. **Calculate** - data is automatically parsed

### Supported Excel Formats:
- **Single column**: A1:A10 (vertical data)
- **Single row**: A1:J1 (horizontal data)
- **Mixed formatting**: Numbers with commas, decimals
- **Date values**: Automatically converted to numbers

### Example:
```
Excel Column A:
85
92
78
88
95
82

Result: Automatically parsed as: 85, 92, 78, 88, 95, 82
```'
WHERE howto_slug = 'how-to-import-data-from-excel' AND slug = 'step-1';

-- Fix how-to-import-data-from-excel Step 2
UPDATE howto_steps
SET description = '### Preparing CSV Files:
1. **Save Excel file** as CSV format
2. **Ensure single column** of numeric data
3. **Remove headers** if not needed
4. **Clean invalid entries** (text, blanks)

### CSV Import Process:
1. **Upload CSV** using file selector
2. **Preview data** to verify correct parsing
3. **Select column** if multiple columns exist
4. **Import and calculate** automatically

### CSV Format Example:
```
Student_Scores
85
92
78
88
95
82
```

### Tips:
- Use UTF-8 encoding for best compatibility
- Keep file size under 10MB for optimal performance
- Remove any special characters or formatting'
WHERE howto_slug = 'how-to-import-data-from-excel' AND slug = 'step-2';

-- Fix how-to-import-data-from-excel Step 3
UPDATE howto_steps
SET description = '### Direct Copy Method:
1. **Open Google Sheets** with your data
2. **Select data range** (click and drag)
3. **Copy** (Ctrl+C)
4. **Switch** to our calculator
5. **Paste** data into input field

### Sharing Link Method:
1. **Create shareable link** in Google Sheets
2. **Set permissions** to "Anyone with link can view"
3. **Copy link** and use import feature
4. **Select specific range** if needed

### Best Practices:
- Clean data before copying (remove headers, text)
- Verify data format matches calculator requirements
- For large datasets, consider exporting as CSV first
- Test with a small sample before importing large datasets'
WHERE howto_slug = 'how-to-import-data-from-excel' AND slug = 'step-3';

-- Fix basic-data-analysis-workflow Step 2
UPDATE howto_steps
SET description = '### Data Validation Checklist:
1. **Check for missing values**
   - Identify gaps in your dataset
   - Decide whether to remove or impute missing values
   - Document your decision

2. **Identify outliers**
   - Use the IQR method: Q1 - 1.5×IQR and Q3 + 1.5×IQR
   - Consider domain knowledge for context
   - Document if outliers are errors or genuine extreme values

3. **Verify data types**
   - Ensure numeric data is properly formatted
   - Check for text mixed with numbers
   - Confirm decimal separators are consistent

4. **Check data range**
   - Verify values are within expected bounds
   - Look for impossible values (negative ages, percentages > 100)
   - Confirm units are consistent

### Quick Quality Check Using Our Tools:
- Calculate mean and median - large differences indicate skewness
- Check standard deviation - unusually high values suggest outliers
- Review min/max values for data range issues'
WHERE howto_slug = 'basic-data-analysis-workflow' AND slug = 'step-2';

-- Fix basic-data-analysis-workflow Step 3
UPDATE howto_steps
SET description = '### Interpreting Descriptive Statistics:

1. **Central Tendency Analysis**
   - **Mean = Median**: Symmetric distribution
   - **Mean > Median**: Right-skewed (positive skew)
   - **Mean < Median**: Left-skewed (negative skew)

2. **Variability Assessment**
   - **Low SD/Variance**: Data points cluster near the mean
   - **High SD/Variance**: Data points spread widely
   - **CV = (SD/Mean) × 100**: Compare variability across different scales

3. **Distribution Shape**
   - Use range to understand data spread
   - Check for multimodal patterns
   - Identify potential data quality issues

### Making Data-Driven Decisions:

**For Business Metrics:**
- Compare current statistics to historical baselines
- Identify trends and patterns
- Flag metrics outside normal ranges

**For Quality Control:**
- Use ±2 SD as warning limits
- Use ±3 SD as control limits
- Investigate points outside control limits

**For Research:**
- Report both central tendency and variability
- Include sample size and confidence intervals
- Consider practical vs. statistical significance

### Common Pitfalls to Avoid:
- Don''t rely on mean alone for skewed data
- Always consider context and domain knowledge
- Be cautious about generalizing from small samples
- Document assumptions and limitations'
WHERE howto_slug = 'basic-data-analysis-workflow' AND slug = 'step-3';