import * as esbuild from "esbuild-wasm";
import axios from "axios";
import localforage from "localforage";

const fileCache = localforage.createInstance({
  name: "filecache",
});

export const fetchPlugin = (inputCode: string) => {
  return {
    name: "fetch-plugin",
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: "jsx",
          contents: inputCode,
        };
      });

      /*
        - you can have multiple implementations of onLoad methods
          that have the same filter 
        - if the implementation executed returns null then build
          process will just continue  
        - if it does return something build process will stop looking
          futher.
      */
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const cachedResult = await fileCache.getItem<esbuild.OnLoadResult>(
          args.path
        );

        if (cachedResult) {
          return cachedResult;
        }
        return null;
      });

      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        /*
              - esbuild needs to access the file system to spit out
                the css files. 
              - We don't have access to file system in a browser.
                So we need to replace css files with javascript files.          
            */

        /*
              g modifier
              - find all matches
            */
        const escaped = data
          .replace(/\n/g, "") // remove new lines
          .replace(/"/g, '\\"') // escape double quotes
          .replace(/'/g, "\\'"); // escape single quotes

        const contents = `
              const style = document.createElement('style');
              style.innerText = '${escaped}';
              document.head.appendChild(style);
            `;

        /*
           - type the result so TS won't complain
        */
        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents,
          /*
                 - use request.responseURL to get the actual URL 
                   from where the file is downloaded
                 - use URL object to strip off the file name from the path
                 - seems ESBuild is stripping off the trailing slash,
                   you need to add it back in in the onResolve method
                   to be able to find the right location file 
                 - the resolveDir will be served as the base to correctly 
                   resolve the file in the OnResolve method   
              */
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, result);
        return result;
      });

      /*
        onLoad
        - load up the file (using axios) 
      */
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path);

        /*
          - esbuild needs to access the file system to spit out
            the css files. 
          - We don't have access to file system in a browser.
            So we need to replace css files with javascript files.          
        */

        /*
          - type the result so TS won't complain
        */
        const result: esbuild.OnLoadResult = {
          loader: "jsx",
          contents: data,
          /*
             - use request.responseURL to get the actual URL 
               from where the file is downloaded
             - use URL object to strip off the file name from the path
             - seems ESBuild is stripping off the trailing slash,
               you need to add it back in in the onResolve method
               to be able to find the right location file 
             - the resolveDir will be served as the base to correctly 
               resolve the file in the OnResolve method   
          */
          resolveDir: new URL("./", request.responseURL).pathname,
        };

        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
