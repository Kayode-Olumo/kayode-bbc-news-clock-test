const lowerThirds = document.getElementById("lower-thirds");
const newsText = document.getElementById("news-text");

let isVisible = false;

function leftTab(state, text) {
  console.log(`leftTab called with: ${state}, ${text}`);

  if (state === "on") {
    if (text) {
      newsText.textContent = text;
    }

    if (!isVisible) {
      lowerThirds.classList.add("visible");
      isVisible = true;
    }
  } else if (state === "off") {
    lowerThirds.classList.remove("visible");
    isVisible = false;
  }
}

window.leftTab = leftTab;

document.addEventListener("keydown", (event) => {
  if (event.key === "o") {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    leftTab("on", `BBC NEWS ${hours}:${minutes}`);
  } else if (event.key === "f") {
    leftTab("off");
  }
});

console.log("BBC News Lower Thirds template loaded");
console.log('Press "o" to test showing the overlay, "f" to test hiding it');
