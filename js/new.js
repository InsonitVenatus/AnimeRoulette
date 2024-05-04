import { fetchAsync, getRandomInt, preloadImage } from "./UtilFunctions.js";

const rouletteForm = document.getElementsByClassName("roulette-form")[0];
const rouletteFormSubmitBtn = document.getElementById("roulette-form-submit");
const rouletteFormInput = document.getElementById("roulette-form-input");
const rouletteFormSubmitErrors = [];
let rouletteData = undefined;

const rouletteSliderContainer = document.getElementsByClassName("roulette-slider-container")[0];
const rouletteSlider = document.getElementsByClassName("roulette-slider")[0];
let currentSlideIndex = 0; // represent index of the middle vissibile slide
let slidesToShow = 5; // accept only odd values

const rouletteRollButton = document.getElementsByClassName("roulette-slider-roll")[0];
const rouletteWinner = document.getElementsByClassName("roulette-slider-winner")[0];

rouletteFormSubmitBtn.addEventListener("click", rouletteFormSubmitHandler);
rouletteRollButton.addEventListener("click", rouletteRoll);

function rouletteFormSubmitHandler() {
  validateRouletteForm(); // will put an errors to rouletteFormSubmitErrors
  if (!rouletteFormSubmitErrors.length) {
    getRouletteData();
  }
}

function validateRouletteForm() {
  return true;
}

async function preloadImages() {
  const promises = rouletteData.map((item) =>
    preloadImage(`https://shikimori.one${item.anime.image.preview}`)
  );
  await Promise.all(promises);
  console.log("All images preloaded.");
}

function getRouletteData() {
  const username = rouletteFormInput.value || "Insonit Venatus";
  const fetchLink = `https://shikimori.one/api/users/${username}/anime_rates?status=planned&limit=5000`;
  fetchAsync(fetchLink).then((response) => {
    if (!response.code) {
      // Assuming response.code indicates an error
      rouletteData = response;
      preloadImages().then(loadRoulette);
    }
  });
}

// Function to get the indexes of visible items based on the middle item being at index 0 and the number of visible items
function getRouletteItems(slidesToShow) {
  const arrayLength = rouletteData.length;
  const slidesToLoad = slidesToShow + 10; // @TOTEST represents 5 preloaded slides on left and right
  const slideIndexes = [];
  for (
    let i = -Math.floor(slidesToLoad / 2);
    i <= Math.floor(slidesToLoad / 2);
    i++
  ) {
    const calculatedIndex = (currentSlideIndex + i + arrayLength) % arrayLength;
    slideIndexes.push(calculatedIndex);
  }
  return slideIndexes.map((index) => rouletteData[index]);
}

function loadRoulette() {
  rouletteForm.classList.add("display-none");
  rouletteSliderContainer.classList.remove("display-none");
  // move display logic above to separate section

  const rouletteItems = getRouletteItems(slidesToShow);
  rouletteItems.forEach((item) => {
    // separate the code below to function which we can use in rouletteNextTick as well
    const slide = document.createElement("div");
    slide.classList.add("roulette-element");

    const img = document.createElement("img");
    img.src = `https://shikimori.one${item.anime.image.preview}`;
    img.setAttribute("data-name", item.anime.name);
    slide.appendChild(img);

    const title = document.createElement("h3");
    title.classList.add('roulette-element-title')
    title.appendChild(document.createTextNode(item.anime.name));
    slide.appendChild(title);

    rouletteSlider.appendChild(slide);
  });
  rouletteWinner.appendChild(document.createTextNode(rouletteData[currentSlideIndex].anime.name))
}
function rouletteNextTick() {
  currentSlideIndex++;
  rouletteSlider.removeChild(rouletteSlider.firstElementChild);

  const newSlideData = getRouletteItems(slidesToShow)[getRouletteItems(slidesToShow).length - 1];
  const slide = document.createElement("div");
  slide.classList.add("roulette-element");

  const img = document.createElement("img");
  img.src = `https://shikimori.one${newSlideData.anime.image.preview}`;
  img.setAttribute("data-name", newSlideData.anime.name);
  slide.appendChild(img);

  const title = document.createElement("h3");
  title.classList.add('roulette-element-title')
  title.appendChild(document.createTextNode(newSlideData.anime.name));
  slide.appendChild(title);

  rouletteSlider.appendChild(slide);
}

function rouletteSlide(duration) {
  return new Promise((resolve) => {
    // Apply transition dynamically
    rouletteSlider.style.transition = `transform ${duration}ms linear`;
    rouletteSlider.style.transform = "translateX(-20%)";

    // Resolve the promise after the animation duration
    setTimeout(() => {
      resolve();
    }, duration);
  }).then(() => {
    // After the duration, reset the position and increment the index
    return new Promise((resolve) => {
      // Wait for the next tick to ensure transition is applied
      requestAnimationFrame(() => {
        // Reset transition and position
        rouletteNextTick();
        rouletteSlider.style.transition = "none"; // Reset transition
        rouletteSlider.style.transform = "translateX(0%)"; // Reset position
        rouletteWinner.innerHTML = ''
        rouletteWinner.appendChild(document.createTextNode(rouletteData[currentSlideIndex].anime.name))
        // Force DOM update with a slight delay
        setTimeout(() => {
          resolve();
        }, 0); // Adjust delay as needed
      });
    });
  });
}

async function rouletteRoll() {
  rouletteRollButton.disabled = true;

  const BASE_DURATION = 100; // using numbers for durations
  const INCREMENTAL_DURATIONS = [200, 300, 400];
  const rollDurationsArray = [];
  const totalRolls = getRandomInt(40, 60);

  for (let i = 0; i < totalRolls; i++) {
    rollDurationsArray.push(BASE_DURATION);
  }
  INCREMENTAL_DURATIONS.forEach(duration => {
    rollDurationsArray.push(duration);
    rollDurationsArray.unshift(duration);
  });

  console.log(rollDurationsArray);

  for (const duration of rollDurationsArray) {
    await rouletteSlide(duration);
  }

  rouletteRollButton.disabled = false;
}
