export async function fetchAsync(url) {
  let response = await fetch(url);
  let data = await response.json();
  return data;
}
export function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.onload = () => resolve();
    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
      resolve();  // Resolve to continue with other images
    };
    img.src = url;
  });
}
