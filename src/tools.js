// ========================
// @r C
// ========================

// @b Clear content
// ------------------------
function clearContent(element) {
	if (element) {
		element.innerHTML = ''
	}
}

// @b Create element
// ------------------------
function createElement({
	type = 'div',
	parent,
	children,
	listeners,
	dataset,
	...attributes
}) {
	const element = document.createElement(type)

	if (parent) {
		parent.appendChild(element)
	}
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
}

// ========================
// @r S
// ========================

// @b Set content
// ------------------------
function setContent(element) {
	if (element) {
		element.innerHTML = ''
	}
}