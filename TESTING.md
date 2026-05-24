# Quick Demo Testing Checklist

Before the live demo, test these items:

1. Open `index.html` through `npm start` or GitHub Pages.
2. Check Current Official Mode → READY / no active warning.
3. Check Historical Scenario buttons:
   - Ready
   - Prepare
   - Act Now
   - Leave Now
   - Connection Lost
4. Check System Modes:
   - Normal
   - Low Battery
   - Connection Lost
   - Night Mode
5. Check AI Risk Analysis with these values:
   - 0.9 m + 4 mm + warning off → READY
   - 1.7 m + 45 mm + warning off → PREPARE
   - 2.3 m + 65 mm + warning off → ACT NOW
   - 2.9 m + 85 mm + warning on → LEAVE NOW
6. Check mobile/PWA layout:
   - phone portrait
   - phone landscape
   - hamburger menu opens/closes the controls drawer
7. Check six languages visually for overlap or broken characters.

If Vercel/OpenRouter is unavailable, AI Analysis should still show a rule-based fallback result instead of only showing “Failed to fetch”.
