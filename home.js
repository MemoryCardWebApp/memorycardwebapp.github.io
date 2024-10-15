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

let currentCardIndex = 0;
/* let cards = [
	{ front: '犬', back: 'いぬ (inu) - dog', type: 'noun' },
	{ front: '猫', back: 'ねこ (neko) - cat', type: 'noun' },
	{ front: '水', back: 'みず (mizu) - water', type: 'noun' }
]; */
let cards = [
	{}
]

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

	/* This regular expression is used to validate Japanese text input:
		- \u3040-\u309F: Matches Hiragana characters
		- \u30A0-\u30FF: Matches Katakana characters
		- \u4E00-\u9FAF: Matches Kanji characters
		- \s: Matches whitespace (spaces, tabs, line breaks)
		The ^ and $ ensure the entire input matches this pattern
	   The + allows one or more of these characters */
	const japaneseRegex = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/;

	/* The !japaneseRegex.test(front) condition checks if the 'front' input does NOT match the Japanese character regex
		If it doesn't match (returns false), the ! operator inverts it to true, triggering the alert
		This ensures that only valid Japanese characters (Hiragana, Katakana, Kanji, and spaces) are accepted
		If any non-Japanese characters are present, it will return false, which becomes true with !, showing the alert 
	*/
	if (!japaneseRegex.test(front)) {
		alert('The front of the card must contain only Japanese characters.');
		return;
	}

	if (front && back && type) {
		cards.push({ front, back, type, subtype });
		saveCards(); // Save cards after adding a new one
		hideAddCardForm();
		alert('New card added successfully!');
	} else {
		alert('Please fill in all required fields.');
	}
}


// Function to load cards from Firebase
function loadCards() {
	const storedCards = localStorage.getItem('cards');
	if (storedCards) {
		cards = JSON.parse(storedCards);
		console.log('Cards loaded from localStorage');
		updateCard();
	} else {
		fetch('cards.json')
			.then(response => response.json())
			.then(data => {
				cards = data;
				console.log('Cards loaded successfully from JSON file');
				updateCard();
			})
			.catch(error => {
				console.error('Error loading cards:', error);
				cards = [];
				updateCard();
			});
	}
}

// Function to save cards to Firebase
function saveCards() {
	localStorage.setItem('cards', JSON.stringify(cards));
	console.log('Cards saved successfully');
}

updateCard();

flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
prevBtn.addEventListener('click', prevCard);
addCardBtn.addEventListener('click', showAddCardForm);
addCardForm.addEventListener('submit', addNewCard);
cancelBtn.addEventListener('click', hideAddCardForm);
typeInput.addEventListener('change', updateSubtypeButtons);

// Load cards when the page loads
window.addEventListener('load', loadCards);
