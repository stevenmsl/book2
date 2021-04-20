import "./code-editor.css";
import { useRef } from "react";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import MonacoEditor, { OnChange, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor/esm/vs/editor/editor.api";
import prettier from "prettier";
import parser from "prettier/parser-babel";
/* 
  - no type definition file for this package
  - check types.d.ts for the workaround
*/
import MonacoJSXHighlighter from "monaco-jsx-highlighter";
/*
  - per the MonacoJSXHighlighter doc you need to import the
    css file after you import the MonacoJSXHighlighter  
*/
import "./syntax.css";

interface CodeEditorProps {
  initialValue: string;
  onChange(value: string): void;
}

/*
  - MonacoEditor is a thin wrapper 
    around the actual Monaco editor
  - set the language property to provide
    auto completion and linting
  - set the showUnused property to false 
    so it won't report errors on imports 
    that have not been referenced in the 
    code yet
  - set the folding property to false to 
    decrease the space after the line numbers
  - set the lineNumbersMinChars property to 
    decrease the space before the line numbers
  - set the value property to provide initial
    value to the editor    
*/

const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue,
  onChange,
  children,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();
  /*
    - get the value of the editor and then emit it
  */
  const handleEditorChange: OnChange = (value, event) => {
    //console.log("about to emit the value:", value);
    if (!value) value = "";
    onChange(value);
  };

  /*
    - set a reference to the editor so later we can
      set the value (formatted code) back to it 
  */
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    const babelParse = (code: string) =>
      parse(code, { sourceType: "module", plugins: ["jsx"] });

    const highlighter = new MonacoJSXHighlighter(
      // @ts-ignore
      window.monaco, // the editor lib not the instance you created
      babelParse,
      traverse,
      editorRef.current
    );

    highlighter.highLightOnDidChangeModelContent(100);
    // to supress the excessive parsing errors logged in the console
    highlighter.highlightCode(
      undefined,
      () => {},
      undefined,
      () => {}
    );
  };

  const onFormatClick = () => {
    if (!editorRef.current) return;

    // get the current value from the editor
    const unformatted = editorRef.current.getModel()?.getValue();

    if (!unformatted) return;

    // format the value
    const formatted = prettier
      .format(unformatted, {
        parser: "babel",
        plugins: [parser],
        useTabs: false,
        semi: true,
        singleQuote: true,
      })
      .replace(/\n$/, ""); //remove the extra line at the end added by prettier

    editorRef.current.setValue(formatted);
  };

  return (
    <div className="editor-wrapper">
      <button
        className="button button-format is-primary is-small"
        onClick={onFormatClick}
      >
        Format
      </button>
      <MonacoEditor
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        value={initialValue}
        theme="vs-dark"
        language="javascript"
        options={{
          wordWrap: "on",
          minimap: { enabled: false },
          showUnused: false,
          folding: false,
          lineNumbersMinChars: 3,
          fontSize: 16,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
