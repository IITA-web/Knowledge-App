import { screenWidth } from "./Dimension";

export const styledHtml = (datasource: any) => `
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
* {
  box-sizing: border-box;
  max-width: ${screenWidth}px;
  max: ${screenWidth}px;
}

body {
  font-family: sans-serif;
  padding: 16px;
  margin: 0;
  max-width: ${screenWidth}px;
  width: ${screenWidth}px;
  overflow-x: hidden;
}

img {
  display: block;
  height: auto;
  max-width: ${screenWidth - 40}px;
  margin-left: -40px;
}
figcaption {
  max-width: ${screenWidth - 40}px;
  width: ${screenWidth - 40}px;
  margin-top: 10px;
  font-style: italic;
  margin-left: -40px;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}
</style>

  </head>
  <body>${datasource}</body>
</html>
`;
