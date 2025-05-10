declare module "*.css";

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: `s-${string}` | `ui-${string}`]: {
      [key: string]: any;
      children?: React.ReactNode;
    };
  }
}
