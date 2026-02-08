# ITU Calendar Work Log

## Session: February 8, 2026

### What was done:
1. **Added Computer Systems Performance (CSP) events**
   - 12 lectures with detailed topics (L1-L12)
   - Breaks noted: Mar 25, Apr 1 (Easter), Apr 15
   - Final submission: May 22
   - Oral exams: June 10-12

2. **Fixed May events not showing**
   - Root cause: Danish month names ("Maj") weren't recognized by JavaScript Date parser
   - Solution: Added numeric month index to MonthData interface

3. **Added Software Architecture (SWA) missing May events**
   - L14: Legacy systems & Ethics (May 4)
   - D6: Architecture Recovery (May 3)
   - D7: Report Submission (May 17)
   - R6: Recovery review (May 17)

4. **Added Research Project events**
   - Information Meeting: Jan 26
   - D1: Group Formation: Feb 13
   - D2: Preliminary Project Statement: Feb 20
   - D3: Project Report: May 15

5. **Updated DevOps lectures with topics**
   - All 14 lectures now have descriptive titles
   - Added exam period: June 1-4
   - Report deadline: May 18

6. **Cleaned up duplicate exams**

7. **CSS fixes**
   - Fixed long event titles pushing date numbers out of alignment
   - Added flex-shrink: 0 to day-weekday and day-number
   - Added min-width: 0 to day-events container

8. **Deployment setup**
   - Created new Cloudflare Pages project: `itu-cal`
   - Custom domain: calendar.leosakharoff.com (DNS should propagate)
   - Site is live at: https://itu-cal.pages.dev

### What still needs work:
- [ ] Research Project oral exam dates (scheduled individually with supervisor after May 15)
- [ ] Long event titles still overflow on some rows - consider tooltip on hover instead of inline expansion
- [ ] GitHub Actions workflow created but not tested (needs CLOUDFLARE_API_TOKEN secret)
- [ ] Could add ability to export to .ics format for calendar apps
- [ ] Consider adding week view or list view options

### Technical notes:
- Supabase project: aiepgqbxejtzpctomfnv
- Cloudflare Pages project: itu-cal
- GitHub repo: leosakharoff/itu-calendar
- Course IDs:
  - Software Architecture: eeeb2ca3-44e0-4d1f-b212-19ea53d1b126
  - DevOps: e69384b2-80de-4e94-96de-cc176c21ecc5
  - CSP: 18625cb2-1668-46ae-89d8-9670899c0f32
  - Research Project: (uses name matching)
