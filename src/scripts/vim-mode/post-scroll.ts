let isScrolling = false; // 滚动状态标志
const scrollAmount = 12; // 每次滚动的像素值
const scrollInterval = 16;
let scrollTimer: number; // 定时器

document.addEventListener("keydown", function(event) {
  if (event.key === "j" || event.key === "k") {
    if (!isScrolling) {
      isScrolling = true;
      scrollTimer = setInterval(() => {
        window.scrollBy(0, scrollAmount * (event.key === "j" ? 1 : -1));
      }, scrollInterval);
    }
  }
});

document.addEventListener('keyup', function(event) {
  if ((event.key === "j" || event.key === "k")&& isScrolling) {
    clearInterval(scrollTimer);
    isScrolling = false;
  }
});
