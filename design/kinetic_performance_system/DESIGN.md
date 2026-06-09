---
name: Kinetic Performance System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444933'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#747a60'
  outline-variant: '#c4c9ac'
  surface-tint: '#506600'
  primary: '#506600'
  on-primary: '#ffffff'
  primary-container: '#ccff00'
  on-primary-container: '#5b7300'
  inverse-primary: '#abd600'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#4f616e'
  on-tertiary: '#ffffff'
  tertiary-container: '#dcefff'
  on-tertiary-container: '#5b6d7a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c3f400'
  primary-fixed-dim: '#abd600'
  on-primary-fixed: '#161e00'
  on-primary-fixed-variant: '#3c4d00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#d2e5f5'
  tertiary-fixed-dim: '#b6c9d8'
  on-tertiary-fixed: '#0b1d29'
  on-tertiary-fixed-variant: '#374956'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Anton
    fontSize: 80px
    fontWeight: '400'
    lineHeight: '1.0'
    letterSpacing: 0.02em
  display-lg-mobile:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.0'
  headline-xl:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.1'
  headline-xl-mobile:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.1'
  headline-md:
    fontFamily: Archivo Narrow
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Archivo Narrow
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Archivo Narrow
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered for a "Modern Performance" fitness ecosystem. It balances the raw energy of high-intensity training with the precision of professional-grade equipment. The aesthetic is rooted in **High-Contrast Boldness**, utilizing extreme shifts in value and scale to create a sense of urgency and momentum.

The brand personality is authoritative yet motivating, characterized by a clean white foundation that allows the vibrant accent to function as a visual "jolt." It avoids unnecessary decoration, favoring structural integrity and functional clarity to evoke a sleek, high-end athletic feel.

## Colors

The palette is built on a high-contrast triad designed to grab attention and maintain readability:

*   **Electric Lime (#CCFF00):** The primary kinetic driver. Used exclusively for high-action items, progress indicators, and critical CTAs. It should never be used for long-form text.
*   **Deep Charcoal (#121212):** Provides the "heavy" grounding for the system. Used for primary typography, structural borders, and deep-set backgrounds to create a sense of premium quality.
*   **Optic White (#FFFFFF):** The base layer. It provides the "breath" between high-energy elements, ensuring the platform feels clean and modern rather than cluttered.
*   **Performance Gray (#F4F4F4):** A secondary neutral used for input fields, card backgrounds, and subtle grouping.

## Typography

Typography in this design system is a core visual asset, not just a vehicle for information. 

*   **Display & Headlines:** Use **Anton** for high-impact messaging. It should be set with tight leading and occasional uppercase transformations to mimic the bold environment of a performance gym.
*   **Body:** **Archivo Narrow** is chosen for its condensed nature, allowing for efficient information density on product specs while maintaining a modern, athletic edge.
*   **Technical Data:** **JetBrains Mono** is utilized for labels, technical specifications (e.g., supplement facts, weight measurements), and system status to evoke a "lab-tested" or "precision-engineered" quality.

## Layout & Spacing

This design system employs a **Fixed Grid** philosophy for desktop to maintain tight control over visual impact, transitioning to a fluid model for mobile.

*   **Desktop:** 12-column grid with a 1280px max-width. Gutters are kept at a generous 24px to prevent high-contrast elements from feeling cramped.
*   **Rhythm:** A strict 4px baseline grid ensures vertical alignment. Large "Power Gaps" (80px+) are used between major sections to separate equipment categories.
*   **Mobile:** 4-column grid with 16px margins. Headlines should break across lines intentionally to maintain a "stacked" aesthetic.

## Elevation & Depth

To maintain the "Modern Performance" aesthetic, depth is created through **Bold Borders** and **Tonal Layering** rather than traditional soft shadows.

*   **Z-Index Strategy:** Flat surfaces are preferred. Elements "elevate" by utilizing a hard 4px or 8px offset shadow in Deep Charcoal (100% opacity) to create a "sticker" or "brutalist" effect.
*   **Contrast Tiers:** Primary content sits on White (#FFFFFF). Secondary interface elements (sidebars, filters) sit on Performance Gray (#F4F4F4). High-action modals use a Deep Charcoal background with Electric Lime accents to command total focus.

## Shapes

The shape language is **Sharp (0px)**. To reflect the discipline and rigid nature of performance training, all buttons, input fields, images, and cards utilize hard 90-degree corners. 

The only exception to this rule is found in specialized "Data Chips" or "Status Indicators" which may use a pill shape to provide a visual break from the otherwise aggressive geometry.

## Components

### Buttons
*   **Primary:** Solid Electric Lime background with Deep Charcoal text. Hard corners. 
*   **Secondary:** Deep Charcoal background with Optic White text.
*   **Ghost:** Transparent background with a 2px Deep Charcoal border. Text in Deep Charcoal.

### Input Fields
*   **Default:** White background with a 1px Performance Gray border. On focus, the border shifts to a 2px Deep Charcoal stroke.
*   **Labels:** Always JetBrains Mono, uppercase, placed above the field.

### Cards
*   **Product Cards:** Minimum padding (16px). Images should be high-contrast with desaturated backgrounds to let the products pop. Use 1px charcoal borders for definition.

### Chips & Tags
*   **Status Tags:** Small, uppercase JetBrains Mono text. Use Electric Lime background for "In Stock" or "New" to create immediate visual recognition.

### Additional Components
*   **Progress Bars:** Thin 4px lines. The background is Performance Gray, and the "progress" is a solid Electric Lime glow.
*   **Measurement Grids:** Use 1px dotted lines to create sections for supplement ingredients or apparel sizing charts, maintaining the technical, engineered look.