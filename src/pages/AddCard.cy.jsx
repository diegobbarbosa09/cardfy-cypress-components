import React from 'react'
import AddCard from './AddCard'

Cypress.Commands.add('alertErrorHaveText', (expectedText) => {
  cy.contains('.alert-error', expectedText).should('be.visible');
});

Cypress.Commands.add('fillCardForm', (card) => {
  cy.get('[data-cy="number"]').type(card.number);
  cy.get('[data-cy="holderName"]').type(card.holderName);
  cy.get('[data-cy="expirationDate"]').type(card.expirationDate);
  cy.get('[data-cy="cvv"]').type(card.cvv);
  cy.get(`[data-cy=bank-${card.bank}]`).click();
})

describe('<AddCard />', () => {

  const myCard = {
    number: '4242424242424242',
    holderName: 'Antonio Gonçalves',
    expirationDate: '12/35',
    cvv: '123',
    bank: 'c6bank'
  }

  beforeEach(() => {
    cy.viewport(1440, 900)
    cy.mount(<AddCard />)
  })

  it('deve validar mensagens de erro', () => {

    cy.contains('button', 'Adicionar Cartão').click();

    const alerts = [
      'Número do cartão é obrigatório',
      'Nome do titular é obrigatório',
      'Data de expiração é obrigatória',
      'CVV é obrigatório',
      'Selecione um banco'
    ]

    alerts.forEach((alert) => {
      cy.alertErrorHaveText(alert);
    });
  });

  it('deve cadastrar um cartão', () => {


    cy.fillCardForm({ ...myCard });

    cy.intercept('POST', 'http://wallet.cardfify.dev/api/cards', (req) => {
      req.reply({
        statusCode: 201,
        body: myCard
      })
    }).as('addCard');

    cy.get('[data-cy="saveCard"]').click();

    cy.wait('@addCard')

    cy.get('.notice-success').should('be.visible').and('have.text', 'Cartão cadastrado com sucesso!');
  })

  it('deve validar nome do cartão com menos de 2 caracteres', () => {

    cy.fillCardForm({ ...myCard, holderName: 'A', bank: 'neon' });
    cy.get('[data-cy="saveCard"]').click();

    cy.alertErrorHaveText('Nome deve ter pelo menos 2 caracteres');
  })

  it('deve validar nome do cartão com menos de 2 caracteres', () => {

    cy.fillCardForm({ ...myCard, expirationDate: '13/35', bank: 'nubank' });
    cy.get('[data-cy="saveCard"]').click();

    cy.alertErrorHaveText('Data de expiração inválida ou vencida');
  })

  it('deve validar cvv com menos de 3 digitos', () => {

    cy.fillCardForm({ ...myCard, cvv: '1', bank: 'inter' });
    cy.get('[data-cy="saveCard"]').click();

    cy.alertErrorHaveText('CVV deve ter 3 ou 4 dígitos');
  })
})  