// @p PGNgrid
//========================
//#region @r GLOBALS
//========================
// @b States
//------------------------
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
//#region @r SELECTORS
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
//#region @r UTILITIES
//========================

// @b Logger
//------------------------
/**
 * @typedef {Object} Logger
 * @property {boolean} active - Flag to activate/deactivate the logger
 * @property {Object.<string, string>} styles - Mapping of log modes to CSS styles
 * @property {function(string, ...any):void} styled - Styled log with function name
 * @property {function(...any):void} default - Plain log without colors
 * @property {function(...any):void} gray - Shortcut for gray logs
 * @property {function(...any):void} handler - Shortcut for handlers
 * @property {function(...any):void} orange - Shortcut for orange logs
 * @property {function(...any):void} blue - Shortcut for blue logs
 * @property {function(...any):void} red - Shortcut for red logs
 * @property {function(...any):void} white - Shortcut for white logs
 * @property {function(...any):void} yellow - Shortcut for yellow logs
 * @property {function():void} init - Initializes shortcut methods
 */
/** @type {Logger} */
const log = {
	// Logger active flag
	active: true,

	// Mapping of log modes to CSS styles
	styles: {
		blue: 'color: dodgerblue;',
		gray: 'color: gray;',
		handler: 'color: steelblue;',
		orange: 'color: orange;',
		red: 'color: red;',
		white: 'color: white;',
		yellow: 'color: yellow;',
	},

	//Styled log with function name
	styled(mode, ...args) {
		if (!this.active) return
		const stack = new Error().stack
		const caller =
			stack
				?.split('\n')[3]
				?.trim()
				.split(' ')[1]
				.replace(/^(HTML\w+)/, '')
				?.replace(/[^a-zA-Z0-9_$]/g, '') || 'anonymous'
		const content = args
			.map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a))
			.join(', ')
		console.log(
			`%c${caller}%c(${content})`,
			`${this.styles[mode]}font-weight: bold;`,
			this.styles[mode]
		)
	},

	// Plain log without colors
	default(...args) {
		if (!this.active) return
		console.log(...args)
	},

	// Initialize shortcut methods
	init() {
		Object.keys(this.styles).forEach((mode) => {
			this[mode] = (...args) => this.styled(mode, ...args)
		})
	},
}

// @b Update content
//------------------------
function updateContent(element, content) {
	if (!element) return
	if (!content) {
		element.innerHTML = ''
	} else {
		element.innerHTML = content
	}
}

// #endregion
//========================
//#region @r HELPERS
//========================
// @b Save settings
//------------------------
function saveSettings() {
	const settings = {
		columns: $selectColumns.value,
		darkColor: $pickerBoardColor.value,
		highlightColor: $pickerHighlightColor.value,
		orientation: currentOrientation,
	}
	localStorage.setItem('settings', JSON.stringify(settings))
	log.orange(settings)
}

// @b Load settings
//------------------------
function loadSettings() {
	const savedSettings = localStorage.getItem('settings')
	let settings = {}

	if (savedSettings) {
		settings = JSON.parse(savedSettings)
	} else {
		settings = {
			columns: 3,
			darkColor: '#998877',
			highlightColor: '#336699',
			orientation: 'white',
		}
		localStorage.setItem('settings', JSON.stringify(settings))
	}

	log.orange(settings)
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

// @b Lighten color
//------------------------
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
//------------------------
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
//------------------------
function setTitle(title) {
	document.title = 'PGNgrid - ' + title
}
// #endregion
//========================
//#region @r HANDLERS
//========================
//------------------------
// @g GENERALS
//------------------------
// @b Handle key down
//------------------------
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

// @b Handle resize
//------------------------
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
		renderBoards(allGames[$selectGame.value].pgn)
	}
	if ($modalBigBoard.classList.contains('show-modal')) {
		renderBigBoard()
	}
}

// @b Handle print boards
//------------------------
function handlePrintBoards() {
	log.handler()
	window.print()
}

//------------------------
// @g DROP AREA
//------------------------
// @b Handle file drop click
//------------------------
function handleFileDropClick() {
	$fileInput.click()
}
// @b Handle file drag over
//------------------------
function handleFileDragOver(e) {
	e.preventDefault()
	$fileDropArea.classList.add('drag-over')
}
// @b Handle file drag leave
//------------------------
function handleFileDragLeave() {
	$fileDropArea.classList.remove('drag-over')
}
// @b Handle file drop
//------------------------
function handleFileDrop(e) {
	e.preventDefault()
	$fileDropArea.classList.remove('drag-over')
	const file = e.dataTransfer.files[0]
	handleFile(file)
}
// @b Handle paste area input
//------------------------
function handlePasteAreaInput(event) {
	pgnString = event.target.value.trim()
	if (pgnString.length > 0) {
		processPgn()
	}
}
// @b Handle paste area click
//------------------------
function handlePasteAreaClick(event) {
	event.stopPropagation()
}

//------------------------
// @g FILE PICKER
//------------------------
// @b Handle file
//------------------------
function handleFile(file) {
	if (!file) return
	const reader = new FileReader()
	reader.onload = function (e) {
		pgnString = e.target.result
		processPgn()
	}
	reader.readAsText(file)
}
// @b Handle file change
//------------------------
function handleFileChange(event) {
	const file = event.target.files[0]
	handleFile(file)
}
// @b Handle file drag over
//------------------------
function handleFileDragOverOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$btnFile.classList.add('drag-over')
}
// @b Handle file drag leave
//------------------------
function handleFileDragLeaveOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$btnFile.classList.remove('drag-over')
}
// @b Handle file drop
//------------------------
function handleFileDropOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$btnFile.classList.remove('drag-over')
	const file = e.dataTransfer.files[0]
	handleFile(file)
}

//------------------------
// @g SETTINGS
//------------------------
// @b Handle orientation toggle
//------------------------
function handleOrientationToggle() {
	currentOrientation = currentOrientation === 'white' ? 'black' : 'white'
	log.handler(currentOrientation)
	generateBoards()
	saveSettings()
}

// @b Handle game select change
//------------------------
function handleGameSelectChange() {
	const selectedIndex = $selectGame.value
	log.handler(selectedIndex)
	if (selectedIndex !== '') {
		const selectedGame = allGames[selectedIndex]
		const gameTitle = selectedGame.header.Event
		renderBoards(allGames[selectedIndex].pgn)
		setTitle(gameTitle)
	} else {
		updateContent($divBoards)
	}
}

// @b Handle columns select change
//------------------------
function handleColumnsSelectChange() {
	if (pgnString) renderBoards(allGames[$selectGame.value].pgn)
	updateBoardLayout()
	saveSettings()
}

// @b Handle color picker input
//------------------------
function handleColorPickerInput() {
	changeBoardColors()
	changeHighlightColor()
	highlightLastMoves()
	highlightBigBoardMoves()
	saveSettings()
}

// @b Handle settings click
//------------------------
function handleSettingsClick() {
	$modalSettings.classList.add('show-modal')
}
// @b Handle close button click
//------------------------
function handleCloseBtnSettingsClick() {
	$modalSettings.classList.remove('show-modal')
}
// @b Handle window click
//------------------------
function handleWindowSettingsClick(event) {
	if (event.target === $modalSettings)
		$modalSettings.classList.remove('show-modal')
}

//------------------------
// @g BIG BOARD
//------------------------
// @b Handle board click
//------------------------
function handleBoardClick(index) {
	log.handler(index)
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
// @b Handle close button click
//------------------------
function handleCloseBtnBoardClick() {
	$modalBigBoard.classList.remove('show-modal')
	$modalBigBoard.removeEventListener('wheel', handleWheelNavigation)
	$divBigBoard.removeEventListener('touchstart', handleTouchStart)
	$divBigBoard.removeEventListener('touchend', handleTouchEnd)
}
// @b Handle window click
//------------------------
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
// @b Handle prev move click
//------------------------
function handlePrevMoveClick() {
	if (currentBoardIndex > 0) {
		currentBoardIndex--
		renderBigBoard()
	}
}
// @b Handle next move click
//------------------------
function handleNextMoveClick() {
	if (currentBoardIndex < positions.length - 1) {
		currentBoardIndex++
		renderBigBoard()
	}
}

// @b Handle wheel navigation
//------------------------
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
// @b Handle touch start
//------------------------
function handleTouchStart(event) {
	touchStartX = event.changedTouches[0].screenX
}
// @b Handle touch end
//------------------------
function handleTouchEnd(event) {
	touchEndX = event.changedTouches[0].screenX
	handleSwipe()
}
// @b Handle swipe
//------------------------
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

// #endregion
//========================
//#region @r LISTENERS
//========================
const setupListeners = () => {
	// @b Window
	//------------------------
	document.addEventListener('keydown', handleKeyDown)
	window.addEventListener('click', handleWindowBoardClick)
	window.addEventListener('click', handleWindowSettingsClick)
	window.onresize = handleResize

	// @b Drop area
	//------------------------
	$pgnPasteArea.addEventListener('input', handlePasteAreaInput)
	$pgnPasteArea.addEventListener('click', handlePasteAreaClick)
	$fileDropArea.addEventListener('click', handleFileDropClick)
	$fileDropArea.addEventListener('dragover', handleFileDragOver)
	$fileDropArea.addEventListener('dragleave', handleFileDragLeave)
	$fileDropArea.addEventListener('drop', handleFileDrop)

	// @b Buttons
	//------------------------
	$btnCloseSettings.addEventListener('click', handleCloseBtnSettingsClick)
	$btnCloseBigBoard.addEventListener('click', handleCloseBtnBoardClick)
	$btnNextMove.addEventListener('click', handleNextMoveClick)
	$btnPrevMove.addEventListener('click', handlePrevMoveClick)
	$btnOrientation.addEventListener('click', handleOrientationToggle)
	$btnSettings.addEventListener('click', handleSettingsClick)
	$btnPrint.addEventListener('click', handlePrintBoards)
	$btnFile.addEventListener('dragover', handleFileDragOverOnButton)
	$btnFile.addEventListener('dragleave', handleFileDragLeaveOnButton)
	$btnFile.addEventListener('drop', handleFileDropOnButton)
	$fileInput.addEventListener('change', handleFileChange)

	// @b Selects
	//------------------------
	$selectGame.addEventListener('change', handleGameSelectChange)
	$selectColumns.addEventListener('change', handleColumnsSelectChange)
	$pickerBoardColor.addEventListener('input', handleColorPickerInput)
	$pickerHighlightColor.addEventListener('input', handleColorPickerInput)
	addWheelListener($selectColumns, handleColumnsSelectChange)
	addWheelListener($selectGame, handleGameSelectChange)
}
// #endregion
//========================
//#region @r MAIN LOGIC
//========================
// @b Process PGN
//------------------------
function processPgn() {
	updateContent($divBoards)
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
				const headers = {}
				const headerRegex = /\[(\w+)\s+"(.*?)"\]/g
				let match
				while ((match = headerRegex.exec(finalPgn)) !== null) {
					headers[match[1]] = match[2]
				}

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
		renderBoards(allGames[0].pgn)
		setTitle(firstGameTitle)
	} catch (error) {
		console.error('Błąd podczas przetwarzania PGN:', error)
		alert(
			'Wystąpił błąd podczas przetwarzania PGN. Upewnij się, że format jest poprawny.'
		)
	}
}

// @b Populate game select
//------------------------
function populateGameSelect() {
	updateContent($selectGame)
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
//------------------------
function updateColumnsSelect() {
	if (!$selectColumns) return
	const containerWidth = $divBoards.clientWidth - 20
	const minBoardSize = 150
	const gap = 10
	let maxColumns = Math.floor((containerWidth + gap) / (minBoardSize + gap))
	maxColumns = Math.max(1, maxColumns)

	updateContent($selectColumns)
	for (let i = 1; i <= maxColumns; i++) {
		const option = document.createElement('option')
		option.value = i
		option.textContent = i
		$selectColumns.appendChild(option)
	}
}

// @b Calculate board size
//------------------------
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
//------------------------
function updateBoardLayout() {
	if ($selectColumns) {
		const columns = $selectColumns.value
		$divBoards.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
	}
}

// @b Generate boards
//------------------------
function generateBoards() {
	updateContent($divBoards)
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
	highlightLastMoves()
	updateBoardLayout()
}

// @b Change board colors
//------------------------
function changeBoardColors() {
	const darkColor = $pickerBoardColor.value
	const lightColor = lightenColor(darkColor, 0.5)
	$root.style.setProperty('--board-dark-color', darkColor)
	$root.style.setProperty('--board-light-color', lightColor)
	drawBoardOnCanvas($logo)
	updateFavicon()
}

// @b Change highlight color
//------------------------
function changeHighlightColor() {
	const highlightColor = $pickerHighlightColor.value
	$root.style.setProperty('--highlight-color', highlightColor)
}

// @b Highlight last move
//------------------------
function highlightLastMoves() {
	document.querySelectorAll('.square-55d63').forEach((square) => {
		square.style.removeProperty('background-color')
	})

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
	document.querySelectorAll('#big-board .square-55d63').forEach((square) => {
		square.style.removeProperty('background-color')
	})

	if (!bigBoard || !positions[currentBoardIndex]) {
		return
	}

	const pos = positions[currentBoardIndex]
	const fromSquare = document.querySelector(`#big-board .square-${pos.from}`)
	const toSquare = document.querySelector(`#big-board .square-${pos.to}`)

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
}

// @b Scroll to active move
//------------------------
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

// @b Render move list
//------------------------
function renderMoveList() {
	updateContent($moveListDisplay)
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
//------------------------
function renderBigBoard() {
	log.yellow()
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

	renderMoveList()
	scrollToActiveMove()
}

// @b Render boards
//------------------------
function renderBoards(pgnToRender) {
	log.yellow()
	updateContent($divBoards)
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

// #endregion
//========================
//#region @r APP INIT
//========================
function init() {
	log.init()
	log.white()
	loadSettings()
	changeBoardColors()
	changeHighlightColor()
	setupListeners()
}

document.addEventListener('DOMContentLoaded', () => {
	init()
})
// #endregion
