# SFS Design Kit - Setup Guide

This guide explains how to add the SFS design system to any of your Replit apps so they all have the same look and feel.

---

## 🚀 ULTRA QUICK - Choose Your Method

### Method 1: Auto Script (Easiest - 30 seconds)
```bash
cd /path/to/your/new-app
bash ../sfs-socialpowerhouse/sfs-design-kit/setup.sh
```
✅ Copies everything automatically. Done!

### Method 2: Replit Copy-Paste (Super Easy - 1 minute)
1. Open **SFS Social PowerHouse** project
2. Right-click `sfs-design-kit` folder → **Copy**
3. Switch to your other app
4. Right-click root folder → **Paste**
5. Done!

### Method 3: Manual Copy (Traditional - 5 minutes)
Follow "Quick Setup" section below if you prefer step-by-step.

---

## Quick Setup (5 minutes)

### Step 1: Copy the Design Kit Folder

Copy the entire `sfs-design-kit` folder to your new project's root directory.

### Step 2: Replace Your CSS

Replace your `client/src/index.css` with the contents of `sfs-design-kit/styles/sfs-theme.css`.

Or, if you want to keep some of your existing styles, copy the contents and merge them.

### Step 3: Copy Components

Copy the component files you need from `sfs-design-kit/components/` to your `client/src/components/` folder:

- `SFSHamburgerMenu.tsx` - The hamburger menu with slide-in sidebar
- `GlassCard.tsx` - Glassmorphism card component
- `GoldenButton.tsx` - Golden gradient button
- `SFSNavigation.tsx` - Full navigation header with hamburger

### Step 4: Set Up Your Menu Items

In your app, create your menu items array:

```tsx
const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Settings", href: "/settings" },
  { label: "Profile", href: "/profile" },
  // Add all your app's pages here
];
```

### Step 5: Use the Navigation

In your main layout or App.tsx:

```tsx
import SFSNavigation from "@/components/SFSNavigation";

const menuItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Settings", href: "/settings" },
];

function App() {
  return (
    <div className="min-h-screen bg-sfs-black">
      <SFSNavigation 
        menuItems={menuItems}
        appName="My SFS App"
        navLinks={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ]}
      />
      <main className="pt-16">
        {/* Your app content */}
      </main>
    </div>
  );
}
```

---

## Components Reference

### SFSHamburgerMenu

The slide-in sidebar menu.

```tsx
import SFSHamburgerMenu from "@/components/SFSHamburgerMenu";

<SFSHamburgerMenu
  menuItems={[
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
  ]}
  appName="My App"
  appSubtitle="SmartFlow Systems"
/>
```

**Props:**
- `menuItems` - Array of `{ label: string, href: string }`
- `appName` - App name shown in sidebar header (default: "SFS PowerHouse")
- `appSubtitle` - Subtitle shown below app name (default: "SmartFlow Systems")

### GlassCard

Glassmorphism card with gold accents.

```tsx
import GlassCard from "@/components/GlassCard";

<GlassCard>
  <h2 className="text-sfs-gold text-lg font-bold">Card Title</h2>
  <p className="text-sfs-beige/80">Card content here</p>
</GlassCard>

// Without hover effect:
<GlassCard hover={false}>
  Static content
</GlassCard>
```

**Props:**
- `children` - Content inside the card
- `className` - Additional CSS classes
- `hover` - Enable hover animation (default: true)

### GoldenButton

Primary action button with gold gradient.

```tsx
import GoldenButton from "@/components/GoldenButton";

<GoldenButton onClick={() => console.log('clicked')}>
  Click Me
</GoldenButton>

<GoldenButton type="submit" disabled={isLoading}>
  Submit Form
</GoldenButton>
```

**Props:**
- `children` - Button text/content
- `onClick` - Click handler
- `type` - "button" | "submit" | "reset"
- `disabled` - Disable the button
- `className` - Additional CSS classes

### SFSNavigation

Complete navigation header with hamburger menu.

```tsx
import SFSNavigation from "@/components/SFSNavigation";

<SFSNavigation
  menuItems={menuItems}
  appName="SFS Social PowerHouse"
  navLinks={[
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ]}
  ctaText="Start Free Trial"
  ctaHref="/auth/login"
  showCta={true}
/>
```

**Props:**
- `menuItems` - Array for hamburger sidebar
- `appName` - Logo text
- `navLinks` - Desktop nav links
- `ctaText` - CTA button text
- `ctaHref` - CTA button link
- `showCta` - Show/hide CTA button

---

## CSS Classes You Can Use

These are available once you add the theme CSS:

### Layout Classes
- `glass-card` - Apply glassmorphism to any element
- `circuit-bg` - Animated circuit board background
- `sidebar-item` - Styled sidebar link
- `custom-scrollbar` - Gold-styled scrollbar

### Animation Classes
- `animate-fade-in` - Fade in animation
- `animate-slide-up` - Slide up from below
- `animate-scale-in` - Scale up animation
- `animate-slide-in-left` - Slide from left
- `animate-slide-in-right` - Slide from right
- `animate-bounce-in` - Bouncy entrance
- `animate-pulse-glow` - Pulsing gold glow
- `animate-shimmer` - Shimmer effect
- `page-transition` - Page load animation
- `stagger-animation` - Staggered children animations

### Hover Effects
- `hover-lift` - Lift up on hover with shadow
- `hover-glow` - Gold glow on hover

### Color Classes (Tailwind)
- `bg-sfs-black` - #0D0D0D
- `bg-sfs-brown` - #3B2F2F
- `bg-sfs-gold` - #FFD700
- `text-sfs-gold` - Gold text
- `text-sfs-beige` - Beige text
- `border-sfs-gold` - Gold border

---

## Keeping Apps in Sync

When you update the design kit:

1. Make your changes in the `sfs-design-kit` folder
2. Copy the updated files to each of your apps
3. Test that everything still works

**Tip:** Keep a "master" version of the design kit in one project (like SFS Social PowerHouse) and copy from there to other apps.

---

## Troubleshooting

### Colors not working?
Make sure your CSS has the `@theme` block at the top with all the color definitions.

### Menu not sliding in?
Check that the z-index values aren't being overridden by other components.

### Animations not showing?
Ensure the keyframe animations are defined at the bottom of your CSS file.

---

## File Structure

```
sfs-design-kit/
├── components/
│   ├── index.ts          # Export file
│   ├── GlassCard.tsx     # Glass card component
│   ├── GoldenButton.tsx  # Gold button component
│   ├── SFSHamburgerMenu.tsx  # Hamburger sidebar
│   └── SFSNavigation.tsx # Full nav header
├── styles/
│   └── sfs-theme.css     # Complete theme CSS
├── utils/
│   └── (future utilities)
└── SETUP-GUIDE.md        # This file
```

---

Made with care by SmartFlow Systems - boweazy 2025
