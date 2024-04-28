import VimModeKeyHandler from "./key-handler";

let isScrolling = false;
const scrollAmount = 12;
const scrollInterval = 16;
let scrollTimer: number;

function handleScroll(direction: "up" | "down") {
  if (!isScrolling) {
    isScrolling = true;
    scrollTimer = setInterval(() => {
      window.scrollBy(0, scrollAmount * (direction=== "down" ? 1 : -1));
    }, scrollInterval);
  }
}

function handleStopScroll() {
  if (isScrolling) {
    clearInterval(scrollTimer)
    isScrolling = false
  }
}

function handleLeap(to: "top" | "end") {
  if (to === "top") {
    window.scrollTo(0, -document.body.scrollHeight);
  } else if (to === "end") {
    window.scrollTo(0, document.body.scrollHeight)
  }
}

const keyHandler = new VimModeKeyHandler();

keyHandler.subscribe("j", () => handleScroll("down"), {
  onKeyUp: handleStopScroll
})
keyHandler.subscribe("k", () => handleScroll("up"), {
  onKeyUp: handleStopScroll
})
keyHandler.subscribe("gg", () => handleLeap("top"));
keyHandler.subscribe("G", () => handleLeap("end"));

keyHandler.start();
