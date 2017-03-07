describe('flextype', () => {
  const doc = document;

  const triggerResize = () => {
    if (typeof Event === 'function') {
      dispatchEvent(new Event('resize'));
    } else {
      // IE
      const event = document.createEvent('UIEvents');
      event.initUIEvent('resize', true, false, window, 0);
      dispatchEvent(event);
    }
  };

  describe('factory', () => {
    const el = doc.createElement('div');

    el.className = 'el1';
    doc.body.appendChild(el);

    beforeEach(() => {
      spyOn(flextype, 'setElSize');
    });

    describe('initialization', () => {
      it('accepts `selector` as a single node or a list of nodes', () => {
        let instance = flextype(el);

        expect(flextype.setElSize.calls.mostRecent().args[0][0]).toEqual(el);
        instance.destroy();
        flextype.setElSize.calls.reset();

        instance = flextype([el]);
        expect(flextype.setElSize.calls.mostRecent().args[0][0]).toEqual(el);
        instance.destroy();
        flextype.setElSize.calls.reset();

        instance = flextype(doc.getElementsByClassName('el1'));
        expect(flextype.setElSize.calls.mostRecent().args[0][0]).toEqual(el);
        instance.destroy();
        flextype.setElSize.calls.reset();

        instance = flextype(doc.querySelectorAll('.el1'));
        expect(flextype.setElSize.calls.mostRecent().args[0][0]).toEqual(el);
        instance.destroy();
      });

      it('does not explode when `selector` doesn\'t exist in the document', () => {
        const nope = doc.createElement('div');

        expect(() => flextype(nope).destroy())
          .not.toThrow();
        expect(() => flextype([nope]).destroy())
          .not.toThrow();
        expect(() => flextype(doc.querySelectorAll('.nope')).destroy())
          .not.toThrow();
        expect(() => flextype(doc.getElementsByClassName('nope')).destroy())
          .not.toThrow();
        expect(() => flextype(doc.getElementById('nope')).destroy())
          .not.toThrow();
      });

      it('throws a TypeError when `selector` is not a node or list of nodes', () => {
        expect(() => flextype().destroy()).toThrowError(TypeError);
        expect(() => flextype('#nope').destroy()).toThrowError(TypeError);
      });

      it('invokes flextype.setElSize on `selector`', () => {
        const instance = flextype(el);
        expect(flextype.setElSize).toHaveBeenCalledWith([el]);
        instance.destroy();
      });

      it('binds flextype.setElSize to resize event listener', () => {
        const instance = flextype(el);
        flextype.setElSize.calls.reset();
        triggerResize();
        expect(flextype.setElSize).toHaveBeenCalledWith([el]);
        instance.destroy();
      });
    });

    describe('instance.flex', () => {
      it('invokes flextype.setElSize on `selector`', () => {
        const instance = flextype(el);
        flextype.setElSize.calls.reset();
        instance.flex();
        expect(flextype.setElSize).toHaveBeenCalledWith([el]);
        instance.destroy();
      });
    });

    describe('instance.destroy', () => {
      it('invokes flextype.setElSize with empty string on `selector` when reset arg is undefined', () => {
        const instance = flextype(el);
        flextype.setElSize.calls.reset();
        instance.destroy();
        expect(flextype.setElSize).toHaveBeenCalledWith([el], '');
      });

      it('invokes flextype.setElSize with empty string on `selector` when reset arg is true', () => {
        const instance = flextype(el);
        flextype.setElSize.calls.reset();
        instance.destroy(true);
        expect(flextype.setElSize).toHaveBeenCalledWith([el], '');
      });

      it('does not invoke flextype.setElSize on `selector` when reset arg is false', () => {
        const instance = flextype(el);
        flextype.setElSize.calls.reset();
        instance.destroy(false);
        expect(flextype.setElSize).not.toHaveBeenCalled();
      });

      it('removes the resize event listener', () => {
        const instance = flextype(el);
        instance.destroy(true);
        flextype.setElSize.calls.reset();
        triggerResize();
        expect(flextype.setElSize).not.toHaveBeenCalledWith([el]);
      });
    });
  });

  describe('default instance', () => {
    beforeEach(() => {
      spyOn(flextype, 'setElSize');
    });

    it('invokes flextype.setElSize on `.js-flextype` when window is resized', () => {
      const el = doc.createElement('div');
      el.className = 'js-flextype';
      doc.body.appendChild(el);

      flextype.setElSize.calls.reset();
      triggerResize();
      expect(flextype.setElSize.calls.mostRecent().args[0][0]).toEqual(el);

      doc.body.removeChild(el);
    });
  });

  describe('methods', () => {
    describe('flextype.setElSize', () => {
      const el = doc.createElement('div');

      el.className = 'el2';

      doc.body.appendChild(el);

      beforeEach(() => {
        spyOn(flextype, 'getElSize').and.returnValue(111);
      });

      afterEach(() => {
        el.removeAttribute('style');
      });

      it('sets `selector` to `size` when `size` is defined', () => {
        el.style.fontSize = '5px';
        flextype.setElSize(el, 100);
        expect(el.style.fontSize).toBe('100px');
      });

      it('accepts a list of nodes for `selector`', () => {
        el.style.fontSize = '5px';
        flextype.setElSize(doc.getElementsByClassName('el2'), 100);
        expect(el.style.fontSize).toBe('100px');

        flextype.setElSize(doc.querySelectorAll('.el2'), 101);
        expect(el.style.fontSize).toBe('101px');

        flextype.setElSize([el], 102);
        expect(el.style.fontSize).toBe('102px');
      });

      it('does not explode when `selector` doesn\'t exist in the document', () => {
        const nope = doc.createElement('div');

        expect(() => flextype.setElSize(nope, 10))
          .not.toThrow();
        expect(() => flextype.setElSize([nope], 10))
          .not.toThrow();
        expect(() => flextype.setElSize(doc.querySelectorAll('.nope'), 10))
          .not.toThrow();
        expect(() => flextype.setElSize(doc.getElementsByClassName('nope'), 10))
          .not.toThrow();
        expect(() => flextype.setElSize(doc.getElementById('nope'), 10))
          .not.toThrow();
      });

      it('throws a TypeError when `selector` is not a node or list of nodes', () => {
        expect(() => flextype.setElSize(undefined, 10)).toThrowError(TypeError);
        expect(() => flextype.setElSize('#nope', 10)).toThrowError(TypeError);
      });

      it('accepts an empty string for `size` (which resets the fontSize)', () => {
        const fs = el.style.fontSize;
        flextype.setElSize(el, 100);
        el.style.fontSize = '5px';
        flextype.setElSize(el, '');
        expect(el.style.fontSize).toBe(fs);
      });

      it('passes the el to flextype.getElSize if `size` is undefined and sets the font-size to whatever getElSize returns', () => {
        el.style.fontSize = '5px';
        flextype.setElSize(el);
        expect(flextype.getElSize).toHaveBeenCalledWith(el);
        expect(el.style.fontSize).toBe('111px');
      });

      it('dispatches a `flextype:changed` event if the font-size was changed', () => {
        el.style.fontSize = '5px';

        let changed = false;
        const onChange = () => {
          changed = true;
        };

        el.addEventListener('flextype:changed', onChange);
        flextype.setElSize(el, 100);
        expect(changed).toEqual(true);
        el.removeEventListener('flextype:changed', onChange);
      });

      it('does not dispatch a `flextype:changed` event if the font-size was not changed', () => {
        const fs = el.style.fontSize;

        let changed = false;
        const onChange = () => {
          changed = true;
        };

        el.addEventListener('flextype:changed', onChange);
        flextype.setElSize(el, fs);
        expect(changed).toEqual(false);
        el.removeEventListener('flextype:changed', onChange);
      });
    });

    describe('flextype.getElSize', () => {
      const css = doc.createElement('style');
      const el = doc.createElement('div');

      el.className = 'el3';

      doc.body.appendChild(el);
      doc.head.appendChild(css);

      beforeEach(() => {
        spyOn(flextype, 'size').and.returnValue(111);
      });

      afterEach(() => {
        css.innerHTML = '';
        el.removeAttribute('style');
      });

      it('returns an empty string if ::before content is empty', () => {
        css.innerHTML = `
          .el3::before {
            content: none;
          }
        `;
        expect(flextype.getElSize(el)).toBe('');

        css.innerHTML = `
          .el3::before {
            content: normal;
          }
        `;
        expect(flextype.getElSize(el)).toBe('');

        css.innerHTML = `
          .el3::before {
            content: initial;
          }
        `;
        expect(flextype.getElSize(el)).toBe('');

        css.innerHTML = `
          .el3::before {
            content: unset;
          }
        `;
        expect(flextype.getElSize(el)).toBe('');

        css.innerHTML = `
          .el3::before {
            content: "";
          }
        `;
        expect(flextype.getElSize(el)).toBe('');

        css.innerHTML = `
          .el3::before {
            content: '';
          }
        `;
        expect(flextype.getElSize(el)).toBe('');
      });

      it('throws a syntax error if content is invalid JSON', () => {
        css.innerHTML = `
          .el3::before {
            content: "not valid json";
          }
        `;

        expect(() => flextype.getElSize(el)).toThrowError(SyntaxError);
      });

      it('passes element width and rules from ::before content to flextype.size when `size` is undefined and rules are JSON', () => {
        css.innerHTML = `
          .el3 {
            width: 55px;
          }
          .el3::before {
            content: '{ "10": 4, "11+": 6 }';
            display: none;
          }
        `;
        const k = getComputedStyle(el, '::before').content;

        expect(flextype.getElSize(el)).toBe(111);
        expect(flextype.size).toHaveBeenCalledWith({ 10: 4, '11+': 6 }, 55, k);
      });

      it('ignores border-widths', () => {
        css.innerHTML = `
          .el3 {
            width: 55px;
            border: solid 8px #000;
          }
          .el3::before {
            content: '{ "10": 4, "11+": 6 }';
            display: none;
          }
        `;

        const k = getComputedStyle(el, '::before').content;

        flextype.getElSize(el);
        expect(flextype.size).toHaveBeenCalledWith({ 10: 4, '11+': 6 }, 39, k);
      });

      it('allows floats for the element\'s width', () => {
        css.innerHTML = `
          .el3 {
            width: 5.5px;
          }
          .el3::before {
            content: '{ "10": 4, "11+": 6 }';
            display: none;
          }
        `;

        const k = getComputedStyle(el, '::before').content;

        flextype.getElSize(el);
        expect(flextype.size).toHaveBeenCalledWith({ 10: 4, '11+': 6 }, 5.5, k);
      });

      it('passes element width and rules from ::before content to flextype.size when `size` is undefined and rules are numeric', () => {
        css.innerHTML = `
          .el3 {
            width: 55px;
          }
          .el3::before {
            content: '12.12';
            display: none;
          }
        `;

        const k = getComputedStyle(el, '::before').content;

        expect(flextype.getElSize(el)).toBe(111);
        expect(flextype.size).toHaveBeenCalledWith(12.12, 55, k);
      });

      it('passes element width and rules from ::before content to flextype.size when `size` is undefined and rules are a percent', () => {
        css.innerHTML = `
          .el3 {
            width: 55px;
          }
          .el3::before {
            content: '12.12%';
            display: none;
          }
        `;

        const k = getComputedStyle(el, '::before').content;

        expect(flextype.getElSize(el)).toBe(111);
        expect(flextype.size).toHaveBeenCalledWith(12.12, 55, k);
      });

      it('reads flextype config from --flextype css variable string if browser supports it', () => {
        css.innerHTML = `
          .el3 {
            --flextype: '12.12';
            width: 55px;
          }
        `;

        const k = getComputedStyle(el).getPropertyValue('--flextype');
        if (!k) return;

        expect(flextype.getElSize(el)).toBe(111);
        expect(flextype.size).toHaveBeenCalledWith(12.12, 55, k);
      });

      it('accepts --flextype as a bare number', () => {
        css.innerHTML = `
          .el3 {
            --flextype: 12.12;
            width: 55px;
          }
        `;

        const k = getComputedStyle(el).getPropertyValue('--flextype');
        if (!k) return;

        expect(flextype.getElSize(el)).toBe(111);
        expect(flextype.size).toHaveBeenCalledWith(12.12, 55, k);
      });

      it('accepts --flextype as a bare percent', () => {
        css.innerHTML = `
          .el3 {
            --flextype: 12.12%;
            width: 55px;
          }
        `;

        const k = getComputedStyle(el).getPropertyValue('--flextype');
        if (!k) return;

        expect(flextype.getElSize(el)).toBe(111);
        expect(flextype.size).toHaveBeenCalledWith(12.12, 55, k);
      });

      it('accepts --flextype as a JSON string', () => {
        css.innerHTML = `
          .el3 {
            --flextype: '{ "10": 4, "11+": 6 }';
            width: 55px;
          }
        `;

        const k = getComputedStyle(el).getPropertyValue('--flextype');
        if (!k) return;

        expect(flextype.getElSize(el)).toBe(111);
        expect(flextype.size).toHaveBeenCalledWith({ 10: 4, '11+': 6 }, 55, k);
      });

      it('does not parse rules when they exist in the cache', () => {
        css.innerHTML = `
          .el3 {
            width: 55px;
          }
          .el3::before {
            content: '4%';
            display: none;
          }
        `;

        const k = getComputedStyle(el, '::before').content;

        cache[k] = 'VALUE';

        flextype.getElSize(el);
        expect(flextype.size).toHaveBeenCalledWith(null, 55, k);

        delete cache[k];
      });

      it('accepts a list of nodes', () => {
        css.innerHTML = `
          .el3::before {
            content: '1234';
          }
        `;

        expect(flextype.getElSize([el])).toBe(111);
        expect(flextype.getElSize(doc.getElementsByClassName('el3'))).toBe(111);
        expect(flextype.getElSize(doc.querySelectorAll('.el3'))).toBe(111);
      });

      it('returns an empty string when the element is not found', () => {
        const nope = doc.createElement('div');

        expect(flextype.getElSize(nope)).toBe('');
        expect(flextype.getElSize([nope])).toBe('');
        expect(flextype.getElSize(doc.querySelectorAll('.nope'))).toBe('');
        expect(flextype.getElSize(doc.getElementsByClassName('nope'))).toBe('');
        expect(flextype.getElSize(doc.getElementById('nope'))).toBe('');
      });

      it('throws a TypeError when `selector` is not a node or list of nodes', () => {
        expect(() => flextype.getElSize()).toThrowError(TypeError);
        expect(() => flextype.getElSize('#nope')).toThrowError(TypeError);
      });
    });

    describe('flextype.size', () => {
      afterEach(() => {
        Object.keys(cache).forEach((key) => {
          delete cache[key];
        });
      });

      it('determines the appropriate font-size for the given ruleset at the given width', () => {
        expect(flextype.size({ 1000: 14 }, 1000)).toBe(14);
      });

      it('allows pixel units to be explicitly declared in rules', () => {
        expect(flextype.size({ '1000px': '14px' }, 1000)).toBe(14);
      });

      it('allows decimal points on width and size', () => {
        expect(flextype.size({ 1000.5: 14.5 }, 1000.5)).toBe(14.5);
      });

      it('scales the font-size proportionally to the width', () => {
        expect(flextype.size({ 1000: 14 }, 500)).toBe(7);
        expect(flextype.size({ 1000: 14 }, 2000)).toBe(28);
      });

      it('scales correctly between multiple rules', () => {
        const rules = { 500: 12, 1000: 14, 1200: 18 };

        expect(flextype.size(rules, 500)).toBe(12);
        expect(flextype.size(rules, 750)).toBe(13);
        expect(flextype.size(rules, 1100)).toBe(16);
        expect(flextype.size(rules, 1200)).toBe(18);
        expect(flextype.size(rules, 2400)).toBe(36);
      });

      it('allows rules to be out of sequence', () => {
        const rules = { 1000: 14, 1200: 18, 500: 12 };
        expect(flextype.size(rules, 2400)).toBe(36);
      });

      it('interprets minus sign as lock on scaling between the rule and the rule below it', () => {
        expect(flextype.size({ '1000-': 14 }, 750)).toBe(14);

        expect(flextype.size({ 200: 12, '1000-': 14 }, 150)).toBe(9);
        expect(flextype.size({ 200: 12, '1000-': 14 }, 200)).toBe(12);
        expect(flextype.size({ 200: 12, '1000-': 14 }, 500)).toBe(14);
        expect(flextype.size({ 200: 12, '1000-': 14 }, 1000)).toBe(14);
      });

      it('interprets plus sign as lock on scaling between the rule and the rule above it', () => {
        expect(flextype.size({ '1000+': 14 }, 1200)).toBe(14);

        expect(flextype.size({ '1000+': 14, 1500: 30 }, 1000)).toBe(14);
        expect(flextype.size({ '1000+': 14, 1500: 30 }, 1200)).toBe(14);
        expect(flextype.size({ '1000+': 14, 1500: 30 }, 1500)).toBe(30);
        expect(flextype.size({ '1000+': 14, 1500: 30 }, 3000)).toBe(60);
      });

      it('interprets plus-minus sign as lock on scaling between the rule and the rules above and below it', () => {
        expect(flextype.size({ '1000+-': 14 }, 750)).toBe(14);
        expect(flextype.size({ '1000+-': 14 }, 1200)).toBe(14);

        const rules = { 200: 12, '1000+-': 14, 1500: 30 };

        expect(flextype.size(rules, 200)).toBe(12);
        expect(flextype.size(rules, 201)).toBe(14);
        expect(flextype.size(rules, 1000)).toBe(14);
        expect(flextype.size(rules, 1499)).toBe(14);
        expect(flextype.size(rules, 1500)).toBe(30);
        expect(flextype.size(rules, 3000)).toBe(60);
      });

      it('accepts an integer representing a percent', () => {
        expect(flextype.size(6, 200)).toBe(12);
      });

      it('stores items in the cache when cacheKey is set', () => {
        flextype.size(6, 200, 'testKey');
        expect(cache.testKey).toEqual([{ w: 100, s: 6, l: 0 }]);
      });

      it('retrieves items from the cache when cacheKey is set', () => {
        expect(flextype.size(45, 100, 'testKey')).toBe(45);
        expect(flextype.size(75, 100, 'testKey')).toBe(45);
      });
    });

    describe('flextype.flex', () => {
      beforeEach(() => {
        spyOn(flextype, 'setElSize');
      });

      it('invokes flextype.setElSize on `.js-flextype`', () => {
        const el = doc.createElement('div');
        el.className = 'js-flextype';
        doc.body.appendChild(el);

        flextype.flex();
        expect(flextype.setElSize.calls.mostRecent().args[0][0]).toEqual(el);

        doc.body.removeChild(el);
      });
    });
  });
});
