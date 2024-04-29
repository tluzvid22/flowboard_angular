export const environment = {
  production: false,
  countriesAPI: {
    base_url: 'https://referential.p.rapidapi.com/v1',
    apikey: {
      host: { key: 'X-RapidAPI-Host', value: 'referential.p.rapidapi.com' },
      key: {
        key: 'X-RapidAPI-Key',
        value: '73106c781cmshb114b02e314de79p14496bjsn9de5aa12b8c3',
      },
    },
    endpoint_country: '/country',
    endpoint_state: '/state',
    endpoint_city: '/city',
    language: 'ES',
  },
};
