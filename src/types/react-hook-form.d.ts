// Type declarations for react-hook-form to resolve rollup bundling declaration quirk
declare module "react-hook-form" {
  export function useForm<TFieldValues extends Record<string, any> = Record<string, any>, TContext = any, TTransformedValues = TFieldValues>(
    props?: any,
  ): {
    register: (name: any, options?: any) => any;
    handleSubmit: (onValid: (data: any) => any, onInvalid?: any) => (e?: any) => Promise<any>;
    reset: (values?: any) => void;
    setValue: (name: any, value: any, options?: any) => void;
    getValues: (name?: any) => any;
    watch: (name?: any) => any;
    control: any;
    formState: {
      errors: Record<string, any>;
      isSubmitting: boolean;
      isValid: boolean;
      isDirty: boolean;
    };
  };
  export const Controller: any;
  export const FormProvider: any;
  export const useFormContext: any;
  export const useWatch: any;
  export const useFieldArray: any;
  export type FieldValues = Record<string, any>;
  export type UseFormReturn<T = any> = any;
  export type UseFormProps<T = any> = any;
  export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;
  export type FieldErrors<T = any> = Record<string, any>;
}
