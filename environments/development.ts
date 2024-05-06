export const environment = {
  production: false,
  CRYPTO_KEY:
    'UsJgGzSSP+PCoB9Tw0O7k+94yMR4UWlthDCeV231XfroCewolyY5EpKxU1Ur3zdT',
  countriesAPI: {
    base_url: 'https://api.countrystatecity.in/v1',
    apikey: {
      key: {
        key: 'X-CSCAPI-KEY',
        value: 'TWxvcHNTRFY3TG0zN21MOEk0Y0g1SFdid3lNZGJvU0dpNFdRMG14VA==',
      },
    },
    endpoints: {
      country: '/countries',
      state: `/countries/[COUNTRY_ISO]/states`,
      city: '/countries/[COUNTRY_ISO]/states/[STATE_ISO]/cities',
      country_param: '[COUNTRY_ISO]',
      state_param: '[STATE_ISO]',
    },
  },
  flowboardAPI: {
    base_url: 'https://localhost:7290/api/v1',
    apikey: {
      key: {
        key: '',
        value: '',
      },
    },
    endpoints: {
      user: '/User',
      table: '/table',
      image: '/Image',
    },
  },
};
