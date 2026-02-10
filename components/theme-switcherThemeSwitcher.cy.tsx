import React from 'react'
import {ThemeSwitcher} from './theme-switcher'

describe('<ThemeSwitcher />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ThemeSwitcher />)
  })
})