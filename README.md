# Campaigns Dashboard

A pixel-perfect React dashboard component built with TypeScript, Tailwind CSS, and Font Awesome icons.

## Features

- **Responsive Layout**: Fixed sidebar navigation with fluid main content area
- **Interactive Tabs**: Filter campaigns by category (All, Underpacing, Underperforming, etc.)
- **Search Functionality**: Real-time search filtering by campaign name or ID
- **Custom Progress Bars**: Color-coded pacing ratio indicators with target markers
- **Alert Badges**: Visual status indicators with Font Awesome icons
- **Modal Dialog**: New campaign creation modal
- **Hover States**: Interactive table rows and buttons

## Tech Stack

- React 18 with TypeScript
- Tailwind CSS for styling
- Font Awesome for icons
- Vite for build tooling

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx          # Left navigation sidebar
│   ├── Header.tsx            # Page header with tabs
│   ├── FilterBar.tsx         # Filter controls and search
│   ├── CampaignsTable.tsx   # Main data table
│   ├── AlertBadge.tsx        # Alert badge component
│   ├── PacingProgressBar.tsx # Custom progress bar with target marker
│   └── NewCampaignModal.tsx  # Campaign creation modal
├── data/
│   └── mockCampaigns.ts      # Mock campaign data
├── types.ts                  # TypeScript type definitions
├── App.tsx                   # Main application component
└── main.tsx                  # Application entry point
```

## Color Palette

- Primary Blue: `#2563EB`
- Red Alerts: `bg-red-100 text-red-800`
- Orange Alerts: `bg-orange-100 text-orange-800`
- Green Alerts: `bg-green-100 text-green-800`
- Background: `bg-gray-50`
- Sidebar: `bg-gray-800`

## Customization

The component is fully customizable through Tailwind CSS classes. Key areas to modify:

- **Colors**: Update the color palette in `tailwind.config.js`
- **Typography**: Font sizes and weights can be adjusted in component classes
- **Spacing**: Padding and margins use Tailwind's spacing scale
- **Mock Data**: Edit `src/data/mockCampaigns.ts` to change the displayed campaigns
