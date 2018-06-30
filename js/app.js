(window => {
  /**
   * helpers
   */
  window.qs = (target, scope) => (scope || document).querySelector(target);
  window.qsa = (target, scope) => (scope || document).querySelectorAll(target);

  class CurrencyController {
    constructor(view, model) {
      this.view = view;
      this.model = model;
    }

    convertCurrency() {
      // show loading indicator
      this.view.toggleSpinner(true);
      const query = this.getCountryCodes().join('_');
      $convert(query, result => this.view.render(result));
    }

    getCountryCodes() {
      let countryCodes = [];
      this.view.selects.forEach(select => countryCodes.push(select.value));

      return countryCodes;
    }

    getCurrencyNames() {
      const currencyNames = [];
      this.view.selects.forEach(select => {
        const selectedOption = select.options[select.selectedIndex];
        currencyNames.push(selectedOption.getAttribute('data-currency-name'));
      });

      return currencyNames;
    }
  }

  class CurrencyView {
    constructor() {
      this.currFrom = qs('#curr_fr_val');
      this.currTo = qs('#curr_to_val');
      this.rateTxt = qs('.rate');
      this.toInput = qs('#to-val');
      this.selects = qsa('select');
      this.convertBtn = qs('#convert');
      this.loader = qs('.lds-ellipsis');
      this.controller = null;

      this.convertBtn.addEventListener('click', e => {
        e.preventDefault();

        this.controller.convertCurrency();
      });
    }

    toggleSpinner(visible) {
      visible
        ? this.loader.classList.remove('hide')
        : this.loader.classList.add('hide');
    }

    setController(controller) {
      this.controller = controller;
    }

    render(rate) {
      const amount = this.currFrom.value,
        totalConversion = (amount * rate).toFixed(2);

      this.toggleSpinner(false);
      this.currTo.value = totalConversion;
      const [currFromName, currToName] = [
        ...this.controller.getCurrencyNames()
      ];
      this.rateTxt.innerHTML =
        `${amount} ${currFromName} equals <br/>` +
        `<span class='rateValue'>${totalConversion} ${currToName}</span>`;
    }
  }

  class CurrencyModel {
    constructor() {
      this.idb = idb.open('cc', 1, this._upgradeDB);
    }

    _upgradeDB(db) {
      switch (db.oldVersion) {
        case 0:
          db.createObjectStore('currencies', { keyPath: 'id' });
          db.createObjectStore('converted');
      }
    }
  }

  const m = new CurrencyModel();
  const v = new CurrencyView();
  const c = new CurrencyController(v, m);
  v.setController(c);
})(window);
