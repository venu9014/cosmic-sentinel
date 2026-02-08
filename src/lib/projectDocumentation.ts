import { jsPDF } from 'jspdf';

export function exportProjectDocumentation() {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  const addNewPageIfNeeded = (requiredSpace: number = 30) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  };

  const addSectionTitle = (title: string) => {
    addNewPageIfNeeded(40);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, yPos - 5, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, yPos + 3);
    doc.setTextColor(0, 0, 0);
    yPos += 18;
  };

  const addParagraph = (text: string, indent: number = 20) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 40);
    lines.forEach((line: string) => {
      addNewPageIfNeeded(8);
      doc.text(line, indent, yPos);
      yPos += 6;
    });
    yPos += 4;
  };

  const addBulletPoint = (text: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(text, pageWidth - 50);
    addNewPageIfNeeded(8);
    doc.text('•', 25, yPos);
    lines.forEach((line: string, index: number) => {
      doc.text(line, 32, yPos);
      if (index < lines.length - 1) {
        yPos += 6;
        addNewPageIfNeeded(8);
      }
    });
    yPos += 7;
  };

  const addSubheading = (text: string) => {
    addNewPageIfNeeded(15);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 20, yPos);
    yPos += 8;
  };

  // ===== COVER PAGE =====
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('ASTEROID THREAT', pageWidth / 2, 60, { align: 'center' });
  doc.text('DETECTION SYSTEM', pageWidth / 2, 75, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('AstroTrack AI - Near Earth Object Analysis Platform', pageWidth / 2, 95, { align: 'center' });
  
  // Project Type
  doc.setFillColor(139, 92, 246);
  doc.roundedRect(pageWidth / 2 - 40, 110, 80, 12, 3, 3, 'F');
  doc.setFontSize(10);
  doc.text('Level-3 CSE Major Project', pageWidth / 2, 118, { align: 'center' });
  
  // Description box
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(25, 140, pageWidth - 50, 60, 5, 5, 'F');
  doc.setFontSize(11);
  const desc = 'A full-stack web application that fetches real-time asteroid data from NASA\'s Near Earth Object API, applies Machine Learning-inspired algorithms for hazard classification, and displays results in an interactive dashboard with risk scoring, alerts, and comprehensive reporting capabilities.';
  const descLines = doc.splitTextToSize(desc, pageWidth - 70);
  descLines.forEach((line: string, i: number) => {
    doc.text(line, 35, 155 + (i * 7));
  });
  
  // Key Stats
  doc.setFontSize(10);
  doc.text('Key Features:', 35, 220);
  doc.text('✓ Real-time NASA API Integration', 35, 232);
  doc.text('✓ ML-Inspired Risk Classification', 35, 244);
  doc.text('✓ Interactive Dashboard', 110, 232);
  doc.text('✓ PDF Report Generation', 110, 244);
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated: ${new Date().toLocaleDateString()} | AstroTrack AI v1.0`, pageWidth / 2, 280, { align: 'center' });
  
  // ===== PAGE 2: TABLE OF CONTENTS =====
  doc.addPage();
  doc.setTextColor(0, 0, 0);
  yPos = 20;
  
  addSectionTitle('TABLE OF CONTENTS');
  yPos += 5;
  
  const tocItems = [
    '1. Project Overview ................................. 3',
    '2. Technology Stack ................................. 4',
    '3. System Architecture .............................. 5',
    '4. Machine Learning Algorithm ....................... 6',
    '5. Risk Classification System ....................... 7',
    '6. Data Flow & API Integration ...................... 8',
    '7. Features & Functionality ......................... 9',
    '8. User Interface Components ........................ 10',
    '9. Future Enhancements .............................. 11',
  ];
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  tocItems.forEach(item => {
    doc.text(item, 25, yPos);
    yPos += 10;
  });
  
  // ===== PAGE 3: PROJECT OVERVIEW =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('1. PROJECT OVERVIEW');
  
  addSubheading('1.1 Introduction');
  addParagraph('The Asteroid Threat Detection System (AstroTrack AI) is a sophisticated web-based application designed to monitor and analyze Near Earth Objects (NEOs) using data from NASA\'s public APIs. The system provides real-time hazard assessment through a Machine Learning-inspired classification algorithm.');
  
  addSubheading('1.2 Problem Statement');
  addParagraph('With thousands of asteroids passing near Earth annually, there is a critical need for accessible tools that can help researchers, students, and the public understand potential cosmic threats. Traditional NASA tools require technical expertise, creating a gap in public accessibility.');
  
  addSubheading('1.3 Objectives');
  addBulletPoint('Fetch and process real-time asteroid data from NASA NEO API');
  addBulletPoint('Implement ML-inspired hazard classification algorithm');
  addBulletPoint('Provide intuitive visualization of risk levels');
  addBulletPoint('Enable comprehensive PDF report generation');
  addBulletPoint('Create responsive, user-friendly interface');
  
  addSubheading('1.4 Scope');
  addParagraph('The application covers 7-day asteroid forecasts, providing detailed analysis of orbital mechanics, physical characteristics, and potential Earth impact scenarios. It serves educational and research purposes.');
  
  // ===== PAGE 4: TECHNOLOGY STACK =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('2. TECHNOLOGY STACK');
  
  addSubheading('2.1 Frontend Technologies');
  addBulletPoint('React 18.3.1 - Component-based UI library for building interactive interfaces');
  addBulletPoint('TypeScript - Static typing for enhanced code reliability and maintainability');
  addBulletPoint('Vite - Next-generation frontend build tool for fast development');
  addBulletPoint('Tailwind CSS - Utility-first CSS framework for rapid styling');
  addBulletPoint('Framer Motion - Production-ready animation library for React');
  
  addSubheading('2.2 State Management & Data Fetching');
  addBulletPoint('TanStack React Query v5 - Powerful data synchronization for server state');
  addBulletPoint('React Hooks - useState, useEffect, useCallback for local state');
  
  addSubheading('2.3 UI Component Libraries');
  addBulletPoint('shadcn/ui - High-quality, accessible component library');
  addBulletPoint('Radix UI - Unstyled, accessible component primitives');
  addBulletPoint('Lucide React - Beautiful, consistent icon library');
  addBulletPoint('Recharts - Composable charting library for data visualization');
  
  addSubheading('2.4 Additional Libraries');
  addBulletPoint('jsPDF - Client-side PDF generation for reports');
  addBulletPoint('Sonner - Toast notification system');
  addBulletPoint('React Router DOM - Client-side routing');
  addBulletPoint('date-fns - Modern JavaScript date utility library');
  
  addSubheading('2.5 Development Tools');
  addBulletPoint('ESLint - Code linting and style enforcement');
  addBulletPoint('Vitest - Unit testing framework');
  addBulletPoint('PostCSS - CSS transformation tool');
  
  // ===== PAGE 5: SYSTEM ARCHITECTURE =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('3. SYSTEM ARCHITECTURE');
  
  addSubheading('3.1 High-Level Architecture');
  addParagraph('The application follows a modern single-page application (SPA) architecture with clear separation of concerns between data fetching, business logic, and presentation layers.');
  
  addSubheading('3.2 Component Structure');
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  const structure = [
    'src/',
    '├── components/',
    '│   ├── ui/           # shadcn/ui components',
    '│   ├── Header.tsx    # Navigation header',
    '│   ├── HeroSection.tsx',
    '│   ├── AsteroidCard.tsx',
    '│   ├── AsteroidDetailModal.tsx',
    '│   ├── StatsCard.tsx',
    '│   ├── StatsDetailModal.tsx',
    '│   ├── FilterControls.tsx',
    '│   ├── RiskMeter.tsx',
    '│   ├── AlertPanel.tsx',
    '│   └── StarField.tsx',
    '├── hooks/',
    '│   └── useNasaData.ts # NASA API integration',
    '├── lib/',
    '│   ├── asteroidUtils.ts # ML algorithm',
    '│   ├── pdfExport.ts    # PDF generation',
    '│   └── utils.ts',
    '├── pages/',
    '│   ├── Index.tsx',
    '│   ├── Dashboard.tsx',
    '│   └── NotFound.tsx',
    '└── types/',
    '    └── asteroid.ts    # TypeScript interfaces',
  ];
  structure.forEach(line => {
    addNewPageIfNeeded(6);
    doc.text(line, 25, yPos);
    yPos += 5;
  });
  doc.setFont('helvetica', 'normal');
  yPos += 10;
  
  addSubheading('3.3 Data Flow');
  addParagraph('1. User opens Dashboard → 2. React Query fetches NASA API → 3. Raw data processed by asteroidUtils → 4. ML algorithm calculates risk scores → 5. Components render processed data → 6. User interactions trigger modals/exports');
  
  // ===== PAGE 6: ML ALGORITHM =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('4. MACHINE LEARNING ALGORITHM');
  
  addSubheading('4.1 Algorithm Overview');
  addParagraph('The system employs a deterministic weighted-feature scoring algorithm that simulates Machine Learning classification. This approach provides consistent, explainable results while avoiding the complexity of training actual ML models.');
  
  addSubheading('4.2 Input Features');
  addBulletPoint('Absolute Magnitude (H) - Brightness indicator; lower values = larger asteroids');
  addBulletPoint('Estimated Diameter - Average of min/max diameter estimates in kilometers');
  addBulletPoint('Relative Velocity - Speed relative to Earth in km/s');
  addBulletPoint('Miss Distance - Closest approach distance from Earth in kilometers');
  addBulletPoint('NASA PHA Classification - Binary flag from NASA\'s official hazard assessment');
  
  addSubheading('4.3 Feature Normalization');
  addParagraph('Each feature is normalized to a 0-1 scale using domain-specific scaling:');
  addBulletPoint('Magnitude Score = (30 - H) / 15, clamped to [0, 1]');
  addBulletPoint('Diameter Score = diameter / 1km, capped at 1.0');
  addBulletPoint('Velocity Score = velocity / 30 km/s, capped at 1.0');
  addBulletPoint('Distance Score = 1 - (log₁₀(distance + 1) / 8), clamped to [0, 1]');
  
  addSubheading('4.4 Weight Configuration');
  addParagraph('The weighted combination uses empirically-tuned coefficients:');
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  addNewPageIfNeeded(40);
  const weights = [
    'weights = {',
    '  magnitude:    0.15  (15%)',
    '  diameter:     0.30  (30%)',
    '  velocity:     0.20  (20%)',
    '  distance:     0.25  (25%)',
    '  actualHazard: 0.10  (10%)',
    '}',
  ];
  weights.forEach(line => {
    doc.text(line, 30, yPos);
    yPos += 6;
  });
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  
  addSubheading('4.5 Sigmoid Transformation');
  addParagraph('A sigmoid-like function creates realistic score distribution:');
  addParagraph('finalScore = 1 / (1 + e^(-10 × (rawScore - 0.3))) × 100');
  addParagraph('This transformation creates a non-linear mapping that emphasizes differences in the middle range while compressing extreme values.');
  
  // ===== PAGE 7: RISK CLASSIFICATION =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('5. RISK CLASSIFICATION SYSTEM');
  
  addSubheading('5.1 Risk Levels');
  addParagraph('The system categorizes asteroids into four distinct risk levels based on computed scores:');
  
  // Risk level table
  doc.setFillColor(220, 38, 38);
  doc.rect(25, yPos, 15, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('CRIT', 27, yPos + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('CRITICAL (80-100): Immediate attention required. High impact probability.', 45, yPos + 7);
  yPos += 15;
  
  doc.setFillColor(245, 158, 11);
  doc.rect(25, yPos, 15, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('HIGH', 27, yPos + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('HIGH (60-79): Elevated concern. Close monitoring recommended.', 45, yPos + 7);
  yPos += 15;
  
  doc.setFillColor(139, 92, 246);
  doc.rect(25, yPos, 15, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('MED', 28, yPos + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('MEDIUM (40-59): Moderate risk. Standard tracking protocols.', 45, yPos + 7);
  yPos += 15;
  
  doc.setFillColor(34, 197, 94);
  doc.rect(25, yPos, 15, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('LOW', 28, yPos + 7);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('LOW (0-39): Minimal risk. Safe passage expected.', 45, yPos + 7);
  yPos += 25;
  
  addSubheading('5.2 Hazard Prediction');
  addParagraph('An asteroid is predicted as "hazardous" when its risk score exceeds 50%. This threshold was calibrated against NASA\'s official Potentially Hazardous Asteroid (PHA) classifications to achieve reasonable correlation.');
  
  addSubheading('5.3 Comparison with NASA PHA');
  addParagraph('NASA classifies PHAs based on: (1) Minimum Orbit Intersection Distance (MOID) ≤ 0.05 AU, and (2) Absolute magnitude H ≤ 22. Our algorithm complements this by incorporating velocity and providing continuous risk scores rather than binary classification.');
  
  // ===== PAGE 8: DATA FLOW =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('6. DATA FLOW & API INTEGRATION');
  
  addSubheading('6.1 NASA NEO API');
  addParagraph('The application integrates with NASA\'s Near Earth Object Web Service (NeoWs), a RESTful API providing detailed information about asteroids making close approaches to Earth.');
  
  addSubheading('6.2 API Endpoint');
  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  doc.text('GET https://api.nasa.gov/neo/rest/v1/feed', 25, yPos);
  yPos += 8;
  doc.text('Parameters: start_date, end_date, api_key', 25, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 15;
  
  addSubheading('6.3 Data Fields Retrieved');
  addBulletPoint('id - Unique NASA identifier');
  addBulletPoint('name - Asteroid designation');
  addBulletPoint('absolute_magnitude_h - Brightness measure');
  addBulletPoint('estimated_diameter - Min/max estimates in various units');
  addBulletPoint('is_potentially_hazardous_asteroid - NASA PHA flag');
  addBulletPoint('close_approach_data - Array of approach events with velocity and distance');
  addBulletPoint('nasa_jpl_url - Link to NASA JPL database entry');
  
  addSubheading('6.4 Data Processing Pipeline');
  addParagraph('Raw API Response → JSON Parsing → TypeScript Interface Mapping → Feature Extraction → Risk Score Calculation → UI State Update → Component Rendering');
  
  addSubheading('6.5 Caching Strategy');
  addParagraph('React Query implements intelligent caching with 5-minute stale time, automatic background refetching, and optimistic UI updates. Failed requests trigger automatic retry with exponential backoff.');
  
  // ===== PAGE 9: FEATURES =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('7. FEATURES & FUNCTIONALITY');
  
  addSubheading('7.1 Dashboard Statistics');
  addBulletPoint('Total Asteroid Count - Complete count of tracked objects');
  addBulletPoint('Hazardous Count - Objects predicted as potentially dangerous');
  addBulletPoint('Safe Count - Objects with low risk scores');
  addBulletPoint('Average Risk Score - Mean risk across all tracked asteroids');
  addBulletPoint('Interactive Stats Cards - Click to view filtered asteroid lists');
  
  addSubheading('7.2 Asteroid Filtering & Sorting');
  addBulletPoint('Search by Name - Real-time text filtering');
  addBulletPoint('Risk Level Filter - Filter by Critical/High/Medium/Low');
  addBulletPoint('Sorting Options - By risk score, distance, velocity, or size');
  addBulletPoint('Order Toggle - Ascending/descending sort order');
  
  addSubheading('7.3 Detail Views');
  addBulletPoint('Asteroid Cards - Summary view with key metrics and quick actions');
  addBulletPoint('Detail Modal - Comprehensive view with all data points');
  addBulletPoint('Risk Analysis Breakdown - Factor-by-factor risk explanation');
  
  addSubheading('7.4 Alert System');
  addBulletPoint('Critical Threat Panel - Highlights asteroids with risk > 80%');
  addBulletPoint('Visual Indicators - Animated borders and pulsing effects');
  addBulletPoint('Toast Notifications - Real-time feedback for user actions');
  
  addSubheading('7.5 Export Capabilities');
  addBulletPoint('Individual PDF Reports - Detailed single-asteroid documentation');
  addBulletPoint('Bulk Export - Complete list with summary statistics');
  addBulletPoint('NASA JPL Links - Direct access to official data source');
  
  // ===== PAGE 10: UI COMPONENTS =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('8. USER INTERFACE COMPONENTS');
  
  addSubheading('8.1 Design System');
  addParagraph('The application uses a custom "Cosmic" design system featuring dark-space aesthetics, glassmorphism effects, nebula gradients, and the Orbitron display font for a space-mission-control feel.');
  
  addSubheading('8.2 Color Palette');
  addBulletPoint('Background: Deep space blacks and slate grays');
  addBulletPoint('Primary: Electric indigo (#6366f1)');
  addBulletPoint('Accent: Cosmic cyan and golds');
  addBulletPoint('Destructive: Alert red for critical warnings');
  addBulletPoint('Success: Vibrant green for safe indicators');
  
  addSubheading('8.3 Key Components');
  addBulletPoint('StarField - Animated canvas background with parallax stars');
  addBulletPoint('RiskMeter - SVG circular progress indicator');
  addBulletPoint('GlassMorphic Cards - Frosted glass effect containers');
  addBulletPoint('Glow Buttons - Neon-effect interactive elements');
  
  addSubheading('8.4 Responsive Design');
  addParagraph('The interface adapts across device sizes using Tailwind CSS breakpoints: mobile-first approach with progressive enhancement for tablets and desktops.');
  
  addSubheading('8.5 Animations');
  addBulletPoint('Framer Motion for page transitions and component mounting');
  addBulletPoint('CSS animations for pulsing alerts and glowing effects');
  addBulletPoint('Smooth scroll behaviors and hover state transitions');
  
  // ===== PAGE 11: FUTURE ENHANCEMENTS =====
  doc.addPage();
  yPos = 20;
  
  addSectionTitle('9. FUTURE ENHANCEMENTS');
  
  addSubheading('9.1 Planned Features');
  addBulletPoint('Email Alert Notifications - SMTP integration for critical threats');
  addBulletPoint('Historical Data Analysis - Trends and pattern visualization');
  addBulletPoint('3D Orbital Visualization - Three.js integration for trajectory rendering');
  addBulletPoint('User Accounts - Save preferences and custom watchlists');
  addBulletPoint('Mobile Application - React Native cross-platform app');
  
  addSubheading('9.2 ML Model Improvements');
  addBulletPoint('Implement actual TensorFlow.js model trained on historical data');
  addBulletPoint('Add confidence intervals to predictions');
  addBulletPoint('Include orbital uncertainty factors');
  
  addSubheading('9.3 Data Enhancements');
  addBulletPoint('Integration with ESA NEO Coordination Centre');
  addBulletPoint('Sentry impact monitoring system data');
  addBulletPoint('Historical close approach records');
  
  // ===== FINAL PAGE =====
  doc.addPage();
  yPos = 40;
  
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank You', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 30;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Asteroid Threat Detection System', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.text('AstroTrack AI v1.0', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 40;
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('Project Type: Level-3 CSE Major Project', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;
  doc.text(`Documentation Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 40;
  doc.setFillColor(139, 92, 246);
  doc.roundedRect(pageWidth / 2 - 50, yPos, 100, 30, 5, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('Data Source:', pageWidth / 2, yPos + 12, { align: 'center' });
  doc.text('NASA NEO API', pageWidth / 2, yPos + 22, { align: 'center' });
  
  // Add page numbers
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    if (i > 1) {
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  }
  
  doc.save('AstroTrack-AI-Project-Documentation.pdf');
}
