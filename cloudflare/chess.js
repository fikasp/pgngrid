/**
 * Minified by jsDelivr using Terser v5.39.0.
 * Original file: /npm/chess.js@0.10.3/chess.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
/* @license
 * Copyright (c) 2018, Jeff Hlywa (jhlywa@gmail.com)
 * Released under the BSD license
 * https://github.com/jhlywa/chess.js/blob/master/LICENSE
 */
var Chess = function (r) {
	var e = 'b',
		n = 'w',
		t = -1,
		o = 'p',
		i = 'b',
		f = 'k',
		u = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		a = ['1-0', '0-1', '1/2-1/2', '*'],
		l = { b: [16, 32, 17, 15], w: [-16, -32, -17, -15] },
		s = {
			n: [-18, -33, -31, -14, 18, 33, 31, 14],
			b: [-17, -15, 17, 15],
			r: [-16, 1, 16, -1],
			q: [-17, -16, -15, 1, 17, 16, 15, -1],
			k: [-17, -16, -15, 1, 17, 16, 15, -1],
		},
		p = [
			20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0, 0, 0, 0,
			24, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0,
			0, 0, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20,
			0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0, 24, 24, 24,
			24, 24, 24, 56, 0, 56, 24, 24, 24, 24, 24, 24, 0, 0, 0, 0, 0, 0, 2, 53,
			56, 53, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0,
			0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0,
			20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0,
			0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20,
		],
		c = [
			17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0, 0, 17, 0, 0, 0, 0, 0,
			16, 0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0,
			0, 0, 0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 17,
			0, 0, 16, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,
			1, 1, 1, 0, -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -15, -16,
			-17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0, 0, 0, 0, -15,
			0, 0, 0, -16, 0, 0, 0, -17, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, 0, -16, 0, 0,
			0, 0, -17, 0, 0, 0, 0, -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0,
			-15, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, -17,
		],
		v = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 },
		g = {
			NORMAL: 'n',
			CAPTURE: 'c',
			BIG_PAWN: 'b',
			EP_CAPTURE: 'e',
			PROMOTION: 'p',
			KSIDE_CASTLE: 'k',
			QSIDE_CASTLE: 'q',
		},
		h = {
			NORMAL: 1,
			CAPTURE: 2,
			BIG_PAWN: 4,
			EP_CAPTURE: 8,
			PROMOTION: 16,
			KSIDE_CASTLE: 32,
			QSIDE_CASTLE: 64,
		},
		E = {
			a8: 0,
			b8: 1,
			c8: 2,
			d8: 3,
			e8: 4,
			f8: 5,
			g8: 6,
			h8: 7,
			a7: 16,
			b7: 17,
			c7: 18,
			d7: 19,
			e7: 20,
			f7: 21,
			g7: 22,
			h7: 23,
			a6: 32,
			b6: 33,
			c6: 34,
			d6: 35,
			e6: 36,
			f6: 37,
			g6: 38,
			h6: 39,
			a5: 48,
			b5: 49,
			c5: 50,
			d5: 51,
			e5: 52,
			f5: 53,
			g5: 54,
			h5: 55,
			a4: 64,
			b4: 65,
			c4: 66,
			d4: 67,
			e4: 68,
			f4: 69,
			g4: 70,
			h4: 71,
			a3: 80,
			b3: 81,
			c3: 82,
			d3: 83,
			e3: 84,
			f3: 85,
			g3: 86,
			h3: 87,
			a2: 96,
			b2: 97,
			c2: 98,
			d2: 99,
			e2: 100,
			f2: 101,
			g2: 102,
			h2: 103,
			a1: 112,
			b1: 113,
			c1: 114,
			d1: 115,
			e1: 116,
			f1: 117,
			g1: 118,
			h1: 119,
		},
		d = {
			w: [
				{ square: E.a1, flag: h.QSIDE_CASTLE },
				{ square: E.h1, flag: h.KSIDE_CASTLE },
			],
			b: [
				{ square: E.a8, flag: h.QSIDE_CASTLE },
				{ square: E.h8, flag: h.KSIDE_CASTLE },
			],
		},
		b = new Array(128),
		_ = { w: t, b: t },
		A = n,
		S = { w: 0, b: 0 },
		m = t,
		y = 0,
		C = 1,
		T = [],
		I = {}
	function P(r) {
		void 0 === r && (r = !1),
			(b = new Array(128)),
			(_ = { w: t, b: t }),
			(A = n),
			(S = { w: 0, b: 0 }),
			(m = t),
			(y = 0),
			(C = 1),
			(T = []),
			r || (I = {}),
			q(N())
	}
	function w() {
		L(u)
	}
	function L(r, o) {
		void 0 === o && (o = !1)
		var i = r.split(/\s+/),
			f = i[0],
			u = 0
		if (!R(r).valid) return !1
		P(o)
		for (var a = 0; a < f.length; a++) {
			var l = f.charAt(a)
			if ('/' === l) u += 8
			else if (-1 !== '0123456789'.indexOf(l)) u += parseInt(l, 10)
			else {
				var s = l < 'a' ? n : e
				D({ type: l.toLowerCase(), color: s }, X(u)), u++
			}
		}
		return (
			(A = i[1]),
			i[2].indexOf('K') > -1 && (S.w |= h.KSIDE_CASTLE),
			i[2].indexOf('Q') > -1 && (S.w |= h.QSIDE_CASTLE),
			i[2].indexOf('k') > -1 && (S.b |= h.KSIDE_CASTLE),
			i[2].indexOf('q') > -1 && (S.b |= h.QSIDE_CASTLE),
			(m = '-' === i[3] ? t : E[i[3]]),
			(y = parseInt(i[4], 10)),
			(C = parseInt(i[5], 10)),
			q(N()),
			!0
		)
	}
	function R(r) {
		var e = 'No errors.',
			n = 'FEN string must contain six space-delimited fields.',
			t = '6th field (move number) must be a positive integer.',
			o = '5th field (half move counter) must be a non-negative integer.',
			i = '4th field (en-passant square) is invalid.',
			f = '3rd field (castling availability) is invalid.',
			u = '2nd field (side to move) is invalid.',
			a = "1st field (piece positions) does not contain 8 '/'-delimited rows.",
			l = '1st field (piece positions) is invalid [consecutive numbers].',
			s = '1st field (piece positions) is invalid [invalid piece].',
			p = '1st field (piece positions) is invalid [row too large].',
			c = 'Illegal en-passant square',
			v = r.split(/\s+/)
		if (6 !== v.length) return { valid: !1, error_number: 1, error: n }
		if (isNaN(v[5]) || parseInt(v[5], 10) <= 0)
			return { valid: !1, error_number: 2, error: t }
		if (isNaN(v[4]) || parseInt(v[4], 10) < 0)
			return { valid: !1, error_number: 3, error: o }
		if (!/^(-|[abcdefgh][36])$/.test(v[3]))
			return { valid: !1, error_number: 4, error: i }
		if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(v[2]))
			return { valid: !1, error_number: 5, error: f }
		if (!/^(w|b)$/.test(v[1])) return { valid: !1, error_number: 6, error: u }
		var g = v[0].split('/')
		if (8 !== g.length) return { valid: !1, error_number: 7, error: a }
		for (var h = 0; h < g.length; h++) {
			for (var E = 0, d = !1, b = 0; b < g[h].length; b++)
				if (isNaN(g[h][b])) {
					if (!/^[prnbqkPRNBQK]$/.test(g[h][b]))
						return { valid: !1, error_number: 9, error: s }
					;(E += 1), (d = !1)
				} else {
					if (d) return { valid: !1, error_number: 8, error: l }
					;(E += parseInt(g[h][b], 10)), (d = !0)
				}
			if (8 !== E) return { valid: !1, error_number: 10, error: p }
		}
		return ('3' == v[3][1] && 'w' == v[1]) || ('6' == v[3][1] && 'b' == v[1])
			? { valid: !1, error_number: 11, error: c }
			: { valid: !0, error_number: 0, error: e }
	}
	function N() {
		for (var r = 0, o = '', i = E.a8; i <= E.h1; i++) {
			if (null == b[i]) r++
			else {
				r > 0 && ((o += r), (r = 0))
				var f = b[i].color,
					u = b[i].type
				o += f === n ? u.toUpperCase() : u.toLowerCase()
			}
			;(i + 1) & 136 &&
				(r > 0 && (o += r), i !== E.h1 && (o += '/'), (r = 0), (i += 8))
		}
		var a = ''
		S[n] & h.KSIDE_CASTLE && (a += 'K'),
			S[n] & h.QSIDE_CASTLE && (a += 'Q'),
			S[e] & h.KSIDE_CASTLE && (a += 'k'),
			S[e] & h.QSIDE_CASTLE && (a += 'q'),
			(a = a || '-')
		var l = m === t ? '-' : X(m)
		return [o, A, a, l, y, C].join(' ')
	}
	function O(r) {
		for (var e = 0; e < r.length; e += 2)
			'string' == typeof r[e] &&
				'string' == typeof r[e + 1] &&
				(I[r[e]] = r[e + 1])
		return I
	}
	function q(r) {
		T.length > 0 ||
			(r !== u
				? ((I.SetUp = '1'), (I.FEN = r))
				: (delete I.SetUp, delete I.FEN))
	}
	function k(r) {
		var e = b[E[r]]
		return e ? { type: e.type, color: e.color } : null
	}
	function D(r, e) {
		if (!('type' in r) || !('color' in r)) return !1
		if (-1 === 'pnbrqkPNBRQK'.indexOf(r.type.toLowerCase())) return !1
		if (!(e in E)) return !1
		var n = E[e]
		return (
			(r.type != f || _[r.color] == t || _[r.color] == n) &&
			((b[n] = { type: r.type, color: r.color }),
			r.type === f && (_[r.color] = n),
			q(N()),
			!0)
		)
	}
	function K(r, e, n, t, i) {
		var f = { color: A, from: e, to: n, flags: t, piece: r[e].type }
		return (
			i && ((f.flags |= h.PROMOTION), (f.promotion = i)),
			r[n] ? (f.captured = r[n].type) : t & h.EP_CAPTURE && (f.captured = o),
			f
		)
	}
	function Q(r) {
		function e(r, e, n, t, f) {
			if (r[n].type !== o || (0 !== J(t) && 7 !== J(t))) e.push(K(r, n, t, f))
			else
				for (var u = ['q', 'r', i, 'n'], a = 0, l = u.length; a < l; a++)
					e.push(K(r, n, t, f, u[a]))
		}
		var n = [],
			t = A,
			f = Y(t),
			u = { b: 1, w: 6 },
			a = E.a8,
			p = E.h1,
			c = !1,
			v = void 0 === r || !('legal' in r) || r.legal
		if (void 0 !== r && 'square' in r) {
			if (!(r.square in E)) return []
			;(a = p = E[r.square]), (c = !0)
		}
		for (var g = a; g <= p; g++)
			if (136 & g) g += 7
			else {
				var d = b[g]
				if (null != d && d.color === t)
					if (d.type === o) {
						var y = g + l[t][0]
						if (null == b[y]) {
							e(b, n, g, y, h.NORMAL)
							y = g + l[t][1]
							u[t] === J(g) && null == b[y] && e(b, n, g, y, h.BIG_PAWN)
						}
						for (C = 2; C < 4; C++) {
							136 & (y = g + l[t][C]) ||
								(null != b[y] && b[y].color === f
									? e(b, n, g, y, h.CAPTURE)
									: y === m && e(b, n, g, m, h.EP_CAPTURE))
						}
					} else
						for (var C = 0, T = s[d.type].length; C < T; C++) {
							var I = s[d.type][C]
							for (y = g; !(136 & (y += I)); ) {
								if (null != b[y]) {
									if (b[y].color === t) break
									e(b, n, g, y, h.CAPTURE)
									break
								}
								if ((e(b, n, g, y, h.NORMAL), 'n' === d.type || 'k' === d.type))
									break
							}
						}
			}
		if (!c || p === _[t]) {
			if (S[t] & h.KSIDE_CASTLE) {
				var P = (w = _[t]) + 2
				null != b[w + 1] ||
					null != b[P] ||
					j(f, _[t]) ||
					j(f, w + 1) ||
					j(f, P) ||
					e(b, n, _[t], P, h.KSIDE_CASTLE)
			}
			if (S[t] & h.QSIDE_CASTLE) {
				var w
				P = (w = _[t]) - 2
				null != b[w - 1] ||
					null != b[w - 2] ||
					null != b[w - 3] ||
					j(f, _[t]) ||
					j(f, w - 1) ||
					j(f, P) ||
					e(b, n, _[t], P, h.QSIDE_CASTLE)
			}
		}
		if (!v) return n
		var L = []
		for (g = 0, T = n.length; g < T; g++) H(n[g]), B(t) || L.push(n[g]), Z()
		return L
	}
	function U(r, e) {
		var n = ''
		if (r.flags & h.KSIDE_CASTLE) n = 'O-O'
		else if (r.flags & h.QSIDE_CASTLE) n = 'O-O-O'
		else {
			var t = (function (r, e) {
				for (
					var n = Q({ legal: !e }),
						t = r.from,
						o = r.to,
						i = r.piece,
						f = 0,
						u = 0,
						a = 0,
						l = 0,
						s = n.length;
					l < s;
					l++
				) {
					var p = n[l].from,
						c = n[l].to
					i === n[l].piece &&
						t !== p &&
						o === c &&
						(f++, J(t) === J(p) && u++, V(t) === V(p) && a++)
				}
				if (f > 0)
					return u > 0 && a > 0 ? X(t) : a > 0 ? X(t).charAt(1) : X(t).charAt(0)
				return ''
			})(r, e)
			r.piece !== o && (n += r.piece.toUpperCase() + t),
				r.flags & (h.CAPTURE | h.EP_CAPTURE) &&
					(r.piece === o && (n += X(r.from)[0]), (n += 'x')),
				(n += X(r.to)),
				r.flags & h.PROMOTION && (n += '=' + r.promotion.toUpperCase())
		}
		return H(r), $() && (M() ? (n += '#') : (n += '+')), Z(), n
	}
	function x(r) {
		return r.replace(/=/, '').replace(/[+#]?[?!]*$/, '')
	}
	function j(r, t) {
		for (var i = E.a8; i <= E.h1; i++)
			if (136 & i) i += 7
			else if (null != b[i] && b[i].color === r) {
				var f = b[i],
					u = i - t,
					a = u + 119
				if (p[a] & (1 << v[f.type])) {
					if (f.type === o) {
						if (u > 0) {
							if (f.color === n) return !0
						} else if (f.color === e) return !0
						continue
					}
					if ('n' === f.type || 'k' === f.type) return !0
					for (var l = c[a], s = i + l, g = !1; s !== t; ) {
						if (null != b[s]) {
							g = !0
							break
						}
						s += l
					}
					if (!g) return !0
				}
			}
		return !1
	}
	function B(r) {
		return j(Y(r), _[r])
	}
	function $() {
		return B(A)
	}
	function M() {
		return $() && 0 === Q().length
	}
	function G() {
		return !$() && 0 === Q().length
	}
	function F() {
		for (var r = {}, e = [], n = 0, t = 0, o = E.a8; o <= E.h1; o++)
			if (((t = (t + 1) % 2), 136 & o)) o += 7
			else {
				var f = b[o]
				f &&
					((r[f.type] = f.type in r ? r[f.type] + 1 : 1),
					f.type === i && e.push(t),
					n++)
			}
		if (2 === n) return !0
		if (3 === n && (1 === r[i] || 1 === r.n)) return !0
		if (n === r[i] + 2) {
			var u = 0,
				a = e.length
			for (o = 0; o < a; o++) u += e[o]
			if (0 === u || u === a) return !0
		}
		return !1
	}
	function W() {
		for (var r = [], e = {}, n = !1; ; ) {
			var t = Z()
			if (!t) break
			r.push(t)
		}
		for (;;) {
			var o = N().split(' ').slice(0, 4).join(' ')
			if (((e[o] = o in e ? e[o] + 1 : 1), e[o] >= 3 && (n = !0), !r.length))
				break
			H(r.pop())
		}
		return n
	}
	function H(r) {
		var n = A,
			i = Y(n)
		if (
			((function (r) {
				T.push({
					move: r,
					kings: { b: _.b, w: _.w },
					turn: A,
					castling: { b: S.b, w: S.w },
					ep_square: m,
					half_moves: y,
					move_number: C,
				})
			})(r),
			(b[r.to] = b[r.from]),
			(b[r.from] = null),
			r.flags & h.EP_CAPTURE &&
				(A === e ? (b[r.to - 16] = null) : (b[r.to + 16] = null)),
			r.flags & h.PROMOTION && (b[r.to] = { type: r.promotion, color: n }),
			b[r.to].type === f)
		) {
			if (((_[b[r.to].color] = r.to), r.flags & h.KSIDE_CASTLE)) {
				var u = r.to - 1,
					a = r.to + 1
				;(b[u] = b[a]), (b[a] = null)
			} else if (r.flags & h.QSIDE_CASTLE) {
				;(u = r.to + 1), (a = r.to - 2)
				;(b[u] = b[a]), (b[a] = null)
			}
			S[n] = ''
		}
		if (S[n])
			for (var l = 0, s = d[n].length; l < s; l++)
				if (r.from === d[n][l].square && S[n] & d[n][l].flag) {
					S[n] ^= d[n][l].flag
					break
				}
		if (S[i])
			for (l = 0, s = d[i].length; l < s; l++)
				if (r.to === d[i][l].square && S[i] & d[i][l].flag) {
					S[i] ^= d[i][l].flag
					break
				}
		;(m = r.flags & h.BIG_PAWN ? ('b' === A ? r.to - 16 : r.to + 16) : t),
			r.piece === o || r.flags & (h.CAPTURE | h.EP_CAPTURE) ? (y = 0) : y++,
			A === e && C++,
			(A = Y(A))
	}
	function Z() {
		var r = T.pop()
		if (null == r) return null
		var n = r.move
		;(_ = r.kings),
			(A = r.turn),
			(S = r.castling),
			(m = r.ep_square),
			(y = r.half_moves),
			(C = r.move_number)
		var t,
			i,
			f = A,
			u = Y(A)
		if (
			((b[n.from] = b[n.to]),
			(b[n.from].type = n.piece),
			(b[n.to] = null),
			n.flags & h.CAPTURE)
		)
			b[n.to] = { type: n.captured, color: u }
		else if (n.flags & h.EP_CAPTURE) {
			var a
			;(a = f === e ? n.to - 16 : n.to + 16), (b[a] = { type: o, color: u })
		}
		n.flags & (h.KSIDE_CASTLE | h.QSIDE_CASTLE) &&
			(n.flags & h.KSIDE_CASTLE
				? ((t = n.to + 1), (i = n.to - 1))
				: n.flags & h.QSIDE_CASTLE && ((t = n.to - 2), (i = n.to + 1)),
			(b[t] = b[i]),
			(b[i] = null))
		return n
	}
	function z(r, e) {
		var n = x(r)
		if (e) {
			var t = n.match(
				/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/
			)
			if (t)
				var o = t[1],
					i = t[2],
					f = t[3],
					u = t[4]
		}
		for (var a = Q(), l = 0, s = a.length; l < s; l++) {
			if (n === x(U(a[l])) || (e && n === x(U(a[l], !0)))) return a[l]
			if (
				t &&
				(!o || o.toLowerCase() == a[l].piece) &&
				E[i] == a[l].from &&
				E[f] == a[l].to &&
				(!u || u.toLowerCase() == a[l].promotion)
			)
				return a[l]
		}
		return null
	}
	function J(r) {
		return r >> 4
	}
	function V(r) {
		return 15 & r
	}
	function X(r) {
		var e = V(r),
			n = J(r)
		return 'abcdefgh'.substring(e, e + 1) + '87654321'.substring(n, n + 1)
	}
	function Y(r) {
		return r === n ? e : n
	}
	function rr(r) {
		var e = er(r)
		;(e.san = U(e, !1)), (e.to = X(e.to)), (e.from = X(e.from))
		var n = ''
		for (var t in h) h[t] & e.flags && (n += g[t])
		return (e.flags = n), e
	}
	function er(r) {
		var e = r instanceof Array ? [] : {}
		for (var n in r) e[n] = 'object' == typeof n ? er(r[n]) : r[n]
		return e
	}
	function nr(r) {
		return r.replace(/^\s+|\s+$/g, '')
	}
	function tr(r) {
		for (
			var e = Q({ legal: !1 }), n = 0, t = A, o = 0, i = e.length;
			o < i;
			o++
		) {
			if ((H(e[o]), !B(t)))
				if (r - 1 > 0) n += tr(r - 1)
				else n++
			Z()
		}
		return n
	}
	return (
		L(void 0 === r ? u : r),
		{
			WHITE: n,
			BLACK: e,
			PAWN: o,
			KNIGHT: 'n',
			BISHOP: i,
			ROOK: 'r',
			QUEEN: 'q',
			KING: f,
			SQUARES: (function () {
				for (var r = [], e = E.a8; e <= E.h1; e++)
					136 & e ? (e += 7) : r.push(X(e))
				return r
			})(),
			FLAGS: g,
			load: function (r) {
				return L(r)
			},
			reset: function () {
				return w()
			},
			moves: function (r) {
				for (var e = Q(r), n = [], t = 0, o = e.length; t < o; t++)
					void 0 !== r && 'verbose' in r && r.verbose
						? n.push(rr(e[t]))
						: n.push(U(e[t], !1))
				return n
			},
			in_check: function () {
				return $()
			},
			in_checkmate: function () {
				return M()
			},
			in_stalemate: function () {
				return G()
			},
			in_draw: function () {
				return y >= 100 || G() || F() || W()
			},
			insufficient_material: function () {
				return F()
			},
			in_threefold_repetition: function () {
				return W()
			},
			game_over: function () {
				return y >= 100 || M() || G() || F() || W()
			},
			validate_fen: function (r) {
				return R(r)
			},
			fen: function () {
				return N()
			},
			board: function () {
				for (var r = [], e = [], n = E.a8; n <= E.h1; n++)
					null == b[n]
						? e.push(null)
						: e.push({ type: b[n].type, color: b[n].color }),
						(n + 1) & 136 && (r.push(e), (e = []), (n += 8))
				return r
			},
			pgn: function (r) {
				var e =
						'object' == typeof r && 'string' == typeof r.newline_char
							? r.newline_char
							: '\n',
					n =
						'object' == typeof r && 'number' == typeof r.max_width
							? r.max_width
							: 0,
					t = [],
					o = !1
				for (var i in I) t.push('[' + i + ' "' + I[i] + '"]' + e), (o = !0)
				o && T.length && t.push(e)
				for (var f = []; T.length > 0; ) f.push(Z())
				for (var u = [], a = ''; f.length > 0; ) {
					var l = f.pop()
					T.length || 'b' !== l.color
						? 'w' === l.color && (a.length && u.push(a), (a = C + '.'))
						: (a = C + '. ...'),
						(a = a + ' ' + U(l, !1)),
						H(l)
				}
				if (
					(a.length && u.push(a),
					void 0 !== I.Result && u.push(I.Result),
					0 === n)
				)
					return t.join('') + u.join(' ')
				var s = 0
				for (i = 0; i < u.length; i++)
					s + u[i].length > n && 0 !== i
						? (' ' === t[t.length - 1] && t.pop(), t.push(e), (s = 0))
						: 0 !== i && (t.push(' '), s++),
						t.push(u[i]),
						(s += u[i].length)
				return t.join('')
			},
			load_pgn: function (r, e) {
				var n = void 0 !== e && 'sloppy' in e && e.sloppy
				function t(r) {
					return r.replace(/\\/g, '\\')
				}
				var o =
						'object' == typeof e && 'string' == typeof e.newline_char
							? e.newline_char
							: '\r?\n',
					i = new RegExp('^(\\[((?:' + t(o) + ')|.)*\\])(?:' + t(o) + '){2}'),
					f = i.test(r) ? i.exec(r)[1] : ''
				w()
				var u = (function (r, e) {
					for (
						var n =
								'object' == typeof e && 'string' == typeof e.newline_char
									? e.newline_char
									: '\r?\n',
							o = {},
							i = r.split(new RegExp(t(n))),
							f = '',
							u = '',
							a = 0;
						a < i.length;
						a++
					)
						(f = i[a].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1')),
							(u = i[a].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1')),
							nr(f).length > 0 && (o[f] = u)
					return o
				})(f, e)
				for (var l in u) O([l, u[l]])
				if (!('1' !== u.SetUp || ('FEN' in u && L(u.FEN, !0)))) return !1
				var s = r.replace(f, '').replace(new RegExp(t(o), 'g'), ' ')
				s = s.replace(/(\{[^}]+\})+?/g, '')
				for (var p = /(\([^\(\)]+\))+?/g; p.test(s); ) s = s.replace(p, '')
				var c = nr(
					(s = (s = (s = s.replace(/\d+\.(\.\.)?/g, '')).replace(
						/\.\.\./g,
						''
					)).replace(/\$\d+/g, ''))
				).split(new RegExp(/\s+/))
				c = c.join(',').replace(/,,+/g, ',').split(',')
				for (var v = '', g = 0; g < c.length - 1; g++) {
					if (null == (v = z(c[g], n))) return !1
					H(v)
				}
				if (((v = c[c.length - 1]), a.indexOf(v) > -1))
					(function (r) {
						for (var e in r) return !0
						return !1
					})(I) &&
						void 0 === I.Result &&
						O(['Result', v])
				else {
					if (null == (v = z(v, n))) return !1
					H(v)
				}
				return !0
			},
			header: function () {
				return O(arguments)
			},
			ascii: function () {
				return (function () {
					for (
						var r = '   +------------------------+\n', e = E.a8;
						e <= E.h1;
						e++
					) {
						if (
							(0 === V(e) && (r += ' ' + '87654321'[J(e)] + ' |'), null == b[e])
						)
							r += ' . '
						else {
							var t = b[e].type
							r +=
								' ' +
								(b[e].color === n ? t.toUpperCase() : t.toLowerCase()) +
								' '
						}
						;(e + 1) & 136 && ((r += '|\n'), (e += 8))
					}
					return (
						(r += '   +------------------------+\n'),
						r + '     a  b  c  d  e  f  g  h\n'
					)
				})()
			},
			turn: function () {
				return A
			},
			move: function (r, e) {
				var n = void 0 !== e && 'sloppy' in e && e.sloppy,
					t = null
				if ('string' == typeof r) t = z(r, n)
				else if ('object' == typeof r)
					for (var o = Q(), i = 0, f = o.length; i < f; i++)
						if (
							r.from === X(o[i].from) &&
							r.to === X(o[i].to) &&
							(!('promotion' in o[i]) || r.promotion === o[i].promotion)
						) {
							t = o[i]
							break
						}
				if (!t) return null
				var u = rr(t)
				return H(t), u
			},
			undo: function () {
				var r = Z()
				return r ? rr(r) : null
			},
			clear: function () {
				return P()
			},
			put: function (r, e) {
				return D(r, e)
			},
			get: function (r) {
				return k(r)
			},
			remove: function (r) {
				return (function (r) {
					var e = k(r)
					return (
						(b[E[r]] = null), e && e.type === f && (_[e.color] = t), q(N()), e
					)
				})(r)
			},
			perft: function (r) {
				return tr(r)
			},
			square_color: function (r) {
				if (r in E) {
					var e = E[r]
					return (J(e) + V(e)) % 2 == 0 ? 'light' : 'dark'
				}
				return null
			},
			history: function (r) {
				for (
					var e = [], n = [], t = void 0 !== r && ('verbose' in r) && r.verbose;
					T.length > 0;

				)
					e.push(Z())
				for (; e.length > 0; ) {
					var o = e.pop()
					t ? n.push(rr(o)) : n.push(U(o)), H(o)
				}
				return n
			},
		}
	)
}
'undefined' != typeof exports && (exports.Chess = Chess),
	'undefined' != typeof define &&
		define(function () {
			return Chess
		})
//# sourceMappingURL=/sm/7c99191ecd80e4f10abb00ea2bbbdf87bf97aaa9a813d7a0792bb3f505e0480d.map
