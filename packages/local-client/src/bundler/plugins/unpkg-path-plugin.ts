import * as esbuild from "esbuild-wasm";

/*
  purpose of this plugin
  - by default esbuild will access the local file system to
    locate and load up files, which will not work in
    a browser environment
  - you can provide multiple implementations of the onResolve 
    and the onLoad methods for the build process to execute 
    so you can change the default behavior and run your
    custom logic instead 
*/

export const unpkgPathPlugin = () => {
  return {
    name: "unpkg-path-plugin", // this is more for debugging purpose
    // build: represents the bundling process
    setup(build: esbuild.PluginBuild) {
      /* 
        onResolve
        - figure out where the index.js is stored
        - figure out where the files are
          for import/require/export statements
        - use filter to set up what type of files
          you want to process
        - you can define multiple onResolve methods 
      */

      /*
        - deal with index.js - root entry file
      */
      build.onResolve({ filter: /(^index\.js$)/ }, () => {
        return { path: "index.js", namespace: "a" };
      });

      /*
        - deal with ./ and ../ - relative paths in a  module
      */
      build.onResolve({ filter: /^\.+\// }, (args: any) => {
        return {
          namespace: "a",
          /*
          resolving relative path
          - use URL to construct relative path 

          dealing with nested imports correctly
          - check nested-imports.txt for the background info
        */
          path: new URL(
            args.path,
            // it's important to add a trailing slash to the base
            "https://unpkg.com" + args.resolveDir + "/"
          ).href,
        };
      });

      /*
        - handle user's code from the UI
      */
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: "a",
          path: `https://unpkg.com/${args.path}`,
        };
      });
    },
  };
};
