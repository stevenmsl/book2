import { useTypedSelector } from "./use-typed-selector";

export const useCumulativeCode = (cellId: string) => {
  return useTypedSelector((state) => {
    const { data, order } = state.cells;
    /* 
        - retrieve the cells per the order defined
            in the order array
    */
    const orderedCells = order.map((id) => data[id]);

    /*
        - provide a show function to all code cells so
        they can display values in the Preview component
        easily
        - import the react and react-dom but under different names
        (_React and _ReactDOM) to avoid name colissions with users' 
        code if the code also imports react and react-dom
        - need some tweekings in ESBuild. Check the ESBuild bundle function.
        - redefine show function for previous cells that does nothing 
        to suppress the output from previous cells being carried over  
    */

    const showFunc = `
          import _React from 'react';
          import _ReactDOM from 'react-dom';
          const root = document.querySelector('#root');
          var show = (value) => {
            if (typeof value === 'object') {
              if (value.$$typeof && value.props) {
                _ReactDOM.render(value, root);
              } else {
                root.innerHTML = JSON.stringify(value);
              }
                          
            } else {
              root.innerHTML = value;     
            }           
          };
        `;

    const showFuncNoop = "var show = () => {}";

    const cumulativeCode = [];
    for (let c of orderedCells) {
      if (c.type === "code") {
        if (c.id === cellId) {
          cumulativeCode.push(showFunc);
        } else {
          cumulativeCode.push(showFuncNoop);
        }
        cumulativeCode.push(c.content);
      }
      // don't look past the current cell
      if (c.id === cellId) {
        break;
      }
    }
    return cumulativeCode;
  }).join("\n");
};
