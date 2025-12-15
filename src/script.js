// @p PGNgrid
//========================
//#region @r UTILS
//========================
// @g Logger
//------------------------
const Log = {
	// @b Config
	//------------------------
	config: {
		active: true,
		maxDepth: Infinity,
		location: { active: true, style: 'font-size: 0.9em; font-style: italic; color: dimgray;' },
		divider: { active: false, style: 'font-size: 1.1em; font-weight: bold;', char: '-', length: 12 },
		group: { active: true, style: 'font-size: 1.2em; font-weight: bold;', collapsed: false },
		depth: { active: true, char: ' ' },
	},
	styles: {
		blue: { active: true, style: 'color: steelblue;' },
		gray: { active: true, style: 'color: gray;' },
		orange: { active: true, style: 'color: orange;' },
		red: { active: true, style: 'color: red;' },
		white: { active: true, style: 'color: white;' },
		yellow: { active: true, style: 'color: yellow;' },
	},

	// @b Private
	//------------------------

	// Depth
	_depth: 0,

	// Should log
	_shouldLog() {
		return this.config.active && this._depth <= this.config.maxDepth
	},

	// Get indent
	_getIndent() {
		return this.config.depth.active ? this.config.depth.char.repeat(this._depth) : ''
	},

	// Get caller info
	_getCallerInfo: (idx) => {
		const line = new Error().stack?.split('\n')[idx]?.trim() || ''
		const match = line.match(/at\s+(.+?)\s+\((.+)\)/) || line.match(/^(.+?)@(.+)/)
		if (!match) return { caller: '', location: '' }

		const fullName = match[1]
		const parts = fullName.split('.')
		const caller = parts.pop()
		const fullPath = match[2] || match[1]
		const loc = fullPath.match(/([^\/\\]+):(\d+):\d+/)
		const location = loc ? `${loc[1]}:${loc[2]}` : ''
		return { caller, location }
	},

	// Format args
	_formatArgs: (args) =>
		args
			.map((a) =>
				a instanceof HTMLElement ? `[${a.tagName}]` : typeof a === 'object' ? JSON.stringify(a, null, 2) : a
			)
			.join(', '),

	// Enter with style
	_enterWithStyle(color, ...data) {
		if (!this.config.active || !this.styles[color]?.active) return

		const indent = this._getIndent()
		const { caller, location } = this._getCallerInfo(4)

		if (this._depth <= this.config.maxDepth) {
			const formatted = data.length > 0 ? this._formatArgs(data) : ''
			const message = `${indent}→ ${caller}(${formatted})`
			console.log(`%c${message}`, this.styles[color].style)

			if (this.config.location.active) {
				console.log(`${indent}%c→ ${location}`, this.config.location.style)
			}
		}
		this._depth++
	},

	// Start with style
	_startWithStyle(color, text = null) {
		if (!this._shouldLog() || !this.config.group.active || !this.styles[color]?.active) return

		const indent = this._getIndent()
		const displayText = text !== null ? text : this._getCallerInfo(5).caller
		const method = this.config.group.collapsed ? console.groupCollapsed : console.group

		const combinedStyle = `${this.config.group.style} ${this.styles[color].style}`
		method(`${indent}%c${displayText}`, combinedStyle)
	},

	// Styled
	_styled(mode, ...args) {
		if (!this._shouldLog() || !this.styles[mode]?.active) return
		const { location } = this._getCallerInfo(4)
		const content = this._formatArgs(args)
		const style = this.styles[mode].style
		const indent = this._getIndent()

		let message = `${indent}%c${content}`
		let styles = [style]

		if (this.config.location.active) {
			message += `\n${indent}%c→ ${location}`
			styles.push(this.config.location.style)
		}
		console.log(message, ...styles)
	},

	// @b Public
	//------------------------

	// Enter
	enter(...data) {
		if (!this.config.active) return

		const indent = this._getIndent()
		const { caller, location } = this._getCallerInfo(3)

		if (this._depth <= this.config.maxDepth) {
			const formatted = data.length > 0 ? this._formatArgs(data) : ''
			console.log(`${indent}→ ${caller}(${formatted})`)

			if (this.config.location.active) {
				console.log(`${indent}%c→ ${location}`, this.config.location.style)
			}
		}
		this._depth++
	},

	// Exit
	exit() {
		if (!this.config.active) return
		this._depth = Math.max(0, this._depth - 1)
	},

	// Start
	start(text = null) {
		if (!this._shouldLog() || !this.config.group.active) return

		const indent = this._getIndent()
		const displayText = text !== null ? text : this._getCallerInfo(3).caller
		const method = this.config.group.collapsed ? console.groupCollapsed : console.group

		method(`${indent}%c${displayText}`, `${this.config.group.style} color: yellow;`)
	},

	// End
	end() {
		if (!this.config.active || !this.config.group.active) return
		console.groupEnd()
	},

	// Default
	default(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.log(indent, ...args)
		if (this.config.location.active) {
			const { location } = this._getCallerInfo(3)
			console.log(`${indent}%c↑ ${location}`, this.config.location.style)
		}
	},

	// Error
	error(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.error(indent, ...args)
	},

	// Warn
	warn(...args) {
		if (!this._shouldLog()) return
		const indent = this._getIndent()
		console.warn(indent, ...args)
	},

	// Divider
	divider(text = '') {
		if (!this._shouldLog() || !this.config.divider.active) return

		const char = this.config.divider.char
		const style = this.config.divider.style
		const indent = this._getIndent()

		if (text) {
			console.log(`${indent}%c${text}\n${indent}${char.repeat(text.length)}`, style)
		} else {
			console.log(`${indent}%c${char.repeat(this.config.divider.length)}`, style)
		}
	},

	// Init
	init() {
		Object.keys(this.styles).forEach((color) => {
			this[color] = (...args) => this._styled(color, ...args)
			this.start[color] = (text = null) => this._startWithStyle(color, text)
			this.enter[color] = (...data) => this._enterWithStyle(color, ...data)
		})
	},
}

// @g Storage
//------------------------
const Storage = {
	// Get
	get: (key, defaultValue = null) => {
		try {
			const item = localStorage.getItem(key)
			return item ? JSON.parse(item) : defaultValue
		} catch (e) {
			Log.red('Storage read error:', e)
			return defaultValue
		}
	},
	// Set
	set: (key, value) => {
		try {
			localStorage.setItem(key, JSON.stringify(value))
			return true
		} catch (e) {
			Log.red('Storage write error:', e)
			return false
		}
	},
}

// @g DOM API
//------------------------
const DOM = {
	// @b Selectors
	//------------------------
	get: (selector) => document.querySelector(selector),
	getAll: (selector) => document.querySelectorAll(selector),
	getById: (id) => document.getElementById(id),

	// @b Properties
	//------------------------
	getValue: (element) => element?.value || '',
	setValue: (element, value) => element && (element.value = value),
	setDisabled: (element, disabled) => element && (element.disabled = disabled),
	isDisabled: (element) => element?.disabled || false,

	// @b Content
	//------------------------
	clear: (element) => element && (element.innerHTML = ''),
	setHTML: (element, html) => element && (element.innerHTML = html),
	setText: (element, text) => element && (element.innerText = text),
	getText: (element) => element?.innerText || '',
	getHTML: (element) => element?.innerHTML || '',

	// @b Classes
	//------------------------
	addClass: (element, className) => element?.classList.add(className),
	removeClass: (element, className) => element?.classList.remove(className),
	toggleClass: (element, className) => element?.classList.toggle(className),
	hasClass: (element, className) => element?.classList.contains(className) || false,

	// @b Styles
	//------------------------
	setStyle: (element, property, value) => {
		if (!element) return
		if (typeof property === 'object') {
			Object.entries(property).forEach(([key, val]) => (element.style[key] = val))
		} else {
			element.style[property] = value
		}
	},
	getStyle: (element, property) => (element ? getComputedStyle(element)[property] : null),
	setCSS: (property, value) => document.documentElement.style.setProperty(property, value),

	// @b Attributes
	//------------------------
	getAttr: (element, name) => element?.getAttribute(name),
	setAttr: (element, name, value) => element?.setAttribute(name, value),
	removeAttr: (element, name) => element?.removeAttribute(name),
	hasAttr: (element, name) => element?.hasAttribute(name) || false,

	// @b Visibility
	//------------------------
	hide: (element) => element && (element.style.display = 'none'),
	show: (element, display = 'block') => element && (element.style.display = display),
	isVisible: (element) => (element ? element.style.display !== 'none' : false),

	// @b Events
	//------------------------
	on: (element, event, handler, options) => element?.addEventListener(event, handler, options),
	off: (element, event, handler, options) => element?.removeEventListener(event, handler, options),
	trigger: (element, eventName) => {
		if (element) {
			const event = new Event(eventName, { bubbles: true })
			element.dispatchEvent(event)
		}
	},
	onSelectWheel: (selectElement, callback) => {
		if (!selectElement) return
		DOM.on(selectElement, 'wheel', (event) => {
			event.preventDefault()
			const currentIndex = selectElement.selectedIndex
			const maxIndex = selectElement.options.length - 1
			const newIndex = event.deltaY > 0 ? Math.min(currentIndex + 1, maxIndex) : Math.max(currentIndex - 1, 0)
			if (newIndex !== currentIndex) {
				selectElement.selectedIndex = newIndex
				callback()
			}
		})
	},

	// @b Manipulation
	//------------------------
	remove: (element) => element?.remove(),
	append: (parent, child) => parent?.appendChild(child),
	create: ({ type = 'div', parent, children, listeners, dataset, ...attributes }) => {
		const element = document.createElement(type)
		if (parent) parent.appendChild(element)
		if (dataset) {
			Object.entries(dataset).forEach(([key, value]) => {
				element.dataset[key] = value
			})
		}
		if (attributes) {
			Object.entries(attributes).forEach(([key, value]) => {
				element.setAttribute(key, value)
			})
		}
		if (listeners) {
			Object.entries(listeners).forEach(([key, value]) => {
				element.addEventListener(key, value)
			})
		}
		if (children) {
			if (!Array.isArray(children)) children = [children]
			children.forEach((child) => {
				if (typeof child === 'string' || typeof child === 'number') {
					element.appendChild(document.createTextNode(child))
				} else if (child instanceof HTMLElement) {
					element.appendChild(child)
				}
			})
		}
		return element
	},

	// @b Document
	//------------------------
	setFavicon: (canvas) => {
		const existingLink = DOM.get("link[rel='icon']")
		if (existingLink) DOM.remove(existingLink)
		DOM.create({
			type: 'link',
			rel: 'icon',
			href: canvas.toDataURL('image/png'),
			parent: document.head,
		})
	},
	setTitle: (title) => (document.title = title),
	scrollTo: (element, options) => element?.scrollTo(options),
}

// @g Tools
//------------------------
const Tools = {
	// @b Debounce
	//------------------------
	debounce: (func, delay) => {
		let timeoutId
		return function (...args) {
			clearTimeout(timeoutId)
			timeoutId = setTimeout(() => func.apply(this, args), delay)
		}
	},

	// @b Lighten color
	//------------------------
	lightenColor: (hex, percent) =>
		'#' +
		hex.slice(1).replace(/../g, (c) =>
			Math.round(parseInt(c, 16) + (255 - parseInt(c, 16)) * percent)
				.toString(16)
				.padStart(2, '0')
		),
}

// #endregion
//========================
//#region @r STATE
//========================

const STATE = {
	allGames: [],
	bigBoard: null,
	chessboards: [],
	currentBoardIndex: 0,
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
	// Document
	body: document.body,
	root: document.documentElement,
	logo: DOM.getById('logo'),

	// Main areas
	boards: DOM.getById('boards'),
	dropArea: DOM.getById('file-drop-area'),

	// Header
	header: {
		center: DOM.get('.header__center'),
		right: DOM.get('.header__right'),
	},

	// Big Board Modal (wszystko w jednym miejscu)
	bigBoard: {
		modal: DOM.getById('big-board-modal'),
		board: DOM.getById('big-board'),
		moveList: DOM.getById('move-list-display'),
		close: DOM.getById('btn-close-board'),
		prev: DOM.getById('btn-prev-move'),
		next: DOM.getById('btn-next-move'),
	},

	// Settings Modal
	settings: {
		modal: DOM.getById('settings-modal'),
		close: DOM.getById('btn-close-settings'),
		columns: DOM.getById('board-columns'),
		game: DOM.getById('game-select'),
		darkColor: DOM.getById('dark-color-picker'),
		highlightColor: DOM.getById('highlight-color-picker'),
	},

	// Error Modal
	error: {
		modal: DOM.getById('error-modal'),
		close: DOM.getById('btn-close-error'),
		ok: DOM.getById('btn-error-ok'),
	},

	// Toolbar buttons
	toolbar: {
		orientation: DOM.getById('btn-orientation'),
		settings: DOM.getById('btn-settings'),
		print: DOM.getById('btn-print'),
		file: DOM.getById('btn-file'),
	},

	// File inputs
	file: {
		input: DOM.getById('pgn-file'),
		pasteArea: DOM.getById('pgn-paste-area'),
	},
}

// #endregion
//========================
//#region @r PURE FUNCTIONS
//========================

const Pure = {
	// @b PGN Processing
	//------------------------
	// Parse PGN headers into object
	parsePGNHeaders: (pgnString) => {
		const headers = {}
		const headerRegex = /\[(\w+)\s+"(.*?)"\]/g
		let match
		while ((match = headerRegex.exec(pgnString)) !== null) {
			headers[match[1]] = match[2]
		}
		return headers
	},

	// Remove comments and annotations from PGN
	cleanPGN: (pgn) => pgn.replace(/{[^}]*}/g, '').replace(/\[%[^\]]*]/g, ''),

	// Split multi-game PGN string into array
	splitGames: (pgnString) =>
		pgnString.includes('[Event')
			? pgnString
					.split('[Event ')
					.filter(Boolean)
					.map((g) => `[Event ${g}`)
			: pgnString.split(/\n\s*\n/).filter((line) => line.trim().length > 0),

	// Add default headers if missing
	addDefaultHeaders: (pgn, index) => {
		if (pgn.startsWith('[Event')) return pgn
		return `[Event "Partia ${index + 1}"]
[Site "Online"]
[Date "????.??.??"]
[Round "?"]
[White "?"]
[Black "?"]
[Result "*"]

${pgn}`
	},

	// @b Board calculations
	//------------------------
	// Calculate optimal board size based on container width
	calculateBoardSize: (containerWidth, columns) => {
		Log.enter()
		const minBoardSize = 150
		const maxBoardSize = 750
		const gap = 10
		let boardSize = (containerWidth - (columns - 1) * gap) / columns
		boardSize = Math.max(minBoardSize, Math.min(boardSize, maxBoardSize))
		Log.exit()
		return Math.floor(boardSize)
	},

	// Calculate maximum number of columns that fit
	calculateMaxColumns: (containerWidth) => {
		const minBoardSize = 150
		const gap = 10
		return Math.max(1, Math.floor((containerWidth + gap) / (minBoardSize + gap)))
	},

	// @b Color helpers
	//------------------------
	// Get current board colors from UI
	getBoardColors: () => {
		const darkColor = DOM.getValue($.settings.darkColor)
		const lightColor = Tools.lightenColor(darkColor, 0.5)
		return { darkColor, lightColor }
	},

	// Get current highlight color from UI
	getHighlightColor: () => DOM.getValue($.settings.highlightColor),
}

// #endregion
//========================
//#region @r SIDE EFFECTS
//========================

const Effects = {
	// @b Apply highlight to squares
	//------------------------
	applyHighlight: (fromSquare, toSquare, highlightColor) => {
		if (!fromSquare || !toSquare) return
		const fromIsLight = DOM.hasClass(fromSquare, 'white-1e1d7')
		DOM.setStyle(fromSquare, 'backgroundColor', fromIsLight ? Tools.lightenColor(highlightColor, 0.5) : highlightColor)
		const toIsLight = DOM.hasClass(toSquare, 'white-1e1d7')
		DOM.setStyle(toSquare, 'backgroundColor', toIsLight ? Tools.lightenColor(highlightColor, 0.5) : highlightColor)
	},

	// @b Scroll to active move in list
	//------------------------
	scrollToActiveMove: () => {
		Log.enter()
		const activeMoveElement = DOM.get('.modal__move-list .active-move')
		if (!activeMoveElement) return
		const listContainer = activeMoveElement.parentElement
		const containerWidth = listContainer.clientWidth
		const scrollPosition = activeMoveElement.offsetLeft - containerWidth / 2 + activeMoveElement.offsetWidth / 2
		DOM.scrollTo(listContainer, { left: scrollPosition, behavior: 'smooth' })
		Log.exit()
	},

	// @b Draw mini chessboard on canvas
	//------------------------
	drawMiniBoard: (canvas) => {
		const { darkColor, lightColor } = Pure.getBoardColors()
		const ctx = canvas.getContext('2d')
		const size = canvas.width / 2
		ctx.fillStyle = lightColor
		ctx.fillRect(0, 0, size, size)
		ctx.fillRect(size, size, size, size)
		ctx.fillStyle = darkColor
		ctx.fillRect(size, 0, size, size)
		ctx.fillRect(0, size, size, size)
	},

	// @b Update logo and favicon
	//------------------------
	updateLogo: () => {
		Log.enter()
		const canvas = DOM.create({ type: 'canvas', width: 16, height: 16 })
		Effects.drawMiniBoard(canvas)
		Effects.drawMiniBoard($.logo)
		DOM.setFavicon(canvas)
		Log.exit()
	},

	// @b Show error modal with message
	//------------------------
	showError: (message) => {
		Log.red(message)
		const errorMessage = DOM.getById('error-message')
		DOM.setText(errorMessage, message)
		DOM.addClass($.error.modal, 'show-modal')
	},

	// @b Hide error modal
	//------------------------
	hideError: () => {
		Log.enter()
		DOM.removeClass($.error.modal, 'show-modal')
		Log.exit()
	},
}

// #endregion
//========================
//#region @r SETTINGS
//========================

const Settings = {
	// @b Load settings from storage
	//------------------------
	load: () => {
		Log.enter.blue(STATE.settings)
		const saved = Storage.get('settings', {})
		STATE.settings = { ...STATE.settings, ...saved }
		Log.exit()
	},

	// @b Save settings to storage
	//------------------------
	save: () => {
		const settings = {
			columns: DOM.getValue($.settings.columns),
			darkColor: DOM.getValue($.settings.darkColor),
			highlightColor: DOM.getValue($.settings.highlightColor),
			orientation: STATE.settings.orientation,
		}
		Log.enter.blue(settings)
		Storage.set('settings', settings)
		Log.exit()
	},

	// @b Apply settings to UI
	//------------------------
	applyToUI: () => {
		Log.enter()
		DOM.setValue($.settings.columns, STATE.settings.columns)
		DOM.setValue($.settings.darkColor, STATE.settings.darkColor)
		DOM.setValue($.settings.highlightColor, STATE.settings.highlightColor)
		Settings.updateBoardColors()
		Settings.updateHighlightColor()
		Settings.updateColumnsSelect()
		Settings.updateBoardLayout()
		Log.exit()
	},

	// @b Update board colors in CSS
	//------------------------
	updateBoardColors: () => {
		Log.enter()
		const { darkColor, lightColor } = Pure.getBoardColors()
		DOM.setCSS('--board-dark-color', darkColor)
		DOM.setCSS('--board-light-color', lightColor)
		Effects.updateLogo()
		Log.exit()
	},

	// @b Update highlight color in CSS
	//------------------------
	updateHighlightColor: () => {
		Log.enter()
		const highlightColor = Pure.getHighlightColor()
		DOM.setCSS('--highlight-color', highlightColor)
		Log.exit()
	},

	// @b Update columns select options
	//------------------------
	updateColumnsSelect: () => {
		Log.enter()
		if (!$.settings.columns) return
		const containerWidth = $.boards.clientWidth - 20
		const maxColumns = Pure.calculateMaxColumns(containerWidth)
		DOM.clear($.settings.columns)
		for (let i = 1; i <= maxColumns; i++) {
			DOM.create({
				type: 'option',
				parent: $.settings.columns,
				children: i.toString(),
				value: i.toString(),
			})
		}
		let current = parseInt(STATE.settings.columns, 10)
		if (isNaN(current) || current > maxColumns || current < 1) current = maxColumns
		DOM.setValue($.settings.columns, current)
		STATE.settings.columns = current
		Log.exit()
	},

	// @b Update game select dropdown
	//------------------------
	updateGameSelect: () => {
		Log.enter()
		DOM.clear($.settings.game)
		DOM.show($.settings.game, 'block')
		STATE.allGames.forEach((game, index) => {
			const event = game.header.Event || `Partia ${index + 1}`
			DOM.create({
				type: 'option',
				parent: $.settings.game,
				children: event,
				value: index.toString(),
			})
		})
		Log.exit()
	},

	// @b Update board grid layout
	//------------------------
	updateBoardLayout: () => {
		Log.enter()
		if ($.settings.columns) {
			const columns = DOM.getValue($.settings.columns)
			DOM.setStyle($.boards, 'gridTemplateColumns', `repeat(${columns}, 1fr)`)
		}
		Log.exit()
	},
}

// #endregion
//========================
//#region @r RENDERERS
//========================

const Renderers = {
	// @b Highlight last moves on all boards
	//------------------------
	highlightMoves: () => {
		Log.enter()
		if (!STATE.positions.length) {
			Log.exit()
			return
		}
		const currentPosition = STATE.positions[STATE.currentBoardIndex]
		const highlightColor = Pure.getHighlightColor()

		STATE.chessboards.forEach(({ boardId }, index) => {
			const pos = STATE.positions[index]
			const fromSquare = DOM.get(`#${boardId} .square-${pos.from}`)
			const toSquare = DOM.get(`#${boardId} .square-${pos.to}`)
			Effects.applyHighlight(fromSquare, toSquare, highlightColor)
		})

		if (STATE.bigBoard && currentPosition) {
			const fromBig = DOM.get(`#big-board .square-${currentPosition.from}`)
			const toBig = DOM.get(`#big-board .square-${currentPosition.to}`)
			Effects.applyHighlight(fromBig, toBig, highlightColor)
		}

		Log.exit()
	},

	// @b Render all small boards in grid
	//------------------------
	renderBoards: () => {
		Log.enter()
		DOM.clear($.boards)
		STATE.chessboards.length = 0
		const currentSize = Pure.calculateBoardSize(
			$.boards.clientWidth - 20,
			parseInt(DOM.getValue($.settings.columns), 10)
		)

		STATE.positions.forEach((pos, index) => {
			const boardWrapper = DOM.create({
				type: 'div',
				class: 'board-wrapper',
				parent: $.boards,
			})
			DOM.setStyle(boardWrapper, 'width', `${currentSize}px`)

			const boardId = 'board-' + Date.now() + Math.random().toString(36).substr(2, 9)

			if (pos.moveText) {
				const moveInfo = DOM.create({
					type: 'div',
					class: 'move-info',
					parent: boardWrapper,
					children: pos.moveText,
				})
				if (
					(STATE.settings.orientation === 'white' && pos.color === 'w') ||
					(STATE.settings.orientation === 'black' && pos.color === 'b')
				) {
					DOM.addClass(moveInfo, 'bold-move')
				}
			}

			DOM.create({
				type: 'div',
				id: boardId,
				parent: boardWrapper,
			})

			const config = {
				position: pos.fen,
				draggable: false,
				pieceTheme: 'src/img/{piece}.png',
				orientation: STATE.settings.orientation,
				showNotation: false,
			}
			const board = new Chessboard(boardId, config)
			STATE.chessboards.push({ board, boardId })
			DOM.on(boardWrapper, 'click', () => Handlers.modals.boardClick(index))
		})

		Settings.updateBoardLayout()
		Renderers.highlightMoves()
		Log.exit()
	},

	// @b Render big board in modal
	//------------------------
	renderBigBoard: () => {
		Log.enter()
		const position = STATE.positions[STATE.currentBoardIndex]
		if (!position) return

		if (STATE.bigBoard) STATE.bigBoard.destroy()

		if ($.bigBoard.board) {
			const config = {
				position: position.fen,
				draggable: false,
				pieceTheme: 'img/{piece}.png',
				showNotation: true,
				orientation: STATE.settings.orientation,
			}
			STATE.bigBoard = new Chessboard('big-board', config)

			const squares = DOM.getAll('#big-board .square-55d63')
			squares.forEach((square) => {
				DOM.removeClass(square, 'highlight-3c678')
				DOM.setStyle(square, 'boxShadow', 'none')
			})
			Renderers.highlightMoves()
		}

		DOM.setDisabled($.bigBoard.prev, STATE.currentBoardIndex === 0)
		DOM.setDisabled($.bigBoard.next, STATE.currentBoardIndex >= STATE.positions.length - 1)
		Renderers.renderMoveList()
		Log.exit()
	},

	// @b Render move list above big board
	//------------------------
	renderMoveList: () => {
		Log.enter()
		DOM.clear($.bigBoard.moveList)
		STATE.positions.forEach((pos, index) => {
			const moveSpan = DOM.create({
				type: 'span',
				parent: $.bigBoard.moveList,
				children: pos.moveText,
			})
			if (index === STATE.currentBoardIndex) {
				DOM.addClass(moveSpan, 'active-move')
			}
			DOM.on(moveSpan, 'click', () => {
				Log.start("moveListClick")
				STATE.currentBoardIndex = index
				Renderers.renderBigBoard()
				Log.end()
			})
		})
		Effects.scrollToActiveMove()
		Log.exit()
	},
}

//#endregion
//========================
//#region @r LOGIC
//========================

const Logic = {
	// @b Handle file upload
	//------------------------
	handleFile: (file) => {
		if (!file) return
		try {
			const reader = new FileReader()
			reader.onload = (e) => {
				STATE.pgnString = e.target.result
				Logic.processPgn()
			}
			reader.readAsText(file)
		} catch (error) {
			Log.red('Błąd podczas wczytywania pliku:', error)
			Effects.showError('Błąd podczas wczytywania pliku')
		}
	},

	// @b Process PGN string
	//------------------------
	processPgn: () => {
		Log.start()
		Log.enter()
		try {
			DOM.clear($.boards)
			STATE.chessboards.length = 0
			STATE.positions.length = 0
			STATE.allGames.length = 0

			if (STATE.pgnString.length === 0) return

			DOM.hide($.dropArea)
			DOM.show($.header.right, 'flex')
			DOM.show($.header.center, 'flex')

			const gamesArray = Pure.splitGames(STATE.pgnString)
			if (gamesArray.length === 0) throw new Error('No games found in the provided PGN.')

			gamesArray.forEach((gamePgn, index) => {
				const game = new Chess()
				const cleanedPgn = Pure.cleanPGN(gamePgn)
				const finalPgn = Pure.addDefaultHeaders(cleanedPgn, index)

				if (game.load_pgn(finalPgn)) {
					const headers = Pure.parsePGNHeaders(finalPgn)
					STATE.allGames.push({ pgn: finalPgn, header: headers })
				} else {
					console.warn(`Could not load PGN for game: ${index + 1}`)
				}
			})

			if (STATE.allGames.length === 0) {
				Effects.showError('Nie znaleziono żadnej partii w podanym tekście.')
				DOM.hide($.settings.game)
				return
			}

			if ($.settings.columns) DOM.show($.settings.columns, 'inline-block')
			Settings.updateGameSelect()

			const firstGame = STATE.allGames[0]
			const firstGameTitle = firstGame.header.Event
			Logic.processBoards(STATE.allGames[0].pgn)
			DOM.setTitle('PGNgrid - ' + firstGameTitle)
		} catch (error) {
			Log.red('Błąd podczas przetwarzania PGN:', error)
			Effects.showError('Wystąpił błąd podczas przetwarzania PGN. Upewnij się, że format jest poprawny.')
		} finally {
			Log.exit()
			Log.end()
		}
	},

	// @b Process boards for single game
	//------------------------
	processBoards: (pgnToRender) => {
		Log.enter()
		try {
			DOM.clear($.boards)
			STATE.chessboards.length = 0
			STATE.positions = []

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
				tempGame.move(move)

				const moveText =
					moveColor === 'w'
						? `${startMoveNumber + Math.floor(index / 2)}. ${move.san}`
						: `${startMoveNumber + Math.floor(index / 2)}... ${move.san}`

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
			Log.red('Błąd podczas renderowania partii:', error)
			console.error('Błąd podczas renderowania partii:', error)
		} finally {
			Log.exit()
		}
	},
}
// #endregion
//========================
//#region @r HANDLERS
//========================

const Handlers = {
	// @g Window handlers
	//------------------------
	window: {
		// @b Handle keyboard navigation
		//------------------------
		keyDown: (event) => {
			Log.enter.orange(event.key)
			if (DOM.hasClass($.bigBoard.modal, 'show-modal')) {
				if (event.key === 'ArrowLeft') Handlers.navigation.prevMoveClick()
				else if (event.key === 'ArrowRight') Handlers.navigation.nextMoveClick()
				else if (event.key === 'Escape') Handlers.modals.closeBoardClick(event)
			} else if (DOM.hasClass($.settings.modal, 'show-modal') && event.key === 'Escape') {
				Handlers.modals.closeSettingsClick(event)
			} else if (DOM.hasClass($.error.modal, 'show-modal') && event.key === 'Escape') {
				Effects.hideError()
			}
			Log.exit()
		},

		// @b Handle window resize
		//------------------------
		resize: () => {
			Log.start()
			const currentWidth = window.innerWidth
			const currentHeight = window.innerHeight
			const widthDifference = Math.abs(currentWidth - STATE.lastWidth)
			const heightDifference = Math.abs(currentHeight - STATE.lastHeight)
			Log.enter(widthDifference, heightDifference)

			const MIN_CHANGE_THRESHOLD = 100
			if (widthDifference < MIN_CHANGE_THRESHOLD && heightDifference < MIN_CHANGE_THRESHOLD) {
				Log.exit()
				Log.end()
				return
			}

			STATE.lastWidth = currentWidth
			STATE.lastHeight = currentHeight

			Settings.updateColumnsSelect()
			if (STATE.pgnString && STATE.allGames.length > 0) {
				Logic.processBoards(STATE.allGames[DOM.getValue($.settings.game)].pgn)
			}
			if (DOM.hasClass($.bigBoard.modal, 'show-modal')) {
				Renderers.renderBigBoard()
			}
			Log.exit()
			Log.end()
		},

		// @b Block background scroll when modal open
		//------------------------
		blockScroll: (event) => {
			if (DOM.hasClass($.bigBoard.modal, 'show-modal') || DOM.hasClass($.settings.modal, 'show-modal')) {
				event.preventDefault()
			}
		},

		// @b Print current board grid
		//------------------------
		printBoards: () => {
			Log.start()
			window.print()
			Log.end()
		},
	},

	// @g File handlers
	//------------------------
	file: {
		// @b Open file picker on drop area click
		//------------------------
		dropClick: () => $.file.input.click(),

		// @b Handle drag over drop area
		//------------------------
		dragOver: (e) => {
			e.preventDefault()
			DOM.addClass($.dropArea, 'drag-over')
		},

		// @b Handle drag leave drop area
		//------------------------
		dragLeave: () => DOM.removeClass($.dropArea, 'drag-over'),

		// @b Handle file drop on drop area
		//------------------------
		drop: (e) => {
			e.preventDefault()
			DOM.removeClass($.dropArea, 'drag-over')
			Logic.handleFile(e.dataTransfer.files[0])
		},

		// @b Handle file input change
		//------------------------
		change: (event) => Logic.handleFile(event.target.files[0]),

		// @b Handle drag over file button
		//------------------------
		dragOverOnButton: (e) => {
			e.preventDefault()
			e.stopPropagation()
			DOM.addClass($.toolbar.file, 'drag-over')
		},

		// @b Handle drag leave file button
		//------------------------
		dragLeaveOnButton: (e) => {
			e.preventDefault()
			e.stopPropagation()
			DOM.removeClass($.toolbar.file, 'drag-over')
		},

		// @b Handle file drop on button
		//------------------------
		dropOnButton: (e) => {
			e.preventDefault()
			e.stopPropagation()
			DOM.removeClass($.toolbar.file, 'drag-over')
			Logic.handleFile(e.dataTransfer.files[0])
		},
	},

	// @g Input handlers
	//------------------------
	input: {
		// @b Handle paste area input
		//------------------------
		pasteAreaInput: (event) => {
			STATE.pgnString = DOM.getValue(event.target).trim()
			if (STATE.pgnString.length > 0) Logic.processPgn()
		},

		// @b Prevent paste area click propagation
		//------------------------
		pasteAreaClick: (event) => event.stopPropagation(),
	},

	// @g Select handlers
	//------------------------
	selects: {
		// @b Handle game selection change
		//------------------------
		gameSelectChange: () => {
			Log.start()
			const selectedIndex = DOM.getValue($.settings.game)
			Log.enter(selectedIndex)
			if (selectedIndex !== '') {
				const selectedGame = STATE.allGames[selectedIndex]
				const gameTitle = selectedGame.header.Event
				Logic.processBoards(STATE.allGames[selectedIndex].pgn)
				DOM.setTitle('PGNgrid - ' + gameTitle)
			} else {
				DOM.clear($.boards)
			}
			Log.exit()
			Log.end()
		},

		// @b Handle columns selection change
		//------------------------
		columnsSelectChange: () => {
			Log.start()
			Log.enter(DOM.getValue($.settings.game))
			Logic.processBoards(STATE.allGames[DOM.getValue($.settings.game)].pgn)
			Settings.updateBoardLayout()
			Settings.save()
			Log.exit()
			Log.end()
		},
	},

	// @g Settings handlers
	//------------------------
	settings: {
		// @b Toggle board orientation
		//------------------------
		orientationToggle: () => {
			STATE.settings.orientation = STATE.settings.orientation === 'white' ? 'black' : 'white'
			Log.start()
			Log.enter(STATE.settings.orientation)
			Renderers.renderBoards()
			Settings.save()
			Log.exit()
			Log.end()
		},

		// @b Handle board color picker change
		//------------------------
		boardColorPicker: () => {
			Log.start()
			Log.enter()
			Settings.updateBoardColors()
			Settings.save()
			Log.exit()
			Log.end()
		},

		// @b Handle highlight color picker change
		//------------------------
		highlightColorPicker: () => {
			Log.start()
			Log.enter()
			Settings.updateHighlightColor()
			Renderers.highlightMoves()
			Settings.save()
			Log.exit()
			Log.end()
		},
	},

	// @g Modal handlers
	//------------------------
	modals: {
		// @b Open settings modal
		//------------------------
		settingsClick: () => {
			Log.start()
			DOM.addClass($.settings.modal, 'show-modal')
			Log.end()
		},

		// @b Close settings modal
		//------------------------
		closeSettingsClick: (event) => {
			Log.enter()
			if (event.key || event.target === $.settings.modal || event.target === $.settings.close) {
				DOM.removeClass($.settings.modal, 'show-modal')
			}
			Log.exit()
		},

		// @b Open big board modal
		//------------------------
		boardClick: (index) => {
			Log.start()
			Log.enter(index)
			STATE.currentBoardIndex = index
			DOM.addClass($.bigBoard.modal, 'show-modal')
			DOM.on($.bigBoard.modal, 'wheel', Handlers.navigation.wheelNavigation, { passive: false })
			DOM.on($.bigBoard.board, 'touchstart', Handlers.navigation.touchStart, { passive: false })
			DOM.on($.bigBoard.board, 'touchend', Handlers.navigation.touchEnd, { passive: false })
			Renderers.renderBigBoard()
			Log.exit()
			Log.end()
		},

		// @b Close big board modal
		//------------------------
		closeBoardClick: (event) => {
			Log.enter()
			event.stopPropagation()
			if (event.key || event.target === $.bigBoard.modal || event.currentTarget === $.bigBoard.close) {
				DOM.removeClass($.bigBoard.modal, 'show-modal')
				DOM.off($.bigBoard.modal, 'wheel', Handlers.navigation.wheelNavigation)
				DOM.off($.bigBoard.board, 'touchstart', Handlers.navigation.touchStart)
				DOM.off($.bigBoard.board, 'touchend', Handlers.navigation.touchEnd)
			}
			Log.exit()
		},

		// @b Close error modal
		//------------------------
		closeErrorClick: (event) => {
			Log.enter()
			if (
				event.key ||
				event.target === $.error.modal ||
				event.target === $.error.close ||
				event.target === $.error.ok
			) {
				Effects.hideError()
			}
			Log.exit()
		},
	},

	// @g Navigation handlers
	//------------------------
	navigation: {
		// @b Navigate to previous move
		//------------------------
		prevMoveClick: () => {
			Log.start()
			Log.enter()
			if (STATE.currentBoardIndex > 0) {
				STATE.currentBoardIndex--
				Renderers.renderBigBoard()
			}
			Log.exit()
			Log.end()
		},

		// @b Navigate to next move
		//------------------------
		nextMoveClick: () => {
			Log.start()
			Log.enter()
			if (STATE.currentBoardIndex < STATE.positions.length - 1) {
				STATE.currentBoardIndex++
				Renderers.renderBigBoard()
			}
			Log.exit()
			Log.end()
		},

		// @b Handle mouse wheel navigation
		//------------------------
		wheelNavigation: (event) => {
			event.preventDefault()
			if (event.deltaY > 0) Handlers.navigation.nextMoveClick()
			else Handlers.navigation.prevMoveClick()
		},

		// @b Handle touch start
		//------------------------
		touchStart: (event) => (STATE.touchStartX = event.changedTouches[0].screenX),

		// @b Handle touch end
		//------------------------
		touchEnd: (event) => {
			STATE.touchEndX = event.changedTouches[0].screenX
			Handlers.navigation.swipe()
		},

		// @b Detect swipe direction
		//------------------------
		swipe: () => {
			if (STATE.touchEndX < STATE.touchStartX - 50) Handlers.navigation.nextMoveClick()
			else if (STATE.touchEndX > STATE.touchStartX + 50) Handlers.navigation.prevMoveClick()
		},
	},
}

// #endregion
//========================
//#region @r LISTENERS
//========================

const Listeners = {
	setup: () => {
		Log.enter()
		window.onresize = Tools.debounce(Handlers.window.resize, 200)
		DOM.on(window, 'touchmove', Handlers.window.blockScroll, { passive: false })
		DOM.on(document, 'keydown', Handlers.window.keyDown)

		// Modals
		DOM.on($.bigBoard.modal, 'click', Handlers.modals.closeBoardClick)
		DOM.on($.settings.modal, 'click', Handlers.modals.closeSettingsClick)
		DOM.on($.error.modal, 'click', Handlers.modals.closeErrorClick)

		// Paste/Input Area
		DOM.on($.file.pasteArea, 'input', Handlers.input.pasteAreaInput)
		DOM.on($.file.pasteArea, 'click', Handlers.input.pasteAreaClick)

		// File Drop Area
		DOM.on($.dropArea, 'click', Handlers.file.dropClick)
		DOM.on($.dropArea, 'dragover', Handlers.file.dragOver)
		DOM.on($.dropArea, 'dragleave', Handlers.file.dragLeave)
		DOM.on($.dropArea, 'drop', Handlers.file.drop)

		// Buttons
		DOM.on($.bigBoard.close, 'click', Handlers.modals.closeBoardClick)
		DOM.on($.settings.close, 'click', Handlers.modals.closeSettingsClick)
		DOM.on($.error.close, 'click', Handlers.modals.closeErrorClick)
		DOM.on($.error.ok, 'click', Handlers.modals.closeErrorClick)
		DOM.on($.bigBoard.next, 'click', Handlers.navigation.nextMoveClick)
		DOM.on($.bigBoard.prev, 'click', Handlers.navigation.prevMoveClick)
		DOM.on($.toolbar.orientation, 'click', Handlers.settings.orientationToggle)
		DOM.on($.toolbar.settings, 'click', Handlers.modals.settingsClick)
		DOM.on($.toolbar.print, 'click', Handlers.window.printBoards)

		// File Button
		DOM.on($.toolbar.file, 'dragover', Handlers.file.dragOverOnButton)
		DOM.on($.toolbar.file, 'dragleave', Handlers.file.dragLeaveOnButton)
		DOM.on($.toolbar.file, 'drop', Handlers.file.dropOnButton)
		DOM.on($.file.input, 'change', Handlers.file.change)

		// Selects
		DOM.on($.settings.game, 'change', Handlers.selects.gameSelectChange)
		DOM.on($.settings.columns, 'change', Handlers.selects.columnsSelectChange)
		DOM.onSelectWheel($.settings.columns, Handlers.selects.columnsSelectChange)
		DOM.onSelectWheel($.settings.game, Handlers.selects.gameSelectChange)

		// Color Pickers
		DOM.on($.settings.darkColor, 'input', Handlers.settings.boardColorPicker)
		DOM.on($.settings.highlightColor, 'input', Handlers.settings.highlightColorPicker)
		Log.exit()
	},
}

// #endregion
//========================
//#region @r APP INIT
//========================

const App = {
	init: () => {
		Log.init()
		Log.start('App init')
		Log.enter()
		Settings.load()
		Settings.applyToUI()
		Listeners.setup()
		Log.exit()
		Log.end()
	},
}

App.init()
// #endregion
