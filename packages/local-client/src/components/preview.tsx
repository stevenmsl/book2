import "./preview.css";
import { useRef, useEffect } from "react";

interface PreviewProps {
  code: string;
  err: string;
}

const html = `
<html>
  <head>
    <style>html {background-color: white; }</style> 
  </head>
  <body>
    <div id="root"></div>
    <script>
      const handleError = (err) => {
        const root = document.querySelector('#root');
        root.innerHTML = '<div style="color:  red;" ><h4>Runtime Error</h4>' + err + '</div>';
        console.error('err:', err);
      };

      /* for async error  */
      window.addEventListener('error', (event) => {
        event.preventDefault();
        handleError(event.error);
      });

      window.addEventListener('message', (event) => {
        try {
            eval(event.data);
          } catch (err) {
            handleError(err);    
        } 
      }, false);
    </script>
  </body>
</html>
`;

/*
    About using iframe to run user's code
    - you can load the bundled script to the iframe via 
      srcDoc property to run the user code. However, the
      size of the code might be too big when users
      import a lot of packages
    - use iframe and its sandbox property to restrict the
      access from user code back to our main app for better
      security, such as preventing user code to manipulate
      the DOM objects of our main app
    - iframe will have its own context
  
  */

const Preview: React.FC<PreviewProps> = ({ code, err }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    //console.log(code);

    /*
      Reload the iframe
      - user code can delete the DOM objects
        inside the iframe which might break the
        app
      - reload the iframe before each execution
        to address these issues   
    */
    iframe.current.srcdoc = html;
    /*
      About using postMessage 
      - pass the bundled code from the main app 
        down to the iframe
      - bypass the access restriction between
        our main app and the iframe but still
        maintain the security
      - iframe needs to setup the listener properly
        to receive the bundled code from the main
        app
    */
    setTimeout(() => {
      /*
        - Delay posting the message a bit so the newly 
          loaded doc has a chance to receive the message
      */
      iframe.current.contentWindow.postMessage(code, "*");
    }, 50);
  }, [code]);

  return (
    <div className="preview-wrapper">
      <iframe
        title="preview"
        ref={iframe}
        sandbox="allow-scripts"
        srcDoc={html}
      />
      {err && <div className="preview-error">{err}</div>}
    </div>
  );
};

export default Preview;
