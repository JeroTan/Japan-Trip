(() => {
  const topics = Array.from(document.querySelectorAll('.howto-contents a'), link => ({
    link,
    heading: document.getElementById(link.hash.slice(1))
  }));
  let current;
  let frame;

  function markCurrentTopic() {
    frame = undefined;
    const readingLine = Math.min(120, window.innerHeight / 4);
    let next = topics[0];
    for (const topic of topics) {
      if (topic.heading.getBoundingClientRect().top > readingLine) break;
      next = topic;
    }
    if (next === current) return;
    current?.link.removeAttribute('aria-current');
    next.link.setAttribute('aria-current', 'location');
    current = next;
  }

  function scheduleUpdate() {
    frame ??= window.requestAnimationFrame(markCurrentTopic);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  markCurrentTopic();
})();
