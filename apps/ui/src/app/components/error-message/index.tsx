import { SerializedError } from '@reduxjs/toolkit';
import { Message, MessageProps } from 'primereact/message';
import React from 'react';
import { ErrorResponse, ValidationErrorResponse } from '@dels/common';
import { isServerErrorResponse } from '../../redux/apis/del.api';

interface ErrorMessageProps extends MessageProps {
  error?: ErrorResponse | ValidationErrorResponse | SerializedError;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, ...props }) => {
  if (!error) return null;

  const messages = (error as SerializedError).message
    ? [(error as SerializedError).message!]
    : isServerErrorResponse(error)
    ? [error.message]
    : (error as ValidationErrorResponse).message;

  if (!messages.length) return null;

  return (
    <>
      {messages.map((message) => (
        <Message {...props} key={message} severity="error" text={message} />
      ))}
    </>
  );
};

export default ErrorMessage;
