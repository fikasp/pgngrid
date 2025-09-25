// @p PGNgrid
//========================
//#region @r APP STATE
//========================
const state = {
	//--- Chess data ---
	allGames: [],
	bigBoard: null,
	chessboards: [],
	currentBoardIndex: 0,
	pgnString: '',
	positions: [],

	//--- Settings ---
	settings: {
		darkColor: '#998877',
		highlightColor: '#336699',
		orientation: 'white',
		columns: 3,
	},

	//--- Touch ---
	touchStartX: 0,
	touchEndX: 0,
}

// #endregion
//========================
//#region @r SELECTORS
//========================
const $ = {
	//--- Layout ---
	root: document.documentElement,
	logo: document.getElementById('logo'),
	divBoards: document.getElementById('boards'),
	divBigBoard: document.getElementById('big-board'),
	headerCenter: document.querySelector('.header-center'),
	headerRight: document.querySelector('.header-right'),
	moveListDisplay: document.getElementById('move-list-display'),
	modalBigBoard: document.getElementById('big-board-modal'),
	modalSettings: document.getElementById('settings-modal'),

	//--- Buttons ---
	btnCloseBigBoard: document.getElementById('btn-close-board'),
	btnCloseSettings: document.querySelector('.btn-close-settings'),
	btnOrientation: document.getElementById('btn-orientation'),
	btnNextMove: document.getElementById('btn-next-move'),
	btnPrevMove: document.getElementById('btn-prev-move'),
	btnSettings: document.getElementById('btn-settings'),
	btnPrint: document.getElementById('btn-print'),
	btnFile: document.getElementById('btn-file'),

	//--- Selects ---
	fileInput: document.getElementById('pgn-file'),
	fileDropArea: document.getElementById('file-drop-area'),
	pgnPasteArea: document.getElementById('pgn-paste-area'),
	pickerBoardColor: document.getElementById('dark-color-picker'),
	pickerHighlightColor: document.getElementById('highlight-color-picker'),
	selectColumns: document.getElementById('board-columns'),
	selectGame: document.getElementById('game-select'),
}

// #endregion
//========================
//#region @r LISTENERS
//========================
const setupListeners = () => {
	//--- Window ---
	window.onresize = handleResize
	document.addEventListener('keydown', handleKeyDown)

	//--- Modals ---
	$.modalBigBoard.addEventListener('click', handleCloseBoardClick)
	$.modalSettings.addEventListener('click', handleCloseSettingsClick)

	//--- Drop area ---
	$.pgnPasteArea.addEventListener('input', handlePasteAreaInput)
	$.pgnPasteArea.addEventListener('click', handlePasteAreaClick)
	$.fileDropArea.addEventListener('click', handleFileDropClick)
	$.fileDropArea.addEventListener('dragover', handleFileDragOver)
	$.fileDropArea.addEventListener('dragleave', handleFileDragLeave)
	$.fileDropArea.addEventListener('drop', handleFileDrop)

	// --- Buttons ---
	$.btnCloseBigBoard.addEventListener('click', handleCloseBoardClick)
	$.btnCloseSettings.addEventListener('click', handleCloseSettingsClick)
	$.btnNextMove.addEventListener('click', handleNextMoveClick)
	$.btnPrevMove.addEventListener('click', handlePrevMoveClick)
	$.btnOrientation.addEventListener('click', handleOrientationToggle)
	$.btnSettings.addEventListener('click', handleSettingsClick)
	$.btnPrint.addEventListener('click', handlePrintBoards)
	$.btnFile.addEventListener('dragover', handleFileDragOverOnButton)
	$.btnFile.addEventListener('dragleave', handleFileDragLeaveOnButton)
	$.btnFile.addEventListener('drop', handleFileDropOnButton)
	$.fileInput.addEventListener('change', handleFileChange)

	//--- Selects ---
	$.selectGame.addEventListener('change', handleGameSelectChange)
	$.selectColumns.addEventListener('change', handleColumnsSelectChange)
	$.pickerBoardColor.addEventListener('input', handleBoardColorPicker)
	$.pickerHighlightColor.addEventListener('input', handleHighlightColorPicker)
	addWheelListener($.selectColumns, handleColumnsSelectChange)
	addWheelListener($.selectGame, handleGameSelectChange)
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
	log.blue(event.key)
	if ($.modalBigBoard.classList.contains('show-modal')) {
		if (event.key === 'ArrowLeft') {
			if (state.currentBoardIndex > 0) {
				state.currentBoardIndex--
				renderBigBoard()
			}
		} else if (event.key === 'ArrowRight') {
			if (state.currentBoardIndex < state.positions.length - 1) {
				state.currentBoardIndex++
				renderBigBoard()
			}
		} else if (event.key === 'Escape') {
			$.modalBigBoard.classList.remove('show-modal')
			$.modalBigBoard.removeEventListener('wheel', handleWheelNavigation)
		}
	} else if (
		$.modalSettings.classList.contains('show-modal') &&
		event.key === 'Escape'
	) {
		$.modalSettings.classList.remove('show-modal')
	}
}

// @b Handle resize
//------------------------
function handleResize() {
	log.blue()
	const currentColumns = $.selectColumns.value

	updateColumnsSelect()

	const optionExists = Array.from($.selectColumns.options).some(
		(option) => option.value === currentColumns
	)

	if (optionExists) {
		$.selectColumns.value = currentColumns
	} else {
		const maxColumnsValue =
			$.selectColumns.options[$.selectColumns.options.length - 1].value
		$.selectColumns.value = maxColumnsValue
		saveSettings()
	}

	if (state.pgnString && state.allGames.length > 0) {
		renderBoards(state.allGames[$.selectGame.value].pgn)
	}
	if ($.modalBigBoard.classList.contains('show-modal')) {
		renderBigBoard()
	}
}

// @b Handle print boards
//------------------------
function handlePrintBoards() {
	log.blue()
	window.print()
}

//------------------------
// @g DROP AREA
//------------------------
// @b Handle file drop click
//------------------------
function handleFileDropClick() {
	$.fileInput.click()
}
// @b Handle file drag over
//------------------------
function handleFileDragOver(e) {
	e.preventDefault()
	$.fileDropArea.classList.add('drag-over')
}
// @b Handle file drag leave
//------------------------
function handleFileDragLeave() {
	$.fileDropArea.classList.remove('drag-over')
}
// @b Handle file drop
//------------------------
function handleFileDrop(e) {
	e.preventDefault()
	$.fileDropArea.classList.remove('drag-over')
	const file = e.dataTransfer.files[0]
	handleFile(file)
}
// @b Handle paste area input
//------------------------
function handlePasteAreaInput(event) {
	state.pgnString = event.target.value.trim()
	if (state.pgnString.length > 0) {
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
		state.pgnString = e.target.result
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
	$.btnFile.classList.add('drag-over')
}
// @b Handle file drag leave
//------------------------
function handleFileDragLeaveOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$.btnFile.classList.remove('drag-over')
}
// @b Handle file drop
//------------------------
function handleFileDropOnButton(e) {
	e.preventDefault()
	e.stopPropagation()
	$.btnFile.classList.remove('drag-over')
	const file = e.dataTransfer.files[0]
	handleFile(file)
}

//------------------------
// @g SETTINGS
//------------------------
// @b Handle orientation toggle
//------------------------
function handleOrientationToggle() {
	state.settings.orientation =
		state.settings.orientation === 'white' ? 'black' : 'white'
	log.blue(state.settings.orientation)
	generateBoards()
	saveSettings()
}

// @b Handle game select change
//------------------------
function handleGameSelectChange() {
	const selectedIndex = $.selectGame.value
	log.blue(selectedIndex)
	if (selectedIndex !== '') {
		const selectedGame = state.allGames[selectedIndex]
		const gameTitle = selectedGame.header.Event
		renderBoards(state.allGames[selectedIndex].pgn)
		updateTitle(gameTitle)
	} else {
		clearContent($.divBoards)
	}
}

// @b Handle columns select change
//------------------------
function handleColumnsSelectChange() {
	log.blue($.selectGame.value)
	renderBoards(state.allGames[$.selectGame.value].pgn)
	updateBoardLayout()
	saveSettings()
}

// @b Handle board color picker
//------------------------
function handleBoardColorPicker() {
	log.blue()
	changeBoardColors()
	saveSettings()
}

// @b Handle highlight color picker
//------------------------
function handleHighlightColorPicker() {
	log.blue()
	changeHighlightColor()
	highlightMoves()
	saveSettings()
}
// @b Handle settings click
//------------------------
function handleSettingsClick() {
	log.blue()
	$.modalSettings.classList.add('show-modal')
}
// @b Handle close button click
//------------------------
function handleCloseSettingsClick(event) {
	log.blue()
	if (event.target === $.modalSettings || event.target === $.btnCloseSettings) {
		$.modalSettings.classList.remove('show-modal')
	}
}

//------------------------
// @g BIG BOARD
//------------------------
// @b Handle board click
//------------------------
function handleBoardClick(index) {
	log.blue(index)
	state.currentBoardIndex = index
	$.modalBigBoard.classList.add('show-modal')
	$.modalBigBoard.addEventListener('wheel', handleWheelNavigation, {
		passive: false,
	})
	$.divBigBoard.addEventListener('touchstart', handleTouchStart, {
		passive: false,
	})
	$.divBigBoard.addEventListener('touchend', handleTouchEnd, {
		passive: false,
	})
	renderBigBoard()
}
// @b Handle close board
//------------------------
function handleCloseBoardClick(event) {
	log.blue(event.target)
	if (
		event.target === $.modalBigBoard ||
		event.currentTarget === $.btnCloseBigBoard
	) {
		$.modalBigBoard.classList.remove('show-modal')
		$.modalBigBoard.removeEventListener('wheel', handleWheelNavigation)
		$.divBigBoard.removeEventListener('touchstart', handleTouchStart)
		$.divBigBoard.removeEventListener('touchend', handleTouchEnd)
	}
}
// @b Handle prev move click
//------------------------
function handlePrevMoveClick() {
	log.blue()
	if (state.currentBoardIndex > 0) {
		state.currentBoardIndex--
		renderBigBoard()
	}
}
// @b Handle next move click
//------------------------
function handleNextMoveClick() {
	log.blue()
	if (state.currentBoardIndex < state.positions.length - 1) {
		state.currentBoardIndex++
		renderBigBoard()
	}
}
// @b Handle wheel navigation
//------------------------
function handleWheelNavigation(event) {
	event.preventDefault()
	if (event.deltaY > 0) {
		if (state.currentBoardIndex < state.positions.length - 1) {
			state.currentBoardIndex++
			renderBigBoard()
		}
	} else {
		if (state.currentBoardIndex > 0) {
			state.currentBoardIndex--
			renderBigBoard()
		}
	}
}
// @b Handle touch start
//------------------------
function handleTouchStart(event) {
	state.touchStartX = event.changedTouches[0].screenX
}
// @b Handle touch end
//------------------------
function handleTouchEnd(event) {
	state.touchEndX = event.changedTouches[0].screenX
	handleSwipe()
}
// @b Handle swipe
//------------------------
function handleSwipe() {
	if (state.touchEndX < state.touchStartX - 50) {
		if (state.currentBoardIndex < state.positions.length - 1) {
			state.currentBoardIndex++
			renderBigBoard()
		}
	} else if (state.touchEndX > state.touchStartX + 50) {
		if (state.currentBoardIndex > 0) {
			state.currentBoardIndex--
			renderBigBoard()
		}
	}
}

// #endregion
//========================
//#region @r UTILITIES
//========================

// @b Add wheel listener
//------------------------
/**
 * Adds a mouse wheel listener to a <select> element to change its selected option.
 * @param {HTMLSelectElement} selectElement - The select element to attach the wheel listener to.
 * @param {Function} callback - A function to call whenever the selection changes.
 */
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

// @b Clear content
//------------------------
/**
 * Clear the inner HTML of a DOM element. *
 * @param {HTMLElement | undefined} element - The DOM element.
 */
function clearContent(element) {
	if (!element) return
	element.innerHTML = ''
}

// @b Lighten color
//------------------------
/**
 * Lightens a hex color by a percentage.
 * @param {string} hex - The hex color code.
 * @param {number} percent - The percentage to lighten the color.
 * @returns {string} The lightened hex color code.
 */
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

// @b Logger
//------------------------
/**
 * @typedef {Object} Logger
 * @property {boolean} active - Flag to activate/deactivate the logger
 * @property {Object.<string, string>} styles - Mapping of log modes to CSS styles
 * @property {function(string, ...any):void} styled - Styled log with function name
 * @property {function(...any):void} default - Plain log without colors
 * @property {function(...any):void} gray - Shortcut for gray logs
 * @property {function(...any):void} orange - Shortcut for orange logs
 * @property {function(...any):void} blue - Shortcut for blue logs
 * @property {function(...any):void} red - Shortcut for red logs
 * @property {function(...any):void} white - Shortcut for white logs
 * @property {function(...any):void} yellow - Shortcut for yellow logs
 * @property {function():void} init - Initializes shortcut methods
 */
/** @type {Logger} */
const log = {
	// Active flag
	active: true,

	// Log styles
	styles: {
		blue: { style: 'color: steelblue;', active: true },
		gray: { style: 'color: gray;', active: true },
		orange: { style: 'color: orange;', active: true },
		red: { style: 'color: red;', active: true },
		white: { style: 'color: white;', active: true },
		yellow: { style: 'color: yellow;', active: true },
	},

	// Styled log with function name
	styled(mode, ...args) {
		if (!this.active) return
		const styleObj = this.styles[mode]
		if (!styleObj || !styleObj.active) return

		const stack = new Error().stack
		const caller =
			stack
				?.split('\n')[3]
				?.trim()
				.split(' ')[1]
				?.replace(/^(HTML\w+)/, '') // remove HTMLButtonElement etc.
				?.replace(/[^a-zA-Z0-9_$]/g, '') || 'anonymous'

		const content = args
			.map((a) =>
				a instanceof HTMLElement
					? `[${a.tagName}]`
					: typeof a === 'object'
					? JSON.stringify(a, null, 2)
					: a
			)
			.join(', ')

		console.log(
			`%c${caller}%c(${content})`,
			`${styleObj.style}font-weight: bold;`,
			styleObj.style
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

// @b Set favicon
//------------------------
/**
 * Set the favicon based on the given canvas
 * @param {HTMLCanvasElement} canvas - The canvas to use for the favicon
 */
function setFavicon(canvas) {
	const existingLink = document.querySelector("link[rel='icon']")
	if (existingLink) {
		existingLink.remove()
	}
	const link = document.createElement('link')
	link.rel = 'icon'
	link.href = canvas.toDataURL('image/png')
	document.head.appendChild(link)
}

// @b Set title
/**
 * Sets the document's title.
 * @param {string} title - The new title to set for the document.
 */
//------------------------
function setTitle(title) {
	document.title = title
}

// #endregion
//========================
//#region @r SETTINGS
//========================

// @b Apply settings to UI
//------------------------
function applySettingsToUI() {
	$.selectColumns.value = state.settings.columns
	$.pickerBoardColor.value = state.settings.darkColor
	$.pickerHighlightColor.value = state.settings.highlightColor
	changeBoardColors()
	changeHighlightColor()
	updateColumnsSelect()
	updateBoardLayout()
}

// @b Change board colors
//------------------------
function changeBoardColors() {
	log.white()
	const { darkColor, lightColor } = getBoardColors()
	$.root.style.setProperty('--board-dark-color', darkColor)
	$.root.style.setProperty('--board-light-color', lightColor)
	updateLogo()
}

// @b Change highlight color
//------------------------
function changeHighlightColor() {
	log.white()
	const highlightColor = getHighlightColor()
	$.root.style.setProperty('--highlight-color', highlightColor)
}

// @b Load settings
//------------------------
function loadSettings() {
	const saved = localStorage.getItem('settings')
	if (saved) {
		try {
			const parsed = JSON.parse(saved)
			state.settings = { ...state.settings, ...(parsed || {}) }
		} catch (e) {
			console.error('Error parsing settings:', e)
		}
	}
	log.orange(state.settings)
}

// @b Save settings
//------------------------
function saveSettings() {
	const settings = {
		columns: $.selectColumns.value,
		darkColor: $.pickerBoardColor.value,
		highlightColor: $.pickerHighlightColor.value,
		orientation: state.settings.orientation,
	}
	localStorage.setItem('settings', JSON.stringify(settings))
	log.orange(settings)
}

// @b Update colums select
//------------------------
function updateColumnsSelect() {
	log.white()
	if (!$.selectColumns) return

	const containerWidth = $.divBoards.clientWidth - 20
	const minBoardSize = 150
	const gap = 10
	let maxColumns = Math.floor((containerWidth + gap) / (minBoardSize + gap))
	maxColumns = Math.max(1, maxColumns)

	clearContent($.selectColumns)

	for (let i = 1; i <= maxColumns; i++) {
		const option = document.createElement('option')
		option.value = i
		option.textContent = i
		$.selectColumns.appendChild(option)
	}

	let current = parseInt(state.settings.columns, 10)
	if (isNaN(current)) current = 1

	if (current > maxColumns) current = maxColumns
	if (current < 1) current = 1

	$.selectColumns.value = current
	state.settings.columns = current
}

// @b Update game select
//------------------------
function updateGameSelect() {
	log.white()
	clearContent($.selectGame)
	$.selectGame.style.display = 'block'

	state.allGames.forEach((game, index) => {
		const event = game.header.Event || `Partia ${index + 1}`

		let optionText = event

		const option = document.createElement('option')
		option.value = index
		option.textContent = optionText
		$.selectGame.appendChild(option)
	})
}

// #endregion
//========================
//#region @r HELPERS
//========================

// @b Apply highlight to squares
// -----------------------------
function applyHighlight(fromSquare, toSquare, highlightColor) {
	const fromIsLight = fromSquare.classList.contains('white-1e1d7')
	fromSquare.style.backgroundColor = fromIsLight
		? lightenColor(highlightColor, 0.5)
		: highlightColor

	const toIsLight = toSquare.classList.contains('white-1e1d7')
	toSquare.style.backgroundColor = toIsLight
		? lightenColor(highlightColor, 0.5)
		: highlightColor
}

// @b Calculate board size
//------------------------
function calculateBoardSize() {
	log.gray()
	if (!$.selectColumns) return 400
	const columns = parseInt($.selectColumns.value, 10)
	const containerWidth = $.divBoards.clientWidth - 20
	const minBoardSize = 150
	const maxBoardSize = 750
	const gap = 10
	let boardSize = (containerWidth - (columns - 1) * gap) / columns
	boardSize = Math.max(minBoardSize, Math.min(boardSize, maxBoardSize))
	return Math.floor(boardSize)
}

// @b Draw mini board
//------------------------
function drawMiniBoard(canvas) {
	const { darkColor, lightColor } = getBoardColors()
	const ctx = canvas.getContext('2d')
	const size = canvas.width / 2

	ctx.fillStyle = lightColor
	ctx.fillRect(0, 0, size, size)
	ctx.fillRect(size, size, size, size)

	ctx.fillStyle = darkColor
	ctx.fillRect(size, 0, size, size)
	ctx.fillRect(0, size, size, size)
}

// @b Get current board colors
// --------------------------
function getBoardColors() {
	const darkColor = $.pickerBoardColor.value
	const lightColor = lightenColor(darkColor, 0.5)
	return { darkColor, lightColor }
}

// @b Get current highlight color
// ------------------------------
function getHighlightColor() {
	return $.pickerHighlightColor.value
}

// @b Scroll to active move
//------------------------
function scrollToActiveMove() {
	log.gray()
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

// @b Update logo
//------------------------
function updateLogo() {
	log.gray()
	const canvas = document.createElement('canvas')
	canvas.width = 16
	canvas.height = 16
	drawMiniBoard($.logo)
	drawMiniBoard(canvas)
	setFavicon(canvas)
}

// @b Update title
//------------------------
function updateTitle(title) {
	log.gray()
	setTitle('PGNgrid - ' + title)
}
// #endregion
//========================
//#region @r MAIN LOGIC
//========================

// @b Generate boards
//------------------------
function generateBoards() {
	log.gray()
	clearContent($.divBoards)
	state.chessboards.length = 0

	const currentSize = calculateBoardSize()
	state.positions.forEach((pos, index) => {
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
					(state.settings.orientation === 'white' && pos.color === 'w') ||
					(state.settings.orientation === 'black' && pos.color === 'b')
				) {
					moveInfo.classList.add('bold-move')
				}
			}
			moveInfo.innerText = pos.moveText
			boardWrapper.appendChild(moveInfo)
		}
		boardWrapper.appendChild(boardDiv)
		$.divBoards.appendChild(boardWrapper)

		const config = {
			position: pos.fen,
			draggable: false,
			pieceTheme: 'src/img/{piece}.png',
			orientation: state.settings.orientation,
			showNotation: false,
		}
		const board = new Chessboard(boardId, config)
		state.chessboards.push({ board, boardId })
		boardWrapper.addEventListener('click', () => handleBoardClick(index))
	})
	updateBoardLayout()
	highlightMoves()
}

// @b Highlight moves
//---------------------------------
function highlightMoves() {
	log.gray()
	if (!state.positions.length) return

	const currentPosition = state.positions[state.currentBoardIndex]
	const highlightColor = $.pickerHighlightColor.value

	// Mini boards
	state.chessboards.forEach(({ boardId }, index) => {
		const pos = state.positions[index]
		const fromSquare = document.querySelector(`#${boardId} .square-${pos.from}`)
		const toSquare = document.querySelector(`#${boardId} .square-${pos.to}`)
		if (fromSquare && toSquare)
			applyHighlight(fromSquare, toSquare, highlightColor)
	})

	// Big board
	if (!state.bigBoard || !currentPosition) return

	const fromBig = document.querySelector(
		`#big-board .square-${currentPosition.from}`
	)
	const toBig = document.querySelector(
		`#big-board .square-${currentPosition.to}`
	)
	if (fromBig && toBig) applyHighlight(fromBig, toBig, highlightColor)
}

// @b Process PGN
//------------------------
function processPgn() {
	log.yellow()
	clearContent($.divBoards)
	state.chessboards.length = 0
	state.positions.length = 0
	state.allGames.length = 0

	if (state.pgnString.length === 0) {
		return
	}

	$.fileDropArea.style.display = 'none'
	if ($.headerRight) $.headerRight.style.display = 'flex'
	if ($.headerCenter) $.headerCenter.style.display = 'flex'

	try {
		let gamesArray = []

		if (state.pgnString.includes('[Event')) {
			gamesArray = state.pgnString
				.split('[Event ')
				.filter(Boolean)
				.map((gamePgn) => `[Event ${gamePgn}`)
		} else {
			gamesArray = state.pgnString
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

				state.allGames.push({ pgn: finalPgn, header: headers })
			} else {
				console.warn(`Could not load PGN for game: ${index + 1}`)
			}
		})

		if (state.allGames.length === 0) {
			alert('Nie znaleziono żadnej partii w podanym tekście.')
			$.selectGame.style.display = 'none'
			return
		}

		if ($.selectColumns) $.selectColumns.style.display = 'inline-block'
		updateGameSelect()

		const firstGame = state.allGames[0]
		const firstGameTitle = firstGame.header.Event
		renderBoards(state.allGames[0].pgn)
		updateTitle(firstGameTitle)
	} catch (error) {
		console.error('Błąd podczas przetwarzania PGN:', error)
		alert(
			'Wystąpił błąd podczas przetwarzania PGN. Upewnij się, że format jest poprawny.'
		)
	}
}

// @b Render move list
//------------------------
function renderMoveList() {
	log.gray()
	clearContent($.moveListDisplay)
	state.positions.forEach((pos, index) => {
		const moveSpan = document.createElement('span')
		moveSpan.innerText = pos.moveText
		if (index === state.currentBoardIndex) {
			moveSpan.classList.add('active-move')
		}
		moveSpan.addEventListener('click', () => {
			state.currentBoardIndex = index
			renderBigBoard()
		})
		$.moveListDisplay.appendChild(moveSpan)
	})
	scrollToActiveMove()
}

// @b Render big board
//------------------------
function renderBigBoard() {
	log.yellow()
	const position = state.positions[state.currentBoardIndex]
	if (!position) return
	if (state.bigBoard) state.bigBoard.destroy()

	if ($.divBigBoard) {
		const config = {
			position: position.fen,
			draggable: false,
			pieceTheme: 'src/img/{piece}.png',
			showNotation: true,
			orientation: state.settings.orientation,
		}
		state.bigBoard = new Chessboard('big-board', config)

		const squares = document.querySelectorAll('#big-board .square-55d63')
		squares.forEach((square) => {
			square.classList.remove('highlight-3c678')
			square.style.boxShadow = 'none'
		})
		highlightMoves()
	} else {
		console.error('Element #big-board not found!')
	}

	if ($.btnPrevMove) $.btnPrevMove.disabled = state.currentBoardIndex === 0
	if ($.btnNextMove)
		$.btnNextMove.disabled =
			state.currentBoardIndex >= state.positions.length - 1

	renderMoveList()
}

// @b Render boards
//------------------------
function renderBoards(pgnToRender) {
	log.yellow()
	clearContent($.divBoards)
	state.chessboards.length = 0
	state.positions = []
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
			state.positions.push({
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

// @b Update board layout
//------------------------
function updateBoardLayout() {
	log.white()
	if ($.selectColumns) {
		const columns = $.selectColumns.value
		$.divBoards.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
	}
}

// #endregion
//========================
//#region @r APP INIT
//========================
function init() {
	log.init()
	log.yellow()
	loadSettings()
	applySettingsToUI()
	setupListeners()
}

document.addEventListener('DOMContentLoaded', () => {
	init()
})
// #endregion
