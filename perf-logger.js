/**
 * perf-logger.js
 * Captures Navigation Timing API metrics and renders them
 * to the #perf-dashboard element on each page load.
 */

(function () {
  function getColor(value, thresholds) {
    if (value <= thresholds.good) return '';
    if (value <= thresholds.warn) return 'warn';
    return 'danger';
  }

  function renderDashboard(nav) {
    const dashboard = document.getElementById('perf-dashboard');
    if (!dashboard) return;

    const ttfb      = nav.responseStart - nav.requestStart;
    const dcl       = nav.domContentLoadedEventEnd - nav.startTime;
    const load      = nav.loadEventEnd - nav.startTime;
    const dns       = nav.domainLookupEnd - nav.domainLookupStart;
    const tcp       = nav.connectEnd - nav.connectStart;
    const navType   = nav.type; // 'navigate', 'prerender', 'reload', 'back_forward'

    const isPrerendered = navType === 'prerender' ||
      (performance.getEntriesByType('navigation')[0]?.activationStart > 0);

    const activationStart = performance.getEntriesByType('navigation')[0]?.activationStart ?? 0;
    const perceivedLoad   = Math.max(0, load - activationStart);

    const metrics = [
      {
        label: 'TTFB',
        value: ttfb.toFixed(1),
        unit: 'ms',
        color: getColor(ttfb, { good: 100, warn: 300 }),
      },
      {
        label: 'DOM Content Loaded',
        value: dcl.toFixed(1),
        unit: 'ms',
        color: getColor(dcl, { good: 500, warn: 1200 }),
      },
      {
        label: 'Page Load',
        value: load.toFixed(1),
        unit: 'ms',
        color: getColor(load, { good: 1000, warn: 2500 }),
      },
      {
        label: 'DNS Lookup',
        value: dns.toFixed(1),
        unit: 'ms',
        color: '',
      },
      {
        label: 'TCP Connect',
        value: tcp.toFixed(1),
        unit: 'ms',
        color: '',
      },
      {
        label: 'Perceived Load',
        value: perceivedLoad.toFixed(1),
        unit: 'ms',
        color: getColor(perceivedLoad, { good: 100, warn: 500 }),
      },
    ];

    const navBadgeClass = isPrerendered ? 'prerender' : 'navigate';
    const navBadgeText  = isPrerendered ? '⚡ Prerendered navigation' : '↗ Normal navigation';

    dashboard.innerHTML = `
      <h2>Performance Metrics</h2>
      <div class="nav-type-badge ${navBadgeClass}">${navBadgeText}</div>
      <div class="perf-grid">
        ${metrics.map(m => `
          <div class="perf-metric">
            <div class="label">${m.label}</div>
            <div class="value ${m.color}">${m.value}<span class="unit">${m.unit}</span></div>
          </div>
        `).join('')}
      </div>
      <p class="perf-note">
        ${isPrerendered
          ? `Activation offset: ${activationStart.toFixed(1)}ms — page was prerendered before you clicked.`
          : 'No prerender detected. This was a standard navigation.'}
        Metrics from Navigation Timing API (Level 2).
      </p>
    `;
  }

  function init() {
    // Use requestAnimationFrame + setTimeout to ensure paint is complete
    // and timing entries are fully populated
    window.addEventListener('load', () => {
      setTimeout(() => {
        const entries = performance.getEntriesByType('navigation');
        if (!entries.length) return;
        renderDashboard(entries[0]);
      }, 100);
    });
  }

  init();
})();
