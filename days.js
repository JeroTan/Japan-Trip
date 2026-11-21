(() => {
  "use strict";

  const day = document.querySelector('main[data-view="day"]');
  if (!day) return;

  const leg = day.querySelector("#jd-route-leg");
  const stop = day.querySelector("#jd-map-stop");
  const directions = day.querySelector(".jd-directions");
  const place = day.querySelector(".jd-place");
  const preview = day.querySelector(".jd-place-preview");
  const routeList = day.querySelector(".jd-route-alternatives");
  const routes = [...routeList.querySelectorAll("li")];
  for (const route of routes) {
    const [embedded, external] = route.querySelectorAll("a");
    const selected = external.href === directions.href;
    leg.add(new Option(embedded.textContent, external.href, selected, selected));
  }

  function showLeg() {
    const [embedded, external] = routes[leg.selectedIndex].querySelectorAll("a");
    directions.href = external.href;
    const frame = day.querySelector(".jd-route-map");
    if (frame.src === embedded.href) return;
    // A new frame keeps map changes out of the traveler's Back history.
    const next = frame.cloneNode(false);
    next.src = embedded.href;
    next.title = "Route: " + embedded.textContent;
    frame.replaceWith(next);
  }

  function showStop() {
    place.hidden = !stop.value;
    preview.replaceChildren();
    if (!stop.value) return;

    place.href = stop.value;
    const embed = new URL("https://www.google.com/maps");
    embed.searchParams.set("q", new URL(stop.value).searchParams.get("query"));
    embed.searchParams.set("output", "embed");
    const frame = document.createElement("iframe");
    frame.src = embed.href;
    frame.title = "Map of " + stop.selectedOptions[0].textContent;
    frame.referrerPolicy = "no-referrer-when-downgrade";
    frame.allowFullscreen = true;
    preview.append(frame);
  }

  for (const picker of day.querySelectorAll(".jd-route-picker")) picker.hidden = false;
  routeList.hidden = true;
  leg.addEventListener("change", showLeg);
  stop.addEventListener("change", showStop);

  const progress = window.JapanTrip.progress;
  const shops = day.querySelector(".jd-shops");
  shops.addEventListener("change", event => {
    const box = event.target;
    if (box.matches('input[type="checkbox"]')) progress.set(box.value, box.checked);
  });

  function refreshProgress() {
    const saved = progress.read();
    for (const box of shops.querySelectorAll('input[type="checkbox"]')) {
      box.checked = saved[box.value] === true;
    }
  }

  refreshProgress();
  window.addEventListener("storage", refreshProgress);
  window.addEventListener("pageshow", () => {
    showLeg();
    showStop();
    refreshProgress();
  });
})();
