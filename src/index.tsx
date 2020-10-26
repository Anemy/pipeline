import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';

// Since we are using HtmlWebpackPlugin WITHOUT a template,
// we should create our own root node in the body element before rendering into it.
const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
