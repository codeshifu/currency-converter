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

      this._init();
    }

    async _init() {
      let currencies = await this.model.getAll();
      if (currencies && currencies.length > 0) {
        this.view.populateOptionsWithCurrency(currencies);
      } else {
        $getCurrencies(async currencies => {
          const currencyIDs = Object.keys(currencies).sort();
          currencyIDs.forEach(id => {
            this.model.create(currencies[id]);
          });

          // TODO: populate view selects with currency data
          currencies = await this.model.getAll();
          this.view.populateOptionsWithCurrency(currencies);
        });
      }
    }

    convertCurrency() {
      // show loading indicator
      this.view.toggleSpinner(true);

      const query = this.getCountryCodes().join('_');

      let requestPending = true;

      this.model.getConversion(query).then(conversionRate => {
        if (conversionRate && requestPending) this.view.render(conversionRate);
      });

      $convert(query, result => {
        requestPending = false;
        this.model.saveConversion(query, result);
        this.view.render(result);
      });
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

    populateOptionsWithCurrency(currencies) {
      this.selects.forEach(select => {
        select.innerHTML = currencies.map(currency => {
          const { currencyName, id } = currency;
          return `<option data-currency-name='${currencyName}' value='${id}'>${currencyName}</option>`;
        });
      });
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
      this.idb = idb.open('cc', 1, db => this._upgradeDB(db));
      this.STORE_CURRENCIES = 'currencies';
      this.STORE_CONVERTED = 'converted';
    }

    _upgradeDB(db) {
      switch (db.oldVersion) {
        case 0:
          db.createObjectStore(this.STORE_CURRENCIES, { keyPath: 'id' });
          db.createObjectStore(this.STORE_CONVERTED);
      }
    }

    getAll() {
      return this.idb.then(db =>
        db
          .transaction(this.STORE_CURRENCIES)
          .objectStore(this.STORE_CURRENCIES)
          .getAll()
      );
    }

    create(currencyObj) {
      this.idb.then(db => {
        const tx = db.transaction(this.STORE_CURRENCIES, 'readwrite');
        tx.objectStore(this.STORE_CURRENCIES).put(currencyObj);

        return tx.complete;
      });
    }

    getConversion(key) {
      return this.idb.then(db =>
        db
          .transaction(this.STORE_CONVERTED)
          .objectStore(this.STORE_CONVERTED)
          .get(key)
      );
    }
    saveConversion(key, value) {
      this.idb.then(db =>
        db
          .transaction(this.STORE_CONVERTED, 'readwrite')
          .objectStore(this.STORE_CONVERTED)
          .put(value, key)
      );
    }
  }

  const m = new CurrencyModel();
  const v = new CurrencyView();
  const c = new CurrencyController(v, m);
  v.setController(c);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(() => {
      if (!navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener(
          'controllerchange',
          function changeListener() {
            // new worker has claimed. warm up cache
            console.log('warm up cache');
            fetch('https://ipapi.co/json/')
              .then(response => response.json())
              .then(res => {
                const countryCurrency = res.currency;
                if (countryCurrency) {
                  const popularCurrency = [
                    'USD',
                    'GBP',
                    'EUR',
                    'CHF',
                    'JPY',
                    'CNY'
                  ];

                  popularCurrency
                    .filter(curr => curr !== countryCurrency)
                    .forEach(curr => {
                      $convert(`${countryCurrency}_${curr}`, () => {});
                    });
                }
              })
              .catch(() => null);

            navigator.serviceWorker.removeEventListener(
              'controllerchange',
              changeListener
            );
          }
        );
      }
    });
  }
})(window);
