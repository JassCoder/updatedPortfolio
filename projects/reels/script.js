/*
Click behavior:
- click card -> play that one
- click same -> stop (pause)
- click another -> stop previous, play new
Works for Vimeo + YouTube.
*/

const cards = document.querySelectorAll(".card");
let activeIframe = null;

function vimeoCmd(iframe, method) {
  iframe?.contentWindow?.postMessage(JSON.stringify({ method }), "*");
}

function ytCmd(iframe, func) {
  iframe?.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }),
    "*"
  );
}

function isYouTube(iframe) {
  return iframe?.closest(".card")?.classList.contains("youtube");
}

function pause(iframe) {
  if (!iframe) return;
  isYouTube(iframe) ? ytCmd(iframe, "pauseVideo") : vimeoCmd(iframe, "pause");
}

function play(iframe) {
  if (!iframe) return;
  isYouTube(iframe) ? ytCmd(iframe, "playVideo") : vimeoCmd(iframe, "play");
}

// init all iframes with correct src
cards.forEach(card => {
  const id = card.dataset.video;
  const iframe = card.querySelector("iframe");

  iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media");
  iframe.setAttribute("allowfullscreen", "");

  if (card.classList.contains("youtube")) {
    // enablejsapi=1 is REQUIRED for play/pause commands
    iframe.src =
      `https://www.youtube.com/embed/${id}` +
      `?enablejsapi=1&autoplay=0&controls=0&playsinline=1&rel=0`;
  } else {
    // IMPORTANT: no background=1 (it can autoplay/loop)
    iframe.src =
      `https://player.vimeo.com/video/${id}` +
      `?autoplay=0&muted=1&controls=0&title=0&byline=0&portrait=0`;
  }

  card.addEventListener("click", () => {
    // click same -> stop
    if (activeIframe === iframe) {
      pause(iframe);
      activeIframe = null;
      return;
    }

    // stop previous
    pause(activeIframe);

    // play current
    play(iframe);
    activeIframe = iframe;
  });
});
