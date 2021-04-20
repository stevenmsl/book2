import * as esbuild from "esbuild-wasm";
import { unpkgPathPlugin } from "./plugins/unpkg-path-plugin";
import { fetchPlugin } from "./plugins/fetch-plugin";

let serviceReady = false;

const bundle = async (rawCode: string) => {
  if (!serviceReady) {
    /*
     - copy the esbuild.wasm from the node_modules
       to the public folder, or download it from
       the unpkg.com
     - use useRef to check if the esbuild 
       is ready later
  */
    await esbuild.initialize({
      worker: true,
      /*
      - you must specify a particular version to download or 
        you might encouter the binary veriosn (the wasm downloaded) 
        is not matching the host version error (the npm package installed).
    */
      wasmURL: "https://unpkg.com/esbuild-wasm@0.9.3/esbuild.wasm",
      //wasmURL: "/esbuild.wasm", // look at the public folder
    });
    serviceReady = true;
  }
  try {
    const result = await esbuild.build({
      entryPoints: ["index.js"],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(rawCode)],
      /*
        - deal with the warnnings when the packages
          you are downloading need to access nodejs
          environment variables
      */
      define: {
        "process.env.NODE_ENV": '"production"',
        global: "window",
      },
      /*
        - avoid name collisions
        - check the comments in the code-cell.tsx
      */
      jsxFactory: "_React.createElement",
      jsxFragment: "_React.Fragment",
    });

    return { code: result.outputFiles[0].text, err: "" };
  } catch (err) {
    return {
      code: "",
      err: err.message,
    };
  }
};

export default bundle;
