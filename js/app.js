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
      const query = this.view.countryCodes().join('_');

      fetch(`${this.BASE_URL}/convert?q=${query}&compact=ultra`)
        .then(res => res.json())
        .then(result => this.view.render(result[query]))
        .catch(err => console.log('Unable to convert currency.'));
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

    countryCodes() {
      let result = [];
      this.selects.forEach(select => result.push(select.value));
      return result;
    }

    setController(controller) {
      this.controller = controller;
    }

    getCurrencyNames() {
      const curr_names = [];
      this.selects.forEach(select => {
        const selectedOption = select.selectedOptions[select.selectedIndex];
        curr_names.push(selectedOption.getAttribute('data-currency-name'));
      });

      return curr_names;
    }

    render(rate) {
      const amount = this.currFrom.value,
        totalConversion = (amount * rate).toFixed(2);

      this.toggleSpinner(false);
      this.currTo.value = totalConversion;
      const [currFromName, currToName] = [...this.getCurrencyNames()];
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
