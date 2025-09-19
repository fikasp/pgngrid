document.addEventListener('DOMContentLoaded', () => {
	// ========================
	// @r GLOBALS
	// ========================
	const chessboards = []
	let allGames = []
	let bigBoard = null
	let currentOrientation = 'white'
	let currentBoardIndex = 0
	let pgnString = ''
	let positions = []

	// ========================
	// @r SELECTORS
	// ========================

	// @b Layout
	// ------------------------
	const $divBigBoard = document.getElementById('big-board')
	const $divBoards = document.getElementById('board-container')
	const $headerCenter = document.querySelector('.header-center')
	const $headerRight = document.querySelector('.header-right')
	const $modalBoard = document.getElementById('board-modal')
	const $modalSettings = document.getElementById('settings-modal')
	const $printTitle = document.getElementById('print-title')

	// @b Buttons
	// ------------------------
	const $btnCloseBoard = document.getElementById('btn-close-board')
	const $btnCloseSettings = document.querySelector('.btn-close-settings')
	const $btnOrientation = document.getElementById('btn-orientation')
	const $btnNextMove = document.getElementById('btn-next-move')
	const $btnPrevMove = document.getElementById('btn-prev-move')
	const $btnSettings = document.getElementById('btn-settings')
	const $btnPrint = document.getElementById('btn-print')

	// @b Selects
	// ------------------------
	const $fileInput = document.getElementById('pgn-file')
	const $fileDropArea = document.getElementById('file-drop-area')
	const $pgnPasteArea = document.getElementById('pgn-paste-area')
	const $pickerBoardColor = document.getElementById('dark-color-picker')
	const $pickerHighlightColor = document.getElementById(
		'highlight-color-picker'
	)
	const $selectColumns = document.getElementById('board-columns')
	const $selectGame = document.getElementById('game-select')

	// ========================
	// @r LISTENERS
	// ========================

	const setupListeners = () => {
		// @b Window
		// ------------------------
		document.addEventListener('keydown', handleKeyDown)
		window.addEventListener('click', handleWindowBoardClick)
		window.addEventListener('click', handleWindowClick)
		window.onresize = handleResize

		// @b Drop area
		// ------------------------
		$pgnPasteArea.addEventListener('input', handlePasteAreaInput)
		$pgnPasteArea.addEventListener('click', handlePasteAreaClick)
		$fileDropArea.addEventListener('click', handleFileDropClick)
		$fileDropArea.addEventListener('dragover', handleFileDragOver)
		$fileDropArea.addEventListener('dragleave', handleFileDragLeave)
		$fileDropArea.addEventListener('drop', handleFileDrop)
		$fileInput.addEventListener('change', handleFileChange)

		// @b Buttons
		// ------------------------
		$btnCloseSettings.addEventListener('click', handleCloseBtnClick)
		$btnCloseBoard.addEventListener('click', handleCloseBtnBoardClick)
		$btnNextMove.addEventListener('click', handleNextMoveClick)
		$btnPrevMove.addEventListener('click', handlePrevMoveClick)
		$btnOrientation.addEventListener('click', handleOrientationToggle)
		$btnSettings.addEventListener('click', handleSettingsClick)
		$btnPrint.addEventListener('click', printBoards)

		// @b Selects
		// ------------------------
		$selectGame.addEventListener('change', handleGameSelectChange)
		$selectColumns.addEventListener('change', handleColumnsSelectChange)
		$pickerBoardColor.addEventListener('input', handleColorPickerInput)
		$pickerHighlightColor.addEventListener('input', handleColorPickerInput)
		addWheelListener($selectColumns, handleColumnsSelectChange)
		addWheelListener($selectGame, handleGameSelectChange)
	}

	// ========================
	// @r HANDLERS
	// ========================

	// @b Handle file
	// ------------------------
	function handleFile(file) {
		if (!file) return
		const reader = new FileReader()
		reader.onload = function (e) {
			pgnString = e.target.result
			processPgn(pgnString)
		}
		reader.readAsText(file)
	}

	// @b Handle paste area input
	// ------------------------
	function handlePasteAreaInput(event) {
		pgnString = event.target.value.trim()
		if (pgnString.length > 0) {
			processPgn(pgnString)
		}
	}

	function handlePasteAreaClick(event) {
		event.stopPropagation()
	}

	function handleFileDropClick() {
		$fileInput.click()
	}
	function handleFileDragOver(e) {
		e.preventDefault()
		$fileDropArea.classList.add('drag-over')
	}
	function handleFileDragLeave() {
		$fileDropArea.classList.remove('drag-over')
	}
	function handleFileDrop(e) {
		e.preventDefault()
		$fileDropArea.classList.remove('drag-over')
		const file = e.dataTransfer.files[0]
		handleFile(file)
	}
	function handleFileChange(event) {
		const file = event.target.files[0]
		handleFile(file)
	}

	// @r HANDLERS
	// ========================

	// ... (Twój obecny kod) ...

	// @b Handle orientation toggle
	// ------------------------
	function handleOrientationToggle() {
		// Zmieniamy wartość globalnej zmiennej
		currentOrientation = currentOrientation === 'white' ? 'black' : 'white'

		// Zapisujemy nową wartość do localStorage
		let settings = JSON.parse(localStorage.getItem('chessboardSettings')) || {}
		settings.orientation = currentOrientation
		localStorage.setItem('chessboardSettings', JSON.stringify(settings))

		// Jeśli gra jest załadowana, generujemy plansze ponownie
		if (pgnString) {
			generateBoards()
		}
	}

	function handleColumnsSelectChange() {
		if (pgnString) renderGame(allGames[$selectGame.value].pgn)
		updateBoardLayout()
		saveSettings()
	}

	function handleGameSelectChange() {
		const selectedIndex = $selectGame.value
		if (selectedIndex !== '') {
			const selectedGame = allGames[selectedIndex]
			const gameTitle = selectedGame.header.Event
			document.title = 'PGN Grid - ' + gameTitle
			renderGame(allGames[selectedIndex].pgn)
		} else {
			$divBoards.innerHTML = ''
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
		if ($modalBoard.classList.contains('show-modal')) renderBigBoard()
		saveSettings()
	}

	function handleSettingsClick() {
		$modalSettings.classList.add('show-modal')
	}
	function handleCloseBtnClick() {
		$modalSettings.classList.remove('show-modal')
	}
	function handleWindowClick(event) {
		if (event.target === $modalSettings)
			$modalSettings.classList.remove('show-modal')
	}

	function handleCloseBtnBoardClick() {
		$modalBoard.classList.remove('show-modal')
		$modalBoard.removeEventListener('wheel', handleWheelNavigation)
	}
	function handleWindowBoardClick(event) {
		if (event.target === $modalBoard) {
			$modalBoard.classList.remove('show-modal')
			$modalBoard.removeEventListener('wheel', handleWheelNavigation)
		}
	}

	function handleBoardClick(index) {
		currentBoardIndex = index
		$modalBoard.classList.add('show-modal')
		renderBigBoard()
		$modalBoard.addEventListener('wheel', handleWheelNavigation, {
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
		if ($modalBoard.classList.contains('show-modal')) {
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

	function handleResize() {
		// 1. Zapisz aktualnie wybraną wartość kolumn.
		const currentColumns = $selectColumns.value

		// 2. Zaktualizuj opcje na liście (spowoduje to ich reset do 1).
		updateColumnsSelect()

		// 3. Sprawdź, czy zapisana wartość jest nadal dostępna.
		const optionExists = Array.from($selectColumns.options).some(
			(option) => option.value === currentColumns
		)

		// 4. Jeśli opcja istnieje, przywróć ją.
		if (optionExists) {
			$selectColumns.value = currentColumns
		} else {
			// W przeciwnym razie, ustaw wartość na największą dostępną opcję.
			const maxColumnsValue =
				$selectColumns.options[$selectColumns.options.length - 1].value
			$selectColumns.value = maxColumnsValue
			saveSettings() // Zapisz nową wartość
		}

		// 5. Zaktualizuj układ plansz na podstawie nowej wartości.
		if (pgnString && allGames.length > 0) {
			renderGame(allGames[$selectGame.value].pgn)
		}
		if ($modalBoard.classList.contains('show-modal')) {
			renderBigBoard()
		}
	}

	// ========================
	// @r HELPERS
	// ========================

	// @b Save settings
	// ------------------------
	function saveSettings() {
		const settings = {
			columns: $selectColumns.value,
			orientation: currentOrientation,
			darkColor: $pickerBoardColor.value,
			highlightColor: $pickerHighlightColor.value,
		}
		localStorage.setItem('chessboardSettings', JSON.stringify(settings))
	}

	// @b Load settings
	// ------------------------
	function loadSettings() {
		const savedSettings = localStorage.getItem('chessboardSettings')
		let settings = {}

		if (savedSettings) {
			settings = JSON.parse(savedSettings)
		} else {
			settings = {
				columns: 3,
				orientation: 'white',
				darkColor: '#998877',
				highlightColor: '#3399dd',
			}
			localStorage.setItem('chessboardSettings', JSON.stringify(settings))
		}

		// Najpierw zaktualizuj opcje na podstawie szerokości okna
		updateColumnsSelect()

		// Teraz ustaw wartość z localStorage
		if ($selectColumns && settings.columns) {
			const savedColumns = parseInt(settings.columns, 10)
			// Sprawdź, czy zapisana wartość jest w zakresie dostępnych opcji
			const optionExists = Array.from($selectColumns.options).some(
				(opt) => parseInt(opt.value, 10) === savedColumns
			)
			if (optionExists) {
				$selectColumns.value = savedColumns
			} else {
				// Jeśli wartość jest nieprawidłowa (np. ekran jest za mały), wybierz ostatnią opcję
				$selectColumns.value =
					$selectColumns.options[$selectColumns.options.length - 1].value
			}
		}

		currentOrientation = settings.orientation

		if ($pickerBoardColor) {
			$pickerBoardColor.value = settings.darkColor
		}
		if ($pickerHighlightColor) {
			$pickerHighlightColor.value = settings.highlightColor
		}

		if (pgnString && allGames.length > 0) {
			generateBoards()
		}

		updateBoardLayout()
	}

	// @b Lighten color
	// ------------------------
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

	// @b Add wheel listener
	// ------------------------
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

	// @b Update colums select
	// ------------------------
	function updateColumnsSelect() {
		if (!$selectColumns) return
		const containerWidth = $divBoards.clientWidth - 20
		const minBoardSize = 150
		const gap = 10
		let maxColumns = Math.floor((containerWidth + gap) / (minBoardSize + gap))
		maxColumns = Math.max(1, maxColumns)

		$selectColumns.innerHTML = ''
		for (let i = 1; i <= maxColumns; i++) {
			const option = document.createElement('option')
			option.value = i
			option.textContent = i
			$selectColumns.appendChild(option)
		}
	}

	// ========================
	// @r MAIN LOGIC
	// ========================

	// @b Get headers from pgn
	// ------------------------
	function getHeadersFromPgnString(pgn) {
		const headers = {}
		const headerRegex = /\[(\w+)\s+"(.*?)"\]/g
		let match
		while ((match = headerRegex.exec(pgn)) !== null) {
			headers[match[1]] = match[2]
		}
		return headers
	}

	// @b Process PGN
	// ------------------------
	function processPgn(pgn) {
		$divBoards.innerHTML = ''
		chessboards.length = 0
		positions.length = 0
		allGames.length = 0

		if (pgnString.length === 0) {
			return
		}

		// Ukryj początkowe okno po wczytaniu partii
		$fileDropArea.style.display = 'none'
		if ($headerRight) $headerRight.style.display = 'flex'
		if ($headerCenter) $headerCenter.style.display = 'flex'

		try {
			let gamesArray = []

			// Sprawdź, czy w pliku znajdują się nagłówki (np. [Event)
			// To pozwoli odróżnić pliki z nagłówkami od plików z samymi ruchami
			if (pgnString.includes('[Event')) {
				// Jeśli nagłówki są, podziel tekst na podstawie '[Event '
				gamesArray = pgnString
					.split('[Event ')
					.filter(Boolean)
					.map((gamePgn) => `[Event ${gamePgn}`)
			} else {
				// Jeśli nagłówków brak, podziel tekst na podstawie podwójnej pustej linii
				gamesArray = pgnString
					.split(/\n\s*\n/)
					.filter((line) => line.trim().length > 0)
			}

			if (gamesArray.length === 0) {
				throw new Error('No games found in the provided PGN.')
			}

			gamesArray.forEach((gamePgn, index) => {
				const game = new Chess()
				// Usuń adnotacje i komentarze
				let cleanPgn = gamePgn
					.replace(/{[^}]*}/g, '')
					.replace(/\[%[^\]]*]/g, '')

				// Dodaj puste nagłówki, jeśli ich brakuje
				const finalPgn = cleanPgn.startsWith('[Event')
					? cleanPgn
					: `[Event "Partia ${
							index + 1
					  }"]\n[Site "Online"]\n[Date "????.??.??"]\n[Round "?"]\n[White "?"]\n[Black "?"]\n[Result "*"]\n\n${cleanPgn}`

				if (game.load_pgn(finalPgn)) {
					const headers = getHeadersFromPgnString(finalPgn)
					allGames.push({ pgn: finalPgn, header: headers })
				} else {
					console.warn(`Could not load PGN for game: ${index + 1}`)
				}
			})

			if (allGames.length === 0) {
				alert('Nie znaleziono żadnej partii w podanym tekście.')
				$selectGame.style.display = 'none'
				return
			}

			if ($selectColumns) $selectColumns.style.display = 'inline-block'
			populateGameSelect()

			const firstGame = allGames[0]
			const firstGameTitle = firstGame.header.Event
			document.title = 'PGN Grid - ' + firstGameTitle

			renderGame(allGames[0].pgn)
		} catch (error) {
			console.error('Błąd podczas przetwarzania PGN:', error)
			alert(
				'Wystąpił błąd podczas przetwarzania PGN. Upewnij się, że format jest poprawny.'
			)
		}
	}

	function populateGameSelect() {
		$selectGame.innerHTML = ''
		$selectGame.style.display = 'block'

		allGames.forEach((game, index) => {
			// const white = game.header.White
			// const black = game.header.Black
			const event = game.header.Event || `Partia ${index + 1}`

			// Tworzenie tekstu opcji
			// let optionText = `${index + 1}. ${event}`
			let optionText = event

			// Dodaj nawias tylko, jeśli są dostępne dane graczy
			// if (white && black && white !== '?' && black !== '?') {
			// 	optionText += ` (${white} vs. ${black})`
			// }

			const option = document.createElement('option')
			option.value = index
			option.textContent = optionText
			$selectGame.appendChild(option)
		})
	}
	function renderGame(pgnToRender) {
		$divBoards.innerHTML = ''
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
		}
	}

	function calculateBoardSize() {
		if (!$selectColumns) return 400
		const columns = parseInt($selectColumns.value, 10)
		const containerWidth = $divBoards.clientWidth - 20
		const minBoardSize = 150
		const maxBoardSize = 750
		const gap = 10
		let boardSize = (containerWidth - (columns - 1) * gap) / columns
		boardSize = Math.max(minBoardSize, Math.min(boardSize, maxBoardSize))
		return Math.floor(boardSize)
	}

	function updateBoardLayout() {
		if ($selectColumns) {
			const columns = $selectColumns.value
			$divBoards.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
		}
	}

	function generateBoards() {
		$divBoards.innerHTML = ''
		chessboards.length = 0

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
						(currentOrientation === 'white' && pos.color === 'w') ||
						(currentOrientation === 'black' && pos.color === 'b')
					) {
						moveInfo.classList.add('bold-move')
					}
				}
				moveInfo.innerText = pos.moveText
				boardWrapper.appendChild(moveInfo)
			}
			boardWrapper.appendChild(boardDiv)
			$divBoards.appendChild(boardWrapper)

			const config = {
				position: pos.fen,
				draggable: false,
				pieceTheme: 'assets/img/{piece}.png',
				orientation: currentOrientation,
				showNotation: false,
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
		const darkColor = $pickerBoardColor.value
		const lightColor = lightenColor(darkColor, 0.5)
		document.querySelectorAll('.square-55d63').forEach((square) => {
			if (square.classList.contains('black-3c85d')) {
				square.style.backgroundColor = darkColor
			} else if (square.classList.contains('white-1e1d7')) {
				square.style.backgroundColor = lightColor
			}
		})
	}

	// @b Highlight Last
	// ------------------------
	function highlightLastMoves() {
		const highlightColor = $pickerHighlightColor.value
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

	// @b Render Big Board
	// ------------------------
	function renderBigBoard() {
		const position = positions[currentBoardIndex]
		if (!position) return
		if (bigBoard) bigBoard.destroy()
		if ($divBigBoard) {
			const config = {
				position: position.fen,
				draggable: false,
				pieceTheme: 'assets/img/{piece}.png',
				showNotation: false,
				orientation: currentOrientation,
			}
			bigBoard = new Chessboard('big-board', config)
			const darkColor = $pickerBoardColor.value
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
			const highlightColor = $pickerHighlightColor.value
			const fromSquare = document.querySelector(
				`#big-board .square-${position.from}`
			)
			const toSquare = document.querySelector(
				`#big-board .square-${position.to}`
			)
			if (fromSquare && toSquare) {
				fromSquare.style.boxShadow = `inset 0 0 0 4px ${highlightColor}`
				toSquare.style.boxShadow = `inset 0 0 0 4px ${highlightColor}`
			}
		} else {
			console.error('Element #big-board not found!')
		}
		if ($btnPrevMove) $btnPrevMove.disabled = currentBoardIndex === 0
		if ($btnNextMove)
			$btnNextMove.disabled = currentBoardIndex >= positions.length - 1
	}

	// @b Print boards
	// ------------------------
	function printBoards() {
		const selectedIndex = $selectGame.value
		const selectedGame = allGames[selectedIndex]
		const eventName = selectedGame.header.Event
		$printTitle.innerText = eventName
		window.print()
	}

	// ========================
	// @r INIT
	// ========================
	setupListeners()
	loadSettings()
})
