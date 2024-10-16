const card = document.getElementById('card');
const frontText = document.getElementById('front-text');
const backText = document.getElementById('back-text');
const prevBtn = document.getElementById('prev-btn');
const flipBtn = document.getElementById('flip-btn');
const nextBtn = document.getElementById('next-btn');
const addCardBtn = document.getElementById('add-card-btn');
const addCardForm = document.getElementById('add-card-form');
const frontInput = document.getElementById('front-input');
const backInput = document.getElementById('back-input');
const typeInput = document.getElementById('type-input');
const cancelBtn = document.getElementById('cancel-btn');
const subtypeButtons = document.getElementById('subtype-buttons');
const downloadBtn = document.getElementById('download-btn');

let currentCardIndex = 0;
let cards = [];

function updateCard() {
	if (cards.length === 0) {
		frontText.textContent = "No cards available";
		backText.textContent = "Add new cards to get started";
	} else {
		frontText.textContent = cards[currentCardIndex].front;
		backText.textContent = `${cards[currentCardIndex].back} (${cards[currentCardIndex].type}${cards[currentCardIndex].subtype ? ', ' + cards[currentCardIndex].subtype : ''})`;
	}
}

function flipCard() {
	card.classList.toggle('flipped');
}

function nextCard() {
	currentCardIndex = (currentCardIndex + 1) % cards.length;
	updateCard();
	if (card.classList.contains('flipped')) {
		flipCard();
	}
}

function prevCard() {
	currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
	updateCard();
	if (card.classList.contains('flipped')) {
		flipCard();
	}
}

function showAddCardForm() {
	addCardBtn.style.display = 'none';
	addCardForm.style.display = 'flex';
	updateSubtypeButtons();
}

function hideAddCardForm() {
	addCardBtn.style.display = 'block';
	addCardForm.style.display = 'none';
	frontInput.value = '';
	backInput.value = '';
	typeInput.value = '';
	subtypeButtons.innerHTML = '';
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
		saveCards(); // This will now log the updated cards array
		hideAddCardForm();
		alert('New card added successfully! Please update the cards.json file on GitHub with the logged data.');
	} else {
		alert('Please fill in all required fields.');
	}
}

function loadCards() {
	fetch('cards.json')
		.then(response => response.json())
		.then(data => {
			if (Array.isArray(data) && data.length > 0) {
				cards = data;
				console.log('Cards loaded successfully from JSON file');
			} else {
				console.log('JSON file is empty or invalid. Using default empty array.');
				cards = [];
			}
			updateCard();
		})
		.catch(error => {
			console.error('Error loading cards:', error);
			cards = [];
			updateCard();
		});
}

function saveCards() {
	localStorage.setItem('cards', JSON.stringify(cards));
}

function downloadCards() {
	// Create a Blob with the JSON data
	const jsonData = JSON.stringify(cards, null, 2);
	const blob = new Blob([jsonData], { type: 'application/json' });
	
	// Create a URL for the Blob
	const url = URL.createObjectURL(blob);
	
	// Create a temporary anchor element and trigger the download
	const a = document.createElement('a');
	a.href = url;
	a.download = 'cards.json';
	document.body.appendChild(a);
	a.click();
	
	// Clean up
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

updateCard();

flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
prevBtn.addEventListener('click', prevCard);
addCardBtn.addEventListener('click', showAddCardForm);
addCardForm.addEventListener('submit', addNewCard);
cancelBtn.addEventListener('click', hideAddCardForm);
typeInput.addEventListener('change', updateSubtypeButtons);
downloadBtn.addEventListener('click', downloadCards);

// Load cards when the page loads
window.addEventListener('load', loadCards);

// Add event listener for download button
downloadBtn.addEventListener('click', downloadCards);
