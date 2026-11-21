# Japan trip guide

Status: ready-for-agent

## Problem Statement

During the November 24–28, 2026 business trip, the group needs a phone-friendly way to find its next stop, ticketed flights, hotel windows and practical Japanese. The Thailand trip guide provides the reference experience. Bookings take priority over a changing work agenda.

## Solution

Build a local, responsive travel guide for Nagoya, Tokyo and Narita. The overview leads into five day itineraries, a transport and bookings guide, preparation reminders, optional hobby shops and a Japanese phrasebook. Each view can be linked directly and opened from the local files.

## User Stories

1. As a traveler, I can see the dates, cities and trip route at a glance.
2. I can open any trip date and navigate between days.
3. I can follow activities in chronological order and choose a complete midnight-to-11-PM timetable.
4. I can see Manila and Japan local times on both flights.
5. I can tell ticketed flights and confirmed hotel windows from provisional visits.
6. I can find directions for known stops and switch between route legs.
7. I can see all three stays and which hotel times I still need to confirm.
8. I can find the five optional hobby shops on their possible dates and open their original maps.
9. I can tick travel-preparation and optional shopping items and find my progress after reloading.
10. I can reach the official Visit Japan Web and Philippine eTravel services and see the trip-specific timing.
11. I can search for a Japanese phrase, filter by situation, read its pronunciation, copy it and show it to someone in large type.
12. I can use the guide by keyboard, from a phone, or directly from local files.

## Implementation Decisions

- Use a static entry page and local scripts, styles and imagery. Use URL fragments for overview, each day, transport, preparation and phrases.
- The updated Japan workbook supplies the agenda, flights, hotel dates/windows, terminals, checklist and hobby options. Do not copy travel documents or booking credentials into web assets.
- Keep devices' checklist progress local. External maps and government forms open only on request.
- Use a railway field-guide visual direction with legible type, light paper, dark ink, a vermilion accent, route markers and a Japan travel image.
- Primary navigation and accessible mobile controls stay consistent across views.

## Testing Decisions

Exercise the public browser interface with keyboard and pointer. Verify deep links, browser back, timetable hours and booking precedence, maps, saved progress, phrase search, copy and large-type display. Check phone and desktop layout and the standalone file entry point. The reference is a buildless static site with no existing test suite.

## Out of Scope

Booking changes, live transit or fare predictions, collecting personal travel documents and external deployment.

## Further Notes

The Narita hotel permits check-in after 15:00. The morning stop is provisional. The return flight leaves Narita Terminal 2 at 19:00 JST on November 28 and arrives in Manila at 23:35 PHT.
