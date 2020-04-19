import React from 'react';
import ReactDOM from 'react-dom';

import { RandomCatComponent } from './components/randomCat';

export function render() {
  ReactDOM.render(
    React.createElement(RandomCatComponent),
    document.getElementById('root')
  );
}

render();
