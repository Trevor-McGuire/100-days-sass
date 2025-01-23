const fs = require("fs");
const path = require("path");
const { compile } = require("sass");

// Directories
const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");
const daysDir = path.join(srcDir, "days");
const distIndexHTML = path.join(distDir, "index.html");
const srcIndexHTML = path.join(srcDir, "index.html");

const buildDist = () => {
  try {
    console.log("Starting build process...");

    // console.log("Reading files...");
    let srcSassFiles = getFiles(srcDir, ".sass");
    let daysSassFiles = getFiles(daysDir, ".sass");
    let htmlFiles = getFiles(daysDir, ".html");

    // console.log("Ordering files...");
    daysSassFiles = orderFiles(daysSassFiles);
    htmlFiles = orderFiles(htmlFiles);

    // console.log("Building properties array...");
    let propertiesArray = buildPropertiesArray(daysSassFiles);
    propertiesArray = removeDuplicatesFrom2DArray(propertiesArray);

    // console.log("Compiling sass to css files...");
    const compiledCss = compiledSassToCss([...srcSassFiles, ...daysSassFiles]);

    // console.log("Concat html files...");
    const compiledHtml = concatHtmlFiles(htmlFiles, propertiesArray);

    // console.log("Injecting code...");
    setUsedProperties(propertiesArray);
    const table = buildPropertiesTable(cssProperties);
    injectCode(compiledCss, compiledHtml, table);

    console.log("Build complete.");
  } catch (error) {
    console.error("Build failed:", error);
  }
};

function getFiles(dir, ext) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .map((file) => path.join(dir, file));
}

function compiledSassToCss(files) {
  let compiledCss = "";
  files.forEach((file) => {
    if (typeof file === "string") {
      const result = compile(file);
      compiledCss += result.css.toString();
    } else {
      throw new TypeError(`Invalid file path: ${file}`);
    }
  });
  return compiledCss;
}

function orderFiles(files) {
  return files.sort((a, b) => {
    const numA = parseInt(a.match(/day(\d+)\./)[1], 10);
    const numB = parseInt(b.match(/day(\d+)\./)[1], 10);
    return numA - numB;
  });
}

function getProperties(file) {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");
  const properties = [];
  // regex to match lines with a colon
  const regex = / *[a-z-]+:/;
  lines.forEach((line) => {
    if (regex.test(line)) {
      let property = line.split(":");
      properties.push(property[0].trim());
    }
  });
  return properties;
}

function buildPropertiesArray(files) {
  const propertiesArray = [];
  files.forEach((file) => {
    const properties = getProperties(file);
    propertiesArray.push(properties);
  });
  return propertiesArray;
}

function removeDuplicatesFrom2DArray(array) {
  const seenProperties = new Set();
  return array.map((subArray) => {
    const newSubArray = subArray.filter((property) => {
      if (seenProperties.has(property)) {
        return false;
      }
      seenProperties.add(property);
      return true;
    });
    return newSubArray;
  });
}

function concatHtmlFiles(files, properties) {
  let concatenatedHtml = "";
  files.forEach((file, index) => {
    const htmlContent = fs.readFileSync(file, "utf8");
    concatenatedHtml += `<section id="day${
      index + 1
    }">${htmlContent}<div><h2>Day #${index + 1}</h2><p>${properties[index].join(
      ", "
    )}
      </p></div></section>`;
  });
  return concatenatedHtml;
}

function injectCode(css, html, table) {
  let srcIndexHTMLContent = fs.readFileSync(srcIndexHTML, "utf8");
  srcIndexHTMLContent = srcIndexHTMLContent
    .replace('<style id="allCssGoesHere"></style>', `<style>${css}</style>`)
    .replace('<div id="allHtmlGoesHere"></div>', `${html}`)
    .replace('<div id="propertiesTable"></div>', `${table}`);
  fs.writeFileSync(distIndexHTML, srcIndexHTMLContent);
}

const cssProperties = {
  "align-content": false,
  "align-items": false,
  "align-self": false,
  all: false,
  animation: false,
  "animation-delay": false,
  "animation-direction": false,
  "animation-duration": false,
  "animation-fill-mode": false,
  "animation-iteration-count": false,
  "animation-name": false,
  "animation-play-state": false,
  "animation-timing-function": false,
  "backface-visibility": false,
  background: false,
  "background-attachment": false,
  "background-blend-mode": false,
  "background-clip": false,
  "background-color": false,
  "background-image": false,
  "background-origin": false,
  "background-position": false,
  "background-repeat": false,
  "background-size": false,
  border: false,
  "border-bottom": false,
  "border-bottom-color": false,
  "border-bottom-left-radius": false,
  "border-bottom-right-radius": false,
  "border-bottom-style": false,
  "border-bottom-width": false,
  "border-collapse": false,
  "border-color": false,
  "border-image": false,
  "border-image-outset": false,
  "border-image-repeat": false,
  "border-image-slice": false,
  "border-image-source": false,
  "border-image-width": false,
  "border-left": false,
  "border-left-color": false,
  "border-left-style": false,
  "border-left-width": false,
  "border-radius": false,
  "border-right": false,
  "border-right-color": false,
  "border-right-style": false,
  "border-right-width": false,
  "border-spacing": false,
  "border-style": false,
  "border-top": false,
  "border-top-color": false,
  "border-top-left-radius": false,
  "border-top-right-radius": false,
  "border-top-style": false,
  "border-top-width": false,
  "border-width": false,
  bottom: false,
  "box-shadow": false,
  "box-sizing": false,
  "caption-side": false,
  clear: false,
  clip: false,
  color: false,
  "column-count": false,
  "column-fill": false,
  "column-gap": false,
  "column-rule": false,
  "column-rule-color": false,
  "column-rule-style": false,
  "column-rule-width": false,
  "column-span": false,
  "column-width": false,
  columns: false,
  content: false,
  "counter-increment": false,
  "counter-reset": false,
  cursor: false,
  direction: false,
  display: false,
  "empty-cells": false,
  filter: false,
  flex: false,
  "flex-basis": false,
  "flex-direction": false,
  "flex-flow": false,
  "flex-grow": false,
  "flex-shrink": false,
  "flex-wrap": false,
  float: false,
  font: false,
  "font-family": false,
  "font-feature-settings": false,
  "font-kerning": false,
  "font-size": false,
  "font-size-adjust": false,
  "font-stretch": false,
  "font-style": false,
  "font-variant": false,
  "font-variant-caps": false,
  "font-weight": false,
  gap: false,
  grid: false,
  "grid-area": false,
  "grid-auto-columns": false,
  "grid-auto-flow": false,
  "grid-auto-rows": false,
  "grid-column": false,
  "grid-column-end": false,
  "grid-column-gap": false,
  "grid-column-start": false,
  "grid-gap": false,
  "grid-row": false,
  "grid-row-end": false,
  "grid-row-gap": false,
  "grid-row-start": false,
  "grid-template": false,
  "grid-template-areas": false,
  "grid-template-columns": false,
  "grid-template-rows": false,
  height: false,
  hyphens: false,
  isolation: false,
  "justify-content": false,
  left: false,
  "letter-spacing": false,
  "line-break": false,
  "line-height": false,
  "list-style": false,
  "list-style-image": false,
  "list-style-position": false,
  "list-style-type": false,
  margin: false,
  "margin-bottom": false,
  "margin-left": false,
  "margin-right": false,
  "margin-top": false,
  "max-height": false,
  "max-width": false,
  "min-height": false,
  "min-width": false,
  "object-fit": false,
  "object-position": false,
  opacity: false,
  order: false,
  outline: false,
  "outline-color": false,
  "outline-offset": false,
  "outline-style": false,
  "outline-width": false,
  overflow: false,
  "overflow-wrap": false,
  "overflow-x": false,
  "overflow-y": false,
  padding: false,
  "padding-bottom": false,
  "padding-left": false,
  "padding-right": false,
  "padding-top": false,
  "page-break-after": false,
  "page-break-before": false,
  "page-break-inside": false,
  perspective: false,
  "perspective-origin": false,
  "place-content": false,
  "place-items": false,
  "place-self": false,
  "pointer-events": false,
  position: false,
  quotes: false,
  resize: false,
  right: false,
  "row-gap": false,
  "scroll-behavior": false,
  "tab-size": false,
  "table-layout": false,
  "text-align": false,
  "text-align-last": false,
  "text-decoration": false,
  "text-decoration-color": false,
  "text-decoration-line": false,
  "text-decoration-style": false,
  "text-indent": false,
  "text-justify": false,
  "text-overflow": false,
  "text-shadow": false,
  "text-transform": false,
  top: false,
  transform: false,
  "transform-origin": false,
  transition: false,
  "transition-delay": false,
  "transition-duration": false,
  "transition-property": false,
  "transition-timing-function": false,
  "unicode-bidi": false,
  "vertical-align": false,
  visibility: false,
  "white-space": false,
  width: false,
  "word-break": false,
  "word-spacing": false,
  "z-index": false,
};

function setUsedProperties(propertiesArray) {
  propertiesArray.forEach((properties) => {
    properties.forEach((property) => {
      cssProperties[property] = true;
    });
  });
}

function buildPropertiesTable (cssProperties) {
  let table = "<table><thead><tr><th>Property</th><th>Used</th></tr></thead><tbody>";
  for (const property in cssProperties) {
    table += `<tr><td>${property}</td><td>${cssProperties[property]}</td></tr>`;
  }
  table += "</tbody></table>";
  return table;
}


buildDist();
fs.watch(srcDir, { recursive: true }, () => buildDist());
fs.watch(daysDir, { recursive: true }, () => buildDist());
