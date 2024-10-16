document.addEventListener('DOMContentLoaded', () => {
    const cardList = document.getElementById('card-list');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    let cards = [];
    let currentPage = 1;
    const cardsPerPage = 10;

    function loadCards() {
        const storedCards = localStorage.getItem('cards');
        if (storedCards) {
            cards = JSON.parse(storedCards);
            renderCards();
            updatePagination();
        } else {
            console.log('No cards found in localStorage.');
        }
    }

    function renderCards() {
        cardList.innerHTML = '';
        const startIndex = (currentPage - 1) * cardsPerPage;
        const endIndex = startIndex + cardsPerPage;
        const pageCards = cards.slice(startIndex, endIndex);

        pageCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card-item';
            cardElement.innerHTML = `
                <span class="card-info">${truncate(card.front, 20)} | ${truncate(card.back, 30)} | ${truncate(card.type, 10)} | ${truncate(card.subtype || '', 10)}</span>
                <div class="card-actions">
                    <button class="edit-btn" data-index="${startIndex + index}">Edit</button>
                    <button class="delete-btn" data-index="${startIndex + index}">Delete</button>
                </div>
            `;
            cardList.appendChild(cardElement);
        });

        addCardActionListeners();
    }

    function truncate(str, maxLength) {
        return str.length > maxLength ? str.substring(0, maxLength - 3) + '...' : str;
    }

    function addCardActionListeners() {
        const editButtons = document.querySelectorAll('.edit-btn');
        const deleteButtons = document.querySelectorAll('.delete-btn');

        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                // Implement edit functionality
                console.log('Edit card at index:', index);
            });
        });

        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                deleteCard(index);
            });
        });
    }

    function deleteCard(index) {
        const card = cards[index];
        const confirmDelete = confirm(`Are you sure you want to delete this card?\n\nFront: ${card.front}\nBack: ${card.back}`);
        
        if (confirmDelete) {
            cards.splice(index, 1);
            saveCards();
            
            const totalPages = Math.ceil(cards.length / cardsPerPage);
            if (currentPage > totalPages) {
                currentPage = totalPages;
            }
            
            renderCards();
            updatePagination();
        }
    }

    function updatePagination() {
        const totalPages = Math.ceil(cards.length / cardsPerPage);
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
    }

    function saveCards() {
        localStorage.setItem('cards', JSON.stringify(cards));
        console.log('Cards saved successfully to localStorage');
    }

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCards();
            updatePagination();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(cards.length / cardsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderCards();
            updatePagination();
        }
    });

    // Load cards when the page loads
    loadCards();
});
