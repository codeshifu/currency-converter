(window => {
  const BASE_URL = 'https://free.currencyconverterapi.com/api/v5';
  window.$convert = (query, cb) => {
    fetch(`${BASE_URL}/convert?q=${query}&compact=ultra`)
      .then(res => res.json())
      .then(result => cb(result[query]))
      .catch(err =>
        console.log(
          'Unable to do conversion. Pls check your internet connection or try again later.'
        )
      );
  };

  window.$getCurrencies = cb => {
    fetch(`${BASE_URL}/currencies`)
      .then(res => res.json())
      .then(currencies => cb(currencies.results))
      .catch(err => console.log('Error fetching currencies.'));
  };
})(window);
