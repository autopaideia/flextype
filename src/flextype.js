const LOCK_UP = 1;
const LOCK_DOWN = 2;
const LOCK_BOTH = LOCK_UP + LOCK_DOWN;
const LOCK_REGEX = /\+|-|\s/g;
const PROP_REGEX = /^'|^"|\\|%|'$|"$/g;
const CACHE = {};

const getEls = (els) => {
  if (els instanceof HTMLElement) return [els];
  if (els === null || els.length === undefined) return [];
  if (els.length === 0 || els[0] instanceof HTMLElement) return els;

  throw new TypeError('Flextype: Invalid selector');
};

// eslint-disable-next-line no-use-before-define
const flextype = els => new FlexType(els);

const FlexType = function FlexType(els) {
  this.els = getEls(els);
  this.flex = () => flextype.setElSize(this.els);

  this.flex();
  addEventListener('resize', this.flex);
};

FlexType.prototype.destroy = function destroy(reset = true) {
  removeEventListener('resize', this.flex);
  if (reset) flextype.setElSize(this.els, '');
};

flextype.size = (rules, w, cacheKey) => {
  let parsed = CACHE[cacheKey];

  if (parsed === undefined) {
    const num = parseFloat(rules);
    const ruleSet = !isNaN(num) && isFinite(num) ? { 100: num } : rules;

    // w = width, s = (font-)size, l = lock
    parsed = Object.keys(ruleSet).map(k => ({
      w: parseFloat(k.replace(LOCK_REGEX, '')),
      s: parseFloat(ruleSet[k]),
      l: (k.indexOf('-') + 1 && LOCK_DOWN) + (k.indexOf('+') + 1 && LOCK_UP),
    }));

    if (cacheKey !== undefined) CACHE[cacheKey] = parsed;
  }

  const { start, end } = parsed.reduce((acc, rule) => ({
    start: rule.w <= w && rule.w >= acc.start.w ? rule : acc.start,
    end: rule.w > w && rule.w < acc.end.w ? rule : acc.end,
  }), { start: { w: 0, s: 0, l: 0 }, end: { w: Infinity, s: Infinity, l: 0 } });

  if (w === start.w || [LOCK_UP, LOCK_BOTH].includes(start.l)) return start.s;
  if ([LOCK_DOWN, LOCK_BOTH].includes(end.l)) return end.s;
  if (end.w === Infinity) return (w * start.s) / start.w;
  return start.s + (((end.s - start.s) * (w - start.w)) / (end.w - start.w));
};

flextype.setElSize = (elements, size) => {
  const els = getEls(elements);
  for (let i = 0; i < els.length; i += 1) {
    const el = els[i];
    const oldSize = el.style.fontSize;
    const newSize = size === undefined ? flextype.getElSize(el) : size;

    el.style.fontSize = newSize ? `${newSize}px` : newSize;

    if (el.style.fontSize !== oldSize) {
      if (typeof CustomEvent === 'function') {
        el.dispatchEvent(new CustomEvent('flextype:changed'));
      } else {
        const event = document.createEvent('CustomEvent');
        event.initCustomEvent('flextype:changed', true, false, undefined);
        el.dispatchEvent(event);
      }
    }
  }
};

flextype.getElSize = (elements) => {
  const el = getEls(elements)[0];

  if (!el) return '';

  const style = getComputedStyle(el);
  const val = style.getPropertyValue('--flextype') ||
              getComputedStyle(el, '::before').content;

  if (!val || ['\'\'', '""', 'none'].includes(val)) return '';

  const rules = CACHE[val] || JSON.parse(val.trim().replace(PROP_REGEX, ''));
  const { width, borderLeftWidth: bLeft, borderRightWidth: bRight } = style;
  const innerWidth = parseFloat(width) - parseFloat(bLeft) - parseFloat(bRight);

  return flextype.size(rules, innerWidth, val);
};

flextype.flex = flextype(document.getElementsByClassName('js-flextype')).flex;
