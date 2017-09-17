import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { DatePicker } from 'antd';
// function App() {
//   return (
//     <div style={{ margin: 5 }}>
//       1
//     </div>
//   );
// }

class App extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <div style={{ margin: 100 }}>
        <h1>APP</h1>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
