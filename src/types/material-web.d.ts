import type { DetailedHTMLProps, HTMLAttributes } from "react";

// TypeScript belum mengenal tag <md-...>, jadi di sini kita daftarkan
// tag apa saja yang ada beserta atribut yang boleh dipakai.
type MdElementProps<P> = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & P;

type MdButtonProps = MdElementProps<{
  disabled?: boolean;
  href?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
  "has-icon"?: boolean;
  "trailing-icon"?: boolean;
}>;

type MdTextFieldProps = MdElementProps<{
  label?: string;
  value?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  max?: string;
  autocomplete?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  "error-text"?: string;
  "supporting-text"?: string;
}>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-filled-button": MdButtonProps;
      "md-filled-tonal-button": MdButtonProps;
      "md-outlined-button": MdButtonProps;
      "md-text-button": MdButtonProps;
      "md-outlined-text-field": MdTextFieldProps;
    }
  }
}
