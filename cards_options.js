document.addEventListener('DOMContentLoaded', () => {
    const addCardBtn = document.getElementById('add-card-btn');
    const editCardsBtn = document.getElementById('edit-cards-btn');
    const downloadCardsBtn = document.getElementById('download-cards-btn');
    const uploadCardsBtn = document.getElementById('upload-cards-btn');
    const addCardForm = document.getElementById('add-card-form');
    const frontInput = document.getElementById('front-input');
    const furiganaInput = document.getElementById('furigana-input');
    const romajiInput = document.getElementById('romaji-input');
    const backInput = document.getElementById('back-input');
    const typeInput = document.getElementById('type-input');
    const subtypeButtons = document.getElementById('subtype-buttons');
    const uploadOptions = document.getElementById('upload-options');
    const fileInput = document.getElementById('file-input');
    const replaceCardsBtn = document.getElementById('replace-cards-btn');
    const addToExistingBtn = document.getElementById('add-to-existing-btn');
    const removeAllCardsBtn = document.getElementById('remove-all-cards-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    let cards = [];
    let activeButton = null;

    addCardBtn.addEventListener('click', () => {
        toggleButtonState(addCardBtn, addCardForm);
        updateSubtypeButtons();
    });
    editCardsBtn.addEventListener('click', () => toggleButtonState(editCardsBtn));
    downloadCardsBtn.addEventListener('click', () => {
        toggleButtonState(downloadCardsBtn);
        if (activeButton === downloadCardsBtn) downloadCards();
    });
    uploadCardsBtn.addEventListener('click', () => toggleButtonState(uploadCardsBtn, uploadOptions));
    removeAllCardsBtn.addEventListener('click', () => {
        toggleButtonState(removeAllCardsBtn);
        if (activeButton === removeAllCardsBtn) removeAllCards();
    });

    replaceCardsBtn.addEventListener('click', () => {
        fileInput.click();
        fileInput.onchange = (event) => handleFileUpload(event, true);
    });

    addToExistingBtn.addEventListener('click', () => {
        fileInput.click();
        fileInput.onchange = (event) => handleFileUpload(event, false);
    });

    addCardForm.addEventListener('submit', addNewCard);
    cancelBtn.addEventListener('click', () => {
        resetForm();
        toggleButtonState(addCardBtn, addCardForm);
    });

    function toggleButtonState(button, relatedElement) {
        if (activeButton === button) {
            // Disable the active button's functionality
            button.classList.remove('active');
            if (relatedElement) relatedElement.style.display = 'none';
            activeButton = null;
        } else {
            // Disable the previously active button's functionality
            if (activeButton) {
                activeButton.classList.remove('active');
                if (activeButton === uploadCardsBtn) uploadOptions.style.display = 'none';
                if (activeButton === addCardBtn) addCardForm.style.display = 'none';
            }
            // Enable the clicked button's functionality
            button.classList.add('active');
            if (relatedElement) relatedElement.style.display = 'block';
            activeButton = button;
        }
    }

    function removeAllCards() {
        const confirmRemove = confirm("Are you sure you want to remove all cards? This action cannot be undone.");
        if (confirmRemove) {
            cards = [];
            saveCards();
            alert('All cards have been removed.');
        }
    }

    function handleFileUpload(event, replace) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const uploadedCards = JSON.parse(e.target.result);
                    if (Array.isArray(uploadedCards)) {
                        if (replace) {
                            cards = uploadedCards;
                        } else {
                            cards = cards.concat(uploadedCards);
                        }
                        saveCards();
                        alert('Cards uploaded successfully!');
                        uploadOptions.style.display = 'none';
                        activeButton = null;
                    } else {
                        throw new Error('Invalid JSON format');
                    }
                } catch (error) {
                    alert('Error parsing JSON file. Please make sure it\'s a valid JSON array of cards.');
                }
            };
            reader.readAsText(file);
        }
    }

    function addNewCard(e) {
        e.preventDefault();
        const front = frontInput.value.trim();
        const furigana = furiganaInput.value.trim();
        const romaji = romajiInput.value.trim();
        const back = backInput.value.trim();
        const type = typeInput.value;
        const subtype = subtypeButtons.querySelector('.active')?.textContent || '';

        const japaneseRegex = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/;

        if (!japaneseRegex.test(front)) {
            alert('The front of the card must contain only Japanese characters.');
            return;
        }

        if (front && back && type) {
            cards.push({ front, furigana, romaji, back, type, subtype, rating: 0 });
            saveCards();
            resetForm();
            toggleButtonState(addCardBtn, addCardForm);
            alert('New card added successfully!');
            console.log('Card added:', { front, furigana, romaji, back, type, subtype, rating: 0 });
        } else {
            alert('Please fill in all required fields.');
        }
    }

    function resetForm() {
        frontInput.value = '';
        furiganaInput.value = '';
        romajiInput.value = '';
        backInput.value = '';
        typeInput.value = '';
        subtypeButtons.querySelectorAll('.subtype-button').forEach(button => {
            button.classList.remove('active');
        });
    }

    function updateSubtypeButtons() {
        subtypeButtons.innerHTML = '';
        const selectedType = typeInput.value;

        if (selectedType === 'verb') {
            createSubtypeButtons(['1st group', '2nd group', '3rd group']);
        } else if (selectedType === 'adjective') {
            createSubtypeButtons(['な-adjective', 'い-adjective']);
        }
    }

    function createSubtypeButtons(subtypes) {
        subtypes.forEach(subtype => {
            const button = document.createElement('button');
            button.textContent = subtype;
            button.classList.add('subtype-button');
            button.type = 'button'; // Prevent form submission
            button.addEventListener('click', () => selectSubtype(button));
            subtypeButtons.appendChild(button);
        });
    }

    function selectSubtype(selectedButton) {
        subtypeButtons.querySelectorAll('.subtype-button').forEach(button => {
            button.classList.remove('active');
        });
        selectedButton.classList.add('active');
    }

    function saveCards() {
        localStorage.setItem('cards', JSON.stringify(cards));
        console.log('Cards saved successfully to localStorage');
    }

    function loadCards() {
        const storedCards = localStorage.getItem('cards');
        if (storedCards) {
            cards = JSON.parse(storedCards);
            console.log('Cards loaded successfully from localStorage');
        } else {
            console.log('No cards found in localStorage. Using empty array.');
            cards = [];
        }
    }

    function downloadCards() {
        const jsonData = JSON.stringify(cards, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cards.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    typeInput.addEventListener('change', updateSubtypeButtons);

    // Load cards when the page loads
    loadCards();
});
