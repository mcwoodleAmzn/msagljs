"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[671],{5318:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>g});var n=r(7378);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function a(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?a(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):a(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},a=Object.keys(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var p=n.createContext({}),s=function(e){var t=n.useContext(p),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=s(e.components);return n.createElement(p.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,a=e.originalType,p=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),m=s(r),d=o,g=m["".concat(p,".").concat(d)]||m[d]||u[d]||a;return r?n.createElement(g,i(i({ref:t},c),{},{components:r})):n.createElement(g,i({ref:t},c))}));function g(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=r.length,i=new Array(a);i[0]=d;var l={};for(var p in t)hasOwnProperty.call(t,p)&&(l[p]=t[p]);l.originalType=e,l[m]="string"==typeof e?e:o,i[1]=l;for(var s=2;s<a;s++)i[s]=r[s];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},1012:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>i,default:()=>u,frontMatter:()=>a,metadata:()=>l,toc:()=>s});var n=r(7462),o=(r(7378),r(5318));const a={sidebar_position:1},i="Introduction",l={unversionedId:"intro",id:"intro",title:"Introduction",description:"MSAGL-JS is a JavaScript implementation of several graph layout algorithms together with graph viewer and editor components. In most parts it is a port of .NET layout engine MSAGL. MSAGL-JS is currently under development and it comprises the following modules:",source:"@site/docs/intro.md",sourceDirName:".",slug:"/intro",permalink:"/msagljs/docs/intro",draft:!1,tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"tutorialSidebar",next:{title:"Getting Started",permalink:"/msagljs/docs/getting-started"}},p={},s=[],c={toc:s},m="wrapper";function u(e){let{components:t,...r}=e;return(0,o.kt)(m,(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"introduction"},"Introduction"),(0,o.kt)("p",null,(0,o.kt)("a",{parentName:"p",href:"https://github.com/microsoft/msagljs"},"MSAGL-JS")," is a JavaScript implementation of several graph layout algorithms together with graph viewer and editor components. In most parts it is a port of .NET layout engine ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/microsoft/automatic-graph-layout"},"MSAGL"),". MSAGL-JS is currently under development and it comprises the following modules:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"@msagl/core"),": the core graph data structures and the layout engines"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"@msagl/drawing"),": device independent graphic support"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"@msagl/parser"),": convert common formats to MSAGL Graph instances"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"@msagl/renderer-webgl"),": a WebGL-powered rendering component"),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"@msagl/renderer-svg"),": an SVG-powered rendering component")),(0,o.kt)("p",null,"To browse a large graph please use ",(0,o.kt)("a",{parentName:"p",href:"https://microsoft.github.io/msagljs/renderer-webgl/index.html"},"Web-GL renderer example"),",\nand to browse and to edit a smaller graph use ",(0,o.kt)("a",{parentName:"p",href:"https://microsoft.github.io/msagljs/renderer-svg/index.html"},"SVG-renderer example")))}u.isMDXComponent=!0}}]);