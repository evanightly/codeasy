# Student Course Cognitive Classification Reports

This module provides tools to analyze and visualize students' cognitive levels based on Bloom's taxonomy theory.

## Overview

The Student Course Cognitive Classification module allows instructors and administrators to:

- View aggregate cognitive classification data by course
- See detailed breakdowns of student cognitive levels
- Export reports in PDF or Excel format for further analysis
- Filter classifications by different algorithms (TOPSIS, Fuzzy, Neural Network)

## Features

### Course Report Visualization

- Interactive bar charts showing distribution of cognitive levels
- Student listings grouped by cognitive level
- Color-coded visualization for easy interpretation
- Filter by classification algorithm type

### Export Options

- PDF export with high-quality rendering
- Excel export with detailed data for further analysis
- Course and classification type included in export filenames

## How to Use

1. **Access the Report**:

    - From the main dashboard, navigate to "Student Course Cognitive Classifications"
    - Click the "View Report" button in the top right corner
    - Select a course from the dropdown menu
    - Choose a classification algorithm (TOPSIS, Fuzzy, Neural Network)
    - Click "Generate Report"

2. **Analyze the Data**:

    - Bar chart shows distribution of students across cognitive levels
    - Percentage breakdown displayed beneath chart
    - Student list is organized by cognitive level, showing individual scores

3. **Export the Report**:
    - Click "Export PDF" to save the visualization as a PDF document
    - Click "Export Excel" to export detailed data to Excel format for further analysis

## Classification Levels

The system classifies students into six cognitive levels according to Bloom's taxonomy:

1. **Remember**: Recall of facts and basic concepts (CC < 0.25)
2. **Understand**: Explain ideas or concepts (0.25 ≤ CC < 0.40)
3. **Apply**: Use information in new situations (0.40 ≤ CC < 0.55)
4. **Analyze**: Draw connections among ideas (0.55 ≤ CC < 0.70)
5. **Evaluate**: Justify a stand or decision (0.70 ≤ CC < 0.85)
6. **Create**: Produce new or original work (CC ≥ 0.85)

## Classification Algorithms

The system supports multiple classification algorithms:

- **TOPSIS**: Technique for Order of Preference by Similarity to Ideal Solution
- **Fuzzy**: Fuzzy logic based classification
- **Neural Network**: Machine learning based classification

## Implementation Details

This feature uses:

- TanStack Query for data fetching and caching
- HTML2Canvas and jsPDF for PDF exports
- XLSX for Excel exports
- React hooks for state management
