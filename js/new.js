import { fetchAsync } from "./UtilFunctions.js";

const rouletteForm = document.getElementsByClassName("roulette-form")[0];
const rouletteFormSubmitBtn = document.getElementById("roulette-form-submit");
const rouletteFormInput = document.getElementById("roulette-form-input");
const rouletteFormSubmitErrors = [];
let rouletteData = undefined;

const rouletteSliderContainer = document.getElementsByClassName("roulette-slider-container")[0];
const rouletteSlider = document.getElementsByClassName("roulette-slider")[0];
let currentSlideIndex = 0; // represent index of the middle vissibile slide
let slidesToShow = 5; // accept only odd values

const rouletteRollButton = document.getElementsByClassName('roulette-slider-roll')[0]

rouletteFormSubmitBtn.addEventListener("click", rouletteFormSubmitHandler);
rouletteRollButton.addEventListener("click", rouletteRoll)

function rouletteFormSubmitHandler() {
  validateRouletteForm(); // will put an errors to rouletteFormSubmitErrors
  if (!rouletteFormSubmitErrors.length) {
    getRouletteData();
  }
}

function validateRouletteForm() {
  return true;
}

function getRouletteData() {
  const username = rouletteFormInput.value || "Insonit Venatus";
  const fetchLink = `https://shikimori.one/api/users/${username}/anime_rates?status=planned&limit=5000`;
  fetchAsync(fetchLink)
    .then((response) => {
      if (!response.code) {
        rouletteData = response;
        loadRoulette();
      }
    })
    .catch((error) => {
      console.log(error.message); // check why erors not catched
    });
}

// Function to get the indexes of visible items based on the middle item being at index 0 and the number of visible items
function getRouletteItems(slidesToShow) {
  const arrayLength = rouletteData.length;
  const slidesToLoad = slidesToShow + 4; // @TOTEST represents 2 preloaded slides on left and right
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
    title.appendChild(document.createTextNode(item.anime.name))
    slide.appendChild(title)

    rouletteSlider.appendChild(slide);
  });
}
function rouletteNextTick() {
  rouletteSlider.removeChild(rouletteSlider.firstElementChild);

  const newSlideData = getRouletteItems(slidesToShow)[getRouletteItems(slidesToShow).length - 1]
  const slide = document.createElement("div");
  slide.classList.add("roulette-element");

  const img = document.createElement("img");
  img.src = `https://shikimori.one${newSlideData.anime.image.preview}`;
  img.setAttribute("data-name", newSlideData.anime.name);
  slide.appendChild(img);

  const title = document.createElement("h3");
  title.appendChild(document.createTextNode(newSlideData.anime.name))
  slide.appendChild(title)

  rouletteSlider.appendChild(slide);

}


function rouletteSlide() {
  const duration = 1000

  rouletteSlider.style.transition = `${duration}ms`
  rouletteSlider.style.transform = `translateX(-20%)`

  currentSlideIndex++

  setTimeout(() => {
    rouletteNextTick()
    rouletteSlider.style.transition = `0s`
    rouletteSlider.style.transform = `translateX(0)`
    rouletteRollButton.disabled = false
  }, duration)

}

function rouletteRoll() {
  rouletteRollButton.disabled = true
  rouletteSlide()
}


