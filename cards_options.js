document.addEventListener('DOMContentLoaded', () => {
    const addCardBtn = document.getElementById('add-card-btn');
    const editCardsBtn = document.getElementById('edit-cards-btn');
    const downloadCardsBtn = document.getElementById('download-cards-btn');
    const uploadCardsBtn = document.getElementById('upload-cards-btn');
    const addCardForm = document.getElementById('add-card-form');
    const frontInput = document.getElementById('front-input');
    const backInput = document.getElementById('back-input');
    const typeInput = document.getElementById('type-input');
    const subtypeButtons = document.getElementById('subtype-buttons');

    let cards = [];

    addCardBtn.addEventListener('click', showAddCardForm);
    editCardsBtn.addEventListener('click', () => {
        alert('Edit cards functionality to be implemented');
    });
    downloadCardsBtn.addEventListener('click', downloadCards);
    uploadCardsBtn.addEventListener('click', () => {
        alert('Upload cards functionality to be implemented');
    });
    addCardForm.addEventListener('submit', addNewCard);

    function showAddCardForm() {
        addCardForm.style.display = 'block';
        updateSubtypeButtons();
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
            button.type = 'button';
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

    function addNewCard(e) {
        e.preventDefault();
        const front = frontInput.value.trim();
        const back = backInput.value.trim();
        const type = typeInput.value;
        const subtype = subtypeButtons.querySelector('.active')?.textContent || '';

        const japaneseRegex = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/;

        if (!japaneseRegex.test(front)) {
            alert('The front of the card must contain only Japanese characters.');
            return;
        }

        if (front && back && type) {
            cards.push({ front, back, type, subtype });
            saveCards();
            addCardForm.style.display = 'none';
            alert('New card added successfully!');
        } else {
            alert('Please fill in all required fields.');
        }
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
            fetch('cards.json')
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        cards = data;
                        console.log('Cards loaded successfully from JSON file');
                        localStorage.setItem('cards', JSON.stringify(cards));
                    } else {
                        console.log('JSON file is empty or invalid. Using default empty array.');
                        cards = [];
                    }
                })
                .catch(error => {
                    console.error('Error loading cards:', error);
                    cards = [];
                });
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
    loadCards();
});

// Make sure to include your existing card-related functions (e.g., loadCards, saveCards, etc.) in this file
