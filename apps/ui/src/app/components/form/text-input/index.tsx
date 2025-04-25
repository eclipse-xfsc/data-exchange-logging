import { InputText, InputTextProps } from 'primereact/inputtext';
import React from 'react';
import cx from 'classnames';

interface TextInputProps extends InputTextProps {
  left?: React.ReactElement;
  right?: React.ReactElement;
  label?: string;
  error?: string;
  help?: string;
  labelClassname?: string;
}

const TextInput = React.forwardRef<InputText, TextInputProps>(
  ({ left, label, error, help, right, labelClassname, ...inputProps }, ref) => {
    const [type, setType] = React.useState<React.HTMLInputTypeAttribute>(
      inputProps.type ?? 'text'
    );

    const rightAddon = React.useMemo(() => {
      if (!right && inputProps.type === 'password') {
        return (
          <i
            className={cx('pi', {
              'pi-eye': type === 'password',
              'pi-eye-slash': type === 'text',
            })}
            onClick={() => setType(type === 'text' ? 'password' : 'text')}
          ></i>
        );
      }
      return right;
    }, [type, inputProps.type, right]);

    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={inputProps.id} className={labelClassname}>
            {label}
          </label>
        )}
        <span
          className={cx({
            'p-input-icon-right': !!rightAddon,
            'p-input-icon-left': !!left,
          })}
        >
          {left}
          <InputText
            {...inputProps}
            className={cx(inputProps.className, { 'p-invalid': error })}
            type={type}
            ref={ref}
          />
          {rightAddon}
        </span>
        {(error || help) && (
          <small className={cx('block', { 'p-error': error })}>
            {error || help}
          </small>
        )}
      </div>
    );
  }
);

export default TextInput;
