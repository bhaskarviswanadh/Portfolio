/* ============================================================
   TIMELINE.JS — Engineering Journey timeline
   ============================================================ */

export function initTimeline() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.timeline-item').forEach(item => {
    observer.observe(item);
  });
}
