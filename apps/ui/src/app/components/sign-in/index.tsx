import React from 'react';
import styles from './sign-in.module.scss';
import { useForm, Controller } from 'react-hook-form';
import TextInput from '../form/text-input';
import Button from '../form/button';
import { Message } from 'primereact/message';

export type Credentials = {
  username: string;
  password: string;
};

export interface SignInProps {
  onSubmit: (credentials: Credentials) => void;
  error?: string;
}

export const SignIn: React.FC<SignInProps> = ({ error, onSubmit }) => {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<Credentials>({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  return (
    <>
      <div className="text-center mb-5">
        <div className="text-900 text-3xl font-medium mb-3">
          Welcome to DELS!
        </div>
        <span className="text-600 font-medium">Sign in to continue</span>
      </div>

      <div className="w-full md:w-10 mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="p-fluid">
          {error && <Message severity="error" text={error} />}
          <Controller
            name="username"
            control={control}
            rules={{
              required: 'Username is required.',
            }}
            render={({ field }) => (
              <TextInput
                {...field}
                label="Username"
                labelClassname="block text-900 text-xl font-medium mb-2"
                placeholder="Username"
                error={errors.username?.message}
                className="w-full p-3"
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            rules={{
              required: 'Password is required.',
            }}
            render={({ field }) => (
              <TextInput
                {...field}
                placeholder="Password"
                type="password"
                id="password1"
                error={errors.password?.message}
                className="w-full"
                label="Password"
                labelClassname="block text-900 font-medium text-xl mb-2"
              />
            )}
          />
          <Button
            label="Login"
            type="submit"
            loading={isSubmitting}
            className="w-full p-3 text-xl"
          />
        </form>
      </div>
    </>
  );
};
