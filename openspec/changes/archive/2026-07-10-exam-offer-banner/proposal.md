## Why

The homepage needs a prominent promotional banner to highlight the free eye exam offer (100% bonificado) with the purchase of prescription lenses. This will drive more appointment bookings and increase conversion by making the value proposition immediately visible to visitors.

## What Changes

- Add a new `ExamOfferBanner` section component to the homepage.
- Position the banner immediately after the `WhyChooseUs` section.
- The banner shall display a promotional headline, descriptive text, and a call-to-action button to book an appointment.
- The banner shall use a two-column layout: text content on the left with a dark blue background, and a promotional image on the right.
- The banner shall be responsive, stacking vertically on mobile.
- All content shall be hardcoded in-memory data as per project conventions (no backend required).

## Capabilities

### New Capabilities

- `exam-offer-banner`: A promotional banner section on the homepage highlighting the free eye exam offer with purchase of graduated lenses, featuring a headline, description, CTA button, and promotional image.

### Modified Capabilities

<!-- No existing capability requirements are changing. The why-choose-us section keeps its existing requirements; only the page composition on the homepage is extended. -->

## Impact

- **Frontend**: New React component (`ExamOfferBanner`) added to `src/components/`. Homepage route updated to include the new section.
- **Styling**: Uses Tailwind CSS with project theme tokens. New colors or tokens may be added to the theme if needed.
- **Dependencies**: No new runtime dependencies expected. May reuse existing shadcn/ui `Button` component.
- **Backend/API**: None. All data is hardcoded in the component/service layer.
