

const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEL = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

//let internalExchangeRate = {}

const showAlert = err =>{
  const div = document.createElement('div')
  const button = document.createElement('button')

  div.textContent = err.message
  div.setAttribute('role', 'alert')
  div.classList.add('alert', 'alert-warning', 'alert-dismissible', 'fate', 'show')
  button.classList.add('btn-close')
  button.setAttribute('type', 'button')
  button.setAttribute('aria-label', 'close')

  button.addEventListener('click', () =>{
    div.remove()
  })

  div.appendChild(button)
  currenciesEL.insertAdjacentElement('afterend', div)
}

const state = (() =>{
  let exchangeRate = {}
  return{
    getExchangeRate: () => exchangeRate,
    setExchangeRate: newExchangeRate => {
      if(!newExchangeRate.conversion_rates){
        showAlert({message: 'O objeto precisa ter uma propriedade conversion_rates'})
      }
      exchangeRate = newExchangeRate
      return exchangeRate
    }
  }
})()

const getUrl = currency =>`https://v6.exchangerate-api.com/v6/7f58ddd67b16547698958a23/latest/${currency}`

const getErrormessage = errorType =>({
  'unsupported-code': 'A modeda não existe em nosso banco de dados.',
  'base-code-only-on-pro': 'Informações de moedas que não sejam USD ou EUR só podem ser acessadas a pa',
  'malformed-request': 'O endpoint do seu request precisa seguir a estrutura à seguir: https://v6.exchangerate-api.com/v6/7f58ddd67b16547698958a23/latest/USD.',
  'invalid-key': 'A chave da API não é válida.',
  'quota-reached': 'Sua conta alcançou o limite de requests permitido em seu plano atual.',
  'not-available-on-plan':'Seu plano atual não permite este tipo de request.'
})[errorType] || 'Não foi possivel obter as informações'

const fechExchangeRate = async url =>{
  try{
    const response = await fetch(url)
    
    if(!response.ok){
      throw new Error('Sua conexão falhou. não foi possivel obter as informações')
    }
    
    const exchangeRateData = await response.json()

    if (exchangeRateData.result === 'error'){
      const errorMenssage = getErrormessage(exchangeRateData ['error-type'])
      throw new Error (errorMenssage)
    }

    return state.setExchangeRate(exchangeRateData)
  } catch (err){
    showAlert(err)
  }
}

const getOptions = (selectedCurrency, conversion_rates) => {
  const setSelectAttribute = currency =>
    currency === selectedCurrency ? 'selected' : ''
  return Object.keys(conversion_rates)
    .map(currency => `<option ${setSelectAttribute(currency)}>${currency}</option>`)
    .join('')
  }

    const getMultipliedExchangeRate = conversion_rates =>{
      const currencyTwo = conversion_rates[currencyTwoEl.value]
      return (timesCurrencyOneEl.value * currencyTwo).toFixed(2)
    }
    
    const getNotRoundedExchangeRate = conversion_rates => {
      const currencyTwo = conversion_rates[currencyTwoEl.value]
      return `1 ${currencyOneEl.value} = ${1 * currencyTwo} ${currencyTwoEl.value}`
    }
    
    const showUpdateRates = ({conversion_rates })=>{
      convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
      valuePrecisionEl.textContent = getNotRoundedExchangeRate(conversion_rates)
    }
    

const showInitialInfo = ({conversion_rates}) =>{
    currencyOneEl.innerHTML = getOptions('USD', conversion_rates)
    currencyTwoEl.innerHTML = getOptions('BRL', conversion_rates)

   showUpdateRates({ conversion_rates })
}

const init = async () =>{
  const url = getUrl('USD')
  const exchangeRate = await fechExchangeRate(url)

  if(exchangeRate && exchangeRate.conversion_rates){
    showInitialInfo(exchangeRate)
  }
}

timesCurrencyOneEl.addEventListener('input', () =>{
  const {conversion_rates} = state.getExchangeRate()
  convertedValueEl.textContent = getMultipliedExchangeRate(conversion_rates)
})

currencyTwoEl.addEventListener('input', () =>{
  const exchangeRate = state.getExchangeRate()
  showUpdateRates(exchangeRate)
})

currencyOneEl.addEventListener('input', async e =>{
  const url = getUrl(e.target.value)
  const exchangeRate = await fechExchangeRate(url)

  showUpdateRates(exchangeRate)
  })


init()

