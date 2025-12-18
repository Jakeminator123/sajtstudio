# Content Management System (CMS)

## Overview

Sajtstudio uses a SQLite-based CMS for managing homepage content. Content is organized using a consistent key naming scheme:

- **T\*** - Text content (T1, T2, T3...)
- **B\*** - Images/Bilder (B1, B2, B3...)
- **V\*** - Videos (V1, V2, V3...)

## Content Key Mapping

### Hero Section
| Key | Type | Description |
|-----|------|-------------|
| T1 | text | Hero main heading |
| T2 | text | Hero subtitle/tagline |
| T3 | text | CTA button text |
| T4 | text | Secondary CTA text |
| B1 | image | Hero background image |
| V1 | video | Hero background video |

### About Section
| Key | Type | Description |
|-----|------|-------------|
| T5 | text | About section title |
| T6 | text | About description |
| T7 | text | Statistic 1 (projects) |
| T8 | text | Statistic 2 (years) |
| T9 | text | Statistic 3 (customers) |

### USP Section
| Key | Type | Description |
|-----|------|-------------|
| T10 | text | USP main heading |
| T11 | text | USP subtitle |
| T12 | text | USP description |
| T13-T16 | text | USP point 1-4 titles |
| T17-T20 | text | USP point 1-4 descriptions |

### Services Section
| Key | Type | Description |
|-----|------|-------------|
| T21-T24 | text | Service 1-4 titles |
| T25-T28 | text | Service 1-4 short descriptions |
| T29-T32 | text | Service 1-4 long descriptions |
| V2 | video | Services background video |

### Process Section
| Key | Type | Description |
|-----|------|-------------|
| T33-T36 | text | Process step 1-4 titles |
| T37-T40 | text | Process step 1-4 descriptions |
| B2 | image | Process background image |

### Testimonials Section
| Key | Type | Description |
|-----|------|-------------|
| T41-T43 | text | Testimonial 1-3 quotes |
| T44-T46 | text | Testimonial 1-3 names |
| T47-T49 | text | Testimonial 1-3 company/role |

### BigCTA Section
| Key | Type | Description |
|-----|------|-------------|
| T50 | text | CTA heading |
| T51 | text | CTA subtext |
| B3 | image | CTA phone image |

### Portfolio/Animation
| Key | Type | Description |
|-----|------|-------------|
| B4-B11 | image | Portfolio images 1-8 |
| V3 | video | Matrix code video |
| V4 | video | About us video |
| V5 | video | Phone ringing video |
| V6 | video | Portfolio explosion video |

### Team Section
| Key | Type | Description |
|-----|------|-------------|
| T52 | text | Team section heading |
| T53 | text | Team intro text |
| T54 | text | Team member 1 name |
| T55 | text | Team member 2 name |
| T56 | text | Team member 3 name |
| T57 | text | Team member 1 role |
| T58 | text | Team member 2 role |
| T59 | text | Team member 3 role |
| T60 | text | Team member 1 description |
| T61 | text | Team member 2 description |
| T62 | text | Team member 3 description |
| T63 | text | Team outro/CTA text |
| T64 | text | Team member 1 LinkedIn URL |
| T65 | text | Team member 2 LinkedIn URL |
| T66 | text | Team member 3 LinkedIn URL |
| B16 | image | Team member 1 profile image |
| B17 | image | Team member 2 profile image |
| B18 | image | Team member 3 profile image |

### Background Images
| Key | Type | Description |
|-----|------|-------------|
| B12 | image | 8-bit background |
| B13 | image | Section background (dark) |
| B14 | image | Section background (light) |
| B15 | image | City background (light) |

## Admin Access

Access the admin panel at `/admin`.

### Credentials

**Development (default):**
- Username: `admin`
- Password: `admin`

**Production:**
Set environment variables:
```env
NEXT_PUBLIC_ADMIN_USERNAME=your-username
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password
```

## API Endpoints

### GET /api/content
Fetch content entries.

Query parameters:
- `key=T1` - Get specific content by key
- `section=hero` - Get all content for a section
- `stats=true` - Get content statistics

### PUT /api/content
Update content entry. Requires API key in production.

Body:
```json
{
  "key": "T1",
  "value": "New heading text"
}
```

### POST /api/content
Special actions (requires API key).

Seed defaults:
```json
{ "action": "seed" }
```

Reset to default:
```json
{ "action": "reset", "key": "T1" }
```

## Environment Variables

```env
# Admin credentials (optional in dev, required in prod)
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=your-password

# Content API key (optional in dev)
CONTENT_API_KEY=your-api-key
NEXT_PUBLIC_CONTENT_API_KEY=your-api-key

# Contacts API key (optional)
CONTACTS_API_KEY=your-api-key
NEXT_PUBLIC_CONTACTS_API_KEY=your-api-key

# Email sending (for contact form)
RESEND_API_KEY=re_xxx
```

## Database

Content is stored in `content.db` (SQLite) at the project root.

To seed the database with default values:
```bash
npx tsx scripts/seed-content.ts
```

Or use the "Fyll standardvärden" button in the admin panel.

## Using Content in Components

### Server Components
```tsx
import { getContent, getSection, CONTENT_KEYS } from "@/lib/get-content";

// Get single value
const title = getContent(CONTENT_KEYS.HERO_TITLE, "Default Title");

// Get entire section
const heroContent = getSection("hero");
```

### Client Components
```tsx
import { useContent, useContentSection } from "@/hooks/useContent";

// Single value
const { value, isLoading } = useContent("T1", "Default");

// Entire section
const { contentMap, getValue } = useContentSection("hero");
const title = getValue("T1", "Default");
```

## Fallback Behavior

If a content key is not found in the database, the system automatically falls back to hardcoded default values defined in `src/lib/content-database.ts`. This ensures the site always displays content even if the database is empty.

