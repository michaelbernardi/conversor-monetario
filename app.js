

const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEL = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

//let internalExchangeRate = {}

const showAlert = () =>{
  alert(err.message)
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
      if(!newExchangeRate.convertion_rates){
        showAlert({message: 'O objeto precisa ter uma propriedade convertion_rates'})
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
      throw new Error (getErrormessage (exchangeRateData['error-type']))
    }
    return exchangeRateData

  } catch (err){
    showAlert(err)
  }
}

const showInitialInfo = exchangeRate =>{
  const getOptions = selectedCurrency => Object.keys(exchangeRate.conversion_rates)
    .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
    .join('')

    currencyOneEl.innerHTML = getOptions('USD')
    currencyTwoEl.innerHTML = getOptions('BRL')
    convertedValueEl.textContent = exchangeRate.conversion_rates.BRL.toFixed(2)
    valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${exchangeRate.conversion_rates.BRL} BRL`
}

const init = async () =>{
  const exchangeRate = state.setExchangeRate(await fechExchangeRate(getUrl('USD')))

  if(exchangeRate && exchangeRate.conversion_rates){
    showInitialInfo(exchangeRate)
  }
}

const showUpdateRates = exchangeRate =>{
  convertedValueEl.textContent = (timesCurrencyOneEl.value * exchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * exchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
}

timesCurrencyOneEl.addEventListener('input', e =>{
  const exchangeRate = state.getExchangeRate()

  convertedValueEl.textContent = e.target.value * (exchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
})

currencyTwoEl.addEventListener('input', () =>{
  const exchangeRate = state.getExchangeRate()
  showUpdateRates(exchangeRate)
})

currencyOneEl.addEventListener('input', async e =>{
  const exchangeRate = state.setExchangeRate(fechExchangeRate(getUrl(e.target.value)))
  showUpdateRates(exchangeRate)
  })


init()

