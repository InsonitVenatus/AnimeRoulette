const titles = JSON.parse(localStorage.getItem('titles')) || [];

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
      getTitlesArray(queryLink);
      // Clear the warning message
      warningMessage.style.display = 'none';
    }
  });
});

function getTitlesArray(queryLink) {
  // Make a GET request
  const xhr = new XMLHttpRequest();

  xhr.open('GET', queryLink, true);

  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      // Request was successful, parse the JSON response
      const jsonResponse = JSON.parse(xhr.responseText);
      
      // Check if jsonResponse is an array
      if (Array.isArray(jsonResponse)) {
        titles.length = 0;
        // Loop through jsonResponse and push each item into titles
        jsonResponse.forEach(item => {
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
        viewPosters(titles, 0);
        setTitleName();
        // Save titles to Local Storage
        localStorage.setItem('titles', JSON.stringify(titles));
      } else {
        console.error('JSON response is not an new Array');
      }

    } else {
      // Request failed
      console.error('This profile does not exist or closed');
    }
  };

  xhr.onerror = function() {
    // Network errors
    console.error('Failed to load data');
  };

  xhr.send();
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
		slider[i].querySelector('img').src=link;
		slider[i].querySelector('img').setAttribute('data-name', animeList[realIndex].name);
    index++;
	}
}



function Roll (titles) {
	let animeList = shuffleArray(titles);

	let delay = 1000;
    const maxDelay = 1000;
    const totalTime = 20000;
    const thresholdTime = totalTime * 0.7;
    let currentElement = 0;
    let elapsedTime = 0;

    const startTime = Date.now();

    const executeShift = () => {
      console.log('start');
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
          console.log('finish');
          executeShift();
        }, delay);
    	}
    	else {
    		let sound = document.getElementById("winner");
    		sound.play();
    		let winner = document.querySelector('.roulette__text').querySelector('p');
    		winner.style.color = 'red';
    		let poster = document.querySelector('.roulette__element_center').querySelector('img');
    		poster.style.border = '5px solid red';
    	}
  	};
  	executeShift();
}

function getQueryUrl(link){
  let parts = link.split("/");
  let nickname = parts[parts.length - 1];
  let query = 'https://shikimori.one/api/users/'+nickname+'/anime_rates?status=planned&limit=5000';
  return query;
}
