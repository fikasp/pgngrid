// #region @p PGNgrid
// #endregion
//========================
// #region @r GLOBALS
//========================
const chessboards = []
let allGames = []
let bigBoard = null
let currentBoardIndex = 0
let currentOrientation = 'white'
let pgnString = ''
let positions = []
let touchStartX = 0
let touchEndX = 0

// #endregion
//========================
// #region @r SELECTORS
//========================
// @b Layout
//------------------------
const $root = document.documentElement
const $logo = document.getElementById('logo')
const $divBoards = document.getElementById('boards')
const $divBigBoard = document.getElementById('big-board')
const $headerCenter = document.querySelector('.header-center')
const $headerRight = document.querySelector('.header-right')
const $moveListDisplay = document.getElementById('move-list-display')
const $modalBigBoard = document.getElementById('big-board-modal')
const $modalSettings = document.getElementById('settings-modal')

// @b Buttons
//------------------------
const $btnCloseBigBoard = document.getElementById('btn-close-board')
const $btnCloseSettings = document.querySelector('.btn-close-settings')
const $btnOrientation = document.getElementById('btn-orientation')
const $btnNextMove = document.getElementById('btn-next-move')
const $btnPrevMove = document.getElementById('btn-prev-move')
const $btnSettings = document.getElementById('btn-settings')
const $btnPrint = document.getElementById('btn-print')
const $btnFile = document.getElementById('btn-file')

// @b Selects
//------------------------
const $fileInput = document.getElementById('pgn-file')
const $fileDropArea = document.getElementById('file-drop-area')
const $pgnPasteArea = document.getElementById('pgn-paste-area')
const $pickerBoardColor = document.getElementById('dark-color-picker')
const $pickerHighlightColor = document.getElementById('highlight-color-picker')
const $selectColumns = document.getElementById('board-columns')
const $selectGame = document.getElementById('game-select')

// #endregion
//========================
// #region @r UTILITIES
//========================
//
// @b Clear content
//------------------------
function clearContent(element) {
	if (element) {
		element.innerHTML = ''
	}
}

// #endregion
//========================
// #region @r HELPERS
//========================
// @b Save settings
//------------------------
function saveSettings() {
	const settings = {
		orientation: currentOrientation,
		darkColor: $pickerBoardColor.value,
		highlightColor: $pickerHighlightColor.value,
		columns: $selectColumns.value,
	}
	localStorage.setItem('chessboardSettings', JSON.stringify(settings))
}

// @b Load settings
//------------------------
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
			highlightColor: '#2288dd',
		}
		localStorage.setItem('chessboardSettings', JSON.stringify(settings))
	}

	updateColumnsSelect()

	if ($selectColumns && settings.columns) {
		const savedColumns = parseInt(settings.columns, 10)
		const optionExists = Array.from($selectColumns.options).some(
			(opt) => parseInt(opt.value, 10) === savedColumns
		)
		if (optionExists) {
			$selectColumns.value = savedColumns
		} else {
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

// @b Scroll to active move
// ------------------------
function scrollToActiveMove() {
	const activeMoveElement = document.querySelector(
		'#move-list-display .active-move'
	)
	if (activeMoveElement) {
		const listContainer = activeMoveElement.parentElement
		const containerWidth = listContainer.clientWidth
		const scrollPosition =
			activeMoveElement.offsetLeft -
			containerWidth / 2 +
			activeMoveElement.offsetWidth / 2

		listContainer.scrollTo({
			left: scrollPosition,
			behavior: 'smooth',
		})
	}
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

// @b Draw board on canvas
//------------------------
function drawBoardOnCanvas(canvas) {
	const ctx = canvas.getContext('2d')
	const size = canvas.width / 2

	const darkColor = $pickerBoardColor.value
	const lightColor = lightenColor($pickerBoardColor.value, 0.5)

	ctx.fillStyle = lightColor
	ctx.fillRect(0, 0, size, size)
	ctx.fillRect(size, size, size, size)

	ctx.fillStyle = darkColor
	ctx.fillRect(size, 0, size, size)
	ctx.fillRect(0, size, size, size)
}

// @b Update favicon
//------------------------
function updateFavicon() {
	const canvas = document.createElement('canvas')
	canvas.width = 16
	canvas.height = 16
	drawBoardOnCanvas(canvas)

	const link = document.querySelector("link[rel~='icon']")
	if (link) {
		link.href = canvas.toDataURL()
	}
}

// @b Set title
// ------------------------
function setTitle(title) {
	document.title = 'PGNgrid - ' + title
}
// #endregion
//========================
// #region @r HANDLERS
// ========================
// @b Drop area
// ------------------------
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

function handlePasteAreaInput(event) {
	pgnString = event.target.value.trim()
	if (pgnString.length > 0) {
		processPgn()
	}
}
function handlePasteAreaClick(event) {
	event.stopPropagation()
}

// @b File picker
// ------------------------
function handleFile(file) {
	if (!file) return
	const reader = new FileReader()
	reader.onload = function (e) {
		pgnString = e.target.result
		processPgn()
	}
	reader.readAsText(file)
}
function handleFileChange(event) {
	const file = event.target.files[0]
	handleFile(file)
}

function handleFileDragOverOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$btnFile.classList.add('drag-over')
}
function handleFileDragLeaveOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$btnFile.classList.remove('drag-over')
}
function handleFileDropOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$btnFile.classList.remove('drag-over')
	const file = e.dataTransfer.files[0]
	handleFile(file)
}

// @b Orientation
// ------------------------
function handleOrientationToggle() {
	currentOrientation = currentOrientation === 'white' ? 'black' : 'white'

	let settings = JSON.parse(localStorage.getItem('chessboardSettings')) || {}
	settings.orientation = currentOrientation
	localStorage.setItem('chessboardSettings', JSON.stringify(settings))

	if (pgnString) {
		generateBoards()
	}
}

// @b Game select
// ------------------------
function handleGameSelectChange() {
	const selectedIndex = $selectGame.value
	if (selectedIndex !== '') {
		const selectedGame = allGames[selectedIndex]
		const gameTitle = selectedGame.header.Event
		renderGame(allGames[selectedIndex].pgn)
		setTitle(gameTitle)
	} else {
		$divBoards.innerHTML = ''
	}
}

// @b Columns select
// ------------------------
function handleColumnsSelectChange() {
	if (pgnString) renderGame(allGames[$selectGame.value].pgn)
	updateBoardLayout()
	saveSettings()
}

// @b Color picker
// ------------------------
function handleColorPickerInput() {
	changeBoardColors()
	changeHighlightColor()
	highlightLastMoves()
	highlightBigBoardMoves()
	saveSettings()
}

// @b Settings modal
// ------------------------
function handleSettingsClick() {
	$modalSettings.classList.add('show-modal')
}
function handleCloseBtnSettingsClick() {
	$modalSettings.classList.remove('show-modal')
}
function handleWindowSettingsClick(event) {
	if (event.target === $modalSettings)
		$modalSettings.classList.remove('show-modal')
}

// @b Big board modal
// ------------------------
function handleBoardClick(index) {
	currentBoardIndex = index
	$modalBigBoard.classList.add('show-modal')
	$modalBigBoard.addEventListener('wheel', handleWheelNavigation, {
		passive: false,
	})
	$divBigBoard.addEventListener('touchstart', handleTouchStart, {
		passive: false,
	})
	$divBigBoard.addEventListener('touchend', handleTouchEnd, {
		passive: false,
	})
	renderBigBoard()
}
function handleCloseBtnBoardClick() {
	$modalBigBoard.classList.remove('show-modal')
	$modalBigBoard.removeEventListener('wheel', handleWheelNavigation)
	$divBigBoard.removeEventListener('touchstart', handleTouchStart)
	$divBigBoard.removeEventListener('touchend', handleTouchEnd)
}

function handleWindowBoardClick(event) {
	if (event.target === $modalBigBoard) {
		$modalBigBoard.classList.remove('show-modal')
		$modalBigBoard.removeEventListener('wheel', handleWheelNavigation)
		$divBigBoard.addEventListener('touchstart', handleTouchStart, {
			passive: false,
		})
		$divBigBoard.addEventListener('touchend', handleTouchEnd, {
			passive: false,
		})
	}
}

// @b Big board navitagion
// ------------------------
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
function handleTouchStart(event) {
	touchStartX = event.changedTouches[0].screenX
}

function handleTouchEnd(event) {
	touchEndX = event.changedTouches[0].screenX
	handleSwipe()
}

function handleSwipe() {
	if (touchEndX < touchStartX - 50) {
		if (currentBoardIndex < positions.length - 1) {
			currentBoardIndex++
			renderBigBoard()
		}
	} else if (touchEndX > touchStartX + 50) {
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

// @b Keyboard
// ------------------------
function handleKeyDown(event) {
	if ($modalBigBoard.classList.contains('show-modal')) {
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
		} else if (event.key === 'Escape') {
			$modalBigBoard.classList.remove('show-modal')
			$modalBigBoard.removeEventListener('wheel', handleWheelNavigation)
		}
	} else if (
		$modalSettings.classList.contains('show-modal') &&
		event.key === 'Escape'
	) {
		$modalSettings.classList.remove('show-modal')
	}
}

// @b Window
// ------------------------
function handleResize() {
	const currentColumns = $selectColumns.value

	updateColumnsSelect()

	const optionExists = Array.from($selectColumns.options).some(
		(option) => option.value === currentColumns
	)

	if (optionExists) {
		$selectColumns.value = currentColumns
	} else {
		const maxColumnsValue =
			$selectColumns.options[$selectColumns.options.length - 1].value
		$selectColumns.value = maxColumnsValue
		saveSettings()
	}

	if (pgnString && allGames.length > 0) {
		renderGame(allGames[$selectGame.value].pgn)
	}
	if ($modalBigBoard.classList.contains('show-modal')) {
		renderBigBoard()
	}
}
// #endregion
//========================
// #region @r LISTENERS
// ========================
const setupListeners = () => {
	// @b Window
	// ------------------------
	document.addEventListener('keydown', handleKeyDown)
	window.addEventListener('click', handleWindowBoardClick)
	window.addEventListener('click', handleWindowSettingsClick)
	window.onresize = handleResize

	// @b Drop area
	// ------------------------
	$pgnPasteArea.addEventListener('input', handlePasteAreaInput)
	$pgnPasteArea.addEventListener('click', handlePasteAreaClick)
	$fileDropArea.addEventListener('click', handleFileDropClick)
	$fileDropArea.addEventListener('dragover', handleFileDragOver)
	$fileDropArea.addEventListener('dragleave', handleFileDragLeave)
	$fileDropArea.addEventListener('drop', handleFileDrop)

	// @b Buttons
	// ------------------------
	$btnCloseSettings.addEventListener('click', handleCloseBtnSettingsClick)
	$btnCloseBigBoard.addEventListener('click', handleCloseBtnBoardClick)
	$btnNextMove.addEventListener('click', handleNextMoveClick)
	$btnPrevMove.addEventListener('click', handlePrevMoveClick)
	$btnOrientation.addEventListener('click', handleOrientationToggle)
	$btnSettings.addEventListener('click', handleSettingsClick)
	$btnPrint.addEventListener('click', printBoards)
	$btnFile.addEventListener('dragover', handleFileDragOverOnButton)
	$btnFile.addEventListener('dragleave', handleFileDragLeaveOnButton)
	$btnFile.addEventListener('drop', handleFileDropOnButton)
	$fileInput.addEventListener('change', handleFileChange)

	// @b Selects
	// ------------------------
	$selectGame.addEventListener('change', handleGameSelectChange)
	$selectColumns.addEventListener('change', handleColumnsSelectChange)
	$pickerBoardColor.addEventListener('input', handleColorPickerInput)
	$pickerHighlightColor.addEventListener('input', handleColorPickerInput)
	addWheelListener($selectColumns, handleColumnsSelectChange)
	addWheelListener($selectGame, handleGameSelectChange)
}
// #endregion
//========================
// #region @r MAIN LOGIC
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
function processPgn() {
	clearContent($divBoards)
	chessboards.length = 0
	positions.length = 0
	allGames.length = 0

	if (pgnString.length === 0) {
		return
	}

	$fileDropArea.style.display = 'none'
	if ($headerRight) $headerRight.style.display = 'flex'
	if ($headerCenter) $headerCenter.style.display = 'flex'

	try {
		let gamesArray = []

		if (pgnString.includes('[Event')) {
			gamesArray = pgnString
				.split('[Event ')
				.filter(Boolean)
				.map((gamePgn) => `[Event ${gamePgn}`)
		} else {
			gamesArray = pgnString
				.split(/\n\s*\n/)
				.filter((line) => line.trim().length > 0)
		}

		if (gamesArray.length === 0) {
			throw new Error('No games found in the provided PGN.')
		}

		gamesArray.forEach((gamePgn, index) => {
			const game = new Chess()
			let cleanPgn = gamePgn.replace(/{[^}]*}/g, '').replace(/\[%[^\]]*]/g, '')

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
		renderGame(allGames[0].pgn)
		setTitle(firstGameTitle)
	} catch (error) {
		console.error('Błąd podczas przetwarzania PGN:', error)
		alert(
			'Wystąpił błąd podczas przetwarzania PGN. Upewnij się, że format jest poprawny.'
		)
	}
}

// @b Populate game select
// ------------------------
function populateGameSelect() {
	clearContent($selectGame)
	$selectGame.style.display = 'block'

	allGames.forEach((game, index) => {
		const event = game.header.Event || `Partia ${index + 1}`

		let optionText = event

		const option = document.createElement('option')
		option.value = index
		option.textContent = optionText
		$selectGame.appendChild(option)
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

// @b Render game
// ------------------------
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

// @b Calculate board size
// ------------------------
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

// @b Update board layout
// ------------------------
function updateBoardLayout() {
	if ($selectColumns) {
		const columns = $selectColumns.value
		$divBoards.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
	}
}

// @b Generate boards
// ------------------------
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
			pieceTheme: 'src/img/{piece}.png',
			orientation: currentOrientation,
			showNotation: false,
		}
		const board = new Chessboard(boardId, config)
		chessboards.push({ board, boardId })
		boardWrapper.addEventListener('click', () => handleBoardClick(index))
	})
	changeBoardColors()
	changeHighlightColor()
	highlightLastMoves()
	updateBoardLayout()
}

// @b Change board colors
// ------------------------
function changeBoardColors() {
	const darkColor = $pickerBoardColor.value
	const lightColor = lightenColor(darkColor, 0.5)
	$root.style.setProperty('--board-dark-color', darkColor)
	$root.style.setProperty('--board-light-color', lightColor)
	drawBoardOnCanvas($logo)
	updateFavicon()
}

// @b Change highlight color
// ------------------------
function changeHighlightColor() {
	const highlightColor = $pickerHighlightColor.value
	$root.style.setProperty('--highlight-color', highlightColor)
}

// @b Highlight last move
// ------------------------
function highlightLastMoves() {
	// Usuń wszystkie poprzednie podświetlenia
	document.querySelectorAll('.square-55d63').forEach((square) => {
		square.style.removeProperty('background-color')
	})

	// Iteruj przez wszystkie pozycje
	positions.forEach((pos, index) => {
		const { boardId } = chessboards[index]
		const fromSquare = document.querySelector(`#${boardId} .square-${pos.from}`)
		const toSquare = document.querySelector(`#${boardId} .square-${pos.to}`)

		if (fromSquare && toSquare) {
			const highlightColor = $pickerHighlightColor.value

			const fromIsLight = fromSquare.classList.contains('white-1e1d7')
			const fromColor = fromIsLight
				? lightenColor(highlightColor, 0.5)
				: highlightColor
			fromSquare.style.backgroundColor = fromColor

			const toIsLight = toSquare.classList.contains('white-1e1d7')
			const toColor = toIsLight
				? lightenColor(highlightColor, 0.5)
				: highlightColor
			toSquare.style.backgroundColor = toColor
		}
	})
}

// @b Highlight big board moves
//------------------------
function highlightBigBoardMoves() {
	// Usuń poprzednie podświetlenia z dużej planszy
	document.querySelectorAll('#big-board .square-55d63').forEach((square) => {
		square.style.removeProperty('background-color')
	})

	// Zakończ, jeśli duża plansza nie istnieje lub nie ma ruchów
	if (!bigBoard || !positions[currentBoardIndex]) {
		return
	}

	const pos = positions[currentBoardIndex]
	const fromSquare = document.querySelector(`#big-board .square-${pos.from}`)
	const toSquare = document.querySelector(`#big-board .square-${pos.to}`)

	if (fromSquare && toSquare) {
		const highlightColor = $pickerHighlightColor.value

		// Oblicz kolor dla pola startowego
		const fromIsLight = fromSquare.classList.contains('white-1e1d7')
		const fromColor = fromIsLight
			? lightenColor(highlightColor, 0.5)
			: highlightColor
		fromSquare.style.backgroundColor = fromColor

		// Oblicz kolor dla pola docelowego
		const toIsLight = toSquare.classList.contains('white-1e1d7')
		const toColor = toIsLight
			? lightenColor(highlightColor, 0.5)
			: highlightColor
		toSquare.style.backgroundColor = toColor
	}
}

// @b Render move list
// ------------------------
function renderMoveList() {
	$moveListDisplay.innerHTML = ''
	positions.forEach((pos, index) => {
		const moveSpan = document.createElement('span')
		moveSpan.innerText = pos.moveText
		if (index === currentBoardIndex) {
			moveSpan.classList.add('active-move')
		}
		moveSpan.addEventListener('click', () => {
			currentBoardIndex = index
			renderBigBoard()
		})
		$moveListDisplay.appendChild(moveSpan)
	})
}

// @b Render big board
// ------------------------
function renderBigBoard() {
	const position = positions[currentBoardIndex]
	if (!position) return
	if (bigBoard) bigBoard.destroy()

	if ($divBigBoard) {
		const config = {
			position: position.fen,
			draggable: false,
			pieceTheme: 'src/img/{piece}.png',
			showNotation: true,
			orientation: currentOrientation,
		}
		bigBoard = new Chessboard('big-board', config)

		const squares = document.querySelectorAll('#big-board .square-55d63')
		squares.forEach((square) => {
			square.classList.remove('highlight-3c678')
			square.style.boxShadow = 'none'
		})

		changeBoardColors()
		highlightBigBoardMoves()
	} else {
		console.error('Element #big-board not found!')
	}

	if ($btnPrevMove) $btnPrevMove.disabled = currentBoardIndex === 0
	if ($btnNextMove)
		$btnNextMove.disabled = currentBoardIndex >= positions.length - 1

	// Zaktualizuj listę ruchów
	renderMoveList()
	scrollToActiveMove()
}

// @b Print Boards
// ------------------------
function printBoards() {
	window.print()
}

// #endregion
//========================
// #region @r APP INIT
// ========================

function init() {
	console.log('App started...')
	loadSettings()
	changeBoardColors()
	changeHighlightColor()
	setupListeners()
}

document.addEventListener('DOMContentLoaded', () => {
	init()
})
// #endregion
