// SVG imports — handled by @svgr/webpack.
// Usage: import Icon from '@/shared/assets/section/icons/icon.svg'
declare module "*.svg" {
  import React from "react";
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
