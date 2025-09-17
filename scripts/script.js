document.addEventListener('DOMContentLoaded', function () {
	// Selektory
	const boardContainer = document.getElementById('board-container')
	const columnsSelect = document.getElementById('board-columns')
	const darkColorPicker = document.getElementById('dark-color-picker')
	const fileDropArea = document.getElementById('file-drop-area')
	const fileInput = document.getElementById('pgn-file')
	const footer = document.querySelector('.footer')
	const gameSelect = document.getElementById('game-select')
	const header = document.querySelector('.header')
	const headerCenter = document.querySelector('.header-center')
	const headerRight = document.querySelector('.header-right')
	const highlightColorPicker = document.getElementById('highlight-color-picker')
	const orientationSelect = document.getElementById('orientation-select')
	const printBtn = document.getElementById('print-btn')
	const settingsBtn = document.getElementById('settings-btn')
	const modal = document.getElementById('settings-modal')
	const closeBtn = document.querySelector('.close-btn')

	const boardModal = document.getElementById('board-modal')
	const prevMoveBtn = document.getElementById('prev-move-btn')
	const nextMoveBtn = document.getElementById('next-move-btn')
	const bigBoardDiv = document.getElementById('big-board')
	const closeBtnBoard = document.querySelector('.close-btn-board')

	// Zmienne stanu aplikacji
	const chessboards = []
	let pgnString = ''
	let positions = []
	let allGames = []
	let currentBoardIndex = 0
	let bigBoard = null

	// Funkcje pomocnicze
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

		fileDropArea.style.display = 'none'
		if (headerRight) {
			headerRight.style.display = 'flex'
		}
		if (headerCenter) {
			headerCenter.style.display = 'flex'
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
			}

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
		positions.forEach((pos, index) => {
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

			boardWrapper.addEventListener('click', () => handleBoardClick(index))
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
		if (bigBoard) {
			const pos = positions[currentBoardIndex]
			const fromSquare = document.querySelector(
				`#big-board .square-${pos.from}`
			)
			const toSquare = document.querySelector(`#big-board .square-${pos.to}`)
			if (fromSquare && toSquare) {
				fromSquare.style.boxShadow = `inset 0 0 0 3px ${highlightColor}`
				toSquare.style.boxShadow = `inset 0 0 0 3px ${highlightColor}`
			}
		}
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
	}

	function addWheelListener(selectElement, callback) {
		if (!selectElement) return

		selectElement.addEventListener('wheel', (event) => {
			event.preventDefault()

			let currentIndex = selectElement.selectedIndex
			let newIndex = currentIndex
			const maxIndex = selectElement.options.length - 1

			if (event.deltaY > 0) {
				newIndex = Math.min(currentIndex + 1, maxIndex)
			} else {
				newIndex = Math.max(currentIndex - 1, 0)
			}

			if (newIndex !== currentIndex) {
				selectElement.selectedIndex = newIndex
				callback()
			}
		})
	}

	// Handlers
	function handleBoardClick(index) {
		currentBoardIndex = index
		boardModal.classList.add('show-modal')
		renderBigBoard()
		boardModal.addEventListener('wheel', handleWheelNavigation, {
			passive: false,
		})
	}

	function handleWheelNavigation(event) {
		event.preventDefault()
		if (event.deltaY > 0) {
			if (currentBoardIndex < positions.length - 1) {
				currentBoardIndex++
				renderBigBoard()
			}
		} else {
			if (currentBoardIndex > 0) {
				currentBoardIndex--
				renderBigBoard()
			}
		}
	}

	function renderBigBoard() {
		const position = positions[currentBoardIndex]
		if (!position) return

		if (bigBoard) {
			bigBoard.destroy()
		}

		if (bigBoardDiv) {
			const config = {
				position: position.fen,
				draggable: false,
				pieceTheme: 'images/{piece}.png',
				showNotation: true,
				orientation: orientationSelect.value,
			}

			bigBoard = new Chessboard('big-board', config)

			const darkColor = darkColorPicker.value
			const lightColor = lightenColor(darkColor, 0.5)

			document
				.querySelectorAll('#big-board .square-55d63')
				.forEach((square) => {
					if (square.classList.contains('black-3c85d')) {
						square.style.backgroundColor = darkColor
					} else if (square.classList.contains('white-1e1d7')) {
						square.style.backgroundColor = lightColor
					}
				})

			const highlightColor = highlightColorPicker.value
			const fromSquare = document.querySelector(
				`#big-board .square-${position.from}`
			)
			const toSquare = document.querySelector(
				`#big-board .square-${position.to}`
			)
			if (fromSquare && toSquare) {
				fromSquare.style.boxShadow = `inset 0 0 0 3px ${highlightColor}`
				toSquare.style.boxShadow = `inset 0 0 0 3px ${highlightColor}`
			}
		} else {
			console.error('Element #big-board not found!')
		}

		if (prevMoveBtn) {
			prevMoveBtn.disabled = currentBoardIndex === 0
		}
		if (nextMoveBtn) {
			nextMoveBtn.disabled = currentBoardIndex >= positions.length - 1
		}
	}

	function handleFileDropClick() {
		fileInput.click()
	}

	function handleFileDragOver(e) {
		e.preventDefault()
		fileDropArea.classList.add('drag-over')
	}

	function handleFileDragLeave() {
		fileDropArea.classList.remove('drag-over')
	}

	function handleFileDrop(e) {
		e.preventDefault()
		fileDropArea.classList.remove('drag-over')
		const file = e.dataTransfer.files[0]
		handleFile(file)
	}

	function handleFileChange(event) {
		const file = event.target.files[0]
		handleFile(file)
	}

	function handleColumnsSelectChange() {
		if (pgnString) {
			renderGame(allGames[gameSelect.value].pgn)
		}
		updateBoardLayout()
		saveSettings()
	}

	function handleGameSelectChange() {
		const selectedIndex = gameSelect.value
		if (selectedIndex !== '') {
			renderGame(allGames[selectedIndex].pgn)
		} else {
			boardContainer.innerHTML = ''
		}
	}

	function handleOrientationSelectChange() {
		if (pgnString) generateBoards()
		saveSettings()
	}

	function handleColorPickerInput() {
		if (pgnString) {
			changeBoardColors()
			highlightLastMoves()
		}
		if (boardModal.classList.contains('show-modal')) {
			renderBigBoard()
		}
		saveSettings()
	}

	function handleSettingsBtnClick() {
		modal.classList.add('show-modal')
	}

	function handleCloseBtnClick() {
		modal.classList.remove('show-modal')
	}

	function handleWindowClick(event) {
		if (event.target === modal) {
			modal.classList.remove('show-modal')
		}
	}

	function handleCloseBtnBoardClick() {
		boardModal.classList.remove('show-modal')
		boardModal.removeEventListener('wheel', handleWheelNavigation)
	}

	function handleWindowBoardClick(event) {
		if (event.target === boardModal) {
			boardModal.classList.remove('show-modal')
			boardModal.removeEventListener('wheel', handleWheelNavigation)
		}
	}

	function handlePrevMoveClick() {
		if (currentBoardIndex > 0) {
			currentBoardIndex--
			renderBigBoard()
		}
	}

	function handleNextMoveClick() {
		if (currentBoardIndex < positions.length - 1) {
			currentBoardIndex++
			renderBigBoard()
		}
	}

	function handleKeyDown(event) {
		if (boardModal.classList.contains('show-modal')) {
			if (event.key === 'ArrowLeft') {
				if (currentBoardIndex > 0) {
					currentBoardIndex--
					renderBigBoard()
				}
			} else if (event.key === 'ArrowRight') {
				if (currentBoardIndex < positions.length - 1) {
					currentBoardIndex++
					renderBigBoard()
				}
			}
		}
	}

	// === Ostatnia działająca funkcja do drukowania ===
	async function printBoards() {
		if (chessboards.length === 0) {
			alert('Brak plansz do wydrukowania. Proszę wczytać plik PGN.')
			return
		}

		const selectedIndex = gameSelect.value
		const selectedGame = allGames[selectedIndex]
		const whitePlayer = selectedGame.header.White || 'Biały'
		const blackPlayer = selectedGame.header.Black || 'Czarny'
		const eventName = selectedGame.header.Event || 'Partia'
		const fileName =
			`${whitePlayer}_vs_${blackPlayer}_${eventName}.pdf`.replace(
				/[\/\\?%*:|"<>]/g,
				'_'
			)

		// Ustawienia formatu A4
		const a4Width = 210 // mm
		const a4Height = 297 // mm
		const margin = 10 // mm
		const availableWidth = a4Width - 2 * margin // mm

		// Obliczenia dla kolumn
		const columns = parseInt(columnsSelect.value, 10)
		const gap = 5 // mm
		const totalGap = (columns - 1) * gap
		const boardWidthMM = (availableWidth - totalGap) / columns

		// Utwórz tymczasowy kontener o stałych wymiarach A4
		const tempContainer = document.createElement('div')
		tempContainer.style.width = `${a4Width}mm`
		tempContainer.style.padding = `${margin}mm`
		tempContainer.style.boxSizing = 'border-box'
		document.body.appendChild(tempContainer)

		// Dodaj tytuł do tymczasowego kontenera
		const title = document.createElement('h1')
		title.style.textAlign = 'center'
		title.style.marginBottom = '15mm'
		title.style.fontSize = '18px'
		title.innerText = `${whitePlayer} vs. ${blackPlayer} (${eventName})`
		tempContainer.appendChild(title)

		// Utwórz grid container wewnątrz kontenera tymczasowego
		const tempGrid = document.createElement('div')
		tempGrid.style.display = 'grid'
		tempGrid.style.gap = `${gap}mm`
		tempGrid.style.gridTemplateColumns = `repeat(${columns}, ${boardWidthMM}mm)`
		tempContainer.appendChild(tempGrid)

		// Sklonuj plansze i umieść je w tymczasowym gridzie
		document.querySelectorAll('.board-wrapper').forEach((wrapper) => {
			const clonedWrapper = wrapper.cloneNode(true)
			tempGrid.appendChild(clonedWrapper)
		})

		const opt = {
			margin: 0,
			filename: fileName,
			image: { type: 'jpeg', quality: 0.98 },
			html2canvas: { scale: 2, useCORS: true },
			jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
		}

		// Ukrywamy header i footer na czas generowania PDF
		if (header) header.style.display = 'none'
		if (footer) footer.style.display = 'none'

		try {
			await html2pdf().set(opt).from(tempContainer).save()
		} catch (e) {
			console.error('Błąd generowania PDF:', e)
			alert('Nie udało się wygenerować PDF. Sprawdź konsolę.')
		} finally {
			// Usuń tymczasowy kontener
			document.body.removeChild(tempContainer)

			// Przywracamy header i footer
			if (header) header.style.display = ''
			if (footer) footer.style.display = ''
		}
	}

	// === Inicjalizacja i nasłuch zdarzeń ===
	loadSettings()

	fileDropArea.addEventListener('click', handleFileDropClick)
	fileDropArea.addEventListener('dragover', handleFileDragOver)
	fileDropArea.addEventListener('dragleave', handleFileDragLeave)
	fileDropArea.addEventListener('drop', handleFileDrop)
	fileInput.addEventListener('change', handleFileChange)

	columnsSelect.addEventListener('change', handleColumnsSelectChange)
	addWheelListener(columnsSelect, handleColumnsSelectChange)

	gameSelect.addEventListener('change', handleGameSelectChange)
	addWheelListener(gameSelect, handleGameSelectChange)

	orientationSelect.addEventListener('change', handleOrientationSelectChange)
	addWheelListener(orientationSelect, handleOrientationSelectChange)

	darkColorPicker.addEventListener('input', handleColorPickerInput)
	highlightColorPicker.addEventListener('input', handleColorPickerInput)

	settingsBtn.addEventListener('click', handleSettingsBtnClick)
	closeBtn.addEventListener('click', handleCloseBtnClick)

	closeBtnBoard.addEventListener('click', handleCloseBtnBoardClick)

	prevMoveBtn.addEventListener('click', handlePrevMoveClick)
	nextMoveBtn.addEventListener('click', handleNextMoveClick)

	printBtn.addEventListener('click', printBoards)

	document.addEventListener('keydown', handleKeyDown)
	window.addEventListener('click', handleWindowBoardClick)
	window.addEventListener('click', handleWindowClick)

	window.onresize = () => {
		updateColumnsSelect()
		if (pgnString && allGames.length > 0) {
			renderGame(allGames[gameSelect.value].pgn)
		}
		if (boardModal.classList.contains('show-modal')) {
			renderBigBoard()
		}
	}
})
