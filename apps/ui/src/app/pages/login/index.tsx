import React from 'react';
import { useLoginMutation } from '../../redux/apis/del.api';
import { Credentials, SignIn } from '../../components/sign-in';
import { useLocation } from '../../hooks/use-location';
import styles from './login-page.module.scss';
import cx from 'classnames';
import { Helmet } from 'react-helmet-async';
import { ErrorResponse } from '@dels/common';

export const LoginPage: React.FunctionComponent = () => {
  const [login, { error }] = useLoginMutation();
  const location = useLocation();

  const onSignIn = async (credentials: Credentials) => {
    const result = await login(credentials);
    if ((result as any).data) {
      window.location.replace(location.parsed.search.redirect || '/');
    }
  };

  return (
    <>
      <Helmet>
        <title>Log In</title>
      </Helmet>
      <div
        className={cx(
          'h-full',
          'w-full',
          'm-0',
          'py-7',
          'px-4',
          styles.loginForm
        )}
      >
        <SignIn
          onSubmit={onSignIn}
          error={
            (error as ErrorResponse)?.statusCode === 401
              ? 'Invalid Username of Password'
              : error && 'An error ocurred'
          }
        />
      </div>
    </>
  );
};
