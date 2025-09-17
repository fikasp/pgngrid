// Czekamy na pełne załadowanie strony
document.addEventListener('DOMContentLoaded', function () {
	const fileInput = document.getElementById('pgn-file')
	const boardContainer = document.getElementById('board-container')
	const sizeSlider = document.getElementById('size-slider')
	const orientationSelect = document.getElementById('orientation-select')
	const darkColorPicker = document.getElementById('dark-color-picker')

	// Elementy okna modalnego
	const settingsBtn = document.getElementById('settings-btn')
	const modal = document.getElementById('settings-modal')
	const closeBtn = document.querySelector('.close-btn')

	let pgnString = ''
	const chessboards = []
	const positions = []

	// Funkcja do zapisu ustawień w localStorage
	function saveSettings() {
		const settings = {
			size: sizeSlider.value,
			orientation: orientationSelect.value,
			darkColor: darkColorPicker.value,
		}
		localStorage.setItem('chessboardSettings', JSON.stringify(settings))
	}

	// Funkcja do wczytania ustawień z localStorage
	function loadSettings() {
		const savedSettings = localStorage.getItem('chessboardSettings')
		if (savedSettings) {
			const settings = JSON.parse(savedSettings)
			sizeSlider.value = settings.size
			orientationSelect.value = settings.orientation
			darkColorPicker.value = settings.darkColor

			// Ustawiamy rozmiar od razu, po wczytaniu
			document.querySelectorAll('.board-wrapper').forEach((wrapper) => {
				wrapper.style.width = `${settings.size}px`
			})
			boardContainer.style.gridTemplateColumns = `repeat(auto-fill, minmax(${settings.size}px, 1fr))`
		}
	}

	// Wywołanie loadSettings() po załadowaniu strony
	loadSettings()

	// Dodajemy "nasłuchiwanie" na zdarzenie zmiany pliku
	fileInput.addEventListener('change', (event) => {
		const file = event.target.files[0]
		if (!file) {
			return
		}

		const reader = new FileReader()

		reader.onload = function (e) {
			pgnString = e.target.result
			processPgn(pgnString)
		}

		reader.readAsText(file)
	})

	// Dodajemy "nasłuchiwanie" na zdarzenie zmiany wartości suwaka
	sizeSlider.addEventListener('input', () => {
		const newSize = sizeSlider.value
		document.querySelectorAll('.board-wrapper').forEach((wrapper) => {
			wrapper.style.width = `${newSize}px`
		})
		boardContainer.style.gridTemplateColumns = `repeat(auto-fill, minmax(${newSize}px, 1fr))`
		chessboards.forEach((board) => {
			board.resize()
		})
		// Ponowne zastosowanie kolorów po zmianie rozmiaru
		changeBoardColors()
		// Zapisujemy ustawienia po zmianie
		saveSettings()
	})

	// Dodajemy "nasłuchiwanie" na zdarzenie zmiany orientacji
	orientationSelect.addEventListener('change', () => {
		if (pgnString) {
			generateBoards()
		}
		// Zapisujemy ustawienia po zmianie
		saveSettings()
	})

	// Dodajemy "nasłuchiwanie" na zdarzenie zmiany koloru
	darkColorPicker.addEventListener('input', () => {
		if (pgnString) {
			// Natychmiastowa zmiana koloru po wybraniu nowego
			changeBoardColors()
		}
		// Zapisujemy ustawienia po zmianie
		saveSettings()
	})

	// Obsługa okna modalnego
	settingsBtn.addEventListener('click', () => {
		modal.classList.add('show-modal')
	})

	closeBtn.addEventListener('click', () => {
		modal.classList.remove('show-modal')
	})

	window.addEventListener('click', (event) => {
		if (event.target === modal) {
			modal.classList.remove('show-modal')
		}
	})

	/**
	 * Funkcja przetwarza ciąg znaków PGN i generuje szachownice.
	 * @param {string} pgn PGN w formie tekstu.
	 */
	function processPgn(pgn) {
		boardContainer.innerHTML = ''
		chessboards.length = 0
		positions.length = 0

		try {
			const game = new Chess()
			if (!game.load_pgn(pgn)) {
				alert('Nieprawidłowy plik PGN.')
				return
			}

			const history = game.history({ verbose: true })
			game.reset()

			let moveCounter = 1
			history.forEach((move) => {
				const moveColor = move.color
				let moveText = ''

				if (moveColor === 'w') {
					moveText = `${moveCounter}. ${move.san}`
				} else {
					moveText = `${moveCounter}... ${move.san}`
					moveCounter++
				}

				game.move(move)
				positions.push({
					fen: game.fen(),
					moveText: moveText,
					color: moveColor,
				})
			})

			generateBoards()
		} catch (error) {
			console.error('Błąd podczas przetwarzania PGN:', error)
			alert('Wystąpił błąd podczas przetwarzania pliku PGN.')
		}
	}

	/**
	 * Funkcja generuje szachownice na podstawie zapisanych pozycji.
	 */
	function generateBoards() {
		boardContainer.innerHTML = ''
		chessboards.length = 0

		const orientation = orientationSelect.value
		const currentSize = sizeSlider.value

		positions.forEach((pos) => {
			const boardWrapper = document.createElement('div')
			boardWrapper.className = 'board-wrapper'
			boardWrapper.style.width = `${currentSize}px`

			const boardDiv = document.createElement('div')
			const boardId =
				'board-' + Date.now() + Math.random().toString(36).substr(2, 9)
			boardDiv.id = boardId

			if (pos.moveText) {
				const moveInfo = document.createElement('div')
				moveInfo.className = 'move-info'

				if (pos.color !== null) {
					if (
						(orientation === 'white' && pos.color === 'w') ||
						(orientation === 'black' && pos.color === 'b')
					) {
						moveInfo.classList.add('bold-move')
					}
				}

				moveInfo.innerText = pos.moveText
				boardWrapper.appendChild(moveInfo)
			}

			boardWrapper.appendChild(boardDiv)
			boardContainer.appendChild(boardWrapper)

			const config = {
				position: pos.fen,
				draggable: false,
				pieceTheme:
					'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
				showNotation: false,
				orientation: orientation,
				lightSquareColor: '#f0d9b5',
				darkSquareColor: '#b58863',
			}

			const board = new Chessboard(boardId, config)
			chessboards.push(board)
		})

		// Po wygenerowaniu plansz, ręcznie zmieniamy ich kolory
		changeBoardColors()
	}

	/**
	 * Ręcznie zmienia kolory pól szachownicy na podstawie wartości z color-pickera.
	 */
	function changeBoardColors() {
		const darkColor = darkColorPicker.value
		const lightColor = lightenColor(darkColor, 0.5)

		document.querySelectorAll('.square-55d63').forEach((square) => {
			if (square.classList.contains('black-3c85d')) {
				square.style.backgroundColor = darkColor
			} else if (square.classList.contains('white-1e1d7')) {
				square.style.backgroundColor = lightColor
			}
		})
	}

	/**
	 * Funkcja rozjaśniająca kolor HEX o zadaną wartość.
	 * @param {string} hex Hexadecymalna wartość koloru (np. '#b58863').
	 * @param {number} percent Procent rozjaśnienia (0.0 do 1.0).
	 * @returns {string} Rozjaśniony kolor w formacie HEX.
	 */
	function lightenColor(hex, percent) {
		// Konwertuje hex na RGB
		let r = parseInt(hex.substring(1, 3), 16)
		let g = parseInt(hex.substring(3, 5), 16)
		let b = parseInt(hex.substring(5, 7), 16)

		// Zwiększa wartość RGB o procent
		r = Math.min(255, r + (255 - r) * percent)
		g = Math.min(255, g + (255 - g) * percent)
		b = Math.min(255, b + (255 - b) * percent)

		// Konwertuje z powrotem na HEX
		r = Math.round(r).toString(16).padStart(2, '0')
		g = Math.round(g).toString(16).padStart(2, '0')
		b = Math.round(b).toString(16).padStart(2, '0')

		return '#' + r + g + b
	}
})
