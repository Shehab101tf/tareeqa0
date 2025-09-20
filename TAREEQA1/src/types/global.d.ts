// Global Type Declarations for Tareeqa POS - Electron 21.x Compatible

declare module 'react' {
  import * as React from 'react';
  export = React;
  export as namespace React;
  
  namespace React {
    interface FC<P = {}> {
      (props: P & { children?: ReactNode }): ReactElement | null;
      propTypes?: WeakValidationMap<P>;
      contextTypes?: ValidationMap<any>;
      defaultProps?: Partial<P>;
      displayName?: string;
    }
    
    type ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> = {
      type: T;
      props: P;
      key: Key | null;
    };
    
    type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;
    type ReactChild = ReactElement | ReactText;
    type ReactText = string | number;
    type ReactFragment = {} | ReactNodeArray;
    type ReactNodeArray = Array<ReactNode>;
    type ReactPortal = any;
    type Key = string | number;
    type JSXElementConstructor<P> = ((props: P) => ReactElement | null) | (new (props: P) => Component<P, any>);
    type WeakValidationMap<T> = { [K in keyof T]?: null extends T[K] ? Validator<T[K] | null | undefined> : undefined extends T[K] ? Validator<T[K] | null | undefined> : Validator<T[K]> };
    type ValidationMap<T> = { [K in keyof T]: Validator<T[K]> };
    type Validator<T> = (props: any, propName: string, componentName: string, location: any, propFullName: string) => Error | null;
    
    class Component<P = {}, S = {}> {
      props: Readonly<P> & Readonly<{ children?: ReactNode }>;
      state: Readonly<S>;
      constructor(props: P);
      render(): ReactNode;
    }
    
    // React Core Functions
    function createElement<P extends {}>(
      type: string | ComponentType<P>,
      props?: (P & { children?: ReactNode }) | null,
      ...children: ReactNode[]
    ): ReactElement<P>;
    
    function cloneElement<P extends {}>(
      element: ReactElement<P>,
      props?: Partial<P> & { children?: ReactNode },
      ...children: ReactNode[]
    ): ReactElement<P>;
    
    function isValidElement(object: {} | null | undefined): object is ReactElement;
    
    const Children: {
      map<T, C>(children: C | ReadonlyArray<C>, fn: (child: C, index: number) => T): C extends null | undefined ? C : Array<Exclude<T, boolean | null | undefined>>;
      forEach<C>(children: C | ReadonlyArray<C>, fn: (child: C, index: number) => void): void;
      count(children: any): number;
      only<C>(children: C): C extends any[] ? never : C;
      toArray(children: ReactNode | ReactNode[]): Array<Exclude<ReactNode, boolean | null | undefined>>;
    };
    
    const Fragment: ComponentType<{ children?: ReactNode }>;
    const StrictMode: ComponentType<{ children?: ReactNode }>;
    
    // React Hooks
    function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    function useContext<T>(context: Context<T>): T;
    function useReducer<R extends Reducer<any, any>>(reducer: R, initialState: ReducerState<R>): [ReducerState<R>, Dispatch<ReducerAction<R>>];
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
    function useMemo<T>(factory: () => T, deps: any[]): T;
    function useRef<T>(initialValue: T): MutableRefObject<T>;
    function useImperativeHandle<T, R extends T>(ref: Ref<T> | undefined, init: () => R, deps?: any[]): void;
    function useLayoutEffect(effect: () => void | (() => void), deps?: any[]): void;
    function useDebugValue<T>(value: T, format?: (value: T) => any): void;
    
    type Dispatch<A> = (value: A) => void;
    type Reducer<S, A> = (prevState: S, action: A) => S;
    type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
    type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
    type MutableRefObject<T> = { current: T };
    type Ref<T> = MutableRefObject<T> | ((instance: T | null) => void) | null;
    type Context<T> = { Provider: ComponentType<{ value: T; children?: ReactNode }>; Consumer: ComponentType<{ children: (value: T) => ReactNode }> };
    type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;
    type ComponentClass<P = {}> = new (props: P) => Component<P, any>;
    type FunctionComponent<P = {}> = (props: P) => ReactElement | null;
    
    // HTML Attributes
    interface HTMLAttributes<T> {
      className?: string;
      id?: string;
      style?: CSSProperties;
      onClick?: (event: MouseEvent) => void;
      onMouseOver?: (event: MouseEvent) => void;
      onMouseOut?: (event: MouseEvent) => void;
      children?: ReactNode;
      [key: string]: any;
    }
    
    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
      disabled?: boolean;
      type?: 'button' | 'submit' | 'reset';
    }
    
    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
      type?: string;
      value?: string | number;
      placeholder?: string;
      onChange?: (event: any) => void;
      readOnly?: boolean;
    }
    
    interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
      value?: string;
      placeholder?: string;
      onChange?: (event: any) => void;
      rows?: number;
      cols?: number;
    }
    
    interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
      value?: string | number;
      onChange?: (event: any) => void;
      multiple?: boolean;
    }
    
    interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
      value?: string | number;
      selected?: boolean;
    }
    
    interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
      htmlFor?: string;
    }
    
    interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
      onSubmit?: (event: any) => void;
    }
    
    interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
      src?: string;
      alt?: string;
      width?: number | string;
      height?: number | string;
    }
    
    interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
      href?: string;
      target?: string;
      rel?: string;
    }
    
    interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
      value?: string | number;
    }
    
    interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
      cellPadding?: number | string;
      cellSpacing?: number | string;
    }
    
    interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
      colSpan?: number;
      rowSpan?: number;
    }
    
    interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
      colSpan?: number;
      rowSpan?: number;
      scope?: string;
    }
    
    interface CSSProperties {
      [key: string]: any;
    }
    
    interface DetailedHTMLProps<E extends HTMLAttributes<T>, T> extends E {
      ref?: Ref<T>;
    }
  }
}

declare module 'react-dom' {
  import * as ReactDOM from 'react-dom';
  export = ReactDOM;
  export as namespace ReactDOM;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'framer-motion' {
  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    whileHover?: any;
    whileTap?: any;
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: any;
  }

  export interface HTMLMotionProps<T> extends MotionProps {
    [key: string]: any;
  }

  export const motion: {
    div: React.ComponentType<HTMLMotionProps<'div'>>;
    button: React.ComponentType<HTMLMotionProps<'button'>>;
    span: React.ComponentType<HTMLMotionProps<'span'>>;
    tr: React.ComponentType<HTMLMotionProps<'tr'>>;
    [key: string]: React.ComponentType<any>;
  };

  export const AnimatePresence: React.ComponentType<{
    children?: React.ReactNode;
    mode?: string;
  }>;
}

declare module 'react-i18next' {
  export function useTranslation(ns?: string): {
    t: (key: string, options?: any) => string;
    i18n: {
      language: string;
      changeLanguage: (lng: string) => Promise<void>;
      addResourceBundle: (lng: string, ns: string, resources: any) => void;
      getResourceBundle: (lng: string, ns: string) => any;
    };
    ready: boolean;
  };

  export const I18nextProvider: React.ComponentType<{
    i18n: any;
    children: React.ReactNode;
  }>;
  
  export function initReactI18next(i18n: any): any;
}

declare module 'lucide-react' {
  export const Plus: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Minus: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Search: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Filter: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Edit: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Trash2: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Package: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const AlertTriangle: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const CheckCircle: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const XCircle: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Calculator: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Info: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Printer: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Download: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Eye: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const ShoppingCart: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Users: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const BarChart3: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Settings: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Menu: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const X: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const CreditCard: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Banknote: React.ComponentType<{ className?: string; [key: string]: any }>;
  export const Receipt: React.ComponentType<{ className?: string; [key: string]: any }>;
}

declare module 'react-hot-toast' {
  interface Toast {
    success: (message: string, options?: any) => string;
    error: (message: string, options?: any) => string;
    loading: (message: string, options?: any) => string;
    dismiss: (toastId?: string) => void;
    remove: (toastId?: string) => void;
    promise: <T>(promise: Promise<T>, msgs: { loading: string; success: string; error: string }) => Promise<T>;
  }
  
  const toast: Toast;
  export default toast;
  
  export const Toaster: React.ComponentType<{
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    toastOptions?: any;
    reverseOrder?: boolean;
    gutter?: number;
    containerClassName?: string;
    containerStyle?: React.CSSProperties;
  }>;
}

declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | ClassArray | ClassDictionary;
  export interface ClassDictionary {
    [id: string]: any;
  }
  export interface ClassArray extends Array<ClassValue> {}
  export function clsx(...inputs: ClassValue[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: string[]): string;
}

// Global Window Extensions
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      version: string;
      database: {
        findByBarcode: (barcode: string) => Promise<any>;
        searchProducts: (term: string) => Promise<any[]>;
        createTransaction: (transaction: any) => Promise<any>;
      };
      hardware: {
        simulateBarcodeScan: (barcode: string) => void;
        scanner: {
          connect: () => Promise<boolean>;
          scan: () => Promise<any>;
        };
        printer: {
          connect: () => Promise<boolean>;
          print: (data: any) => Promise<boolean>;
        };
      };
    };
  }

  // Jest globals for testing
  var jest: typeof import('jest') | undefined;
  var expect: typeof import('@jest/globals').expect | undefined;
  var describe: typeof import('@jest/globals').describe | undefined;
  var it: typeof import('@jest/globals').it | undefined;
  var test: typeof import('@jest/globals').test | undefined;
  var beforeAll: typeof import('@jest/globals').beforeAll | undefined;
  var beforeEach: typeof import('@jest/globals').beforeEach | undefined;
  var afterAll: typeof import('@jest/globals').afterAll | undefined;
  var afterEach: typeof import('@jest/globals').afterEach | undefined;
}

// JSX Namespace
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
    
    // HTML Elements
    div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
    h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h5: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    h6: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
    p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    
    // Form Elements
    button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
    select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
    option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
    form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
    label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
    fieldset: React.DetailedHTMLProps<React.HTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
    legend: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
    
    // Media Elements
    img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
    video: React.DetailedHTMLProps<React.HTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
    audio: React.DetailedHTMLProps<React.HTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
    source: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
    
    // Link Elements
    a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
    link: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
    
    // List Elements
    ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
    ol: React.DetailedHTMLProps<React.HTMLAttributes<HTMLOListElement>, HTMLOListElement>;
    li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    dl: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
    dt: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    dd: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    
    // Semantic Elements
    nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    article: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    aside: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    
    // Table Elements
    table: React.DetailedHTMLProps<React.TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
    thead: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tbody: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tfoot: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
    tr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
    td: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
    th: React.DetailedHTMLProps<React.ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
    caption: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    colgroup: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    col: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
    
    // Other Common Elements
    br: React.DetailedHTMLProps<React.HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
    hr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
    pre: React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
    code: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    strong: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    em: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    small: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    mark: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    del: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    ins: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    sub: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    sup: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    blockquote: React.DetailedHTMLProps<React.HTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
    q: React.DetailedHTMLProps<React.HTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
    cite: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    abbr: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    address: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    time: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTimeElement>, HTMLTimeElement>;
  }
  
  interface Element extends React.ReactElement<any, any> {}
  
  interface ElementClass extends React.Component<any> {
    render(): React.ReactNode;
  }
  
  interface ElementAttributesProperty {
    props: {};
  }
  
  interface ElementChildrenAttribute {
    children: {};
  }
}

export {};
