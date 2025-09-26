// @p PGNgrid
//========================
//#region @r STATE
//========================
const STATE = {
	allGames: [],
	bigBoard: null,
	chessboards: [],
	currentBoardIndex: 0,
	isModalOpen: false,
	lastWidth: window.innerWidth,
	lastHeight: window.innerHeight,
	pgnString: '',
	positions: [],
	settings: {
		darkColor: '#998877',
		highlightColor: '#336699',
		orientation: 'white',
		columns: 3,
	},
	touchStartX: 0,
	touchEndX: 0,
}
// #endregion
//========================
//#region @r SELECTORS
//========================
const $ = {
	body: document.body,
	root: document.documentElement,
	logo: document.getElementById('logo'),
	divs: {
		boards: document.getElementById('boards'),
		bigBoard: document.getElementById('big-board'),
		dropArea: document.getElementById('file-drop-area'),
	},
	headers: {
		center: document.querySelector('.header__center'),
		right: document.querySelector('.header__right'),
	},
	modals: {
		bigBoard: document.getElementById('big-board-modal'), // .modal--board
		settings: document.getElementById('settings-modal'), // .modal--settings
	},
	buttons: {
		closeBigBoard: document.getElementById('btn-close-board'), // .modal__close-btn
		closeSettings: document.getElementById('btn-close-settings'), //.modal__close-settings
		orientation: document.getElementById('btn-orientation'), // .header__button--orientation
		nextMove: document.getElementById('btn-next-move'), // .modal__nav-btn--right
		prevMove: document.getElementById('btn-prev-move'), // .modal__nav-btn--left
		settings: document.getElementById('btn-settings'), // .header__button--settings
		print: document.getElementById('btn-print'), // .header__button--print
		file: document.getElementById('btn-file'), // .header__button--file (label)
	},
	inputs: {
		file: document.getElementById('pgn-file'), // .header__file-input
		dropArea: document.getElementById('file-drop-area'), // .drop-zone
		pasteArea: document.getElementById('pgn-paste-area'), // .drop-zone__textarea
		boardColorPicker: document.getElementById('dark-color-picker'), // .modal__color-picker
		highlightColorPicker: document.getElementById('highlight-color-picker'), // .modal__color-picker
	},
	selects: {
		columns: document.getElementById('board-columns'), // .header__select--columns
		game: document.getElementById('game-select'), // .header__select--game
	},
	moveListDisplay: document.getElementById('move-list-display'), // .modal__move-list
}
// #endregion
//========================
//#region @r LISTENERS
//========================
const Listeners = {
	setup: () => {
		window.onresize = Tools.debounce(Handlers.window.resize, 200)
		window.addEventListener('touchmove', Handlers.window.blockScroll, { passive: false })
		document.addEventListener('keydown', Handlers.window.keyDown)

		// Modals
		$.modals.bigBoard.addEventListener('click', Handlers.modals.closeBoardClick)
		$.modals.settings.addEventListener('click', Handlers.modals.closeSettingsClick)

		// Paste/Input Area
		$.inputs.pasteArea.addEventListener('input', Handlers.input.pasteAreaInput)
		$.inputs.pasteArea.addEventListener('click', Handlers.input.pasteAreaClick)

		// File Drop Area
		$.inputs.dropArea.addEventListener('click', Handlers.file.dropClick)
		$.inputs.dropArea.addEventListener('dragover', Handlers.file.dragOver)
		$.inputs.dropArea.addEventListener('dragleave', Handlers.file.dragLeave)
		$.inputs.dropArea.addEventListener('drop', Handlers.file.drop)

		// Buttons
		$.buttons.closeBigBoard.addEventListener('click', Handlers.modals.closeBoardClick)
		$.buttons.closeSettings.addEventListener('click', Handlers.modals.closeSettingsClick)
		$.buttons.nextMove.addEventListener('click', Handlers.navigation.nextMoveClick)
		$.buttons.prevMove.addEventListener('click', Handlers.navigation.prevMoveClick)
		$.buttons.orientation.addEventListener('click', Handlers.settings.orientationToggle)
		$.buttons.settings.addEventListener('click', Handlers.modals.settingsClick)
		$.buttons.print.addEventListener('click', Handlers.window.printBoards)

		// File Button
		$.buttons.file.addEventListener('dragover', Handlers.file.dragOverOnButton)
		$.buttons.file.addEventListener('dragleave', Handlers.file.dragLeaveOnButton)
		$.buttons.file.addEventListener('drop', Handlers.file.dropOnButton)
		$.inputs.file.addEventListener('change', Handlers.file.change)

		// Selects
		$.selects.game.addEventListener('change', Handlers.selects.gameSelectChange)
		$.selects.columns.addEventListener('change', Handlers.selects.columnsSelectChange)
		Tools.addWheelListener($.selects.columns, Handlers.selects.columnsSelectChange)
		Tools.addWheelListener($.selects.game, Handlers.selects.gameSelectChange)

		// Color Pickers
		$.inputs.boardColorPicker.addEventListener('input', Handlers.settings.boardColorPicker)
		$.inputs.highlightColorPicker.addEventListener('input', Handlers.settings.highlightColorPicker)
	},
}
// #endregion
//========================
//#region @r HANDLERS
//========================
const Handlers = {
	window: {
		// / @b Handle key down events
		// ------------------------
		keyDown: (event) => {
			Log.blue(event.key)
			if ($.modals.bigBoard.classList.contains('show-modal')) {
				if (event.key === 'ArrowLeft') Handlers.navigation.prevMoveClick()
				else if (event.key === 'ArrowRight') Handlers.navigation.nextMoveClick()
				else if (event.key === 'Escape') Handlers.modals.closeBoardClick(event)
			} else if ($.modals.settings.classList.contains('show-modal') && event.key === 'Escape') {
				Handlers.modals.closeSettingsClick(event)
			}
		},
		// / @b Handle window resize event
		// ------------------------
		resize: () => {
			Log.blue()
			const currentWidth = window.innerWidth
			const currentHeight = window.innerHeight
			const widthDifference = Math.abs(currentWidth - STATE.lastWidth)
			const heightDifference = Math.abs(currentHeight - STATE.lastHeight)

			const MIN_CHANGE_THRESHOLD = 50

			if (widthDifference < MIN_CHANGE_THRESHOLD && heightDifference < MIN_CHANGE_THRESHOLD) {
				return
			}

			STATE.lastWidth = currentWidth
			STATE.lastHeight = currentHeight

			Settings.updateColumnsSelect()
			if (STATE.pgnString && STATE.allGames.length > 0) {
				Logic.processBoards(STATE.allGames[$.selects.game.value].pgn)
			}
			if ($.modals.bigBoard.classList.contains('show-modal')) {
				Renderers.renderBigBoard()
			}
		},
		// @b Block scroll
		//------------------------
		blockScroll: (event) => {
			if (STATE.isModalOpen) {
				event.preventDefault()
			}
		},
		// / @b Handle print button click
		// ------------------------
		printBoards: () => {
			Log.blue()
			window.print()
		},
	},

	file: {
		// / @b Trigger file input click
		// ------------------------
		dropClick: () => $.inputs.file.click(),
		// / @b Handle file drag over event
		// ------------------------
		dragOver: (e) => {
			e.preventDefault()
			$.inputs.dropArea.classList.add('drag-over')
		},
		// / @b Handle file drag leave event
		// ------------------------
		dragLeave: () => $.inputs.dropArea.classList.remove('drag-over'),
		// / @b Handle file drop event
		// ------------------------
		drop: (e) => {
			e.preventDefault()
			$.inputs.dropArea.classList.remove('drag-over')
			Logic.handleFile(e.dataTransfer.files[0])
		},
		// / @b Handle file input change
		// ------------------------
		change: (event) => Logic.handleFile(event.target.files[0]),
		// / @b Handle file drag over on button
		// ------------------------
		dragOverOnButton: (e) => {
			e.preventDefault()
			e.stopPropagation()
			$.buttons.file.classList.add('drag-over')
		},
		// / @b Handle file drag leave on button
		// ------------------------
		dragLeaveOnButton: (e) => {
			e.preventDefault()
			e.stopPropagation()
			$.buttons.file.classList.remove('drag-over')
		},
		// / @b Handle file drop on button
		// ------------------------
		dropOnButton: (e) => {
			e.preventDefault()
			e.stopPropagation()
			$.buttons.file.classList.remove('drag-over')
			Logic.handleFile(e.dataTransfer.files[0])
		},
	},

	input: {
		// / @b Handle PGN paste area input
		// ------------------------
		pasteAreaInput: (event) => {
			STATE.pgnString = event.target.value.trim()
			if (STATE.pgnString.length > 0) Logic.processPgn()
		},
		// / @b Prevent click propagation on paste area
		// ------------------------
		pasteAreaClick: (event) => event.stopPropagation(),
	},

	selects: {
		// / @b Handle game select change
		// ------------------------
		gameSelectChange: () => {
			const selectedIndex = $.selects.game.value
			Log.blue(selectedIndex)
			if (selectedIndex !== '') {
				const selectedGame = STATE.allGames[selectedIndex]
				const gameTitle = selectedGame.header.Event
				Logic.processBoards(STATE.allGames[selectedIndex].pgn)
				Helpers.updateTitle(gameTitle)
			} else {
				Tools.clearContent($.divs.boards)
			}
		},
		// / @b Handle columns select change
		// ------------------------
		columnsSelectChange: () => {
			Log.blue($.selects.game.value)
			Logic.processBoards(STATE.allGames[$.selects.game.value].pgn)
			Helpers.updateBoardLayout()
			Settings.saveSettings()
		},
	},

	settings: {
		// / @b Toggle board orientation
		// ------------------------
		orientationToggle: () => {
			STATE.settings.orientation = STATE.settings.orientation === 'white' ? 'black' : 'white'
			Log.blue(STATE.settings.orientation)
			Renderers.renderBoards()
			Settings.saveSettings()
		},
		// / @b Handle dark board color change
		// ------------------------
		boardColorPicker: () => {
			Log.blue()
			Settings.changeBoardColors()
			Settings.saveSettings()
		},
		// / @b Handle highlight color change
		// ------------------------
		highlightColorPicker: () => {
			Log.blue()
			Settings.changeHighlightColor()
			Renderers.highlightMoves()
			Settings.saveSettings()
		},
	},

	modals: {
		// / @b Show settings modal
		// ------------------------
		settingsClick: () => {
			Log.blue()
			STATE.isModalOpen = true
			$.modals.settings.classList.add('show-modal')
		},
		// / @b Close settings modal
		// ------------------------
		closeSettingsClick: (event) => {
			Log.blue()
			STATE.isModalOpen = false
			if (event.target === $.modals.settings || event.target === $.buttons.closeSettings) {
				$.modals.settings.classList.remove('show-modal')
			}
		},
		// / @b Handle click on a small board to open the big board modal
		// ------------------------
		boardClick: (index) => {
			Log.blue(index)
			STATE.isModalOpen = true
			STATE.currentBoardIndex = index
			$.modals.bigBoard.classList.add('show-modal')
			$.modals.bigBoard.addEventListener('wheel', Handlers.navigation.wheelNavigation, { passive: false })
			$.divs.bigBoard.addEventListener('touchstart', Handlers.navigation.touchStart, { passive: false })
			$.divs.bigBoard.addEventListener('touchend', Handlers.navigation.touchEnd, { passive: false })
			Renderers.renderBigBoard()
		},
		// / @b Close big board modal
		// ------------------------
		closeBoardClick: (event) => {
			Log.blue()
			event.stopPropagation()
			if (event.target === $.modals.bigBoard || event.currentTarget === $.buttons.closeBigBoard) {
				$.modals.bigBoard.classList.remove('show-modal')
				$.modals.bigBoard.removeEventListener('wheel', Handlers.navigation.wheelNavigation)
				$.divs.bigBoard.removeEventListener('touchstart', Handlers.navigation.touchStart)
				$.divs.bigBoard.removeEventListener('touchend', Handlers.navigation.touchEnd)
				STATE.isModalOpen = false
			}
		},
	},

	navigation: {
		// / @b Navigate to previous move
		// ------------------------
		prevMoveClick: () => {
			Log.blue()
			if (STATE.currentBoardIndex > 0) {
				STATE.currentBoardIndex--
				Renderers.renderBigBoard()
			}
		},
		// / @b Navigate to next move
		// ------------------------
		nextMoveClick: () => {
			Log.blue()
			if (STATE.currentBoardIndex < STATE.positions.length - 1) {
				STATE.currentBoardIndex++
				Renderers.renderBigBoard()
			}
		},
		// / @b Handle wheel navigation (scroll) in big board modal
		// ------------------------
		wheelNavigation: (event) => {
			event.preventDefault()
			if (event.deltaY > 0) Handlers.navigation.nextMoveClick()
			else Handlers.navigation.prevMoveClick()
		},
		// / @b Handle touch start for swipe
		// ------------------------
		touchStart: (event) => (STATE.touchStartX = event.changedTouches[0].screenX),
		// / @b Handle touch end for swipe
		// ------------------------
		touchEnd: (event) => {
			STATE.touchEndX = event.changedTouches[0].screenX
			Handlers.navigation.swipe()
		},
		// / @b Determine and execute swipe action
		// ------------------------
		swipe: () => {
			if (STATE.touchEndX < STATE.touchStartX - 50) Handlers.navigation.nextMoveClick()
			else if (STATE.touchEndX > STATE.touchStartX + 50) Handlers.navigation.prevMoveClick()
		},
	},
}
// #endregion
//========================
//#region @r UTILITIES
//========================
// @b Loger
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
const Log = {
	active: true,
	styles: {
		blue: { style: 'color: steelblue;', active: true },
		gray: { style: 'color: gray;', active: true },
		orange: { style: 'color: orange;', active: true },
		red: { style: 'color: red;', active: true },
		white: { style: 'color: white;', active: true },
		yellow: { style: 'color: yellow;', active: true },
	},
	// Log styled message
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
				?.replace(/^(HTML\w+|Object)/, '')
				?.replace(/[^a-zA-Z0-9_$]/g, '') || 'anonymous'
		const content = args
			.map((a) =>
				a instanceof HTMLElement ? `[${a.tagName}]` : typeof a === 'object' ? JSON.stringify(a, null, 2) : a
			)
			.join(', ')
		console.log(`%c${caller}%c(${content})`, `${styleObj.style}font-weight: bold;`, styleObj.style)
	},
	// Log default message
	default(...args) {
		if (!this.active) return
		console.log(...args)
	},
	// Initialize logger shortcuts
	init() {
		Object.keys(this.styles).forEach((mode) => {
			this[mode] = (...args) => this.styled(mode, ...args)
		})
	},
}

const Tools = {
	// @b Add wheel listener
	//------------------------
	addWheelListener: (selectElement, callback) => {
		if (!selectElement) return
		selectElement.addEventListener('wheel', (event) => {
			event.preventDefault()
			let currentIndex = selectElement.selectedIndex
			let newIndex = currentIndex
			const maxIndex = selectElement.options.length - 1
			if (event.deltaY > 0) newIndex = Math.min(currentIndex + 1, maxIndex)
			else newIndex = Math.max(currentIndex - 1, 0)
			if (newIndex !== currentIndex) {
				selectElement.selectedIndex = newIndex
				callback()
			}
		})
	},

	// @b Clear element content
	//------------------------
	clearContent: (element) => {
		if (element) element.innerHTML = ''
	},

	// @b Debounce
	// ------------------------
	debounce: (func, delay) => {
		let timeoutId
		return function (...args) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => {
				func.apply(this, args)
			}, delay)
		}
	},

	// @b Lighten HEX color
	//------------------------
	lightenColor: (hex, percent) => {
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
	},

	// @b Set Favicon
	//------------------------
	setFavicon: (canvas) => {
		const existingLink = document.querySelector("link[rel='icon']")
		if (existingLink) existingLink.remove()
		const link = document.createElement('link')
		link.rel = 'icon'
		link.href = canvas.toDataURL('image/png')
		document.head.appendChild(link)
	},

	// @b Set page title
	//------------------------
	setTitle: (title) => (document.title = title),
}
// #endregion
//========================
//#region @r HELPERS
//========================
const Helpers = {
	// / @b Apply highlight to squares on the chessboard
	// ------------------------
	applyHighlight: (fromSquare, toSquare, highlightColor) => {
		const fromIsLight = fromSquare.classList.contains('white-1e1d7')
		fromSquare.style.backgroundColor = fromIsLight ? Tools.lightenColor(highlightColor, 0.5) : highlightColor
		const toIsLight = toSquare.classList.contains('white-1e1d7')
		toSquare.style.backgroundColor = toIsLight ? Tools.lightenColor(highlightColor, 0.5) : highlightColor
	},

	// / @b Calculate single board size in grid
	// ------------------------
	calculateBoardSize: () => {
		if (!$.selects.columns) return 400
		const columns = parseInt($.selects.columns.value, 10)
		const containerWidth = $.divs.boards.clientWidth - 20
		const minBoardSize = 150
		const maxBoardSize = 750
		const gap = 10
		let boardSize = (containerWidth - (columns - 1) * gap) / columns
		boardSize = Math.max(minBoardSize, Math.min(boardSize, maxBoardSize))
		return Math.floor(boardSize)
	},

	// / @b Draw mini chessboard (for logo/favicon)
	// ------------------------
	drawMiniBoard: (canvas) => {
		const { darkColor, lightColor } = Helpers.getBoardColors()
		const ctx = canvas.getContext('2d')
		const size = canvas.width / 2
		ctx.fillStyle = lightColor
		ctx.fillRect(0, 0, size, size)
		ctx.fillRect(size, size, size, size)
		ctx.fillStyle = darkColor
		ctx.fillRect(size, 0, size, size)
		ctx.fillRect(0, size, size, size)
	},

	// / @b Get board colors from inputs
	// ------------------------
	getBoardColors: () => {
		const darkColor = $.inputs.boardColorPicker.value
		const lightColor = Tools.lightenColor(darkColor, 0.5)
		return { darkColor, lightColor }
	},

	// / @b Get highlight color from input
	// ------------------------
	getHighlightColor: () => $.inputs.highlightColorPicker.value,

	// / @b Scroll to active move in the move list
	// ------------------------
	scrollToActiveMove: () => {
		const activeMoveElement = document.querySelector('.modal__move-list .active-move')
		if (activeMoveElement) {
			const listContainer = activeMoveElement.parentElement
			const containerWidth = listContainer.clientWidth
			const scrollPosition = activeMoveElement.offsetLeft - containerWidth / 2 + activeMoveElement.offsetWidth / 2
			listContainer.scrollTo({
				left: scrollPosition,
				behavior: 'smooth',
			})
		}
	},
	// / @b Update board grid layout based on columns setting
	// ------------------------
	updateBoardLayout: () => {
		if ($.selects.columns) {
			const columns = $.selects.columns.value
			$.divs.boards.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
		}
	},

	// / @b Update logo and favicon
	// ------------------------
	updateLogo: () => {
		const canvas = document.createElement('canvas')
		canvas.width = 16
		canvas.height = 16
		Helpers.drawMiniBoard($.logo)
		Helpers.drawMiniBoard(canvas)
		Tools.setFavicon(canvas)
	},

	// / @b Update page title
	// ------------------------
	updateTitle: (title) => {
		Tools.setTitle('PGNgrid - ' + title)
	},
}
// #endregion
//========================
//#region @r SETTINGS
//========================
const Settings = {
	// / @b Apply saved settings to the UI elements
	// ------------------------
	applySettingsToUI: () => {
		$.selects.columns.value = STATE.settings.columns
		$.inputs.boardColorPicker.value = STATE.settings.darkColor
		$.inputs.highlightColorPicker.value = STATE.settings.highlightColor
		Settings.changeBoardColors()
		Settings.changeHighlightColor()
		Settings.updateColumnsSelect()
		Helpers.updateBoardLayout()
	},
	// / @b Update CSS variables for board colors
	// ------------------------
	changeBoardColors: () => {
		Log.white()
		const { darkColor, lightColor } = Helpers.getBoardColors()
		$.root.style.setProperty('--board-dark-color', darkColor)
		$.root.style.setProperty('--board-light-color', lightColor)
		Helpers.updateLogo()
	},
	// / @b Update CSS variable for highlight color
	// ------------------------
	changeHighlightColor: () => {
		Log.white()
		const highlightColor = Helpers.getHighlightColor()
		$.root.style.setProperty('--highlight-color', highlightColor)
	},
	// / @b Load settings from local storage
	// ------------------------
	loadSettings: () => {
		const saved = localStorage.getItem('settings')
		if (saved) {
			try {
				const parsed = JSON.parse(saved)
				STATE.settings = { ...STATE.settings, ...(parsed || {}) }
			} catch (e) {
				console.error('Error parsing settings:', e)
			}
		}
		Log.orange(STATE.settings)
	},
	// / @b Save current settings to local storage
	// ------------------------
	saveSettings: () => {
		const settings = {
			columns: $.selects.columns.value,
			darkColor: $.inputs.boardColorPicker.value,
			highlightColor: $.inputs.highlightColorPicker.value,
			orientation: STATE.settings.orientation,
		}
		localStorage.setItem('settings', JSON.stringify(settings))
		Log.orange(settings)
	},
	// / @b Dynamically update columns select options based on screen size
	// ------------------------
	updateColumnsSelect: () => {
		Log.white()
		if (!$.selects.columns) return
		const containerWidth = $.divs.boards.clientWidth - 20
		const minBoardSize = 150
		const gap = 10
		let maxColumns = Math.floor((containerWidth + gap) / (minBoardSize + gap))
		maxColumns = Math.max(1, maxColumns)
		Tools.clearContent($.selects.columns)
		for (let i = 1; i <= maxColumns; i++) {
			const option = document.createElement('option')
			option.value = i
			option.textContent = i
			$.selects.columns.appendChild(option)
		}
		let current = parseInt(STATE.settings.columns, 10)
		if (isNaN(current) || current > maxColumns || current < 1) current = maxColumns
		$.selects.columns.value = current
		STATE.settings.columns = current
	},
	// / @b Populate game select options
	// ------------------------
	updateGameSelect: () => {
		Log.white()
		Tools.clearContent($.selects.game)
		$.selects.game.style.display = 'block'
		STATE.allGames.forEach((game, index) => {
			const event = game.header.Event || `Partia ${index + 1}`
			const optionText = event
			const option = document.createElement('option')
			option.value = index
			option.textContent = optionText
			$.selects.game.appendChild(option)
		})
	},
}
// #endregion
//========================
//#region @r RENDERERS
//========================
const Renderers = {
	// / @b Apply highlight to the last move on all boards
	// ------------------------
	highlightMoves: () => {
		Log.gray()
		if (!STATE.positions.length) return
		const currentPosition = STATE.positions[STATE.currentBoardIndex]
		const highlightColor = Helpers.getHighlightColor()
		STATE.chessboards.forEach(({ boardId }, index) => {
			const pos = STATE.positions[index]
			const fromSquare = document.querySelector(`#${boardId} .square-${pos.from}`)
			const toSquare = document.querySelector(`#${boardId} .square-${pos.to}`)
			if (fromSquare && toSquare) Helpers.applyHighlight(fromSquare, toSquare, highlightColor)
		})
		if (!STATE.bigBoard || !currentPosition) return
		const fromBig = document.querySelector(`#big-board .square-${currentPosition.from}`)
		const toBig = document.querySelector(`#big-board .square-${currentPosition.to}`)
		if (fromBig && toBig) Helpers.applyHighlight(fromBig, toBig, highlightColor)
	},

	// / @b Generate all small boards for the current game
	// ------------------------
	renderBoards: () => {
		Log.orange()
		Tools.clearContent($.divs.boards)
		STATE.chessboards.length = 0
		const currentSize = Helpers.calculateBoardSize()
		STATE.positions.forEach((pos, index) => {
			const boardWrapper = document.createElement('div')
			boardWrapper.className = 'board-wrapper'
			boardWrapper.style.width = `${currentSize}px`
			const boardDiv = document.createElement('div')
			const boardId = 'board-' + Date.now() + Math.random().toString(36).substr(2, 9)
			boardDiv.id = boardId
			if (pos.moveText) {
				const moveInfo = document.createElement('div')
				moveInfo.className = 'move-info'
				if (
					(STATE.settings.orientation === 'white' && pos.color === 'w') ||
					(STATE.settings.orientation === 'black' && pos.color === 'b')
				) {
					moveInfo.classList.add('bold-move')
				}
				moveInfo.innerText = pos.moveText
				boardWrapper.appendChild(moveInfo)
			}
			boardWrapper.appendChild(boardDiv)
			$.divs.boards.appendChild(boardWrapper)
			const config = {
				position: pos.fen,
				draggable: false,
				pieceTheme: 'src/img/{piece}.png',
				orientation: STATE.settings.orientation,
				showNotation: false,
			}
			const board = new Chessboard(boardId, config)
			STATE.chessboards.push({ board, boardId })
			boardWrapper.addEventListener('click', () => Handlers.modals.boardClick(index))
		})
		Helpers.updateBoardLayout()
		Renderers.highlightMoves()
	},

	// / @b Render the big board modal
	// ------------------------
	renderBigBoard: () => {
		Log.orange()
		const position = STATE.positions[STATE.currentBoardIndex]
		if (!position) return
		if (STATE.bigBoard) STATE.bigBoard.destroy()
		if ($.divs.bigBoard) {
			const config = {
				position: position.fen,
				draggable: false,
				pieceTheme: 'src/img/{piece}.png',
				showNotation: true,
				orientation: STATE.settings.orientation,
			}
			STATE.bigBoard = new Chessboard('big-board', config)
			const squares = document.querySelectorAll('#big-board .square-55d63')
			squares.forEach((square) => {
				square.classList.remove('highlight-3c678')
				square.style.boxShadow = 'none'
			})
			Renderers.highlightMoves()
		} else {
			console.error('Element #big-board not found!')
		}
		if ($.buttons.prevMove) $.buttons.prevMove.disabled = STATE.currentBoardIndex === 0
		if ($.buttons.nextMove) $.buttons.nextMove.disabled = STATE.currentBoardIndex >= STATE.positions.length - 1
		Renderers.renderMoveList()
	},

	// / @b Render move list below the big board
	// ------------------------
	renderMoveList: () => {
		Log.gray()
		Tools.clearContent($.moveListDisplay)
		STATE.positions.forEach((pos, index) => {
			const moveSpan = document.createElement('span')
			moveSpan.innerText = pos.moveText
			if (index === STATE.currentBoardIndex) {
				moveSpan.classList.add('active-move')
			}
			moveSpan.addEventListener('click', () => {
				STATE.currentBoardIndex = index
				Renderers.renderBigBoard()
			})
			$.moveListDisplay.appendChild(moveSpan)
		})
		Helpers.scrollToActiveMove()
	},
}
// #endregion
//========================
//#region @r MAIN LOGIC
//========================
const Logic = {
	// / @b Handle file
	// ------------------------
	handleFile: (file) => {
		if (!file) return
		const reader = new FileReader()
		reader.onload = (e) => {
			STATE.pgnString = e.target.result
			Logic.processPgn()
		}
		reader.readAsText(file)
	},

	// / @b Process PGN
	// ------------------------
	processPgn: () => {
		Log.yellow()
		Tools.clearContent($.divs.boards)
		STATE.chessboards.length = 0
		STATE.positions.length = 0
		STATE.allGames.length = 0
		if (STATE.pgnString.length === 0) return
		$.inputs.dropArea.style.display = 'none'
		if ($.headers.right) $.headers.right.style.display = 'flex'
		if ($.headers.center) $.headers.center.style.display = 'flex'
		try {
			let gamesArray = []
			if (STATE.pgnString.includes('[Event')) {
				gamesArray = STATE.pgnString
					.split('[Event ')
					.filter(Boolean)
					.map((gamePgn) => `[Event ${gamePgn}`)
			} else {
				gamesArray = STATE.pgnString.split(/\n\s*\n/).filter((line) => line.trim().length > 0)
			}
			if (gamesArray.length === 0) throw new Error('No games found in the provided PGN.')
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
					STATE.allGames.push({ pgn: finalPgn, header: headers })
				} else {
					console.warn(`Could not load PGN for game: ${index + 1}`)
				}
			})
			if (STATE.allGames.length === 0) {
				alert('Nie znaleziono żadnej partii w podanym tekście.')
				$.selects.game.style.display = 'none'
				return
			}
			if ($.selects.columns) $.selects.columns.style.display = 'inline-block'
			Settings.updateGameSelect()
			const firstGame = STATE.allGames[0]
			const firstGameTitle = firstGame.header.Event
			Logic.processBoards(STATE.allGames[0].pgn)
			Helpers.updateTitle(firstGameTitle)
		} catch (error) {
			console.error('Błąd podczas przetwarzania PGN:', error)
			alert('Wystąpił błąd podczas przetwarzania PGN. Upewnij się, że format jest poprawny.')
		}
	},

	// @b Process boards
	//------------------------
	processBoards: (pgnToRender) => {
		Log.yellow()
		Tools.clearContent($.divs.boards)
		STATE.chessboards.length = 0
		STATE.positions = []
		try {
			const game = new Chess()
			game.load_pgn(pgnToRender)
			const header = game.header()
			const startFen = header.FEN || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
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
				STATE.positions.push({
					fen: tempGame.fen(),
					moveText: moveText,
					color: moveColor,
					from: move.from,
					to: move.to,
				})
			})
			Renderers.renderBoards()
		} catch (error) {
			console.error('Błąd podczas renderowania partii:', error)
		}
	},
}
// #endregion
//========================
//#region @r APP INIT
//========================
const App = {
	init: () => {
		Log.init()
		Log.yellow()
		Settings.loadSettings()
		Settings.applySettingsToUI()
		Listeners.setup()
	},
}

document.addEventListener('DOMContentLoaded', () => {
	App.init()
})
// #endregion
