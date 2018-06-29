(window => {
  /**
   * helpers
   */
  window.qs = (target, scope) => (scope || document).querySelector(target);
  window.qsa = (target, scope) => (scope || document).querySelectorAll(target);

  class CurrencyController {
    constructor(view) {
      this.view = view;
      this.BASE_URL = 'https://free.currencyconverterapi.com/api/v5';
    }

    convertCurrency() {
      // show loading indicator
      this.view.toggleSpinner(true);
      const query = this.getCountryCodes().join('_');

      fetch(`${this.BASE_URL}/convert?q=${query}&compact=ultra`)
        .then(res => res.json())
        .then(result => this.view.render(result[query]))
        .catch(err => console.log('Unable to convert currency.'));
    }

    getCountryCodes() {
      let countryCodes = [];
      this.view.selects.forEach(select => countryCodes.push(select.value));

      return countryCodes;
    }

    getCurrencyNames() {
      const currencyNames = [];
      this.view.selects.forEach(select => {
        const selectedOption = select.selectedOptions[select.selectedIndex];
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
    constructor() {}
  }

  const v = new CurrencyView();
  const c = new CurrencyController(v);
  v.setController(c);
})(window);
