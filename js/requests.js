(window => {
  const BASE_URL = 'https://free.currencyconverterapi.com/api/v5';
  window.$convert = (query, cb) => {
    fetch(`${BASE_URL}/convert?q=${query}&compact=ultra`)
      .then(res => res.json())
      .then(result => cb(result[query]));
  };

  window.$getCurrencies = cb => {
    fetch('/currencies.json')
      .then(res => res.json())
      .then(currencies => cb(currencies));
  };
})(window);
