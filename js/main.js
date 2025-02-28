const titles = JSON.parse(localStorage.getItem('titles')) || [];
const imageCache = new Map();

let profileUrl = "https://shikimori.one/Insonit+Venatus";

document.addEventListener('DOMContentLoaded', function() {
  const inputField = document.getElementById('inputField');
  const submitButton = document.getElementById('submitButton');
  const warningMessage = document.getElementById('warningMessage');

  submitButton.addEventListener('click', function() {
    const inputData = inputField.value.trim();

    if (inputData === '') {
      // If empty, display the warning message
      warningMessage.style.display = 'block';
    } else {
      let queryLink = getQueryUrl(inputData);
      fetchAnimeTitles(queryLink);
      // Clear the warning message
      warningMessage.style.display = 'none';
    }
  });
});

async function fetchAnimeTitles(queryLink) {
  try {
    // Виконуємо запит до API
    const response = await fetch(queryLink);

    // Перевіряємо, чи запит був успішним
    if (!response.ok) {
      throw new Error(`Помилка запиту: ${response.status} ${response.statusText}`);
    }

    // Отримуємо дані у форматі JSON
    const data = await response.json();

    if (Array.isArray(data)) {
      titles.length = 0;
      // Loop through jsonResponse and push each item into titles
      data.forEach(item => {
        if (item.anime.status !== "anons"){
          titles.push({
            name: item.anime.name,
            image: item.anime.image.original
          });
        }
      });
      if (titles.length>10) {
        const slider = document.querySelector('.roulette__slider');
        for (let i = 0; i < 5; i++) {
          const element = document.createElement('div');
          element.classList.add('roulette__element');
          element.classList.add('roulette__element_disabled');
          const img = document.createElement('img');
          element.appendChild(img);
          slider.insertBefore(element, slider.firstChild);
        }
      }
      //imageCache.clear();
      //console.log('Кеш очищено.');
      await cacheAllImages(titles);
      viewPosters(titles, 0);
      setTitleName();
      // Save titles to Local Storage
      localStorage.setItem('titles', JSON.stringify(titles));
    } else {
        console.error('JSON response is not an new Array');
    }
    console.log('Дані успішно завантажено:', titles);
  } catch (error) {
    console.error('Помилка під час завантаження даних:', error);
  }
}

async function cacheAllImages(titles, limit = 10) {
    const activePromises = []; // Масив для відстеження активних промісів

    try {
        for (const title of titles) {
            const imageUrl = 'https://shikimori.one' + title.image;

            // Створюємо проміс для завантаження зображення
            const promise = loadImage(imageUrl).then(image => {
                imageCache.set(imageUrl, image); // Зберігаємо зображення в кеші
            }).finally(() => {
                // Видаляємо проміс з масиву активних після завершення
                activePromises.splice(activePromises.indexOf(promise), 1);
            });

            // Додаємо проміс до масиву активних
            activePromises.push(promise);

            // Якщо кількість активних промісів перевищує обмеження, чекаємо завершення одного з них
            if (activePromises.length >= limit) {
                await Promise.race(activePromises);
            }
        }

        // Чекаємо завершення всіх активних промісів
        await Promise.all(activePromises);
        console.log('Усі зображення завантажено та закешовано.');
    } catch (error) {
        console.error('Помилка під час завантаження зображень:', error);
    }
}

// Функція для завантаження одного зображення
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Не вдалося завантажити зображення: ${url}`));
    });
}


function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setTitleName () {
	let titleName = document.querySelector('.roulette__element_center').querySelector('img').dataset.name;
	document.querySelector('.roulette__text').querySelector('p').innerHTML=titleName;
}

function viewPosters (animeList, index) {
	const slider = document.querySelectorAll('.roulette__element');
	for (var i = 0; i < slider.length; i++) {
    let realIndex=index;
    if (realIndex<0) {
      while (realIndex<0) {
        realIndex=animeList.length-1+realIndex;
      }
    }
		let link = 'https://shikimori.one'+animeList[realIndex].image;
    let imgElement = slider[i].querySelector('img');
		if (imageCache.has(link)) {
      imgElement.src = imageCache.get(link).src;
    } else {
      console.warn(`Зображення не знайдено в кеші: ${link}`);
    }
		slider[i].querySelector('img').setAttribute('data-name', animeList[realIndex].name);
    index++;
	}
}



function Roll (titles) {
	let animeList = shuffleArray(titles);

	let delay = 500;
    const maxDelay = 500;
    const totalTime = 20000;
    const thresholdTime = totalTime * 0.7;
    let currentElement = 0;
    let elapsedTime = 0;

    const startTime = Date.now();

    const executeShift = () => {
		  viewPosters(animeList, currentElement);
		  setTitleName();
      currentElement--;
    	const now = Date.now();
    	elapsedTime = now - startTime;
    	const progress = elapsedTime / totalTime;

    	if (elapsedTime < totalTime) {
      	if (elapsedTime >= thresholdTime) {
        		delay = Math.min(delay + (maxDelay - delay) * progress, maxDelay);
      	} 
      	else {
        		delay = Math.min(delay * 1.02, maxDelay);
      	}
      	setTimeout(() => {
          executeShift();
        }, delay);
    	}
    	else {
    		let sound = document.getElementById("winner");
    		//sound.play();
    		let winner = document.querySelector('.roulette__text').querySelector('p');
    		winner.style.color = 'red';
    		let poster = document.querySelector('.roulette__element_center').querySelector('img');
    		poster.style.border = '5px solid red';
    	}
  	};
  	executeShift();
}

function getQueryUrl(nickname){
  let formattedNickname = nickname.replace(/\s+/g, '+');
  let query = `https://shikimori.one/api/users/${formattedNickname}/anime_rates?status=planned&limit=5000`;
  return query;
}
