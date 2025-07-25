# Sales Training Vendor Evaluation App

A React TypeScript application for LoadSmart to evaluate and compare sales training vendors using a weighted scorecard system.

## Features

### Core Functionality
- **Vendor Management**: Add, edit, and delete vendor information
- **Multi-Evaluator System**: Support for Admin and Evaluator roles
- **Weighted Scoring**: 7 criteria with specific weights (25%, 20%, 20%, 15%, 10%, 5%, 5%)
- **Progress Tracking**: Monitor evaluation completion across all evaluators
- **Results & Analytics**: Individual scorecards and aggregated results
- **Vendor Comparison**: Side-by-side comparison matrix
- **Decision Support**: Automated recommendations and deal-breaker alerts

### Evaluation Criteria
1. **Prospecting Methodology & Process (25%)**
2. **Negotiation & Value Defense Training (20%)**
3. **Delivery Format & Logistics (20%)**
4. **Ongoing Support & Stickiness (15%)**
5. **Pricing & ROI (10%)**
6. **SaaS Experience & References (5%)**
7. **Cultural Fit & Philosophy (5%)**

### Recommendation System
- **400+ points**: Strongly Recommend (Green)
- **350-399**: Recommend with Considerations (Yellow)
- **300-349**: Neutral - Further Evaluation Needed (Orange)  
- **Below 300**: Not Recommended (Red)

### Deal Breaker Alerts
- Delivery Format scores below 3 (must have in-person Chicago option)
- Any criterion scores of 1-2 (critical weaknesses)

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm
- Modern web browser

### Install Dependencies
```bash
# Navigate to project directory
cd new-project

# Install dependencies
npm install
```

### Run the Application
```bash
# Start development server
npm start
```

The app will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

## Usage Guide

### Getting Started
1. **Login**: Select your role (Chris/Admin, VP of Sales, or Director)
2. **Add Vendors**: Admins can add vendor information and key differentiators
3. **Evaluate**: Each evaluator scores vendors independently using the 1-5 scale
4. **Review Results**: View individual and aggregated results
5. **Compare**: Side-by-side comparison of top vendors
6. **Export**: Generate reports for decision meetings

### User Roles
- **Admin (Chris)**: Can manage vendors, view all results, export data
- **Evaluators (VP, Director)**: Can evaluate vendors and view results

### Evaluation Process
1. Complete all 7 criteria for each vendor
2. Provide optional comments for each criterion
3. Add overall comments
4. Save draft or submit final evaluation

### Data Storage
- Uses browser localStorage for data persistence
- Data is automatically saved as you work
- Export/import functionality for data backup

## Technical Architecture

### Stack
- **Frontend**: React 18 with TypeScript
- **Routing**: React Router v6
- **Styling**: CSS-in-JS with responsive design
- **Charts**: Recharts for visualizations
- **Storage**: Browser localStorage

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── types/              # TypeScript interfaces
├── services/           # Data management services
├── utils/              # Helper functions and calculations
├── hooks/              # Custom React hooks
└── data/               # Sample data and constants
```

### Key Files
- `types/index.ts`: Data models and interfaces
- `services/storage.ts`: LocalStorage data management
- `utils/calculations.ts`: Scoring and recommendation logic
- `pages/Dashboard.tsx`: Main overview page
- `pages/EvaluationPage.tsx`: Vendor scoring interface
- `pages/ResultsPage.tsx`: Results and analytics
- `pages/ComparisonPage.tsx`: Side-by-side vendor comparison

## Sample Users
The app comes pre-configured with:
- **Chris (Admin)**: chris@loadsmart.com
- **VP of Sales**: vp@loadsmart.com  
- **Director**: director@loadsmart.com

## LoadSmart Context
- Tailored for LoadSmart's August 2024 sales training decision
- Includes LoadSmart-specific criteria descriptions and examples
- Built for executive-level decision making with professional UI
- Mobile-responsive for on-the-go evaluations

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### npm Permission Issues
If you encounter permission errors, run:
```bash
sudo chown -R $(whoami) ~/.npm
```

### Data Reset
To clear all data and start fresh:
1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear localStorage for the site

### Browser Compatibility
Ensure JavaScript is enabled and you're using a modern browser version.

## Future Enhancements
- PDF export functionality
- Email notifications for incomplete evaluations
- Advanced filtering and search
- Integration with external document storage
- Audit trail for evaluation changes

## Support
For technical issues or feature requests, contact the development team or refer to the project documentation.