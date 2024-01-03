/*
  - Construa uma aplicação de conversão de moedas. O HTML e CSS são os que você
    está vendo no browser;
  - Você poderá modificar a marcação e estilos da aplicação depois. No momento, 
    concentre-se em executar o que descreverei abaixo;
    - Quando a página for carregada: 
      - Popule os <select> com tags <option> que contém as moedas que podem ser
        convertidas. "BRL" para real brasileiro, "EUR" para euro, "USD" para 
        dollar dos Estados Unidos, etc.
      - O option selecionado por padrão no 1º <select> deve ser "USD" e o option
        no 2º <select> deve ser "BRL";
      - O parágrafo com data-js="converted-value" deve exibir o resultado da 
        conversão de 1 USD para 1 BRL;
      - Quando um novo número for inserido no input com 
        data-js="currency-one-times", o parágrafo do item acima deve atualizar 
        seu valor;
      - O parágrafo com data-js="conversion-precision" deve conter a conversão 
        apenas x1. Exemplo: 1 USD = 5.0615 BRL;
      - O conteúdo do parágrafo do item acima deve ser atualizado à cada 
        mudança nos selects;
      - O conteúdo do parágrafo data-js="converted-value" deve ser atualizado à
        cada mudança nos selects e/ou no input com data-js="currency-one-times";
      - Para que o valor contido no parágrafo do item acima não tenha mais de 
        dois dígitos após o ponto, você pode usar o método toFixed: 
        https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed
    - Para obter as moedas com os valores já convertidos, use a Exchange rate 
      API: https://www.exchangerate-api.com/;
      - Para obter a key e fazer requests, você terá que fazer login e escolher
        o plano free. Seus dados de cartão de crédito não serão solicitados.
*/

const currencyOneEl = document.querySelector('[data-js="currency-one"]')
const currencyTwoEl = document.querySelector('[data-js="currency-two"]')
const currenciesEL = document.querySelector('[data-js="currencies-container"]')
const convertedValueEl = document.querySelector('[data-js="converted-value"]')
const valuePrecisionEl = document.querySelector('[data-js="conversion-precision"]')
const timesCurrencyOneEl = document.querySelector('[data-js="currency-one-times"]')

let internalExchangeRate = {}

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
}

const init = async () =>{
  internalExchangeRate = {...(await fechExchangeRate(getUrl('USD')))}

  const getOptions = selectedCurrency => Object.keys(internalExchangeRate.conversion_rates)
    .map(currency => `<option ${currency === selectedCurrency ? 'selected' : ''}>${currency}</option>`)
    .join('')

  currencyOneEl.innerHTML = getOptions('USD')
  currencyTwoEl.innerHTML = getOptions('BRL')

  convertedValueEl.textContent = internalExchangeRate.conversion_rates.BRL.toFixed(2)
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${internalExchangeRate.conversion_rates.BRL} BRL`
}

timesCurrencyOneEl.addEventListener('input', e =>{
  convertedValueEl.textContent = e.target.value * (internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
})

currencyTwoEl.addEventListener('input', e =>{
  const currencyTwoValue = internalExchangeRate.conversion_rates[e.target.value]

  convertedValueEl.textContent = (timesCurrencyOneEl.value * currencyTwoValue).toFixed(2)
  valuePrecisionEl.textContent = `1 USD = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
})

currencyOneEl.addEventListener('input', async e =>{
  internalExchangeRate = {...(await fechExchangeRate(getUrl(e.target.value)))}
  
  convertedValueEl.textContent = (timesCurrencyOneEl.value * internalExchangeRate.conversion_rates[currencyTwoEl.value]).toFixed(2)
  valuePrecisionEl.textContent = `1 ${currencyOneEl.value} = ${1 * internalExchangeRate.conversion_rates[currencyTwoEl.value]} ${currencyTwoEl.value}`
})


init()

