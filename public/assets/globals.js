// Put all global js code here

(() => {
  const fileInput = document.querySelector('.custom-file-input');
  fileInput.addEventListener('change', (event) => {
    const thisFileInput = event.target;
    const filename = thisFileInput.files[0].name;
    const fileInputLabel = thisFileInput.nextElementSibling;
    fileInputLabel.textContent = filename;
  });
})();
