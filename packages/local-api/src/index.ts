import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import { createCellsRouter } from "./routes/cells";

export const serve = (
  port: number,
  filename: string,
  dir: string,
  useProxy: boolean
) => {
  const app = express();

  /*
    - this needs to be placed before the
      redirecting logic
    - so the routes will have a chance
      to be processed 
  */
  app.use(createCellsRouter(filename, dir));

  if (useProxy) {
    /*
      - if you're in dev envrionment, redirect to the 
        Create React App dev server
    */
    app.use(
      createProxyMiddleware({
        target: "http://localhost:3000",
        ws: true, // enable web sockets
        logLevel: "silent",
      })
    );
  } else {
    /*
      - use require.resolve to get the absolute path of the
        index.html which is located in the production build
        folder for the local-client package.
      - use path.dirname to get the path only
    */
    const packagePath = require.resolve(
      "@jbook2-msl/local-client/build/index.html"
    );
    app.use(express.static(path.dirname(packagePath)));
  }

  /*
    - support await/async by returning a Promise
  */
  return new Promise<void>((resolve, reject) => {
    app.listen(port, resolve).on("error", reject);
  });
};
