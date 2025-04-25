import React from 'react';
import {
  ButtonProps as PrimeButtonProps,
  Button as PrimeButton,
} from 'primereact/button';

export interface ButtonProps extends PrimeButtonProps {}

const Button: React.FC<ButtonProps> = ({ ...props }) => {
  return <PrimeButton {...props} />;
};

export default Button;
