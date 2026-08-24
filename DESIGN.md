---
name: XII
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#4c4546'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#775928'
  on-secondary: '#ffffff'
  secondary-container: '#ffd79b'
  on-secondary-container: '#7a5c2b'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1c'
  on-tertiary-container: '#838484'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#ffdeae'
  secondary-fixed-dim: '#e8c086'
  on-secondary-fixed: '#281800'
  on-secondary-fixed-variant: '#5d4213'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c6'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  steel: '#A5A5A5'
  charcoal: '#333333'
  bronze: '#7C5A3C'
  surface-off: '#F5F5F2'
typography:
  hero:
    fontFamily: Space Grotesk
    fontSize: 96px
    fontWeight: '700'
    lineHeight: 100px
    letterSpacing: -0.02em
  display:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.01em
  page-title:
    fontFamily: Space Grotesk
    fontSize: 56px
    fontWeight: '600'
    lineHeight: 64px
  section-title:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  card-title:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  body-lg:
    fontFamily: IBM Plex Sans
    fontSize: 22px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: IBM Plex Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  label-caps:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: 1.5px
  caption:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  hero-mobile:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
  display-mobile:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
spacing:
  unit: 8px
  gutter: 32px
  margin-desktop: 64px
  margin-mobile: 24px
  container-max: 1440px
---

## Brand & Style
The design system is rooted in **Architectural Luxury Brutalism** and **Editorial Minimalism**. It treats the digital interface as a physical gallery space where the timepieces are the sole exhibits. The personality is confident, precise, and uncompromisingly bold, favoring raw geometric structures over digital softness.

The aesthetic ignores contemporary trends like rounded corners or depth-mimicking shadows. Instead, it relies on heavy 4px strokes, massive typographic scales, and intentional asymmetry to create a sense of permanence and authority. The experience is designed to feel like a high-end architecture monograph—heavy, deliberate, and expensive.

## Colors
The palette is monochromatic and structural, with Luxury Gold reserved for moments of critical distinction and value. 

- **Primary Black (#000000):** Used for all structural borders, primary headings, and buttons.
- **Neutral White (#FFFFFF):** The primary canvas, maximizing negative space.
- **Concrete (#D9D9D9) & Steel (#A5A5A5):** Used for background sections and secondary UI elements to provide an industrial, architectural contrast.
- **Luxury Gold (#B08D57):** Reserved for accenting exclusivity—price tags, "Authentic" badges, or active states in navigation.

Never use gradients or transparency. Color should be applied in solid, flat blocks to maintain the brutalist integrity of the design system.

## Typography
Typography is the secondary hero of the design system. **Space Grotesk** provides a technical, geometric edge for all headlines and labels, while **IBM Plex Sans** ensures legibility for editorial descriptions and technical specifications.

For buttons and navigation items, always use the `label-caps` style. This emphasizes the confident and authoritative voice of the brand. Large headlines should utilize tight letter-spacing to enhance the "architectural" density of the type, while smaller labels require generous tracking for a premium feel.

## Layout & Spacing
The layout follows a strict 12-column fluid grid that locks into a 1440px container on desktop. Drawing inspiration from editorial design, the system uses intentional asymmetry—leaving entire columns empty to create focal points.

- **Desktop:** 12 columns, 32px gutters, 64px margins.
- **Tablet:** 8 columns, 24px gutters, 40px margins.
- **Mobile:** 4 columns, 16px gutters, 24px margins.

Spacing should be used aggressively. When in doubt, increase the vertical rhythm (padding-top/bottom) to ensure each "Timepiece" or editorial section feels like its own distinct chapter.

## Elevation & Depth
This design system is strictly flat. Depth is achieved exclusively through **composition, contrast, and overlapping planes**, never through shadows or blurs.

- **Tonal Layering:** Use Concrete (#D9D9D9) or Steel (#A5A5A5) backgrounds to sit "behind" White (#FFFFFF) content cards.
- **Heavy Borders:** Every interactive element and distinct section is defined by a 4px solid black border. This "thick stroke" approach creates a tactile, physical presence without needing 3D effects.
- **Inversion:** To show focus or state changes (hover), invert the colors (e.g., White background/Black text becomes Black background/White text).

## Shapes
The shape language is absolute: **0px border radius.** Every element—from primary buttons to image containers and input fields—must be a perfect rectangle or square. This reinforces the architectural and brutalist nature of the design system, reflecting the precision of luxury watch engineering.

## Components

### Buttons
Primary buttons are large, square, and feature a 4px black border. Use `label-caps` for the text. 
- **Default:** White background, Black border, Black text.
- **Hover:** Black background, Black border, White text.
- **Tertiary/Gold:** Gold background for critical "Buy/Inquire" actions.

### Cards
Cards for "Timepieces" should be simple containers with a 4px border. The image should be the primary focus, followed by a Card Title (Space Grotesk) and Price (Gold). No padding between the image and the top/side borders of the card.

### Inputs & Selection
Input fields are 4px black-bordered rectangles. Use IBM Plex Sans for placeholder text. For Checkboxes and Radio buttons, use 4px-bordered squares; active states are filled with a solid black square (not a checkmark).

### Lists & Navigation
Navigation is minimal and uppercase. On hover, the text should simply bold or show a 4px underline that connects to the grid lines. Lists (specifications) should be separated by 2px horizontal dividers.

### Chips
Square "badges" with 2px borders. Used for "New Arrival" or "Rare" labels. Keep the background color white and the text black to maintain the editorial look.