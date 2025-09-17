// Czekamy na pełne załadowanie strony
document.addEventListener('DOMContentLoaded', function () {
	// === Selektory elementów ===
	const fileInput = document.getElementById('pgn-file')
	const boardContainer = document.getElementById('board-container')
	const columnsSelect = document.getElementById('board-columns')
	const orientationSelect = document.getElementById('orientation-select')
	const darkColorPicker = document.getElementById('dark-color-picker')
	const highlightColorPicker = document.getElementById('highlight-color-picker')
	const printBtn = document.getElementById('print-btn')
	const gameSelect = document.getElementById('game-select')
	const fileDropArea = document.getElementById('file-drop-area')
	const header = document.querySelector('.header')
	const footer = document.querySelector('.footer') // Nowy selektor, który obejmuje przyciski i etykietę wyboru pliku
	const headerRight = document.querySelector('.header-right') // === Przyciski i elementy okna modalnego ===

	const settingsBtn = document.getElementById('settings-btn')
	const modal = document.getElementById('settings-modal')
	const closeBtn = document.querySelector('.close-btn') // Ukrywamy przyciski na starcie // Teraz ukrywamy cały kontener, który je zawiera

	if (headerRight) {
		headerRight.style.display = 'none'
	} // === Zmienne stanu ===

	let pgnString = ''
	const chessboards = []
	let positions = []
	let allGames = [] // === FUNKCJE POMOCNICZE ===

	function saveSettings() {
		const settings = {
			columns: columnsSelect.value,
			orientation: orientationSelect.value,
			darkColor: darkColorPicker.value,
			highlightColor: highlightColorPicker.value,
		}
		localStorage.setItem('chessboardSettings', JSON.stringify(settings))
	}

	function loadSettings() {
		const savedSettings = localStorage.getItem('chessboardSettings')
		if (savedSettings) {
			const settings = JSON.parse(savedSettings)
			updateColumnsSelect()
			if (columnsSelect) {
				columnsSelect.value = settings.columns || 3
			}
			orientationSelect.value = settings.orientation
			darkColorPicker.value = settings.darkColor
			highlightColorPicker.value = settings.highlightColor || '#ffc107'

			updateBoardLayout()
		}
	}

	function updateColumnsSelect() {
		if (!columnsSelect) return
		const containerWidth = boardContainer.clientWidth
		const minBoardSize = 150
		const gap = 10
		let maxColumns = Math.floor((containerWidth + gap) / (minBoardSize + gap))
		maxColumns = Math.max(1, maxColumns)
		const savedValue = columnsSelect.value
		columnsSelect.innerHTML = ''
		for (let i = 1; i <= maxColumns; i++) {
			const option = document.createElement('option')
			option.value = i
			option.textContent = i
			columnsSelect.appendChild(option)
		}
		if (savedValue && parseInt(savedValue, 10) <= maxColumns) {
			columnsSelect.value = savedValue
		} else {
			columnsSelect.value = maxColumns
		}
	}

	function getHeadersFromPgnString(pgn) {
		const headers = {}
		const headerRegex = /\[(\w+)\s+"(.*?)"\]/g
		let match
		while ((match = headerRegex.exec(pgn)) !== null) {
			headers[match[1]] = match[2]
		}
		return headers
	}

	function processPgn(pgn) {
		boardContainer.innerHTML = ''
		chessboards.length = 0
		positions = []
		allGames = []
		pgn = pgn.trim()

		fileDropArea.style.display = 'none' // Pokazujemy cały kontener, który zawiera przyciski i etykietę pliku
		if (headerRight) {
			headerRight.style.display = 'flex' // Używamy flex, aby przyciski ułożyły się poprawnie
		}

		try {
			const gamesArray = pgn.split('[Event ').filter(Boolean)

			gamesArray.forEach((gamePgn) => {
				const fullPgn = `[Event ${gamePgn}`
				const game = new Chess()

				const headers = getHeadersFromPgnString(fullPgn)

				if (game.load_pgn(fullPgn)) {
					allGames.push({ pgn: fullPgn, header: headers })
				}
			})

			if (allGames.length === 0) {
				alert('Nie znaleziono żadnej partii w pliku PGN.')
				gameSelect.style.display = 'none'
				return
			} // Elementy, które zawsze są w header-right nie muszą być osobno pokazywane // printBtn.style.display = 'inline-block'; // settingsBtn.style.display = 'inline-block';

			if (columnsSelect) {
				columnsSelect.style.display = 'inline-block'
			}

			populateGameSelect()
			renderGame(allGames[0].pgn)
		} catch (error) {
			console.error('Błąd podczas przetwarzania PGN:', error)
			alert('Wystąpił błąd podczas przetwarzania pliku PGN.')
		}
	}

	function populateGameSelect() {
		gameSelect.innerHTML = ''

		allGames.forEach((game, index) => {
			const white = game.header.White || 'Biały'
			const black = game.header.Black || 'Czarny'
			const event = game.header.Event || 'Nieznana partia'

			const option = document.createElement('option')
			option.value = index
			option.textContent = `${index + 1}. ${event} (${white} vs. ${black})`
			gameSelect.appendChild(option)
		})

		gameSelect.style.display = 'block'

		if (allGames.length > 0) {
			gameSelect.value = '0'
		}
	}

	function renderGame(pgnToRender) {
		boardContainer.innerHTML = ''
		chessboards.length = 0
		positions = []

		try {
			const game = new Chess()
			game.load_pgn(pgnToRender)

			const header = game.header()
			const startFen =
				header.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
			let startMoveNumber = 1

			if (header.FEN) {
				const fenParts = startFen.split(' ')
				startMoveNumber = parseInt(fenParts[5], 10)
			}

			const history = game.history({ verbose: true })
			const tempGame = new Chess(startFen)

			history.forEach((move, index) => {
				const moveColor = move.color
				let moveText = ''
				tempGame.move(move)

				if (moveColor === 'w') {
					moveText = `${startMoveNumber + Math.floor(index / 2)}. ${move.san}`
				} else {
					moveText = `${startMoveNumber + Math.floor(index / 2)}... ${move.san}`
				}

				positions.push({
					fen: tempGame.fen(),
					moveText: moveText,
					color: moveColor,
					from: move.from,
					to: move.to,
				})
			})

			generateBoards()
		} catch (error) {
			console.error('Błąd podczas renderowania partii:', error)
			alert('Wystąpił błąd podczas wyświetlania wybranej partii.')
		}
	}

	function calculateBoardSize() {
		if (!columnsSelect) return 400
		const columns = parseInt(columnsSelect.value, 10)
		const containerWidth = boardContainer.clientWidth - 20
		const minBoardSize = 150
		const maxBoardSize = 750
		const gap = 10
		let boardSize = (containerWidth - (columns - 1) * gap) / columns
		boardSize = Math.max(minBoardSize, Math.min(boardSize, maxBoardSize))
		return Math.floor(boardSize)
	}

	function updateBoardLayout() {
		if (columnsSelect) {
			const columns = columnsSelect.value
			boardContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
		}
	}

	function generateBoards() {
		boardContainer.innerHTML = ''
		chessboards.length = 0
		const orientation = orientationSelect.value
		const currentSize = calculateBoardSize()
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
				pieceTheme: 'images/{piece}.png',
				showNotation: false,
				orientation: orientation,
			}
			const board = new Chessboard(boardId, config)
			chessboards.push({ board, boardId })
		})
		changeBoardColors()
		highlightLastMoves()
		updateBoardLayout()
	}

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

	function highlightLastMoves() {
		const highlightColor = highlightColorPicker.value

		document.querySelectorAll('.square-55d63').forEach((square) => {
			square.style.removeProperty('box-shadow')
		})

		positions.forEach((pos, index) => {
			const { boardId } = chessboards[index]
			const fromSquare = document.querySelector(
				`#${boardId} .square-${pos.from}`
			)
			const toSquare = document.querySelector(`#${boardId} .square-${pos.to}`)

			if (fromSquare && toSquare) {
				fromSquare.style.boxShadow = `inset 0 0 0 3px ${highlightColor}`
				toSquare.style.boxShadow = `inset 0 0 0 3px ${highlightColor}`
			}
		})
	}

	function lightenColor(hex, percent) {
		let r = parseInt(hex.substring(1, 3), 16)
		let g = parseInt(hex.substring(3, 5), 16)
		let b = parseInt(hex.substring(5, 7), 16)
		r = Math.min(255, r + (255 - r) * percent)
		g = Math.min(255, g + (255 - g) * percent)
		b = Math.min(255, b + (255 - b) * percent)
		r = Math.round(r).toString(16).padStart(2, '0')
		g = Math.round(g).toString(16).padStart(2, '0')
		b = Math.round(b).toString(16).padStart(2, '0')
		return '#' + r + g + b
	}

	function handleFile(file) {
		if (!file) return
		const reader = new FileReader()
		reader.onload = function (e) {
			pgnString = e.target.result
			processPgn(pgnString)
		}
		reader.readAsText(file)
	} // === OBSŁUGA ZDARZEŃ ===

	loadSettings()

	fileDropArea.addEventListener('click', () => {
		fileInput.click()
	})

	fileDropArea.addEventListener('dragover', (e) => {
		e.preventDefault()
		fileDropArea.classList.add('drag-over')
	})

	fileDropArea.addEventListener('dragleave', () => {
		fileDropArea.classList.remove('drag-over')
	})

	fileDropArea.addEventListener('drop', (e) => {
		e.preventDefault()
		fileDropArea.classList.remove('drag-over')
		const file = e.dataTransfer.files[0]
		handleFile(file)
	})

	fileInput.addEventListener('change', (event) => {
		const file = event.target.files[0]
		handleFile(file)
	})

	if (columnsSelect) {
		columnsSelect.addEventListener('change', () => {
			if (pgnString) {
				renderGame(allGames[gameSelect.value].pgn)
			}
			updateBoardLayout()
			saveSettings()
		})
	}
	gameSelect.addEventListener('wheel', (event) => {
		event.preventDefault()

		if (allGames.length === 0) return

		let currentIndex = gameSelect.selectedIndex
		let newIndex = currentIndex

		if (event.deltaY > 0) {
			newIndex = Math.min(currentIndex + 1, allGames.length - 1)
		} else {
			newIndex = Math.max(currentIndex - 1, 0)
		}

		if (newIndex !== currentIndex) {
			gameSelect.value = newIndex
			renderGame(allGames[newIndex].pgn)
		}
	})

	gameSelect.addEventListener('change', (event) => {
		const selectedIndex = event.target.value
		if (selectedIndex !== '') {
			renderGame(allGames[selectedIndex].pgn)
		} else {
			boardContainer.innerHTML = ''
		}
	})
	orientationSelect.addEventListener('change', () => {
		if (pgnString) generateBoards()
		saveSettings()
	})

	darkColorPicker.addEventListener('input', () => {
		if (pgnString) {
			changeBoardColors()
			highlightLastMoves()
		}
		saveSettings()
	})

	highlightColorPicker.addEventListener('input', () => {
		if (pgnString) {
			highlightLastMoves()
		}
		saveSettings()
	})

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

	printBtn.addEventListener('click', () => {
		if (chessboards.length === 0) {
			alert('Brak plansz do wydrukowania. Proszę wczytać plik PGN.')
			return
		}

		const selectedIndex = gameSelect.value
		let fileName = 'PGNgrid.pdf'

		if (
			selectedIndex !== '' &&
			allGames[selectedIndex] &&
			allGames[selectedIndex].header
		) {
			const header = allGames[selectedIndex].header
			const whitePlayer = header.White || 'Biały'
			const blackPlayer = header.Black || 'Czarny'
			const eventName = header.Event || 'Partia'

			fileName = `${whitePlayer}_vs_${blackPlayer}_${eventName}.pdf`.replace(
				/[\/\\?%*:|"<>]/g,
				'_'
			)
		}

		if (header) header.style.display = 'none'
		if (footer) footer.style.display = 'none'

		window.print()
	})

	window.addEventListener('afterprint', () => {
		if (header) header.style.display = 'flex'
		if (footer) footer.style.display = 'block'
	})

	window.onresize = () => {
		updateColumnsSelect()
		if (pgnString && allGames.length > 0) {
			renderGame(allGames[gameSelect.value].pgn)
		}
	}
})
