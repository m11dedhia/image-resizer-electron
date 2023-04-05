const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const heightInput = document.querySelector('#height');
const widthInput = document.querySelector('#width');

const loadImage = (e) => {
  const file = e.target.files[0];
  if (!isFileImage(file)) {
    alert('Please select an image!', false);
    return;
  }

  // Get original Image dimensions
  const image = new Image();
  image.src = URL.createObjectURL(file);
  image.onload = function() {
    widthInput.value = this.width;
    heightInput.value = this.height;
  }

  form.style.display = 'block';
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.homedir(), 'imageresizer');
}

// send data to main process
const sendImage = (e) => {
  e.preventDefault();

  const imgPath = img.files[0].path;
  const width = widthInput.value;
  const height = heightInput.value;

  if (!img.files[0]) {
    alert('Please upload an image', false);
    return;
  }

  if (imgPath === '') {
    alert('Please fill in the image path', false);
    return;
  }

  if (width === '' || height === '') {
    alert('Please fill in a height and width', false);
    return;
  }

  // Send image to main using ipcRenderer
  ipcRenderer.send('image:resize', {
    imgPath,
    width,
    height,
  });
}

// catch the image:done event
ipcRenderer.on('image:done', () => {
  alert(`Image has been resized to ${widthInput.value} x ${heightInput.value}`, true);
});

// check if file is an image
const isFileImage = (file) => {
  const acceptedImageTypes = ['image/gif', 'image/png', 'image/jpeg'];
  return file && acceptedImageTypes.includes(file['type']);
}

const alert = (message, success) => {
  Toastify.toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: success ? 'green' : 'red',
      color: 'white',
      textAlign: 'center'
    }
  });
}

img.addEventListener('change', loadImage);
form.addEventListener('submit', sendImage);
